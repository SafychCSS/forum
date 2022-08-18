import Home from '@/pages/Home.vue';
import ThreadShow from '@/pages/ThreadShow.vue';
import ThreadCreate from '@/pages/ThreadCreate';
import ThreadEdit from '@/pages/ThreadEdit';
import NotFound from '@/pages/NotFound';
import Forum from '@/pages/Forum';
import Category from '@/pages/Category';
import { createRouter, createWebHistory } from 'vue-router';
import Profile from '@/pages/Profile';
import Register from '@/pages/Register';
import SignIn from '@/pages/SignIn';
import store from '@/store';
import { findByID } from '@/helpers';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/profile',
        name: 'Profile',
        component: Profile,
        meta: { toTop: true, smoothScroll: true, requiresAuth: true },
    },
    {
        path: '/profile/edit',
        name: 'ProfileEdit',
        component: Profile,
        props: { edit: true },
        meta: { requiresAuth: true },
    },
    {
        path: '/forum/:id',
        name: 'Forum',
        component: Forum,
        props: true,
    },
    {
        path: '/category/:id',
        name: 'Category',
        component: Category,
        props: true,
    },
    {
        path: '/thread/:id',
        name: 'ThreadShow',
        component: ThreadShow,
        props: true,
        async beforeEnter(to, from, next) {
            await store.dispatch('fetchThread', { id: to.params.id });
            const threadExists = findByID(store.state.threads, to.params.id);

            if (threadExists) {
                return next();
            } else {
                next({
                    name: 'NotFound',
                    params: { pathMatch: to.path.substring(1).split('/') },
                    query: to.query,
                    hash: to.hash,
                });
            }
        },
    },
    {
        path: '/forum/:forumId/thread/create',
        name: 'ThreadCreate',
        component: ThreadCreate,
        props: true,
        meta: { requiresAuth: true },
    },
    {
        path: '/thread/:id/edit',
        name: 'ThreadEdit',
        component: ThreadEdit,
        props: true,
        meta: { requiresAuth: true },
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: { requiresGuest: true },
    },
    {
        path: '/login',
        name: 'SignIn',
        component: SignIn,
        meta: { requiresGuest: true },
    },
    {
        path: '/logout',
        name: 'SignOut',
        async beforeEnter(to, from) {
            await store.dispatch('signOut');
            return { name: 'Home' };
        },
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to) {
        const scroll = {};
        if (to.meta.toTop) scroll.top = 0;
        if (to.meta.smoothScroll) scroll.behavior = 'smooth';
        return scroll;
    },
});

router.beforeEach(async (to, from) => {
    await store.dispatch('initAuthentication');
    await store.dispatch('unsubscribeAllSnapshots');
    if (to.meta.requiresAuth && !store.state.authId) {
        return { name: 'SignIn' };
    }

    if (to.meta.requiresGuest && store.state.authId) {
        return { name: 'Home' };
    }
});

export default router;