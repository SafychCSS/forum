<template>
    <div class="flex-grid justify-center">
        <div class="col-2">

            <form @submit.prevent="login" class="card card-form">
                <h1 class="text-center">Login</h1>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input v-model="form.email" id="email" type="text" class="form-input">
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input v-model="form.password" id="password" type="password" class="form-input">
                </div>

                <div class="push-top">
                    <button type="submit" class="btn-blue btn-block">Log in</button>
                </div>

                <div class="form-actions text-right">
                    <router-link :to="{ name: 'Register' }">Create an account?</router-link>
                </div>
            </form>

            <div class="push-top text-center">
                <button @click="signInWithGoogle" class="btn-red btn-xsmall">
                    <i class="fa fa-google fa-btn"></i>Sign in with Google
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SignIn',

    data() {
        return {
            form: {
                email: '',
                password: '',
            },
        };
    },

    created() {
        this.$emit('ready');
    },

    methods: {
        async login() {
            try {
                await this.$store.dispatch('signInWithEmailAndPassword', { ...this.form });
                this.$router.push('/');
            } catch (e) {
                alert(e.message);
            }
        },

        async signInWithGoogle() {
            await this.$store.dispatch('signInWithGoogle');
            this.$router.push('/');
        },
    },
};
</script>

<style scoped>

</style>