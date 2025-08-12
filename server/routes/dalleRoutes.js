// server/routes/dalleRoutes.js
import express from 'express';
import * as dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const HF_KEY = process.env.HF_API_KEY;

router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }
    if (!HF_KEY) {
      return res.status(500).json({ error: 'HF_API_KEY missing on server' });
    }

    const resp = await fetch(
      'https://router.huggingface.co/fal-ai/fal-ai/qwen-image',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          sync_mode: true
        }),
      }
    );

    const data = await resp.json();

    if (!resp.ok) {
      return res.status(resp.status).json({ error: data?.error || JSON.stringify(data) });
    }

    // Expect: data.images[0].url = "data:image/png;base64,..."
    if (!data.images || !data.images[0]?.url) {
      return res.status(500).json({ error: 'No image returned from fal-ai' });
    }

    const imageUrl = data.images[0].url; // already data URI
    const base64Part = imageUrl.split(',')[1]; // remove "data:image/png;base64,"
    const mime = imageUrl.match(/^data:(.*?);base64/)?.[1] || 'image/png';

    return res.status(200).json({
      photo: base64Part,
      mimetype: mime,
      source: 'fal-ai'
    });

  } catch (err) {
    console.error('fal-ai image error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate image' });
  }
});

export default router;
