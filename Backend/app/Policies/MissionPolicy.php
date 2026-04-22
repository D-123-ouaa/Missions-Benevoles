<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Mission;

class MissionPolicy
{
    // Vérifier si l'utilisateur peut voir la liste des missions
    public function viewAny(User $user): bool
    {
        return true;
    }

    // Vérifier si l'utilisateur peut voir une mission spécifique
    public function view(User $user, Mission $mission): bool
    {
        return true;
    }

    // Vérifier si l'utilisateur peut créer une mission
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    // Vérifier si l'utilisateur peut modifier une mission
    public function update(User $user, Mission $mission): bool
    {
        return $user->role === 'admin';
    }

    // Vérifier si l'utilisateur peut supprimer une mission
    public function delete(User $user, Mission $mission): bool
    {
        return $user->role === 'admin';
    }
}