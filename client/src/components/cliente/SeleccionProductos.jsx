import { useState, useEffect } from 'react';
import { productos } from '../../data/productos.js';

const SeleccionProductos = ({ onNext, onBack, productosIniciales }) => {
  const [todosProductos, setTodosProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState(productosIniciales || []);
  const [busqueda, setBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');

  useEffect(() => {
    // Cargar productos desde el archivo JS local
    setTodosProductos(productos);
  }, []);

  // Obtener tipos únicos para el filtro
  const tiposUnicos = [...new Set(todosProductos.map(p => p.tipoProducto))].filter(Boolean);

  const agregarProducto = (producto) => {
    const existe = productosSeleccionados.find(p => p.codigo === producto.codigo);
    
    if (existe) {
      // Si ya existe, incrementar cantidad
      setProductosSeleccionados(
        productosSeleccionados.map(p =>
          p.codigo === producto.codigo 
            ? { ...p, cantidadPaquetes: p.cantidadPaquetes + 1 }
            : p
        )
      );
    } else {
      // Agregar nuevo producto
      setProductosSeleccionados([
        ...productosSeleccionados,
        {
          ...producto,
          cantidadPaquetes: 1
        }
      ]);
    }
  };

  const actualizarCantidad = (codigo, cantidad) => {
  // Si el input está vacío, mantenemos el producto seleccionado
  // y guardamos el valor vacío para permitir escribir otro número.
  if (cantidad === '') {
    setProductosSeleccionados(
      productosSeleccionados.map(p =>
        p.codigo === codigo ? { ...p, cantidadPaquetes: '' } : p
      )
    );
    return;
  }

  const cantidadNum = parseInt(cantidad, 10);

  // Si no es un número válido, no hacemos nada.
  if (isNaN(cantidadNum)) return;

  // Solo eliminamos si el usuario pone explícitamente 0.
  if (cantidadNum === 0) {
    eliminarProducto(codigo);
    return;
  }

  setProductosSeleccionados(
    productosSeleccionados.map(p =>
      p.codigo === codigo ? { ...p, cantidadPaquetes: cantidadNum } : p
    )
  );
};


  const eliminarProducto = (codigo) => {
    setProductosSeleccionados(productosSeleccionados.filter(p => p.codigo !== codigo));
  };

  const handleContinuar = () => {
    if (productosSeleccionados.length === 0) {
      alert('Debe seleccionar al menos un producto');
      return;
    }
    onNext(productosSeleccionados);
  };

  // Filtrar productos
  const productosFiltrados = todosProductos.filter(p => {
    const matchBusqueda = p.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
                          p.codigo?.toLowerCase().includes(busqueda.toLowerCase());
    const matchTipo = !tipoFiltro || p.tipoProducto === tipoFiltro;
    return matchBusqueda && matchTipo;
  });

  return (
    <div className="space-y-6">
      {/* Búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Seleccionar Productos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por Descripción
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Tipo
            </label>
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              {tiposUnicos.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-4">
          Mostrando {productosFiltrados.length} de {todosProductos.length} productos
        </p>
      </div>

      {/* Tabla de productos disponibles */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Productos Disponibles</h3>
        </div>
        
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '500px' }}>
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sel.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Código</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Descripción</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Tipo</th>
                {/* <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Precio Unit. (S/)</th> */}
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Cantidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productosFiltrados.map((producto) => {
                const estaSeleccionado = productosSeleccionados.find(p => p.codigo === producto.codigo);
                
                return (
                  <tr 
                    key={producto.codigo}
                    className={`hover:bg-gray-50 ${estaSeleccionado ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={!!estaSeleccionado}
                        onChange={() => estaSeleccionado ? eliminarProducto(producto.codigo) : agregarProducto(producto)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {producto.codigo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {producto.descripcion}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {producto.tipoProducto}
                      </span>
                    </td>
                    {/* <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {producto.precioUnitario.toLocaleString('es-PE')}
                    </td> */}
                    <td className="px-4 py-3 text-right">
                      {estaSeleccionado ? (
                        <input
  type="number"
  min="0"
  value={estaSeleccionado.cantidadPaquetes ?? ''}
  onChange={(e) => actualizarCantidad(producto.codigo, e.target.value)}
  className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
  onClick={(e) => e.stopPropagation()}
/>

                      ) : (
                        <span className="text-gray-400 text-sm">0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen de productos seleccionados */}
      {productosSeleccionados.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
            <span>Productos Seleccionados ({productosSeleccionados.length})</span>
            <button
              onClick={() => setProductosSeleccionados([])}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Limpiar todo
            </button>
          </h3>
          
          <div className="space-y-2">
            {productosSeleccionados.map((producto) => (
              <div
                key={producto.codigo}
                className="flex items-center justify-between border border-gray-200 rounded-lg p-3"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{producto.codigo}</h4>
                  <p className="text-xs text-gray-600">{producto.descripcion}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
  type="number"
  min="0"
  value={producto.cantidadPaquetes ?? ''}
  onChange={(e) => actualizarCantidad(producto.codigo, e.target.value)}
  className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
/>

                  <span className="text-xs text-gray-600">paquetes</span>
                  <button
                    onClick={() => eliminarProducto(producto.codigo)}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total de Paquetes:</span>
              <span className="font-bold text-xl text-blue-600">
                {productosSeleccionados.reduce(
  (sum, p) => sum + (parseInt(p.cantidadPaquetes, 10) || 0),
  0
)}

              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg"
        >
          ← Atrás
        </button>
        <button
          onClick={handleContinuar}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
};

export default SeleccionProductos;
