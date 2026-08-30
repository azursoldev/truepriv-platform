<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     * Prevents cross-tenant data leakage by enforcing tenant_id constraint.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $activeTenantId = app()->bound('current_tenant_id') ? app('current_tenant_id') : null;

        if ($activeTenantId) {
            $builder->where($model->getTable() . '.tenant_id', $activeTenantId);
        }
    }
}
