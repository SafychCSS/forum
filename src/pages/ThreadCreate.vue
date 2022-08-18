<template>
    <div
        v-if="asyncDataStatus_ready"
        class="col-full push-top"
    >
        <h1>Create new thread in <i>{{ forum.name }}</i></h1>
        <ThreadEditor
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
    name: 'ThreadCreate',

    components: { ThreadEditor },

    mixins: [asyncDataStatus],

    props: {
        forumId: {
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
        forum() {
            return findByID(this.$store.state.forums, this.forumId);
        },
    },

    async created() {
        await this.fetchForum({ id: this.forumId });
        this.asyncDataStatus_fetched();
    },

    methods: {
        ...mapActions([
            'fetchForum',
            'createThread',
        ]),
        async save({ title, text }) {
            const thread = await this.createThread({
                forumId: this.forum.id,
                title,
                text,
            });
            this.$router.push({ name: 'ThreadShow', params: { id: thread.id } });
        },

        cancel() {
            this.$router.push({ name: 'Forum', params: { id: this.forum.id } });
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