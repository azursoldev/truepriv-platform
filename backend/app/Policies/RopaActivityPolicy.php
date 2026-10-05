<?php

namespace App\Policies;

use App\Models\RopaActivity;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class RopaActivityPolicy
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
        return true;
    }

    public function view(User $user, RopaActivity $ropa): bool
    {
        return $user->tenant_id === $ropa->tenant_id || 
               in_array($user->role, ['outsourced_dpo', 'dpco_lead_auditor', 'dpco_staff']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, [
            'corporate_admin',
            'compliance_officer',
            'dept_champion',
            'outsourced_dpo'
        ]);
    }

    public function update(User $user, RopaActivity $ropa): bool
    {
        return in_array($user->role, [
            'corporate_admin',
            'compliance_officer',
            'outsourced_dpo'
        ]);
    }

    public function delete(User $user, RopaActivity $ropa): bool
    {
        return $user->role === 'corporate_admin';
    }
}
