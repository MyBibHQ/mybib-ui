import 'es6-shim';
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import store from './vuex/store'
import App from './App';
import router from './router';

import MuseUI from 'muse-ui-2-final';
import VueScrollTo from 'vue-scrollto';
import IdleJs from 'idle-js';
import VueAnalytics from 'vue-analytics';
import VueI18n from 'vue-i18n';

import Config from './config.js';
import i18nMessages from './i18n/messages.js';

import VTooltip from 'v-tooltip';

Vue.use(MuseUI);
Vue.use(VueScrollTo);
Vue.use(VueAnalytics, {
  id: 'UA-125886622-2',
  router
})
Vue.use(VueI18n);
Vue.use(VTooltip, {
  defaultHtml: true
});

Vue.config.productionTip = false;

const i18n = new VueI18n({
  locale: 'en-US',
  messages: i18nMessages
});

/* eslint-disable no-new */
new Vue({
  i18n,
  store,
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
});

Config.loadServerSideConfig()
  .then(() => {
    return store.dispatch('loadUser');
  })
  .then((user) => {
    if (user && user.language) {
      i18n.locale = user.language
    }
    if (user) {
      window.Intercom('boot', {
        app_id: 'fdz883p3',
        email: user.email,
        user_id: user.id
      });
    }
  });

// reload the page when they've been idle for an hour or more
new IdleJs({
  idle: 1000 * 60 * 60 * 12, // idle time in ms (12 hours)
  events: ['mousemove', 'keydown', 'mousedown', 'touchstart'], // events that will trigger the idle resetter
  onIdle: function () { }, // callback function to be executed after idle time
  onActive: function () { location.reload(); }, // callback function to be executed after back form idleness
  onHide: function () { }, // callback function to be executed when window become hidden
  onShow: function () { }, // callback function to be executed when window become visible
  keepTracking: true, // set it to false of you want to track only once
  startAtIdle: false // set it to true if you want to start in the idle state
}).start();
