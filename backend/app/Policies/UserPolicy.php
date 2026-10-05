<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
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
        return $user->role === 'corporate_admin';
    }

    public function view(User $user, User $model): bool
    {
        return $user->role === 'corporate_admin' && $user->tenant_id === $model->tenant_id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'corporate_admin';
    }

    public function update(User $user, User $model): bool
    {
        return $user->role === 'corporate_admin' && $user->tenant_id === $model->tenant_id;
    }

    public function delete(User $user, User $model): bool
    {
        // Cannot delete oneself
        return $user->role === 'corporate_admin' && 
               $user->tenant_id === $model->tenant_id && 
               $user->id !== $model->id;
    }
}
