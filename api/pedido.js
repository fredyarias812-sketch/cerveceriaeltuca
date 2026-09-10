const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    res.status(401).json({ error: 'No autorizado.' });
    return;
  }

  const id = req.query.id;
  if (!id) {
    res.status(400).json({ error: 'Falta el id del pedido.' });
    return;
  }

  if (req.method === 'PATCH') {
    try {
      const updates = req.body || {};
      const allowed = {};
      if (typeof updates.estado === 'string') allowed.estado = updates.estado;
      if (typeof updates.avisado === 'boolean') allowed.avisado = updates.avisado;
      if (typeof updates.cliente === 'string') allowed.cliente = updates.cliente.slice(0, 200);
      if (typeof updates.domicilio === 'string') allowed.domicilio = updates.domicilio.slice(0, 500);
      if (typeof updates.telefono === 'string') allowed.telefono = updates.telefono.slice(0, 50);
      if (typeof updates.fecha === 'string') allowed.fecha = updates.fecha;
      if (typeof updates.hora === 'string') allowed.hora = updates.hora;
      if (typeof updates.notas === 'string') allowed.notas = updates.notas.slice(0, 500);
      if (Array.isArray(updates.productos) && updates.productos.length > 0) allowed.productos = updates.productos;

      const { data, error } = await supabase
        .from('pedidos')
        .update(allowed)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      res.status(200).json({ ok: true, pedido: data });
    } catch (e) {
      res.status(500).json({ error: 'No se pudo actualizar el pedido.', detalle: e.message || String(e) });
    }
    return;
  }

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase.from('pedidos').delete().eq('id', id);
      if (error) throw error;
      res.status(200).json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: 'No se pudo eliminar el pedido.' });
    }
    return;
  }

  res.status(405).json({ error: 'Método no permitido.' });
};
