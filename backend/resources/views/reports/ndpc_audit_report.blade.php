<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>NDPC Statutory Data Protection Audit Report — {{ $project->audit_year }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 12px;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #059669;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #065f46;
            font-size: 20px;
            margin: 0 0 4px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .header h2 {
            color: #334155;
            font-size: 14px;
            margin: 0;
            font-weight: normal;
        }
        .badge {
            display: inline-block;
            background: #d1fae5;
            color: #065f46;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 10px;
            margin-top: 6px;
        }
        .section-title {
            background: #f1f5f9;
            color: #0f172a;
            padding: 6px 10px;
            font-size: 13px;
            font-weight: bold;
            border-left: 4px solid #059669;
            margin: 20px 0 10px 0;
            text-transform: uppercase;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .meta-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
        }
        .meta-table td.label {
            font-weight: bold;
            color: #475569;
            width: 30%;
            background: #f8fafc;
        }
        .score-card {
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 20px;
            text-align: center;
        }
        .score-number {
            font-size: 28px;
            font-weight: bold;
            color: #059669;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            margin-bottom: 15px;
        }
        table.data-table th {
            background: #0f172a;
            color: white;
            padding: 6px 8px;
            text-align: left;
            font-size: 11px;
        }
        table.data-table td {
            padding: 6px 8px;
            border: 1px solid #e2e8f0;
            font-size: 11px;
        }
        .severity-critical { color: #dc2626; font-weight: bold; }
        .severity-high { color: #ea580c; font-weight: bold; }
        .severity-medium { color: #d97706; font-weight: bold; }
        .severity-low { color: #16a34a; }
        .footer {
            margin-top: 30px;
            border-top: 1px solid #cbd5e1;
            padding-top: 10px;
            text-align: center;
            font-size: 10px;
            color: #64748b;
        }
        .seal-box {
            border: 2px dashed #059669;
            padding: 10px;
            text-align: center;
            margin-top: 15px;
            border-radius: 6px;
            background: #f0fdf4;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>Federal Republic of Nigeria</h1>
        <h2>Nigeria Data Protection Commission (NDPC) Statutory Compliance Audit Report</h2>
        <div class="badge">Pursuant to Section 24, 28, 39 & 48 of the Nigeria Data Protection Act (NDPA 2023)</div>
    </div>

    <div class="score-card">
        <div>OVERALL NDPA COMPLIANCE READINESS SCORE</div>
        <div class="score-number">{{ number_format($project->overall_score, 2) }}%</div>
        <div style="font-weight: bold; color: #047857; text-transform: uppercase;">
            Status: {{ str_replace('_', ' ', $project->compliance_level) }}
        </div>
    </div>

    <div class="section-title">1. Organization & Audit Engagement Particulars</div>
    <table class="meta-table">
        <tr>
            <td class="label">Audited Data Controller:</td>
            <td><strong>{{ $tenant->name }}</strong></td>
        </tr>
        <tr>
            <td class="label">CAC Registration (RC No.):</td>
            <td>{{ $tenant->rc_number ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td class="label">NDPC Registration No.:</td>
            <td>{{ $tenant->ndpc_registration_number ?? 'Pending NDPC Issuance' }}</td>
        </tr>
        <tr>
            <td class="label">Industry Classification:</td>
            <td>{{ $tenant->industry ?? 'Commercial Enterprise' }}</td>
        </tr>
        <tr>
            <td class="label">Registered Address:</td>
            <td>{{ $tenant->address ?? 'Lagos, Nigeria' }} ({{ $tenant->state ?? 'Lagos' }} State)</td>
        </tr>
        <tr>
            <td class="label">Licensed DPCO Firm:</td>
            <td><strong>{{ $dpco ? $dpco->name : 'Internal Assessment' }}</strong></td>
        </tr>
        <tr>
            <td class="label">DPCO License Ref.:</td>
            <td>{{ $dpco ? ($dpco->dpco_license_number ?? 'NDPC/DPCO/2026/042') : 'N/A' }}</td>
        </tr>
        <tr>
            <td class="label">Lead Auditor:</td>
            <td>{{ $project->leadAuditor ? $project->leadAuditor->name : 'DPCO Lead Partner' }}</td>
        </tr>
        <tr>
            <td class="label">Audit Year & Scope:</td>
            <td>Annual Audit {{ $project->audit_year }} — {{ $project->scope_description }}</td>
        </tr>
    </table>

    <div class="section-title">2. Executive Summary & DPCO Opinion</div>
    <p style="text-align: justify; line-height: 1.6;">
        {{ $project->executive_summary ?? 'The organization has conducted an evaluation of its data governance, records of processing activities (RoPA), security safeguards, third-party processor agreements, and data subject access request mechanisms against the NDPA 2023 requirements.' }}
    </p>

    <div class="section-title">3. GAID Framework Compliance Breakdown</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Clause</th>
                <th>Domain / Compliance Area</th>
                <th>Status</th>
                <th>Points Awarded</th>
            </tr>
        </thead>
        <tbody>
            @foreach($project->checklistItems as $item)
            <tr>
                <td><strong>{{ $item->section_code }}</strong></td>
                <td>
                    {{ $item->question }}
                    @if($item->auditor_findings)
                        <div style="font-size: 10px; color: #475569; margin-top: 2px;"><em>Finding: {{ $item->auditor_findings }}</em></div>
                    @endif
                </td>
                <td>
                    <span style="font-weight: bold; color: {{ $item->status === 'compliant' ? '#059669' : ($item->status === 'partially_compliant' ? '#d97706' : '#dc2626') }}">
                        {{ strtoupper(str_replace('_', ' ', $item->status)) }}
                    </span>
                </td>
                <td>{{ number_format($item->awarded_points, 1) }} / {{ $item->max_points }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    @if($findings->count() > 0)
    <div class="section-title">4. Non-Conformities & Remediation Action Tracker</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Ref</th>
                <th>Finding / Non-Conformity</th>
                <th>Severity</th>
                <th>Remediation Plan</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($findings as $idx => $finding)
            <tr>
                <td>F-{{ $idx + 1 }}</td>
                <td>
                    <strong>{{ $finding->title }}</strong>
                    <div style="font-size: 10px; color: #475569;">{{ $finding->description }}</div>
                </td>
                <td class="severity-{{ $finding->severity }}">{{ strtoupper($finding->severity) }}</td>
                <td>{{ $finding->remediation_plan ?? $finding->recommendation }}</td>
                <td>{{ strtoupper(str_replace('_', ' ', $finding->status)) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="seal-box">
        <div style="font-size: 13px; font-weight: bold; color: #065f46;">LICENSED DPCO STATUTORY SEAL & DIGITAL CERTIFICATION</div>
        <div style="font-size: 11px; margin-top: 4px; font-family: monospace; color: #0f172a;">
            SEAL VERIFICATION CODE: {{ $project->dpco_seal_code ?? 'DPCO-SEAL-2026-' . strtoupper(substr(md5($project->id), 0, 10)) }}
        </div>
        <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
            Certified under the authority of the Nigeria Data Protection Commission (NDPC). Report Hash: {{ hash('sha256', $project->id . $project->overall_score) }}
        </div>
    </div>

    <div class="footer">
        Generated by DPODPCO Compliance Management Platform on {{ $generatedAt }} | Official Regulatory Filing Copy
    </div>

</body>
</html>
