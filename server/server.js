require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const pedidoRoutes = require('./routes/pedidoRoutes.js');
const cotizacionRoutes = require('./routes/cotizacionRoutes.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL,
    /\.vercel\.app$/
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Log de todas las peticiones
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    console.log(`📊 Base de datos: cotizaciones`);
  })
  .catch((error) => {
    console.error('❌ Error al conectar a MongoDB:', error.message);
  });

// Rutas
app.use('/api/pedido', pedidoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/cotizacion', cotizacionRoutes);
app.use('/api/cotizaciones', cotizacionRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    mensaje: '🚀 API Twyford Glass funcionando',
    whatsapp: process.env.WHATSAPP_NUMBER,
    rutas: {
      pedidos: '/api/pedido',
      listaPedidos: '/api/pedidos',
      cotizacion: '/api/cotizacion',
      listaCotizaciones: '/api/cotizaciones'
    }
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    mensaje: 'Ruta no encontrada',
    ruta: req.path 
  });
});

// Solo para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📱 WhatsApp: ${process.env.WHATSAPP_NUMBER}`);
  });
}

// Exportar para Vercel
module.exports = app;
