<template>
    <span :title="humanFriendlyDate">
        {{ diffForHumans }}
    </span>
</template>

<script>
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedDate from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(localizedDate);

export default {
    name: 'AppDate',

    props: {
        timestamp: {
            type: [Number, Object],
            required: true,
        },
    },

    computed: {
        normalizedTimestamp() {
            return this.timestamp?.seconds || this.timestamp
        },

        diffForHumans() {
            return dayjs.unix(this.normalizedTimestamp).fromNow();
        },

        humanFriendlyDate() {
            return dayjs.unix(this.normalizedTimestamp).format('llll');
        },
    },
};
</script>

<style scoped>

</style>