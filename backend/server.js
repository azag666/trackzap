const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const PIXEL_ID = 'TEU_PIXEL_ID';
const ACCESS_TOKEN = 'TEU_TOKEN_META';

app.post('/track-conversion', async (req, res) => {
  const { phone, value, click_id } = req.body;

  try {
    const response = await axios.post(`https://graph.facebook.com/v18.0/${PIXEL_ID}/events`, {
      data: [{
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'chat',
        user_data: {
          ph: [hashPhone(phone)], // O telefone deve ser enviado em SHA256
          external_id: [click_id]
        },
        custom_data: {
          currency: 'BRL',
          value: value
        }
      }],
      access_token: ACCESS_TOKEN
    });
    res.json({ success: true, meta: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Servidor de Track rodando na porta 3000'));
