<?php

namespace App\Providers;

use App\Models\Mission;
use App\Models\Registration;
use App\Policies\MissionPolicy;
use App\Policies\RegistrationPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    // Enregistrer les policies pour les modèles
    protected $policies = [
        Mission::class => MissionPolicy::class,
        Registration::class => RegistrationPolicy::class, 
    ];

    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Enregistrer les policies
        $this->registerPolicies();
    }
}
