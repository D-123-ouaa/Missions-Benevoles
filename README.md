# Missions Bénévoles - Application de gestion de missions bénévoles

# Description

Missions Bénévoles est une application web complète permettant aux associations de gérer leurs missions et aux bénévoles de s'inscrire facilement. L'application offre une interface intuitive pour les administrateurs et les bénévoles.

# Fonctionnalités

## Pour les bénévoles
- Consultation des missions disponibles
- Inscription / Désistement aux missions
- Visualisation de ses inscriptions
- Gestion de son profil (photo, informations)

## Pour les administrateurs
- Gestion complète des missions (CRUD)
- Ajout et suppression d'images par mission
- Visualisation des participants
- Export des inscriptions en CSV
- Gestion des utilisateurs

## Public
- Consultation des missions sans authentification
- Inscription et connexion

# Technologies utilisées

## Backend
- **Laravel 11** - Framework PHP
- **MySQL** - Base de données
- **Sanctum** - Authentification API
- **Storage** - Gestion des fichiers

## Frontend
- **React 19** - Bibliothèque UI
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router DOM** - Navigation
- **Axios** - Requêtes HTTP
- **Lucide React** - Icônes

# Installation

## Prérequis
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+

## 1. Cloner le dépôt

```bash
git clone https://github.com/votre-utilisateur/benev-mission.git
cd benev-mission