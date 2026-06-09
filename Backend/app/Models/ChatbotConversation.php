<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ChatbotConversation extends Model 
{
    use HasFactory;
    
    protected $fillable = ['user_id', 'messages', 'context'];
    protected $casts = ['messages' => 'array', 'context' => 'array'];

    public function user() 
    {
        return $this->belongsTo(User::class);
    }
}