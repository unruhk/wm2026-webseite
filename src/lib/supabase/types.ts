// Manuelle Typen für die Supabase-Datenbank.
// Später können diese mit `supabase gen types typescript` automatisch generiert werden.

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
        Insert:        Omit<DbTeam, "id" | "created_at">;
        Update:        Partial<Omit<DbTeam, "id" | "created_at">>;
        Relationships: [];
      };
      matches: {
        Row:           DbMatch;
        Insert:        Omit<DbMatch, "id" | "created_at">;
        Update:        Partial<Omit<DbMatch, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views:     Record<string, never>;
    Functions: Record<string, never>;
  };
};

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
  coach_email: string;
  created_at:  string;
};

export type DbMatch = {
  id:          string;
  team_id:     string;
  opponent:    string;
  match_date:  string;
  location:    string | null;
  formation:   string | null;
  notes:       string | null;
  lineup:      unknown[];
  created_at:  string;
};
