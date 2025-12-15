import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { generarPDFCotizacion } from '../../utils/pdfGenerator';

const FormularioCotizacion = ({ pedido, onCancelar, onGuardar }) => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (pedido) {
      setProductos(
        pedido.productos.map(p => ({
          ...p,
          precioUnitario: 0,
          precioTotal: 0
        }))
      );
    }
  }, [pedido]);

  const actualizarPrecio = (index, precio) => {
    const nuevosProductos = [...productos];
    nuevosProductos[index].precioUnitario = parseFloat(precio) || 0;
    nuevosProductos[index].precioTotal = 
      nuevosProductos[index].precioUnitario * nuevosProductos[index].cantidadPaquetes;
    setProductos(nuevosProductos);
  };

  const calcularTotal = () => {
    return productos.reduce((sum, p) => sum + p.precioTotal, 0);
  };

  const handleGuardarCotizacion = async () => {
    // Validar precios
    const sinPrecio = productos.some(p => p.precioUnitario <= 0);
    if (sinPrecio) {
      toast.error('Debe asignar precio a todos los productos');
      return;
    }

    setCargando(true);

    try {
      const cotizacion = {
        empresa: pedido.empresa,
        nombreContacto: pedido.nombreContacto,
        numeroContacto: pedido.numeroContacto,
        pais: pedido.pais,
        productos: productos,
        totalGeneral: calcularTotal(),
        tipo: 'cotizacion',
        pedidoOriginalId: pedido._id
      };

      const response = await axios.post('http://localhost:5000/api/cotizacion', cotizacion);
      
      toast.success('Cotización creada exitosamente');
      
      // Generar PDF
      generarPDFCotizacion(response.data);
      
      // Enviar por WhatsApp
      const whatsappResponse = await axios.post(
        `http://localhost:5000/api/cotizacion/${response.data._id}/whatsapp`
      );
      window.open(whatsappResponse.data.url, '_blank');
      
      onGuardar();
      
    } catch (error) {
      console.error('Error al guardar cotización:', error);
      toast.error('Error al guardar cotización');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Crear Cotización - {pedido?.numeroDocumento}
        </h2>
        <button
          onClick={onCancelar}
          className="text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
      </div>

      {/* Información del pedido */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Empresa:</span>
            <p className="text-gray-600">{pedido?.empresa.nombre}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Contacto:</span>
            <p className="text-gray-600">{pedido?.nombreContacto}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">País:</span>
            <p className="text-gray-600">{pedido?.pais}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Teléfono:</span>
            <p className="text-gray-600">{pedido?.numeroContacto}</p>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Código</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descripción</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Cantidad</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Precio Unit.</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productos.map((producto, index) => (
              <tr key={index}>
                <td className="px-4 py-3 text-sm">{producto.codigo}</td>
                <td className="px-4 py-3 text-sm">{producto.descripcion}</td>
                <td className="px-4 py-3 text-sm text-center">
                  {producto.cantidadPaquetes} paquetes
                </td>
                <td className="px-4 py-3 text-sm">
                  <input
                    type="number"
                    step="0.01"
                    value={producto.precioUnitario}
                    onChange={(e) => actualizarPrecio(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
                    placeholder="0.00"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold">
                  S/ {producto.precioTotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="4" className="px-4 py-3 text-right font-bold">
                TOTAL:
              </td>
              <td className="px-4 py-3 text-right font-bold text-lg text-blue-600">
                S/ {calcularTotal().toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <button
          onClick={onCancelar}
          disabled={cargando}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardarCotizacion}
          disabled={cargando}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
        >
          {cargando ? 'Guardando...' : '💾 Guardar y Enviar'}
        </button>
      </div>
    </div>
  );
};

export default FormularioCotizacion;
