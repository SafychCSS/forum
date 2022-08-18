<template>
    <div v-if="asyncDataStatus_ready" class="container col-full">
        <div
            v-if="forum"
            class="col-full push-top"
        >
            <div class="forum-header">
                <div class="forum-details">
                    <h1>{{ forum.name }}</h1>
                    <p class="text-lead">{{ forum.description }}</p>
                </div>
                <router-link
                    :to="{name: 'ThreadCreate', params: {forumId: forum.id}}"
                    class="btn-green btn-small"
                >
                    Start a thread
                </router-link>
            </div>
        </div>
        <div class="col-full push-top" v-if="threads.length">
            <ThreadList
                :threads="threads"
            />
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import { findByID } from '@/helpers';
import ThreadList from '@/components/ThreadList';
import asyncDataStatus from '@/mixins/asyncDataStatus';

export default {
    name: 'Forum',

    components: {
        ThreadList,
    },

    mixins: [asyncDataStatus],

    props: {
        id: {
            type: String,
            required: true,
        },
    },

    computed: {
        forum() {
            return findByID(this.$store.state.forums, this.id);
        },

        threads() {
            if (!this.forum) return [];
            return this.forum.threads.map(threadId => this.$store.getters.thread(threadId));
        },
    },

    async created() {
        const forum = await this.fetchForum({ id: this.id });
        const threads = await this.fetchThreads({ ids: forum.threads });
        await this.fetchUsers({ ids: threads.map(thread => thread.userId) });
        this.asyncDataStatus_fetched();
    },

    methods: {
        ...mapActions([
            'fetchForum',
            'fetchThreads',
            'fetchUsers',
        ]),
    },
};
</script>

<style scoped>

</style>