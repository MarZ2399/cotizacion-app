import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import ClientePedido from './pages/ClientePedido';
import GestorCotizacion from './pages/GestorCotizacion';

const RutaProtegida = ({ children }) => {
  const { estaAutenticado } = useAuth();
  return estaAutenticado() ? children : <Navigate to="/login" />;
};

const RutaPublica = ({ children }) => {
  const { estaAutenticado } = useAuth();
  return !estaAutenticado() ? children : <Navigate to="/gestor/cotizacion" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<ClientePedido />} />
          <Route path="/cliente/pedido" element={<ClientePedido />} />
          
          {/* Login */}
          <Route 
            path="/login" 
            element={
              <RutaPublica>
                <Login />
              </RutaPublica>
            } 
          />
          
          {/* Rutas protegidas */}
          <Route
            path="/gestor/cotizacion"
            element={
              <RutaProtegida>
                <GestorCotizacion />
              </RutaProtegida>
            }
          />
          
          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
