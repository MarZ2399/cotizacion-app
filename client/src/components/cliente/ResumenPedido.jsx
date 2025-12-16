import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { API_URL } from '../../config/api';
import ZONAS_WHATSAPP from '../../config/zonas'; // ← IMPORTAR CONFIGURACIÓN DE ZONAS

const ResumenPedido = ({ datosEmpresa, productos, onBack, onEdit }) => {
  const [enviando, setEnviando] = useState(false);

  const handleEnviarPedido = async () => {
    setEnviando(true);
    
    try {
      const pedido = {
        empresa: {
          nombre: datosEmpresa.nombreEmpresa,
          ruc: '',
          ciudad: '',
          tipo: ''
        },
        nombreContacto: datosEmpresa.nombreContacto,
        numeroContacto: datosEmpresa.numeroContacto,
        pais: datosEmpresa.pais,
        zona: datosEmpresa.zona, // ← INCLUIR ZONA EN EL PEDIDO
        productos: productos,
        tipo: 'pedido'
      };

      // Guardar pedido en el backend
      const response = await axios.post(`${API_URL}/api/pedido`, pedido);
      
      // ✅ OBTENER EL NÚMERO DE WHATSAPP SEGÚN LA ZONA SELECCIONADA
      const numeroWhatsApp = ZONAS_WHATSAPP[datosEmpresa.zona] || ZONAS_WHATSAPP['Lima'];
      
      // ✅ GENERAR MENSAJE DE WHATSAPP
      const mensaje = generarMensajeWhatsApp(response.data);
      
      // ✅ CREAR URL DE WHATSAPP CON EL NÚMERO CORRESPONDIENTE
      const whatsappURL = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensaje)}`;

      toast.success('Pedido enviado exitosamente');
      
      // Abrir WhatsApp con el número correcto
      window.open(whatsappURL, '_blank');
      
      // Recargar página después de 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error al enviar pedido:', error);
      toast.error('Error al enviar el pedido');
    } finally {
      setEnviando(false);
    }
  };

  // ✅ FUNCIÓN PARA GENERAR EL MENSAJE DE WHATSAPP
  const generarMensajeWhatsApp = (pedido) => {
    let mensaje = `🚀 *NUEVO PEDIDO - ${pedido.numeroDocumento}*\n\n`;
    mensaje += `👤 *Empresa:* ${pedido.empresa.nombre}\n`;
    mensaje += `📱 *Contacto:* ${pedido.nombreContacto}\n`;
    mensaje += `📞 *Teléfono:* ${pedido.numeroContacto}\n`;
    mensaje += `🌍 *País:* ${pedido.pais}\n`;
    mensaje += `📍 *Zona:* ${pedido.zona}\n\n`;
    mensaje += `📦 *PRODUCTOS:*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n`;
    
    pedido.productos.forEach((prod, index) => {
      mensaje += `${index + 1}. *${prod.codigo}*\n`;
      mensaje += `   ${prod.descripcion}\n`;
      mensaje += `   📦 ${prod.cantidadPaquetes} paquetes`;
      mensaje += ` (${prod.piezasPorCajon * prod.cantidadPaquetes} piezas)\n\n`;
    });
    
    const totalPaquetes = pedido.productos.reduce((sum, p) => sum + p.cantidadPaquetes, 0);
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `📊 *Total:* ${totalPaquetes} paquetes\n\n`;
    mensaje += `🕐 *Fecha:* ${new Date(pedido.fecha).toLocaleString('es-ES')}`;
    
    return mensaje;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Resumen del Pedido
      </h2>

      {/* Información de la empresa */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Información de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Empresa:</span>
            <p className="text-gray-600">{datosEmpresa.nombreEmpresa}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">País:</span>
            <p className="text-gray-600">{datosEmpresa.pais}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Contacto:</span>
            <p className="text-gray-600">{datosEmpresa.nombreContacto}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Teléfono:</span>
            <p className="text-gray-600">{datosEmpresa.numeroContacto}</p>
          </div>
          {/* ✅ MOSTRAR ZONA */}
          <div>
            <span className="font-medium text-gray-700">Zona:</span>
            <p className="text-gray-600 font-semibold text-blue-600">{datosEmpresa.zona}</p>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Productos</h3>
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Editar
          </button>
        </div>
        
        <div className="space-y-3">
          {productos.map((producto, index) => (
            <div
              key={index}
              className="flex justify-between items-center border border-gray-200 rounded-lg p-4"
            >
              <div>
                <h4 className="font-semibold text-gray-800">{producto.codigo}</h4>
                <p className="text-sm text-gray-600">{producto.descripcion}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">
                  {producto.cantidadPaquetes} paquetes
                </p>
                <p className="text-sm text-gray-600">
                  {producto.piezasPorCajon * producto.cantidadPaquetes} piezas
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Total de Paquetes:</span>
            <span className="font-bold text-xl text-blue-600">
              {productos.reduce((sum, p) => sum + p.cantidadPaquetes, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          disabled={enviando}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg disabled:opacity-50"
        >
          ← Atrás
        </button>
        <button
          onClick={handleEnviarPedido}
          disabled={enviando}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : 'Enviar Pedido 📱'}
        </button>
      </div>
    </div>
  );
};

export default ResumenPedido;
