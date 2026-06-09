# Missions Bénévoles - Application de gestion de missions bénévoles

## Documentation d'installation
**Version 1.0** | Juin 2026

---

## Table des matières

1. [Présentation](#présentation)
2. [Prérequis techniques](#prérequis-techniques)
3. [Récupération du projet](#récupération-du-projet)
4. [Installation du backend](#installation-du-backend)
5. [Installation du frontend](#installation-du-frontend)
6. [Démarrage des serveurs](#démarrage-des-serveurs)
7. [Comptes de test](#comptes-de-test)
8. [Vérification](#vérification)
9. [Dépannage](#dépannage)
10. [Structure du projet](#structure-du-projet)

---

## Présentation

**Missions Bénévoles** est une application web permettant aux associations de gérer leurs missions et aux bénévoles de s'inscrire.

### Fonctionnalités principales

| Rôle | Fonctionnalités |
|------|-----------------|
| **Admin** | Créer, modifier, supprimer des missions, gérer les images, voir les participants, exporter CSV/PDF, dashboard, gestion utilisateurs |
| **Manager** | Gérer les missions, voir les participants, exporter CSV/PDF |
| **Bénévole** | Consulter les missions, s'inscrire, se désister, gérer son profil, noter une mission |
| **Public** | Consulter les missions sans authentification |

### Stack technique

| Composant | Technologie |
|-----------|-------------|
| Backend API | Laravel 11 |
| Frontend | React + Vite |
| Base de données | MySQL |
| Authentification | Laravel Sanctum |
| Styling | TailwindCSS |
| Chatbot IA | Gemini API |

---

## Prérequis techniques

Avant de commencer, assurez-vous d'avoir installé :

- PHP 8.2 ou supérieur
- Composer
- Node.js 18 ou supérieur
- MySQL

### Vérification des installations

```bash
php -v      # PHP 8.2.x ou supérieur
composer -v # Composer version 2.x
node -v     # v18.x ou supérieur
mysql -V    # mysql Ver 8.0.x
