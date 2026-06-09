-- Ejecutar en Supabase: SQL Editor → New query → Run
-- Habilita pgvector y embeddings para RAG
--
-- Gemini (gemini-embedding-001): usar vector(768) + EMBEDDING_DIMENSIONS=768
-- OpenAI (text-embedding-3-small): usar vector(1536) + EMBEDDING_DIMENSIONS=1536

CREATE EXTENSION IF NOT EXISTS vector;

-- Cambia 768 por 1536 si usas OpenAI embeddings
ALTER TABLE document_chunks
  ADD COLUMN IF NOT EXISTS embedding vector(768);

CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
  ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
