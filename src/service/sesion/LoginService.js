import api from '@/service/Api';

export const loginUser = async ({ login, password }) => {
    try {
      const response = await api.post('/login', {
        login,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  };