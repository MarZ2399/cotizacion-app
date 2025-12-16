import { useState, useEffect } from 'react';
import { ZONAS } from '../../config/zonas';

const FormularioEmpresa = ({ onNext, datosIniciales }) => {
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    nombreContacto: '',
    numeroContacto: '',
    pais: '',
    zona: '' // ← CAMPO DE ZONA
  });

  useEffect(() => {
    if (datosIniciales) {
      setFormData(datosIniciales);
    }
  }, [datosIniciales]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // ✅ VALIDAR ZONA TAMBIÉN
    if (!formData.nombreEmpresa || !formData.nombreContacto || !formData.numeroContacto || !formData.pais || !formData.zona) {
      alert('Por favor complete todos los campos');
      return;
    }
    
    onNext(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Información de la Empresa
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo de empresa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la Empresa *
          </label>
          <input
            type="text"
            value={formData.nombreEmpresa}
            onChange={(e) => setFormData({...formData, nombreEmpresa: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: IMPORTACIONES FIGUEROA"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Contacto *
            </label>
            <input
              type="text"
              value={formData.nombreContacto}
              onChange={(e) => setFormData({...formData, nombreContacto: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Contacto *
            </label>
            <input
              type="tel"
              value={formData.numeroContacto}
              onChange={(e) => setFormData({...formData, numeroContacto: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: +591 72593210"
              required
            />
          </div>
        </div>

        {/* ✅ GRID CON PAÍS Y ZONA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campo de país */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              País *
            </label>
            <select
              value={formData.pais}
              onChange={(e) => setFormData({...formData, pais: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">-- Seleccione un país --</option>
              <option value="Bolivia">Bolivia</option>
              <option value="Perú">Perú</option>
              <option value="Chile">Chile</option>
              <option value="Argentina">Argentina</option>
              <option value="Brasil">Brasil</option>
              <option value="Paraguay">Paraguay</option>
              <option value="Uruguay">Uruguay</option>
              <option value="Colombia">Colombia</option>
              <option value="Ecuador">Ecuador</option>
              <option value="Venezuela">Venezuela</option>
            </select>
          </div>

          {/* ✅ NUEVO: Campo de zona */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zona *
            </label>
            <select
              value={formData.zona}
              onChange={(e) => setFormData({...formData, zona: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">-- Seleccione una zona --</option>
              {ZONAS.map((zona) => (
                <option key={zona} value={zona}>
                  {zona}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Continuar →
        </button>
      </form>
    </div>
  );
};

export default FormularioEmpresa;
