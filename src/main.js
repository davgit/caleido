import { createApp } from 'vue'
import App from './App.vue'
import VueAnalytics from 'vue-analytics'

const mandalaApp = createApp(App);

mandalaApp.use(VueAnalytics, {
	id: 'UA-51925365-1'
});

mandalaApp.mount('#app')

