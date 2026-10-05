<?php

namespace App\Policies;

use App\Models\DataBreach;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class DataBreachPolicy
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
        return !in_array($user->role, ['auditor_viewer']);
    }

    public function view(User $user, DataBreach $breach): bool
    {
        return $user->tenant_id === $breach->tenant_id || 
               in_array($user->role, ['outsourced_dpo', 'dpco_lead_auditor']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, [
            'corporate_admin',
            'compliance_officer',
            'outsourced_dpo'
        ]);
    }

    public function update(User $user, DataBreach $breach): bool
    {
        return in_array($user->role, [
            'corporate_admin',
            'compliance_officer',
            'outsourced_dpo'
        ]);
    }

    public function notifyNdpc(User $user, DataBreach $breach): bool
    {
        return in_array($user->role, [
            'corporate_admin',
            'compliance_officer',
            'outsourced_dpo'
        ]);
    }

    public function delete(User $user, DataBreach $breach): bool
    {
        return $user->role === 'corporate_admin';
    }
}
