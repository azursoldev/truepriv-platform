--
-- PostgreSQL database dump
--


-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ai_decision_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_decision_logs (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid,
    decision_type character varying(100) NOT NULL,
    model_name character varying(100) DEFAULT 'claude-3-5-sonnet'::character varying NOT NULL,
    prompt_tokens integer DEFAULT 0 NOT NULL,
    completion_tokens integer DEFAULT 0 NOT NULL,
    confidence_score numeric(4,2) DEFAULT 0.95 NOT NULL,
    input_payload json NOT NULL,
    ai_output_payload json NOT NULL,
    human_override_status character varying(255) DEFAULT 'accepted'::character varying NOT NULL,
    human_override_rationale text,
    ledger_hash character varying(128),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT ai_decision_logs_human_override_status_check CHECK (((human_override_status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'modified'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.ai_decision_logs OWNER TO postgres;

--
-- Name: approvals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.approvals (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    signable_type character varying(255) NOT NULL,
    signable_id uuid NOT NULL,
    signer_user_id uuid NOT NULL,
    signer_role character varying(50) NOT NULL,
    signature_hash character varying(64),
    ip_address character varying(45),
    user_agent text,
    signed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.approvals OWNER TO postgres;

--
-- Name: audit_checklist_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_checklist_items (
    id uuid NOT NULL,
    audit_project_id uuid NOT NULL,
    domain character varying(255) NOT NULL,
    section_code character varying(255) NOT NULL,
    question text NOT NULL,
    guidance text,
    status character varying(255) DEFAULT 'pending_review'::character varying NOT NULL,
    max_points smallint DEFAULT '5'::smallint NOT NULL,
    awarded_points numeric(4,2) DEFAULT '0'::numeric NOT NULL,
    auditor_findings text,
    client_notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT audit_checklist_items_domain_check CHECK (((domain)::text = ANY ((ARRAY['governance_accountability'::character varying, 'lawfulness_consent'::character varying, 'data_subject_rights'::character varying, 'security_measures'::character varying, 'third_party_processors'::character varying, 'cross_border_transfers'::character varying])::text[]))),
    CONSTRAINT audit_checklist_items_status_check CHECK (((status)::text = ANY ((ARRAY['compliant'::character varying, 'partially_compliant'::character varying, 'non_compliant'::character varying, 'not_applicable'::character varying, 'pending_review'::character varying])::text[])))
);


ALTER TABLE public.audit_checklist_items OWNER TO postgres;

--
-- Name: audit_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_comments (
    id uuid NOT NULL,
    audit_project_id uuid NOT NULL,
    finding_id uuid,
    user_id uuid NOT NULL,
    comment_text text NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.audit_comments OWNER TO postgres;

--
-- Name: audit_evidences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_evidences (
    id uuid NOT NULL,
    audit_project_id uuid NOT NULL,
    checklist_item_id uuid,
    file_title character varying(255) NOT NULL,
    file_path character varying(255) NOT NULL,
    file_type character varying(255),
    file_size integer,
    uploaded_by uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.audit_evidences OWNER TO postgres;

--
-- Name: audit_findings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_findings (
    id uuid NOT NULL,
    audit_project_id uuid NOT NULL,
    checklist_item_id uuid,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    severity character varying(255) DEFAULT 'medium'::character varying NOT NULL,
    recommendation text NOT NULL,
    remediation_plan text,
    assigned_to uuid,
    target_resolution_date date,
    resolved_at timestamp(0) without time zone,
    status character varying(255) DEFAULT 'open'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT audit_findings_severity_check CHECK (((severity)::text = ANY ((ARRAY['critical'::character varying, 'high'::character varying, 'medium'::character varying, 'low'::character varying, 'observation'::character varying])::text[]))),
    CONSTRAINT audit_findings_status_check CHECK (((status)::text = ANY ((ARRAY['open'::character varying, 'in_remediation'::character varying, 'resolved'::character varying, 'verified_closed'::character varying])::text[])))
);


ALTER TABLE public.audit_findings OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    tenant_id uuid,
    user_id uuid,
    action character varying(100) NOT NULL,
    entity_type character varying(255),
    entity_id character varying(255),
    old_values json,
    new_values json,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: audit_projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_projects (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    dpco_firm_id uuid,
    lead_auditor_id uuid,
    audit_year integer DEFAULT 2026 NOT NULL,
    title character varying(255) NOT NULL,
    scope_description text,
    overall_score numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    compliance_level character varying(255) DEFAULT 'not_assessed'::character varying NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    dpco_seal_code character varying(255),
    ndpc_acknowledgement_ref character varying(255),
    executive_summary text,
    certified_at timestamp(0) without time zone,
    filed_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT audit_projects_compliance_level_check CHECK (((compliance_level)::text = ANY ((ARRAY['substantially_compliant'::character varying, 'partially_compliant'::character varying, 'non_compliant'::character varying, 'not_assessed'::character varying])::text[]))),
    CONSTRAINT audit_projects_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'scoping'::character varying, 'fieldwork'::character varying, 'remediation_in_progress'::character varying, 'final_review'::character varying, 'dpco_certified'::character varying, 'filed_with_ndpc'::character varying])::text[])))
);


ALTER TABLE public.audit_projects OWNER TO postgres;

--
-- Name: breach_playbook_steps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.breach_playbook_steps (
    id uuid NOT NULL,
    data_breach_id uuid NOT NULL,
    step_code character varying(50) NOT NULL,
    step_name character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    executed_by_user_id uuid,
    atomic_started_at timestamp(0) without time zone,
    atomic_completed_at timestamp(0) without time zone,
    playbook_output_data json,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT breach_playbook_steps_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'skipped'::character varying])::text[])))
);


ALTER TABLE public.breach_playbook_steps OWNER TO postgres;

--
-- Name: cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO postgres;

--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO postgres;

--
-- Name: company_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_profiles (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    cac_rc_number character varying(50),
    tax_identification_number character varying(50),
    sector character varying(100),
    data_protection_officer_name character varying(255),
    data_protection_officer_email character varying(255),
    mdc_classification_tier character varying(255) DEFAULT 'non_mdc'::character varying NOT NULL,
    employee_count_bracket character varying(50),
    annual_data_subjects_processed integer DEFAULT 0 NOT NULL,
    registered_office_address text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT company_profiles_mdc_classification_tier_check CHECK (((mdc_classification_tier)::text = ANY ((ARRAY['non_mdc'::character varying, 'mdc_medium'::character varying, 'mdc_high'::character varying, 'mdc_extra_high'::character varying])::text[])))
);


ALTER TABLE public.company_profiles OWNER TO postgres;

--
-- Name: cookie_banners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cookie_banners (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    domain character varying(255) NOT NULL,
    theme_color character varying(255) DEFAULT '#059669'::character varying NOT NULL,
    "position" character varying(255) DEFAULT 'bottom_bar'::character varying NOT NULL,
    privacy_policy_url character varying(255),
    company_display_name character varying(255),
    custom_notice_text text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT cookie_banners_position_check CHECK ((("position")::text = ANY ((ARRAY['bottom_bar'::character varying, 'floating_bottom_left'::character varying, 'floating_bottom_right'::character varying, 'center_modal'::character varying])::text[])))
);


ALTER TABLE public.cookie_banners OWNER TO postgres;

--
-- Name: cookie_consents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cookie_consents (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    visitor_uuid character varying(255) NOT NULL,
    accepted_categories json NOT NULL,
    ip_hash character varying(255),
    user_agent text,
    consented_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.cookie_consents OWNER TO postgres;

--
-- Name: cross_border_transfers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cross_border_transfers (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    ropa_activity_id uuid,
    destination_country_code character varying(2) NOT NULL,
    destination_country_name character varying(100) NOT NULL,
    recipient_entity_name character varying(255) NOT NULL,
    recipient_entity_type character varying(255) DEFAULT 'sub_processor'::character varying NOT NULL,
    ndpc_transfer_mechanism character varying(255) DEFAULT 'standard_contractual_clauses_scc'::character varying NOT NULL,
    safeguard_documentation_ref character varying(255),
    annual_transfer_volume_estimate integer DEFAULT 0 NOT NULL,
    encryption_in_transit_standard character varying(100) DEFAULT 'TLS 1.3 / AES-256'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT cross_border_transfers_ndpc_transfer_mechanism_check CHECK (((ndpc_transfer_mechanism)::text = ANY ((ARRAY['adequacy_decision'::character varying, 'standard_contractual_clauses_scc'::character varying, 'binding_corporate_rules_bcr'::character varying, 'explicit_consent_derogation'::character varying, 'statutory_public_interest'::character varying])::text[]))),
    CONSTRAINT cross_border_transfers_recipient_entity_type_check CHECK (((recipient_entity_type)::text = ANY ((ARRAY['sub_processor'::character varying, 'joint_controller'::character varying, 'group_affiliate'::character varying, 'public_authority'::character varying])::text[])))
);


ALTER TABLE public.cross_border_transfers OWNER TO postgres;

--
-- Name: data_breaches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.data_breaches (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    incident_number character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    nature_of_incident character varying(255) NOT NULL,
    date_time_occurred timestamp(0) without time zone,
    date_time_discovered timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ndpc_notification_deadline timestamp(0) without time zone,
    estimated_affected_subjects integer DEFAULT 0 NOT NULL,
    compromised_data_categories json NOT NULL,
    risk_assessment_level character varying(255) DEFAULT 'medium'::character varying NOT NULL,
    is_ndpc_notified boolean DEFAULT false NOT NULL,
    ndpc_notified_at timestamp(0) without time zone,
    ndpc_reference_number character varying(255),
    are_subjects_notified boolean DEFAULT false NOT NULL,
    subjects_notified_at timestamp(0) without time zone,
    containment_steps_taken text,
    remedial_measures text,
    root_cause_analysis text,
    status character varying(255) DEFAULT 'reported_triage'::character varying NOT NULL,
    lead_responder_id uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT data_breaches_nature_of_incident_check CHECK (((nature_of_incident)::text = ANY ((ARRAY['unauthorized_access'::character varying, 'ransomware_malware'::character varying, 'lost_stolen_device'::character varying, 'accidental_disclosure_email'::character varying, 'insider_threat'::character varying, 'phishing_credential_theft'::character varying, 'physical_theft'::character varying, 'misconfigured_cloud_bucket'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT data_breaches_risk_assessment_level_check CHECK (((risk_assessment_level)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high_to_rights_freedoms'::character varying, 'critical_systemic'::character varying])::text[]))),
    CONSTRAINT data_breaches_status_check CHECK (((status)::text = ANY ((ARRAY['reported_triage'::character varying, 'investigation'::character varying, 'containment_remediation'::character varying, 'ndpc_notified'::character varying, 'closed'::character varying])::text[])))
);


ALTER TABLE public.data_breaches OWNER TO postgres;

--
-- Name: data_controller_classifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.data_controller_classifications (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    calculated_tier character varying(255) DEFAULT 'standard_controller'::character varying NOT NULL,
    criteria_evaluated json,
    annual_filing_fee_applicable numeric(10,2) DEFAULT '0'::numeric CONSTRAINT data_controller_classificat_annual_filing_fee_applicab_not_null NOT NULL,
    mandatory_dpo_required boolean DEFAULT true NOT NULL,
    statutory_audit_mandatory boolean DEFAULT true CONSTRAINT data_controller_classificati_statutory_audit_mandatory_not_null NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT data_controller_classifications_calculated_tier_check CHECK (((calculated_tier)::text = ANY ((ARRAY['standard_controller'::character varying, 'mdc_high'::character varying, 'mdc_extra_high'::character varying, 'mdc_ultra_high'::character varying])::text[])))
);


ALTER TABLE public.data_controller_classifications OWNER TO postgres;

--
-- Name: dpco_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dpco_profiles (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    ndpc_license_number character varying(100) NOT NULL,
    managing_partner_name character varying(255) NOT NULL,
    managing_partner_email character varying(255) NOT NULL,
    accreditation_year integer,
    digital_seal_signature_hash character varying(255),
    license_status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT dpco_profiles_license_status_check CHECK (((license_status)::text = ANY ((ARRAY['active'::character varying, 'suspended'::character varying, 'under_renewal'::character varying])::text[])))
);


ALTER TABLE public.dpco_profiles OWNER TO postgres;

--
-- Name: dpia_assessments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dpia_assessments (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    ropa_id uuid,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    high_risk_reasons json,
    nature_of_processing text,
    necessity_proportionality_check text,
    inherent_likelihood smallint DEFAULT '3'::smallint NOT NULL,
    inherent_impact smallint DEFAULT '3'::smallint NOT NULL,
    inherent_risk_score smallint DEFAULT '9'::smallint NOT NULL,
    inherent_risk_level character varying(255) DEFAULT 'medium'::character varying NOT NULL,
    mitigation_measures json,
    residual_likelihood smallint DEFAULT '1'::smallint NOT NULL,
    residual_impact smallint DEFAULT '2'::smallint NOT NULL,
    residual_risk_score smallint DEFAULT '2'::smallint NOT NULL,
    residual_risk_level character varying(255) DEFAULT 'low'::character varying NOT NULL,
    dpo_recommendations text,
    dpo_sign_off_status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    dpco_review_notes text,
    approved_by uuid,
    approved_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT dpia_assessments_dpo_sign_off_status_check CHECK (((dpo_sign_off_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'requires_consultation_ndpc'::character varying, 'rejected'::character varying])::text[]))),
    CONSTRAINT dpia_assessments_inherent_risk_level_check CHECK (((inherent_risk_level)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))),
    CONSTRAINT dpia_assessments_residual_risk_level_check CHECK (((residual_risk_level)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[])))
);


ALTER TABLE public.dpia_assessments OWNER TO postgres;

--
-- Name: dpo_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dpo_profiles (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    lead_consultant_name character varying(255) NOT NULL,
    lead_consultant_email character varying(255) NOT NULL,
    professional_certifications json,
    consulting_tier character varying(50) DEFAULT 'standard'::character varying NOT NULL,
    active_client_capacity integer DEFAULT 10 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.dpo_profiles OWNER TO postgres;

--
-- Name: dsar_actions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dsar_actions (
    id uuid NOT NULL,
    dsar_request_id uuid NOT NULL,
    performed_by_user_id uuid,
    action_type character varying(255) DEFAULT 'note_logged'::character varying NOT NULL,
    action_notes text NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT dsar_actions_action_type_check CHECK (((action_type)::text = ANY ((ARRAY['id_verified'::character varying, 'records_retrieved'::character varying, 'redaction_applied'::character varying, 'response_dispatched'::character varying, 'rejected'::character varying, 'sla_extended'::character varying, 'note_logged'::character varying])::text[])))
);


ALTER TABLE public.dsar_actions OWNER TO postgres;

--
-- Name: dsar_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dsar_requests (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    ticket_number character varying(255) NOT NULL,
    request_type character varying(255) NOT NULL,
    data_subject_name character varying(255) NOT NULL,
    data_subject_email character varying(255) NOT NULL,
    data_subject_phone character varying(255),
    subject_relationship character varying(255) DEFAULT 'customer'::character varying NOT NULL,
    request_details text NOT NULL,
    id_document_path character varying(255),
    id_verified boolean DEFAULT false NOT NULL,
    sla_deadline timestamp(0) without time zone NOT NULL,
    status character varying(255) DEFAULT 'submitted'::character varying NOT NULL,
    response_summary text,
    rejection_reason text,
    assigned_dpo_id uuid,
    completed_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT dsar_requests_request_type_check CHECK (((request_type)::text = ANY ((ARRAY['access_copy'::character varying, 'rectification'::character varying, 'erasure'::character varying, 'objection'::character varying, 'restrict_processing'::character varying, 'data_portability'::character varying])::text[]))),
    CONSTRAINT dsar_requests_status_check CHECK (((status)::text = ANY ((ARRAY['submitted'::character varying, 'identity_verified'::character varying, 'investigating'::character varying, 'action_taken'::character varying, 'completed'::character varying, 'rejected'::character varying])::text[]))),
    CONSTRAINT dsar_requests_subject_relationship_check CHECK (((subject_relationship)::text = ANY ((ARRAY['customer'::character varying, 'former_customer'::character varying, 'employee'::character varying, 'job_applicant'::character varying, 'vendor_contact'::character varying, 'other'::character varying])::text[])))
);


ALTER TABLE public.dsar_requests OWNER TO postgres;

--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: guest_invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guest_invitations (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    invited_by_user_id uuid,
    email character varying(255) NOT NULL,
    assigned_role character varying(50) DEFAULT 'dept_champion'::character varying NOT NULL,
    target_department character varying(100),
    invitation_token character varying(128) NOT NULL,
    expires_at timestamp(0) without time zone NOT NULL,
    accepted_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.guest_invitations OWNER TO postgres;

--
-- Name: industry_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.industry_templates (
    id bigint NOT NULL,
    industry_name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    icon character varying(255),
    description text,
    default_ropa json NOT NULL,
    default_dpia_triggers json,
    default_policies json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.industry_templates OWNER TO postgres;

--
-- Name: industry_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.industry_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.industry_templates_id_seq OWNER TO postgres;

--
-- Name: industry_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.industry_templates_id_seq OWNED BY public.industry_templates.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO postgres;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(255) DEFAULT 'general'::character varying NOT NULL,
    action_url character varying(255),
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['breach_urgent_72h'::character varying, 'dsar_sla_urgent'::character varying, 'audit_deadline_march15'::character varying, 'dpa_missing'::character varying, 'approval_request'::character varying, 'general'::character varying])::text[])))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: omnichannel_consents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.omnichannel_consents (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    data_subject_identifier character varying(255) NOT NULL,
    channel character varying(255) DEFAULT 'web_sdk'::character varying NOT NULL,
    channel_session_ref character varying(255),
    raw_payload json NOT NULL,
    consent_categories json NOT NULL,
    proof_hash character varying(64) NOT NULL,
    ip_address character varying(45),
    opt_in_timestamp timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_withdrawn boolean DEFAULT false NOT NULL,
    withdrawn_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT omnichannel_consents_channel_check CHECK (((channel)::text = ANY ((ARRAY['ussd_session'::character varying, 'sms_shortcode'::character varying, 'web_sdk'::character varying, 'mobile_app'::character varying, 'physical_paper_form'::character varying, 'ivr_voice_prompt'::character varying])::text[])))
);


ALTER TABLE public.omnichannel_consents OWNER TO postgres;

--
-- Name: onboarding_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.onboarding_answers (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    question_id uuid NOT NULL,
    answered_by_user_id uuid,
    response_boolean boolean,
    response_text text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.onboarding_answers OWNER TO postgres;

--
-- Name: onboarding_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.onboarding_questions (
    id uuid NOT NULL,
    category character varying(100) NOT NULL,
    question_text text NOT NULL,
    explanation_guide text,
    weight_points integer DEFAULT 5 NOT NULL,
    is_mandatory boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.onboarding_questions OWNER TO postgres;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid NOT NULL,
    subscription_id uuid,
    tenant_id uuid NOT NULL,
    transaction_reference character varying(100) NOT NULL,
    payment_gateway character varying(255) DEFAULT 'paystack'::character varying NOT NULL,
    amount_paid numeric(12,2) NOT NULL,
    currency character varying(3) DEFAULT 'NGN'::character varying NOT NULL,
    gateway_status character varying(50) DEFAULT 'successful'::character varying NOT NULL,
    paid_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT payments_payment_gateway_check CHECK (((payment_gateway)::text = ANY ((ARRAY['paystack'::character varying, 'flutterwave'::character varying, 'bank_transfer'::character varying])::text[])))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id uuid NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO postgres;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_access_tokens_id_seq OWNER TO postgres;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: policies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.policies (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    content text NOT NULL,
    version character varying(255) DEFAULT '1.0'::character varying NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    published_at timestamp(0) without time zone,
    created_by uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT policies_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'published'::character varying, 'archived'::character varying])::text[]))),
    CONSTRAINT policies_type_check CHECK (((type)::text = ANY ((ARRAY['privacy_notice_website'::character varying, 'employee_privacy_policy'::character varying, 'data_retention_schedule'::character varying, 'incident_response_policy'::character varying, 'data_protection_agreement_dpa'::character varying, 'cctv_surveillance_policy'::character varying])::text[])))
);


ALTER TABLE public.policies OWNER TO postgres;

--
-- Name: ropa_activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ropa_activities (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    process_name character varying(255) NOT NULL,
    department character varying(255) NOT NULL,
    business_purpose text NOT NULL,
    legal_basis character varying(255) NOT NULL,
    legal_basis_rationale text,
    data_subject_categories json NOT NULL,
    personal_data_elements json NOT NULL,
    special_category_data boolean DEFAULT false NOT NULL,
    recipients json,
    has_third_party_processor boolean DEFAULT false NOT NULL,
    third_party_names json,
    cross_border_transfer boolean DEFAULT false NOT NULL,
    transfer_destination_countries json,
    transfer_safeguards character varying(255),
    storage_location character varying(255) DEFAULT 'Local Server / Cloud'::character varying NOT NULL,
    retention_period character varying(255) DEFAULT '6 years after account termination'::character varying NOT NULL,
    security_measures text,
    requires_dpia boolean DEFAULT false NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    reviewed_by uuid,
    approved_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT ropa_activities_legal_basis_check CHECK (((legal_basis)::text = ANY ((ARRAY['consent'::character varying, 'contract'::character varying, 'legal_obligation'::character varying, 'vital_interest'::character varying, 'public_interest'::character varying, 'legitimate_interest'::character varying])::text[]))),
    CONSTRAINT ropa_activities_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'reviewed_by_dept'::character varying, 'verified_by_dpo'::character varying, 'approved_active'::character varying])::text[]))),
    CONSTRAINT ropa_activities_transfer_safeguards_check CHECK (((transfer_safeguards)::text = ANY ((ARRAY['adequacy_decision'::character varying, 'ndpc_approved_bcr'::character varying, 'standard_contractual_clauses'::character varying, 'explicit_consent'::character varying, 'none'::character varying])::text[])))
);


ALTER TABLE public.ropa_activities OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id uuid,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    plan_tier character varying(255) DEFAULT 'starter_corporate'::character varying NOT NULL,
    billing_cycle character varying(255) DEFAULT 'annual'::character varying NOT NULL,
    price_ngn numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    status character varying(255) DEFAULT 'trialing'::character varying NOT NULL,
    current_period_start timestamp(0) without time zone,
    current_period_end timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT subscriptions_billing_cycle_check CHECK (((billing_cycle)::text = ANY ((ARRAY['monthly'::character varying, 'annual'::character varying])::text[]))),
    CONSTRAINT subscriptions_plan_tier_check CHECK (((plan_tier)::text = ANY ((ARRAY['starter_corporate'::character varying, 'growth_enterprise'::character varying, 'dpo_unlimited'::character varying, 'dpco_audit_suite'::character varying])::text[]))),
    CONSTRAINT subscriptions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'past_due'::character varying, 'cancelled'::character varying, 'trialing'::character varying])::text[])))
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: tenant_client_organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant_client_organizations (
    id uuid NOT NULL,
    parent_tenant_id uuid NOT NULL,
    client_tenant_id uuid NOT NULL,
    contract_ref character varying(255),
    service_scope character varying(255) DEFAULT 'annual_audit_filing'::character varying NOT NULL,
    assigned_lead_auditor_id uuid,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    engagement_start_date date,
    engagement_end_date date,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT tenant_client_organizations_service_scope_check CHECK (((service_scope)::text = ANY ((ARRAY['annual_audit_filing'::character varying, 'full_dpo_as_a_service'::character varying, 'advisory_gap_assessment'::character varying, 'incident_response_support'::character varying])::text[]))),
    CONSTRAINT tenant_client_organizations_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'pending_approval'::character varying, 'completed'::character varying, 'suspended'::character varying])::text[])))
);


ALTER TABLE public.tenant_client_organizations OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    type character varying(255) DEFAULT 'corporate'::character varying NOT NULL,
    industry character varying(255),
    rc_number character varying(255),
    ndpc_registration_number character varying(255),
    dpco_license_number character varying(255),
    contact_email character varying(255),
    contact_phone character varying(255),
    address character varying(255),
    state character varying(255),
    data_residency character varying(255) DEFAULT 'local_nigeria'::character varying NOT NULL,
    compliance_score numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    settings json,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    parent_tenant_id uuid,
    tenant_tier character varying(255) DEFAULT 'independent_corporate'::character varying NOT NULL,
    feature_flags json,
    data_subject_quota integer DEFAULT 50000 NOT NULL,
    monthly_dsar_limit integer DEFAULT 999999 NOT NULL,
    monthly_breach_limit integer DEFAULT 999999 NOT NULL,
    usage_metrics json,
    CONSTRAINT tenants_data_residency_check CHECK (((data_residency)::text = ANY ((ARRAY['local_nigeria'::character varying, 'global_aws'::character varying])::text[]))),
    CONSTRAINT tenants_tenant_tier_check CHECK (((tenant_tier)::text = ANY ((ARRAY['independent_corporate'::character varying, 'parent_holding_group'::character varying, 'dpo_agency_hub'::character varying, 'dpco_audit_practice'::character varying, 'sub_workspace_client'::character varying])::text[]))),
    CONSTRAINT tenants_type_check CHECK (((type)::text = ANY ((ARRAY['corporate'::character varying, 'outsourced_dpo'::character varying, 'dpco_firm'::character varying])::text[])))
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    tenant_id uuid,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    role character varying(255) DEFAULT 'corporate_admin'::character varying NOT NULL,
    department character varying(255),
    phone character varying(255),
    avatar_url character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['super_admin'::character varying, 'dpco_lead_auditor'::character varying, 'dpco_staff'::character varying, 'outsourced_dpo'::character varying, 'corporate_admin'::character varying, 'compliance_officer'::character varying, 'dept_champion'::character varying, 'auditor_viewer'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    vendor_name character varying(255) NOT NULL,
    service_category character varying(255) NOT NULL,
    contact_person character varying(255),
    contact_email character varying(255),
    contact_phone character varying(255),
    data_types_processed json NOT NULL,
    dpa_signed boolean DEFAULT false NOT NULL,
    dpa_signed_date date,
    dpa_file_path character varying(255),
    risk_rating character varying(255) DEFAULT 'medium'::character varying NOT NULL,
    hosting_country character varying(255) DEFAULT 'Nigeria'::character varying NOT NULL,
    is_cross_border boolean DEFAULT false NOT NULL,
    last_assessment_date date,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    cookie_category character varying(255) DEFAULT 'strictly_necessary'::character varying,
    cookies_detected json,
    CONSTRAINT vendors_risk_rating_check CHECK (((risk_rating)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))),
    CONSTRAINT vendors_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'under_review'::character varying, 'terminated'::character varying])::text[])))
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: industry_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industry_templates ALTER COLUMN id SET DEFAULT nextval('public.industry_templates_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Data for Name: ai_decision_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_decision_logs (id, tenant_id, user_id, decision_type, model_name, prompt_tokens, completion_tokens, confidence_score, input_payload, ai_output_payload, human_override_status, human_override_rationale, ledger_hash, created_at, updated_at) FROM stdin;
01a0730f-afc7-7194-b9be-eb3fdcb52d60	43e9a4fc-3db7-488c-afef-135689b1c27f	\N	statutory_compliance_scan	Ketch-Privacy-Agent-V2.4	520	410	0.97	{"ropa_total":5,"dpia_total":1,"dsar_total":2,"vendor_total":3,"cookie_active":true}	{"score":85,"findings":[{"id":"gap_v_dpa","severity":"critical","category":"Vendor Risk (TPRM)","statutory_reference":"NDPA 2023 Sec 42 & Art 28 GDPR","issue":"1 third-party data processor(s) lack signed Data Processing Agreements (DPA).","remediation":"Execute standard contractual DPA with vendor before permitting continued data flows."},{"id":"pass_ropa","severity":"pass","category":"RoPA Inventory","statutory_reference":"NDPA Sec 24","issue":"RoPA inventory active with 5 mapped business processing operations.","remediation":"Continue regular quarterly review cycle with department champions."},{"id":"pass_cmp","severity":"pass","category":"Consent & Cookie CMP","statutory_reference":"NDPA Sec 26","issue":"Zero-GTM Script Gating and Cookie Banner active (12 proofs logged).","remediation":"Telemetry actively synced with immutable consent proof ledger."}]}	accepted	\N	0a242e9d9beda32d59d564b7d224f455eadf4100d70b0959c3dbfcf0f48c36c0	2026-09-05 19:33:23	2026-09-05 19:33:23
01a07313-a2ae-71d8-86aa-5475116942f4	43e9a4fc-3db7-488c-afef-135689b1c27f	\N	statutory_compliance_scan	Ketch-Privacy-Agent-V2.4	520	410	0.97	{"ropa_total":5,"dpia_total":1,"dsar_total":2,"vendor_total":3,"cookie_active":true}	{"score":85,"findings":[{"id":"gap_v_dpa","severity":"critical","category":"Vendor Risk (TPRM)","statutory_reference":"NDPA 2023 Sec 42 & Art 28 GDPR","issue":"1 third-party data processor(s) lack signed Data Processing Agreements (DPA).","remediation":"Execute standard contractual DPA with vendor before permitting continued data flows."},{"id":"pass_ropa","severity":"pass","category":"RoPA Inventory","statutory_reference":"NDPA Sec 24","issue":"RoPA inventory active with 5 mapped business processing operations.","remediation":"Continue regular quarterly review cycle with department champions."},{"id":"pass_cmp","severity":"pass","category":"Consent & Cookie CMP","statutory_reference":"NDPA Sec 26","issue":"Zero-GTM Script Gating and Cookie Banner active (12 proofs logged).","remediation":"Telemetry actively synced with immutable consent proof ledger."}]}	accepted	\N	5f6127d0710d79fc15f277c27378ee2bb025765443c80a27f9300e8f668cae46	2026-09-05 19:37:41	2026-09-05 19:37:41
01a07313-a31e-7217-a89d-39cc0c72f84a	43e9a4fc-3db7-488c-afef-135689b1c27f	\N	copilot_statutory_advisory	Ketch-Privacy-Agent-V2.4	54	408	0.98	{"prompt":"How does NDPA Section 41 handle cross border transfer?"}	{"answer":"Under **NDPA 2023 Section 41**, cross-border transfers of personal data (e.g. to AWS Ireland or Google Cloud US) require that the destination country has an **Adequacy Decision** by the NDPC, or the controller must implement **Standard Contractual Clauses (SCCs)** or Binding Corporate Rules. For cloud vendors hosted outside Nigeria, ensure cross-border transfer assessments are recorded in the Vendor Desk."}	accepted	\N	7d67721f42a165341a6b2a30ed26f911b5746e46f48095cfc4525daf3915b34e	2026-09-05 19:37:41	2026-09-05 19:37:41
01a07314-0685-73fc-8b0e-7a7adbde62a8	43e9a4fc-3db7-488c-afef-135689b1c27f	\N	statutory_compliance_scan	Ketch-Privacy-Agent-V2.4	520	410	0.97	{"ropa_total":5,"dpia_total":1,"dsar_total":2,"vendor_total":3,"cookie_active":true}	{"score":85,"findings":[{"id":"gap_v_dpa","severity":"critical","category":"Vendor Risk (TPRM)","statutory_reference":"NDPA 2023 Sec 42 & Art 28 GDPR","issue":"1 third-party data processor(s) lack signed Data Processing Agreements (DPA).","remediation":"Execute standard contractual DPA with vendor before permitting continued data flows."},{"id":"pass_ropa","severity":"pass","category":"RoPA Inventory","statutory_reference":"NDPA Sec 24","issue":"RoPA inventory active with 5 mapped business processing operations.","remediation":"Continue regular quarterly review cycle with department champions."},{"id":"pass_cmp","severity":"pass","category":"Consent & Cookie CMP","statutory_reference":"NDPA Sec 26","issue":"Zero-GTM Script Gating and Cookie Banner active (12 proofs logged).","remediation":"Telemetry actively synced with immutable consent proof ledger."}]}	accepted	\N	7a46e9f2867e933353372f1acfa2ee3a993eb533f4692caae438b8d0ef4cdb6e	2026-09-05 19:38:07	2026-09-05 19:38:07
01a07314-06c1-7075-b0e9-c0c529a3eaa8	43e9a4fc-3db7-488c-afef-135689b1c27f	\N	copilot_statutory_advisory	Ketch-Privacy-Agent-V2.4	54	408	0.98	{"prompt":"How does NDPA Section 41 handle cross border transfer?"}	{"answer":"Under **NDPA 2023 Section 41**, cross-border transfers of personal data (e.g. to AWS Ireland or Google Cloud US) require that the destination country has an **Adequacy Decision** by the NDPC, or the controller must implement **Standard Contractual Clauses (SCCs)** or Binding Corporate Rules. For cloud vendors hosted outside Nigeria, ensure cross-border transfer assessments are recorded in the Vendor Desk."}	accepted	\N	cd06dd56bd844f221e71ce740449e3f58586dce0029334ebe4117cd0377deed2	2026-09-05 19:38:07	2026-09-05 19:38:07
01a07315-835a-70e2-9633-e2425f403c0b	43e9a4fc-3db7-488c-afef-135689b1c27f	01a06c84-f877-7130-9148-643491c6fa49	statutory_compliance_scan	Ketch-Privacy-Agent-V2.4	520	410	0.97	{"ropa_total":5,"dpia_total":1,"dsar_total":2,"vendor_total":3,"cookie_active":true}	{"score":85,"findings":[{"id":"gap_v_dpa","severity":"critical","category":"Vendor Risk (TPRM)","statutory_reference":"NDPA 2023 Sec 42 & Art 28 GDPR","issue":"1 third-party data processor(s) lack signed Data Processing Agreements (DPA).","remediation":"Execute standard contractual DPA with vendor before permitting continued data flows."},{"id":"pass_ropa","severity":"pass","category":"RoPA Inventory","statutory_reference":"NDPA Sec 24","issue":"RoPA inventory active with 5 mapped business processing operations.","remediation":"Continue regular quarterly review cycle with department champions."},{"id":"pass_cmp","severity":"pass","category":"Consent & Cookie CMP","statutory_reference":"NDPA Sec 26","issue":"Zero-GTM Script Gating and Cookie Banner active (12 proofs logged).","remediation":"Telemetry actively synced with immutable consent proof ledger."}]}	accepted	\N	4aa66446a4bf0faa13d095d340cb6f5aa9b7781b0d37362f8b4f4f7de4563343	2026-09-05 19:39:44	2026-09-05 19:39:44
01a07316-07db-71fb-b3e2-c5ec36879eeb	43e9a4fc-3db7-488c-afef-135689b1c27f	01a06c84-f877-7130-9148-643491c6fa49	statutory_compliance_scan	Ketch-Privacy-Agent-V2.4	520	410	0.97	{"ropa_total":5,"dpia_total":1,"dsar_total":2,"vendor_total":3,"cookie_active":true}	{"score":85,"findings":[{"id":"gap_v_dpa","severity":"critical","category":"Vendor Risk (TPRM)","statutory_reference":"NDPA 2023 Sec 42 & Art 28 GDPR","issue":"1 third-party data processor(s) lack signed Data Processing Agreements (DPA).","remediation":"Execute standard contractual DPA with vendor before permitting continued data flows."},{"id":"pass_ropa","severity":"pass","category":"RoPA Inventory","statutory_reference":"NDPA Sec 24","issue":"RoPA inventory active with 5 mapped business processing operations.","remediation":"Continue regular quarterly review cycle with department champions."},{"id":"pass_cmp","severity":"pass","category":"Consent & Cookie CMP","statutory_reference":"NDPA Sec 26","issue":"Zero-GTM Script Gating and Cookie Banner active (12 proofs logged).","remediation":"Telemetry actively synced with immutable consent proof ledger."}]}	accepted	\N	5c3e8dbe8caa77e6214bdaf843e9030a18e8bf656f5d73fb7336d6312f959757	2026-09-05 19:40:18	2026-09-05 19:40:18
01a07316-0e4b-7153-8d11-603f7aa9e5b4	43e9a4fc-3db7-488c-afef-135689b1c27f	01a06c84-f877-7130-9148-643491c6fa49	statutory_compliance_scan	Ketch-Privacy-Agent-V2.4	520	410	0.97	{"ropa_total":5,"dpia_total":1,"dsar_total":2,"vendor_total":3,"cookie_active":true}	{"score":85,"findings":[{"id":"gap_v_dpa","severity":"critical","category":"Vendor Risk (TPRM)","statutory_reference":"NDPA 2023 Sec 42 & Art 28 GDPR","issue":"1 third-party data processor(s) lack signed Data Processing Agreements (DPA).","remediation":"Execute standard contractual DPA with vendor before permitting continued data flows."},{"id":"pass_ropa","severity":"pass","category":"RoPA Inventory","statutory_reference":"NDPA Sec 24","issue":"RoPA inventory active with 5 mapped business processing operations.","remediation":"Continue regular quarterly review cycle with department champions."},{"id":"pass_cmp","severity":"pass","category":"Consent & Cookie CMP","statutory_reference":"NDPA Sec 26","issue":"Zero-GTM Script Gating and Cookie Banner active (12 proofs logged).","remediation":"Telemetry actively synced with immutable consent proof ledger."}]}	accepted	\N	30c75ce8d1da2d9fc0a85d72afffc2d8263fb1f70d09397e47b153e65001aa52	2026-09-05 19:40:20	2026-09-05 19:40:20
01a07316-9e85-7066-8455-cdd83406d40d	43e9a4fc-3db7-488c-afef-135689b1c27f	01a06c84-f877-7130-9148-643491c6fa49	copilot_statutory_advisory	Ketch-Privacy-Agent-V2.4	50	307	0.98	{"prompt":"What must be included in a third-party Vendor DPA?"}	{"answer":"According to **NDPA Section 42**, a data controller cannot engage a third-party data processor (e.g. Paystack, AWS, Intercom) without a binding **Data Processing Agreement (DPA)**. The DPA must mandate confidentiality, security safeguards, prompt breach notifications (within 24-48 hours), and audit rights."}	accepted	\N	fce28677c09197f5064b98c311219dd94e43661c6107ee358b8cdaabfee3e74d	2026-09-05 19:40:57	2026-09-05 19:40:57
01a07316-c6c5-73fe-952c-b5fe05eb3fcf	43e9a4fc-3db7-488c-afef-135689b1c27f	01a06c84-f877-7130-9148-643491c6fa49	copilot_statutory_advisory	Ketch-Privacy-Agent-V2.4	30	329	0.98	{"prompt":"ye pora system kaise chalta he"}	{"answer":"The **Ketch Privacy Agent Network** continuously cross-references your RoPA activities, DPIA assessments, and vendor contracts against the **NDPA 2023 Statutory Framework**. Recommended action: Execute signed DPAs for high-risk vendors and ensure all cross-border hosting operations include approved Standard Contractual Clauses."}	accepted	\N	49c9a9096f0c79a09476fa9e27021135eb3b6ac13d68771c119fef2da91352f6	2026-09-05 19:41:07	2026-09-05 19:41:07
01a07316-fe09-7310-97d6-33fed61f8441	43e9a4fc-3db7-488c-afef-135689b1c27f	01a06c84-f877-7130-9148-643491c6fa49	copilot_statutory_advisory	Ketch-Privacy-Agent-V2.4	51	303	0.98	{"prompt":"How does Ketch Cookie SDK gate scripts without GTM?"}	{"answer":"Under **NDPA Section 26**, consent must be freely given, specific, informed, and unambiguous. Pre-ticked checkboxes or implicit browsing consent are non-compliant. With the **Ketch CMP SDK**, scripts under Analytics and Marketing categories remain gated until the visitor performs an affirmative opt-in."}	accepted	\N	79b9d7ccf60b7cedded13c40b0f613492b7ef02a19c41dd00f922ea2a98bc612	2026-09-05 19:41:21	2026-09-05 19:41:21
01a07317-81c2-73da-956f-08dc48099ebd	43e9a4fc-3db7-488c-afef-135689b1c27f	01a06c84-f877-7130-9148-643491c6fa49	statutory_compliance_scan	Ketch-Privacy-Agent-V2.4	520	410	0.97	{"ropa_total":5,"dpia_total":1,"dsar_total":2,"vendor_total":3,"cookie_active":true}	{"score":85,"findings":[{"id":"gap_v_dpa","severity":"critical","category":"Vendor Risk (TPRM)","statutory_reference":"NDPA 2023 Sec 42 & Art 28 GDPR","issue":"1 third-party data processor(s) lack signed Data Processing Agreements (DPA).","remediation":"Execute standard contractual DPA with vendor before permitting continued data flows."},{"id":"pass_ropa","severity":"pass","category":"RoPA Inventory","statutory_reference":"NDPA Sec 24","issue":"RoPA inventory active with 5 mapped business processing operations.","remediation":"Continue regular quarterly review cycle with department champions."},{"id":"pass_cmp","severity":"pass","category":"Consent & Cookie CMP","statutory_reference":"NDPA Sec 26","issue":"Zero-GTM Script Gating and Cookie Banner active (12 proofs logged).","remediation":"Telemetry actively synced with immutable consent proof ledger."}]}	accepted	\N	8f14d531d8afdc9fcecd6c50634c766f9ea4ecd97d09822d90b83dd6bdb9cd2e	2026-09-05 19:41:55	2026-09-05 19:41:55
01a0731a-7dbd-704f-a3cc-941d6fad6a1b	43e9a4fc-3db7-488c-afef-135689b1c27f	01a06c84-f877-7130-9148-643491c6fa49	statutory_compliance_scan	Ketch-Privacy-Agent-V2.4	520	410	0.97	{"ropa_total":5,"dpia_total":1,"dsar_total":2,"vendor_total":3,"cookie_active":true}	{"score":85,"findings":[{"id":"gap_v_dpa","severity":"critical","category":"Vendor Risk (TPRM)","statutory_reference":"NDPA 2023 Sec 42 & Art 28 GDPR","issue":"1 third-party data processor(s) lack signed Data Processing Agreements (DPA).","remediation":"Execute standard contractual DPA with vendor before permitting continued data flows."},{"id":"pass_ropa","severity":"pass","category":"RoPA Inventory","statutory_reference":"NDPA Sec 24","issue":"RoPA inventory active with 5 mapped business processing operations.","remediation":"Continue regular quarterly review cycle with department champions."},{"id":"pass_cmp","severity":"pass","category":"Consent & Cookie CMP","statutory_reference":"NDPA Sec 26","issue":"Zero-GTM Script Gating and Cookie Banner active (12 proofs logged).","remediation":"Telemetry actively synced with immutable consent proof ledger."}]}	accepted	\N	bd90e5d69ddeea03536772090b82992ee6d718ae0373cbec0429ee12bdd9938a	2026-09-05 19:45:11	2026-09-05 19:45:11
01a0731a-83ec-723e-887b-0f82fc7fdde8	43e9a4fc-3db7-488c-afef-135689b1c27f	01a06c84-f877-7130-9148-643491c6fa49	statutory_compliance_scan	Ketch-Privacy-Agent-V2.4	520	410	0.97	{"ropa_total":5,"dpia_total":1,"dsar_total":2,"vendor_total":3,"cookie_active":true}	{"score":85,"findings":[{"id":"gap_v_dpa","severity":"critical","category":"Vendor Risk (TPRM)","statutory_reference":"NDPA 2023 Sec 42 & Art 28 GDPR","issue":"1 third-party data processor(s) lack signed Data Processing Agreements (DPA).","remediation":"Execute standard contractual DPA with vendor before permitting continued data flows."},{"id":"pass_ropa","severity":"pass","category":"RoPA Inventory","statutory_reference":"NDPA Sec 24","issue":"RoPA inventory active with 5 mapped business processing operations.","remediation":"Continue regular quarterly review cycle with department champions."},{"id":"pass_cmp","severity":"pass","category":"Consent & Cookie CMP","statutory_reference":"NDPA Sec 26","issue":"Zero-GTM Script Gating and Cookie Banner active (12 proofs logged).","remediation":"Telemetry actively synced with immutable consent proof ledger."}]}	accepted	\N	88fc421866e29334e8cbdf80a4b8c674e85d023ed6be265d781bc4660d02bf08	2026-09-05 19:45:12	2026-09-05 19:45:12
01a0731b-af69-73d4-aeeb-610fec154829	43e9a4fc-3db7-488c-afef-135689b1c27f	01a06c84-f877-7130-9148-643491c6fa49	statutory_compliance_scan	Ketch-Privacy-Agent-V2.4	520	410	0.97	{"ropa_total":5,"dpia_total":1,"dsar_total":2,"vendor_total":3,"cookie_active":true}	{"score":85,"findings":[{"id":"gap_v_dpa","severity":"critical","category":"Vendor Risk (TPRM)","statutory_reference":"NDPA 2023 Sec 42 & Art 28 GDPR","issue":"1 third-party data processor(s) lack signed Data Processing Agreements (DPA).","remediation":"Execute standard contractual DPA with vendor before permitting continued data flows."},{"id":"pass_ropa","severity":"pass","category":"RoPA Inventory","statutory_reference":"NDPA Sec 24","issue":"RoPA inventory active with 5 mapped business processing operations.","remediation":"Continue regular quarterly review cycle with department champions."},{"id":"pass_cmp","severity":"pass","category":"Consent & Cookie CMP","statutory_reference":"NDPA Sec 26","issue":"Zero-GTM Script Gating and Cookie Banner active (12 proofs logged).","remediation":"Telemetry actively synced with immutable consent proof ledger."}]}	accepted	\N	49e1ca215dc23dbce75764f29a06ae0b15d06424618e2aa38cb77ce2cad3700f	2026-09-05 19:46:29	2026-09-05 19:46:29
01a0731b-b3b9-701b-900a-676b7f24e90d	43e9a4fc-3db7-488c-afef-135689b1c27f	01a06c84-f877-7130-9148-643491c6fa49	statutory_compliance_scan	Ketch-Privacy-Agent-V2.4	520	410	0.97	{"ropa_total":5,"dpia_total":1,"dsar_total":2,"vendor_total":3,"cookie_active":true}	{"score":85,"findings":[{"id":"gap_v_dpa","severity":"critical","category":"Vendor Risk (TPRM)","statutory_reference":"NDPA 2023 Sec 42 & Art 28 GDPR","issue":"1 third-party data processor(s) lack signed Data Processing Agreements (DPA).","remediation":"Execute standard contractual DPA with vendor before permitting continued data flows."},{"id":"pass_ropa","severity":"pass","category":"RoPA Inventory","statutory_reference":"NDPA Sec 24","issue":"RoPA inventory active with 5 mapped business processing operations.","remediation":"Continue regular quarterly review cycle with department champions."},{"id":"pass_cmp","severity":"pass","category":"Consent & Cookie CMP","statutory_reference":"NDPA Sec 26","issue":"Zero-GTM Script Gating and Cookie Banner active (12 proofs logged).","remediation":"Telemetry actively synced with immutable consent proof ledger."}]}	accepted	\N	4b44e5c56b7696bafd9a4764ad84ea1852acb99aba23c04394a9e6cf3082834e	2026-09-05 19:46:30	2026-09-05 19:46:30
01a0731c-6bd1-7158-930b-b6594d19e555	43e9a4fc-3db7-488c-afef-135689b1c27f	01a06c84-f877-7130-9148-643491c6fa49	statutory_compliance_scan	Ketch-Privacy-Agent-V2.4	520	410	0.97	{"ropa_total":5,"dpia_total":1,"dsar_total":2,"vendor_total":3,"cookie_active":true}	{"score":85,"findings":[{"id":"gap_v_dpa","severity":"critical","category":"Vendor Risk (TPRM)","statutory_reference":"NDPA 2023 Sec 42 & Art 28 GDPR","issue":"1 third-party data processor(s) lack signed Data Processing Agreements (DPA).","remediation":"Execute standard contractual DPA with vendor before permitting continued data flows."},{"id":"pass_ropa","severity":"pass","category":"RoPA Inventory","statutory_reference":"NDPA Sec 24","issue":"RoPA inventory active with 5 mapped business processing operations.","remediation":"Continue regular quarterly review cycle with department champions."},{"id":"pass_cmp","severity":"pass","category":"Consent & Cookie CMP","statutory_reference":"NDPA Sec 26","issue":"Zero-GTM Script Gating and Cookie Banner active (12 proofs logged).","remediation":"Telemetry actively synced with immutable consent proof ledger."}]}	accepted	\N	190f7e3c889c30b7f220c1372a6d3c17c1a7a6816a88c99fbbc1b30c8fc69c16	2026-09-05 19:47:17	2026-09-05 19:47:17
01a0731c-6ec9-71a7-91fc-f66f6720eb12	43e9a4fc-3db7-488c-afef-135689b1c27f	01a06c84-f877-7130-9148-643491c6fa49	statutory_compliance_scan	Ketch-Privacy-Agent-V2.4	520	410	0.97	{"ropa_total":5,"dpia_total":1,"dsar_total":2,"vendor_total":3,"cookie_active":true}	{"score":85,"findings":[{"id":"gap_v_dpa","severity":"critical","category":"Vendor Risk (TPRM)","statutory_reference":"NDPA 2023 Sec 42 & Art 28 GDPR","issue":"1 third-party data processor(s) lack signed Data Processing Agreements (DPA).","remediation":"Execute standard contractual DPA with vendor before permitting continued data flows."},{"id":"pass_ropa","severity":"pass","category":"RoPA Inventory","statutory_reference":"NDPA Sec 24","issue":"RoPA inventory active with 5 mapped business processing operations.","remediation":"Continue regular quarterly review cycle with department champions."},{"id":"pass_cmp","severity":"pass","category":"Consent & Cookie CMP","statutory_reference":"NDPA Sec 26","issue":"Zero-GTM Script Gating and Cookie Banner active (12 proofs logged).","remediation":"Telemetry actively synced with immutable consent proof ledger."}]}	accepted	\N	cffa444b18cd3ab9343ebba2ec881d2ea719eb79e1fb37ecf36dba4a6c67b9d6	2026-09-05 19:47:18	2026-09-05 19:47:18
01a08681-7a0d-7152-9ec3-2ce810c26e0b	43e9a4fc-3db7-488c-afef-135689b1c27f	01a06c84-f877-7130-9148-643491c6fa49	statutory_compliance_scan	TruePriv-AI-Agent-V2.4	520	410	0.97	{"ropa_total":5,"dpia_total":1,"dsar_total":2,"vendor_total":3,"cookie_active":true}	{"score":70,"findings":[{"id":"gap_v_dpa","severity":"critical","category":"Vendor Risk (TPRM)","statutory_reference":"NDPA 2023 Sec 42 & Art 28 GDPR","issue":"1 third-party data processor(s) lack signed Data Processing Agreements (DPA).","remediation":"Execute standard contractual DPA with vendor before permitting continued data flows."},{"id":"gap_dsar_sla","severity":"critical","category":"Data Subject Rights","statutory_reference":"NDPA 2023 Sec 34 (30-Day SLA)","issue":"1 Subject Access Request(s) exceed the statutory 30-day fulfillment limit.","remediation":"Expedite DSAR fulfillment or formally issue statutory extension notice to the data subject."},{"id":"pass_ropa","severity":"pass","category":"RoPA Inventory","statutory_reference":"NDPA Sec 24","issue":"RoPA inventory active with 5 mapped business processing operations.","remediation":"Continue regular quarterly review cycle with department champions."},{"id":"pass_cmp","severity":"pass","category":"Consent & Cookie CMP","statutory_reference":"NDPA Sec 26","issue":"Zero-GTM Script Gating and Cookie Banner active (12 proofs logged).","remediation":"Telemetry actively synced with immutable consent proof ledger."}]}	accepted	\N	6a3effdf2ce7ab171afe2ef964f78cfd8335044a7a88b56658c75f96f24cca7f	2026-09-09 14:10:27	2026-09-09 14:10:27
01a08682-ada7-700e-87b0-2628b90a3fa2	43e9a4fc-3db7-488c-afef-135689b1c27f	01a06c84-f877-7130-9148-643491c6fa49	copilot_statutory_advisory	TruePriv-AI-Agent-V2.4	7	306	0.98	{"prompt":"consent"}	{"answer":"Under **NDPA Section 26**, consent must be freely given, specific, informed, and unambiguous. Pre-ticked checkboxes or implicit browsing consent are non-compliant. With the **TruePriv CMP SDK**, scripts under Analytics and Marketing categories remain gated until the visitor performs an affirmative opt-in."}	accepted	\N	41dd8e77753248bd48fc86370a65cc99ab8d977f424a73d48786565b5758b199	2026-09-09 14:11:46	2026-09-09 14:11:46
01a08683-3b7b-710e-a5e4-a8418440da08	43e9a4fc-3db7-488c-afef-135689b1c27f	01a06c84-f877-7130-9148-643491c6fa49	copilot_statutory_advisory	TruePriv-AI-Agent-V2.4	8	332	0.98	{"prompt":"dpo role"}	{"answer":"The **TruePriv Privacy Agent Network** continuously cross-references your RoPA activities, DPIA assessments, and vendor contracts against the **NDPA 2023 Statutory Framework**. Recommended action: Execute signed DPAs for high-risk vendors and ensure all cross-border hosting operations include approved Standard Contractual Clauses."}	accepted	\N	3ed6dea4cc18118ef21b6fa44806c4f6c2a11549a08a08897f254ea1ccb151f1	2026-09-09 14:12:22	2026-09-09 14:12:22
01a08d04-91e4-7079-961a-0aa8af75094d	43e9a4fc-3db7-488c-afef-135689b1c27f	01a06c84-f877-7130-9148-643491c6fa49	statutory_compliance_scan	TruePriv-AI-Agent-V2.4	520	410	0.97	{"ropa_total":5,"dpia_total":1,"dsar_total":2,"vendor_total":3,"cookie_active":true}	{"score":70,"findings":[{"id":"gap_v_dpa","severity":"critical","category":"Vendor Risk (TPRM)","statutory_reference":"NDPA 2023 Sec 42 & Art 28 GDPR","issue":"1 third-party data processor(s) lack signed Data Processing Agreements (DPA).","remediation":"Execute standard contractual DPA with vendor before permitting continued data flows."},{"id":"gap_dsar_sla","severity":"critical","category":"Data Subject Rights","statutory_reference":"NDPA 2023 Sec 34 (30-Day SLA)","issue":"1 Subject Access Request(s) exceed the statutory 30-day fulfillment limit.","remediation":"Expedite DSAR fulfillment or formally issue statutory extension notice to the data subject."},{"id":"pass_ropa","severity":"pass","category":"RoPA Inventory","statutory_reference":"NDPA Sec 24","issue":"RoPA inventory active with 5 mapped business processing operations.","remediation":"Continue regular quarterly review cycle with department champions."},{"id":"pass_cmp","severity":"pass","category":"Consent & Cookie CMP","statutory_reference":"NDPA Sec 26","issue":"Zero-GTM Script Gating and Cookie Banner active (12 proofs logged).","remediation":"Telemetry actively synced with immutable consent proof ledger."}]}	accepted	\N	e50f480776a68a23aa6a98b30ce73ebe73a17684a3a582e068ed957c3743cea7	2026-09-10 20:31:22	2026-09-10 20:31:22
\.


--
-- Data for Name: approvals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.approvals (id, tenant_id, signable_type, signable_id, signer_user_id, signer_role, signature_hash, ip_address, user_agent, signed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_checklist_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_checklist_items (id, audit_project_id, domain, section_code, question, guidance, status, max_points, awarded_points, auditor_findings, client_notes, created_at, updated_at) FROM stdin;
01a06c85-012d-707f-8462-3c795eccf0f3	01a06c85-0126-7303-a590-4b9b2839ee57	governance_accountability	NDPA-SEC-24	Has the organization formally designated a qualified Data Protection Officer (DPO) and registered with the NDPC?	Verify formal appointment letter, board approval minute, and NDPC registration certificate.	compliant	5	5.00	DPO formally appointed by Board of Directors on 15 Jan 2026. Registration ref NDPC/DCMI/2026/0891 verified.	Appointment letter and board charter attached in evidence vault.	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-0132-705f-a298-69d3817c2609	01a06c85-0126-7303-a590-4b9b2839ee57	security_measures	NDPA-SEC-39	Are technical and organizational measures implemented to protect personal data against unauthorized access, loss, or alteration (Encryption, MFA, Access Controls)?	Review network architecture diagrams, AES-256 encryption status for databases, and recent vulnerability assessment report.	compliant	5	4.50	AES-256 encryption verified on primary database. MFA enforced on all administrative portals.	\N	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-0135-7374-bf9c-c2da9368a637	01a06c85-0126-7303-a590-4b9b2839ee57	third_party_processors	NDPA-SEC-29	Are binding Data Processing Agreements (DPAs) executed with all third-party vendors handling customer personal data?	Inspect signed DPAs for cloud providers, payment gateways, and IT support contractors.	partially_compliant	5	2.50	DPAs executed with Smile Identity and Interswitch. Outstanding DPA with secondary SMS gateway vendor.	\N	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-0138-7394-8b79-2edff8a485be	01a06c85-0126-7303-a590-4b9b2839ee57	data_subject_rights	NDPA-SEC-34	Is there an operational mechanism for data subjects to exercise their access, rectification, and erasure rights within 30 days?	Review DSAR intake portal, ticketing log, and average SLA resolution timeline.	compliant	5	4.00	Automated DSAR portal live on website. 3 requests processed within statutory 30-day timeline.	\N	2026-09-04 13:04:11	2026-09-04 13:04:11
\.


--
-- Data for Name: audit_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_comments (id, audit_project_id, finding_id, user_id, comment_text, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_evidences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_evidences (id, audit_project_id, checklist_item_id, file_title, file_path, file_type, file_size, uploaded_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_findings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_findings (id, audit_project_id, checklist_item_id, title, description, severity, recommendation, remediation_plan, assigned_to, target_resolution_date, resolved_at, status, created_at, updated_at) FROM stdin;
01a06c85-013d-7087-9db4-0e2b4a00c4c1	01a06c85-0126-7303-a590-4b9b2839ee57	01a06c85-0135-7374-bf9c-c2da9368a637	Missing Data Processing Agreement (DPA) with Bulk SMS Gateway Vendor	During audit fieldwork, it was observed that SMS Gateway Provider X receives customer phone numbers and OTP payloads without an executed NDPA-compliant Data Processing Agreement.	high	Execute standard DPCO-approved DPA template with SMS Provider X specifying data protection obligations, sub-processor restrictions, and breach notification SLAs within 7 days.	Legal team has dispatched standard DPA contract to vendor on 20 Aug 2026. Awaiting counter-signature.	01a06c84-f877-7130-9148-643491c6fa49	2026-09-18	\N	in_remediation	2026-09-04 13:04:11	2026-09-04 13:04:11
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, tenant_id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at) FROM stdin;
1	b6d90ec7-19ed-4d58-8473-8110f01ab33c	01a06c84-f5f0-71f7-91fd-33b1d9d711ae	auth.login_success	App\\Models\\SystemEvent	6cde295c-b206-4d43-8ab7-6b1e1d576a3f	\N	{"actor_name":"Tunde Bakare","actor_role":"corporate_admin","summary":"Admin session initialized via Sanctum Bearer token"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0	2026-09-04 13:15:20
2	b6d90ec7-19ed-4d58-8473-8110f01ab33c	01a06c84-f5f0-71f7-91fd-33b1d9d711ae	ropa.template_applied	App\\Models\\SystemEvent	0c0102a6-adf8-40b5-81d5-694f83f3df78	\N	{"actor_name":"Amina Bello","actor_role":"compliance_officer","summary":"Fintech Payments processing preset applied (3 activities initialized)"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0	2026-09-04 13:09:20
3	b6d90ec7-19ed-4d58-8473-8110f01ab33c	01a06c84-f5f0-71f7-91fd-33b1d9d711ae	dpia.assessment_signed	App\\Models\\SystemEvent	4e501e5e-d13b-4006-92c0-6b640d97449c	\N	{"actor_name":"Lead DPO Consultant","actor_role":"outsourced_dpo","summary":"DPIA #8f9b2c3d signed with SHA-256 digital stamp"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0	2026-09-04 13:02:20
4	b6d90ec7-19ed-4d58-8473-8110f01ab33c	01a06c84-f5f0-71f7-91fd-33b1d9d711ae	dsar.ticket_received	App\\Models\\SystemEvent	900b57ef-c0f1-416d-8d15-0af11e4659d5	\N	{"actor_name":"Public DSAR Desk","actor_role":"system","summary":"New Right of Access request ticket #DSAR-2026-0891 registered (30d SLA)"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0	2026-09-04 12:49:20
5	b6d90ec7-19ed-4d58-8473-8110f01ab33c	01a06c84-f5f0-71f7-91fd-33b1d9d711ae	breach.clock_activated	App\\Models\\SystemEvent	55627809-6cd2-4cfb-b0c7-8cdcc4af4aef	\N	{"actor_name":"Tunde Bakare","actor_role":"corporate_admin","summary":"Mandatory 72-Hour NDPC incident clock initiated for Unauthorized Credential Stuffing"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0	2026-09-04 12:32:20
6	b6d90ec7-19ed-4d58-8473-8110f01ab33c	01a06c84-f5f0-71f7-91fd-33b1d9d711ae	cookie.consent_logged	App\\Models\\SystemEvent	6cf218b5-986e-4bb7-ae2e-c73e16eedae4	\N	{"actor_name":"SDK Visitor 102.89.44.12","actor_role":"external","summary":"Analytics & Marketing cookie preferences recorded in PostgreSQL binary JSONB"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0	2026-09-04 12:17:20
7	b6d90ec7-19ed-4d58-8473-8110f01ab33c	01a06c84-f5f0-71f7-91fd-33b1d9d711ae	audit.checklist_scored	App\\Models\\SystemEvent	8bddcf34-cd0c-4a94-8736-36de179823a2	\N	{"actor_name":"Vanguard Managing Partner","actor_role":"dpco_lead_auditor","summary":"Governance & Leadership Section 24 scored compliant (10\\/10 pts)"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0	2026-09-04 11:52:20
\.


--
-- Data for Name: audit_projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_projects (id, tenant_id, dpco_firm_id, lead_auditor_id, audit_year, title, scope_description, overall_score, compliance_level, status, dpco_seal_code, ndpc_acknowledgement_ref, executive_summary, certified_at, filed_at, created_at, updated_at) FROM stdin;
01a06c85-0126-7303-a590-4b9b2839ee57	43e9a4fc-3db7-488c-afef-135689b1c27f	ad4e33d6-dd89-46f4-9efd-5875ef39399e	01a06c84-ff26-7013-a812-29d736834779	2026	NDPC Statutory Annual Data Protection Audit 2026	Full-scope statutory compliance audit of Apex Microfinance Bank across all digital banking channels, branch operations, third-party vendor relationships, and IT infrastructure pursuant to NDPA 2023 & NDPC GAID requirements.	78.50	partially_compliant	remediation_in_progress	DPCO-SEAL-2026-APX-883	\N	Apex Microfinance Bank demonstrates substantial progress in governance, data inventory mapping, and technical encryption. Critical remediation is required for cross-border transfer documentation and employee annual refresher training before final filing with NDPC.	\N	\N	2026-09-04 13:04:11	2026-09-04 13:04:11
\.


--
-- Data for Name: breach_playbook_steps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.breach_playbook_steps (id, data_breach_id, step_code, step_name, status, executed_by_user_id, atomic_started_at, atomic_completed_at, playbook_output_data, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache (key, value, expiration) FROM stdin;
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: company_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_profiles (id, tenant_id, cac_rc_number, tax_identification_number, sector, data_protection_officer_name, data_protection_officer_email, mdc_classification_tier, employee_count_bracket, annual_data_subjects_processed, registered_office_address, created_at, updated_at) FROM stdin;
01a06c84-f67e-721e-af5a-10bab09bee51	43e9a4fc-3db7-488c-afef-135689b1c27f	RC-1489201	TIN-29104918-0001	Banking & Financial Technology	Amina Bello	dpo@apexmfb.ng	mdc_high	100-250 employees	150000	Plot 12, Adeola Odeku Street, Victoria Island, Lagos State	2026-09-04 13:04:08	2026-09-04 13:04:08
\.


--
-- Data for Name: cookie_banners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cookie_banners (id, tenant_id, domain, theme_color, "position", privacy_policy_url, company_display_name, custom_notice_text, is_active, created_at, updated_at) FROM stdin;
01a06c85-0169-72eb-944b-345492416292	43e9a4fc-3db7-488c-afef-135689b1c27f	https://apexmfb.ng	#059669	floating_bottom_left	https://apexmfb.ng/privacy	Apex Microfinance Bank	We use necessary cookies for secure online banking and analytics cookies to optimize performance in compliance with NDPA 2023.	t	2026-09-04 13:04:11	2026-09-05 19:49:10
\.


--
-- Data for Name: cookie_consents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cookie_consents (id, tenant_id, visitor_uuid, accepted_categories, ip_hash, user_agent, consented_at, created_at, updated_at) FROM stdin;
01a06c85-016f-71c9-9255-b0158f3514a9	43e9a4fc-3db7-488c-afef-135689b1c27f	4fb7d348-9807-4a63-afe3-1ee660ea20ee	{"necessary":true,"functional":false,"analytics":false,"marketing":false}	81832bfa2897fcf99e5af0a25c40d509d1f9a51380eae9e5ae19fd4cc573dd5c	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36	2026-09-04 09:04:11	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-0175-70f2-84a3-afddb838af75	43e9a4fc-3db7-488c-afef-135689b1c27f	379ef7ee-1d82-4d4d-bcb5-7d82465dc5f8	{"necessary":true,"functional":true,"analytics":false,"marketing":false}	43c42bebfd901726248f2f1a3aa0bf57b53359198b40d7a14e54a028a18f9e03	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36	2026-09-04 05:04:11	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-0178-7344-945e-15c42b5f3369	43e9a4fc-3db7-488c-afef-135689b1c27f	8f3e8acf-49c3-4ffb-ad88-40912188f5ee	{"necessary":true,"functional":false,"analytics":true,"marketing":false}	609a02d14d19a862cb256ff7c11cf382090592761d86d02544a5a0ab7c634434	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36	2026-09-04 01:04:11	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-017b-7354-9c3b-bb9aeb3f2ade	43e9a4fc-3db7-488c-afef-135689b1c27f	0aa5ccd8-a515-4b18-ba58-18f7716d2cb8	{"necessary":true,"functional":true,"analytics":false,"marketing":true}	e68baafc8410c504e924fd5e5add554166a7b46bd3ac030563905e17c5313c7f	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36	2026-09-03 21:04:11	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-017e-7016-a33a-c62bfb3b1294	43e9a4fc-3db7-488c-afef-135689b1c27f	b0c67c78-d25a-433a-a18d-e0855b1d90a6	{"necessary":true,"functional":false,"analytics":false,"marketing":false}	8f75555d6556bc61de6282db9f6602c8d1d8bfa143a646939e2f857b2bb2b3a0	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36	2026-09-03 17:04:11	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-0181-709a-abc1-c95d056b0b27	43e9a4fc-3db7-488c-afef-135689b1c27f	5b7b7137-749e-4baf-9acf-acfa89483dd6	{"necessary":true,"functional":true,"analytics":true,"marketing":false}	b5ec0cba1d9685730ee21f4053c4385cbafb71708b2e47d535c8cffdf8ddbf51	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36	2026-09-03 13:04:11	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-0184-7004-9c26-6d668cc7e32d	43e9a4fc-3db7-488c-afef-135689b1c27f	7da86770-b5c8-48a8-8b36-2f0e8caf5211	{"necessary":true,"functional":false,"analytics":false,"marketing":false}	1b84349e58c774cd4f080fa6e1ffaae01da1d4613b0ab4ae18693bf3974a654f	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36	2026-09-03 09:04:11	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-0186-7147-9a9e-e59a3e3fbdd7	43e9a4fc-3db7-488c-afef-135689b1c27f	391534a0-0ba3-47e4-b8dc-39839ec51138	{"necessary":true,"functional":true,"analytics":false,"marketing":true}	cebd99a86382dd9fcfab37bac3d0d61257ba716e417dd1ea5e26b2a9e7dc4055	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36	2026-09-03 05:04:11	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-018a-7315-aec6-4071dabba1c9	43e9a4fc-3db7-488c-afef-135689b1c27f	77e71614-c73b-4eb1-ae7b-363445bd7528	{"necessary":true,"functional":false,"analytics":true,"marketing":false}	7cce113512333f236f6c3fe78520a5b7b4c5b313db30730a0eda782a103cf103	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36	2026-09-03 01:04:11	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-018d-738e-be15-db3858c8ac56	43e9a4fc-3db7-488c-afef-135689b1c27f	be5b8042-65cb-4965-8865-03b06a14e912	{"necessary":true,"functional":true,"analytics":false,"marketing":false}	33112b8402de2b1d3fb16be26f7ca064874cbde65c995fe4842b77bfc2af0944	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36	2026-09-02 21:04:11	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06ca6-3981-73e1-9131-e1a651084c25	43e9a4fc-3db7-488c-afef-135689b1c27f	vis-test-999	["analytics","marketing"]	e5b38b181764de4d73e681d50bccfbdd9dfa72e1ec75e2eeb2d44d86df3c3f29	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9278	2026-09-04 13:37:42	2026-09-04 13:40:28	2026-09-04 13:40:28
01a06ca6-9ba1-733c-b0da-0ea0f978f651	43e9a4fc-3db7-488c-afef-135689b1c27f	vis-test-999	["analytics","marketing"]	e5b38b181764de4d73e681d50bccfbdd9dfa72e1ec75e2eeb2d44d86df3c3f29	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9278	2026-09-04 13:39:20	2026-09-04 13:40:53	2026-09-04 13:40:53
\.


--
-- Data for Name: cross_border_transfers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cross_border_transfers (id, tenant_id, ropa_activity_id, destination_country_code, destination_country_name, recipient_entity_name, recipient_entity_type, ndpc_transfer_mechanism, safeguard_documentation_ref, annual_transfer_volume_estimate, encryption_in_transit_standard, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: data_breaches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.data_breaches (id, tenant_id, incident_number, title, nature_of_incident, date_time_occurred, date_time_discovered, ndpc_notification_deadline, estimated_affected_subjects, compromised_data_categories, risk_assessment_level, is_ndpc_notified, ndpc_notified_at, ndpc_reference_number, are_subjects_notified, subjects_notified_at, containment_steps_taken, remedial_measures, root_cause_analysis, status, lead_responder_id, created_at, updated_at) FROM stdin;
01a06c91-5b98-70dc-8b26-4b8f6c95bedd	b6d90ec7-19ed-4d58-8473-8110f01ab33c	INC-2026-WR3CK	test	unauthorized_access	\N	2026-09-04 13:17:00	2026-09-07 13:17:00	150	["Customer Names","Masked Phone Numbers","Hashed Passwords","Transaction Reference IDs"]	medium	t	2026-09-04 13:17:46	NDPC/INC/2026/08912	f	\N	API rate limiting applied, impacted sessions terminated, password reset triggered.	Firewall rules tightened, intrusion detection thresholds lowered.	\N	ndpc_notified	01a06c84-f5f0-71f7-91fd-33b1d9d711ae	2026-09-04 13:17:40	2026-09-04 13:17:46
01a06c85-0150-7051-a9e7-6627123cb00b	43e9a4fc-3db7-488c-afef-135689b1c27f	INC-2026-003	Suspicious Credential Stuffing Attempt on Mobile API Gateway	unauthorized_access	2026-09-03 11:04:11	2026-09-03 13:04:11	2026-09-06 13:04:11	140	["Masked Phone Numbers","Hashed Password Attempts","Login IP Geolocation"]	medium	t	2026-09-04 13:30:30	NDPC/INC/2026/08912	f	\N	IP rate limiting enforced on API gateway, automated account lockouts triggered for affected accounts, force password reset initiated for 140 users.	Cloudflare Bot Management rules updated, WAF threshold lowered, customer advisory email prepared.	\N	ndpc_notified	01a06c84-fb17-71e6-a77f-788d4a2c841e	2026-09-04 13:04:11	2026-09-04 13:30:30
01a06c8f-b817-70e6-a4cd-e47e8255b737	43e9a4fc-3db7-488c-afef-135689b1c27f	INC-2026-ZW5RZ	test	unauthorized_access	\N	2026-09-04 13:15:00	2026-09-07 13:15:00	150	["Customer Names","Masked Phone Numbers","Hashed Passwords","Transaction Reference IDs"]	medium	t	2026-09-04 13:30:40	NDPC/INC/2026/08912	f	\N	API rate limiting applied, impacted sessions terminated, password reset triggered.	Firewall rules tightened, intrusion detection thresholds lowered.	\N	ndpc_notified	01a06c84-f877-7130-9148-643491c6fa49	2026-09-04 13:15:53	2026-09-04 13:30:40
01a06d16-5399-7340-8c0e-7b3de506453e	43e9a4fc-3db7-488c-afef-135689b1c27f	INC-2026-RRXIG	test 1	unauthorized_access	\N	2026-09-04 15:42:00	2026-09-07 15:42:00	150	["Customer Names","Masked Phone Numbers","Hashed Passwords","Transaction Reference IDs"]	medium	f	\N	\N	f	\N	API rate limiting applied, impacted sessions terminated, password reset triggered.	Firewall rules tightened, intrusion detection thresholds lowered.	\N	reported_triage	01a06c84-f877-7130-9148-643491c6fa49	2026-09-04 15:42:54	2026-09-04 15:42:54
01a06d16-5f4f-721d-8d5d-88d5174a42e4	43e9a4fc-3db7-488c-afef-135689b1c27f	INC-2026-FDJ89	test 1	unauthorized_access	\N	2026-09-04 15:42:00	2026-09-07 15:42:00	150	["Customer Names","Masked Phone Numbers","Hashed Passwords","Transaction Reference IDs"]	medium	f	\N	\N	f	\N	API rate limiting applied, impacted sessions terminated, password reset triggered.	Firewall rules tightened, intrusion detection thresholds lowered.	\N	reported_triage	01a06c84-f877-7130-9148-643491c6fa49	2026-09-04 15:42:57	2026-09-04 15:42:57
\.


--
-- Data for Name: data_controller_classifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.data_controller_classifications (id, tenant_id, calculated_tier, criteria_evaluated, annual_filing_fee_applicable, mandatory_dpo_required, statutory_audit_mandatory, created_at, updated_at) FROM stdin;
01a06c84-f687-7359-ab31-cfe6e1e016c9	43e9a4fc-3db7-488c-afef-135689b1c27f	mdc_high	{"financial_data":true,"biometric_kyc":true,"records_volume":150000}	250000.00	t	t	2026-09-04 13:04:08	2026-09-04 13:04:08
\.


--
-- Data for Name: dpco_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dpco_profiles (id, tenant_id, ndpc_license_number, managing_partner_name, managing_partner_email, accreditation_year, digital_seal_signature_hash, license_status, created_at, updated_at) FROM stdin;
01a06c84-fd5d-71b0-a00f-91b97c108eca	ad4e33d6-dd89-46f4-9efd-5875ef39399e	NDPC/DPCO/2026/042	Dr. Folake Adeleke	lead.partner@vanguarddpco.ng	2026	SHA256:88391AC9901482E198305F9A88710B6C	active	2026-09-04 13:04:10	2026-09-04 13:04:10
\.


--
-- Data for Name: dpia_assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dpia_assessments (id, tenant_id, ropa_id, title, description, high_risk_reasons, nature_of_processing, necessity_proportionality_check, inherent_likelihood, inherent_impact, inherent_risk_score, inherent_risk_level, mitigation_measures, residual_likelihood, residual_impact, residual_risk_score, residual_risk_level, dpo_recommendations, dpo_sign_off_status, dpco_review_notes, approved_by, approved_at, created_at, updated_at) FROM stdin;
01a06c85-011c-737d-8d27-28ee8cfba4f1	43e9a4fc-3db7-488c-afef-135689b1c27f	01a06c85-010b-7206-acce-1a333a012567	DPIA on Biometric Customer Onboarding & Cloud Verification	Comprehensive impact assessment on collecting facial biometrics and verifying live selfies against the Nigerian National Identity Database (NIMC).	["Processing of biometric data for uniquely identifying individuals (NDPA Sec 30)","Cross-border data transfer to AWS Cloud in Ireland","Large scale processing of financial identity credentials (BVN\\/NIN)"]	Liveness facial match check conducted via mobile SDK, encrypted in transit, cross-referenced with NIMC API via licensed partner.	Necessary to prevent synthetic identity fraud, money laundering, and comply with mandatory CBN Tier 3 KYC directives.	4	4	16	high	["Field-level AES-256 encryption applied before database insertion","Biometric templates deleted immediately after match score calculation","Standard Contractual Clauses executed with cloud provider","Regular penetration testing and NDPC compliant audit trail logging"]	2	2	4	low	The technical safeguards are proportionate. Recommend quarterly review of cloud IAM permissions and keeping the vendor DPA active.	approved	Verified during 2026 DPCO annual audit. Safeguards meet NDPA Section 28 & 39 standards.	01a06c84-fb17-71e6-a77f-788d4a2c841e	2026-08-27 13:04:11	2026-09-04 13:04:11	2026-09-04 13:04:11
\.


--
-- Data for Name: dpo_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dpo_profiles (id, tenant_id, lead_consultant_name, lead_consultant_email, professional_certifications, consulting_tier, active_client_capacity, created_at, updated_at) FROM stdin;
01a06c84-fb21-704c-9264-cc10aae24401	b6d90ec7-19ed-4d58-8473-8110f01ab33c	Barrister Chukwuma Obi	lead.dpo@fortressadvisory.ng	["CDPO (Certified Data Protection Officer)","CIPM","LLM Cyberlaw"]	executive_partner	15	2026-09-04 13:04:09	2026-09-04 13:04:09
\.


--
-- Data for Name: dsar_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dsar_actions (id, dsar_request_id, performed_by_user_id, action_type, action_notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: dsar_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dsar_requests (id, tenant_id, ticket_number, request_type, data_subject_name, data_subject_email, data_subject_phone, subject_relationship, request_details, id_document_path, id_verified, sla_deadline, status, response_summary, rejection_reason, assigned_dpo_id, completed_at, created_at, updated_at) FROM stdin;
01a06c85-0144-7208-9663-49805fbed666	43e9a4fc-3db7-488c-afef-135689b1c27f	DSAR-2026-1049	access_copy	Olumide Adeleke	olumide.adeleke@gmail.com	+2348039911223	customer	I request a complete copy of all my personal data, transaction history, and credit assessment records held on your mobile banking platform.	\N	t	2026-09-22 13:04:11	investigating	\N	\N	01a06c84-fb17-71e6-a77f-788d4a2c841e	\N	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-014a-70e6-8ede-3548ad2b4066	43e9a4fc-3db7-488c-afef-135689b1c27f	DSAR-2026-1050	erasure	Ngozi Eze	ngozi.eze@yahoo.com	+2348051234567	former_customer	I closed my account 2 years ago and request the erasure of my profile and marketing contact information.	\N	t	2026-09-09 13:04:11	action_taken	\N	\N	01a06c84-fb17-71e6-a77f-788d4a2c841e	\N	2026-09-04 13:04:11	2026-09-04 13:04:11
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- Data for Name: guest_invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guest_invitations (id, tenant_id, invited_by_user_id, email, assigned_role, target_department, invitation_token, expires_at, accepted_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: industry_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.industry_templates (id, industry_name, slug, icon, description, default_ropa, default_dpia_triggers, default_policies, created_at, updated_at) FROM stdin;
1	Fintech & Payment Service Providers	fintech-payments	credit-card	Tailored for CBN-licensed PSPs, Mobile Money Operators, Lending Apps, and Digital Wallets under NDPA 2023 & CBN Consumer Protection Framework.	[{"process_name":"Customer Digital Onboarding & KYC \\/ BVN Verification","department":"Compliance & Risk","business_purpose":"Verification of customer identity to prevent fraud and comply with CBN Anti-Money Laundering (AML\\/CFT) & NDPA guidelines.","legal_basis":"legal_obligation","legal_basis_rationale":"NDPA Section 25(1)(b) & CBN AML\\/CFT Regulations 2022","data_subject_categories":["Retail Customers","Corporate Directors","Guarantors"],"personal_data_elements":["Full Name","Date of Birth","Bank Verification Number (BVN)","National Identification Number (NIN)","Facial Biometric Selfie","Residential Address","Utility Bill"],"special_category_data":true,"recipients":["Nigeria Inter-Bank Settlement System (NIBSS)","NIMC","Internal Fraud Monitoring Team"],"has_third_party_processor":true,"third_party_names":["Smile Identity","VerifyMe Nigeria","Amazon Web Services"],"cross_border_transfer":true,"transfer_destination_countries":["Ireland","United States"],"transfer_safeguards":"standard_contractual_clauses","storage_location":"AWS eu-west-1 (Ireland) Encrypted RDS","retention_period":"6 years after account termination (CBN AML standard)","security_measures":"AES-256 field-level encryption for BVN\\/NIN, TLS 1.3 in transit, strict RBAC, automated access audit logging","requires_dpia":true},{"process_name":"Payment Gateway & Card Transaction Processing","department":"Engineering & Payments","business_purpose":"Facilitating debit\\/credit card charges, fund transfers, and settlement payouts.","legal_basis":"contract","legal_basis_rationale":"NDPA Section 25(1)(a) Performance of financial services contract","data_subject_categories":["Cardholders","Merchants","Beneficiaries"],"personal_data_elements":["Primary Account Number (Masked PAN)","Cardholder Name","Expiry Date","Transaction Amount","IP Address","Device Fingerprint"],"special_category_data":false,"recipients":["Card Schemes (Visa, Mastercard, Verve)","Acquiring Banks","NIBSS"],"has_third_party_processor":true,"third_party_names":["Interswitch","Paystack","Flutterwave"],"cross_border_transfer":false,"storage_location":"PCI-DSS Level 1 Compliant Vault (Lagos DC & Dublin)","retention_period":"7 years for financial transaction & tax records","security_measures":"PCI-DSS Level 1 tokenization, HSM key management, real-time transaction monitoring","requires_dpia":false},{"process_name":"Automated Credit Scoring & Alternative Data Underwriting","department":"Credit & Data Science","business_purpose":"Assessing loan eligibility and default probabilities using behavioral and credit bureau history.","legal_basis":"consent","legal_basis_rationale":"NDPA Section 25(1)(a) Explicit consent required for automated decision profiling","data_subject_categories":["Loan Applicants"],"personal_data_elements":["Bank Statement History","Credit Bureau Scores (CRC, FirstCentral)","Device Metadata","SMS Transaction Logs (with consent)","Salary Income"],"special_category_data":false,"recipients":["Credit Bureaus","Underwriting Team"],"has_third_party_processor":true,"third_party_names":["Mono Technologies","Okra Inc","CRC Credit Bureau"],"cross_border_transfer":false,"storage_location":"Local Cloud Database","retention_period":"5 years post loan liquidation","security_measures":"Pseudonymized data lake, restricted algorithmic access, right to human review under NDPA Sec 37","requires_dpia":true},{"process_name":"Employee Payroll & Tax \\/ Pension Administration","department":"Human Resources & Finance","business_purpose":"Monthly compensation disbursement, PAYE tax remittance to LIRS\\/FIRS, and PenCom pension remittance.","legal_basis":"legal_obligation","legal_basis_rationale":"Nigeria Labour Act, Pension Reform Act 2014, and Personal Income Tax Act","data_subject_categories":["Full-time Employees","Contractors"],"personal_data_elements":["Full Name","Bank Account Number","Tax ID (TIN)","Pension RSA PIN","Next of Kin Details","Monthly Salary & Deductions"],"special_category_data":false,"recipients":["Pension Fund Administrators (PFAs)","Lagos State Internal Revenue Service (LIRS)","Commercial Banks"],"has_third_party_processor":true,"third_party_names":["SeamlessHR","Zenith Bank"],"cross_border_transfer":false,"storage_location":"HR Cloud Portal (Encrypted)","retention_period":"7 years following employment termination","security_measures":"Role-based access limited to HR & Finance leads, encrypted backups, MFA","requires_dpia":false},{"process_name":"Customer Care Ticket Resolution & Call Recording","department":"Customer Experience","business_purpose":"Handling customer disputes, technical inquiries, quality assurance, and training.","legal_basis":"legitimate_interest","legal_basis_rationale":"Legitimate interest in maintaining service quality and resolving dispute records under NDPA Sec 25(1)(f)","data_subject_categories":["App Users","Callers"],"personal_data_elements":["Voice Recording","Customer Name","Email","Chat Transcripts","Account ID"],"special_category_data":false,"recipients":["Support Agents","QA Team"],"has_third_party_processor":true,"third_party_names":["Zendesk","Freshworks","Twilio"],"cross_border_transfer":true,"transfer_destination_countries":["United States"],"transfer_safeguards":"standard_contractual_clauses","storage_location":"Zendesk US Data Center","retention_period":"2 years from ticket closure","security_measures":"Pre-call consent announcement, encrypted audio files, role-based ticket permissions","requires_dpia":false}]	["Biometric processing (Facial match against NIMC database)","Automated loan approval algorithms without immediate human review","Large scale processing of financial transaction records"]	["Fintech Consumer Privacy Notice","Data Subject Rights Handling Procedure","Cross-Border Financial Data Transfer Standard"]	2026-09-04 13:04:04	2026-09-04 13:04:04
2	Healthcare, Hospitals & Telemedicine	healthcare-telemedicine	activity	Engineered for hospitals, diagnostic centers, HMOs, and telemedicine platforms handling special category health data under NDPA Sec 30.	[{"process_name":"Patient Medical Records & Electronic Health Record (EHR) Management","department":"Clinical Operations & Records","business_purpose":"Diagnosis, treatment planning, prescription management, and clinical audit.","legal_basis":"vital_interest","legal_basis_rationale":"NDPA Section 25(1)(c) & Section 30(1)(c) for Provision of health care services","data_subject_categories":["Patients","Emergency Contacts","Next of Kin"],"personal_data_elements":["Full Name","Medical History","Lab & Diagnostic Test Results","Blood Group \\/ Genotype","Prescriptions","Biometric Thumbprint"],"special_category_data":true,"recipients":["Attending Physicians","Diagnostic Laboratories","Pharmacy Department"],"has_third_party_processor":true,"third_party_names":["Helium Health","Helium Doc EHR Cloud"],"cross_border_transfer":false,"storage_location":"Encrypted Local Hospital Server & AWS Lagos Local Zone","retention_period":"10 years following last patient contact (Federal Ministry of Health standard)","security_measures":"Strict doctor-patient confidentiality safeguards, access restricted to assigned care team, audit logging of all chart views","requires_dpia":true},{"process_name":"HMO Health Insurance Pre-Authorization & Claims Processing","department":"Billing & Accounts","business_purpose":"Verifying insurance coverage, obtaining procedure pre-authorization, and submitting reimbursement claims.","legal_basis":"contract","legal_basis_rationale":"NDPA Section 25(1)(a) Execution of healthcare insurance policy contract","data_subject_categories":["Insured Enrollees"],"personal_data_elements":["Enrollee Policy Number","Employer Name","ICD-10 Diagnostic Codes","Billed Procedure Amounts"],"special_category_data":true,"recipients":["Health Maintenance Organizations (HMOs)","National Health Insurance Authority (NHIA)"],"has_third_party_processor":true,"third_party_names":["Reliance Health","AXA Mansard Health","Hygeia HMO"],"cross_border_transfer":false,"storage_location":"Secured Cloud Portal","retention_period":"6 years for insurance claims audit","security_measures":"Encrypted EDI claims transmission, role-based access for billing officers","requires_dpia":false}]	["Special category health data and genetic\\/biometric data processing","Telemedicine remote video consultations and recorded diagnostic sessions"]	["Hospital Clinical Data Privacy Notice","Confidentiality & EHR Access Protocol for Medical Personnel"]	2026-09-04 13:04:04	2026-09-04 13:04:04
3	E-Commerce & Digital Marketplaces	ecommerce-retail	shopping-bag	Designed for online stores, logistics delivery platforms, merchant marketplaces, and direct-to-consumer digital brands.	[{"process_name":"Customer Order Fulfillment & Doorstep Delivery","department":"Logistics & Dispatch","business_purpose":"Picking, packaging, and dispatching physical orders to buyer delivery addresses.","legal_basis":"contract","legal_basis_rationale":"NDPA Section 25(1)(a) Fulfillment of commercial sale contract","data_subject_categories":["Online Shoppers"],"personal_data_elements":["Full Name","Delivery Address","Phone Number","Order Items","GPS Coordinates"],"special_category_data":false,"recipients":["Third-party Courier Dispatchers","Fulfillment Center Staff"],"has_third_party_processor":true,"third_party_names":["GIG Logistics","Kwik Delivery","DHL Nigeria"],"cross_border_transfer":false,"storage_location":"E-Commerce Database (Lagos \\/ Frankfurt)","retention_period":"3 years after order completion","security_measures":"Masked customer phone numbers for dispatch riders, TLS encryption on driver mobile apps","requires_dpia":false},{"process_name":"Targeted Marketing, Abandoned Cart Reminders & Newsletters","department":"Growth & Digital Marketing","business_purpose":"Promoting discounts, remarketing abandoned checkout items, and sending product newsletters.","legal_basis":"consent","legal_basis_rationale":"NDPA Section 25(1)(a) & GAID rules for electronic direct marketing","data_subject_categories":["Newsletter Subscribers","Website Visitors"],"personal_data_elements":["Email Address","Browsing History","Wishlist Items","Purchase History"],"special_category_data":false,"recipients":["Marketing Automation Platforms"],"has_third_party_processor":true,"third_party_names":["Mailchimp","Klaviyo","Google Analytics"],"cross_border_transfer":true,"transfer_destination_countries":["United States"],"transfer_safeguards":"standard_contractual_clauses","storage_location":"US Cloud Server","retention_period":"Until consent withdrawal \\/ opt-out","security_measures":"1-click unsubscribe mechanism in all promotional emails, cookie consent banner controls","requires_dpia":false}]	["Large scale customer behavioral tracking and algorithmic recommendation engines","Third-party tracking pixel integrations"]	["E-Commerce Website Privacy Notice","Cookie Policy & Opt-out Guide"]	2026-09-04 13:04:04	2026-09-04 13:04:04
4	Telecommunications & ISPs	telecoms-isps	wifi	Compliant with NCC SIM Registration Regulations and NDPA 2023 for Telcos, Fibre ISPs, and VoIP providers.	[{"process_name":"Subscriber SIM Registration & Biometric Capture","department":"Regulatory Affairs & Field Sales","business_purpose":"Mandatory subscriber registration and NIN linkage under Nigerian Communications Commission (NCC) rules.","legal_basis":"legal_obligation","legal_basis_rationale":"NCC SIM Registration Regulations & NDPA Section 25(1)(b)","data_subject_categories":["Subscribers","SIM Agents"],"personal_data_elements":["Full Name","10 Fingerprint Biometrics","Facial Portrait","NIN","Residential Address","MSISDN Number"],"special_category_data":true,"recipients":["NCC Central Repository","NIMC","Law Enforcement (upon valid court warrant)"],"has_third_party_processor":false,"cross_border_transfer":false,"storage_location":"National Tier III Data Center (Abuja & Lagos)","retention_period":"Duration of active subscription + 5 years post-deactivation","security_measures":"End-to-end encrypted biometric capture kits, HSM-backed verification, zero local device storage","requires_dpia":true}]	["Nationwide biometric subscriber database processing","Cell tower location data and call detail record (CDR) analytics"]	["Subscriber Privacy Notice","Law Enforcement Data Request Handling Procedure"]	2026-09-04 13:04:04	2026-09-04 13:04:04
5	Education & EduTech Platforms	education-edutech	book-open	For universities, private secondary schools, and online learning platforms managing student, parent, and minor records.	[{"process_name":"Student Academic Records, Transcripts & Exam Grading","department":"Academic Affairs & Registry","business_purpose":"Enrollment, grade point assessment, degree certification, and transcript generation.","legal_basis":"contract","legal_basis_rationale":"NDPA Section 25(1)(a) Educational enrollment contract","data_subject_categories":["Students","Minors (under 18 with parental consent)","Parents\\/Guardians"],"personal_data_elements":["Full Name","Matriculation Number","Birth Certificate","Exam Scores & GPA","Parent Contact Information","Passport Photograph"],"special_category_data":false,"recipients":["National Universities Commission (NUC)","JAMB","Academic Registry"],"has_third_party_processor":true,"third_party_names":["Canvas LMS","Google Workspace for Education"],"cross_border_transfer":true,"transfer_destination_countries":["United States","Ireland"],"transfer_safeguards":"standard_contractual_clauses","storage_location":"Encrypted Educational Cloud","retention_period":"Permanent retention for degree verification","security_measures":"Parental consent workflows for minor students under NDPA Sec 31, transcript verification encryption","requires_dpia":false}]	["Processing personal data of children and vulnerable learners (NDPA Section 31)","AI-proctored examination monitoring with webcams and screen recording"]	["Student & Parent Privacy Notice","Child Data Protection & Parental Consent Policy"]	2026-09-04 13:04:04	2026-09-04 13:04:04
\.


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_tenants_table	1
2	0001_01_01_000001_create_users_table	1
3	0001_01_01_000002_create_cache_table	1
4	0001_01_01_000003_create_jobs_table	1
5	2026_08_30_000003_create_tenant_client_organizations_table	1
6	2026_08_30_000004_create_industry_templates_table	1
7	2026_08_30_000005_create_ropa_activities_table	1
8	2026_08_30_000006_create_dpia_assessments_table	1
9	2026_08_30_000007_create_audit_projects_table	1
10	2026_08_30_000008_create_dsar_requests_table	1
11	2026_08_30_000009_create_data_breaches_table	1
12	2026_08_30_000010_create_vendors_table	1
13	2026_08_30_000011_create_cookie_consent_tables	1
14	2026_08_30_000012_create_policies_table	1
15	2026_08_30_000013_create_tenant_profiles_tables	1
16	2026_08_30_000014_create_subscriptions_and_payments_tables	1
17	2026_08_30_000015_create_onboarding_and_classifications_tables	1
18	2026_08_30_000016_create_guest_invitations_table	1
19	2026_08_30_000017_create_dsar_actions_and_audit_comments_tables	1
20	2026_08_30_000018_create_governance_approvals_and_audit_logs_tables	1
21	2026_08_30_161955_create_personal_access_tokens_table	1
22	2026_09_02_000019_add_capacity_metering_and_parent_relations_to_tenants	1
23	2026_09_02_000020_create_ai_decision_logs_table	1
24	2026_09_02_000021_create_omnichannel_consents_table	1
25	2026_09_02_000022_create_cross_border_transfers_and_breach_playbooks_tables	1
26	2026_09_05_192542_add_cookie_category_to_vendors_table	2
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, tenant_id, user_id, title, message, type, action_url, is_read, read_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: omnichannel_consents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.omnichannel_consents (id, tenant_id, data_subject_identifier, channel, channel_session_ref, raw_payload, consent_categories, proof_hash, ip_address, opt_in_timestamp, is_withdrawn, withdrawn_at, created_at, updated_at) FROM stdin;
01a06ca6-6ab0-725f-a0ff-ec1090e65d3e	43e9a4fc-3db7-488c-afef-135689b1c27f	+2348031234567	ussd_session	\N	{"tenant_id":"43e9a4fc-3db7-488c-afef-135689b1c27f","data_subject_identifier":"+2348031234567","channel":"ussd_session","consent_categories":["marketing","profiling"],"ip_address":"127.0.0.1"}	["marketing","profiling"]	15594268d1beeb2208cfacf29e3e6f1b6a328eafccf739268ccd7c08fdd71b9b	127.0.0.1	2026-09-04 13:40:40	f	\N	2026-09-04 13:40:40	2026-09-04 13:40:40
01a06ca6-9f03-7382-8547-52cf250fe6d6	43e9a4fc-3db7-488c-afef-135689b1c27f	+2348031234567	ussd_session	\N	{"tenant_id":"43e9a4fc-3db7-488c-afef-135689b1c27f","data_subject_identifier":"+2348031234567","channel":"ussd_session","consent_categories":["marketing","profiling"],"ip_address":"127.0.0.1"}	["marketing","profiling"]	8321ed5f0e991b2e1df096044325a77c289bfb34e3828a3971a58e7f9d7782f8	127.0.0.1	2026-09-04 13:40:54	f	\N	2026-09-04 13:40:54	2026-09-04 13:40:54
\.


--
-- Data for Name: onboarding_answers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.onboarding_answers (id, tenant_id, question_id, answered_by_user_id, response_boolean, response_text, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: onboarding_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.onboarding_questions (id, category, question_text, explanation_guide, weight_points, is_mandatory, display_order, created_at, updated_at) FROM stdin;
01a06c85-019c-736f-a8f3-73f0010b1d55	Governance & Leadership	Has your organization formally designated a certified Data Protection Officer (DPO) and registered them with the NDPC?	Required under NDPA Section 24 & 32 for Major Data Controllers processing significant volumes of personal data.	10	t	1	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-01a1-701d-905c-f6c3f52710d8	Inventory & RoPA	Does your organization maintain an up-to-date Record of Processing Activities (RoPA) specifying lawful bases and retention schedules?	Mandated by NDPA Section 24 across all departments handling customer, employee, or vendor data.	10	t	2	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-01a3-7174-a341-c0c8525a2613	Data Subject Rights	Do you have an established pipeline to fulfill Data Subject Access Requests (DSARs) within the statutory 30-calendar-day SLA?	Pursuant to NDPA Sections 34-38, data subjects have enforceable rights to access, rectify, or erase their records.	10	t	3	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-01a6-715a-a2f2-2fc67e57395d	Incident Response	Is there a documented 72-hour Data Breach Response Protocol for notifying the NDPC upon discovery of a high-risk security breach?	NDPA Section 40 requires notification to the Commission within 72 hours where feasible.	10	t	4	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-01a8-7380-9ea1-1bffcf847fd1	Third-Party Processors	Do all third-party cloud hosting, payment gateway, and software vendors have executed Data Processing Agreements (DPAs)?	NDPA Section 29 requires binding contractual guarantees from all data processors.	10	t	5	2026-09-04 13:04:11	2026-09-04 13:04:11
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, subscription_id, tenant_id, transaction_reference, payment_gateway, amount_paid, currency, gateway_status, paid_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
23	App\\Models\\User	01a06c84-f877-7130-9148-643491c6fa49	auth-token	f2713f23aa840ddae2f836b9e6278e260bb4bdfb7379f6341a4c90ddfaeb526c	["*"]	2026-09-09 14:04:15	2026-09-09 23:42:35	2026-09-09 11:42:35	2026-09-09 14:04:15
18	App\\Models\\User	01a06c84-ff26-7013-a812-29d736834779	auth-token	01db3242c4219c02420708681065e3ab149001a4290e10ee7e01fac0b5c94017	["*"]	2026-09-05 20:24:40	2026-09-06 07:51:26	2026-09-05 19:51:26	2026-09-05 20:24:40
20	App\\Models\\User	01a06c84-f877-7130-9148-643491c6fa49	auth-token	269f90e6463b3a1e38b9e2a175917c650ea5a6db62a1f5b0be1ddadc7d6cac3f	["*"]	2026-09-09 11:42:43	2026-09-09 23:42:20	2026-09-09 11:42:20	2026-09-09 11:42:43
11	App\\Models\\User	01a06c84-f877-7130-9148-643491c6fa49	auth-token	48585226d1dad4eb06b9be73de0ae0a5e5cc7055d933f0c3319807df2d74f599	["*"]	2026-09-04 15:30:22	2026-09-05 01:22:42	2026-09-04 13:22:42	2026-09-04 15:30:22
21	App\\Models\\User	01a06c84-f877-7130-9148-643491c6fa49	auth-token	2368181379fccea44bf34735055b091ee1ac00b364f3b620de002c0aec5c494f	["*"]	2026-09-09 11:42:51	2026-09-09 23:42:25	2026-09-09 11:42:25	2026-09-09 11:42:51
26	App\\Models\\User	01a06c84-f5f0-71f7-91fd-33b1d9d711ae	auth-token	c6a2bacd1132772d5424a454cd7396669f632f6a2d73606a03f2471ea8c9b502	["*"]	\N	2026-09-10 02:07:22	2026-09-09 14:07:22	2026-09-09 14:07:22
22	App\\Models\\User	01a06c84-fd57-71a2-85b0-9202bc6b6f5b	auth-token	91c745e8662aa89bc597e37c24f6160619d9e7a6351efddf333fbbaaf8e6214c	["*"]	2026-09-09 11:42:56	2026-09-09 23:42:30	2026-09-09 11:42:30	2026-09-09 11:42:56
27	App\\Models\\User	01a06c84-f877-7130-9148-643491c6fa49	auth-token	42ae9a0bb24e9fc95b59246f2bbf4d287c5d97c91ff54136081bd7059da343e1	["*"]	\N	2026-09-10 02:07:31	2026-09-09 14:07:31	2026-09-09 14:07:31
12	App\\Models\\User	01a06c84-f877-7130-9148-643491c6fa49	auth-token	4fa1b6c5684274f60bb0ae50454703a3fc64fcdc19e714002071c4336dc1c4ae	["*"]	2026-09-04 18:01:37	2026-09-05 03:42:16	2026-09-04 15:42:16	2026-09-04 18:01:37
14	App\\Models\\User	01a06c84-f5f0-71f7-91fd-33b1d9d711ae	auth-token	e5d97b3c66ae6741cfce584ba9fcf1705077b4af7e152741cd1bd0edc41bed73	["*"]	2026-09-05 19:18:53	2026-09-06 07:18:48	2026-09-05 19:18:48	2026-09-05 19:18:53
31	App\\Models\\User	01a06c84-f877-7130-9148-643491c6fa49	auth-token	f471a3baa509a1821f4f83a236b420632100488691dedb9eee6be3b95604752d	["*"]	2026-09-09 14:14:27	2026-09-10 02:14:26	2026-09-09 14:14:26	2026-09-09 14:14:27
32	App\\Models\\User	01a06c84-f877-7130-9148-643491c6fa49	auth-token	60ee3a6c1a8ace5dfad6e1ab4c788a42720cd0c1cfc027f3e44537d3902c2b40	["*"]	2026-09-10 20:48:20	2026-09-11 08:31:08	2026-09-10 20:31:08	2026-09-10 20:48:20
19	App\\Models\\User	01a06c84-f877-7130-9148-643491c6fa49	auth-token	2b994b19846633811df07db4f34f339a3987608c5b68522705e4e0d814655a28	["*"]	\N	2026-09-06 08:01:02	2026-09-05 20:01:02	2026-09-05 20:01:02
24	App\\Models\\User	01a06c84-f5f0-71f7-91fd-33b1d9d711ae	auth-token	3e347ffe2e9666e534b2d348bf6cd8e787345078e8e9e1f321a2dbe3c6f7221e	["*"]	\N	2026-09-10 01:54:17	2026-09-09 13:54:17	2026-09-09 13:54:17
28	App\\Models\\User	01a06c84-f877-7130-9148-643491c6fa49	auth-token	6bdd541ead38d04ea4c8848644d71e4d2a3befd3c3fd290a4c5687a205eca5d9	["*"]	2026-09-09 14:24:54	2026-09-10 02:08:10	2026-09-09 14:08:10	2026-09-09 14:24:54
25	App\\Models\\User	01a06c84-f877-7130-9148-643491c6fa49	auth-token	cb36464a22fab33073e04d6b71a6d619027a85953499de4e6150e1169e32444f	["*"]	2026-09-09 14:10:29	2026-09-10 02:04:18	2026-09-09 14:04:18	2026-09-09 14:10:29
\.


--
-- Data for Name: policies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.policies (id, tenant_id, title, type, content, version, status, published_at, created_by, created_at, updated_at) FROM stdin;
01a06c85-0192-7000-b034-d248f276ade5	43e9a4fc-3db7-488c-afef-135689b1c27f	Apex MFB Customer Privacy Notice (NDPA 2023 Compliant)	privacy_notice_website	## APEX MICROFINANCE BANK NIGERIA LIMITED\n### CUSTOMER PRIVACY NOTICE (NDPA 2023)\n\n**1. INTRODUCTION**\nApex Microfinance Bank Ltd ("Apex MFB", "we", "us") is committed to safeguarding the personal data of our customers, depositors, loan applicants, and visitors in full compliance with the Nigeria Data Protection Act 2023 (NDPA) and directives of the Nigeria Data Protection Commission (NDPC).\n\n**2. DATA WE COLLECT**\n- Identity Data: Full Name, Date of Birth, BVN, NIN, Passport photo, Facial biometrics.\n- Contact Data: Residential address, Email, Phone number.\n- Financial Data: Bank account records, card tokens, transaction history, loan balances.\n\n**3. LEGAL BASES FOR PROCESSING (NDPA SECTION 25)**\n- Performance of Banking Contract (Section 25(1)(a))\n- Compliance with Legal Obligations under CBN AML/CFT Regulations (Section 25(1)(b))\n- Consent for marketing and automated credit profiling (Section 25(1)(a))\n\n**4. DATA SUBJECT RIGHTS (NDPA SECTIONS 34-38)**\nYou have the right to request access to your records, rectify inaccurate data, request erasure where applicable, object to direct marketing, and request human review of automated credit scoring decisions.\n\n**5. CONTACT OUR DATA PROTECTION OFFICER**\nEmail: dpo@apexmfb.ng | Phone: +2348034567890 | Address: Plot 12, Adeola Odeku St, Victoria Island, Lagos.	1.0	published	2026-08-20 13:04:11	01a06c84-fb17-71e6-a77f-788d4a2c841e	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c95-d2bd-73dd-be22-c0cd817f4e32	ad4e33d6-dd89-46f4-9efd-5875ef39399e	Vanguard Compliance & Audit Partners DPCO Website Privacy Notice (NDPA 2023 Compliant)	privacy_notice_website	## Vanguard Compliance & Audit Partners DPCO\n### STATUTORY PRIVACY NOTICE\n**In Compliance with Nigeria Data Protection Act 2023 (NDPA)**\n\n**1. OVERVIEW & SCOPE**\nThis Privacy Notice explains how Vanguard Compliance & Audit Partners DPCO ("we", "us", "our"), registered under CAC RC No. RC-993812, processes personal data in accordance with the Nigeria Data Protection Act (NDPA 2023).\n\n**2. DATA PROCESSING ACTIVITIES & PURPOSES**\nBased on our Record of Processing Activities (RoPA), we process personal data for the following legitimate purposes:\n- Direct customer service provision, KYC compliance, and technical service delivery.\n\n**3. YOUR STATUTORY RIGHTS UNDER NDPA SECTIONS 34–38**\n- Right to Access & Data Portability\n- Right to Rectification of inaccurate records\n- Right to Erasure ('Right to be Forgotten')\n- Right to Object to automated decision-making and direct marketing.\n\n**4. CONTACT OUR DATA PROTECTION OFFICER (DPO)**\nFor inquiries or to submit a Data Subject Access Request:\n- **DPO Name:** Amina Bello (Certified DPO)\n- **DPO Email:** dpo@apexmfb.ng\n- **Address:** 24A Glover Road, Ikoyi	1.0	draft	\N	01a06c84-ff26-7013-a812-29d736834779	2026-09-04 13:22:33	2026-09-04 13:22:33
01a0731e-b334-727d-b874-d90056bf4312	43e9a4fc-3db7-488c-afef-135689b1c27f	Apex Microfinance Bank Nigeria Ltd Website Privacy Notice (NDPA 2023 Compliant)	privacy_notice_website	## Apex Microfinance Bank Nigeria Ltd\n### STATUTORY PRIVACY NOTICE\n**In Compliance with Nigeria Data Protection Act 2023 (NDPA)**\n\n**1. OVERVIEW & SCOPE**\nThis Privacy Notice explains how Apex Microfinance Bank Nigeria Ltd ("we", "us", "our"), registered under CAC RC No. RC-1489201, processes personal data in accordance with the Nigeria Data Protection Act (NDPA 2023).\n\n**2. DATA PROCESSING ACTIVITIES & PURPOSES**\nBased on our Record of Processing Activities (RoPA), we process personal data for the following legitimate purposes:\n- **HMO Health Insurance Pre-Authorization & Claims Processing**: Legal Basis: CONTRACT | Retention: 6 years for insurance claims audit\n- **Patient Medical Records & Electronic Health Record (EHR) Management**: Legal Basis: VITAL_INTEREST | Retention: 10 years following last patient contact (Federal Ministry of Health standard)\n- **Mobile App Digital Onboarding & KYC (BVN/NIN Verification)**: Legal Basis: LEGAL_OBLIGATION | Retention: 6 years after account closure\n- **AI Micro-Loan Underwriting & Behavioral Credit Profiling**: Legal Basis: CONSENT | Retention: 5 years post full loan liquidation\n- **Debit Card Issuance & NIBSS Instant Settlement**: Legal Basis: CONTRACT | Retention: 7 years for CBN financial ledger standards\n\n**3. YOUR STATUTORY RIGHTS UNDER NDPA SECTIONS 34–38**\n- Right to Access & Data Portability\n- Right to Rectification of inaccurate records\n- Right to Erasure ('Right to be Forgotten')\n- Right to Object to automated decision-making and direct marketing.\n\n**4. CONTACT OUR DATA PROTECTION OFFICER (DPO)**\nFor inquiries or to submit a Data Subject Access Request:\n- **DPO Name:** Amina Bello (Certified DPO)\n- **DPO Email:** dpo@apexmfb.ng\n- **Address:** Plot 12, Adeola Odeku Street, Victoria Island	1.0	draft	\N	01a06c84-f877-7130-9148-643491c6fa49	2026-09-05 19:49:46	2026-09-05 19:49:46
\.


--
-- Data for Name: ropa_activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ropa_activities (id, tenant_id, process_name, department, business_purpose, legal_basis, legal_basis_rationale, data_subject_categories, personal_data_elements, special_category_data, recipients, has_third_party_processor, third_party_names, cross_border_transfer, transfer_destination_countries, transfer_safeguards, storage_location, retention_period, security_measures, requires_dpia, status, reviewed_by, approved_at, created_at, updated_at) FROM stdin;
01a06c85-010b-7206-acce-1a333a012567	43e9a4fc-3db7-488c-afef-135689b1c27f	Mobile App Digital Onboarding & KYC (BVN/NIN Verification)	Compliance & Risk	Customer identification and verification in compliance with CBN AML/CFT 2022 and NDPA 2023 regulations.	legal_obligation	NDPA Section 25(1)(b) & CBN AML/CFT Regulations	["Retail Bank Customers","Account Signatories"]	["Full Name","BVN","NIN","Facial Biometric Selfie","Residential Address","Date of Birth"]	t	["NIBSS","NIMC","Fraud Analytics Unit"]	t	["Smile Identity","AWS Ireland"]	t	["Ireland"]	standard_contractual_clauses	AWS eu-west-1 (Ireland) Encrypted DB	6 years after account closure	AES-256 field level encryption, TLS 1.3, strict IAM roles, periodic key rotation	t	approved_active	01a06c84-fb17-71e6-a77f-788d4a2c841e	2026-08-23 13:04:10	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-0110-7076-8738-eebe609fa24a	43e9a4fc-3db7-488c-afef-135689b1c27f	Debit Card Issuance & NIBSS Instant Settlement	Treasury & Payments	Processing POS transactions, ATM withdrawals, and web payments across Nigeria.	contract	NDPA Section 25(1)(a) Performance of cardholder agreement	["Cardholders"]	["Masked PAN","Cardholder Name","Expiry Date","Transaction Amounts","Terminal ID"]	f	["Interswitch","Mastercard Scheme","NIBSS"]	t	["Interswitch Nigeria","Paystack"]	f	\N	\N	Tier III Lagos Data Center	7 years for CBN financial ledger standards	PCI-DSS Level 1 compliance, HSM encryption, 3D Secure 2.0 OTP	f	approved_active	01a06c84-fb17-71e6-a77f-788d4a2c841e	2026-08-25 13:04:11	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c85-0115-71d2-8655-7afb2ae29614	43e9a4fc-3db7-488c-afef-135689b1c27f	AI Micro-Loan Underwriting & Behavioral Credit Profiling	Credit & Data Science	Automated risk scoring to approve instant mobile loans up to N500,000 without collateral.	consent	NDPA Section 25(1)(a) Explicit consent for automated profile decisioning	["Loan Applicants"]	["Credit Bureau Records","Bank Statement Aggregates","Device Telemetry","SMS Financial Alerts (Consented)"]	f	["Credit Bureaus (CRC, FirstCentral)"]	t	["Mono Technologies","Okra"]	f	\N	\N	Lagos Hybrid Cloud	5 years post full loan liquidation	Pseudonymized data lake, model explainability logs, human appeal mechanism	t	verified_by_dpo	01a06c84-fb17-71e6-a77f-788d4a2c841e	\N	2026-09-04 13:04:11	2026-09-04 13:04:11
01a06c96-5247-7145-9783-e2c0b55e1851	43e9a4fc-3db7-488c-afef-135689b1c27f	Patient Medical Records & Electronic Health Record (EHR) Management	Clinical Operations & Records	Diagnosis, treatment planning, prescription management, and clinical audit.	vital_interest	NDPA Section 25(1)(c) & Section 30(1)(c) for Provision of health care services	["Patients","Emergency Contacts","Next of Kin"]	["Full Name","Medical History","Lab & Diagnostic Test Results","Blood Group \\/ Genotype","Prescriptions","Biometric Thumbprint"]	t	["Attending Physicians","Diagnostic Laboratories","Pharmacy Department"]	t	["Helium Health","Helium Doc EHR Cloud"]	f	[]	\N	Encrypted Local Hospital Server & AWS Lagos Local Zone	10 years following last patient contact (Federal Ministry of Health standard)	Strict doctor-patient confidentiality safeguards, access restricted to assigned care team, audit logging of all chart views	t	draft	\N	\N	2026-09-04 13:23:05	2026-09-04 13:23:05
01a06c96-524b-72c5-9be6-6c6d61d0d298	43e9a4fc-3db7-488c-afef-135689b1c27f	HMO Health Insurance Pre-Authorization & Claims Processing	Billing & Accounts	Verifying insurance coverage, obtaining procedure pre-authorization, and submitting reimbursement claims.	contract	NDPA Section 25(1)(a) Execution of healthcare insurance policy contract	["Insured Enrollees"]	["Enrollee Policy Number","Employer Name","ICD-10 Diagnostic Codes","Billed Procedure Amounts"]	t	["Health Maintenance Organizations (HMOs)","National Health Insurance Authority (NHIA)"]	t	["Reliance Health","AXA Mansard Health","Hygeia HMO"]	f	[]	\N	Secured Cloud Portal	6 years for insurance claims audit	Encrypted EDI claims transmission, role-based access for billing officers	f	verified_by_dpo	01a06c84-f877-7130-9148-643491c6fa49	\N	2026-09-04 13:23:05	2026-09-04 13:23:14
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
zxvOS5X0nFmosltmV4oRYAGa3dP1LsgtSNUu8ExS	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36 (compatible; +https://developers.cloudflare.com/security-center/)	YToyOntzOjY6Il90b2tlbiI7czo0MDoiWndSRzIyVXFtajNkbE9kZThsVjdYYjQwTVVNdkRWYVZvY2Vib3FwcSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1788967359
bzwtIChHJSQiDtD7mk7YEXAiEOdwAblI0GgmNbYc	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36 (compatible; +https://developers.cloudflare.com/security-center/)	YToyOntzOjY6Il90b2tlbiI7czo0MDoiSXNQTTJBeXhaaUxtUmRVSGkzVldJb2NLT0FpR2RaaUh0aTU4ZWJJZSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1788967360
NuoWffdzmay9tdACQ5XaTLi1DzodDdoHvqKaZevV	\N	127.0.0.1	RecordedFuture Global Inventory Crawler	YTozOntzOjY6Il90b2tlbiI7czo0MDoiS0ZjUTBIS2RwRklXRWZVcUM3Qm03dnJMV3pKWlBDUVB2SkZYWGxzWCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NjA6Imh0dHA6Ly9hc3AtY29udGFjdHMtc3RydWN0dXJlZC1hY2NvcmRpbmdseS50cnljbG91ZGZsYXJlLmNvbSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1788967443
npl6CoftDLsEDsSlF6iB3UASD37j0ECHIRG7BFry	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoicUttaFE4aWYyYkpGQ2NkT1cxVmxnMDRyUVIwbkJwU1lHZ3J0R2dyZSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NjA6Imh0dHA6Ly9hc3AtY29udGFjdHMtc3RydWN0dXJlZC1hY2NvcmRpbmdseS50cnljbG91ZGZsYXJlLmNvbSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1788975436
7YyDOyo7YarH9cPWQhS4m4t2iExNcLgWX2u6cdhv	\N	127.0.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiVFN6Q1ZxWmxYWnhhbFNEc005Z29yVTh4dndYRktTMWp5VHVlaEtGTiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NjA6Imh0dHA6Ly9hc3AtY29udGFjdHMtc3RydWN0dXJlZC1hY2NvcmRpbmdseS50cnljbG91ZGZsYXJlLmNvbSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1788984749
oWnjampLeZDWUVmaLsX9Pa0tBDRWXCXUD93ZVtkG	\N	127.0.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiWVNUb0xrODJkejBRZGhMVWZYMmtQc0FOamJ6TWgxMjhKSXZaZEdEYSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NjA6Imh0dHA6Ly9hc3AtY29udGFjdHMtc3RydWN0dXJlZC1hY2NvcmRpbmdseS50cnljbG91ZGZsYXJlLmNvbSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1788984751
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, tenant_id, plan_tier, billing_cycle, price_ngn, status, current_period_start, current_period_end, created_at, updated_at) FROM stdin;
01a06c84-f691-7315-8e4b-fd33f105ef41	43e9a4fc-3db7-488c-afef-135689b1c27f	growth_enterprise	annual	1500000.00	active	2026-01-01 00:00:00	2026-12-31 23:59:59	2026-09-04 13:04:08	2026-09-04 13:04:08
\.


--
-- Data for Name: tenant_client_organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant_client_organizations (id, parent_tenant_id, client_tenant_id, contract_ref, service_scope, assigned_lead_auditor_id, status, engagement_start_date, engagement_end_date, created_at, updated_at) FROM stdin;
01a06c85-00e4-7353-b0ac-1e991d4257c3	ad4e33d6-dd89-46f4-9efd-5875ef39399e	43e9a4fc-3db7-488c-afef-135689b1c27f	DPCO-2026-APX-01	annual_audit_filing	01a06c84-ff26-7013-a812-29d736834779	active	2026-01-10	2026-12-31	2026-09-04 13:04:10	2026-09-04 13:04:10
01a06c85-00eb-71a4-8d97-65db508e47a6	ad4e33d6-dd89-46f4-9efd-5875ef39399e	42dcde0f-1631-4bac-950e-d5c461d9dbfd	DPCO-2026-HLT-02	annual_audit_filing	01a06c84-ff26-7013-a812-29d736834779	active	2026-02-01	2026-12-31	2026-09-04 13:04:10	2026-09-04 13:04:10
01a06c85-00ed-7307-b186-59e70bff6afd	b6d90ec7-19ed-4d58-8473-8110f01ab33c	43e9a4fc-3db7-488c-afef-135689b1c27f	DPOaaS-2026-APX	full_dpo_as_a_service	01a06c84-fd57-71a2-85b0-9202bc6b6f5b	active	2026-01-01	2026-12-31	2026-09-04 13:04:10	2026-09-04 13:04:10
01a06c85-00f0-7276-952d-6b4373522fce	b6d90ec7-19ed-4d58-8473-8110f01ab33c	fc84d99f-5c77-4ed2-a77d-1eae74be4cc5	DPOaaS-2026-SWF	full_dpo_as_a_service	01a06c84-fd57-71a2-85b0-9202bc6b6f5b	active	2026-01-15	2026-12-31	2026-09-04 13:04:10	2026-09-04 13:04:10
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, name, slug, type, industry, rc_number, ndpc_registration_number, dpco_license_number, contact_email, contact_phone, address, state, data_residency, compliance_score, settings, is_active, created_at, updated_at, parent_tenant_id, tenant_tier, feature_flags, data_subject_quota, monthly_dsar_limit, monthly_breach_limit, usage_metrics) FROM stdin;
43e9a4fc-3db7-488c-afef-135689b1c27f	Apex Microfinance Bank Nigeria Ltd	apex-mfb	corporate	Fintech & Payment Service Providers	RC-1489201	NDPC/DCMI/2026/0891	\N	compliance@apexmfb.ng	+2348023456789	Plot 12, Adeola Odeku Street, Victoria Island	Lagos	local_nigeria	78.50	{"primary_color":"#059669","logo_url":"\\/logos\\/apex-logo.svg","notify_on_breach":true,"notify_on_dsar":true}	t	2026-09-04 13:04:08	2026-09-04 13:04:08	\N	independent_corporate	\N	50000	999999	999999	\N
b6d90ec7-19ed-4d58-8473-8110f01ab33c	Fortress Data Protection Advisory LLP	fortress-dpo	outsourced_dpo	Legal & Compliance Consulting	RC-2049182	\N	\N	contact@fortressadvisory.ng	+2348055667788	8th Floor, Churchgate Tower, Central Business District	Abuja FCT	local_nigeria	0.00	\N	t	2026-09-04 13:04:09	2026-09-04 13:04:09	\N	independent_corporate	\N	50000	999999	999999	\N
ad4e33d6-dd89-46f4-9efd-5875ef39399e	Vanguard Compliance & Audit Partners DPCO	vanguard-dpco	dpco_firm	Audit, Assurance & DPCO Certification	RC-993812	\N	NDPC/DPCO/2026/042	audit@vanguarddpco.ng	+2348077889900	24A Glover Road, Ikoyi	Lagos	local_nigeria	0.00	\N	t	2026-09-04 13:04:10	2026-09-04 13:04:10	\N	independent_corporate	\N	50000	999999	999999	\N
42dcde0f-1631-4bac-950e-d5c461d9dbfd	HealthPoint Telemedicine Nigeria Ltd	healthpoint-ng	corporate	Healthcare, Hospitals & Telemedicine	RC-1678234	\N	\N	\N	\N	\N	Lagos	local_nigeria	64.00	\N	t	2026-09-04 13:04:10	2026-09-04 13:04:10	\N	independent_corporate	\N	50000	999999	999999	\N
fc84d99f-5c77-4ed2-a77d-1eae74be4cc5	SwiftExpress Logistics Global Services	swiftexpress-ng	corporate	E-Commerce & Digital Marketplaces	RC-1554902	\N	\N	\N	\N	\N	Rivers	local_nigeria	88.00	\N	t	2026-09-04 13:04:10	2026-09-04 13:04:10	\N	independent_corporate	\N	50000	999999	999999	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, tenant_id, name, email, email_verified_at, password, role, department, phone, avatar_url, is_active, remember_token, created_at, updated_at) FROM stdin;
01a06c84-f5f0-71f7-91fd-33b1d9d711ae	\N	System Administrator	admin@dpodpco.ng	\N	$2y$12$RBeKy5aB6WmIDRfAOENu..rNXPuMbV.2KHUtjO4iJBmVOpleJsaKy	super_admin	Executive	+2348011223344	\N	t	\N	2026-09-04 13:04:08	2026-09-04 13:04:08
01a06c84-f877-7130-9148-643491c6fa49	43e9a4fc-3db7-488c-afef-135689b1c27f	Tunde Bakare	compliance@apexmfb.ng	\N	$2y$12$xANZHjZtZb425faplSU4C.n5dDl8WEENbEOM9jC1jrjdYXqKtycIm	corporate_admin	Compliance & Legal	+2348023456789	\N	t	\N	2026-09-04 13:04:08	2026-09-04 13:04:08
01a06c84-fb17-71e6-a77f-788d4a2c841e	43e9a4fc-3db7-488c-afef-135689b1c27f	Amina Bello (Internal DPO)	dpo@apexmfb.ng	\N	$2y$12$OpVI.D5YCZffalTiU0XuWuG5ReK0ACyHXlRW0pbcW5PGg4bcyr5au	compliance_officer	Risk & Compliance	+2348034567890	\N	t	\N	2026-09-04 13:04:09	2026-09-04 13:04:09
01a06c84-fd57-71a2-85b0-9202bc6b6f5b	b6d90ec7-19ed-4d58-8473-8110f01ab33c	Barrister Chukwuma Obi (Lead DPO)	lead.dpo@fortressadvisory.ng	\N	$2y$12$eAmLqQomi1irorWneufzpOMb.zBU38GoB8im4jc4bCCC2tX1B2KS6	outsourced_dpo	DPO Advisory Practice	+2348055667788	\N	t	\N	2026-09-04 13:04:10	2026-09-04 13:04:10
01a06c84-ff26-7013-a812-29d736834779	ad4e33d6-dd89-46f4-9efd-5875ef39399e	Dr. Folake Adeleke (Managing DPCO Partner)	lead.partner@vanguarddpco.ng	\N	$2y$12$vvp34nAN.qTXtcTvitAJXOsMO585bSVkEwqLh8rWhIh2K.Pq4MBkO	dpco_lead_auditor	Statutory Audit Practice	+2348077889900	\N	t	\N	2026-09-04 13:04:10	2026-09-04 13:04:10
01a06c85-00d9-72a4-b3f0-97d0420ff01c	ad4e33d6-dd89-46f4-9efd-5875ef39399e	Emeka Nwosu (Senior Auditor)	auditor1@vanguarddpco.ng	\N	$2y$12$oOB5vVD/sTVb8iNibqQ0juONXc6kZDXvPkwMtMaOmxMC/.PS0M7r2	dpco_staff	Assurance & Fieldwork	+2348088990011	\N	t	\N	2026-09-04 13:04:10	2026-09-04 13:04:10
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendors (id, tenant_id, vendor_name, service_category, contact_person, contact_email, contact_phone, data_types_processed, dpa_signed, dpa_signed_date, dpa_file_path, risk_rating, hosting_country, is_cross_border, last_assessment_date, status, created_at, updated_at, cookie_category, cookies_detected) FROM stdin;
01a06c85-0159-7104-965b-74e5f511008b	43e9a4fc-3db7-488c-afef-135689b1c27f	Smile Identity Nigeria Ltd	Biometric KYC & Identity Verification	Segun Alabi	partnerships@smileidentity.com	\N	["NIN","BVN","Facial Biometric Selfies","Full Names"]	t	2025-11-15	\N	low	Ireland / Nigeria	t	2026-01-20	active	2026-09-04 13:04:11	2026-09-04 13:04:11	strictly_necessary	\N
01a06c85-0164-7086-8d34-eae8bca9cce5	43e9a4fc-3db7-488c-afef-135689b1c27f	Infobip Global Messaging	Transactional SMS & OTP Delivery	David Mensah	support@infobip.com	\N	["Customer Phone Numbers","SMS Text Messages"]	f	\N	\N	high	United Kingdom	t	2026-01-05	under_review	2026-09-04 13:04:11	2026-09-04 13:04:11	strictly_necessary	\N
01a06c85-0161-70c8-833a-b5b864b63c7b	43e9a4fc-3db7-488c-afef-135689b1c27f	Paystack Payments Ltd	Payment Gateway & Card Tokenization	Folashade Wright	compliance@paystack.com	\N	["Card Tokens","Account Numbers","Email Addresses","Transaction Amounts"]	t	2025-12-01	\N	low	Nigeria	f	2026-02-10	active	2026-09-04 13:04:11	2026-09-05 19:32:25	strictly_necessary	["pstk_session","__cf_bm"]
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 7, true);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: industry_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.industry_templates_id_seq', 5, true);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 4, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 26, true);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 32, true);


--
-- Name: ai_decision_logs ai_decision_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_decision_logs
    ADD CONSTRAINT ai_decision_logs_pkey PRIMARY KEY (id);


--
-- Name: approvals approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_pkey PRIMARY KEY (id);


--
-- Name: audit_checklist_items audit_checklist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_checklist_items
    ADD CONSTRAINT audit_checklist_items_pkey PRIMARY KEY (id);


--
-- Name: audit_comments audit_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_comments
    ADD CONSTRAINT audit_comments_pkey PRIMARY KEY (id);


--
-- Name: audit_evidences audit_evidences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_evidences
    ADD CONSTRAINT audit_evidences_pkey PRIMARY KEY (id);


--
-- Name: audit_findings audit_findings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_findings
    ADD CONSTRAINT audit_findings_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: audit_projects audit_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_projects
    ADD CONSTRAINT audit_projects_pkey PRIMARY KEY (id);


--
-- Name: breach_playbook_steps breach_playbook_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.breach_playbook_steps
    ADD CONSTRAINT breach_playbook_steps_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: company_profiles company_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_pkey PRIMARY KEY (id);


--
-- Name: company_profiles company_profiles_tenant_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_tenant_id_unique UNIQUE (tenant_id);


--
-- Name: cookie_banners cookie_banners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cookie_banners
    ADD CONSTRAINT cookie_banners_pkey PRIMARY KEY (id);


--
-- Name: cookie_consents cookie_consents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cookie_consents
    ADD CONSTRAINT cookie_consents_pkey PRIMARY KEY (id);


--
-- Name: cross_border_transfers cross_border_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cross_border_transfers
    ADD CONSTRAINT cross_border_transfers_pkey PRIMARY KEY (id);


--
-- Name: data_breaches data_breaches_incident_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_breaches
    ADD CONSTRAINT data_breaches_incident_number_unique UNIQUE (incident_number);


--
-- Name: data_breaches data_breaches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_breaches
    ADD CONSTRAINT data_breaches_pkey PRIMARY KEY (id);


--
-- Name: data_controller_classifications data_controller_classifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_controller_classifications
    ADD CONSTRAINT data_controller_classifications_pkey PRIMARY KEY (id);


--
-- Name: dpco_profiles dpco_profiles_ndpc_license_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dpco_profiles
    ADD CONSTRAINT dpco_profiles_ndpc_license_number_unique UNIQUE (ndpc_license_number);


--
-- Name: dpco_profiles dpco_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dpco_profiles
    ADD CONSTRAINT dpco_profiles_pkey PRIMARY KEY (id);


--
-- Name: dpco_profiles dpco_profiles_tenant_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dpco_profiles
    ADD CONSTRAINT dpco_profiles_tenant_id_unique UNIQUE (tenant_id);


--
-- Name: dpia_assessments dpia_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dpia_assessments
    ADD CONSTRAINT dpia_assessments_pkey PRIMARY KEY (id);


--
-- Name: dpo_profiles dpo_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dpo_profiles
    ADD CONSTRAINT dpo_profiles_pkey PRIMARY KEY (id);


--
-- Name: dpo_profiles dpo_profiles_tenant_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dpo_profiles
    ADD CONSTRAINT dpo_profiles_tenant_id_unique UNIQUE (tenant_id);


--
-- Name: dsar_actions dsar_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dsar_actions
    ADD CONSTRAINT dsar_actions_pkey PRIMARY KEY (id);


--
-- Name: dsar_requests dsar_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dsar_requests
    ADD CONSTRAINT dsar_requests_pkey PRIMARY KEY (id);


--
-- Name: dsar_requests dsar_requests_ticket_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dsar_requests
    ADD CONSTRAINT dsar_requests_ticket_number_unique UNIQUE (ticket_number);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: guest_invitations guest_invitations_invitation_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_invitations
    ADD CONSTRAINT guest_invitations_invitation_token_unique UNIQUE (invitation_token);


--
-- Name: guest_invitations guest_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_invitations
    ADD CONSTRAINT guest_invitations_pkey PRIMARY KEY (id);


--
-- Name: industry_templates industry_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industry_templates
    ADD CONSTRAINT industry_templates_pkey PRIMARY KEY (id);


--
-- Name: industry_templates industry_templates_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industry_templates
    ADD CONSTRAINT industry_templates_slug_unique UNIQUE (slug);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: omnichannel_consents omnichannel_consents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.omnichannel_consents
    ADD CONSTRAINT omnichannel_consents_pkey PRIMARY KEY (id);


--
-- Name: onboarding_answers onboarding_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.onboarding_answers
    ADD CONSTRAINT onboarding_answers_pkey PRIMARY KEY (id);


--
-- Name: onboarding_answers onboarding_answers_tenant_id_question_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.onboarding_answers
    ADD CONSTRAINT onboarding_answers_tenant_id_question_id_unique UNIQUE (tenant_id, question_id);


--
-- Name: onboarding_questions onboarding_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.onboarding_questions
    ADD CONSTRAINT onboarding_questions_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_transaction_reference_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_transaction_reference_unique UNIQUE (transaction_reference);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: policies policies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policies
    ADD CONSTRAINT policies_pkey PRIMARY KEY (id);


--
-- Name: ropa_activities ropa_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ropa_activities
    ADD CONSTRAINT ropa_activities_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: tenant_client_organizations tco_parent_client_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_client_organizations
    ADD CONSTRAINT tco_parent_client_unique UNIQUE (parent_tenant_id, client_tenant_id);


--
-- Name: tenant_client_organizations tenant_client_organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_client_organizations
    ADD CONSTRAINT tenant_client_organizations_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_slug_unique UNIQUE (slug);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: ai_logs_tenant_decision_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ai_logs_tenant_decision_idx ON public.ai_decision_logs USING btree (tenant_id, decision_type);


--
-- Name: approvals_signable_type_signable_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX approvals_signable_type_signable_id_index ON public.approvals USING btree (signable_type, signable_id);


--
-- Name: approvals_tenant_id_signed_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX approvals_tenant_id_signed_at_index ON public.approvals USING btree (tenant_id, signed_at);


--
-- Name: audit_checklist_items_audit_project_id_domain_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_checklist_items_audit_project_id_domain_status_index ON public.audit_checklist_items USING btree (audit_project_id, domain, status);


--
-- Name: audit_comments_audit_project_id_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_comments_audit_project_id_created_at_index ON public.audit_comments USING btree (audit_project_id, created_at);


--
-- Name: audit_findings_audit_project_id_severity_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_findings_audit_project_id_severity_status_index ON public.audit_findings USING btree (audit_project_id, severity, status);


--
-- Name: audit_logs_tenant_id_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_tenant_id_created_at_index ON public.audit_logs USING btree (tenant_id, created_at);


--
-- Name: audit_projects_tenant_id_audit_year_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_projects_tenant_id_audit_year_status_index ON public.audit_projects USING btree (tenant_id, audit_year, status);


--
-- Name: breach_step_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX breach_step_idx ON public.breach_playbook_steps USING btree (data_breach_id, step_code);


--
-- Name: breach_tenant_status_sla_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX breach_tenant_status_sla_idx ON public.data_breaches USING btree (tenant_id, status, ndpc_notification_deadline);


--
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- Name: cb_tenant_country_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cb_tenant_country_idx ON public.cross_border_transfers USING btree (tenant_id, destination_country_code);


--
-- Name: cookie_consents_tenant_id_consented_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cookie_consents_tenant_id_consented_at_index ON public.cookie_consents USING btree (tenant_id, consented_at);


--
-- Name: dcc_tenant_tier_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX dcc_tenant_tier_idx ON public.data_controller_classifications USING btree (tenant_id, calculated_tier);


--
-- Name: dpia_tenant_status_risk_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX dpia_tenant_status_risk_idx ON public.dpia_assessments USING btree (tenant_id, dpo_sign_off_status, residual_risk_level);


--
-- Name: dsar_actions_dsar_request_id_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX dsar_actions_dsar_request_id_created_at_index ON public.dsar_actions USING btree (dsar_request_id, created_at);


--
-- Name: dsar_requests_tenant_id_status_sla_deadline_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX dsar_requests_tenant_id_status_sla_deadline_index ON public.dsar_requests USING btree (tenant_id, status, sla_deadline);


--
-- Name: guest_invitations_tenant_id_email_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX guest_invitations_tenant_id_email_index ON public.guest_invitations USING btree (tenant_id, email);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: notif_tenant_user_read_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notif_tenant_user_read_idx ON public.notifications USING btree (tenant_id, user_id, is_read);


--
-- Name: omni_tenant_channel_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX omni_tenant_channel_idx ON public.omnichannel_consents USING btree (tenant_id, channel, is_withdrawn);


--
-- Name: omni_tenant_subj_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX omni_tenant_subj_idx ON public.omnichannel_consents USING btree (tenant_id, data_subject_identifier);


--
-- Name: payments_tenant_id_paid_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_tenant_id_paid_at_index ON public.payments USING btree (tenant_id, paid_at);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: policies_tenant_id_type_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX policies_tenant_id_type_status_index ON public.policies USING btree (tenant_id, type, status);


--
-- Name: ropa_activities_tenant_id_department_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ropa_activities_tenant_id_department_status_index ON public.ropa_activities USING btree (tenant_id, department, status);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: subscriptions_tenant_id_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscriptions_tenant_id_status_index ON public.subscriptions USING btree (tenant_id, status);


--
-- Name: tenants_parent_tier_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tenants_parent_tier_idx ON public.tenants USING btree (parent_tenant_id, tenant_tier);


--
-- Name: tenants_type_is_active_data_residency_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tenants_type_is_active_data_residency_index ON public.tenants USING btree (type, is_active, data_residency);


--
-- Name: users_tenant_id_role_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_tenant_id_role_index ON public.users USING btree (tenant_id, role);


--
-- Name: vendors_tenant_risk_dpa_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vendors_tenant_risk_dpa_idx ON public.vendors USING btree (tenant_id, risk_rating, dpa_signed);


--
-- Name: ai_decision_logs ai_decision_logs_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_decision_logs
    ADD CONSTRAINT ai_decision_logs_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: ai_decision_logs ai_decision_logs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_decision_logs
    ADD CONSTRAINT ai_decision_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: approvals approvals_signer_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_signer_user_id_foreign FOREIGN KEY (signer_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: approvals approvals_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: audit_checklist_items audit_checklist_items_audit_project_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_checklist_items
    ADD CONSTRAINT audit_checklist_items_audit_project_id_foreign FOREIGN KEY (audit_project_id) REFERENCES public.audit_projects(id) ON DELETE CASCADE;


--
-- Name: audit_comments audit_comments_audit_project_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_comments
    ADD CONSTRAINT audit_comments_audit_project_id_foreign FOREIGN KEY (audit_project_id) REFERENCES public.audit_projects(id) ON DELETE CASCADE;


--
-- Name: audit_comments audit_comments_finding_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_comments
    ADD CONSTRAINT audit_comments_finding_id_foreign FOREIGN KEY (finding_id) REFERENCES public.audit_findings(id) ON DELETE CASCADE;


--
-- Name: audit_comments audit_comments_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_comments
    ADD CONSTRAINT audit_comments_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: audit_evidences audit_evidences_audit_project_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_evidences
    ADD CONSTRAINT audit_evidences_audit_project_id_foreign FOREIGN KEY (audit_project_id) REFERENCES public.audit_projects(id) ON DELETE CASCADE;


--
-- Name: audit_evidences audit_evidences_checklist_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_evidences
    ADD CONSTRAINT audit_evidences_checklist_item_id_foreign FOREIGN KEY (checklist_item_id) REFERENCES public.audit_checklist_items(id) ON DELETE SET NULL;


--
-- Name: audit_evidences audit_evidences_uploaded_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_evidences
    ADD CONSTRAINT audit_evidences_uploaded_by_foreign FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: audit_findings audit_findings_assigned_to_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_findings
    ADD CONSTRAINT audit_findings_assigned_to_foreign FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: audit_findings audit_findings_audit_project_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_findings
    ADD CONSTRAINT audit_findings_audit_project_id_foreign FOREIGN KEY (audit_project_id) REFERENCES public.audit_projects(id) ON DELETE CASCADE;


--
-- Name: audit_findings audit_findings_checklist_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_findings
    ADD CONSTRAINT audit_findings_checklist_item_id_foreign FOREIGN KEY (checklist_item_id) REFERENCES public.audit_checklist_items(id) ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: audit_projects audit_projects_dpco_firm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_projects
    ADD CONSTRAINT audit_projects_dpco_firm_id_foreign FOREIGN KEY (dpco_firm_id) REFERENCES public.tenants(id) ON DELETE SET NULL;


--
-- Name: audit_projects audit_projects_lead_auditor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_projects
    ADD CONSTRAINT audit_projects_lead_auditor_id_foreign FOREIGN KEY (lead_auditor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: audit_projects audit_projects_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_projects
    ADD CONSTRAINT audit_projects_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: breach_playbook_steps breach_playbook_steps_data_breach_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.breach_playbook_steps
    ADD CONSTRAINT breach_playbook_steps_data_breach_id_foreign FOREIGN KEY (data_breach_id) REFERENCES public.data_breaches(id) ON DELETE CASCADE;


--
-- Name: breach_playbook_steps breach_playbook_steps_executed_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.breach_playbook_steps
    ADD CONSTRAINT breach_playbook_steps_executed_by_user_id_foreign FOREIGN KEY (executed_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: company_profiles company_profiles_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: cookie_banners cookie_banners_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cookie_banners
    ADD CONSTRAINT cookie_banners_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: cookie_consents cookie_consents_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cookie_consents
    ADD CONSTRAINT cookie_consents_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: cross_border_transfers cross_border_transfers_ropa_activity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cross_border_transfers
    ADD CONSTRAINT cross_border_transfers_ropa_activity_id_foreign FOREIGN KEY (ropa_activity_id) REFERENCES public.ropa_activities(id) ON DELETE SET NULL;


--
-- Name: cross_border_transfers cross_border_transfers_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cross_border_transfers
    ADD CONSTRAINT cross_border_transfers_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: data_breaches data_breaches_lead_responder_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_breaches
    ADD CONSTRAINT data_breaches_lead_responder_id_foreign FOREIGN KEY (lead_responder_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: data_breaches data_breaches_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_breaches
    ADD CONSTRAINT data_breaches_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: data_controller_classifications data_controller_classifications_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_controller_classifications
    ADD CONSTRAINT data_controller_classifications_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: dpco_profiles dpco_profiles_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dpco_profiles
    ADD CONSTRAINT dpco_profiles_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: dpia_assessments dpia_assessments_approved_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dpia_assessments
    ADD CONSTRAINT dpia_assessments_approved_by_foreign FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: dpia_assessments dpia_assessments_ropa_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dpia_assessments
    ADD CONSTRAINT dpia_assessments_ropa_id_foreign FOREIGN KEY (ropa_id) REFERENCES public.ropa_activities(id) ON DELETE SET NULL;


--
-- Name: dpia_assessments dpia_assessments_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dpia_assessments
    ADD CONSTRAINT dpia_assessments_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: dpo_profiles dpo_profiles_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dpo_profiles
    ADD CONSTRAINT dpo_profiles_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: dsar_actions dsar_actions_dsar_request_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dsar_actions
    ADD CONSTRAINT dsar_actions_dsar_request_id_foreign FOREIGN KEY (dsar_request_id) REFERENCES public.dsar_requests(id) ON DELETE CASCADE;


--
-- Name: dsar_actions dsar_actions_performed_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dsar_actions
    ADD CONSTRAINT dsar_actions_performed_by_user_id_foreign FOREIGN KEY (performed_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: dsar_requests dsar_requests_assigned_dpo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dsar_requests
    ADD CONSTRAINT dsar_requests_assigned_dpo_id_foreign FOREIGN KEY (assigned_dpo_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: dsar_requests dsar_requests_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dsar_requests
    ADD CONSTRAINT dsar_requests_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: guest_invitations guest_invitations_invited_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_invitations
    ADD CONSTRAINT guest_invitations_invited_by_user_id_foreign FOREIGN KEY (invited_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: guest_invitations guest_invitations_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_invitations
    ADD CONSTRAINT guest_invitations_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: omnichannel_consents omnichannel_consents_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.omnichannel_consents
    ADD CONSTRAINT omnichannel_consents_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: onboarding_answers onboarding_answers_answered_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.onboarding_answers
    ADD CONSTRAINT onboarding_answers_answered_by_user_id_foreign FOREIGN KEY (answered_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: onboarding_answers onboarding_answers_question_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.onboarding_answers
    ADD CONSTRAINT onboarding_answers_question_id_foreign FOREIGN KEY (question_id) REFERENCES public.onboarding_questions(id) ON DELETE CASCADE;


--
-- Name: onboarding_answers onboarding_answers_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.onboarding_answers
    ADD CONSTRAINT onboarding_answers_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: payments payments_subscription_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_subscription_id_foreign FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;


--
-- Name: payments payments_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: policies policies_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policies
    ADD CONSTRAINT policies_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: policies policies_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policies
    ADD CONSTRAINT policies_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: ropa_activities ropa_activities_reviewed_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ropa_activities
    ADD CONSTRAINT ropa_activities_reviewed_by_foreign FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ropa_activities ropa_activities_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ropa_activities
    ADD CONSTRAINT ropa_activities_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tenant_client_organizations tenant_client_organizations_assigned_lead_auditor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_client_organizations
    ADD CONSTRAINT tenant_client_organizations_assigned_lead_auditor_id_foreign FOREIGN KEY (assigned_lead_auditor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tenant_client_organizations tenant_client_organizations_client_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_client_organizations
    ADD CONSTRAINT tenant_client_organizations_client_tenant_id_foreign FOREIGN KEY (client_tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tenant_client_organizations tenant_client_organizations_parent_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_client_organizations
    ADD CONSTRAINT tenant_client_organizations_parent_tenant_id_foreign FOREIGN KEY (parent_tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tenants tenants_parent_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_parent_tenant_id_foreign FOREIGN KEY (parent_tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;


--
-- Name: users users_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: vendors vendors_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--



