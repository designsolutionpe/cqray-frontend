import { createStore } from 'vuex';

export default createStore({
  state: {
    isAuthenticated: !!localStorage.getItem('token'),
    id: localStorage.getItem('id') || null,
    id_sede: localStorage.getItem('id_sede') || null,
    userRole: localStorage.getItem('userRole') || null,
    token: localStorage.getItem('token') || null,
    nombre: localStorage.getItem('nombre') || '',
    apellido: localStorage.getItem('apellido') || '',
    foto: localStorage.getItem('foto') || null,
    id_paciente: localStorage.getItem('id_paciente_directorio') || null
  },

  mutations: {
    setAuth(state, { isAuthenticated, id, id_sede, userRole, token, nombre, apellido, foto }) {
      state.isAuthenticated = isAuthenticated;
      state.id = id;
      state.id_sede = id_sede;
      state.userRole = userRole;
      state.token = token;
      state.nombre = nombre;
      state.apellido = apellido;
      state.foto = foto;
      // Guardar en localStorage
      localStorage.setItem('token', token || '');
      localStorage.setItem('id', id || '');
      localStorage.setItem('id_sede', id_sede || '');
      localStorage.setItem('userRole', userRole || '');
      localStorage.setItem('nombre', nombre || '');
      localStorage.setItem('apellido', apellido || '');
      localStorage.setItem('foto', foto || '')
    },
    updateUserData(state, { userRole, nombre, apellido, foto }) {
      state.userRole = userRole
      state.nombre = nombre
      state.apellido = apellido
      state.foto = foto
      localStorage.setItem('userRole', state.userRole)
      localStorage.setItem('nombre', state.nombre)
      localStorage.setItem('apellido', state.apellido)
      localStorage.setItem('foto', state.foto)
    },
    logout(state) {
      state.isAuthenticated = false;
      state.userRole = null;
      state.token = null;
      state.id = null;
      state.id_sede = null;
      state.nombre = '';
      state.apellido = '';
      state.foto = ''
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('id');
      localStorage.removeItem('id_sede');
      localStorage.removeItem('userRole');
      localStorage.removeItem('nombre');
      localStorage.removeItem('apellido');
      localStorage.removeItem('foto');
      localStorage.removeItem('id_paciente_directorio')
    },
    updatePacienteID(state, id) {
      state.id_paciente = id
      localStorage.setItem('id_paciente_directorio', id)
    }
  },
  actions: {
    login({ commit }, payload) {
      commit('setAuth', payload);
    },
    updateUserData({ commit }, payload) {
      commit('updateUserData', payload)
    },
    logout({ commit }) {
      commit('logout');
    },
    setPacienteID({ commit }, payload) {
      commit('updatePacienteID', payload)
    }
  },
  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
    id: (state) => state.id,
    id_sede: (state) => state.id_sede,
    userRole: (state) => state.userRole,
    token: (state) => state.token,
    nombre: (state) => state.nombre,
    apellido: (state) => state.apellido,
    nombreCompleto: (state) => `${state.nombre} ${state.apellido}`.trim(),
    foto: (state) => state.foto,
    id_paciente: (state) => state.id_paciente
  }
});
