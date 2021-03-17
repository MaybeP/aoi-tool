import Vue from 'vue'
import axios from 'axios'
import App from './App'
import router from './router'
import store from './store'
import ViewUI from 'view-design'
import 'view-design/dist/styles/iview.css'
import config from './config/config.json'
let dataConfig = JSON.parse(localStorage.getItem('myConfig')) || config
Vue.use(ViewUI)
window.top.myOption = dataConfig
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
window.onerror = (e) => {
  this.$Message.error(e.toString() + ',请重新进入或F5刷新界面')
}
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
