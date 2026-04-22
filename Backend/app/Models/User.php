<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;
    
    protected $fillable = [
        'name', 
        'email', 
        'password', 
        'role', 
        'phone',
        'avatar'  
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // cast pour hasher automatiquement le mot de passe lors de la création ou mise à jour de l'utilisateur
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Accessor pour obtenir l'URL complète de l'avatar
    public function getAvatarUrlAttribute()
    {
        if ($this->avatar && !filter_var($this->avatar, FILTER_VALIDATE_URL)) {
            if (Storage::disk('public')->exists($this->avatar)) {
                return asset('storage/' . $this->avatar);
            }
        }
        
        return 'https://ui-avatars.com/api/?background=653239&color=fff&name=' . urlencode($this->name);
    }
    
    // Vérifier si l'utilisateur est un admin
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
    
    // Vérifier si l'utilisateur est un bénévole
    public function isVolunteer(): bool
    {
        return $this->role === 'volunteer';
    }

    // Relation avec la table pivot registrations pour les missions auxquelles l'utilisateur est inscrit
    public function missions()
    {
        return $this->belongsToMany(Mission::class, 'registrations', 'user_id', 'mission_id')
                    ->withPivot('status', 'registered_at')
                    ->withTimestamps();
    }
}