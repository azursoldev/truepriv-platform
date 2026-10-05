<?php

namespace App\Policies;

use App\Models\AuditProject;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AuditProjectPolicy
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

    public function view(User $user, AuditProject $project): bool
    {
        return $user->tenant_id === $project->tenant_id || 
               in_array($user->role, ['dpco_lead_auditor', 'dpco_staff', 'outsourced_dpo']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, [
            'dpco_lead_auditor',
            'corporate_admin'
        ]);
    }

    public function updateChecklist(User $user, AuditProject $project): bool
    {
        return in_array($user->role, [
            'dpco_lead_auditor',
            'dpco_staff'
        ]);
    }

    public function certify(User $user, AuditProject $project): bool
    {
        // Only licensed DPCO Lead Auditor can legally issue a certified audit pack
        return $user->role === 'dpco_lead_auditor';
    }
}
