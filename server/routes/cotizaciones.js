import express from 'express';
import Cotizacion from '../models/Cotizacion.js';

const router = express.Router();

// Generar número de cotización
const generarNumeroCotizacion = async () => {
  const count = await Cotizacion.countDocuments();
  return `COT-${String(count + 1).padStart(6, '0')}`;
};

// Crear cotización
router.post('/', async (req, res) => {
  try {
    const numeroDocumento = await generarNumeroCotizacion();
    
    const cotizacion = new Cotizacion({
      numeroDocumento,
      ...req.body
    });

    await cotizacion.save();
    res.status(201).json(cotizacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener todas las cotizaciones
router.get('/', async (req, res) => {
  try {
    const cotizaciones = await Cotizacion.find().sort({ createdAt: -1 });
    res.json(cotizaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener cotización por ID
router.get('/:id', async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id);
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    res.json(cotizacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enviar a WhatsApp
router.post('/:id/whatsapp', async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id);
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    let mensaje = ` *Cotización N° ${cotizacion.numeroDocumento}*\n\n`;
    mensaje += ` Empresa: ${cotizacion.empresa.nombre}\n`;
    mensaje += ` Contacto: ${cotizacion.nombreContacto}\n`;
    mensaje += ` País: ${cotizacion.pais}\n\n`;
    mensaje += `*PRODUCTOS:*\n`;
    
    cotizacion.productos.forEach((prod, idx) => {
      mensaje += `\n${idx + 1}. ${prod.descripcion}\n`;
      mensaje += `   Cant: ${prod.cantidadPaquetes} paquetes - Total: S/ ${prod.precioTotal.toFixed(2)}\n`;
    });
    
    mensaje += `\n*TOTAL: S/ ${cotizacion.totalGeneral.toFixed(2)}*\n\n`;
    mensaje += `*Consideraciones Generales*\n`;
     mensaje += `- Validez de la cotización para 3 días.\n`;

    // Limpiar el número de teléfono (quitar espacios, guiones y el signo +)
    const numeroLimpio = cotizacion.numeroContacto
      .replace(/\s+/g, '')  // Quitar espacios
      .replace(/-/g, '')     // Quitar guiones
      .replace(/\+/g, '');   // Quitar el signo +

    // Construir URL de WhatsApp
    const whatsappURL = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
    
    res.json({ url: whatsappURL, mensaje });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;
