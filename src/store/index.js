import { createStore } from 'vuex';

export default createStore({
  state: {
    isAuthenticated: !!localStorage.getItem('token'),
    id:localStorage.getItem('id') || null,
    userRole: localStorage.getItem('userRole') || null,
    token: localStorage.getItem('token') || null,
    nombre: localStorage.getItem('nombre') || '',
    apellido: localStorage.getItem('apellido') || '',
    foto: localStorage.getItem('foto') || null
  },

  mutations: {
    setAuth(state, { isAuthenticated, id, userRole, token, nombre, apellido , foto }) {
      state.isAuthenticated = isAuthenticated;
      state.id = id;
      state.userRole = userRole;
      state.token = token;
      state.nombre = nombre;
      state.apellido = apellido;
      state.foto = foto;
      // Guardar en localStorage
      localStorage.setItem('token', token || '');
      localStorage.setItem('id', id || '');
      localStorage.setItem('userRole', userRole || '');
      localStorage.setItem('nombre', nombre || '');
      localStorage.setItem('apellido', apellido || '');
      localStorage.setItem('foto',foto || '')
    },
    logout(state) {
      state.isAuthenticated = false;
      state.userRole = null;
      state.token = null;
      state.id = null;
      state.nombre = '';
      state.apellido = '';
      state.foto = ''
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('id');
      localStorage.removeItem('userRole');
      localStorage.removeItem('nombre');
      localStorage.removeItem('apellido');
      localStorage.removeItem('foto');
    }
  },
  actions: {
    login({ commit }, payload) {
      commit('setAuth', payload);
    },
    logout({ commit }) {
      commit('logout');
    }
  },
  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
    id: (state) => state.id,
    userRole: (state) => state.userRole,
    token: (state) => state.token,
    nombre: (state) => state.nombre,
    apellido: (state) => state.apellido,
    nombreCompleto: (state) => `${state.nombre} ${state.apellido}`.trim(),
    foto: (state) => state.foto
  }
});
