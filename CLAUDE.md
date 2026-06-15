# CLAUDE.md — Projekt: WM 2026 Deutsche Nationalelf (3D-Webseite)

> Diese Datei ist die zentrale Anweisung für Claude Code. Sie wird bei jedem Start automatisch gelesen.
> Halte dich an diese Vorgaben, ohne sie bei jedem Prompt zu wiederholen.

---

## 1. Projektziel

Eine moderne, interaktive 3D-Webseite zur Deutschen Nationalmannschaft (Fußball-WM 2026).

**Drei Kernbereiche:**
1. **3D Spieler-Showcase** — beim Scrollen erscheint jeder Spieler einzeln mit persönlichen Infos, Position und Formation.
2. **Gewinner-/Tor-Seite** — 3D-Tor-Animation (Ball fliegt ins Netz, Konfetti, Jubel), ausgelöst per Button oder Score-Event.
3. **Trainer-Dashboard** — geschützter Login-Bereich mit Spielplanung, Aufstellungstool und Taktik-Hilfen.

**Geschäftszweck:** Portfolio-Demo für ein YouTube-Video und Social-Media-Clips zur Auftragsgewinnung. Später optional als SaaS für Amateurvereine ausbaubar.

---

## 2. Tech Stack (verbindlich)

- **Framework:** Next.js 14+ (App Router) mit TypeScript
- **3D:** Three.js über `@react-three/fiber` + `@react-three/drei`
- **Animation:** GSAP mit ScrollTrigger (für Scroll-Effekte)
- **Styling:** Tailwind CSS
- **Backend/Auth/DB:** Supabase (Auth, PostgreSQL, Realtime)
- **Hosting:** Vercel
- **Versionierung:** Git + GitHub

> Keine zusätzlichen Libraries ohne Rückfrage einführen. Stack schlank halten.

---

## 3. Designvorgaben

- **Farbpalette:** Schwarz (#0A0A0A), Weiß (#FFFFFF), Gold (#D4AF37), Rot (#DD0000) — angelehnt an DFB-Stil.
- **Typografie:** Moderne serifenlose Schrift (z. B. Inter oder Geist). Große, mutige Headlines.
- **Stil:** Cinematic, dunkler Hintergrund, hoher Kontrast, viel Weißraum. Premium-Look, kein verspieltes Design.
- **Mobil zuerst:** Jede Sektion muss auf dem Smartphone perfekt funktionieren (Touch, Scroll, Performance).
- **Performance:** Ladezeit unter 2 Sekunden. 3D-Modelle komprimieren (Draco). Lazy Loading für Sektionen.

---

## 4. Dateistruktur

```
/app
  /page.tsx                → Startseite (Hero + Spieler-Showcase + Tor-Sektion)
  /dashboard               → Trainer-Login-Bereich (geschützt)
    /page.tsx
    /login/page.tsx
  /api                     → API-Routen (falls nötig)
/components
  /three                   → 3D-Komponenten (Spielermodelle, Tor-Animation, Ball)
  /sections                → Scroll-Sektionen (PlayerCard, GoalScene, Hero)
  /ui                      → Buttons, Cards, Navigation
  /dashboard               → Aufstellungstool, Kalender, Whiteboard
/lib
  /supabase                → Supabase-Client, Auth-Helfer
  /data                    → Spielerdaten (JSON: Name, Position, Stats, Bild)
/public
  /models                  → 3D-Modelle (.glb / .gltf)
  /images                  → Spielerfotos, Logos
```

---

## 5. Datenmodell (Supabase)

**Tabelle `players`** (öffentlich lesbar):
`id, name, position, jersey_number, age, club, goals, assists, bio, image_url, model_url`

**Tabelle `matches`** (nur für eingeloggte Trainer):
`id, team_id, opponent, match_date, location, formation, notes, lineup (jsonb)`

**Tabelle `teams`**:
`id, name, coach_email`

**Auth:** Supabase Auth mit E-Mail/Passwort. Row Level Security (RLS) aktivieren — Trainer sehen nur Daten ihres eigenen Teams.

---

## 6. Arbeitsweise & Konventionen

- **Plan Mode zuerst:** Bei größeren Features (3D-Szene, Dashboard) immer erst einen Plan vorschlagen, bevor du Code schreibst.
- **Kleine Schritte:** Ein Feature pro Commit. Nach jedem fertigen Baustein committen.
- **Commits:** Klare Nachrichten im Format `feat: ...`, `fix: ...`, `style: ...`.
- **Kommentare:** Komplexe 3D-Logik und GSAP-Timelines kurz auf Deutsch kommentieren.
- **Fragen statt raten:** Wenn etwas unklar ist (z. B. welche Spielerdaten), kurz nachfragen statt Platzhalter zu erfinden.
- **Mobile testen:** Bei jeder UI-Komponente Responsive-Verhalten mitdenken.

---

## 7. Reihenfolge der Umsetzung

1. Projekt-Setup: Next.js + Tailwind + Three.js + GSAP installieren, Grundgerüst.
2. Hero-Sektion (Startbildschirm mit Titel und erstem 3D-Element).
3. 3D Spieler-Showcase mit Scroll-Animation (Kernstück fürs Video).
4. Tor-Animation als eigene Sektion (Ball → Netz → Konfetti).
5. Supabase einrichten, Datenbank-Tabellen anlegen.
6. Trainer-Login + Dashboard (Kalender, Aufstellungstool).
7. Feinschliff: Performance, Mobile, SEO, Deployment auf Vercel.

---

## 8. Wichtige Hinweise

- **Keine echten Spielernamen/Fotos** ohne Klärung der Bildrechte verwenden — für die Demo Platzhalter oder fiktive Spieler nutzen, bis Rechte geklärt sind.
- **Secrets** (Supabase-Keys) immer in `.env.local`, niemals in den Code committen.
- **Schrittweise erklären:** Der Projektinhaber ist Claude-Code-Anfänger. Bei jedem größeren Schritt kurz erklären, was passiert und warum.
