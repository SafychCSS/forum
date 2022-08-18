<template>
    <div class="col-full push-top" v-if="asyncDataStatus_ready">
        <h1>Editing <i>{{ thread.title }}</i></h1>
        <ThreadEditor
            :title="thread.title"
            :text="text"
            @save="save"
            @cancel="cancel"
            @dirty="formIsDirty = true"
            @clean="formIsDirty = false"
        />
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import { findByID } from '@/helpers';
import ThreadEditor from '@/components/ThreadEditor';
import asyncDataStatus from '@/mixins/asyncDataStatus';

export default {
    name: 'ThreadEdit',

    components: { ThreadEditor },

    mixins: [asyncDataStatus],

    props: {
        id: {
            type: String,
            required: true,
        },
    },

    data() {
        return {
            formIsDirty: false,
        };
    },

    computed: {
        thread() {
            return findByID(this.$store.state.threads, this.id);
        },

        text() {
            const post = findByID(this.$store.state.posts, this.thread.posts[0]);
            return post ? post.text : '';
        },
    },

    async created() {
        const thread = await this.fetchThread({ id: this.id });
        await this.fetchPost({ id: thread.posts[0] });
        this.asyncDataStatus_fetched();
    },

    methods: {
        ...mapActions([
            'fetchThread',
            'fetchPost',
            'updateThread',
        ]),

        async save({ title, text }) {
            const thread = await this.updateThread({
                id: this.id,
                title,
                text,
            });
            this.$router.push({ name: 'ThreadShow', params: { id: thread.id } });
        },

        cancel() {
            this.$router.push({ name: 'ThreadShow', params: { id: this.thread.id } });
        },
    },

    beforeRouteLeave() {
        if (this.formIsDirty) {
            const confirmed = window.confirm('Are you sure you want to leave? Unsaved changes will be lost!');
            if (!confirmed) return false;
        }
    },
};
</script>

<style scoped>

</style>