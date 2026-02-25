import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import crypto from 'crypto';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

function hashData(data) {
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}

export default async function handler(req, res) {
  // Configuração de CORS para a extensão conseguir acessar
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { phone, value } = req.body;

  try {
    // 1. Busca o click_id no Supabase usando o telefone
    const { data: leadData } = await supabase
      .from('leads')
      .select('click_id')
      .eq('phone', phone)
      .single();

    const click_id = leadData ? leadData.click_id : null;

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
