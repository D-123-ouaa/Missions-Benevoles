<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Registration extends Model
{
    use HasFactory;
    protected $fillable = ['user_id','mission_id','status','registered_at',];

    // Relation avec l'utilisateur (bénévole).
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // Relation avec la mission.
    public function mission()
    {
        return $this->belongsTo(Mission::class, 'mission_id', 'id');
    }
}
