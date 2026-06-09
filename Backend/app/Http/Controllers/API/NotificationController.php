<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller {

    public function index() {
        $notifications = Notification::where('user_id', auth()->id())
            ->latest()->get();
        return response()->json($notifications);
    }

    public function unreadCount() {
        $count = Notification::where('user_id', auth()->id())
            ->where('is_read', false)->count();
        return response()->json(['count' => $count]);
    }

    public function markRead($id) {
        $notif = Notification::where('id', $id)
            ->where('user_id', auth()->id())->firstOrFail();
        $notif->update(['is_read' => true]);
        return response()->json(['message' => 'Notification marquée comme lue']);
    }

    public function markAllRead() {
        Notification::where('user_id', auth()->id())
            ->update(['is_read' => true]);
        return response()->json(['message' => 'Toutes les notifications sont lues']);
    }

    public function destroy($id) {
        $notif = Notification::where('id', $id)
            ->where('user_id', auth()->id())->firstOrFail();
        $notif->delete();
        return response()->json(['message' => 'Notification supprimée']);
    }

    // Super Admin : envoyer à tous
    public function broadcast(Request $request) {
        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        $request->validate([
            'title' => 'required|string',
            'message' => 'required|string',
        ]);
        $users = \App\Models\User::all();
        foreach ($users as $user) {
            Notification::create([
                'user_id' => $user->id,
                'title' => $request->title,
                'message' => $request->message,
                'type' => 'info',
            ]);
        }
        return response()->json(['message' => 'Notification envoyée à tous']);
    }
}