import { useState } from "react";
import { useLocation } from "wouter";
import { Check, ArrowLeft, Loader2, Zap, Code2, Video } from "lucide-react";
import { VideoCollageBackground } from "@/components/VideoCollageBackground";

const ROLES = [
  { id: "developer", label: "Developer",  icon: "💻", desc: "Building side projects & apps" },
  { id: "student",   label: "Student",    icon: "🎓", desc: "Learning from coding tutorials" },
  { id: "creator",   label: "Creator",    icon: "🎬", desc: "Making coding content" },
  { id: "other",     label: "Other",      icon: "✨", desc: "Something else entirely" },
];

export default function SignUp() {
  const [, navigate] = useLocation();
  const [email, setEmail]         = useState("");
  const [role, setRole]           = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [submitted, setSubmitted] = useState(() => !!localStorage.getItem("bfv_waitlist_email"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) { setError("Enter a valid email"); return; }
    if (!role) { setError("Pick your role"); return; }
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    localStorage.setItem("bfv_waitlist_email", email);
    localStorage.setItem("bfv_waitlist_role", role);
    setSubmitted(true); setLoading(false);
  };

  const savedEmail = localStorage.getItem("bfv_waitlist_email") ?? email;

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white relative overflow-hidden">
      <VideoCollageBackground />
      <header className="relative z-10 flex items-center px-6 h-14 border-b border-white/8">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="mx-auto flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <rect width="26" height="26" rx="7" fill="#0F172A"/>
            <path d="M8 7L4 13L8 19" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 7L22 13L18 19" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 10.5L16 13L12 15.5V10.5Z" fill="white"/>
          </svg>
          <span className="font-semibold text-sm">BuildFrom.Video</span>
        </div>
        <div className="w-20" />
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-5 py-12">
        {submitted ? (
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold mb-3">You are on the list!</h1>
            <p className="text-white/60 text-sm mb-2">We will notify <span className="text-white font-medium">{savedEmail}</span> when early access opens.</p>
            <p className="text-white/35 text-xs mb-8">Typically within 2-5 business days.</p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left mb-6">
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/35 mb-3">While you wait</p>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-3 text-sm text-white/70"><span className="text-cyan-400"><Video className="w-4 h-4" /></span>YouTube and TikTok to Repository</li>
                <li className="flex items-center gap-3 text-sm text-white/70"><span className="text-cyan-400"><Code2 className="w-4 h-4" /></span>AI-powered stack detection</li>
                <li className="flex items-center gap-3 text-sm text-white/70"><span className="text-cyan-400"><Zap className="w-4 h-4" /></span>One-click GitHub push</li>
              </ul>
            </div>
            <button onClick={() => navigate("/")} className="h-11 px-8 rounded-full bg-white text-gray-950 text-sm font-semibold hover:opacity-90 transition-opacity">Try it now</button>
          </div>
        ) : (
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Early Access
              </div>
              <h1 className="text-4xl font-bold leading-tight mb-4">Turn any coding video into a repository</h1>
              <p className="text-white/55 text-sm leading-relaxed">Be first to generate full GitHub repos from YouTube and TikTok tutorials automatically.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-white/40 mb-1.5 font-mono uppercase tracking-widest">Email</label>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="you@example.com"
                  className="w-full h-12 rounded-xl px-4 bg-white/8 border border-white/12 text-white placeholder:text-white/25 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-[10px] text-white/40 mb-1.5 font-mono uppercase tracking-widest">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map(r => (
                    <button key={r.id} type="button" onClick={() => { setRole(r.id); setError(""); }}
                      className={`p-3 rounded-xl border text-left transition-all ${role === r.id ? "border-cyan-500/60 bg-cyan-500/10" : "border-white/8 bg-white/4 hover:border-white/18"}`}>
                      <div className="text-xl mb-1">{r.icon}</div>
                      <div className="text-sm font-semibold">{r.label}</div>
                      <div className="text-[11px] text-white/40">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
              <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Joining..." : "Get Early Access"}
              </button>
              <p className="text-center text-[11px] text-white/28">No spam. Unsubscribe anytime. <span className="text-white/45 font-medium">2,847</span> developers joined.</p>
            </form>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[["2,847","Developers"],["180+","Tech stacks"],["14","Languages"]].map(([v,l]) => (
                <div key={l} className="bg-white/4 border border-white/8 rounded-xl p-3">
                  <p className="text-lg font-bold">{v}</p>
                  <p className="text-[10px] text-white/35 font-mono">{l}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}