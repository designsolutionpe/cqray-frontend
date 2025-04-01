import { createStore } from 'vuex';

export default createStore({
  state: {
    isAuthenticated: !!localStorage.getItem('token'),
    userRole: localStorage.getItem('userRole') || null,
    token: localStorage.getItem('token') || null,
    nombre: localStorage.getItem('nombre') || '',
    apellido: localStorage.getItem('apellido') || ''
  },

  mutations: {
    setAuth(state, { isAuthenticated, userRole, token, nombre, apellido }) {
      state.isAuthenticated = isAuthenticated;
      state.userRole = userRole;
      state.token = token;
      state.nombre = nombre;
      state.apellido = apellido;
      // Guardar en localStorage
      localStorage.setItem('token', token || '');
      localStorage.setItem('userRole', userRole || '');
      localStorage.setItem('nombre', nombre || '');
      localStorage.setItem('apellido', apellido || '');
    },
    logout(state) {
      state.isAuthenticated = false;
      state.userRole = null;
      state.token = null;
      state.nombre = '';
      state.apellido = '';
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('nombre');
      localStorage.removeItem('apellido');
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
    userRole: (state) => state.userRole,
    token: (state) => state.token,
    nombre: (state) => state.nombre,
    apellido: (state) => state.apellido,
    nombreCompleto: (state) => `${state.nombre} ${state.apellido}`.trim()
  }
});
