import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api'; // ← AGREGAR ESTA LÍNEA
import toast from 'react-hot-toast';
import { generarPDFCotizacion } from '../../utils/pdfGenerator';

const TablaCotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCotizaciones();
  }, []);

  const cargarCotizaciones = async () => {
    try {
      setCargando(true);
      // ✅ CAMBIO 1: Línea 18
      const response = await axios.get(`${API_URL}/api/cotizaciones`);
      setCotizaciones(response.data);
    } catch (error) {
      console.error('Error al cargar cotizaciones:', error);
      toast.error('Error al cargar cotizaciones');
    } finally {
      setCargando(false);
    }
  };

  const descargarPDF = (cotizacion) => {
    generarPDFCotizacion(cotizacion);
  };

  const enviarWhatsApp = async (cotizacionId) => {
    try {
      // ✅ CAMBIO 2: Línea 37
      const response = await axios.post(
        `${API_URL}/api/cotizacion/${cotizacionId}/whatsapp`
      );
      window.open(response.data.url, '_blank');
      toast.success('WhatsApp abierto');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al abrir WhatsApp');
    }
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
          Cotizaciones Realizadas ({cotizaciones.length})
        </h2>
        <button
          onClick={cargarCotizaciones}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm font-medium"
        >
          🔄 Actualizar
        </button>
      </div>

      {cotizaciones.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay cotizaciones registradas
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">N° Cotización</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Empresa</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contacto</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cotizaciones.map((cotizacion) => (
                <tr key={cotizacion._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {cotizacion.numeroDocumento}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {cotizacion.empresa.nombre}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {cotizacion.nombreContacto}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(cotizacion.fecha).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800">
                    S/ {cotizacion.totalGeneral.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => descargarPDF(cotizacion)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                        title="Descargar PDF"
                      >
                        📄 PDF
                      </button>
                      <button
                        onClick={() => enviarWhatsApp(cotizacion._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                        title="Enviar por WhatsApp"
                      >
                        📱 WhatsApp
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TablaCotizaciones;
