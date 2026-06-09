<?php
namespace App\Mail;

use App\Models\Mission;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UnregistrationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public Mission $mission) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Désistement enregistré — ' . $this->mission->title);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.unregistration');
    }
}