import { useState, useEffect, useRef } from "react";
import { Github, Moon, Sun, Play, Download, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MonacoEditor } from "@/components/MonacoEditor";

const MOCK_FILES = {
  "README.md": `# React Todo App\n\nA simple React todo application built from the tutorial.\n\n## Setup\n\`\`\`bash\nnpm install\nnpm start\n\`\`\`\n`,
  "package.json": `{\n  "name": "react-todo-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  }\n}`,
  "app.js": `import React, { useState } from 'react';\n\nexport default function App() {\n  const [todos, setTodos] = useState([]);\n  \n  return (\n    <div>\n      <h1>Todo App</h1>\n      {/* ... */}\n    </div>\n  );\n}`
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(-1);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof typeof MOCK_FILES>("README.md");
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUrl = localStorage.getItem("lastUrl");
    if (savedUrl) setUrl(savedUrl);
    
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const validateUrl = (url: string) => {
    const pattern = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/;
    return pattern.test(url);
  };

  const handleGenerate = () => {
    if (!validateUrl(url)) {
      setError("Please enter a valid YouTube URL");
      return;
    }
    setError("");
    localStorage.setItem("lastUrl", url);
    setIsGenerating(true);
    setGenerationStep(0);

    const steps = [1000, 2000, 1500, 2000, 500];
    let totalDelay = 0;
    
    steps.forEach((delay, index) => {
      totalDelay += delay;
      setTimeout(() => {
        setGenerationStep(index + 1);
        if (index === steps.length - 1) {
          setIsGenerating(false);
          demoRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }, totalDelay);
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-sm z-50 flex items-center px-4 md:px-8 justify-between">
        <div className="font-mono font-bold tracking-tighter text-lg">BuildFrom.Video</div>
        
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <Input 
            className="rounded-full bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:bg-background transition-all"
            placeholder="Paste YouTube URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowGithubModal(true)}>
            <Github className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col pt-16">
        <section className="min-h-[90vh] flex flex-col items-center justify-center px-4 py-20 text-center max-w-4xl mx-auto w-full">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Turn Any Coding Video Into a Repository
          </h1>
          <p className="text-muted-foreground uppercase tracking-widest text-sm font-medium mb-12">
            Paste a tutorial. Generate a project. Export to GitHub.
          </p>

          <div className="w-full max-w-xl space-y-4 mb-12">
            <Input 
              className="rounded-full h-14 px-6 text-lg bg-card border-border shadow-sm focus-visible:ring-1 transition-all"
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
            />
            {error && <p className="text-destructive text-sm text-left px-4">{error}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button 
              size="lg" 
              className="rounded-full h-14 px-8 text-base transition-transform hover:-translate-y-0.5"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              Generate Repository
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full h-14 px-8 text-base transition-transform hover:-translate-y-0.5"
              onClick={() => demoRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              Watch Demo
            </Button>
          </div>

          {isGenerating && (
            <div className="mt-12 text-left w-full max-w-md bg-card p-6 rounded-2xl border font-mono text-sm shadow-sm">
              <div className="space-y-3">
                {[
                  "Extracting transcript...",
                  "Understanding tutorial context...",
                  "Generating project structure...",
                  "Writing source files...",
                  "Repository ready"
                ].map((text, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center gap-3 transition-opacity duration-500 ${
                      generationStep >= i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                  >
                    {generationStep === i && i < 4 ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : generationStep > i ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="w-4" />
                    )}
                    <span className={generationStep > i ? 'text-muted-foreground' : ''}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section ref={demoRef} className="py-24 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              <Card className="md:col-span-8 overflow-hidden rounded-2xl border-border bg-card">
                <div className="px-4 py-2 border-b bg-muted/50 flex items-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Video Preview</span>
                </div>
                <CardContent className="p-0 aspect-video bg-black flex items-center justify-center relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="h-16 w-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors z-10">
                    <Play className="h-8 w-8 text-white fill-white ml-1" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <div className="h-1 w-full bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-destructive" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-4 overflow-hidden rounded-2xl border-border bg-card flex flex-col">
                <div className="px-4 py-2 border-b bg-muted/50 flex items-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Transcript Log</span>
                </div>
                <CardContent className="p-6 font-mono text-xs text-muted-foreground leading-relaxed h-full overflow-y-auto space-y-2">
                  <p>00:00 - In this tutorial we'll build a React app...</p>
                  <p>00:15 - First let's set up the project structure...</p>
                  <p className="text-foreground">00:30 - We'll start with npm init...</p>
                  <p>00:45 - Now create an index.js file...</p>
                  <p>01:10 - Let's import the necessary dependencies...</p>
                  <p>01:30 - Define the main App component...</p>
                  <p>02:00 - Adding state with useState hook...</p>
                </CardContent>
              </Card>

              <Card className="md:col-span-3 overflow-hidden rounded-2xl border-border bg-card">
                <div className="px-4 py-2 border-b bg-muted/50 flex items-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Structure</span>
                </div>
                <CardContent className="p-6 font-mono text-sm whitespace-pre text-muted-foreground">
                  {`/\n├─ README.md\n├─ package.json\n├─ src\n│  ├─ app.js\n│  ├─ components\n│  └─ styles\n└─ public`}
                </CardContent>
              </Card>

              <Card className="md:col-span-9 overflow-hidden rounded-2xl border-border bg-card flex flex-col min-h-[400px]">
                <div className="flex border-b bg-muted/50 overflow-x-auto hide-scrollbar">
                  {(Object.keys(MOCK_FILES) as Array<keyof typeof MOCK_FILES>).map((file) => (
                    <button
                      key={file}
                      onClick={() => setActiveTab(file)}
                      className={`px-6 py-3 text-xs font-mono border-r transition-colors ${
                        activeTab === file 
                          ? 'bg-card text-foreground font-medium border-b-2 border-b-foreground' 
                          : 'text-muted-foreground hover:bg-muted/80 border-b-2 border-b-transparent'
                      }`}
                    >
                      {file}
                    </button>
                  ))}
                </div>
                <CardContent className="p-0 flex-1 relative">
                  <MonacoEditor 
                    value={MOCK_FILES[activeTab]} 
                    language={activeTab.endsWith('.js') ? 'javascript' : activeTab.endsWith('.json') ? 'json' : 'markdown'}
                    theme={theme}
                  />
                </CardContent>
              </Card>

            </div>

            <div className="mt-12 flex flex-col sm:flex-row justify-end gap-4">
              <Button variant="outline" size="lg" className="rounded-full h-12 px-8">
                <Download className="mr-2 h-4 w-4" />
                Download ZIP
              </Button>
              <Button size="lg" className="rounded-full h-12 px-8" onClick={() => setShowGithubModal(true)}>
                <Github className="mr-2 h-4 w-4" />
                Push to GitHub
              </Button>
            </div>

          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-mono text-sm font-bold">BuildFrom.Video</span>
          <span className="text-xs text-muted-foreground">Turn videos into repositories.</span>
        </div>
      </footer>

      <Dialog open={showGithubModal} onOpenChange={setShowGithubModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Connect GitHub to push directly</DialogTitle>
            <DialogDescription>
              Authorize BuildFrom.Video to create a repository on your behalf.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-8">
            <Button size="lg" className="w-full rounded-xl h-12">
              <Github className="mr-2 h-5 w-5" />
              Connect with GitHub
            </Button>
            {/* GITHUB_OAUTH placeholder */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
