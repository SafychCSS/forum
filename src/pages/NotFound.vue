<template>
    <div class="col-full text-center">
        <h1>not found</h1>
        <router-link :to="{ name: 'Home' }">home</router-link>
    </div>
</template>

<script>
export default {
    name: 'PageNotFound',

    created() {
        this.$emit('ready');
    },
};
</script>

<style scoped>

</style>