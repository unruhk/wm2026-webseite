// Manuelle Typen für die Supabase-Datenbank.
// Später können diese mit `supabase gen types typescript` automatisch generiert werden.

// ── Spielfeld-Datentypen ─────────────────────────────────────────────────────

export type MatchLineup = {
  formation: string;
  starters: { position: string; player_id: string }[];
  substitutes: string[];
  penalty_order: string[];
};

export type MatchGoal = {
  player_id: string | null;
  player_name: string;
  minute: number;
  type: "regular" | "penalty" | "own_goal";
};

export type MatchSubstitution = {
  player_out_id: string;
  player_out_name: string;
  player_in_id: string;
  player_in_name: string;
  minute: number;
};

export type MatchCard = {
  player_id: string;
  player_name: string;
  minute: number;
  type: "yellow" | "yellow_red" | "red";
};

// ── Supabase Database-Schema ─────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      players: {
        Row:           DbPlayer;
        Insert:        Omit<DbPlayer, "id" | "created_at">;
        Update:        Partial<Omit<DbPlayer, "id" | "created_at">>;
        Relationships: [];
      };
      teams: {
        Row:           DbTeam;
        Insert:        Omit<DbTeam, "id" | "created_at" | "coach_name"> & { coach_name?: string | null };
        Update:        Partial<Omit<DbTeam, "id" | "created_at">>;
        Relationships: [];
      };
      matches: {
        Row:           DbMatch;
        Insert:        Omit<DbMatch, "id" | "created_at" | "home_score" | "away_score" | "result" | "is_ko_round" | "extra_time_home" | "extra_time_away" | "penalties_home" | "penalties_away" | "goals" | "substitutions" | "cards" | "lineup"> & {
          lineup?: MatchLineup | null;
          is_ko_round?: boolean;
          home_score?: number | null;
          away_score?: number | null;
          result?: "win" | "draw" | "loss" | null;
          extra_time_home?: number | null;
          extra_time_away?: number | null;
          penalties_home?: number | null;
          penalties_away?: number | null;
          goals?: MatchGoal[];
          substitutions?: MatchSubstitution[];
          cards?: MatchCard[];
        };
        Update:        Partial<Omit<DbMatch, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views:     Record<string, never>;
    Functions: Record<string, never>;
  };
};

// ── Row-Typen ────────────────────────────────────────────────────────────────

export type DbPlayer = {
  id:                 string;
  name:               string;
  position:           string;
  jersey_number:      number;
  age:                number | null;
  club:               string | null;
  goals:              number;
  assists:            number;
  caps:               number;
  bio:                string | null;
  image_url:          string | null;
  accent_color:       string;
  field_position_x:   number;
  field_position_y:   number;
  created_at:         string;
};

export type DbTeam = {
  id:          string;
  name:        string;
  coach_name:  string | null;
  coach_email: string;
  created_at:  string;
};

export type DbMatch = {
  id:               string;
  team_id:          string;
  opponent:         string;
  match_date:       string;
  location:         string | null;
  formation:        string | null;
  notes:            string | null;
  lineup:           MatchLineup | null;
  // Ergebnis-Felder
  home_score:       number | null;
  away_score:       number | null;
  result:           "win" | "draw" | "loss" | null;
  is_ko_round:      boolean;
  extra_time_home:  number | null;
  extra_time_away:  number | null;
  penalties_home:   number | null;
  penalties_away:   number | null;
  goals:            MatchGoal[];
  substitutions:    MatchSubstitution[];
  cards:            MatchCard[];
  created_at:       string;
};
