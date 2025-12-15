import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import ProductList from './ProductList';
import { empresas } from '../data/empresas';
import { generarPDFCotizacion } from '../utils/pdfGenerator';
import axios from 'axios';

const PAISES_SUDAMERICA = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia',
  'Ecuador', 'Guyana', 'Paraguay', 'Perú', 'Surinam',
  'Uruguay', 'Venezuela'
];

const CotizacionForm = () => {
  const [formData, setFormData] = useState({
    empresaId: '',
    pais: 'Bolivia',
    numeroContacto: '',
    nombreContacto: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('productos'); // 'productos' | 'resumen'

  const empresasFiltradas = useMemo(() => {
    if (!searchTerm) return empresas;
    
    const termLower = searchTerm.toLowerCase();
    return empresas.filter(empresa => 
      empresa.nombre.toLowerCase().includes(termLower) ||
      empresa.contacto?.toLowerCase().includes(termLower) ||
      empresa.ciudad.toLowerCase().includes(termLower) ||
      empresa.telefono.includes(searchTerm)
    );
  }, [searchTerm]);

  const empresaSeleccionada = empresas.find(e => e.id === parseInt(formData.empresaId));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
    setFormData(prev => ({ ...prev, empresaId: '' }));
  };

  const handleSelectEmpresa = (empresa) => {
    setFormData(prev => ({
      ...prev,
      empresaId: empresa.id,
      pais: empresa.pais,
      numeroContacto: empresa.telefono,
      nombreContacto: empresa.contacto
    }));
    setSearchTerm(empresa.nombre);
    setShowDropdown(false);
  };

  const agregarProductos = (nuevosProductos) => {
  // Acumular: mantener los productos existentes y agregar los nuevos
  setProductosSeleccionados(prevProductos => {
    // Combinar productos existentes con los nuevos
    const todosLosProductos = [...prevProductos, ...nuevosProductos];
    
    // Contar solo los productos nuevos agregados en esta operación
    const cantidadNuevos = nuevosProductos.length;
    
    if (cantidadNuevos > 0) {
      setActiveTab('resumen');
      toast.success(`${cantidadNuevos} producto(s) agregado(s). Total: ${todosLosProductos.length}`);
    }
    
    return todosLosProductos;
  });
};



  const calcularTotales = () => {
    const totalCajas = productosSeleccionados.reduce((sum, p) => sum + (p.cantidadPaquetes || 0), 0);
    const totalGeneral = productosSeleccionados.reduce((sum, p) => sum + (p.precioTotal || 0), 0);
    return { totalCajas, totalGeneral };
  };

  const validarFormulario = () => {
    if (!formData.empresaId) {
      toast.error('Selecciona una empresa');
      return false;
    }
    if (!formData.nombreContacto.trim()) {
      toast.error('Ingresa el nombre del contacto');
      return false;
    }
    if (!formData.numeroContacto.trim()) {
      toast.error('Ingresa el número de contacto');
      return false;
    }
    if (productosSeleccionados.length === 0) {
      toast.error('Agrega al menos un producto');
      return false;
    }
    return true;
  };

  const handleGenerarCotizacion = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const { totalCajas, totalGeneral } = calcularTotales();

      const cotizacionData = {
        empresa: {
          nombre: empresaSeleccionada.nombre,
          contacto: empresaSeleccionada.contacto,
          telefono: empresaSeleccionada.telefono,
          direccion: empresaSeleccionada.direccion,
          ciudad: empresaSeleccionada.ciudad,
          grado: empresaSeleccionada.grado
        },
        pais: empresaSeleccionada.pais,
        numeroContacto: formData.numeroContacto,
        nombreContacto: formData.nombreContacto,
        productos: productosSeleccionados.map(p => ({
          codigo: p.codigo,
          descripcion: p.descripcion,
          piezasPorCajon: p.piezasPorCajon || 0,
          cantidadPaquetes: p.cantidadPaquetes,
          totalPiezas: (p.piezasPorCajon || 0) * p.cantidadPaquetes,
          precioUnitario: p.precioUnitario,
          precioTotal: p.precioTotal
        })),
        totalCajas,
        totalGeneral
      };

      const response = await axios.post('http://localhost:5000/api/cotizaciones', cotizacionData);
      const cotizacionGuardada = response.data;

      toast.success(`Cotización ${cotizacionGuardada.numeroDocumento} guardada`);

      generarPDFCotizacion(cotizacionGuardada);

      const whatsappResponse = await axios.post(
        `http://localhost:5000/api/cotizaciones/${cotizacionGuardada._id}/whatsapp`
      );

      window.open(whatsappResponse.data.url, '_blank');

      setFormData({
        empresaId: '',
        pais: 'Bolivia',
        numeroContacto: '',
        nombreContacto: ''
      });
      setSearchTerm('');
      setProductosSeleccionados([]);
      setActiveTab('productos');

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar cotización');
    } finally {
      setLoading(false);
    }
  };

  const { totalGeneral } = calcularTotales();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Nueva Cotización</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa *
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(true)}
                placeholder="Buscar empresa por nombre, contacto o ciudad..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {showDropdown && empresasFiltradas.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {empresasFiltradas.map(empresa => (
                    <div
                      key={empresa.id}
                      onClick={() => handleSelectEmpresa(empresa)}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="font-semibold text-sm text-gray-800">{empresa.nombre}</div>
                      <div className="text-xs text-gray-600">
                        {empresa.contacto} • {empresa.ciudad} • {empresa.telefono}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showDropdown && searchTerm && empresasFiltradas.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
                  <p className="text-sm text-gray-500">No se encontraron resultados</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                País *
              </label>
              <select
                name="pais"
                value={formData.pais}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {PAISES_SUDAMERICA.map(pais => (
                  <option key={pais} value={pais}>
                    {pais}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Contacto *
              </label>
              <input
                type="text"
                name="nombreContacto"
                value={formData.nombreContacto}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Contacto *
              </label>
              <input
                type="tel"
                name="numeroContacto"
                value={formData.numeroContacto}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: +591987654321"
              />
            </div>
          </div>

          {empresaSeleccionada && (
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Contacto:</span> {empresaSeleccionada.contacto}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Teléfono:</span> {empresaSeleccionada.telefono}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">País:</span> {empresaSeleccionada.pais}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Ciudad:</span> {empresaSeleccionada.ciudad}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Grado:</span> {empresaSeleccionada.grado || 'N/A'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* TABS */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('productos')}
              className={`flex-1 px-6 py-3 font-semibold transition-colors ${
                activeTab === 'productos'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📦 Productos Disponibles
            </button>
            <button
              onClick={() => setActiveTab('resumen')}
              className={`flex-1 px-6 py-3 font-semibold transition-colors ${
                activeTab === 'resumen'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📋 Resumen de Cotización {productosSeleccionados.length > 0 && `(${productosSeleccionados.length})`}
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'productos' && (
              <ProductList onAgregarProductos={agregarProductos} />
            )}

            {activeTab === 'resumen' && (
              <>
                 {productosSeleccionados.length === 0 ? (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No hay productos agregados a la cotización</p>
        <button
          onClick={() => setActiveTab('productos')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
        >
          Agregar Productos
        </button>
      </div>
    ) : (
      <>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Resumen de Cotización</h2>
          <button
            onClick={() => setActiveTab('productos')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            ➕ Seguir Agregando Productos
          </button>
        </div>
        
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Descripción</th>
                <th className="px-4 py-2 text-center">Cantidad</th>
                <th className="px-4 py-2 text-right">Precio Unit.</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosSeleccionados.map((prod, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{prod.descripcion}</td>
                  <td className="px-4 py-2 text-center">
  <input
    type="text"
    value={prod.cantidadPaquetes}
    onChange={(e) => {
      const valor = e.target.value;
      // Permitir campo vacío o solo números
      if (valor === '' || /^\d+$/.test(valor)) {
        const nuevosProductos = [...productosSeleccionados];
        nuevosProductos[idx] = {
          ...prod,
          cantidadPaquetes: valor === '' ? '' : parseInt(valor),
          precioTotal: valor === '' ? 0 : parseInt(valor) * prod.precioUnitario
        };
        setProductosSeleccionados(nuevosProductos);
      }
    }}
    onBlur={(e) => {
      // Cuando pierde el foco, validar que no esté vacío
      const valor = e.target.value;
      if (valor === '' || parseInt(valor) < 1) {
        const nuevosProductos = [...productosSeleccionados];
        nuevosProductos[idx] = {
          ...prod,
          cantidadPaquetes: 1,
          precioTotal: 1 * prod.precioUnitario
        };
        setProductosSeleccionados(nuevosProductos);
        toast.error('La cantidad mínima es 1');
      }
    }}
    className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
</td>

                  <td className="px-4 py-2 text-right">S/ {prod.precioUnitario.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    S/ {prod.precioTotal.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
  onClick={() => {
    const nuevosProductos = productosSeleccionados.filter((_, i) => i !== idx);
    setProductosSeleccionados(nuevosProductos);
    toast.success('Producto eliminado');
  }}
  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
  title="Eliminar producto"
>
  ✕
</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center pt-4 border-t-2">
          <span className="text-lg font-bold">TOTAL:</span>
          <span className="text-2xl font-bold text-blue-600">
            S/ {totalGeneral.toLocaleString()}
          </span>
        </div>

        <button
          onClick={handleGenerarCotizacion}
          disabled={loading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-md transition-colors"
        >
          {loading ? 'Generando...' : 'Generar Cotización y Enviar por WhatsApp'}
        </button>
      </>
    )}
  </>
)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CotizacionForm;
