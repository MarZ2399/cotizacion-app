import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ListaPedidos = ({ onCrearCotizacion }) => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('todos'); // todos, pendiente, cotizado

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      const response = await axios.get('http://localhost:5000/api/pedidos');
      setPedidos(response.data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      toast.error('Error al cargar pedidos');
    } finally {
      setCargando(false);
    }
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtro === 'todos') return true;
    return pedido.estado === filtro;
  });

  const getEstadoBadge = (estado) => {
    const estilos = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      cotizado: 'bg-green-100 text-green-800',
      aprobado: 'bg-blue-100 text-blue-800',
      rechazado: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estilos[estado]}`}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Lista de Pedidos ({pedidos.length})
        </h2>
        
        <button
          onClick={cargarPedidos}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm font-medium"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filtro === 'todos'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro('pendiente')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filtro === 'pendiente'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setFiltro('cotizado')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filtro === 'cotizado'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Cotizados
        </button>
      </div>

      {/* Lista de pedidos */}
      {pedidosFiltrados.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay pedidos {filtro !== 'todos' ? filtro + 's' : ''}
        </div>
      ) : (
        <div className="space-y-4">
          {pedidosFiltrados.map((pedido) => (
            <div
              key={pedido._id}
              className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {pedido.numeroDocumento}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(pedido.fecha).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {getEstadoBadge(pedido.estado)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Empresa:</span>
                  <p className="text-gray-600">{pedido.empresa.nombre}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Contacto:</span>
                  <p className="text-gray-600">{pedido.nombreContacto}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">País:</span>
                  <p className="text-gray-600">{pedido.pais}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Productos:</span>
                  <p className="text-gray-600">{pedido.productos.length} items</p>
                </div>
              </div>

              {pedido.estado === 'pendiente' && (
                <button
                  onClick={() => onCrearCotizacion(pedido)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  📄 Crear Cotización
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaPedidos;
