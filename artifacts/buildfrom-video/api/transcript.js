import { YoutubeTranscript } from 'youtube-transcript';

function detectPlatform(url) {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/tiktok\.com/.test(url)) return 'tiktok';
  return null;
}

function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&?#\s]+)/,
    /youtube\.com\/shorts\/([^&?#\s]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function parseSubtitles(content) {
  const lines = content.split('\n');
  const transcript = [];
  let i = 0;
  if (lines[0]?.trim().startsWith('WEBVTT')) i = 2;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (/^\d+$/.test(line) && i + 1 < lines.length) {
      i++;
      const timeLine = lines[i]?.trim() || '';
      const srtMatch = timeLine.match(/(\d+):(\d+):(\d+)[,.](\d+)\s*-->/);
      if (srtMatch) {
        const start = parseInt(srtMatch[1])*3600 + parseInt(srtMatch[2])*60 + parseInt(srtMatch[3]);
        i++;
        let text = '';
        while (i < lines.length && lines[i]?.trim()) { text += (text?' ':'')+lines[i].trim().replace(/<[^>]+>/g,''); i++; }
        if (text) transcript.push({ t: Math.floor(start/60)+':'+String(Math.floor(start%60)).padStart(2,'0'), start, text });
        continue;
      }
    }
    if (/\d+:\d+[:.].+-->/.test(line)) {
      const vttMatch = line.match(/(?:(\d+):)?(\d+):(\d+)[.:]\d+\s*-->/);
      if (vttMatch) {
        const start = parseInt(vttMatch[1]||'0')*3600+parseInt(vttMatch[2])*60+parseInt(vttMatch[3]);
        i++;
        let text = '';
        while (i<lines.length && lines[i]?.trim() && !/-->/.test(lines[i]) && !/^\d+$/.test(lines[i].trim())) { const t=lines[i].trim().replace(/<[^>]+>/g,''); if(t) text+=(text?' ':'')+t; i++; }
        if (text) transcript.push({ t: Math.floor(start/60)+':'+String(Math.floor(start%60)).padStart(2,'0'), start, text });
        continue;
      }
    }
    i++;
  }
  return transcript.filter(item=>item.text.trim().length>0);
}

async function getTikTokTranscript(url) {
  const apiRes = await fetch('https://www.tikwm.com/api/?url='+encodeURIComponent(url)+'&hd=0',
    { headers:{'User-Agent':'Mozilla/5.0 (compatible; BuildFromVideo/1.0)'}, signal:AbortSignal.timeout(15000) });
  if (!apiRes.ok) throw new Error('Could not connect to TikTok service. Try again later.');
  const data = await apiRes.json();
  if (data.code !== 0 || !data.data) throw new Error('Could not fetch TikTok video. Make sure the URL is public.');
  const videoData = data.data;
  const videoId = videoData.id;
  if (!videoData.subtitles || videoData.subtitles.length === 0)
    throw new Error('No captions found on this TikTok video. Try a video with auto-captions enabled, or use YouTube instead.');
  const subtitle = videoData.subtitles.find(s=>{ const l=(s.language||s.LanguageCodeName||'').toLowerCase(); return l.startsWith('en')||l.includes('eng'); }) || videoData.subtitles[0];
  const subtitleUrl = subtitle.url || subtitle.Url;
  if (!subtitleUrl) throw new Error('Subtitle URL not found in TikTok response.');
  const srtContent = await fetch(subtitleUrl,{signal:AbortSignal.timeout(10000)}).then(r=>r.text());
  const transcript = parseSubtitles(srtContent);
  if (transcript.length===0) throw new Error('Could not parse TikTok captions. Try a different video.');
  return { transcript, videoId };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  if (req.method==='OPTIONS') return res.status(200).end();
  const { url } = req.query;
  if (!url) return res.status(400).json({ error:'url query param is required' });
  const platform = detectPlatform(url);

  if (platform==='youtube') {
    const videoId = extractYouTubeId(url);
    if (!videoId) return res.status(400).json({ error:'Invalid YouTube URL' });
    try {
      const raw = await YoutubeTranscript.fetchTranscript(videoId,{lang:'en'});
      const transcript = raw.map(item=>{
        const start=(item.offset??0)/1000;
        return { t: Math.floor(start/60)+':'+String(Math.floor(start%60)).padStart(2,'0'), start,
          text:item.text.replace(/\n/g,' ').replace(/&#39;/g,"'").replace(/&amp;/g,'&').trim() };
      }).filter(l=>l.text);
      return res.status(200).json({ transcript, videoId });
    } catch(err) {
      const msg=String(err.message||err);
      const userMsg=msg.toLowerCase().includes('could not get')
        ?'No captions found. Make sure the video has subtitles/CC enabled.'
        :msg.toLowerCase().includes('too many')
        ?'Rate-limited by YouTube. Wait a moment and try again.'
        :'Failed to extract transcript. Try a different video with CC enabled.';
      return res.status(500).json({ error:userMsg });
    }
  }

  if (platform==='tiktok') {
    try {
      const { transcript, videoId } = await getTikTokTranscript(url);
      return res.status(200).json({ transcript, videoId });
    } catch(err) {
      return res.status(500).json({ error:String(err.message||err) });
    }
  }

  return res.status(400).json({ error:'Unsupported URL. Paste a YouTube or TikTok video URL.' });
}
