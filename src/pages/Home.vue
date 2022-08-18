<template>
    <div v-if="asyncDataStatus_ready" class="container">
        <h1 class="push-top">Welcome to the forum</h1>
        <CategoryList :categories="categories" />
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import asyncDataStatus from '@/mixins/asyncDataStatus';
import CategoryList from '@/components/CategoryList';

export default {
    components: {
        CategoryList,
    },

    mixins: [asyncDataStatus],

    computed: {
        categories() {
            return this.$store.state.categories;
        },
    },

    async created() {
        const categories = await this.fetchAllCategories();
        const forumIds = categories.map(cat => cat.forums).flat();
        await this.fetchForums({ ids: forumIds });
        this.asyncDataStatus_fetched();
    },

    methods: {
        ...mapActions(['fetchAllCategories', 'fetchForums']),
    },
};
</script>

<style scoped>

</style>
