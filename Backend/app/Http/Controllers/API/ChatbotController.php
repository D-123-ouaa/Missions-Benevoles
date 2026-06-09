<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ChatbotConversation;
use App\Models\Mission;
use App\Models\Notification;
use App\Models\Registration;
use App\Mail\RegistrationConfirmedMail;
use App\Mail\UnregistrationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;

class ChatbotController extends Controller
{
     public function createConversation(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }
        
        $name = $request->input('name', 'Nouvelle conversation');
        $messages = $request->input('messages', [
            ['role' => 'bot', 'content' => 'Bonjour ! 👋 Je suis votre assistant. Tapez **aide** pour voir les commandes disponibles.']
        ]);
        
        $conversation = ChatbotConversation::create([
            'user_id' => $user->id,
            'messages' => $messages,
            'name' => $name
        ]);
        
        return response()->json([
            'id' => $conversation->id,
            'name' => $conversation->name,
            'messages' => $conversation->messages
        ], 201);
    }

    public function message(Request $request)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json(['response' => 'Veuillez vous connecter.'], 401);
            }

            $request->validate([
                'message' => 'required|string|max:500',
                'conversation_id' => 'nullable|integer',
                'conversation_name' => 'nullable|string|max:255'
            ]);
            
            $userMessage = $request->message;
            $conversationId = $request->conversation_id;
            $conversationName = $request->conversation_name;

            // 1. Commandes métier directes
            $commandResponse = $this->checkCommands($userMessage, $user);

            // 2. Si pas de commande → Gemini AI
            $response = $commandResponse ?? $this->getGeminiResponse($userMessage, $user);

            // 3. Sauvegarder dans la conversation appropriée
            $conversation = null;
            if ($conversationId) {
                $conversation = ChatbotConversation::where('id', $conversationId)
                    ->where('user_id', $user->id)
                    ->first();
            }
            
            if (!$conversation) {
                // Créer une nouvelle conversation avec le nom fourni
                $newName = $conversationName ?? $this->generateConversationName();
                $conversation = ChatbotConversation::create([
                    'user_id' => $user->id,
                    'messages' => [],
                    'name' => $newName
                ]);
            }
            
            // Ajouter les messages
            $messages = $conversation->messages ?? [];
            $messages[] = ['role' => 'user', 'content' => $userMessage, 'timestamp' => now()->toISOString()];
            $messages[] = ['role' => 'bot',  'content' => $response,  'timestamp' => now()->toISOString()];
            $conversation->update(['messages' => $messages]);

            return response()->json([
                'response' => $response,
                'conversation_id' => $conversation->id,
                'conversation_name' => $conversation->name
            ]);

        } catch (\Exception $e) {
            Log::error('Chatbot error: ' . $e->getMessage());
            return response()->json([
                'response' => 'Désolé, une erreur est survenue. Tapez **aide** pour les commandes disponibles.'
            ], 500);
        }
    }

    private function generateConversationName(): string
    {
        $now = now();
        return 'Discussion du ' . $now->format('d/m/Y') . ' à ' . $now->format('H:i');
    }

    // ─── GEMINI AI ───────────────────────────────────────────────────────────────
    private function getGeminiResponse(string $message, $user): string
    {
        $apiKey = env('GEMINI_API_KEY');

        if (!$apiKey) {
            return "Je n'ai pas pu répondre à cette question. Tapez **aide** pour voir les commandes disponibles.";
        }

        // Contexte dynamique depuis la base de données
        $missionsActuelles = Mission::where('date', '>=', now())
            ->orderBy('date')->take(5)->get()
            ->map(fn($m) => "- {$m->title} le {$m->date->format('d/m/Y')} à {$m->location} ({$m->available_places} places dispo)")
            ->join("\n");

        $mesInscriptions = $user->missions()
            ->wherePivot('status', 'confirmed')
            ->orderBy('date')->get()
            ->map(fn($m) => "- {$m->title} le {$m->date->format('d/m/Y')}")
            ->join("\n");

        $context = "Tu es un assistant intelligent pour la plateforme Missions Bénévoles au Maroc.
Tu réponds TOUJOURS en français, avec un ton chaleureux et des emojis.
Tu es spécialisé dans le bénévolat uniquement.

INFORMATIONS SUR L'UTILISATEUR CONNECTÉ :
- Nom : {$user->name}
- Rôle : {$user->role}

MISSIONS DISPONIBLES EN CE MOMENT :
{$missionsActuelles}

INSCRIPTIONS DE {$user->name} :
" . ($mesInscriptions ?: "Aucune inscription en cours") . "

RÈGLES :
1. Réponds UNIQUEMENT aux questions sur le bénévolat, les missions, la plateforme
2. Pour s'inscrire dis : tapez 'm'inscrire à [titre]'
3. Pour voir les missions dis : tapez 'liste des missions'
4. Si question hors sujet : rappelle que tu es spécialisé bénévolat
5. Réponses courtes et claires (max 150 mots)
6. Utilise des emojis pour rendre les réponses vivantes

QUESTION DE L'UTILISATEUR : {$message}";

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->timeout(15)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}",
                [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $context]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'maxOutputTokens' => 300,
                        'temperature'     => 0.7,
                        'thinkingConfig'  => ['thinkingBudget' => 0],
                    ],
                    'safetySettings' => [
                        ['category' => 'HARM_CATEGORY_HARASSMENT',        'threshold' => 'BLOCK_NONE'],
                        ['category' => 'HARM_CATEGORY_HATE_SPEECH',       'threshold' => 'BLOCK_NONE'],
                        ['category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold' => 'BLOCK_NONE'],
                        ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_NONE'],
                    ]
                ]
            );

            if ($response->successful()) {
                $data = $response->json();
                $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
                if ($text) return trim($text);
            }

            Log::error('Gemini API error: ' . $response->body());
            return "Je rencontre une difficulté technique. Tapez **aide** pour les commandes disponibles.";

        } catch (\Exception $e) {
            Log::error('Gemini HTTP error: ' . $e->getMessage());
            return "Je rencontre une difficulté technique. Tapez **aide** pour les commandes disponibles.";
        }
    }

    // ─── COMMANDES MÉTIER ────────────────────────────────────────────────────────
    private function checkCommands($message, $user): ?string
    {
        $msg = strtolower(trim($message));

        // Salutations
        if (in_array($msg, ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou', 'hi'])) {
            return "Bonjour {$user->name} ! 👋 Je suis votre assistant bénévole intelligent.\n\n" .
                "Je peux répondre à **toutes vos questions** sur le bénévolat, et exécuter des actions :\n\n" .
                "⚡ **Commandes rapides :**\n" .
                "- `liste des missions` → voir les missions\n" .
                "- `mes inscriptions` → vos missions\n" .
                "- `m'inscrire à [titre]` → s'inscrire\n" .
                "- `me désister de [titre]` → se désister\n\n" .
                "💬 Ou posez-moi simplement une question !";
        }

        // Aide
        if (in_array($msg, ['aide', 'help', 'commandes', 'menu', '?'])) {
            return "📋 **Commandes disponibles :**\n\n" .
                "🤖 **IA** : Posez n'importe quelle question sur le bénévolat !\n\n" .
                "⚡ **Actions rapides :**\n" .
                "- `liste des missions` → missions à venir\n" .
                "- `mes inscriptions` → vos missions\n" .
                "- `m'inscrire à [titre]` → inscription\n" .
                "- `me désister de [titre]` → désistement\n" .
                "- `rechercher mission à [lieu]` → filtrer par lieu\n" .
                "- `détails de [titre]` → infos mission";
        }

        // Liste des missions
        if (str_contains($msg, 'liste des missions') || $msg === 'missions disponibles') {
            $missions = Mission::where('date', '>=', now())->orderBy('date')->take(5)->get();
            if ($missions->isEmpty()) {
                return "Aucune mission à venir pour l'instant. Revenez bientôt ! 🙏";
            }
            $list = $missions->map(fn($m) =>
                "• **{$m->title}** — {$m->date->format('d/m/Y')} à {$m->location} ({$m->available_places} places)"
            )->join("\n");
            return "📅 **Missions à venir :**\n{$list}\n\n💬 Tapez `m'inscrire à [titre]` pour vous inscrire !";
        }

        // Mes inscriptions
        if (str_contains($msg, 'mes inscriptions')) {
            $missions = $user->missions()->wherePivot('status', 'confirmed')->orderBy('date')->get();
            if ($missions->isEmpty()) {
                return "Vous n'êtes inscrit à aucune mission.\nTapez `liste des missions` pour en trouver une ! 😊";
            }
            $list = $missions->map(fn($m) => "• **{$m->title}** — {$m->date->format('d/m/Y')}")->join("\n");
            return "📌 **Vos inscriptions :**\n{$list}";
        }

        // Inscription à une mission
        if ((str_contains($msg, "m'inscrire") || str_contains($msg, "inscrire à")) &&
            !str_contains($msg, 'comment') && !str_contains($msg, 'puis-je')) {
            preg_match("/(?:m'inscrire|inscrire) (?:à|a) (.+)/i", $msg, $matches);
            $titre = $matches[1] ?? null;
            if (!$titre) {
                return "Précisez le titre : `m'inscrire à [titre de la mission]`\n\nExemple : `m'inscrire à Nettoyage plage`";
            }
            $mission = Mission::where('title', 'like', "%{$titre}%")->where('date', '>=', now())->first();
            if (!$mission) {
                return "Mission introuvable. 🔍\nTapez `liste des missions` pour voir les disponibles.";
            }
            if ($mission->available_places <= 0) {
                return "Désolé, cette mission est complète. 😔\nTapez `liste des missions` pour d'autres options.";
            }
            $exists = $user->missions()->where('mission_id', $mission->id)->wherePivot('status', 'confirmed')->exists();
            if ($exists) {
                return "Vous êtes déjà inscrit à **{$mission->title}**. ✅";
            }
            $user->missions()->attach($mission->id, ['status' => 'confirmed', 'registered_at' => now()]);
            $mission->decrement('available_places');
            Mail::to($user->email)->send(new RegistrationConfirmedMail($user, $mission));
            Notification::create([
                'user_id' => $user->id,
                'title'   => 'Inscription confirmée',
                'message' => "Votre inscription à \"{$mission->title}\" le {$mission->date->format('d/m/Y')} est confirmée.",
                'type'    => 'registration',
            ]);
            return "✅ **Inscription confirmée !**\n\n📋 **{$mission->title}**\n📅 {$mission->date->format('d/m/Y')} à {$mission->location}\n\n🎉 Merci pour votre engagement ! Un email de confirmation vous a été envoyé.";
        }

        // Désistement
        if (str_contains($msg, 'me désister') || str_contains($msg, 'desister')) {
            $clean = trim(str_replace(['me désister de', 'desister de', 'me désister', 'desister'], '', $msg));
            if (str_contains($clean, '-')) $clean = trim(explode('-', $clean)[0]);
            if (!$clean || strlen($clean) < 3) {
                return "Précisez le titre : `me désister de [titre de la mission]`\n\nTapez `mes inscriptions` pour voir vos missions.";
            }
            $mission = Mission::where('title', 'like', "%{$clean}%")->first();
            if (!$mission) {
                return "Mission introuvable. Tapez `mes inscriptions` pour voir vos missions.";
            }
            $reg = Registration::where('user_id', $user->id)
                ->where('mission_id', $mission->id)
                ->where('status', 'confirmed')->first();
            if (!$reg) {
                return "Vous n'êtes pas inscrit à **{$mission->title}**.";
            }
            $reg->update(['status' => 'cancelled']);
            $mission->increment('available_places');
            Mail::to($user->email)->send(new UnregistrationMail($user, $mission));
            Notification::create([
                'user_id' => $user->id,
                'title'   => 'Désistement enregistré',
                'message' => "Votre désistement de \"{$mission->title}\" a été enregistré.",
                'type'    => 'cancellation',
            ]);
            return "🔄 **Désistement enregistré** pour **{$mission->title}**.\n\nD'autres missions vous attendent ! Tapez `liste des missions`. 💪";
        }

        // Recherche par lieu
        if (str_contains($msg, 'rechercher') || preg_match('/missions? (?:à|a) \w+/', $msg)) {
            preg_match("/(?:rechercher|missions?) (?:à|a) (.+)/i", $msg, $matches);
            $lieu = $matches[1] ?? null;
            if (!$lieu) return "Précisez le lieu : `rechercher mission à [ville]`";
            $missions = Mission::where('location', 'like', "%{$lieu}%")->where('date', '>=', now())->get();
            if ($missions->isEmpty()) {
                return "Aucune mission trouvée à **{$lieu}**. 😔\nEssayez une autre ville !";
            }
            $list = $missions->map(fn($m) =>
                "• **{$m->title}** — {$m->date->format('d/m/Y')} ({$m->available_places} places)"
            )->join("\n");
            return "📍 **Missions à {$lieu} :**\n{$list}";
        }

        // Détails mission
        if (str_contains($msg, 'détails') || str_contains($msg, 'details')) {
            $clean = trim(str_replace(['détails de', 'details de', 'détails', 'details'], '', $msg));
            if (str_contains($clean, '-')) $clean = trim(explode('-', $clean)[0]);
            if (!$clean || strlen($clean) < 3) {
                return "Précisez le titre : `détails de [titre de la mission]`";
            }
            $mission = Mission::where('title', 'like', "%{$clean}%")->first();
            if (!$mission) return "Mission introuvable. Tapez `liste des missions`.";
            return "📋 **{$mission->title}**\n\n" .
                "📅 **Date :** {$mission->date->format('d/m/Y')}\n" .
                "📍 **Lieu :** {$mission->location}\n" .
                "👥 **Places disponibles :** {$mission->available_places}\n" .
                "📝 **Description :** " . substr($mission->description, 0, 250) .
                (strlen($mission->description) > 250 ? '...' : '');
        }

        // Au revoir
        if (str_contains($msg, 'merci') || str_contains($msg, 'au revoir') ||
            str_contains($msg, 'bye') || str_contains($msg, 'à bientôt')) {
            $responses = [
                "🌟 Merci à vous {$user->name} ! À bientôt sur Missions Bénévoles ! 👋",
                "🙏 De rien {$user->name} ! Je suis là si vous avez besoin. 💚",
                "😊 Au plaisir {$user->name} ! Bonne continuation ! 🤝",
            ];
            return $responses[array_rand($responses)];
        }

        return null; // → passe à Gemini AI
    }

    // ─── FALLBACK ────────────────────────────────────────────────────────────────
    private function processMessage(): string
    {
        return "Je n'ai pas bien compris. 🤔\nTapez **aide** pour voir les commandes disponibles !";
    }

    public function conversations()
    {
        return response()->json(
            ChatbotConversation::where('user_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->get(['id', 'name', 'messages', 'created_at'])
        );
    }

    public function destroyConversation($id)
    {
        ChatbotConversation::where('id', $id)->where('user_id', auth()->id())->delete();
        return response()->json(['message' => 'Conversation supprimée']);
    }

    public function commands()
    {
        return response()->json(['commands' => [
            'bonjour', 'aide', 'liste des missions', 'mes inscriptions',
            "m'inscrire à [mission]", 'me désister de [mission]',
            'rechercher mission à [lieu]', 'détails de [mission]'
        ]]);
    }
}