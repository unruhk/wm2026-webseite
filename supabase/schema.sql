-- ============================================================
-- WM 2026 Webseite — Datenbankschema
-- Ausführen im Supabase SQL-Editor:
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================


-- ── Tabellen ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS players (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name             text        NOT NULL,
  position         text        NOT NULL,
  jersey_number    int         NOT NULL,
  age              int,
  club             text,
  goals            int         NOT NULL DEFAULT 0,
  assists          int         NOT NULL DEFAULT 0,
  caps             int         NOT NULL DEFAULT 0,
  bio              text,
  image_url        text,
  accent_color     text        NOT NULL DEFAULT '#D4AF37',
  field_position_x float       NOT NULL DEFAULT 0.5,
  field_position_y float       NOT NULL DEFAULT 0.5,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text        NOT NULL,
  coach_email text        NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id     uuid        NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  opponent    text        NOT NULL,
  match_date  timestamptz NOT NULL,
  location    text,
  formation   text,
  notes       text,
  lineup      jsonb       NOT NULL DEFAULT '[]'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);


-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams   ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Spieler: öffentlich lesbar (für die Webseite)
CREATE POLICY "players_public_read" ON players
  FOR SELECT USING (true);

-- Teams: Trainer sieht nur sein eigenes Team
CREATE POLICY "teams_owner_all" ON teams
  FOR ALL USING (coach_email = auth.jwt() ->> 'email');

-- Matches: Trainer sieht nur Spiele seines Teams
CREATE POLICY "matches_owner_all" ON matches
  FOR ALL USING (
    team_id IN (
      SELECT id FROM teams
      WHERE coach_email = auth.jwt() ->> 'email'
    )
  );


-- ── Seed-Daten: 5 fiktive Spieler ────────────────────────────

INSERT INTO players
  (name, position, jersey_number, club, goals, assists, caps, accent_color, field_position_x, field_position_y)
VALUES
  ('M. Bauer',   'Torwart',         1,  'FC Beispiel', 0,  0,  42, '#AAAAAA', 0.50, 0.93),
  ('L. Fischer', 'Innenverteidiger', 5,  'SV Demo',     3,  2,  67, '#FFFFFF', 0.38, 0.76),
  ('K. Müller',  'Mittelfeld',       8,  'TSV Test',    7,  11, 89, '#D4AF37', 0.50, 0.50),
  ('J. Schmidt', 'Rechtsaußen',      11, 'FC Probe',    9,  6,  54, '#D4AF37', 0.85, 0.35),
  ('T. Weber',   'Mittelstürmer',    9,  'VfB Muster',  14, 5,  73, '#DD0000', 0.50, 0.13)
ON CONFLICT DO NOTHING;
