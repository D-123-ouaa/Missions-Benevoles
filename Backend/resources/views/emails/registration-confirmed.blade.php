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
        .mission-box { background: #EAF9D9; border-left: 4px solid #653239;
                       padding: 15px 20px; border-radius: 4px; margin: 20px 0; }
        .mission-box p { margin: 5px 0; }
        .footer { background: #f4f4f4; padding: 15px; text-align: center;
                  font-size: 12px; color: #999; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Inscription Confirmée</h1>
    </div>
    <div class="body">
        <h2>Bonjour {{ $user->name }},</h2>
        <p>Votre inscription à la mission suivante a bien été enregistrée :</p>
        <div class="mission-box">
            <p><strong>Mission :</strong> {{ $mission->title }}</p>
            <p><strong>Date :</strong> {{ $mission->date->format('d/m/Y') }}</p>
            <p><strong>Lieu :</strong> {{ $mission->location }}</p>
        </div>
        <p>Nous vous enverrons un rappel 2 jours avant la mission.</p>
        <p>Merci pour votre engagement !</p>
    </div>
    <div class="footer">
        &copy; {{ date('Y') }} Missions Bénévoles
    </div>
</div>
</body>
</html>