<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

class Mission extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 
        'description', 
        'date', 
        'location', 
        'available_places'
    ];

    protected $casts = [
        'date' => 'date',           
        'available_places' => 'integer',
    ];

    // Relation avec les bénévoles (many-to-many via registrations)
    public function volunteers()
    {
        return $this->belongsToMany(User::class, 'registrations', 'mission_id', 'user_id')
                    ->withPivot('status', 'registered_at')
                    ->withTimestamps();
    }

    // Relation avec les images de la mission
    public function images()
    {
        return $this->hasMany(Image::class)->orderBy('order');
    }

    // Accesseur pour obtenir l'URL de la première image (thumbnail)
    public function getThumbnailUrlAttribute()
    {
        $firstImage = $this->images()->first();
        if ($firstImage) {
            return $firstImage->url;
        }
        return asset('images/default-mission.jpg');
    }

    // Accesseur pour obtenir toutes les URLs des images
    public function getImagesUrlsAttribute()
    {
        return $this->images->map(function($image) {
            return $image->url;
        });
    }

    // Calcule le nombre de places restantes
    public function remainingPlaces(): int
    {
        $registeredCount = $this->volunteers()
            ->wherePivot('status', 'confirmed')
            ->count();
        
        return max(0, $this->available_places - $registeredCount);
    }

    // Vérifie si la mission est passée
    public function isPast(): bool
    {
        return $this->date->isPast();
    }

    // Vérifie si la mission est complète (corrigé)
    public function isFull(): bool
    {
        return $this->remainingPlaces() <= 0;
    }

    // Récupère le nombre de bénévoles inscrits confirmés
    public function getRegisteredCount(): int
    {
        return $this->volunteers()
            ->wherePivot('status', 'confirmed')
            ->count();
    }
}