# Tutor Edge Function

**POST** `/tutor`

Body:

```json
{
  "query": "When can I turn right on red in California?",
  "j_code": "CA",
  "top_k": 5
}
```

Auth:

- Send Authorization: Bearer <anon-or-user-jwt>. The anon key works for quick tests.
- Function uses the hybrid RPC: match_content_chunks_hybrid.

Response:

```json
{
  "answer": "... [1] ...",
  "citations": [
    { "idx": 1, "id": 47, "source_url": "...", "distance": 0.42, "rank": 0.71 }
  ]
}
```
