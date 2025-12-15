const express = require('express');
const Cotizacion = require('../models/Cotizacion.js');
const Pedido = require('../models/Pedido.js');

const router = express.Router();
const WHATSAPP_GESTOR = process.env.WHATSAPP_NUMBER || '+51941030413'; // Tu número

// Crear cotización
router.post('/', async (req, res) => {
  try {
    console.log('📄 Creando cotización:', req.body);
    
    const cotizacion = new Cotizacion(req.body);
    await cotizacion.save();
    
    // Actualizar estado del pedido original si existe
    if (req.body.pedidoOriginalId) {
      await Pedido.findByIdAndUpdate(
        req.body.pedidoOriginalId,
        { estado: 'cotizado' }
      );
    }
    
    console.log('✅ Cotización creada:', cotizacion.numeroDocumento);
    res.status(201).json(cotizacion);
  } catch (error) {
    console.error('❌ Error al crear cotización:', error);
    res.status(400).json({ 
      mensaje: 'Error al crear cotización', 
      error: error.message 
    });
  }
});

// Obtener todas las cotizaciones
router.get('/', async (req, res) => {
  try {
    const cotizaciones = await Cotizacion.find().sort({ fecha: -1 });
    res.json(cotizaciones);
  } catch (error) {
    console.error('Error al obtener cotizaciones:', error);
    res.status(500).json({ mensaje: 'Error al obtener cotizaciones' });
  }
});

// Obtener una cotización por ID
router.get('/:id', async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id);
    
    if (!cotizacion) {
      return res.status(404).json({ mensaje: 'Cotización no encontrada' });
    }
    
    res.json(cotizacion);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener cotización' });
  }
});

// Generar enlace de WhatsApp para cotización
router.post('/:id/whatsapp', async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id);
    
    if (!cotizacion) {
      return res.status(404).json({ mensaje: 'Cotización no encontrada' });
    }

    // Usar el número del cliente (empresa)
    const numeroCliente = cotizacion.numeroContacto;
    
    if (!numeroCliente) {
      return res.status(400).json({ mensaje: 'No hay número de contacto registrado' });
    }

    // Crear mensaje profesional
    let mensaje = `Hola *${cotizacion.nombreContacto}* 👋\n\n`;
    mensaje += `Gracias por su pedido. Le enviamos la cotización solicitada:\n\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `📋 *COTIZACIÓN ${cotizacion.numeroDocumento}*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    mensaje += `🏢 *Empresa:* ${cotizacion.empresa.nombre}\n`;
    mensaje += `🌍 *País:* ${cotizacion.pais}\n\n`;
    mensaje += `📦 *DETALLE DE PRODUCTOS:*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n`;
    
    cotizacion.productos.forEach((producto, index) => {
      mensaje += `\n*${index + 1}. ${producto.codigo}*\n`;
      mensaje += `📝 ${producto.descripcion}\n`;
      mensaje += `📊 Cantidad: *${producto.cantidadPaquetes} paquetes*\n`;
      mensaje += `💰 Precio unitario: S/ ${producto.precioUnitario.toLocaleString('es-PE', { minimumFractionDigits: 2 })}\n`;
      mensaje += `💵 Subtotal: *S/ ${producto.precioTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}*\n`;
    });
    
    mensaje += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `💰 *TOTAL GENERAL: S/ ${cotizacion.totalGeneral.toLocaleString('es-PE', { minimumFractionDigits: 2 })}*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    mensaje += `📅 *Fecha:* ${new Date(cotizacion.fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })}\n\n`;
    mensaje += `✨ *Twyford Glass*\n`;
    mensaje += `📱 Para consultas: ${WHATSAPP_GESTOR}`;

    // Limpiar número del cliente y generar URL
    const numeroLimpio = numeroCliente.replace(/[^0-9]/g, '');
    const mensajeCodificado = encodeURIComponent(mensaje);
    const whatsappUrl = `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`;

    console.log(`📱 Generando WhatsApp para cliente: ${numeroCliente}`);

    res.json({ 
      url: whatsappUrl,
      numeroCliente: numeroCliente,
      numeroGestor: WHATSAPP_GESTOR,
      mensaje: mensaje
    });
    
  } catch (error) {
    console.error('Error al generar WhatsApp:', error);
    res.status(500).json({ mensaje: 'Error al generar enlace de WhatsApp' });
  }
});

module.exports = router;
