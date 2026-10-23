<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Official Corporate Tax Invoice & Payment Receipt — {{ $invoice_number }}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #0f172a;
            background-color: #f8fafc;
            font-size: 13px;
            line-height: 1.6;
            margin: 0;
            padding: 30px 20px;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            position: relative;
        }
        .no-print {
            max-width: 800px;
            margin: 0 auto 20px auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border-radius: 10px;
            font-weight: bold;
            font-size: 13px;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s ease;
            border: none;
        }
        .btn-primary {
            background-color: #ea580c;
            color: #ffffff;
        }
        .btn-primary:hover {
            background-color: #c2410c;
        }
        .btn-outline {
            background-color: #ffffff;
            color: #475569;
            border: 1px solid #cbd5e1;
        }
        .btn-outline:hover {
            background-color: #f1f5f9;
        }
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 25px;
            margin-bottom: 25px;
        }
        .brand-title {
            font-size: 24px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.5px;
            margin: 0 0 5px 0;
        }
        .brand-title span {
            color: #ea580c;
        }
        .brand-subtitle {
            font-size: 11px;
            color: #64748b;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .invoice-meta-box {
            text-align: right;
        }
        .invoice-title {
            font-size: 18px;
            font-weight: 900;
            color: #ea580c;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 4px 0;
        }
        .invoice-num {
            font-family: monospace;
            font-size: 14px;
            font-weight: bold;
            color: #1e293b;
        }
        .status-pill {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 8px;
        }
        .status-successful {
            background-color: #dcfce7;
            color: #15803d;
            border: 1px solid #bbf7d0;
        }
        .status-pending {
            background-color: #fef3c7;
            color: #b45309;
            border: 1px solid #fde68a;
        }
        .status-rejected {
            background-color: #ffe4e6;
            color: #be123c;
            border: 1px solid #fecdd3;
        }
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
            margin-bottom: 30px;
        }
        .details-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px 20px;
        }
        .details-box h4 {
            margin: 0 0 10px 0;
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 800;
        }
        .details-box p {
            margin: 3px 0;
            font-size: 12px;
            color: #334155;
        }
        .details-box strong {
            color: #0f172a;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .items-table th {
            background-color: #f8fafc;
            color: #475569;
            text-align: left;
            padding: 12px 16px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #e2e8f0;
        }
        .items-table td {
            padding: 16px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: top;
        }
        .item-name {
            font-weight: 800;
            color: #0f172a;
            font-size: 13px;
        }
        .item-desc {
            font-size: 11px;
            color: #64748b;
            margin-top: 4px;
        }
        .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
        }
        .totals-box {
            width: 320px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px 20px;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 12px;
            color: #475569;
        }
        .totals-row.grand-total {
            border-top: 2px dashed #cbd5e1;
            margin-top: 8px;
            padding-top: 12px;
            font-size: 16px;
            font-weight: 900;
            color: #0f172a;
        }
        .totals-row.grand-total .amount {
            color: #ea580c;
            font-family: monospace;
        }
        .stamp-seal {
            border: 2px solid #16a34a;
            color: #16a34a;
            font-weight: 900;
            padding: 10px 18px;
            border-radius: 12px;
            display: inline-block;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 12px;
            transform: rotate(-3deg);
            background: rgba(220, 252, 231, 0.4);
            margin-bottom: 20px;
        }
        .invoice-footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #64748b;
        }
        .invoice-footer p {
            margin: 4px 0;
        }
        @media print {
            body {
                background: #ffffff;
                padding: 0;
            }
            .invoice-container {
                border: none;
                box-shadow: none;
                padding: 0;
            }
            .no-print {
                display: none !important;
            }
        }
    </style>
</head>
<body>

    <div class="no-print">
        <a href="javascript:window.history.back()" class="btn btn-outline">
            <i class="fa-solid fa-arrow-left"></i>
            <span>Back to Billing Desk</span>
        </a>
        <button onclick="window.print()" class="btn btn-primary">
            <i class="fa-solid fa-print"></i>
            <span>Print / Save PDF Receipt</span>
        </button>
    </div>

    <div class="invoice-container">
        
        <!-- Header -->
        <div class="invoice-header">
            <div>
                <h1 class="brand-title">True<span>Priv</span></h1>
                <div class="brand-subtitle">
                    Nigeria Data Protection Compliance Platform (NDPA 2023)
                </div>
                <div style="font-size: 11px; color: #475569; margin-top: 6px;">
                    TruePriv Compliance Technologies Limited<br>
                    Plot 482, Constitution Avenue, Central Business District, Abuja FCT<br>
                    <strong>RC:</strong> 1984201 • <strong>TIN:</strong> 24901842-0001 • <strong>NDPC DPCO:</strong> REG/DPCO/2026/084
                </div>
            </div>

            <div class="invoice-meta-box">
                <div class="invoice-title">Tax Invoice / Receipt</div>
                <div class="invoice-num">{{ $invoice_number }}</div>
                <div>
                    <span class="status-pill status-{{ $status === 'successful' ? 'successful' : ($status === 'pending_verification' ? 'pending' : 'rejected') }}">
                        <i class="fa-solid {{ $status === 'successful' ? 'fa-circle-check' : ($status === 'pending_verification' ? 'fa-clock' : 'fa-triangle-exclamation') }}"></i>
                        {{ $status === 'successful' ? 'PAID IN FULL' : ($status === 'pending_verification' ? 'PENDING VERIFICATION' : 'REJECTED') }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Details Grid -->
        <div class="details-grid">
            <div class="details-box">
                <h4>Billed To (Client Organization)</h4>
                <p><strong>Organization:</strong> {{ $tenant->name ?? 'Corporate Client' }}</p>
                <p><strong>Industry:</strong> {{ ucfirst($tenant->industry ?? 'Financial Services') }}</p>
                <p><strong>RC / Registration No:</strong> {{ $tenant->rc_number ?? 'RC-2024810' }}</p>
                <p><strong>Country / Residency:</strong> Nigeria (Galaxy Backbone Onshore)</p>
                <p><strong>Contact Email:</strong> {{ $client_email ?? 'compliance@organization.ng' }}</p>
            </div>

            <div class="details-box">
                <h4>Payment & Transaction Metadata</h4>
                <p><strong>Transaction Ref:</strong> <span style="font-family: monospace; font-weight: bold;">{{ $transaction_reference }}</span></p>
                <p><strong>Payment Gateway:</strong> {{ strtoupper($payment_gateway) }}</p>
                <p><strong>Payment Date:</strong> {{ $paid_at_formatted }}</p>
                <p><strong>License Period:</strong> {{ $period_start }} — {{ $period_end }} (365 Days)</p>
                <p><strong>License Key:</strong> <span style="font-family: monospace; font-size: 10px; color: #ea580c; font-weight: bold;">{{ $license_key }}</span></p>
            </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 55%;">Subscription Item & Statutory Entitlement</th>
                    <th style="text-align: center; width: 15%;">Period</th>
                    <th style="text-align: right; width: 15%;">Unit Price</th>
                    <th style="text-align: right; width: 15%;">Total (NGN)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div class="item-name">{{ $plan_name }} — Annual Statutory License</div>
                        <div class="item-desc">
                            Includes official NDPC PDF/CSV filing pack generator, digital auditor verification seal, 
                            enterprise RoPA registry, 72h breach reporting portal, and onshore data localization.
                        </div>
                    </td>
                    <td style="text-align: center; font-family: monospace; font-weight: bold;">1 Year (365 Days)</td>
                    <td style="text-align: right; font-family: monospace;">₦{{ number_format($net_amount, 2) }}</td>
                    <td style="text-align: right; font-family: monospace; font-weight: bold;">₦{{ number_format($net_amount, 2) }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Totals Section -->
        <div class="totals-section">
            <div class="totals-box">
                <div class="totals-row">
                    <span>Net Amount:</span>
                    <span style="font-family: monospace;">₦{{ number_format($net_amount, 2) }}</span>
                </div>
                <div class="totals-row">
                    <span>VAT (7.5% Statutory FIRS):</span>
                    <span style="font-family: monospace;">₦{{ number_format($vat_amount, 2) }}</span>
                </div>
                <div class="totals-row grand-total">
                    <span>Total Paid:</span>
                    <span class="amount">₦{{ number_format($total_amount, 2) }}</span>
                </div>
            </div>
        </div>

        @if($status === 'successful')
        <div style="text-align: center;">
            <div class="stamp-seal">
                <i class="fa-solid fa-stamp"></i>
                VERIFIED & PAID • NDPA 2023 STATUTORY SEAL
            </div>
        </div>
        @endif

        <!-- Footer -->
        <div class="invoice-footer">
            <p><strong>Regulatory Compliance Notice:</strong> This document serves as an official proof of payment and tax deduction receipt for software licensing in accordance with the Nigeria Data Protection Act (NDPA) 2023 and Federal Inland Revenue Service (FIRS) statutory standards.</p>
            <p>TruePriv Compliance Platform • Abuja & Lagos, Nigeria • Support: billing@truepriv.ng • Web: https://truepriv.ng</p>
        </div>

    </div>

</body>
</html>
