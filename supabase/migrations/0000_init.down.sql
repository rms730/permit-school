-- Baseline migration rollback
BEGIN;

DROP INDEX IF EXISTS course_units_course_id_idx;
DROP TABLE IF EXISTS public.course_units;
DROP TABLE IF EXISTS public.courses;
DROP TABLE IF EXISTS public.jurisdictions;

DROP SEQUENCE IF EXISTS tutor_logs_id_seq;
DROP SEQUENCE IF EXISTS seat_time_events_id_seq;
DROP SEQUENCE IF EXISTS regulatory_artifacts_id_seq;
DROP SEQUENCE IF EXISTS notifications_id_seq;
DROP SEQUENCE IF EXISTS jurisdictions_id_seq;
DROP SEQUENCE IF EXISTS deletion_requests_id_seq;
DROP SEQUENCE IF EXISTS data_exports_id_seq;
DROP SEQUENCE IF EXISTS content_chunks_id_seq;
DROP SEQUENCE IF EXISTS consents_id_seq;
DROP SEQUENCE IF EXISTS cert_stock_id_seq;
DROP SEQUENCE IF EXISTS billing_events_id_seq;
DROP SEQUENCE IF EXISTS audit_logs_id_seq;

COMMIT;
