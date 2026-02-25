import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  // Liga à Neon usando a variável de ambiente
  const sql = neon(process.env.DATABASE_URL);
  const { phone, click_id } = req.body;

  try {
    // Insere o novo lead ou atualiza o click_id se o telefone já existir (Upsert)
    await sql`
      INSERT INTO leads (phone, click_id)
      VALUES (${phone}, ${click_id})
      ON CONFLICT (phone) 
      DO UPDATE SET click_id = EXCLUDED.click_id;
    `;

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
