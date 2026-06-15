// Formation-Definitionen für den LineupEditor.
// Koordinaten: x = 0 (links) bis 1 (rechts), y = 0 (Angriff/oben) bis 1 (Tor/unten).

export type Position = {
  label: string;
  x: number;
  y: number;
};

export type Formation = {
  name: string;
  positions: Position[];
};

export const FORMATIONS: Record<string, Formation> = {
  "4-3-3": {
    name: "4-3-3",
    positions: [
      { label: "TW",  x: 0.50, y: 0.90 },
      { label: "LV",  x: 0.15, y: 0.72 },
      { label: "IV-L",x: 0.37, y: 0.72 },
      { label: "IV-R",x: 0.63, y: 0.72 },
      { label: "RV",  x: 0.85, y: 0.72 },
      { label: "ZM-L",x: 0.25, y: 0.50 },
      { label: "ZM",  x: 0.50, y: 0.50 },
      { label: "ZM-R",x: 0.75, y: 0.50 },
      { label: "LA",  x: 0.15, y: 0.25 },
      { label: "MS",  x: 0.50, y: 0.18 },
      { label: "RA",  x: 0.85, y: 0.25 },
    ],
  },
  "4-4-2": {
    name: "4-4-2",
    positions: [
      { label: "TW",  x: 0.50, y: 0.90 },
      { label: "LV",  x: 0.15, y: 0.72 },
      { label: "IV-L",x: 0.37, y: 0.72 },
      { label: "IV-R",x: 0.63, y: 0.72 },
      { label: "RV",  x: 0.85, y: 0.72 },
      { label: "LA",  x: 0.13, y: 0.50 },
      { label: "ZM-L",x: 0.37, y: 0.50 },
      { label: "ZM-R",x: 0.63, y: 0.50 },
      { label: "RA",  x: 0.87, y: 0.50 },
      { label: "ST-L",x: 0.35, y: 0.22 },
      { label: "ST-R",x: 0.65, y: 0.22 },
    ],
  },
  "3-5-2": {
    name: "3-5-2",
    positions: [
      { label: "TW",  x: 0.50, y: 0.90 },
      { label: "IV-L",x: 0.25, y: 0.72 },
      { label: "IV",  x: 0.50, y: 0.72 },
      { label: "IV-R",x: 0.75, y: 0.72 },
      { label: "LA",  x: 0.08, y: 0.52 },
      { label: "ZM-L",x: 0.28, y: 0.52 },
      { label: "ZM",  x: 0.50, y: 0.52 },
      { label: "ZM-R",x: 0.72, y: 0.52 },
      { label: "RA",  x: 0.92, y: 0.52 },
      { label: "ST-L",x: 0.35, y: 0.22 },
      { label: "ST-R",x: 0.65, y: 0.22 },
    ],
  },
  "4-2-3-1": {
    name: "4-2-3-1",
    positions: [
      { label: "TW",  x: 0.50, y: 0.90 },
      { label: "LV",  x: 0.15, y: 0.74 },
      { label: "IV-L",x: 0.37, y: 0.74 },
      { label: "IV-R",x: 0.63, y: 0.74 },
      { label: "RV",  x: 0.85, y: 0.74 },
      { label: "DM-L",x: 0.37, y: 0.57 },
      { label: "DM-R",x: 0.63, y: 0.57 },
      { label: "LA",  x: 0.15, y: 0.38 },
      { label: "ZO",  x: 0.50, y: 0.38 },
      { label: "RA",  x: 0.85, y: 0.38 },
      { label: "ST",  x: 0.50, y: 0.20 },
    ],
  },
  "5-3-2": {
    name: "5-3-2",
    positions: [
      { label: "TW",  x: 0.50, y: 0.90 },
      { label: "LV",  x: 0.08, y: 0.72 },
      { label: "IV-L",x: 0.28, y: 0.72 },
      { label: "IV",  x: 0.50, y: 0.72 },
      { label: "IV-R",x: 0.72, y: 0.72 },
      { label: "RV",  x: 0.92, y: 0.72 },
      { label: "ZM-L",x: 0.27, y: 0.50 },
      { label: "ZM",  x: 0.50, y: 0.50 },
      { label: "ZM-R",x: 0.73, y: 0.50 },
      { label: "ST-L",x: 0.35, y: 0.22 },
      { label: "ST-R",x: 0.65, y: 0.22 },
    ],
  },
};

export const FORMATION_KEYS = Object.keys(FORMATIONS);
