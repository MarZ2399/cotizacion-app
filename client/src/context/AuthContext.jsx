import { createContext, useContext, useState, useEffect } from 'react';

const USUARIO_GESTOR = {
  username: 'gestor',
  password: 'admin123',
  rol: 'gestor'
};

const validarCredenciales = (username, password) => {
  return username === USUARIO_GESTOR.username && 
         password === USUARIO_GESTOR.password;
};

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        localStorage.removeItem('usuario');
      }
    }
    setCargando(false);
  }, []);

  const login = (username, password) => {
    if (validarCredenciales(username, password)) {
      const usuarioData = {
        username: USUARIO_GESTOR.username,
        rol: USUARIO_GESTOR.rol,
        fechaLogin: new Date().toISOString()
      };
      
      setUsuario(usuarioData);
      localStorage.setItem('usuario', JSON.stringify(usuarioData));
      return { success: true };
    }
    
    return { success: false, error: 'Credenciales inválidas' };
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
  };

  const estaAutenticado = () => {
    return usuario !== null;
  };

  const esGestor = () => {
    return usuario && usuario.rol === 'gestor';
  };

  const value = {
    usuario,
    login,
    logout,
    estaAutenticado,
    esGestor,
    cargando
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
