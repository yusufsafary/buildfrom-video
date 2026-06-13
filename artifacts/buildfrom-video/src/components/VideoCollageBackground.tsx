import { useRef } from "react";

const CODE_SNIPPETS = [
  `const app = express()\napp.get("/api", (req, res) => {\n  res.json({ ok: true })\n})\napp.listen(3000)`,
  `function useState(initial) {\n  let state = initial\n  const set = (v) => {\n    state = v; render()\n  }\n  return [() => state, set]\n}`,
  `SELECT u.name, COUNT(o.id)\nFROM orders o\nJOIN users u ON o.user_id = u.id\nGROUP BY u.name\nORDER BY 2 DESC`,
  `async function fetchData(url: string) {\n  const res = await fetch(url)\n  if (!res.ok) throw new Error(res.statusText)\n  return res.json() as Promise<Data>\n}`,
  `class LinkedList:\n  def __init__(self):\n    self.head = None\n  def append(self, val):\n    node = Node(val)\n    if not self.head:\n      self.head = node`,
  `docker build -t myapp .\ndocker run -d -p 3000:3000 \\\n  --env-file .env \\\n  --name myapp myapp:latest`,
  `const rows = await db\n  .select()\n  .from(users)\n  .where(eq(users.active, true))\n  .orderBy(desc(users.createdAt))\n  .limit(20)`,
  `git init && git add .\ngit commit -m "feat: init"\ngit remote add origin ...\ngit push -u origin main`,
  `npm create vite@latest my-app\n  -- --template react-ts\ncd my-app\nnpm install && npm run dev`,
  `interface ApiResponse<T> {\n  data: T\n  meta: { total: number; page: number }\n  error: string | null\n}`,
  `export default defineConfig({\n  plugins: [react(), tailwindcss()],\n  build: { outDir: "dist" },\n  server: { port: 5173 },\n})`,
  `useEffect(() => {\n  const ctrl = new AbortController()\n  fetch("/api/data", { signal: ctrl.signal })\n    .then(r => r.json()).then(setData)\n  return () => ctrl.abort()\n}, [id])`,
  `FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --production\nCOPY . .\nEXPOSE 3000\nCMD ["node","index.js"]`,
  `const schema = z.object({\n  name: z.string().min(2),\n  email: z.string().email(),\n  age: z.number().int().min(0),\n})\ntype S = z.infer<typeof schema>`,
  `func handler(w http.ResponseWriter,\n  r *http.Request) {\n  json.NewEncoder(w).Encode(\n    map[string]string{"status":"ok"})\n}`,
];

const CARD_THEMES = [
  { bg: "linear-gradient(135deg,#1a0a3d 0%,#2d1b69 100%)", title: "Build a REST API in 10 min", channel: "Fireship", views: "4.2M", badge: "10:14" },
  { bg: "linear-gradient(135deg,#0a1628 0%,#0f3460 100%)", title: "React Hooks Deep Dive", channel: "Theo", views: "1.8M", badge: "24:38" },
  { bg: "linear-gradient(135deg,#0a2a1a 0%,#166534 100%)", title: "Full-Stack Next.js 15 App", channel: "Josh tried coding", views: "3.1M", badge: "48:22" },
  { bg: "linear-gradient(135deg,#2a1500 0%,#92400e 100%)", title: "Python Automation 2024", channel: "TechWithTim", views: "2.7M", badge: "32:05" },
  { bg: "linear-gradient(135deg,#2a0a0a 0%,#991b1b 100%)", title: "Docker from Zero to Hero", channel: "NetworkChuck", views: "5.4M", badge: "41:17" },
  { bg: "linear-gradient(135deg,#111827 0%,#374151 100%)", title: "TypeScript Generics Explained", channel: "Matt Pocock", views: "890K", badge: "18:44" },
  { bg: "linear-gradient(135deg,#1e0a3d 0%,#6b21a8 100%)", title: "Build a SaaS in a Weekend", channel: "Pieter Levels", views: "1.2M", badge: "55:00" },
  { bg: "linear-gradient(135deg,#001f3d 0%,#0369a1 100%)", title: "PostgreSQL Crash Course", channel: "Traversy Media", views: "2.5M", badge: "1:02:19" },
  { bg: "linear-gradient(135deg,#052e16 0%,#15803d 100%)", title: "Go Programming Language", channel: "Dreams of Code", views: "720K", badge: "38:51" },
  { bg: "linear-gradient(135deg,#1a0a0a 0%,#c2410c 100%)", title: "CSS Grid vs Flexbox", channel: "Kevin Powell", views: "3.8M", badge: "21:30" },
  { bg: "linear-gradient(135deg,#0a0a2a 0%,#4338ca 100%)", title: "Deploying to AWS EC2", channel: "TechWorld with Nana", views: "1.5M", badge: "29:44" },
  { bg: "linear-gradient(135deg,#001a1a 0%,#0f766e 100%)", title: "GraphQL API Tutorial", channel: "Ben Awad", views: "980K", badge: "43:12" },
  { bg: "linear-gradient(135deg,#1a001a 0%,#a21caf 100%)", title: "Rust for JavaScript Devs", channel: "Low Level Learning", views: "640K", badge: "33:27" },
  { bg: "linear-gradient(135deg,#0a1a00 0%,#4d7c0f 100%)", title: "Redis Caching Explained", channel: "Coding with Lewis", views: "450K", badge: "16:55" },
  { bg: "linear-gradient(135deg,#001a28 0%,#0e7490 100%)", title: "Build a CLI in Node.js", channel: "The Primeagen", views: "560K", badge: "22:08" },
  { bg: "linear-gradient(135deg,#1f1a00 0%,#a16207 100%)", title: "Kubernetes for Beginners", channel: "TechWorld", views: "4.1M", badge: "1:10:00" },
];

const ROTATIONS = ["-2deg", "1.5deg", "-1deg", "2.5deg", "-1.5deg", "1deg"];
const DURATIONS = [28, 22, 32, 25, 20];
const DIRECTIONS = [false, true, false, true, false];
const COLUMNS = 5;

function makeColumn(colIdx: number) {
  const cards = [];
  for (let i = 0; i < 8; i++) {
    const cardIdx = (colIdx * 3 + i * 2) % CARD_THEMES.length;
    const snippetIdx = (colIdx * 2 + i * 3) % CODE_SNIPPETS.length;
    cards.push({ theme: CARD_THEMES[cardIdx], snippet: CODE_SNIPPETS[snippetIdx], globalIdx: i + colIdx * 8 });
  }
  return cards;
}

export function VideoCollageBackground() {
  const _ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={_ref}
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={{ zIndex: 0 }}
    >
      <style>{`
        @keyframes scroll-up   { from { transform: translateY(0);    } to { transform: translateY(-50%); } }
        @keyframes scroll-down { from { transform: translateY(-50%); } to { transform: translateY(0);    } }
      `}</style>

      <div
        className="absolute inset-0 flex gap-4 items-start justify-center"
        style={{ padding: "0 8px", top: -40 }}
      >
        {Array.from({ length: COLUMNS }).map((_, colIdx) => {
          const cards = makeColumn(colIdx);
          const isDown = DIRECTIONS[colIdx];
          return (
            <div key={colIdx} style={{ width: 192, display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  animation: `${isDown ? "scroll-down" : "scroll-up"} ${DURATIONS[colIdx]}s linear infinite`,
                }}
              >
                {[...cards, ...cards].map((card, i) => {
                  const rot = ROTATIONS[(card.globalIdx + i) % ROTATIONS.length];
                  return (
                    <div
                      key={i}
                      style={{
                        position: "relative",
                        width: 192,
                        height: 120,
                        borderRadius: 12,
                        overflow: "hidden",
                        background: card.theme.bg,
                        transform: `rotate(${rot})`,
                        border: "1px solid rgba(255,255,255,0.07)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
                        flexShrink: 0,
                      }}
                    >
                      {/* Code snippet */}
                      <div style={{ position: "absolute", inset: 0, padding: 8, opacity: 0.55, pointerEvents: "none" }}>
                        <pre style={{ color: "rgba(255,255,255,0.9)", fontSize: 5.5, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.45, overflow: "hidden", whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0 }}>
                          {card.snippet}
                        </pre>
                      </div>
                      {/* Bottom gradient */}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.1) 50%,transparent 100%)" }} />
                      {/* Play button */}
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: 0, height: 0, borderTop: "5.5px solid transparent", borderBottom: "5.5px solid transparent", borderLeft: "10px solid rgba(255,255,255,0.9)", marginLeft: 2 }} />
                        </div>
                      </div>
                      {/* Duration */}
                      <div style={{ position: "absolute", bottom: 28, right: 6, background: "rgba(0,0,0,0.82)", color: "#fff", fontSize: 8, fontFamily: "monospace", padding: "2px 4px", borderRadius: 3 }}>
                        {card.theme.badge}
                      </div>
                      {/* Channel info */}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 8px 6px" }}>
                        <p style={{ color: "#fff", fontSize: 7.5, fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.theme.title}</p>
                        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 6.5, margin: "2px 0 0" }}>{card.theme.channel} · {card.theme.views} views</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edge fades — light mode */}
      <div className="dark:hidden" style={{ position: "absolute", inset: "0 0 auto 0", height: 180, background: "linear-gradient(to bottom,#fff 0%,transparent 100%)" }} />
      <div className="dark:hidden" style={{ position: "absolute", inset: "auto 0 0 0", height: 180, background: "linear-gradient(to top,#fff 0%,transparent 100%)" }} />
      <div className="dark:hidden" style={{ position: "absolute", inset: "0 auto 0 0", width: 72, background: "linear-gradient(to right,#fff 0%,transparent 100%)" }} />
      <div className="dark:hidden" style={{ position: "absolute", inset: "0 0 0 auto", width: 72, background: "linear-gradient(to left,#fff 0%,transparent 100%)" }} />
      {/* Centre vignette — light */}
      <div className="dark:hidden" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.55) 50%, transparent 100%)" }} />

      {/* Edge fades — dark mode */}
      <div className="hidden dark:block" style={{ position: "absolute", inset: "0 0 auto 0", height: 180, background: "linear-gradient(to bottom,#09090b 0%,transparent 100%)" }} />
      <div className="hidden dark:block" style={{ position: "absolute", inset: "auto 0 0 0", height: 180, background: "linear-gradient(to top,#09090b 0%,transparent 100%)" }} />
      <div className="hidden dark:block" style={{ position: "absolute", inset: "0 auto 0 0", width: 72, background: "linear-gradient(to right,#09090b 0%,transparent 100%)" }} />
      <div className="hidden dark:block" style={{ position: "absolute", inset: "0 0 0 auto", width: 72, background: "linear-gradient(to left,#09090b 0%,transparent 100%)" }} />
      {/* Centre vignette — dark */}
      <div className="hidden dark:block" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(9,9,11,0.93) 0%, rgba(9,9,11,0.55) 50%, transparent 100%)" }} />
    </div>
  );
}