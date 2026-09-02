<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GuestInvitation;
use App\Models\RopaActivity;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChampionInvitationController extends Controller
{
    /**
     * List all department champion invitations.
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = app('current_tenant_id');
        $invitations = GuestInvitation::where('tenant_id', $tenantId)
            ->with('invitedBy:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $invitations->count(),
            'data' => $invitations,
        ]);
    }

    /**
     * Create a new tokenized Department Champion invitation.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'department_assigned' => 'required|string|max:100', // HR, IT, Finance, Operations, Legal, Marketing
            'notes' => 'nullable|string',
            'expires_days' => 'nullable|integer|min:1|max:30',
        ]);

        $tenantId = app('current_tenant_id');
        $user = $request->user();

        $token = (string) Str::random(48);
        $days = (int) ($request->expires_days ?? 7);

        $invitation = GuestInvitation::create([
            'tenant_id' => $tenantId,
            'email' => $validated['email'],
            'department_assigned' => $validated['department_assigned'],
            'role_scope' => 'dept_champion',
            'invitation_token' => $token,
            'status' => 'pending',
            'invited_by_user_id' => $user->id,
            'expires_at' => now()->addDays($days),
        ]);

        $inviteUrl = url("/portal/champion-intake?token={$token}");

        return response()->json([
            'success' => true,
            'message' => "Invitation generated for {$validated['email']} ({$validated['department_assigned']} Champion).",
            'data' => $invitation,
            'invite_url' => $inviteUrl,
        ], 201);
    }

    /**
     * Public token verification to load champion intake workspace.
     */
    public function resolvePublicToken(string $token): JsonResponse
    {
        $invitation = GuestInvitation::where('invitation_token', $token)
            ->with('tenant:id,name,industry')
            ->first();

        if (!$invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired invitation token.'
            ], 404);
        }

        if ($invitation->expires_at && $invitation->expires_at->isPast()) {
            $invitation->update(['status' => 'expired']);
            return response()->json([
                'success' => false,
                'message' => 'This invitation has expired. Please request a new token from your Compliance Officer.'
            ], 410);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'invitation_id' => $invitation->id,
                'tenant_name' => $invitation->tenant->name,
                'department' => $invitation->department_assigned,
                'email' => $invitation->email,
                'status' => $invitation->status,
                'expires_at' => $invitation->expires_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Department Champion submits department processing inventory via token.
     */
    public function submitDepartmentData(Request $request, string $token): JsonResponse
    {
        $invitation = GuestInvitation::where('invitation_token', $token)->firstOrFail();

        if ($invitation->expires_at && $invitation->expires_at->isPast()) {
            return response()->json(['success' => false, 'message' => 'Invitation expired.'], 410);
        }

        $validated = $request->validate([
            'process_name' => 'required|string|max:255',
            'business_purpose' => 'required|string',
            'legal_basis' => 'required|in:consent,contract,legal_obligation,vital_interest,public_interest,legitimate_interest',
            'personal_data_elements' => 'required|array',
            'storage_location' => 'required|string',
            'retention_period' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $activity = RopaActivity::create([
            'tenant_id' => $invitation->tenant_id,
            'process_name' => $validated['process_name'],
            'department' => $invitation->department_assigned,
            'business_purpose' => $validated['business_purpose'],
            'legal_basis' => $validated['legal_basis'],
            'data_subject_categories' => ['Department Specific / Employees'],
            'personal_data_elements' => $validated['personal_data_elements'],
            'storage_location' => $validated['storage_location'],
            'retention_period' => $validated['retention_period'],
            'security_measures' => 'Role-based access, encryption',
            'status' => 'draft', // Submitted by champion for DPO review
        ]);

        $invitation->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Department processing activity submitted for DPO review and verification.',
            'data' => $activity,
        ]);
    }
}
