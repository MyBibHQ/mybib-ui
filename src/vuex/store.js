import Vue from 'vue';
import Vuex from 'vuex';

import User from '@/classes/User.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: new User()
  },
  getters: {
    user (state) {
      return state.user;
    }
  },
  mutations: {
    LOAD_USER (state, user) {
      state.user = user;
    }
  },
  actions: {
    loadUser (context) {
      return new Promise(async (resolve, reject) => {
        const user = new User();
        await user.init();
        context.commit('LOAD_USER', user);
        resolve(user);
      })
    }
  }
});
