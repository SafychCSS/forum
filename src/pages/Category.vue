<template>
    <div v-if="asyncDataStatus_ready" class="container col-full">
        <h1>{{ category.name }}</h1>
        <ForumList
            :forums="getForumsForCategory(category)"
            :category-name="category.name"
        />
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import { findByID } from '@/helpers';
import ForumList from '@/components/ForumList';
import asyncDataStatus from '@/mixins/asyncDataStatus';

export default {
    name: 'Category',

    components: {
        ForumList,
    },

    mixins: [asyncDataStatus],

    props: {
        id: {
            type: String,
            required: true,
        },
    },

    computed: {
        category() {
            return findByID(this.$store.state.categories, this.id) || {};
        },
    },

    async created() {
        const category = await this.fetchCategory({ id: this.id });
        await this.fetchForums({ ids: category.forums });
        this.asyncDataStatus_fetched();
    },

    methods: {
        ...mapActions([
            'fetchCategory',
            'fetchForums',
        ]),
        getForumsForCategory(category) {
            return this.$store.state.forums.filter(forum => forum.categoryId === category.id);
        },
    },
};
</script>

<style scoped>

</style>