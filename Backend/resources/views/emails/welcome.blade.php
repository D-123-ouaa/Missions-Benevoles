<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; }
        .header { background: #653239; padding: 30px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; }
        .body { padding: 30px; color: #333; }
        .body h2 { color: #653239; }
        .btn { display: inline-block; background: #653239; color: #fff !important;
               padding: 12px 28px; border-radius: 6px; text-decoration: none;
               font-weight: bold; margin-top: 20px; }
        .footer { background: #f4f4f4; padding: 15px; text-align: center;
                  font-size: 12px; color: #999; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Missions Bénévoles</h1>
    </div>
    <div class="body">
        <h2>Bienvenue {{ $user->name }} !</h2>
        <p>Votre compte a été créé avec succès sur la plateforme <strong>Missions Bénévoles</strong>.</p>
        <p>Vous pouvez dès maintenant :</p>
        <ul>
            <li>Consulter les missions disponibles</li>
            <li>Vous inscrire aux missions qui vous correspondent</li>
            <li>Évaluer les missions auxquelles vous participez</li>
            <li>Utiliser notre chatbot pour toute question</li>
        </ul>
        <p>Nous sommes ravis de vous compter parmi nos bénévoles !</p>
        <a href="{{ config('app.url') }}" class="btn">Accéder à la plateforme</a>
    </div>
    <div class="footer">
        &copy; {{ date('Y') }} Missions Bénévoles — Tous droits réservés
    </div>
</div>
</body>
</html>