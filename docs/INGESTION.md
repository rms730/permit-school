# Handbook Ingestion

## Env (local)

Export these before running:

- `SUPABASE_URL=https://<your-ref>.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=***` # server-only; NEVER in browser code
- `OPENAI_API_KEY=***`

## Install once

npm --prefix tools/ingest install

## Run (CA English)

npm run --prefix tools/ingest ingest:ca:en -- --url "<CA Handbook PDF URL>" --source "<handbook web page>"

## Verify

SELECT count(\*) AS chunks
FROM content_chunks
WHERE jurisdiction_id = (SELECT id FROM jurisdictions WHERE code='CA') AND lang='en';
