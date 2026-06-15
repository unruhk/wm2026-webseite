// Vogelperspektive eines Fußballfeldes (Portrait, Angriff oben / Abwehr unten)
// fieldPosition: { x: 0–1 links→rechts, y: 0–1 Angriff→Abwehr }

type Props = {
  position: { x: number; y: number };
  accentColor: string;
};

const W = 60;  // SVG-Breite
const H = 90;  // SVG-Höhe

export default function FieldMap({ position, accentColor }: Props) {
  const px = position.x * W;
  const py = position.y * H;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-28 h-40 sm:w-32 sm:h-48 rounded-lg overflow-hidden"
      style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.6))" }}
    >
      {/* Rasen */}
      <rect width={W} height={H} fill="#143d14" />

      {/* Helle/dunkle Streifen */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={0} y={i * 18} width={W} height={9} fill="#163d16" opacity="0.5" />
      ))}

      {/* Außenlinie */}
      <rect x="2" y="2" width={W - 4} height={H - 4} fill="none" stroke="#2e6b2e" strokeWidth="0.7" />

      {/* Mittellinie */}
      <line x1="2" y1={H / 2} x2={W - 2} y2={H / 2} stroke="#2e6b2e" strokeWidth="0.5" />

      {/* Mittelkreis */}
      <circle cx={W / 2} cy={H / 2} r="8" fill="none" stroke="#2e6b2e" strokeWidth="0.5" />
      <circle cx={W / 2} cy={H / 2} r="0.8" fill="#2e6b2e" />

      {/* Strafraum oben (Angriff) */}
      <rect x="13" y="2" width="34" height="16" fill="none" stroke="#2e6b2e" strokeWidth="0.5" />
      {/* Torraum oben */}
      <rect x="22" y="2" width="16" height="6" fill="none" stroke="#2e6b2e" strokeWidth="0.5" />
      {/* Tor oben */}
      <rect x="24" y="0.5" width="12" height="2.5" fill="none" stroke="#3a7a3a" strokeWidth="0.7" />

      {/* Strafraum unten (Abwehr) */}
      <rect x="13" y={H - 18} width="34" height="16" fill="none" stroke="#2e6b2e" strokeWidth="0.5" />
      {/* Torraum unten */}
      <rect x="22" y={H - 8} width="16" height="6" fill="none" stroke="#2e6b2e" strokeWidth="0.5" />
      {/* Tor unten */}
      <rect x="24" y={H - 3} width="12" height="2.5" fill="none" stroke="#3a7a3a" strokeWidth="0.7" />

      {/* Strafstoßpunkte */}
      <circle cx={W / 2} cy="14" r="0.8" fill="#2e6b2e" />
      <circle cx={W / 2} cy={H - 14} r="0.8" fill="#2e6b2e" />

      {/* Spieler-Positionsmarker */}
      {/* Äußerer Pulsring */}
      <circle cx={px} cy={py} r="5" fill="none" stroke={accentColor} strokeWidth="0.7" opacity="0.45" />
      {/* Mittlerer Ring */}
      <circle cx={px} cy={py} r="3" fill="none" stroke={accentColor} strokeWidth="0.8" opacity="0.7" />
      {/* Kern */}
      <circle cx={px} cy={py} r="1.8" fill={accentColor} opacity="0.95" />
    </svg>
  );
}
