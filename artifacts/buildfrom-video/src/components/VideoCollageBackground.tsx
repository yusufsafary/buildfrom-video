const VIDEOS = [
  { id: "PkZNo7MFNFg", title: "Learn JavaScript – Full Course", channel: "freeCodeCamp", duration: "3:26:42" },
  { id: "rfscVS0vtbw", title: "Learn CSS in 20 Minutes", channel: "Web Dev Simplified", duration: "20:01" },
  { id: "jS4aFq5-91M", title: "HTML Full Course for Beginners", channel: "freeCodeCamp", duration: "2:02:17" },
  { id: "8JJ101D3knE", title: "Python Full Course for Beginners", channel: "freeCodeCamp", duration: "4:26:52" },
  { id: "WGJJIrtnfpk", title: "Node.js and Express.js – Full Course", channel: "freeCodeCamp", duration: "8:16:48" },
  { id: "59IXerNjihk", title: "Docker Tutorial for Beginners", channel: "freeCodeCamp", duration: "2:10:18" },
  { id: "Tn6-PIqc4UM", title: "React in 100 Seconds", channel: "Fireship", duration: "2:07" },
  { id: "DHjqpvDnNGE", title: "Next.js in 100 Seconds", channel: "Fireship", duration: "1:54" },
  { id: "zQnBQ4tB3ZA", title: "TypeScript in 100 Seconds", channel: "Fireship", duration: "2:44" },
  { id: "K374n-_FybA", title: "GraphQL Explained in 100 Seconds", channel: "Fireship", duration: "2:11" },
  { id: "TNhaISOUy6Q", title: "Svelte in 100 Seconds", channel: "Fireship", duration: "2:02" },
  { id: "k6C8bTYavDw", title: "Vue.js in 100 Seconds", channel: "Fireship", duration: "2:10" },
  { id: "2-3_5e8fzHk", title: "Redux in 100 Seconds", channel: "Fireship", duration: "2:05" },
  { id: "vAoB4VbhRzM", title: "Firebase in 100 Seconds", channel: "Fireship", duration: "1:59" },
  { id: "1Rs2ND1ryYc", title: "SQL Tutorial – Full Database Course", channel: "freeCodeCamp", duration: "4:20:37" },
  { id: "pTFZFxd5V2A", title: "Kubernetes Tutorial for Beginners", channel: "TechWorld with Nana", duration: "3:17:14" },
];

const ROTATIONS = ["-1.5deg", "1deg", "-0.8deg", "1.8deg", "-1.2deg", "0.9deg"];
const COL_CONFIG = [
  { duration: 30, reverse: false },
  { duration: 24, reverse: true  },
  { duration: 28, reverse: false },
  { duration: 22, reverse: true  },
];

function makeCol(colIdx: number) {
  const cards = [];
  for (let i = 0; i < 8; i++) {
    const vi = (colIdx * 4 + i * 3) % VIDEOS.length;
    cards.push({ video: VIDEOS[vi], globalIdx: colIdx * 8 + i });
  }
  return cards;
}

export function VideoCollageBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={{ zIndex: 0 }}
    >
      <style>{`
        @keyframes vcb-up   { from { transform: translateY(0);    } to { transform: translateY(-50%); } }
        @keyframes vcb-down { from { transform: translateY(-50%); } to { transform: translateY(0);    } }
        .vcb-col { display: flex; flex-direction: column; gap: 10px; }
      `}</style>

      {/* Cards — low opacity so they stay ambient */}
      <div
        className="absolute inset-0 flex gap-3 items-start justify-center"
        style={{ top: -30, padding: "0 4px", opacity: 0.28 }}
      >
        {COL_CONFIG.map((cfg, colIdx) => {
          const cards = makeCol(colIdx);
          return (
            <div key={colIdx} className="vcb-col" style={{ width: 168, flexShrink: 0 }}>
              <div
                className="vcb-col"
                style={{ animation: `${cfg.reverse ? "vcb-down" : "vcb-up"} ${cfg.duration}s linear infinite` }}
              >
                {[...cards, ...cards].map((card, i) => {
                  const rot = ROTATIONS[(card.globalIdx + i) % ROTATIONS.length];
                  const thumbUrl = `https://img.youtube.com/vi/${card.video.id}/hqdefault.jpg`;
                  return (
                    <div
                      key={i}
                      style={{
                        position: "relative",
                        width: 168,
                        height: 100,
                        borderRadius: 10,
                        overflow: "hidden",
                        transform: `rotate(${rot})`,
                        boxShadow: "0 3px 16px rgba(0,0,0,0.28)",
                        flexShrink: 0,
                        background: "#111",
                      }}
                    >
                      <img
                        src={thumbUrl}
                        alt={card.video.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        loading="lazy"
                        decoding="async"
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)" }} />
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "1.5px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: "9px solid rgba(255,255,255,0.95)", marginLeft: 2 }} />
                        </div>
                      </div>
                      <div style={{ position: "absolute", bottom: 24, right: 5, background: "rgba(0,0,0,0.85)", color: "#fff", fontSize: 7.5, fontFamily: "monospace", padding: "1.5px 4px", borderRadius: 3 }}>
                        {card.video.duration}
                      </div>
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 7px 5px" }}>
                        <p style={{ color: "#fff", fontSize: 7, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.video.title}</p>
                        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 6, margin: "1.5px 0 0" }}>{card.video.channel}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── LIGHT MODE: very strong solid white center ──────────────── */}
      {/* Solid white block covering 70% of center */}
      <div className="dark:hidden" style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 70% 65% at 50% 48%, #ffffff 0%, #ffffff 45%, rgba(255,255,255,0.96) 60%, rgba(255,255,255,0.7) 80%, transparent 100%)"
      }} />
      {/* Hard top/bottom/side fades */}
      <div className="dark:hidden" style={{ position: "absolute", inset: "0 0 auto 0", height: 100, background: "linear-gradient(to bottom, #ffffff 0%, transparent 100%)" }} />
      <div className="dark:hidden" style={{ position: "absolute", inset: "auto 0 0 0", height: 100, background: "linear-gradient(to top, #ffffff 0%, transparent 100%)" }} />
      <div className="dark:hidden" style={{ position: "absolute", inset: "0 auto 0 0", width: 32, background: "#ffffff" }} />
      <div className="dark:hidden" style={{ position: "absolute", inset: "0 0 0 auto", width: 32, background: "#ffffff" }} />

      {/* ── DARK MODE: very strong solid dark center ────────────────── */}
      <div className="hidden dark:block" style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 70% 65% at 50% 48%, #09090b 0%, #09090b 45%, rgba(9,9,11,0.96) 60%, rgba(9,9,11,0.7) 80%, transparent 100%)"
      }} />
      <div className="hidden dark:block" style={{ position: "absolute", inset: "0 0 auto 0", height: 100, background: "linear-gradient(to bottom, #09090b 0%, transparent 100%)" }} />
      <div className="hidden dark:block" style={{ position: "absolute", inset: "auto 0 0 0", height: 100, background: "linear-gradient(to top, #09090b 0%, transparent 100%)" }} />
      <div className="hidden dark:block" style={{ position: "absolute", inset: "0 auto 0 0", width: 32, background: "#09090b" }} />
      <div className="hidden dark:block" style={{ position: "absolute", inset: "0 0 0 auto", width: 32, background: "#09090b" }} />
    </div>
  );
}