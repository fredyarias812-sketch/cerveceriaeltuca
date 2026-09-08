const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const { cliente, productos, domicilio, telefono, fecha, hora, notas } = body;
      if (!cliente || !domicilio || !telefono || !fecha || !hora || !Array.isArray(productos) || productos.length === 0) {
        res.status(400).json({ error: 'Faltan datos del pedido.' });
        return;
      }
      const { data, error } = await supabase
        .from('pedidos')
        .insert([{
          cliente: String(cliente).slice(0, 200),
          productos,
          domicilio: String(domicilio).slice(0, 500),
          telefono: String(telefono).slice(0, 50),
          fecha,
          hora,
          notas: notas ? String(notas).slice(0, 500) : '',
          estado: 'pendiente',
          avisado: false
        }])
        .select()
        .single();
      if (error) throw error;
      res.status(200).json({ ok: true, pedido: data });
    } catch (e) {
      res.status(500).json({ error: 'No se pudo guardar el pedido.', detalle: e.message || String(e) });
    }
    return;
  }

  if (req.method === 'GET') {
    const token = req.headers['x-admin-token'];
    if (!token || token !== process.env.ADMIN_TOKEN) {
      res.status(401).json({ error: 'No autorizado.' });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true });
      if (error) throw error;
      res.status(200).json({ pedidos: data });
    } catch (e) {
      res.status(500).json({ error: 'No se pudieron cargar los pedidos.', detalle: e.message || String(e) });
    }
    return;
  }

  res.status(405).json({ error: 'Método no permitido.' });
};
