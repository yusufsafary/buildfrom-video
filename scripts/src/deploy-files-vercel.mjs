import { readFileSync, readdirSync, statSync } from 'fs';
import { createHash } from 'crypto';
import { join, relative } from 'path';

const TOKEN = process.env.VERCEL_TOKEN;
const TEAM_ID = 'team_FQL2L51QuUYN5gsM5ja91r17';
const PROJECT_NAME = 'buildfrom-video';
const DIST = process.env.DIST_DIR || '/home/runner/workspace/artifacts/buildfrom-video/dist/public';

function getAllFiles(dir, list = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) getAllFiles(full, list);
    else list.push(full);
  }
  return list;
}

function sha1(buf) {
  return createHash('sha1').update(buf).digest('hex');
}

async function vApi(path, method = 'GET', body = null, extraHeaders = {}) {
  const sep = path.includes('?') ? '&' : '?';
  const url = `https://api.vercel.com${path}${sep}teamId=${TEAM_ID}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    ...(body !== null ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Vercel ${method} ${path} → ${res.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : {};
}

async function uploadFile(content, digest) {
  const sep = '?';
  const url = `https://api.vercel.com/v2/files${sep}teamId=${TEAM_ID}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/octet-stream',
      'x-vercel-digest': digest,
    },
    body: content,
  });
  if (res.status !== 200 && res.status !== 409) {
    const t = await res.text();
    throw new Error(`Upload failed ${res.status}: ${t.slice(0, 200)}`);
  }
}

async function run() {
  const files = getAllFiles(DIST);
  console.log(`Uploading ${files.length} files from dist...`);

  const filesMeta = [];
  let i = 0;
  for (const file of files) {
    const content = readFileSync(file);
    const digest = sha1(content);
    const relPath = relative(DIST, file);
    await uploadFile(content, digest);
    filesMeta.push({ file: relPath, sha: digest, size: content.length });
    i++;
    process.stdout.write(`\r  ${i}/${files.length} uploaded`);
  }
  console.log('\n');

  console.log('Creating deployment with team context...');
  const data = await vApi('/v13/deployments', 'POST', {
    name: PROJECT_NAME,
    files: filesMeta,
    target: 'production',
    projectSettings: { framework: null },
    routes: [
      { handle: 'filesystem' },
      { src: '/(.*)', dest: '/index.html' },
    ],
  });

  console.log(`✓ Deployment created!`);
  console.log(`  ID:    ${data.id}`);
  console.log(`  URL:   https://${data.url}`);
  console.log(`  State: ${data.readyState || 'QUEUED'}`);

  // Poll until ready
  console.log('\nWaiting for deployment to go READY...');
  for (let attempt = 0; attempt < 18; attempt++) {
    await new Promise(r => setTimeout(r, 10000));
    const status = await vApi(`/v6/deployments/${data.id}`);
    process.stdout.write(`\r  State: ${status.readyState}              `);
    if (status.readyState === 'READY') {
      console.log(`\n\n✓ LIVE at: https://${status.url}`);
      return;
    }
    if (status.readyState === 'ERROR') {
      console.log(`\n✗ Deployment errored.`);
      if (status.errorMessage) console.log('  Reason:', status.errorMessage);
      // Get events
      const events = await vApi(`/v2/deployments/${data.id}/events?limit=30`);
      const list = Array.isArray(events) ? events : (events.events || []);
      list.forEach(e => { const t = e.text || ''; if (t.trim()) console.log(' ', t.trim()); });
      return;
    }
  }
  console.log('\nTimed out waiting. Check Vercel dashboard.');
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
