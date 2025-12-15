import mongoose from 'mongoose';

const pedidoSchema = new mongoose.Schema({
  numeroDocumento: {
    type: String,
    unique: true
    // NO poner required: true porque se genera automáticamente
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
  productos: [{
    codigo: { type: String, required: true },
    descripcion: { type: String, required: true },
    cantidadPaquetes: { type: Number, required: true },
    piezasPorCajon: { type: Number, required: true },
    tipoProducto: String,
    precioUnitario: Number
  }],
  estado: {
    type: String,
    enum: ['pendiente', 'cotizado', 'aprobado', 'rechazado'],
    default: 'pendiente'
  },
  tipo: {
    type: String,
    default: 'pedido'
  },
  fecha: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generar número de documento ANTES de validar
pedidoSchema.pre('validate', async function(next) {
  if (!this.numeroDocumento) {
    try {
      const count = await mongoose.model('Pedido').countDocuments();
      const numero = count + 1;
      this.numeroDocumento = `PED-${String(numero).padStart(6, '0')}`;
      console.log('✅ Número de pedido generado:', this.numeroDocumento);
    } catch (error) {
      console.error('❌ Error al generar número:', error);
    }
  }
  next();
});

export default mongoose.model('Pedido', pedidoSchema);
