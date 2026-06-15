export type Player = {
  id: number;
  name: string;
  position: string;
  number: number;
  club: string;
  goals: number;
  assists: number;
  caps: number;
  accentColor: string;
  // Normalisierte Position im Spielfeld (x: 0=links, 1=rechts / y: 0=Angriff, 1=Abwehr)
  fieldPosition: { x: number; y: number };
};

export const players: Player[] = [
  {
    id: 1,
    name: "M. Bauer",
    position: "Torwart",
    number: 1,
    club: "FC Beispiel",
    goals: 0,
    assists: 0,
    caps: 42,
    accentColor: "#AAAAAA",
    fieldPosition: { x: 0.5, y: 0.93 },
  },
  {
    id: 2,
    name: "L. Fischer",
    position: "Innenverteidiger",
    number: 5,
    club: "SV Demo",
    goals: 3,
    assists: 2,
    caps: 67,
    accentColor: "#FFFFFF",
    fieldPosition: { x: 0.38, y: 0.76 },
  },
  {
    id: 3,
    name: "K. Müller",
    position: "Mittelfeld",
    number: 8,
    club: "TSV Test",
    goals: 7,
    assists: 11,
    caps: 89,
    accentColor: "#D4AF37",
    fieldPosition: { x: 0.5, y: 0.5 },
  },
  {
    id: 4,
    name: "J. Schmidt",
    position: "Rechtsaußen",
    number: 11,
    club: "FC Probe",
    goals: 9,
    assists: 6,
    caps: 54,
    accentColor: "#D4AF37",
    fieldPosition: { x: 0.85, y: 0.35 },
  },
  {
    id: 5,
    name: "T. Weber",
    position: "Mittelstürmer",
    number: 9,
    club: "VfB Muster",
    goals: 14,
    assists: 5,
    caps: 73,
    accentColor: "#DD0000",
    fieldPosition: { x: 0.5, y: 0.13 },
  },
];
