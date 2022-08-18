<template>
    <TheNavbar />
    <div class="container">
        <router-view
            v-show="showPage"
            @ready="onPageReady"
        />
        <AppSpinner v-show="!showPage" />
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import TheNavbar from '@/components/TheNavbar';
import AppSpinner from '@/components/AppSpinner';
import NProgress from 'nprogress';

export default {
    name: 'App',

    components: {
        AppSpinner,
        TheNavbar,
    },

    data() {
        return {
            showPage: false,
        };
    },

    created() {
        this.fetchAuthUser();

        NProgress.configure({
            speed: 200,
            showSpinner: false,
        });

        this.$router.beforeEach(() => {
            this.showPage = false;
            NProgress.start();
        });
    },

    methods: {
        ...mapActions(['fetchAuthUser']),

        onPageReady() {
            this.showPage = true;
            NProgress.done();
        },
    },
};
</script>

<style>
@import 'assets/style.css';
@import '~nprogress/nprogress.css';

#nprogress .bar {
    background: #57AD8D;
}
</style>
