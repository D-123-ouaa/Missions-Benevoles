<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Registration;
use App\Models\Mission;

class RegistrationPolicy
{
    // vérifier si l'utilisateur peut s'inscrire
    public function register(User $user, Mission $mission): bool
    {
        return true;
    }

    // Vérifier si l'utilisateur peut se désister
    public function unregister(User $user, Mission $mission): bool
    {
        return true;
    }

    // Vérifier si l'utilisateur peut voir les participants
    public function viewParticipants(User $user, Mission $mission): bool
    {
        return true;
    }

    // Vérifier si l'utilisateur peut exporter les participants
    public function export(User $user, Mission $mission): bool
    {
        return true;
    }

    // Vérifier si l'utilisateur peut voir ses propres inscriptions
    public function viewMyRegistrations(User $user): bool
    {
        return true;
    }
}