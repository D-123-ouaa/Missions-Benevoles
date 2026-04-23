# Missions Bénévoles - Application de gestion de missions bénévoles

## DOCUMENTATION D'INSTALLATION - Missions Bénévoles
## Version 1.0 | 23 Avril 2026

### Table des matières

1. Présentation
2. Prérequis techniques
3. Récupération du projet
4. Installation du backend
5. Installation du frontend
6. Démarrage des serveurs
7. Comptes de test
8. Vérification
9. Dépannage
10. Structure du projet

#### Présentation

Missions Bénévoles est une application web permettant aux associations de gérer leurs missions et aux bénévoles de s'inscrire.

- Fonctionnalités principales :
Admin : Créer, modifier, supprimer des missions, gérer les images, voir les participants, exporter CSV.
Bénévole : Consulter les missions, s'inscrire, se désister, gérer son profil
Public : Consulter les missions sans authentification

- Stack technique :
*Composant / Technologie
*Backend API / Laravel 12
*Frontend / React + vite
*Base de données / MySQL
*Authentification / Laravel Sanctum
*Styling / TailwindCSS

#### Prérequis techniques

Avant de commencer, assurez-vous d'avoir installé :
*PHP
*Composer
*Node.js
*MySQL

- Vérification des installations :
# Vérifier PHP
php -v
# Doit afficher : PHP 8.2.x ou supérieur
# Vérifier Composer
composer -v
# Doit afficher : Composer version 2.x
# Vérifier Node.js
node -v
# Doit afficher : v18.x ou supérieur
# Vérifier MySQL
mysql -V
# Doit afficher : mysql Ver 8.0.x

#### Récupération du projet

- bash
git clone https://github.com/D-123-ouaa/Missions-Benevoles.git
cd Missions-Benevoles

#### Installation du Backend (Laravel)

- bash
cd Backend
composer install
cp .env.example .env
php artisan key:generate

- Ouvrir le fichier .env et modifier ces lignes :
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=Missions_Benevoles
DB_USERNAME=root
DB_PASSWORD=

- Créer la base de données MySQL Via phpMyAdmin :
*Ouvrir http://localhost/phpmyadmin
*Cliquer sur "Nouvelle base de données"
*Nom : benev_mission
*Choisir : utf8mb4_unicode_ci
*Cliquer sur "Créer"

- Lancer les migrations et les seeders:
# Créer les tables
php artisan migrate
# Remplir avec des données de test
php artisan db:seed

#### Installation du Frontend (React)

- bash
cd ../frontend
npm install

- Vérifier la configuration API:
Le fichier src/api/axios.js doit contenir la bonne URL : baseURL: 'http://127.0.0.1:8000/api'

#### Démarrage des serveurs

Important : Les deux serveurs doivent tourner en même temps (dans deux terminaux différents)

- Terminal 1 : Backend
cd Backend
php artisan serve
sortie attendue : INFO  Server running on [http://127.0.0.1:8000].

- Terminal 2 : Frontend
cd frontend
npm run dev
sortie attendue : VITE v5.0.0  ready in 500 ms
➜  Local:   http://localhost:5173/

#### 7. Comptes de test

Rôle / Email / Mot de passe / Accès
Administrateur / admin@example.com / admin123 / Gestion complète
Bénévole 1 / jean@example.com / password / Inscriptions + Profil
Bénévole 2 / marie@example.com / password / Inscriptions + Profil

#### 8. Vérification

- Tester l'API
URL / Méthode / Résultat attendu
http://127.0.0.1:8000/api/missions / GET / Liste des missions (JSON)
http://127.0.0.1:8000/api/login / POST / Token d'authentifiaction

- Tester l'application
1. Ouvrir http://localhost:5173
2. Vérifier l'affichage des missions
3. Cliquer sur "Se connecter"
4. Tester avec admin@example.com / admin123
5. Vérifier l'accès à l'espace admin

- Parcours complet
Étape	/ Action /	Résultat attendu
1	/ Page d'accueil	/ Liste des missions
2	/ Cliquer sur "Voir détails"	/ Modal avec détails
3	/ Cliquer sur "S'inscrire" (sans être connecté)	/ Redirection vers login
4	/ Créer un compte	/ Message de succès
5	/ Se connecter	/ Redirection vers accueil
6	/ S'inscrire à une mission	/ Message "Inscription réussie"
7	/ Aller dans "Mes inscriptions"	/ Mission apparaît
8	/ Se déconnecter / Retour à la page d'accueil
9	/ Se connecter avec admin	/ Menu admin visible
10	/ Créer une nouvelle mission	/ Formulaire fonctionnel

## 9. Dépannage

- Problèmes courants
Problème / Cause	/ Solution
404 Not Found	/ Route non trouvée	/ Vérifier routes/api.php et redémarrer le serveur
500 Internal Server Error	/ Erreur dans le code	/ Vérifier storage/logs/laravel.log
401 Unauthorized	/ Token manquant	/ Se reconnecter pour obtenir un nouveau token
403 Forbidden	/ Droits insuffisants	/ Utiliser le bon compte (admin vs bénévole)
Connection refused	/ Backend non démarré	/ Lancer php artisan serve
Class not found	/ Autoload erroné	/ Exécuter composer dump-autoload

- Erreurs spécifiques
Erreur : Storage link already exists
Solution : *rm -rf public/storage *php artisan storage:link

Erreur : Port 8000 already in use 
Solution : php artisan serve --port=8001

Erreur : Port 5173 already in use
Solution : npm run dev -- --port=5174

Erreur : SQLSTATE[HY000] [1049] Unknown database
Solution : # Créer la base de données *mysql -u root -p -e "CREATE DATABASE benev_mission"

- Nettoyer le cache:
*bash
php artisan optimize:clear
php artisan route:clear
php artisan config:clear
php artisan view:clear
php artisan cache:clear

- Réinitialiser complètement
*bash
# Recréer toute la base de données
php artisan migrate:fresh --seed

# Relancer les serveurs
php artisan serve
npm run dev

#### 10. Structure du projet
benev-mission/
│
├── backend/                          # API Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/API/
│   │   │       ├── AuthController.php
│   │   │       ├── MissionController.php
│   │   │       ├── ProfileController.php
│   │   │       └── RegistrationController.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Mission.php
│   │   │   ├── Registration.php
│   │   │   └── Image.php
│   │   └── Policies/
│   │       ├── MissionPolicy.php
│   │       └── RegistrationPolicy.php
│   ├── database/
│   │   └── migrations/
│   ├── routes/
│   │   └── api.php
│   ├── storage/
│   │   └── app/public/
│   │       ├── avatars/              # Photos de profil
│   │       └── missions/             # Images des missions
│   ├── .env.example
│   └── .gitignore
│
├── frontend/                         # Application React
│   ├── public/
│   │   └── header.jpg                # Image header
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js              # Configuration API
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MissionDetail.jsx
│   │   │   ├── MyRegistrations.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── AdminMissionCreate.jsx
│   │   │   ├── AdminMissionEdit.jsx
│   │   │   └── AdminMissionShow.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
├── .gitignore
└── README.md                         # Ce fichier