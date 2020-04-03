import Vue from 'vue'
import App from './App'
import store from './store/index.js'
import AnLayer from 'components/an-layer/an-layer.vue'

Vue.config.productionTip = false
Vue.component('AnLayer', AnLayer)

App.mpType = 'app'

const app = new Vue({
    ...App,
		store
})
app.$mount()
