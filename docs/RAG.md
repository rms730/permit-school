# RAG RPC (match_content_chunks)

Call from server or client (RLS allows read):

```js
const { data, error } = await supabase.rpc('match_content_chunks', {
  j_code: 'CA',
  q_embedding: /* number[1536] */,
  match_count: 5
});
```

The function orders by embedding <-> q_embedding and returns distance (smaller is closer). Use OpenAI
text-embedding-3-small for queries to match the 1536-dim schema.
