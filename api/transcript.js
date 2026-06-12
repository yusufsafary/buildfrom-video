import { YoutubeTranscript } from 'youtube-transcript';

function extractVideoId(url) {
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url query param is required' });

  const videoId = extractVideoId(url);
  if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

  try {
    const raw = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
    const transcript = raw.map(item => {
      const start = (item.offset ?? 0) / 1000;
      const m = Math.floor(start / 60);
      const s = Math.floor(start % 60);
      return {
        t: `${m}:${String(s).padStart(2, '0')}`,
        start,
        text: item.text.replace(/\n/g, ' ').replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim(),
      };
    }).filter(l => l.text);

    return res.status(200).json({ transcript, videoId });
  } catch (err) {
    const msg = String(err.message || err);
    const userMsg = msg.toLowerCase().includes('could not get')
      ? 'No captions found. Make sure the video has subtitles/CC enabled.'
      : msg.toLowerCase().includes('too many')
      ? 'Rate-limited by YouTube. Please wait a moment and try again.'
      : 'Failed to extract transcript. Try a different video or check that it has CC enabled.';
    return res.status(500).json({ error: userMsg });
  }
}
