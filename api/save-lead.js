import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const { phone, click_id } = req.body;

  try {
    // Salva ou atualiza o lead pelo telefone
    const { data, error } = await supabase
      .from('leads')
      .upsert({ phone, click_id }, { onConflict: 'phone' });

    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
