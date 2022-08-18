<template>
    <div class="col-full">
        <form @submit.prevent="save">
            <div class="form-group">
                <textarea
                    v-model="postCopy.text"
                    name=""
                    id=""
                    cols="30"
                    rows="10"
                    class="form-input"
                />
            </div>
            <div class="form-actions">
                <button class="btn-blue">{{ post.id ? 'Update post' : 'SubmitPost' }}</button>
            </div>
        </form>
    </div>
</template>

<script>
export default {
    name: 'PostEditor',

    props: {
        post: { type: Object, default: () => ({ text: null }) },
    },

    data() {
        return {
            postCopy: { ...this.post },
        };
    },

    methods: {
        save() {
            this.$emit('save', { post: this.postCopy });
            this.postCopy.text = '';
        },
    },
};
</script>

<style scoped>

</style>