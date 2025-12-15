// Credenciales del gestor (hardcoded)
export const USUARIO_GESTOR = {
  username: 'gestor',
  password: 'admin123',
  rol: 'gestor'
};

// Función para validar credenciales
export const validarCredenciales = (username, password) => {
  return username === USUARIO_GESTOR.username && 
         password === USUARIO_GESTOR.password;
};
