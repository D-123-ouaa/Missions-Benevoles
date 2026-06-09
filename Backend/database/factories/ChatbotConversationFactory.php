<?php
namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ChatbotConversationFactory extends Factory
{
    protected $model = \App\Models\ChatbotConversation::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'messages' => [
                ['role' => 'user', 'content' => 'Bonjour', 'timestamp' => now()->subMinutes(10)->toISOString()],
                ['role' => 'bot', 'content' => 'Bonjour ! Je suis votre assistant. Tapez aide pour voir les commandes.', 'timestamp' => now()->subMinutes(9)->toISOString()],
                ['role' => 'user', 'content' => 'Liste des missions', 'timestamp' => now()->subMinutes(8)->toISOString()],
                ['role' => 'bot', 'content' => 'Voici les missions à venir...', 'timestamp' => now()->subMinutes(7)->toISOString()],
            ],
            'context' => ['last_intent' => 'list_missions'],
        ];
    }
}