import { useState, useEffect, useRef, useCallback } from "react";
import { Github, Moon, Sun, Download, Loader2, Check, X, User, LogOut, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MonacoEditor } from "@/components/MonacoEditor";

// ─── API Placeholders ───────────────────────────────────────────────────────
// GITHUB_CLIENT_ID — public, safe to include in frontend
const GITHUB_CLIENT_ID = "Ov23li5RgpdnORSSM76c";
// YOUTUBE_API_KEY — for real transcript extraction (future)
// OPENAI_API_KEY — for AI repo generation (future)
// TRANSCRIPT_ENDPOINT — /api/transcript
// GENERATE_REPO_ENDPOINT — /api/generate

// ─── Types ───────────────────────────────────────────────────────────────────
interface GithubUser { login: string; avatar_url: string; name: string | null; }
interface DeviceCodeResponse {
  device_code: string; user_code: string;
  verification_uri: string; expires_in: number; interval: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_TRANSCRIPT = [
  { t: "0:00", text: "In this tutorial we'll build a full React todo app from scratch." },
  { t: "0:18", text: "First, let's set up the project with npm create vite@latest." },
  { t: "0:42", text: "We'll use TypeScript and the React template for type safety." },
  { t: "1:05", text: "Now install dependencies: npm install, then open in VS Code." },
  { t: "1:30", text: "Let's create our main App component and define the Todo type." },
  { t: "2:10", text: "Adding useState for our todos array and input field state." },
  { t: "2:45", text: "Build the addTodo function — trim whitespace, push to array." },
  { t: "3:20", text: "Rendering the list with .map(), each item gets a delete button." },
  { t: "4:00", text: "Style with CSS modules — minimal, clean, mobile-first layout." },
];

const MOCK_FILES: Record<string, { lang: string; content: string }> = {
  "README.md": {
    lang: "markdown",
    content: `# React Todo App

A minimal, type-safe todo application built with React + TypeScript.

## Setup

\`\`\`bash
npm install
npm run dev
\`\`\`

## Stack
- React 18
- TypeScript
- Vite
- CSS Modules
`,
  },
  "package.json": {
    lang: "json",
    content: `{
  "name": "react-todo-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}`,
  },
  "src/App.tsx": {
    lang: "typescript",
    content: `import { useState } from 'react';
import styles from './App.module.css';

interface Todo { id: number; text: string; done: boolean; }

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    setTodos(prev => [...prev, { id: Date.now(), text, done: false }]);
    setInput('');
  };

  const toggle = (id: number) =>
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const remove = (id: number) =>
    setTodos(prev => prev.filter(t => t.id !== id));

  return (
    <main className={styles.main}>
      <h1>todos</h1>
      <div className={styles.input}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          placeholder="What needs to be done?"
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul className={styles.list}>
        {todos.map(todo => (
          <li key={todo.id} className={todo.done ? styles.done : ''}>
            <span onClick={() => toggle(todo.id)}>{todo.text}</span>
            <button onClick={() => remove(todo.id)}>×</button>
          </li>
        ))}
      </ul>
    </main>
  );
}`,
  },
};

const STEPS = [
  "Extracting transcript",
  "Understanding tutorial context",
  "Generating project structure",
  "Writing source files",
  "Repository ready",
];

// ─── GitHub Device Flow ───────────────────────────────────────────────────────
async function requestDeviceCode(): Promise<DeviceCodeResponse> {
  const res = await fetch("https://github.com/login/device/code", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, scope: "repo,read:user" }),
  });
  if (!res.ok) throw new Error("Failed to start GitHub auth");
  return res.json();
}

async function pollForToken(deviceCode: string, interval: number): Promise<string> {
  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 60; i++) {
    await wait(interval * 1000);
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        device_code: deviceCode,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      }),
    });
    const data = await res.json();
    if (data.access_token) return data.access_token;
    if (data.error === "access_denied") throw new Error("Access denied");
    if (data.error === "expired_token") throw new Error("Code expired. Try again.");
    // authorization_pending or slow_down — keep polling
  }
  throw new Error("Auth timed out");
}

async function fetchGithubUser(token: string): Promise<GithubUser> {
  const res = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error("Invalid token");
  return res.json();
}

// ─── GitHub Repo Creation ─────────────────────────────────────────────────────
async function pushToGithub(token: string, repoName: string, files: Record<string, { content: string }>) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };

  // 1. Create repo
  const repoRes = await fetch("https://api.github.com/user/repos", {
    method: "POST", headers,
    body: JSON.stringify({ name: repoName, description: "Generated by BuildFrom.Video", auto_init: false, private: false }),
  });
  if (!repoRes.ok) {
    const err = await repoRes.json();
    throw new Error(err.message || "Failed to create repo");
  }
  const repo = await repoRes.json();

  // 2. Upload each file via Contents API
  for (const [path, { content }] of Object.entries(files)) {
    const b64 = btoa(unescape(encodeURIComponent(content)));
    await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${path}`, {
      method: "PUT", headers,
      body: JSON.stringify({ message: `feat: add ${path}`, content: b64 }),
    });
  }
  return repo.html_url;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [dark, setDark] = useState(false);
  const [step, setStep] = useState(-1);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [activeFile, setActiveFile] = useState("README.md");
  const demoRef = useRef<HTMLDivElement>(null);

  // GitHub auth state
  const [ghToken, setGhToken] = useState<string | null>(null);
  const [ghUser, setGhUser] = useState<GithubUser | null>(null);
  const [authModal, setAuthModal] = useState(false);
  const [deviceData, setDeviceData] = useState<DeviceCodeResponse | null>(null);
  const [authState, setAuthState] = useState<"idle" | "waiting" | "loading" | "error">("idle");
  const [authError, setAuthError] = useState("");
  const [copied, setCopied] = useState(false);

  // Push state
  const [pushing, setPushing] = useState(false);
  const [pushUrl, setPushUrl] = useState("");
  const [pushError, setPushError] = useState("");

  // Restore session
  useEffect(() => {
    const savedUrl = localStorage.getItem("bfv_url");
    if (savedUrl) setUrl(savedUrl);
    const token = localStorage.getItem("bfv_gh_token");
    if (token) {
      fetchGithubUser(token).then(user => {
        setGhToken(token);
        setGhUser(user);
      }).catch(() => localStorage.removeItem("bfv_gh_token"));
    }
  }, []);

  // Theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const validateUrl = (u: string) =>
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(u.trim());

  const handleGenerate = () => {
    if (!validateUrl(url)) { setUrlError("Enter a valid YouTube URL"); return; }
    setUrlError("");
    localStorage.setItem("bfv_url", url);
    setGenerating(true);
    setGenerated(false);
    setStep(0);
    const delays = [1200, 1800, 1400, 1800, 600];
    let t = 0;
    delays.forEach((d, i) => {
      t += d;
      setTimeout(() => {
        setStep(i + 1);
        if (i === delays.length - 1) {
          setGenerating(false);
          setGenerated(true);
          setTimeout(() => demoRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
        }
      }, t);
    });
  };

  // GitHub Device Flow
  const startAuth = useCallback(async () => {
    setAuthState("loading");
    setAuthError("");
    try {
      const data = await requestDeviceCode();
      setDeviceData(data);
      setAuthState("waiting");
      // Start polling
      pollForToken(data.device_code, data.interval)
        .then(async token => {
          const user = await fetchGithubUser(token);
          localStorage.setItem("bfv_gh_token", token);
          setGhToken(token);
          setGhUser(user);
          setAuthModal(false);
          setAuthState("idle");
          setDeviceData(null);
        })
        .catch(err => {
          setAuthState("error");
          setAuthError(err.message);
        });
    } catch (err: any) {
      setAuthState("error");
      setAuthError(err.message);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("bfv_gh_token");
    setGhToken(null);
    setGhUser(null);
  };

  const copyCode = () => {
    if (deviceData) {
      navigator.clipboard.writeText(deviceData.user_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePush = async () => {
    if (!ghToken || !ghUser) { setAuthModal(true); return; }
    setPushing(true);
    setPushError("");
    setPushUrl("");
    const repoName = `buildfrom-video-${Date.now()}`;
    const files: Record<string, { content: string }> = {};
    for (const [name, { content }] of Object.entries(MOCK_FILES)) {
      files[name] = { content };
    }
    try {
      const url = await pushToGithub(ghToken, repoName, files);
      setPushUrl(url);
    } catch (err: any) {
      setPushError(err.message);
    } finally {
      setPushing(false);
    }
  };

  const handleDownload = () => {
    // Simple client-side download of README as demo
    const content = MOCK_FILES["README.md"].content;
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "README.md";
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-5 gap-4">
        <span className="font-mono font-bold text-sm tracking-tight shrink-0">BuildFrom.Video</span>

        <div className="flex-1 hidden md:block max-w-sm">
          <input
            className="w-full h-8 rounded-full px-4 text-sm bg-muted border-transparent outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground transition-all"
            placeholder="Paste YouTube URL"
            value={url}
            onChange={e => { setUrl(e.target.value); setUrlError(""); }}
            onKeyDown={e => e.key === "Enter" && handleGenerate()}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setDark(d => !d)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {ghUser ? (
            <div className="flex items-center gap-2">
              <img src={ghUser.avatar_url} alt={ghUser.login} className="w-7 h-7 rounded-full border border-border" />
              <span className="text-xs text-muted-foreground hidden sm:block">{ghUser.login}</span>
              <button onClick={logout} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={() => setAuthModal(true)} className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity">
              <Github className="w-3.5 h-3.5" />
              Connect
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col pt-14">

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="flex flex-col items-center justify-center min-h-[88vh] px-5 py-16 text-center">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-8">
            Video → Repository
          </p>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] max-w-3xl mb-6">
            Turn Any Coding Video Into a Repository
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base max-w-md mb-12 leading-relaxed">
            Paste a tutorial. AI extracts the transcript, understands the code, and generates a complete project ready to push to GitHub.
          </p>

          <div className="w-full max-w-lg space-y-3 mb-8">
            <input
              className={`w-full h-13 rounded-full px-6 text-base bg-card border outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground shadow-sm ${urlError ? "border-destructive focus:ring-destructive/30" : "border-border"}`}
              style={{ height: "52px" }}
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={e => { setUrl(e.target.value); setUrlError(""); }}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
            />
            {urlError && <p className="text-destructive text-xs text-left px-4">{urlError}</p>}
          </div>

          <div className="flex gap-3 w-full max-w-sm">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 h-12 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all hover:-translate-y-px active:translate-y-0 flex items-center justify-center gap-2"
            >
              {generating && <Loader2 className="w-4 h-4 animate-spin" />}
              Generate Repository
            </button>
            <button
              onClick={() => demoRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="flex-1 h-12 rounded-full border border-border text-sm font-medium hover:bg-muted transition-all hover:-translate-y-px active:translate-y-0"
            >
              See Demo
            </button>
          </div>

          {/* Generation status log */}
          {(generating || generated) && (
            <div className="mt-10 w-full max-w-sm bg-card border border-border rounded-2xl p-5 text-left">
              <div className="space-y-2.5">
                {STEPS.map((text, i) => {
                  const done = step > i + 1 || (i === 4 && step > 4);
                  const active = step === i + 1;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 font-mono text-xs transition-all duration-300 ${step >= i + 1 ? "opacity-100" : "opacity-0 translate-y-1"}`}
                    >
                      <span className="w-4 flex items-center justify-center shrink-0">
                        {done ? <Check className="w-3.5 h-3.5 text-green-500" /> :
                         active ? <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" /> :
                         <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                      </span>
                      <span className={done ? "text-muted-foreground" : "text-foreground"}>{text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ── Demo Area ──────────────────────────────────────────────────── */}
        <section ref={demoRef} className="px-5 py-20 bg-muted/40 border-t border-border">
          <div className="max-w-5xl mx-auto">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">Workspace</p>
            <h2 className="text-2xl font-bold mb-10">Live generation preview</h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

              {/* Transcript */}
              <div className="md:col-span-4 rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
                <div className="px-4 py-2.5 border-b border-border bg-muted/40">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Transcript</span>
                </div>
                <div className="p-4 overflow-y-auto space-y-2 flex-1 max-h-64 md:max-h-none">
                  {MOCK_TRANSCRIPT.map((line, i) => (
                    <div key={i} className="flex gap-2 text-xs font-mono">
                      <span className="text-muted-foreground shrink-0 w-10">{line.t}</span>
                      <span className={i === 2 ? "text-foreground" : "text-muted-foreground"}>{line.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Repo structure */}
              <div className="md:col-span-3 rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border bg-muted/40">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Structure</span>
                </div>
                <pre className="p-4 text-xs font-mono text-muted-foreground leading-relaxed overflow-x-auto">
{`/
├─ README.md
├─ package.json
└─ src
   ├─ App.tsx
   ├─ App.module.css
   └─ main.tsx`}
                </pre>
              </div>

              {/* Monaco editor */}
              <div className="md:col-span-5 rounded-2xl border border-border bg-card overflow-hidden flex flex-col min-h-72">
                <div className="flex border-b border-border bg-muted/40 overflow-x-auto">
                  {Object.keys(MOCK_FILES).map(name => (
                    <button
                      key={name}
                      onClick={() => setActiveFile(name)}
                      className={`px-4 py-2.5 text-[10px] font-mono whitespace-nowrap border-r border-border transition-colors ${
                        activeFile === name
                          ? "bg-card text-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      {name.split("/").pop()}
                    </button>
                  ))}
                </div>
                <div className="flex-1 relative min-h-60">
                  <MonacoEditor
                    value={MOCK_FILES[activeFile].content}
                    language={MOCK_FILES[activeFile].lang}
                    theme={dark ? "dark" : "light"}
                  />
                </div>
              </div>

            </div>

            {/* Export actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 h-11 px-6 rounded-full border border-border text-sm font-medium hover:bg-muted transition-all hover:-translate-y-px"
              >
                <Download className="w-4 h-4" />
                Download ZIP
              </button>

              <button
                onClick={handlePush}
                disabled={pushing}
                className="flex items-center gap-2 h-11 px-6 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all hover:-translate-y-px"
              >
                {pushing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
                {pushing ? "Pushing..." : ghUser ? `Push as ${ghUser.login}` : "Push to GitHub"}
              </button>

              {pushUrl && (
                <a
                  href={pushUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Check className="w-4 h-4 text-green-500" />
                  Pushed — view on GitHub
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {pushError && <p className="text-destructive text-xs">{pushError}</p>}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-border px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-mono text-xs font-bold">BuildFrom.Video</span>
          <span className="text-xs text-muted-foreground">Turn videos into repositories.</span>
        </div>
      </footer>

      {/* ── GitHub Auth Modal ───────────────────────────────────────────── */}
      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-base">Connect GitHub</h2>
              <button onClick={() => { setAuthModal(false); setAuthState("idle"); setDeviceData(null); }}
                className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {authState === "idle" && (
              <>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Authorize BuildFrom.Video to create GitHub repositories on your behalf. Uses secure Device Flow — no password needed.
                </p>
                <button
                  onClick={startAuth}
                  className="w-full h-11 rounded-xl bg-foreground text-background text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Github className="w-4 h-4" />
                  Continue with GitHub
                </button>
              </>
            )}

            {authState === "loading" && (
              <div className="flex flex-col items-center py-6 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Connecting to GitHub...</p>
              </div>
            )}

            {authState === "waiting" && deviceData && (
              <>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  Open the link below and enter this code:
                </p>
                <div className="bg-muted rounded-xl p-4 mb-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="font-mono text-2xl font-bold tracking-widest">{deviceData.user_code}</span>
                    <button onClick={copyCode} className="p-1 hover:bg-background rounded-lg transition-colors">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Code valid for 15 minutes</p>
                </div>
                <a
                  href={deviceData.verification_uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors mb-4"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open {deviceData.verification_uri}
                </a>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Waiting for authorization...
                </div>
              </>
            )}

            {authState === "error" && (
              <>
                <p className="text-sm text-destructive mb-5">{authError}</p>
                <button
                  onClick={() => setAuthState("idle")}
                  className="w-full h-11 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
