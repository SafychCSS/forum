<template>
    <div class="flex-grid">
        <h1>my profile</h1>
        <div class="col-3 push-top">
            <UserProfileCard v-if="!edit" :user="user" />
            <UserProfileCardEditor v-else :user="user" />
        </div>

        <div class="col-7 push-top">
            <div class="profile-header">
              <span class="text-lead">
                  {{ user.username }} recent activity
              </span>
                <a href="#">See only started threads?</a>
            </div>
            <hr>
            <PostList :posts="user.posts" />
        </div>
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import PostList from '@/components/PostList';
import UserProfileCard from '@/components/UserProfileCard';
import UserProfileCardEditor from '@/components/UserProfileCardEditor';

export default {
    name: 'Profile',

    props: {
        edit: {
            type: Boolean,
            default: false,
        },
    },

    components: {
        UserProfileCard,
        UserProfileCardEditor,
        PostList,
    },

    computed: {
        ...mapState([
            'posts',
        ]),

        ...mapGetters({
            user: 'authUser',
        }),
    },

    created() {
        this.$emit('ready');
    },
};
</script>

<style scoped>

</style>