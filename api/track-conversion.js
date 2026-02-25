import { neon } from '@neondatabase/serverless';
import axios from 'axios';
import crypto from 'crypto';

function hashData(data) {
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}

export default async function handler(req, res) {
  // Configuração de CORS para a extensão conseguir aceder
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const sql = neon(process.env.DATABASE_URL);
  const { phone, value } = req.body;

  try {
    // 1. Busca o click_id na base de dados da Neon
    const leads = await sql`
      SELECT click_id FROM leads WHERE phone = ${phone} LIMIT 1
    `;
    
    const click_id = leads.length > 0 ? leads[0].click_id : null;

    // 2. Envia para o Meta
    const response = await axios.post(`https://graph.facebook.com/v18.0/${process.env.PIXEL_ID}/events`, {
      data: [{
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'chat',
        user_data: {
          ph: [hashData(phone)], // Obrigatório ser Hash SHA256
          external_id: click_id ? [click_id] : []
        },
        custom_data: {
          currency: 'BRL',
          value: value
        }
      }],
      access_token: process.env.ACCESS_TOKEN
    });

    res.status(200).json({ success: true, meta: response.data });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
}
