const mongoose = require('mongoose');

const cotizacionSchema = new mongoose.Schema({
  numeroDocumento: {
    type: String,
    unique: true
  },
  empresa: {
    nombre: { type: String, required: true },
    ruc: String,
    ciudad: String,
    tipo: String
  },
  nombreContacto: {
    type: String,
    required: true
  },
  numeroContacto: {
    type: String,
    required: true
  },
  pais: {
    type: String,
    required: true
  },
  zona: { // ← AGREGAR ESTE CAMPO
    type: String,
    required: true,
    enum: ['Lima', 'Centro', 'Norte', 'Sur']
  },
  productos: [{
    codigo: { type: String, required: true },
    descripcion: { type: String, required: true },
    cantidadPaquetes: { type: Number, required: true },
    piezasPorCajon: { type: Number, required: true },
    tipoProducto: String,
    precioUnitario: { type: Number, required: true },
    precioTotal: { type: Number, required: true }
  }],
  totalGeneral: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aprobado', 'rechazado'],
    default: 'pendiente'
  },
  tipo: {
    type: String,
    default: 'cotizacion'
  },
  pedidoOriginalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pedido'
  },
  fecha: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generar número de documento ANTES de validar
cotizacionSchema.pre('validate', async function(next) {
  if (!this.numeroDocumento) {
    try {
      const count = await mongoose.model('Cotizacion').countDocuments();
      const numero = count + 1;
      this.numeroDocumento = `COT-${String(numero).padStart(6, '0')}`;
      console.log('✅ Número de cotización generado:', this.numeroDocumento);
    } catch (error) {
      console.error('❌ Error al generar número:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Cotizacion', cotizacionSchema);
