import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ListaPedidos from '../components/gestor/ListaPedidos';
import FormularioCotizacion from '../components/gestor/FormularioCotizacion';
import TablaCotizaciones from '../components/gestor/TablaCotizaciones';

const GestorCotizacion = () => {
  const { usuario, logout } = useAuth();
  const [vista, setVista] = useState('pedidos'); // pedidos, cotizaciones
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handleCrearCotizacion = (pedido) => {
    setPedidoSeleccionado(pedido);
    setMostrarFormulario(true);
  };

  const handleCancelarCotizacion = () => {
    setPedidoSeleccionado(null);
    setMostrarFormulario(false);
  };

  const handleGuardarCotizacion = () => {
    setPedidoSeleccionado(null);
    setMostrarFormulario(false);
    setVista('pedidos');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Panel de Gestión - Twyford Glass
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestor: <span className="font-semibold">{usuario?.username}</span>
              </p>
            </div>
            
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-medium"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Navegación de tabs */}
      {!mostrarFormulario && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-4">
              <button
                onClick={() => setVista('pedidos')}
                className={`px-6 py-4 font-semibold transition border-b-2 ${
                  vista === 'pedidos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                📦 Pedidos Recibidos
              </button>
              <button
                onClick={() => setVista('cotizaciones')}
                className={`px-6 py-4 font-semibold transition border-b-2 ${
                  vista === 'cotizaciones'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                📄 Cotizaciones Realizadas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {mostrarFormulario ? (
          <FormularioCotizacion
            pedido={pedidoSeleccionado}
            onCancelar={handleCancelarCotizacion}
            onGuardar={handleGuardarCotizacion}
          />
        ) : (
          <>
            {vista === 'pedidos' && (
              <ListaPedidos onCrearCotizacion={handleCrearCotizacion} />
            )}
            {vista === 'cotizaciones' && <TablaCotizaciones />}
          </>
        )}
      </main>
    </div>
  );
};

export default GestorCotizacion;
