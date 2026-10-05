<?php

namespace App\Policies;

use App\Models\GuestInvitation;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class GuestInvitationPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === 'super_admin') {
            return true;
        }
        return null;
    }

    public function viewAny(User $user): bool
    {
        return in_array($user->role, [
            'corporate_admin',
            'compliance_officer',
            'outsourced_dpo'
        ]);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, [
            'corporate_admin',
            'compliance_officer',
            'outsourced_dpo'
        ]);
    }

    public function delete(User $user, GuestInvitation $invitation): bool
    {
        return $user->role === 'corporate_admin' || $user->id === $invitation->invited_by_user_id;
    }
}
