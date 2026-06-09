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
               padding: 14px 32px; border-radius: 6px; text-decoration: none;
               font-weight: bold; margin-top: 20px; font-size: 16px; }
        .note { margin-top: 20px; font-size: 12px; color: #999; }
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
        <h2>Vérifiez votre email</h2>
        <p>Merci de vous être inscrit sur <strong>Missions Bénévoles</strong> !</p>
        <p>Cliquez sur le bouton ci-dessous pour vérifier votre adresse email et activer votre compte :</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $url }}" class="btn">Vérifier mon email</a>
        </div>
        <p class="note">Ce lien expire dans <strong>60 minutes</strong>. Si vous n'avez pas créé de compte, ignorez cet email.</p>
    </div>
    <div class="footer">
        &copy; {{ date('Y') }} Missions Bénévoles — Tous droits réservés
    </div>
</div>
</body>
</html>