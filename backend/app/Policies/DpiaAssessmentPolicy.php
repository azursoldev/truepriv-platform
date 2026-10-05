<?php

namespace App\Policies;

use App\Models\DpiaAssessment;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class DpiaAssessmentPolicy
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

    public function view(User $user, DpiaAssessment $dpia): bool
    {
        return $user->tenant_id === $dpia->tenant_id || 
               in_array($user->role, ['outsourced_dpo', 'dpco_lead_auditor', 'dpco_staff']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, [
            'corporate_admin',
            'compliance_officer',
            'outsourced_dpo'
        ]);
    }

    public function update(User $user, DpiaAssessment $dpia): bool
    {
        return in_array($user->role, [
            'corporate_admin',
            'compliance_officer',
            'outsourced_dpo'
        ]);
    }

    public function signOff(User $user, DpiaAssessment $dpia): bool
    {
        // Only accredited DPO consultants and internal DPOs can sign off on statutory DPIA
        return in_array($user->role, [
            'compliance_officer',
            'outsourced_dpo'
        ]);
    }

    public function delete(User $user, DpiaAssessment $dpia): bool
    {
        return $user->role === 'corporate_admin';
    }
}
