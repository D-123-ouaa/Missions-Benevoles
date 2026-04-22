<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

class Image extends Model
{
    use HasFactory;

    protected $fillable = [
        'mission_id', 'image_path', 'image_name', 'order'
    ];

    protected $appends = ['url']; 

    // Relation avec la mission
    public function mission()
    {
        return $this->belongsTo(Mission::class);
    }

    // Accessor pour obtenir l'URL complète de l'image
    public function getUrlAttribute()
    {
        if ($this->image_path && Storage::disk('public')->exists($this->image_path)) {
            return asset('storage/' . $this->image_path);
        }
        return null;
    }

    // Supprimer le fichier physique quand l'image est supprimée
    protected static function booted()
    {
        static::deleting(function ($image) {
            if ($image->image_path && Storage::disk('public')->exists($image->image_path)) {
                Storage::disk('public')->delete($image->image_path);
            }
        });
    }
}