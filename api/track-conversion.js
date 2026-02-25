import { neon } from '@neondatabase/serverless';
import axios from 'axios';
import crypto from 'crypto';

function hashData(data) {
  if (!data) return '';
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  // Agora extraímos pixel e token do body da requisição
  const { phone, value, currency, pixel_id, access_token } = req.body;

  if (!pixel_id || !access_token) {
    return res.status(400).json({ error: "Pixel ID e Access Token são obrigatórios." });
  }

  const sql = neon(process.env.POSTGRES_URL);

  try {
    // 1. Tenta buscar o click_id, mas se não achar, não para o processo!
    let click_id = null;
    try {
      const leads = await sql`SELECT click_id FROM leads WHERE phone = ${phone} LIMIT 1`;
      if (leads.length > 0) {
        click_id = leads[0].click_id;
      }
    } catch (dbError) {
      console.warn("Nenhum click_id encontrado ou erro no banco. Prosseguindo envio manual.");
    }

    // Monta os dados do usuário. Telefone é obrigatório, external_id é bônus.
    const userData = { ph: [hashData(phone)] };
    if (click_id) {
      userData.external_id = [click_id];
    }

    // 2. Envia para o Meta
    const response = await axios.post(`https://graph.facebook.com/v18.0/${pixel_id}/events`, {
      data: [{
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'chat',
        user_data: userData,
        custom_data: {
          currency: currency || 'BRL',
          value: parseFloat(value) // Garante que o valor vai como número
        }
      }],
      access_token: access_token
    });

    res.status(200).json({ success: true, meta: response.data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
}
