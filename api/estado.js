const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Endpoint público: solo devuelve datos de UN pedido si se conoce su id exacto.
// No se puede listar ni adivinar pedidos por aquí, así que no requiere token.
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método no permitido.' });
    return;
  }

  const id = req.query.id;
  if (!id) {
    res.status(400).json({ error: 'Falta el id del pedido.' });
    return;
  }

  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('cliente, productos, fecha, hora, estado')
      .eq('id', id)
      .single();
    if (error || !data) {
      res.status(404).json({ error: 'No se encontró ese pedido.' });
      return;
    }
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).json({ pedido: data });
  } catch (e) {
    res.status(500).json({ error: 'No se pudo consultar el pedido.' });
  }
};
