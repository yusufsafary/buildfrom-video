export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { transcript, videoUrl } = req.body || {};
  if (!Array.isArray(transcript) || transcript.length === 0) {
    return res.status(400).json({ error: 'transcript array is required' });
  }

  const text = transcript.map(t => t.text).join(' ');
  const result = generateProject(text, videoUrl || '');
  return res.status(200).json(result);
}

// ─── Stack detection ─────────────────────────────────────────────────────────
function detect(text) {
  const t = text.toLowerCase();
  return {
    react:      /\breact\b/.test(t),
    next:       /\bnext\.?js\b|\bnextjs\b/.test(t),
    vue:        /\bvue\.?js\b|\bvuejs\b|\bnuxt\b/.test(t),
    svelte:     /\bsvelte\b/.test(t),
    angular:    /\bangular\b/.test(t),
    node:       /\bnode\.?js\b|\bnode\s/.test(t),
    express:    /\bexpress\b/.test(t),
    fastify:    /\bfastify\b/.test(t),
    python:     /\bpython\b/.test(t),
    flask:      /\bflask\b/.test(t),
    django:     /\bdjango\b/.test(t),
    typescript: /\btypescript\b|\bts\b/.test(t),
    tailwind:   /\btailwind\b/.test(t),
    prisma:     /\bprisma\b/.test(t),
    mongodb:    /\bmongodb\b|\bmongoose\b/.test(t),
    postgres:   /\bpostgres\b|\bpostgresql\b/.test(t),
    sqlite:     /\bsqlite\b/.test(t),
    graphql:    /\bgraphql\b/.test(t),
    trpc:       /\btrpc\b/.test(t),
    auth:       /\bauth\b|\blogin\b|\bsign.?in\b|\bjwt\b/.test(t),
    crud:       /\bcrud\b|\bdatabase\b|\bdb\b/.test(t),
    todo:       /\btodo\b|\btask\b|\bcheckbox\b/.test(t),
    ecommerce:  /\bshop\b|\bcart\b|\bstripe\b|\bproduct\b/.test(t),
    api:        /\brest.?api\b|\bapi\b|\bendpoint\b|\broute\b/.test(t),
    chat:       /\bchat\b|\bsocket\b|\breal.?time\b|\bwebsocket\b/.test(t),
    blog:       /\bblog\b|\bpost\b|\bcms\b|\bmarkdown\b/.test(t),
  };
}

function extractProjectName(text) {
  const todo   = text.match(/\btodo\b|\btask\s+manager\b/i);
  const blog   = text.match(/\bblog\b|\bpost\b/i);
  const shop   = text.match(/\bshop\b|\bstore\b|\becommerce\b/i);
  const chat   = text.match(/\bchat\b/i);
  const dash   = text.match(/\bdashboard\b/i);
  const notes  = text.match(/\bnotes?\s+app\b/i);
  const calc   = text.match(/\bcalculator\b/i);
  const weather = text.match(/\bweather\b/i);

  if (todo)    return 'todo-app';
  if (blog)    return 'blog-app';
  if (shop)    return 'shop-app';
  if (chat)    return 'chat-app';
  if (dash)    return 'dashboard-app';
  if (notes)   return 'notes-app';
  if (calc)    return 'calculator-app';
  if (weather) return 'weather-app';
  return 'my-app';
}

// ─── Project generators ───────────────────────────────────────────────────────
function generateProject(text, videoUrl) {
  const d = detect(text);
  const name = extractProjectName(text);

  if (d.python || d.flask || d.django) return genPython(d, name, videoUrl, text);
  if (d.next) return genNext(d, name, videoUrl, text);
  if (d.vue) return genVue(d, name, videoUrl, text);
  if (d.express || (d.node && d.api)) return genExpress(d, name, videoUrl, text);
  return genReact(d, name, videoUrl, text);
}

// ─── React (Vite + TypeScript) ────────────────────────────────────────────────
function genReact(d, name, videoUrl, text) {
  const useTailwind = d.tailwind;
  const useTS = d.typescript || true;
  const ext = useTS ? 'tsx' : 'jsx';

  const appContent = d.todo ? reactTodoApp(useTailwind, useTS) :
                     d.blog ? reactBlogApp(useTailwind, useTS) :
                     d.ecommerce ? reactShopApp(useTailwind, useTS) :
                     d.chat ? reactChatApp(useTailwind, useTS) :
                     reactDefaultApp(name, useTailwind, useTS);

  const files = {
    'README.md': { lang: 'markdown', content: readmeMd(name, 'React + TypeScript + Vite', videoUrl, [
      'npm install', 'npm run dev'
    ], d) },
    'package.json': { lang: 'json', content: JSON.stringify({
      name,
      version: '0.1.0',
      private: true,
      scripts: { dev: 'vite', build: 'tsc -b && vite build', preview: 'vite preview' },
      dependencies: {
        react: '^19.0.0', 'react-dom': '^19.0.0',
        ...(d.todo ? { 'uuid': '^9.0.0' } : {}),
        ...(d.ecommerce ? { 'zustand': '^4.5.2' } : {}),
        ...(useTailwind ? {} : {}),
      },
      devDependencies: {
        '@types/react': '^19.0.0', '@types/react-dom': '^19.0.0',
        '@vitejs/plugin-react': '^4.3.4',
        typescript: '^5.6.3', vite: '^6.0.7',
        ...(useTailwind ? { tailwindcss: '^4.0.0', '@tailwindcss/vite': '^4.0.0' } : {}),
      },
    }, null, 2) },
    [`src/App.${ext}`]: { lang: 'typescript', content: appContent },
    'src/main.tsx': { lang: 'typescript', content: mainTsx() },
    'src/index.css': { lang: 'css', content: useTailwind ? '@import "tailwindcss";' : baseCSS() },
    'index.html': { lang: 'html', content: indexHtml(name) },
    'vite.config.ts': { lang: 'typescript', content: viteConfig(useTailwind) },
    'tsconfig.json': { lang: 'json', content: tsconfigJson() },
  };

  if (d.crud || d.mongodb || d.postgres) {
    files['src/api/client.ts'] = { lang: 'typescript', content: apiClient() };
  }

  return { files, structure: buildStructure(files) };
}

// ─── Next.js ──────────────────────────────────────────────────────────────────
function genNext(d, name, videoUrl, text) {
  const files = {
    'README.md': { lang: 'markdown', content: readmeMd(name, 'Next.js 15 + TypeScript', videoUrl, [
      'npm install', 'npm run dev'
    ], d) },
    'package.json': { lang: 'json', content: JSON.stringify({
      name,
      version: '0.1.0',
      private: true,
      scripts: { dev: 'next dev', build: 'next build', start: 'next start', lint: 'next lint' },
      dependencies: {
        next: '^15.0.0', react: '^19.0.0', 'react-dom': '^19.0.0',
        ...(d.prisma ? { '@prisma/client': '^5.20.0' } : {}),
        ...(d.auth ? { 'next-auth': '^5.0.0-beta.25' } : {}),
        ...(d.trpc ? { '@trpc/server': '^11.0.0', '@trpc/client': '^11.0.0', '@trpc/react-query': '^11.0.0' } : {}),
      },
      devDependencies: {
        '@types/node': '^22.0.0', '@types/react': '^19.0.0', '@types/react-dom': '^19.0.0',
        typescript: '^5.6.3', tailwindcss: '^4.0.0',
        ...(d.prisma ? { prisma: '^5.20.0' } : {}),
      },
    }, null, 2) },
    'app/layout.tsx': { lang: 'typescript', content: nextLayout(name, d.tailwind) },
    'app/page.tsx': { lang: 'typescript', content: d.todo ? nextTodoPage() : d.blog ? nextBlogPage() : nextDefaultPage(name) },
    'app/globals.css': { lang: 'css', content: '@import "tailwindcss";\n\nbody { font-family: system-ui, sans-serif; }\n' },
    'next.config.ts': { lang: 'typescript', content: nextConfig() },
    'tsconfig.json': { lang: 'json', content: nextTsconfig() },
  };

  if (d.api || d.crud) {
    files['app/api/route.ts'] = { lang: 'typescript', content: nextApiRoute(d) };
  }
  if (d.prisma) {
    files['prisma/schema.prisma'] = { lang: 'prisma', content: prismaSchema(d) };
  }
  if (d.auth) {
    files['auth.ts'] = { lang: 'typescript', content: nextAuth() };
  }

  return { files, structure: buildStructure(files) };
}

// ─── Vue 3 + Vite ─────────────────────────────────────────────────────────────
function genVue(d, name, videoUrl, text) {
  const files = {
    'README.md': { lang: 'markdown', content: readmeMd(name, 'Vue 3 + TypeScript + Vite', videoUrl, [
      'npm install', 'npm run dev'
    ], d) },
    'package.json': { lang: 'json', content: JSON.stringify({
      name,
      version: '0.1.0',
      private: true,
      scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
      dependencies: { vue: '^3.5.13', 'vue-router': '^4.4.0', ...(d.crud ? { pinia: '^2.2.6' } : {}) },
      devDependencies: {
        '@vitejs/plugin-vue': '^5.2.1', '@vue/tsconfig': '^0.7.0',
        typescript: '^5.6.3', vite: '^6.0.7',
        ...(d.tailwind ? { tailwindcss: '^4.0.0', '@tailwindcss/vite': '^4.0.0' } : {}),
      },
    }, null, 2) },
    'src/App.vue': { lang: 'typescript', content: vueApp(d, name) },
    'src/main.ts': { lang: 'typescript', content: vueMain(d) },
    'index.html': { lang: 'html', content: indexHtml(name) },
    'vite.config.ts': { lang: 'typescript', content: vueViteConfig(d.tailwind) },
    'tsconfig.json': { lang: 'json', content: tsconfigJson() },
  };
  return { files, structure: buildStructure(files) };
}

// ─── Express / Node ───────────────────────────────────────────────────────────
function genExpress(d, name, videoUrl, text) {
  const files = {
    'README.md': { lang: 'markdown', content: readmeMd(name, 'Node.js + Express' + (d.typescript ? ' + TypeScript' : ''), videoUrl, [
      'npm install', 'npm run dev'
    ], d) },
    'package.json': { lang: 'json', content: JSON.stringify({
      name,
      version: '0.1.0',
      private: true,
      scripts: { dev: d.typescript ? 'tsx watch src/index.ts' : 'nodemon src/index.js', build: 'tsc', start: 'node dist/index.js' },
      dependencies: {
        express: '^4.21.2',
        ...(d.mongodb ? { mongoose: '^8.8.0' } : {}),
        ...(d.postgres ? { pg: '^8.13.1', knex: '^3.1.0' } : {}),
        ...(d.auth ? { bcryptjs: '^2.4.3', jsonwebtoken: '^9.0.2' } : {}),
        ...(d.graphql ? { graphql: '^16.9.0', 'express-graphql': '^0.12.0' } : {}),
        cors: '^2.8.5', dotenv: '^16.4.7',
      },
      devDependencies: {
        nodemon: '^3.1.9',
        ...(d.typescript ? { typescript: '^5.6.3', tsx: '^4.19.2', '@types/express': '^5.0.0', '@types/node': '^22.0.0', '@types/cors': '^2.8.17' } : {}),
      },
    }, null, 2) },
    [`src/index.${d.typescript ? 'ts' : 'js'}`]: { lang: d.typescript ? 'typescript' : 'javascript', content: expressIndex(d) },
    [`src/routes/items.${d.typescript ? 'ts' : 'js'}`]: { lang: d.typescript ? 'typescript' : 'javascript', content: expressRoutes(d) },
    '.env.example': { lang: 'plaintext', content: envExample(d) },
    '.gitignore': { lang: 'plaintext', content: nodeGitignore() },
  };
  if (d.typescript) {
    files['tsconfig.json'] = { lang: 'json', content: nodeTsconfig() };
  }
  return { files, structure: buildStructure(files) };
}

// ─── Python / Flask / Django ──────────────────────────────────────────────────
function genPython(d, name, videoUrl, text) {
  const isDjango = d.django;
  const files = {
    'README.md': { lang: 'markdown', content: readmeMd(name, isDjango ? 'Python + Django' : 'Python + Flask', videoUrl, [
      'python -m venv venv', isDjango ? 'source venv/bin/activate' : 'source venv/bin/activate',
      'pip install -r requirements.txt',
      isDjango ? 'python manage.py migrate' : '',
      isDjango ? 'python manage.py runserver' : 'python app.py',
    ].filter(Boolean), d) },
    'requirements.txt': { lang: 'plaintext', content: isDjango
      ? 'Django>=5.0\ndjango-rest-framework>=3.15.0\npython-dotenv>=1.0.0\n'
      : 'Flask>=3.0.0\nflask-cors>=5.0.0\npython-dotenv>=1.0.0\n' + (d.mongodb ? 'pymongo>=4.10.0\n' : '') + (d.postgres ? 'psycopg2-binary>=2.9.9\n' : '') },
    'app.py': { lang: 'python', content: isDjango ? '' : flaskApp(d, name) },
    '.env.example': { lang: 'plaintext', content: envExample(d) },
    '.gitignore': { lang: 'plaintext', content: pythonGitignore() },
  };
  if (!isDjango) {
    files[`routes/${name.replace(/-/g, '_')}.py`] = { lang: 'python', content: flaskRoutes(d) };
  } else {
    delete files['app.py'];
    files['manage.py'] = { lang: 'python', content: djangoManage(name) };
    files[`${name.replace(/-/g, '_')}/settings.py`] = { lang: 'python', content: djangoSettings(name, d) };
    files[`${name.replace(/-/g, '_')}/urls.py`] = { lang: 'python', content: djangoUrls() };
    files['api/views.py'] = { lang: 'python', content: djangoViews(d) };
    files['api/models.py'] = { lang: 'python', content: djangoModels(d) };
  }
  return { files, structure: buildStructure(files) };
}

// ─── Structure builder ────────────────────────────────────────────────────────
function buildStructure(files) {
  const keys = Object.keys(files);
  const dirs = new Set();
  keys.forEach(k => {
    const parts = k.split('/');
    for (let i = 1; i < parts.length; i++) dirs.add(parts.slice(0, i).join('/'));
  });
  const lines = ['/'];
  const top = keys.filter(k => !k.includes('/')).sort();
  const nested = [...dirs].sort();
  top.forEach((f, i) => lines.push(`${i < top.length - 1 || nested.length ? '├─' : '└─'} ${f}`));
  nested.forEach((dir, di) => {
    lines.push(`${di < nested.length - 1 ? '├─' : '└─'} ${dir}/`);
    const dirFiles = keys.filter(k => k.startsWith(dir + '/') && k.split('/').length === dir.split('/').length + 1).sort();
    dirFiles.forEach((f, fi) => {
      lines.push(`${di < nested.length - 1 ? '│' : ' '}  ${fi < dirFiles.length - 1 ? '├─' : '└─'} ${f.split('/').pop()}`);
    });
  });
  return lines.join('\n');
}

// ─── README template ──────────────────────────────────────────────────────────
function readmeMd(name, stack, videoUrl, steps, d) {
  const tech = [];
  if (d.typescript) tech.push('TypeScript');
  if (d.tailwind) tech.push('Tailwind CSS');
  if (d.prisma) tech.push('Prisma ORM');
  if (d.mongodb) tech.push('MongoDB / Mongoose');
  if (d.postgres) tech.push('PostgreSQL');
  if (d.auth) tech.push('Authentication');
  if (d.graphql) tech.push('GraphQL');

  return `# ${name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}

> Generated by [BuildFrom.Video](https://buildfrom.video) from a coding tutorial.
${videoUrl ? `> Source video: ${videoUrl}\n` : ''}
## Stack

**${stack}**${tech.length ? '\n\n- ' + tech.join('\n- ') : ''}

## Getting Started

\`\`\`bash
${steps.join('\n')}
\`\`\`

## Project Structure

See generated files for full implementation.

## Features

${d.auth ? '- User authentication & authorization\n' : ''}${d.crud ? '- Full CRUD operations\n' : ''}${d.api ? '- REST API endpoints\n' : ''}${d.todo ? '- Task management\n' : ''}${d.ecommerce ? '- Shopping cart & products\n' : ''}${d.chat ? '- Real-time messaging\n' : ''}${d.blog ? '- Blog posts & content\n' : ''}- Clean, maintainable code structure
- TypeScript for type safety
- Production-ready setup

## License

MIT
`;
}

// ─── React app templates ──────────────────────────────────────────────────────
function reactTodoApp(tw, ts) {
  return `import { useState } from 'react'

${ts ? `interface Todo {
  id: number
  text: string
  done: boolean
  createdAt: Date
}

` : ''}export default function App() {
  const [todos, setTodos] = useState${ts ? '<Todo[]>' : ''}([])
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState${ts ? "<'all' | 'active' | 'done'>"}('all')

  const add = () => {
    const text = input.trim()
    if (!text) return
    setTodos(prev => [...prev, { id: Date.now(), text, done: false, createdAt: new Date() }])
    setInput('')
  }

  const toggle = (id${ts ? ': number' : ''}) =>
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))

  const remove = (id${ts ? ': number' : ''}) =>
    setTodos(prev => prev.filter(t => t.id !== id))

  const visible = todos.filter(t =>
    filter === 'all' ? true : filter === 'active' ? !t.done : t.done
  )

  return (
    <div${tw ? ' className="min-h-screen bg-gray-50 flex items-center justify-center p-4"' : ''}>
      <div${tw ? ' className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6"' : ''}>
        <h1${tw ? ' className="text-2xl font-bold text-gray-900 mb-6"' : ''}>My Todos</h1>

        <div${tw ? ' className="flex gap-2 mb-6"' : ''}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="What needs to be done?"
            ${tw ? 'className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"' : ''}
          />
          <button onClick={add}${tw ? ' className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"' : ''}>Add</button>
        </div>

        <div${tw ? ' className="flex gap-2 mb-4"' : ''}>
          {(['all', 'active', 'done'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              ${tw ? 'className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${filter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}' : ''}
            >{f}</button>
          ))}
        </div>

        <ul${tw ? ' className="space-y-2"' : ''}>
          {visible.map(todo => (
            <li key={todo.id}${tw ? ' className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group"' : ''}>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggle(todo.id)}
                ${tw ? 'className="w-4 h-4 accent-blue-600"' : ''}
              />
              <span${tw ? ' className={`flex-1 text-sm ${todo.done ? "line-through text-gray-400" : "text-gray-700"}`}' : ''}>{todo.text}</span>
              <button
                onClick={() => remove(todo.id)}
                ${tw ? 'className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all text-xs"' : ''}
              >✕</button>
            </li>
          ))}
          {visible.length === 0 && (
            <p${tw ? ' className="text-center text-gray-400 text-sm py-8"' : ''}>No tasks yet</p>
          )}
        </ul>

        <p${tw ? ' className="text-xs text-gray-400 text-right mt-4"' : ''}>
          {todos.filter(t => !t.done).length} remaining
        </p>
      </div>
    </div>
  )
}
`;
}

function reactBlogApp(tw, ts) {
  return `import { useState } from 'react'

${ts ? `interface Post {
  id: number
  title: string
  excerpt: string
  content: string
  author: string
  date: string
  tags: string[]
}

` : ''}const POSTS${ts ? ': Post[]' : ''} = [
  {
    id: 1,
    title: 'Getting Started with React',
    excerpt: 'Learn the fundamentals of React and build your first component.',
    content: 'React is a JavaScript library for building user interfaces...',
    author: 'Alex',
    date: '2025-01-15',
    tags: ['react', 'javascript', 'tutorial'],
  },
  {
    id: 2,
    title: 'TypeScript Best Practices',
    excerpt: 'Improve your code quality with these TypeScript patterns.',
    content: 'TypeScript adds static typing to JavaScript...',
    author: 'Alex',
    date: '2025-01-22',
    tags: ['typescript', 'best-practices'],
  },
]

export default function App() {
  const [selected, setSelected] = useState${ts ? '<Post | null>' : ''}(null)

  if (selected) {
    return (
      <div${tw ? ' className="max-w-2xl mx-auto px-4 py-12"' : ''}>
        <button onClick={() => setSelected(null)}${tw ? ' className="text-blue-600 hover:underline mb-6 flex items-center gap-1"' : ''}>← Back</button>
        <p${tw ? ' className="text-sm text-gray-500 mb-2"' : ''}>{selected.date} · {selected.author}</p>
        <h1${tw ? ' className="text-3xl font-bold text-gray-900 mb-4"' : ''}>{selected.title}</h1>
        <div${tw ? ' className="flex gap-2 mb-8"' : ''}>
          {selected.tags.map(tag => (
            <span key={tag}${tw ? ' className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs"' : ''}>{tag}</span>
          ))}
        </div>
        <p${tw ? ' className="text-gray-700 leading-relaxed"' : ''}>{selected.content}</p>
      </div>
    )
  }

  return (
    <div${tw ? ' className="max-w-2xl mx-auto px-4 py-12"' : ''}>
      <h1${tw ? ' className="text-3xl font-bold text-gray-900 mb-2"' : ''}>Blog</h1>
      <p${tw ? ' className="text-gray-500 mb-10"' : ''}>Articles on web development</p>
      <div${tw ? ' className="space-y-6"' : ''}>
        {POSTS.map(post => (
          <article key={post.id}${tw ? ' className="border border-gray-100 rounded-2xl p-6 hover:border-gray-300 cursor-pointer transition-colors"' : ''} onClick={() => setSelected(post)}>
            <p${tw ? ' className="text-xs text-gray-400 mb-1"' : ''}>{post.date}</p>
            <h2${tw ? ' className="text-lg font-semibold text-gray-900 mb-2"' : ''}>{post.title}</h2>
            <p${tw ? ' className="text-gray-600 text-sm leading-relaxed mb-3"' : ''}>{post.excerpt}</p>
            <div${tw ? ' className="flex gap-2"' : ''}>
              {post.tags.map(tag => (
                <span key={tag}${tw ? ' className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs"' : ''}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
`;
}

function reactShopApp(tw, ts) {
  return `import { useState } from 'react'

${ts ? `interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
}

interface CartItem extends Product {
  qty: number
}

` : ''}const PRODUCTS${ts ? ': Product[]' : ''} = [
  { id: 1, name: 'Wireless Headphones', price: 79.99, image: 'https://placehold.co/300x300/f0f0f0/666?text=Headphones', category: 'Audio' },
  { id: 2, name: 'Mechanical Keyboard', price: 129.99, image: 'https://placehold.co/300x300/f0f0f0/666?text=Keyboard', category: 'Peripherals' },
  { id: 3, name: 'USB-C Hub', price: 49.99, image: 'https://placehold.co/300x300/f0f0f0/666?text=Hub', category: 'Accessories' },
  { id: 4, name: 'Webcam HD', price: 89.99, image: 'https://placehold.co/300x300/f0f0f0/666?text=Webcam', category: 'Video' },
]

export default function App() {
  const [cart, setCart] = useState${ts ? '<CartItem[]>' : ''}([])
  const [open, setOpen] = useState(false)

  const addToCart = (p${ts ? ': Product' : ''}) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === p.id)
      if (existing) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...p, qty: 1 }]
    })
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = cart.reduce((sum, i) => sum + i.qty, 0)

  return (
    <div${tw ? ' className="min-h-screen bg-gray-50"' : ''}>
      <header${tw ? ' className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10"' : ''}>
        <h1${tw ? ' className="text-xl font-bold"' : ''}>TechShop</h1>
        <button onClick={() => setOpen(true)}${tw ? ' className="relative px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"' : ''}>
          Cart ({count})
        </button>
      </header>

      <main${tw ? ' className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"' : ''}>
        {PRODUCTS.map(p => (
          <div key={p.id}${tw ? ' className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"' : ''}>
            <img src={p.image} alt={p.name}${tw ? ' className="w-full h-44 object-cover"' : ''} />
            <div${tw ? ' className="p-4"' : ''}>
              <p${tw ? ' className="text-xs text-gray-400 mb-1"' : ''}>{p.category}</p>
              <p${tw ? ' className="font-semibold text-gray-900 mb-1"' : ''}>{p.name}</p>
              <p${tw ? ' className="text-blue-600 font-bold mb-3"' : ''}>\${p.price.toFixed(2)}</p>
              <button onClick={() => addToCart(p)}${tw ? ' className="w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"' : ''}>Add to Cart</button>
            </div>
          </div>
        ))}
      </main>

      {open && (
        <div${tw ? ' className="fixed inset-0 bg-black/40 z-50 flex justify-end"' : ''} onClick={() => setOpen(false)}>
          <div${tw ? ' className="bg-white w-full max-w-sm h-full p-6 overflow-y-auto"' : ''} onClick={e => e.stopPropagation()}>
            <h2${tw ? ' className="text-lg font-bold mb-6"' : ''}>Cart ({count})</h2>
            {cart.length === 0 ? <p${tw ? ' className="text-gray-400"' : ''}>Empty cart</p> : (
              <>
                {cart.map(item => (
                  <div key={item.id}${tw ? ' className="flex gap-3 mb-4"' : ''}>
                    <img src={item.image} alt={item.name}${tw ? ' className="w-14 h-14 rounded-lg object-cover"' : ''} />
                    <div${tw ? ' className="flex-1"' : ''}>
                      <p${tw ? ' className="text-sm font-medium"' : ''}>{item.name}</p>
                      <p${tw ? ' className="text-xs text-gray-500"' : ''}>x{item.qty} · \${(item.price * item.qty).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <div${tw ? ' className="border-t border-gray-100 pt-4 mt-4"' : ''}>
                  <p${tw ? ' className="font-bold text-lg"' : ''}>Total: \${total.toFixed(2)}</p>
                  <button${tw ? ' className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"' : ''}>Checkout</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
`;
}

function reactChatApp(tw, ts) {
  return `import { useState, useRef, useEffect } from 'react'

${ts ? `interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

` : ''}const BOT_RESPONSES = [
  "That's interesting! Tell me more.",
  "I understand. How can I help you with that?",
  "Great point! Have you considered the alternatives?",
  "I'm here to help. What else would you like to know?",
  "Thanks for sharing! That makes sense.",
]

export default function App() {
  const [messages, setMessages] = useState${ts ? '<Message[]>' : ''}([
    { id: 0, text: 'Hello! How can I help you today?', sender: 'bot', timestamp: new Date() }
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef${ts ? '<HTMLDivElement | null>' : ''}(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = () => {
    const text = input.trim()
    if (!text) return

    const userMsg${ts ? ': Message' : ''} = { id: Date.now(), text, sender: 'user', timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    setTimeout(() => {
      const botMsg${ts ? ': Message' : ''} = {
        id: Date.now() + 1,
        text: BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)],
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMsg])
    }, 600)
  }

  return (
    <div${tw ? ' className="flex flex-col h-screen bg-gray-50"' : ''}>
      <header${tw ? ' className="bg-white border-b border-gray-100 px-5 py-4"' : ''}>
        <h1${tw ? ' className="font-semibold"' : ''}>Chat</h1>
        <p${tw ? ' className="text-xs text-green-500"' : ''}>● Online</p>
      </header>

      <div${tw ? ' className="flex-1 overflow-y-auto px-4 py-6 space-y-4"' : ''}>
        {messages.map(msg => (
          <div key={msg.id}${tw ? ' className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}' : ''}>
            <div${tw ? ' className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${msg.sender === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"}`}' : ''}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div${tw ? ' className="bg-white border-t border-gray-100 px-4 py-4 flex gap-3"' : ''}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          ${tw ? 'className="flex-1 px-4 py-2.5 bg-gray-50 rounded-full border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"' : ''}
        />
        <button onClick={send}${tw ? ' className="px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"' : ''}>Send</button>
      </div>
    </div>
  )
}
`;
}

function reactDefaultApp(name, tw, ts) {
  const title = name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return `import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div${tw ? ' className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6"' : ''}>
      <h1${tw ? ' className="text-4xl font-bold text-gray-900"' : ''}>${title}</h1>
      <p${tw ? ' className="text-gray-500"' : ''}>Get started by editing <code>src/App.tsx</code></p>
      <button
        onClick={() => setCount(c => c + 1)}
        ${tw ? 'className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"' : ''}
      >
        Count: {count}
      </button>
    </div>
  )
}
`;
}

// ─── Next.js templates ────────────────────────────────────────────────────────
function nextLayout(name, tw) {
  return `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '${name}',
  description: 'Generated by BuildFrom.Video',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body${tw ? ' className="bg-gray-50 text-gray-900 antialiased"' : ''}>{children}</body>
    </html>
  )
}
`;
}

function nextTodoPage() {
  return `'use client'

import { useState } from 'react'

interface Todo { id: string; text: string; done: boolean }

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')

  const add = () => {
    const text = input.trim()
    if (!text) return
    setTodos(prev => [...prev, { id: crypto.randomUUID(), text, done: false }])
    setInput('')
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-8">Todos</h1>
      <div className="flex gap-2 mb-6">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Add a task..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={add} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
      </div>
      <ul className="space-y-2">
        {todos.map(t => (
          <li key={t.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border">
            <input type="checkbox" checked={t.done} onChange={() => setTodos(prev => prev.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} className="w-4 h-4" />
            <span className={t.done ? 'line-through text-gray-400' : ''}>{t.text}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}
`;
}

function nextBlogPage() {
  return `import Link from 'next/link'

const posts = [
  { slug: 'hello-world', title: 'Hello World', date: '2025-01-01', excerpt: 'Welcome to my blog.' },
  { slug: 'getting-started', title: 'Getting Started', date: '2025-01-15', excerpt: 'How to get started with Next.js.' },
]

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-10">Blog</h1>
      <div className="space-y-6">
        {posts.map(post => (
          <article key={post.slug} className="border-b border-gray-100 pb-6">
            <time className="text-sm text-gray-400">{post.date}</time>
            <h2 className="text-xl font-semibold mt-1 mb-2">{post.title}</h2>
            <p className="text-gray-600 text-sm">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </main>
  )
}
`;
}

function nextDefaultPage(name) {
  const title = name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-24">
      <h1 className="text-5xl font-bold">${title}</h1>
      <p className="text-gray-500">Get started by editing <code className="font-mono bg-gray-100 px-2 py-0.5 rounded">app/page.tsx</code></p>
    </main>
  )
}
`;
}

function nextConfig() {
  return `import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
}

export default nextConfig
`;
}

function nextTsconfig() {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2017', lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true, skipLibCheck: true, strict: true,
      noEmit: true, esModuleInterop: true, module: 'esnext',
      moduleResolution: 'bundler', resolveJsonModule: true,
      isolatedModules: true, jsx: 'preserve', incremental: true,
      plugins: [{ name: 'next' }], paths: { '@/*': ['./src/*'] },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  }, null, 2);
}

function nextApiRoute(d) {
  return `import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ items: [], total: 0 })
}

export async function POST(request: Request) {
  const body = await request.json()
  // TODO: Persist to database
  return NextResponse.json({ success: true, data: body }, { status: 201 })
}
`;
}

function nextAuth() {
  return `import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
})
`;
}

// ─── Vue templates ────────────────────────────────────────────────────────────
function vueApp(d, name) {
  const title = name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return `<template>
  <div class="app">
    <header>
      <h1>${title}</h1>
    </header>
    <main>
      <p>Welcome to your Vue 3 app!</p>
      <button @click="count++">Count: {{ count }}</button>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<style scoped>
.app {
  font-family: system-ui, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
`;
}

function vueMain(d) {
  return `import { createApp } from 'vue'
import App from './App.vue'
${d.crud ? "import { createPinia } from 'pinia'\n" : ''}
const app = createApp(App)
${d.crud ? 'app.use(createPinia())\n' : ''}
app.mount('#app')
`;
}

function vueViteConfig(tw) {
  return `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
${tw ? "import tailwindcss from '@tailwindcss/vite'\n" : ''}
export default defineConfig({
  plugins: [
    vue(),
    ${tw ? 'tailwindcss(),' : ''}
  ],
})
`;
}

// ─── Express templates ────────────────────────────────────────────────────────
function expressIndex(d) {
  const isTS = d.typescript;
  return `import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { itemsRouter } from './routes/items${isTS ? '' : '.js'}'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/items', itemsRouter)

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`)
})
`;
}

function expressRoutes(d) {
  return `import { Router } from 'express'

export const itemsRouter = Router()

${d.typescript ? "interface Item { id: number; name: string; createdAt: Date }\n\n" : ''}const items${d.typescript ? ': Item[]' : ''} = []
let nextId = 1

// GET all
itemsRouter.get('/', (_req, res) => {
  res.json({ items, total: items.length })
})

// GET by id
itemsRouter.get('/:id', (req, res) => {
  const item = items.find(i => i.id === Number(req.params.id))
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

// POST create
itemsRouter.post('/', (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })
  const item${d.typescript ? ': Item' : ''} = { id: nextId++, name, createdAt: new Date() }
  items.push(item)
  res.status(201).json(item)
})

// PUT update
itemsRouter.put('/:id', (req, res) => {
  const idx = items.findIndex(i => i.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  items[idx] = { ...items[idx], ...req.body, id: items[idx].id }
  res.json(items[idx])
})

// DELETE
itemsRouter.delete('/:id', (req, res) => {
  const idx = items.findIndex(i => i.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  items.splice(idx, 1)
  res.status(204).end()
})
`;
}

// ─── Python templates ─────────────────────────────────────────────────────────
function flaskApp(d, name) {
  return `from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from routes.${name.replace(/-/g, '_')} import bp

load_dotenv()
app = Flask(__name__)
CORS(app)

app.register_blueprint(bp, url_prefix='/api')

@app.route('/health')
def health():
    return {'status': 'ok'}

if __name__ == '__main__':
    app.run(debug=True, port=5000)
`;
}

function flaskRoutes(d) {
  return `from flask import Blueprint, jsonify, request

bp = Blueprint('items', __name__)
items = []
counter = [1]

@bp.get('/items')
def get_items():
    return jsonify({'items': items, 'total': len(items)})

@bp.post('/items')
def create_item():
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': 'name is required'}), 400
    item = {'id': counter[0], 'name': data['name']}
    counter[0] += 1
    items.append(item)
    return jsonify(item), 201

@bp.put('/items/<int:item_id>')
def update_item(item_id):
    item = next((i for i in items if i['id'] == item_id), None)
    if not item:
        return jsonify({'error': 'Not found'}), 404
    item.update(request.get_json())
    item['id'] = item_id
    return jsonify(item)

@bp.delete('/items/<int:item_id>')
def delete_item(item_id):
    global items
    items = [i for i in items if i['id'] != item_id]
    return '', 204
`;
}

function djangoManage(name) {
  return `#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', '${name.replace(/-/g, '_')}.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError("Couldn't import Django.") from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
`;
}

function djangoSettings(name, d) {
  const appName = name.replace(/-/g, '_');
  return `from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-dev-key-change-in-production')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin', 'django.contrib.auth',
    'django.contrib.contenttypes', 'django.contrib.sessions',
    'django.contrib.messages', 'django.contrib.staticfiles',
    'rest_framework', 'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

ROOT_URLCONF = '${appName}.urls'
WSGI_APPLICATION = '${appName}.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.${d.postgres ? "postgresql" : "sqlite3"}',
        ${d.postgres ? "'NAME': os.getenv('DB_NAME', 'db'),\n        'USER': os.getenv('DB_USER', 'postgres'),\n        'PASSWORD': os.getenv('DB_PASSWORD', ''),\n        'HOST': os.getenv('DB_HOST', 'localhost'),\n        'PORT': os.getenv('DB_PORT', '5432')," : "'NAME': BASE_DIR / 'db.sqlite3',"}
    }
}

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
`;
}

function djangoUrls() {
  return `from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
`;
}

function djangoViews(d) {
  return `from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Item
from .serializers import ItemSerializer

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all().order_by('-created_at')
    serializer_class = ItemSerializer
`;
}

function djangoModels(d) {
  return `from django.db import models

class Item(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name
`;
}

function prismaSchema(d) {
  return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${d.postgres ? 'postgresql' : 'sqlite'}"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
}
`;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function mainTsx() {
  return `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`;
}

function indexHtml(name) {
  const title = name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

function viteConfig(tw) {
  return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
${tw ? "import tailwindcss from '@tailwindcss/vite'\n" : ''}
export default defineConfig({
  plugins: [
    react(),
    ${tw ? 'tailwindcss(),' : ''}
  ],
})
`;
}

function tsconfigJson() {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2020', useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext', skipLibCheck: true,
      moduleResolution: 'bundler', allowImportingTsExtensions: true,
      isolatedModules: true, moduleDetection: 'force',
      noEmit: true, jsx: 'react-jsx', strict: true,
      noUnusedLocals: true, noUnusedParameters: true, noFallthroughCasesInSwitch: true,
    },
    include: ['src'],
  }, null, 2);
}

function nodeTsconfig() {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext',
      outDir: 'dist', rootDir: 'src', strict: true, skipLibCheck: true,
      esModuleInterop: true,
    },
    include: ['src/**/*'], exclude: ['node_modules'],
  }, null, 2);
}

function baseCSS() {
  return `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #fff; color: #111; }
button { cursor: pointer; }
`;
}

function envExample(d) {
  const lines = ['PORT=3000'];
  if (d.mongodb) lines.push('MONGODB_URI=mongodb://localhost:27017/mydb');
  if (d.postgres) lines.push('DATABASE_URL=postgresql://user:password@localhost:5432/mydb');
  if (d.auth) lines.push('JWT_SECRET=your-secret-key-here');
  if (d.prisma) lines.push('DATABASE_URL=file:./dev.db');
  return lines.join('\n') + '\n';
}

function nodeGitignore() {
  return `node_modules/\ndist/\n.env\n*.log\n`;
}

function pythonGitignore() {
  return `__pycache__/\n*.py[cod]\nvenv/\n.env\n*.sqlite3\n*.log\n`;
}

function apiClient() {
  return `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export async function fetchItems() {
  const res = await fetch(\`\${API_URL}/items\`)
  if (!res.ok) throw new Error('Failed to fetch items')
  return res.json()
}

export async function createItem(name: string) {
  const res = await fetch(\`\${API_URL}/items\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('Failed to create item')
  return res.json()
}
`;
}
