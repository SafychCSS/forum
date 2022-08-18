import { createApp } from 'vue';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import FontAwesome from '@/plugins/FontAwesome.js';

const appForum = createApp(App);

const requireComponent = require.context('./components', false, /App[A-Z]\w+\.(vue|js)$/);

requireComponent.keys().forEach(fileName => {
    const componentConfig = requireComponent(fileName);

    const componentName = fileName
        .split('/')
        .pop()
        .replace(/\.\w+$/, '');

    appForum.component(
        componentName,
        componentConfig.default || componentConfig,
    );
});

appForum.use(router);
appForum.use(store);
appForum.use(FontAwesome);
appForum.mount('#app');
