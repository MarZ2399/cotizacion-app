// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import cotizacionesRouter from './routes/cotizaciones.js';

// dotenv.config();

// const app = express();

// // Middlewares
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('✅ MongoDB conectado'))
//   .catch(err => console.error('❌ Error MongoDB:', err));

// // Routes
// app.use('/api/cotizaciones', cotizacionesRouter);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
// });
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import pedidoRoutes from './routes/pedidoRoutes.js';
import cotizacionRoutes from './routes/cotizacionRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
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
app.use('/api/cotizacion', cotizacionRoutes);  // ← AGREGAR ESTA LÍNEA
app.use('/api/cotizaciones', cotizacionRoutes); // ← AGREGAR ESTA LÍNEA

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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📱 WhatsApp: ${process.env.WHATSAPP_NUMBER}`);
});
