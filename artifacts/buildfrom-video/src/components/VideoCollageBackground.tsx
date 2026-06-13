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
    cards.push({ video: VIDEOS[(colIdx * 4 + i * 3) % VIDEOS.length], globalIdx: colIdx * 8 + i });
  }
  return cards;
}

export function VideoCollageBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={{ zIndex: -1 }}
    >
      <style>{`
        @keyframes vcb-up   { from { transform: translateY(0); }    to { transform: translateY(-50%); } }
        @keyframes vcb-down { from { transform: translateY(-50%); } to { transform: translateY(0); } }
        .vcb-col { display: flex; flex-direction: column; gap: 10px; }
      `}</style>

      <div
        className="absolute inset-0 flex gap-3 items-start justify-center"
        style={{ top: -30, padding: "0 4px", opacity: 0.9 }}
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
                  return (
                    <div
                      key={i}
                      style={{
                        position: "relative", width: 168, height: 100, borderRadius: 10,
                        overflow: "hidden", transform: `rotate(${rot})`,
                        boxShadow: "0 4px 18px rgba(0,0,0,0.5)", flexShrink: 0, background: "#111",
                      }}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${card.video.id}/hqdefault.jpg`}
                        alt={card.video.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        loading="lazy" decoding="async"
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }} />
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "1.5px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: 0, height: 0, borderTop: "4.5px solid transparent", borderBottom: "4.5px solid transparent", borderLeft: "8px solid rgba(255,255,255,0.95)", marginLeft: 2 }} />
                        </div>
                      </div>
                      <div style={{ position: "absolute", bottom: 22, right: 5, background: "rgba(0,0,0,0.85)", color: "#fff", fontSize: 7, fontFamily: "monospace", padding: "1px 3px", borderRadius: 3 }}>
                        {card.video.duration}
                      </div>
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 6px 4px" }}>
                        <p style={{ color: "#fff", fontSize: 6.5, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.video.title}</p>
                        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 6, margin: "1px 0 0" }}>{card.video.channel}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dark scrim 68% — thumbnails clearly visible, white text readable on top */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(4, 4, 12, 0.68)" }} />
    </div>
  );
}