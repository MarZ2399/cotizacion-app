import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import FormularioEmpresa from '../components/cliente/FormularioEmpresa';
import SeleccionProductos from '../components/cliente/SeleccionProductos';
import ResumenPedido from '../components/cliente/ResumenPedido';
import logo from '../assets/logo.png';

const ClientePedido = () => {
  const [paso, setPaso] = useState(1);
  const [datosEmpresa, setDatosEmpresa] = useState(null);
  const [productos, setProductos] = useState([]);

  const handleSiguientePaso = (datos) => {
    if (paso === 1) {
      setDatosEmpresa(datos);
      setPaso(2);
    } else if (paso === 2) {
      setProductos(datos);
      setPaso(3);
    }
  };

  const handlePasoAnterior = () => {
    setPaso(paso - 1);
  };

  const handleEditarProductos = () => {
    setPaso(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <Toaster position="top-right" />
      
      {/* Header */}
<header className="bg-white shadow-md">
  <div className="max-w-7xl mx-auto px-4 py-6">
    <div className="flex items-center justify-between">
      {/* Logo + Título */}
      <div className="flex items-center gap-4">
        <img 
          src={logo} 
          alt="Twyford Glass Logo" 
          className="h-20 w-auto object-contain"
        />
        {/* ← Texto oculto en móvil, visible desde tablet (md) */}
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold text-gray-800">Twyford Glass</h1>
          <p className="text-gray-600 mt-1">Realizar Pedido</p>
        </div>
      </div>
      
      {/* Botón amarillo */}
      <a
        href="/login"
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2.5 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        Acceso Gestor →
      </a>
    </div>
  </div>
</header>

      {/* Indicador de pasos */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              paso >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            } font-semibold`}>
              1
            </div>
            <div className={`w-20 h-1 ${paso >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              paso >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            } font-semibold`}>
              2
            </div>
            <div className={`w-20 h-1 ${paso >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              paso >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            } font-semibold`}>
              3
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-8 mb-8 text-sm">
          <span className={paso === 1 ? 'font-semibold text-blue-600' : 'text-gray-600'}>
            Datos de Empresa
          </span>
          <span className={paso === 2 ? 'font-semibold text-blue-600' : 'text-gray-600'}>
            Seleccionar Productos
          </span>
          <span className={paso === 3 ? 'font-semibold text-blue-600' : 'text-gray-600'}>
            Confirmar Pedido
          </span>
        </div>

        {/* Contenido según el paso */}
        {paso === 1 && (
          <FormularioEmpresa
            onNext={handleSiguientePaso}
            datosIniciales={datosEmpresa}
          />
        )}

        {paso === 2 && (
          <SeleccionProductos
            onNext={handleSiguientePaso}
            onBack={handlePasoAnterior}
            productosIniciales={productos}
          />
        )}

        {paso === 3 && (
          <ResumenPedido
            datosEmpresa={datosEmpresa}
            productos={productos}
            onBack={handlePasoAnterior}
            onEdit={handleEditarProductos}
          />
        )}
      </div>
    </div>
  );
};

export default ClientePedido;
