-- Tenant schema provisioning script
-- Replace {SCHEMA} with the actual schema name (e.g. tenant_clxyz123)
-- Run once per organization after creation.

CREATE SCHEMA IF NOT EXISTS {SCHEMA};

-- ─── training_modules ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS {SCHEMA}.training_modules (
  id              TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT       NOT NULL,
  slug            TEXT,
  title           TEXT        NOT NULL,
  description     TEXT,
  audience        TEXT,
  status          TEXT        NOT NULL DEFAULT 'DRAFT',
  "orderIndex"    INTEGER     NOT NULL DEFAULT 0,
  "estimatedMins" INTEGER,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT training_modules_org_slug_unique UNIQUE ("organizationId", slug)
);
CREATE INDEX IF NOT EXISTS training_modules_org_status ON {SCHEMA}.training_modules ("organizationId", status);

-- ─── processes ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS {SCHEMA}.processes (
  id              TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT       NOT NULL,
  "moduleId"      TEXT,
  title           TEXT        NOT NULL,
  description     TEXT,
  steps           JSONB       NOT NULL DEFAULT '[]',
  "orderIndex"    INTEGER     NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS processes_org ON {SCHEMA}.processes ("organizationId");
CREATE INDEX IF NOT EXISTS processes_module ON {SCHEMA}.processes ("moduleId");

-- ─── activities ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS {SCHEMA}.activities (
  id              TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT       NOT NULL,
  "moduleId"      TEXT        NOT NULL,
  type            TEXT        NOT NULL,
  title           TEXT        NOT NULL,
  content         JSONB       NOT NULL DEFAULT '{}',
  difficulty      INTEGER     NOT NULL DEFAULT 1,
  points          INTEGER     NOT NULL DEFAULT 10,
  "aiGenerated"   BOOLEAN     NOT NULL DEFAULT false,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS activities_org ON {SCHEMA}.activities ("organizationId");
CREATE INDEX IF NOT EXISTS activities_module ON {SCHEMA}.activities ("moduleId");

-- ─── documents ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS {SCHEMA}.documents (
  id              TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT       NOT NULL,
  "processId"     TEXT,
  "moduleId"      TEXT,
  title           TEXT        NOT NULL,
  type            TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'UPLOADING',
  "fileUrl"       TEXT,
  "mimeType"      TEXT,
  "fileSize"      INTEGER,
  metadata        JSONB       NOT NULL DEFAULT '{}',
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS documents_org_status ON {SCHEMA}.documents ("organizationId", status);
CREATE INDEX IF NOT EXISTS documents_module ON {SCHEMA}.documents ("moduleId");

-- ─── document_chunks ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS {SCHEMA}.document_chunks (
  id              TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT       NOT NULL,
  "documentId"    TEXT        NOT NULL,
  content         TEXT        NOT NULL,
  "chunkIndex"    INTEGER     NOT NULL,
  "tokenCount"    INTEGER,
  metadata        JSONB       NOT NULL DEFAULT '{}',
  embedding       public.vector(768),
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS document_chunks_doc ON {SCHEMA}.document_chunks ("documentId");
CREATE INDEX IF NOT EXISTS document_chunks_org ON {SCHEMA}.document_chunks ("organizationId");

-- ─── user_progress ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS {SCHEMA}.user_progress (
  id                TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "userId"          TEXT        NOT NULL,
  "moduleId"        TEXT        NOT NULL,
  "percentComplete" FLOAT       NOT NULL DEFAULT 0,
  score             FLOAT,
  "timeSpentSecs"   INTEGER     NOT NULL DEFAULT 0,
  "completedAt"     TIMESTAMPTZ,
  "lastAccessedAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata          JSONB       NOT NULL DEFAULT '{}',
  PRIMARY KEY (id),
  CONSTRAINT user_progress_user_module_unique UNIQUE ("userId", "moduleId")
);

-- ─── activity_attempts ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS {SCHEMA}.activity_attempts (
  id           TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "userId"     TEXT        NOT NULL,
  "activityId" TEXT        NOT NULL,
  score        FLOAT,
  passed       BOOLEAN     NOT NULL DEFAULT false,
  answers      JSONB       NOT NULL DEFAULT '{}',
  "timeSecs"   INTEGER,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS activity_attempts_user ON {SCHEMA}.activity_attempts ("userId");
CREATE INDEX IF NOT EXISTS activity_attempts_activity ON {SCHEMA}.activity_attempts ("activityId");

-- ─── learning_events ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS {SCHEMA}.learning_events (
  id              TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT       NOT NULL,
  "userId"        TEXT        NOT NULL,
  "eventType"     TEXT        NOT NULL,
  payload         JSONB       NOT NULL DEFAULT '{}',
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS learning_events_org_type ON {SCHEMA}.learning_events ("organizationId", "eventType");
CREATE INDEX IF NOT EXISTS learning_events_user_created ON {SCHEMA}.learning_events ("userId", "createdAt");

-- ─── conversations ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS {SCHEMA}.conversations (
  id              TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT       NOT NULL,
  "userId"        TEXT        NOT NULL,
  title           TEXT,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS conversations_org_user ON {SCHEMA}.conversations ("organizationId", "userId");

-- ─── messages ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS {SCHEMA}.messages (
  id               TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "conversationId" TEXT        NOT NULL,
  role             TEXT        NOT NULL,
  content          TEXT        NOT NULL,
  sources          JSONB,
  "tokensUsed"     INTEGER,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS messages_conversation ON {SCHEMA}.messages ("conversationId");

-- ─── report_snapshots ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS {SCHEMA}.report_snapshots (
  id              TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT       NOT NULL,
  "reportType"    TEXT        NOT NULL,
  data            JSONB       NOT NULL DEFAULT '{}',
  "periodStart"   TIMESTAMPTZ NOT NULL,
  "periodEnd"     TIMESTAMPTZ NOT NULL,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS report_snapshots_org_type ON {SCHEMA}.report_snapshots ("organizationId", "reportType");

-- ─── automations ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS {SCHEMA}.automations (
  id              TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT       NOT NULL,
  name            TEXT        NOT NULL,
  trigger         TEXT        NOT NULL,
  config          JSONB       NOT NULL DEFAULT '{}',
  "isActive"      BOOLEAN     NOT NULL DEFAULT true,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS automations_org ON {SCHEMA}.automations ("organizationId");

-- ─── inclusion_audits ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS {SCHEMA}.inclusion_audits (
  id              TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT       NOT NULL,
  "targetType"    TEXT        NOT NULL,
  "targetId"      TEXT        NOT NULL,
  "overallScore"  FLOAT       NOT NULL,
  dimensions      JSONB       NOT NULL DEFAULT '{}',
  issues          JSONB       NOT NULL DEFAULT '[]',
  recommendations JSONB       NOT NULL DEFAULT '[]',
  "aiGenerated"   BOOLEAN     NOT NULL DEFAULT true,
  "auditedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS inclusion_audits_org_type_target ON {SCHEMA}.inclusion_audits ("organizationId", "targetType", "targetId");
CREATE INDEX IF NOT EXISTS inclusion_audits_org_score ON {SCHEMA}.inclusion_audits ("organizationId", "overallScore");

-- ─── accessibility_events ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS {SCHEMA}.accessibility_events (
  id              TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT       NOT NULL,
  "userId"        TEXT        NOT NULL,
  "eventType"     TEXT        NOT NULL,
  payload         JSONB       NOT NULL DEFAULT '{}',
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS accessibility_events_org_type ON {SCHEMA}.accessibility_events ("organizationId", "eventType");
CREATE INDEX IF NOT EXISTS accessibility_events_user_created ON {SCHEMA}.accessibility_events ("userId", "createdAt");

-- ─── content_adaptations ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS {SCHEMA}.content_adaptations (
  id               TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT        NOT NULL,
  "userId"         TEXT,
  "sourceType"     TEXT        NOT NULL,
  "sourceId"       TEXT        NOT NULL,
  "adaptationType" TEXT        NOT NULL,
  "outputContent"  JSONB       NOT NULL DEFAULT '{}',
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS content_adaptations_org_source ON {SCHEMA}.content_adaptations ("organizationId", "sourceType", "sourceId");
CREATE INDEX IF NOT EXISTS content_adaptations_user ON {SCHEMA}.content_adaptations ("userId");

-- ─── push_subscriptions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS {SCHEMA}.push_subscriptions (
  id               TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT        NOT NULL,
  "userId"         TEXT        NOT NULL,
  endpoint         TEXT        NOT NULL,
  p256dh           TEXT        NOT NULL,
  auth             TEXT        NOT NULL,
  "userAgent"      TEXT,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT push_subscriptions_user_endpoint_unique UNIQUE ("userId", endpoint)
);
CREATE INDEX IF NOT EXISTS push_subscriptions_org ON {SCHEMA}.push_subscriptions ("organizationId");

-- ─── accessibility_profiles ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS {SCHEMA}.accessibility_profiles (
  id                    TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId"      TEXT        NOT NULL,
  "userId"              TEXT        NOT NULL UNIQUE,
  "fontScale"           FLOAT       NOT NULL DEFAULT 1,
  "highContrast"        BOOLEAN     NOT NULL DEFAULT false,
  "darkMode"            BOOLEAN     NOT NULL DEFAULT false,
  "reduceMotion"        BOOLEAN     NOT NULL DEFAULT false,
  "preferredModality"   TEXT        NOT NULL DEFAULT 'MIXED',
  "simplifiedLanguage"  BOOLEAN     NOT NULL DEFAULT false,
  "stepByStepMode"      BOOLEAN     NOT NULL DEFAULT false,
  "autoReadAloud"       BOOLEAN     NOT NULL DEFAULT false,
  "captionsEnabled"     BOOLEAN     NOT NULL DEFAULT true,
  "learningPace"        TEXT        NOT NULL DEFAULT 'NORMAL',
  "wizardCompleted"     BOOLEAN     NOT NULL DEFAULT false,
  "voiceCommandsEnabled" BOOLEAN    NOT NULL DEFAULT false,
  "voiceInputEnabled"   BOOLEAN     NOT NULL DEFAULT false,
  "assistedReadingMode" BOOLEAN     NOT NULL DEFAULT false,
  "declaredNeeds"       JSONB       NOT NULL DEFAULT '{}',
  "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS accessibility_profiles_org ON {SCHEMA}.accessibility_profiles ("organizationId");

-- ─── learning_profiles ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS {SCHEMA}.learning_profiles (
  id               TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT        NOT NULL,
  "userId"         TEXT        NOT NULL UNIQUE,
  "modalityScores" JSONB       NOT NULL DEFAULT '{}',
  "supportLevel"   TEXT        NOT NULL DEFAULT 'STANDARD',
  "readingCount"   INTEGER     NOT NULL DEFAULT 0,
  "listeningCount" INTEGER     NOT NULL DEFAULT 0,
  "visualCount"    INTEGER     NOT NULL DEFAULT 0,
  "practiceCount"  INTEGER     NOT NULL DEFAULT 0,
  "lastAdaptedAt"  TIMESTAMPTZ,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS learning_profiles_org ON {SCHEMA}.learning_profiles ("organizationId")
