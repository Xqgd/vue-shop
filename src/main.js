import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

import './assets/css/global.css'

import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import * as echarts from 'echarts'
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'

Vue.prototype.$echarts = echarts;

Vue.use(VueQuillEditor, /* { default global options } */)

Vue.component('tree-table', TreeTable)

Vue.config.productionTip = false
Vue.use(ElementUI);
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
// 在request 中显示进度条
axios.interceptors.request.use(config => {
  Nprogress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在 response 中 隐藏进度条
axios.interceptors.response.use(config => {
  Nprogress.done()
  return config
})


Vue.prototype.$http = axios

Vue.filter('dataFormat', (dtStr) => {
  const dt = new Date(dtStr)

  const y = padZero(dt.getFullYear())
  const m = padZero(dt.getMonth() + 1 )
  const d = padZero(dt.getDate())
  const hh = padZero(dt.getHours())
  const mm = padZero(dt.getMinutes())
  const ss = padZero(dt.getSeconds())
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
function padZero(n) {
  return n > 9 ? n : '0' + n
}


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
