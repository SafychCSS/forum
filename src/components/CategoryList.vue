<template>
    <ForumList
        v-for="category in categories"
        :key="category.id"
        :forums="getForumsForCategory(category)"
        :category-name="category.name"
        :category-id="category.id"
    />
</template>

<script>

import ForumList from '@/components/ForumList';

export default {
    name: 'CategoryListItem',

    components: {
        ForumList,
    },

    props: {
        categories: {
            type: Array,
            required: true,
        },
    },

    data() {
        return {
        };
    },

    methods: {
        getForumsForCategory(category) {
            return this.$store.state.forums.filter(forum => forum.categoryId === category.id);
        }
    },
};
</script>

<style scoped>

</style>