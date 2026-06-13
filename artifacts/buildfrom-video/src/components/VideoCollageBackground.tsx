// Real YouTube thumbnails — uses hqdefault.jpg from YouTube CDN (public, no API key needed)
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
// 4 columns, outer two columns scroll, inner area stays lighter
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

      {/* Card columns — 4 cols, capped opacity so content stays readable */}
      <div
        className="absolute inset-0 flex gap-3 items-start justify-center"
        style={{ top: -30, padding: "0 4px", opacity: 0.45 }}
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
                      {/* Real YouTube thumbnail */}
                      <img
                        src={thumbUrl}
                        alt={card.video.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        loading="lazy"
                        decoding="async"
                      />
                      {/* Bottom gradient for readability */}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)" }} />
                      {/* Play button */}
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "1.5px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: "9px solid rgba(255,255,255,0.95)", marginLeft: 2 }} />
                        </div>
                      </div>
                      {/* Duration pill */}
                      <div style={{ position: "absolute", bottom: 24, right: 5, background: "rgba(0,0,0,0.85)", color: "#fff", fontSize: 7.5, fontFamily: "monospace", padding: "1.5px 4px", borderRadius: 3 }}>
                        {card.video.duration}
                      </div>
                      {/* Channel + title */}
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

      {/* ── Overlay system: strong center, fade at edges ───────────────────── */}

      {/* Light mode overlays */}
      <div className="dark:hidden" style={{ position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 55% 55% at 50% 48%, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.88) 35%, rgba(255,255,255,0.55) 65%, transparent 100%)" }} />
      <div className="dark:hidden" style={{ position: "absolute", inset: "0 0 auto 0", height: 120, background: "linear-gradient(to bottom, #ffffff 0%, transparent 100%)" }} />
      <div className="dark:hidden" style={{ position: "absolute", inset: "auto 0 0 0", height: 120, background: "linear-gradient(to top, #ffffff 0%, transparent 100%)" }} />
      <div className="dark:hidden" style={{ position: "absolute", inset: "0 auto 0 0", width: 48, background: "linear-gradient(to right, #ffffff 0%, transparent 100%)" }} />
      <div className="dark:hidden" style={{ position: "absolute", inset: "0 0 0 auto", width: 48, background: "linear-gradient(to left, #ffffff 0%, transparent 100%)" }} />

      {/* Dark mode overlays */}
      <div className="hidden dark:block" style={{ position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 55% 55% at 50% 48%, rgba(9,9,11,0.97) 0%, rgba(9,9,11,0.88) 35%, rgba(9,9,11,0.55) 65%, transparent 100%)" }} />
      <div className="hidden dark:block" style={{ position: "absolute", inset: "0 0 auto 0", height: 120, background: "linear-gradient(to bottom, #09090b 0%, transparent 100%)" }} />
      <div className="hidden dark:block" style={{ position: "absolute", inset: "auto 0 0 0", height: 120, background: "linear-gradient(to top, #09090b 0%, transparent 100%)" }} />
      <div className="hidden dark:block" style={{ position: "absolute", inset: "0 auto 0 0", width: 48, background: "linear-gradient(to right, #09090b 0%, transparent 100%)" }} />
      <div className="hidden dark:block" style={{ position: "absolute", inset: "0 0 0 auto", width: 48, background: "linear-gradient(to left, #09090b 0%, transparent 100%)" }} />
    </div>
  );
}