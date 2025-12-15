const express = require('express');
const Pedido = require('../models/Pedido.js');

const router = express.Router();
const WHATSAPP_GESTOR = process.env.WHATSAPP_NUMBER || '+51941030413';

// Crear pedido
router.post('/', async (req, res) => {
  try {
    console.log('📦 Creando pedido:', req.body);
    
    const pedido = new Pedido(req.body);
    await pedido.save();
    
    console.log('✅ Pedido creado:', pedido.numeroDocumento);
    res.status(201).json(pedido);
  } catch (error) {
    console.error('❌ Error al crear pedido:', error);
    res.status(400).json({ 
      mensaje: 'Error al crear pedido', 
      error: error.message 
    });
  }
});

// Obtener todos los pedidos
router.get('/', async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ fecha: -1 });
    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ mensaje: 'Error al obtener pedidos' });
  }
});

// Obtener un pedido por ID
router.get('/:id', async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener pedido' });
  }
});

// Generar enlace de WhatsApp para PEDIDO (va al gestor)
router.post('/:id/whatsapp', async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    // Crear mensaje para el GESTOR (tú recibes el pedido)
    let mensaje = `🔔 *NUEVO PEDIDO - ${pedido.numeroDocumento}*\n\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `👤 *DATOS DEL CLIENTE*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `🏢 *Empresa:* ${pedido.empresa.nombre}\n`;
    mensaje += `👤 *Contacto:* ${pedido.nombreContacto}\n`;
    mensaje += `📱 *Teléfono:* ${pedido.numeroContacto}\n`;
    mensaje += `🌍 *País:* ${pedido.pais}\n\n`;
    mensaje += `📦 *PRODUCTOS SOLICITADOS:*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n`;
    
    let totalPaquetes = 0;
    let totalPiezas = 0;
    
    pedido.productos.forEach((producto, index) => {
      const piezas = producto.piezasPorCajon * producto.cantidadPaquetes;
      totalPaquetes += producto.cantidadPaquetes;
      totalPiezas += piezas;
      
      mensaje += `\n*${index + 1}. ${producto.codigo}*\n`;
      mensaje += `   ${producto.descripcion}\n`;
      mensaje += `   Cantidad: *${producto.cantidadPaquetes} paquetes* (${piezas} piezas)\n`;
    });
    
    mensaje += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `📊 *RESUMEN*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `📦 Total paquetes: *${totalPaquetes}*\n`;
    mensaje += `📋 Total piezas: *${totalPiezas}*\n`;
    mensaje += `📅 Fecha: ${new Date(pedido.fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}\n\n`;
    mensaje += `⚡ *Acción requerida:* Crear cotización`;

    // Generar URL para TU número (gestor)
    const numeroLimpio = WHATSAPP_GESTOR.replace(/[^0-9]/g, '');
    const mensajeCodificado = encodeURIComponent(mensaje);
    const whatsappUrl = `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`;

    console.log(`📱 Generando notificación para gestor: ${WHATSAPP_GESTOR}`);

    res.json({ 
      url: whatsappUrl,
      numeroGestor: WHATSAPP_GESTOR,
      numeroCliente: pedido.numeroContacto,
      mensaje: mensaje
    });
    
  } catch (error) {
    console.error('Error al generar WhatsApp:', error);
    res.status(500).json({ mensaje: 'Error al generar enlace de WhatsApp' });
  }
});

// ⬇️ CAMBIAR export default POR module.exports
module.exports = router;
