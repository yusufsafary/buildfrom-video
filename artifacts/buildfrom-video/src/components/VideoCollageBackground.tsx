const YT_VIDEOS = [
  { id: "PkZNo7MFNFg", title: "Learn JavaScript", channel: "freeCodeCamp", duration: "3:26" },
  { id: "rfscVS0vtbw", title: "CSS in 20 Min", channel: "Web Dev Simplified", duration: "20:01" },
  { id: "jS4aFq5-91M", title: "HTML Full Course", channel: "freeCodeCamp", duration: "2:02" },
  { id: "8JJ101D3knE", title: "Python Bootcamp", channel: "freeCodeCamp", duration: "4:26" },
  { id: "WGJJIrtnfpk", title: "Node.js Complete", channel: "freeCodeCamp", duration: "8:16" },
  { id: "59IXerNjihk", title: "Docker Tutorial", channel: "freeCodeCamp", duration: "2:10" },
  { id: "Tn6-PIqc4UM", title: "React 100s", channel: "Fireship", duration: "2:07" },
  { id: "DHjqpvDnNGE", title: "Next.js 100s", channel: "Fireship", duration: "1:54" },
  { id: "zQnBQ4tB3ZA", title: "TypeScript 100s", channel: "Fireship", duration: "2:44" },
  { id: "K374n-_FybA", title: "GraphQL 100s", channel: "Fireship", duration: "2:11" },
  { id: "1Rs2ND1ryYc", title: "SQL Full Course", channel: "freeCodeCamp", duration: "4:20" },
  { id: "pTFZFxd5V2A", title: "Kubernetes", channel: "TechWorld w/ Nana", duration: "3:17" },
];

const TIKTOK_CARDS = [
  { bg: "linear-gradient(160deg,#0f0c29,#302b63,#24243e)", title: "#ReactHooks", sub: "22 files generated", views: "2.1M", icon: "⚛️" },
  { bg: "linear-gradient(160deg,#0d0d2b,#7c3aed50,#c026d330)", title: "#TypeScript", sub: "14 files generated", views: "987K", icon: "🔷" },
  { bg: "linear-gradient(160deg,#0a0010,#be185d40,#ec489940)", title: "#Python30", sub: "9 files generated", views: "3.2M", icon: "🐍" },
  { bg: "linear-gradient(160deg,#001100,#16a34a30,#4ade8030)", title: "#NodeExpress", sub: "18 files generated", views: "654K", icon: "💚" },
  { bg: "linear-gradient(160deg,#0f0e17,#ea580c30,#f25f4c20)", title: "#Docker101", sub: "7 files generated", views: "892K", icon: "🐳" },
  { bg: "linear-gradient(160deg,#00050f,#0369a130,#38bdf830)", title: "#NextJS14", sub: "31 files generated", views: "1.8M", icon: "▲" },
];

const ROTATIONS = ["-1.5deg","1deg","-0.8deg","1.8deg","-1.2deg","0.9deg"];

const COLS = [
  { dur: 30, rev: false },
  { dur: 25, rev: true  },
  { dur: 28, rev: false },
  { dur: 23, rev: true  },
];

const ORBS = [
  { color: "#06b6d4", size: 320, left: "8%",  top: "15%", dur: 8  },
  { color: "#8b5cf6", size: 420, left: "65%", top: "55%", dur: 12 },
  { color: "#ec4899", size: 260, left: "38%", top: "75%", dur: 9  },
];

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: `${5 + i * 6.5}%`,
  size: 2 + (i % 3),
  dur: 6 + (i % 5) * 1.5,
  delay: i * 0.5,
  color: i % 3 === 0 ? "#06b6d4" : i % 3 === 1 ? "#8b5cf6" : "#ffffff",
}));

function makeCards(colIdx: number) {
  const items: Array<{ type: "yt" | "tt"; ytData?: typeof YT_VIDEOS[0]; ttData?: typeof TIKTOK_CARDS[0]; gi: number }> = [];
  for (let i = 0; i < 10; i++) {
    if (i % 4 === 2) {
      items.push({ type: "tt", ttData: TIKTOK_CARDS[(colIdx * 3 + i) % TIKTOK_CARDS.length], gi: colIdx * 10 + i });
    } else {
      items.push({ type: "yt", ytData: YT_VIDEOS[(colIdx * 3 + i) % YT_VIDEOS.length], gi: colIdx * 10 + i });
    }
  }
  return items;
}

export function VideoCollageBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={{ zIndex: -1 }}
    >
      <style>{`
        @keyframes vcb-up   { from{transform:translateY(0)}    to{transform:translateY(-50%)} }
        @keyframes vcb-down { from{transform:translateY(-50%)} to{transform:translateY(0)} }
        @keyframes orb-pulse { 0%,100%{opacity:.22;transform:scale(1)} 50%{opacity:.42;transform:scale(1.18)} }
        @keyframes particle-up { 0%{transform:translateY(0) scale(1);opacity:.85} 100%{transform:translateY(-440px) scale(0);opacity:0} }
        .vcb-col{display:flex;flex-direction:column;gap:10px}
      `}</style>

      {/* Glow orbs */}
      {ORBS.map((o, i) => (
        <div key={i} style={{
          position:"absolute", left:o.left, top:o.top,
          width:o.size, height:o.size, borderRadius:"50%",
          background:o.color, filter:"blur(95px)",
          animation:`orb-pulse ${o.dur}s ease-in-out infinite`,
          animationDelay:`${i * 2.8}s`,
        }} />
      ))}

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <div key={i} style={{
          position:"absolute", left:p.left, bottom:"0",
          width:p.size, height:p.size, borderRadius:"50%",
          background:p.color, opacity:.8,
          animation:`particle-up ${p.dur}s linear infinite`,
          animationDelay:`${p.delay}s`,
        }} />
      ))}

      {/* Card columns */}
      <div className="absolute inset-0 flex gap-3 items-start justify-center"
           style={{ top:-30, padding:"0 4px", opacity:0.88 }}>
        {COLS.map((cfg, colIdx) => {
          const cards = makeCards(colIdx);
          return (
            <div key={colIdx} className="vcb-col" style={{ width:160, flexShrink:0 }}>
              <div className="vcb-col" style={{ animation:`${cfg.rev ? "vcb-down" : "vcb-up"} ${cfg.dur}s linear infinite` }}>
                {[...cards, ...cards].map((card, i) => {
                  const rot = ROTATIONS[(card.gi + i) % ROTATIONS.length];
                  if (card.type === "tt" && card.ttData) {
                    const tt = card.ttData;
                    return (
                      <div key={i} style={{ position:"relative", width:160, height:96, borderRadius:10, overflow:"hidden", transform:`rotate(${rot})`, background:tt.bg, boxShadow:"0 4px 20px rgba(0,0,0,0.55)", flexShrink:0 }}>
                        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 60%)" }} />
                        <div style={{ position:"absolute", top:8, left:8, fontSize:22 }}>{tt.icon}</div>
                        <div style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.55)", borderRadius:4, padding:"2px 5px", fontSize:7, color:"#fff", fontFamily:"monospace" }}>TikTok</div>
                        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"0 8px 6px" }}>
                          <p style={{ color:"#fff", fontSize:8, fontWeight:700, margin:0 }}>{tt.title}</p>
                          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:6.5, margin:"2px 0 0" }}>{tt.sub} · {tt.views}</p>
                        </div>
                      </div>
                    );
                  }
                  if (card.type === "yt" && card.ytData) {
                    const yt = card.ytData;
                    return (
                      <div key={i} style={{ position:"relative", width:160, height:96, borderRadius:10, overflow:"hidden", transform:`rotate(${rot})`, background:"#111", boxShadow:"0 4px 20px rgba(0,0,0,0.5)", flexShrink:0 }}>
                        <img src={`https://img.youtube.com/vi/${yt.id}/hqdefault.jpg`} alt={yt.title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} loading="lazy" decoding="async" />
                        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 55%)" }} />
                        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <div style={{ width:26, height:26, borderRadius:"50%", background:"rgba(0,0,0,0.55)", border:"1.5px solid rgba(255,255,255,0.35)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <div style={{ width:0, height:0, borderTop:"4px solid transparent", borderBottom:"4px solid transparent", borderLeft:"7px solid rgba(255,255,255,0.95)", marginLeft:2 }} />
                          </div>
                        </div>
                        <div style={{ position:"absolute", bottom:20, right:4, background:"rgba(0,0,0,0.85)", color:"#fff", fontSize:6.5, fontFamily:"monospace", padding:"1px 3px", borderRadius:3 }}>{yt.duration}</div>
                        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"0 6px 4px" }}>
                          <p style={{ color:"#fff", fontSize:6.5, fontWeight:600, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{yt.title}</p>
                          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:6, margin:"1px 0 0" }}>{yt.channel}</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dark scrim */}
      <div style={{ position:"absolute", inset:0, background:"rgba(3,3,12,0.66)" }} />
    </div>
  );
}