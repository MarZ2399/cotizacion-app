import React, { useState, useMemo } from 'react';
import { productos } from '../data/productos';

const ITEMS_POR_PAGINA = 10;

const ProductList = ({ onAgregarProductos, productosYaAgregados = [] }) => {
  const [productosConCantidad, setProductosConCantidad] = useState(
    productos.map(p => ({
      ...p,
      cantidad: 0,
      seleccionado: false
    }))
  );

  const [filtroDescripcion, setFiltroDescripcion] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  // Obtener tipos únicos para el filtro
  const tiposUnicos = useMemo(() => {
    const tipos = [...new Set(productos.map(p => p.tipoProducto))];
    return tipos.sort();
  }, []);

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    return productosConCantidad.filter(producto => {
      const cumpleDescripcion = producto.descripcion
        .toLowerCase()
        .includes(filtroDescripcion.toLowerCase());
      
      const cumpleTipo = filtroTipo === '' || producto.tipoProducto === filtroTipo;
      
      return cumpleDescripcion && cumpleTipo;
    });
  }, [productosConCantidad, filtroDescripcion, filtroTipo]);

  // Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA);
  const productosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    const fin = inicio + ITEMS_POR_PAGINA;
    return productosFiltrados.slice(inicio, fin);
  }, [productosFiltrados, paginaActual]);

  // Resetear a página 1 cuando cambien los filtros
  useMemo(() => {
    setPaginaActual(1);
  }, [filtroDescripcion, filtroTipo]);

  const handleCantidadChange = (codigo, valor) => {
    const nuevaCantidad = Math.max(0, parseInt(valor) || 0);
    setProductosConCantidad(prev =>
      prev.map(p =>
        p.codigo === codigo ? { ...p, cantidad: nuevaCantidad } : p
      )
    );
  };

  const handleCheckboxChange = (codigo) => {
    setProductosConCantidad(prev =>
      prev.map(p =>
        p.codigo === codigo
          ? { ...p, seleccionado: !p.seleccionado, cantidad: p.seleccionado ? 0 : p.cantidad }
          : p
      )
    );
  };

  const handleAgregarSeleccionados = () => {
    const seleccionados = productosConCantidad
      .filter(p => p.seleccionado && p.cantidad > 0)
      .map(p => ({
        codigo: p.codigo,
        descripcion: p.descripcion,
        piezasPorCajon: p.piezasPorCajon,
        tipoProducto: p.tipoProducto,
        cantidadPaquetes: p.cantidad,
        precioUnitario: p.precioUnitario,
        precioTotal: p.cantidad * p.precioUnitario
      }));

    if (seleccionados.length === 0) {
      return;
    }

    const productosActualizados = [...productosYaAgregados, ...seleccionados];
    onAgregarProductos(productosActualizados);

    // Resetear
    setProductosConCantidad(
      productos.map(p => ({
        ...p,
        cantidad: 0,
        seleccionado: false
      }))
    );
  };

  const productosSeleccionadosCount = productosConCantidad.filter(
    p => p.seleccionado && p.cantidad > 0
  ).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Productos Disponibles</h2>
        <button
          onClick={handleAgregarSeleccionados}
          disabled={productosSeleccionadosCount === 0}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition-colors"
        >
          ➕ Agregar a Cotización {productosSeleccionadosCount > 0 && `(${productosSeleccionadosCount})`}
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar por Descripción
          </label>
          <input
            type="text"
            value={filtroDescripcion}
            onChange={(e) => setFiltroDescripcion(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Tipo
          </label>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            {tiposUnicos.map(tipo => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="mb-3 text-sm text-gray-600">
        Mostrando {productosPaginados.length} de {productosFiltrados.length} productos
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto mb-4 border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-3 text-center">Sel.</th>
              <th className="px-4 py-3 text-left">Código</th>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-center">Tipo</th>
              <th className="px-4 py-3 text-right">Precio Unit. (S/)</th>
              <th className="px-4 py-3 text-center">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {productosPaginados.length > 0 ? (
              productosPaginados.map((producto) => {
                const indexOriginal = productosConCantidad.findIndex(
                  p => p.codigo === producto.codigo
                );
                const productoActual = productosConCantidad[indexOriginal];

                return (
                  <tr key={producto.codigo} className="border-b hover:bg-gray-50">
                    <td className="px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={productoActual.seleccionado}
                        onChange={() => handleCheckboxChange(producto.codigo)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{producto.codigo}</td>
                    <td className="px-4 py-3">{producto.descripcion}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {producto.tipoProducto}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {producto.precioUnitario.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={productoActual.cantidad}
                        onChange={(e) => handleCantidadChange(producto.codigo, e.target.value)}
                        disabled={!productoActual.seleccionado}
                        className={`w-20 px-2 py-1 border rounded text-center ${
                          productoActual.seleccionado
                            ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No se encontraron productos con los filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
            disabled={paginaActual === 1}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>

          <div className="flex gap-1">
            {[...Array(totalPaginas)].map((_, i) => {
              const pagina = i + 1;
              // Mostrar solo algunas páginas alrededor de la actual
              if (
                pagina === 1 ||
                pagina === totalPaginas ||
                (pagina >= paginaActual - 1 && pagina <= paginaActual + 1)
              ) {
                return (
                  <button
                    key={pagina}
                    onClick={() => setPaginaActual(pagina)}
                    className={`px-3 py-1 border rounded ${
                      paginaActual === pagina
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {pagina}
                  </button>
                );
              } else if (pagina === paginaActual - 2 || pagina === paginaActual + 2) {
                return <span key={pagina} className="px-2">...</span>;
              }
              return null;
            })}
          </div>

          <button
            onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
            disabled={paginaActual === totalPaginas}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
