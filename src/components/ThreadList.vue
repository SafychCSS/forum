<template>
    <div class="col-full">
        <div class="thread-list">
            <h2 class="list-title">Threads</h2>

            <div
                class="thread"
                v-for="thread in threads"
                :key="thread.id"
            >
                <div>
                    <p>
                        <router-link
                            v-if="thread.id"
                            :to="{ name: 'ThreadShow', params: { id: thread.id } }"
                        >
                            {{ thread.title }}
                        </router-link>
                    </p>
                    <p class="text-faded text-xsmall">
                        By <a href="profile.html">{{ userById(thread.userId).name }}</a>,
                        <AppDate v-if="thread.publishedAt" :timestamp="thread.publishedAt" />
                        .
                    </p>
                </div>

                <div class="activity">
                    <p class="replies-count">
                        {{ thread.repliesCount }} replies
                    </p>

                    <img class="avatar-medium"
                         :src="userById(thread.userId).avatar"
                         alt=""
                    >

                    <div>
                        <p class="text-xsmall">
                            <a href="#">{{ userById(thread.userId).name }}</a>
                        </p>
                        <p class="text-xsmall text-faded">
                            <AppDate v-if="thread.publishedAt" :timestamp="thread.publishedAt" />
                        </p>
                    </div>
                </div>
            </div>

        </div>

        <!--        <div class="pagination">
                    <button class="btn-circle" disabled><i class="fa fa-angle-left"></i></button>
                    1 of 3
                    <button class="btn-circle"><i class="fa fa-angle-right"></i></button>
                </div>-->
    </div>
</template>

<script>
import { findByID } from '@/helpers';

export default {
    name: 'ThreadList',

    props: {
        threads: {
            type: Array,
            required: true,
        },
    },

    computed: {
        users() {
            return this.$store.state.users;
        },

        posts() {
            return this.$store.state.posts;
        },
    },

    methods: {
        userById(id) {
            return findByID(this.users, id) || {};
        },
    },
};
</script>

<style scoped>

</style>