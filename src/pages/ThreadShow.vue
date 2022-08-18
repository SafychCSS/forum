<template>
    <div v-if="asyncDataStatus_ready" class="col-large push-top">
        <h1>{{ thread.title }}</h1>
        <p>
            By <a href="#" class="link-unstyled">{{ thread.author?.name }}</a>,
            <AppDate v-if="thread.publishedAt" :timestamp="thread.publishedAt" />
            .
            <span style="float:right; margin-top: 2px;" class="hide-mobile text-faded text-small">{{ thread.repliesCount
                }} replies by {{ thread.contributorsCount }} contributors</span>
        </p>
        <router-link
            :to="{name: 'ThreadEdit', id: this.id}"
            tag="button"
            class="btn-green btn-small push-top"
        >
            Edit Thread
        </router-link>
        <PostList :posts="threadPosts" />
        <PostEditor @save="addPost" />
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import PostList from '@/components/PostList';
import PostEditor from '@/components/PostEditor';
import AppDate from '@/components/AppDate';
import asyncDataStatus from '@/mixins/asyncDataStatus';


export default {
    name: 'ThreadShow',

    components: {
        AppDate,
        PostList,
        PostEditor,
    },

    mixins: [asyncDataStatus],

    props: {
        id: {
            type: String,
            required: true,
        },
    },

    computed: {
        threads() {
            return this.$store.state.threads;
        },

        posts() {
            return this.$store.state.posts;
        },

        thread() {
            return this.$store.getters.thread(this.id);
        },

        threadPosts() {
            return this.posts.filter(post => post.threadId === this.id);
        },
    },

    async created() {
        // fetch the thread
        const thread = await this.fetchThread({ id: this.id });

        // fetch the user
        this.fetchUser({ id: thread.userId });

        // fetch the posts
        const posts = await this.fetchPosts({ ids: thread.posts });
        // fetch the users associated with the posts
        const users = posts.map(post => post.userId).concat(thread.userId);
        await this.fetchUsers({ ids: users });
        this.asyncDataStatus_fetched();
    },

    methods: {
        ...mapActions([
            'createPost',
            'fetchUsers',
            'fetchPosts',
            'fetchUser',
            'fetchThread',
        ]),
        addPost(eventData) {
            const post = {
                ...eventData.post,
                threadId: this.id,
            };

            this.createPost(post);
        },
    },
};
</script>

<style scoped>

</style>
