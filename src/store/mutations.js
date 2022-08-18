import {
    ADD_CONTRIBUTORS_TO_THREAD,
    ADD_POST_ID_TO_THREAD,
    ADD_THREAD_TO_FORUM,
    ADD_THREAD_TO_USER, CLEAR_UNSUBSCRIBES, SET_AUTH_ID, SET_AUTH_OBSERVER_UNSUBSCRIBE, SET_AUTH_USER_UNSUBSCRIBE,
    SET_ITEM, UNSUBSCRIBE,
} from '@/store/mutation-types';
import { docToResource, findByID, upsert } from '@/helpers';

export default {
    [SET_ITEM](state, { resource, item }) {
        upsert(state[resource], docToResource(item));
    },

    [SET_AUTH_ID](state, id) {
        state.authId = id;
    },

    [ADD_POST_ID_TO_THREAD]: makeAppendChildToParentMutation({ parent: 'threads', child: 'posts' }),

    [ADD_THREAD_TO_FORUM]: makeAppendChildToParentMutation({ parent: 'forums', child: 'threads' }),

    [ADD_THREAD_TO_USER]: makeAppendChildToParentMutation({ parent: 'users', child: 'threads' }),

    [ADD_CONTRIBUTORS_TO_THREAD]: makeAppendChildToParentMutation({ parent: 'threads', child: 'contributors' }),

    [UNSUBSCRIBE](state, { unsubscribe }) {
        state.unsubscribes.push(unsubscribe);
    },

    [CLEAR_UNSUBSCRIBES](state) {
        state.unsubscribes = [];
    },

    [SET_AUTH_USER_UNSUBSCRIBE](state, unsubscribe) {
        state.authUserUnsubscribe = unsubscribe;
    },

    [SET_AUTH_OBSERVER_UNSUBSCRIBE](state, unsubscribe) {
        state.authObserverUnsubscribe = unsubscribe;
    },
};

function makeAppendChildToParentMutation({ parent, child }) {
    return (state, { childId, parentId }) => {
        const resource = findByID(state[parent], parentId);
        if (!resource) {
            console.warn(`parent didn't exist`);
            return;
        }
        resource[child] = resource[child] || [];
        if (!resource[child].includes(childId)) {
            resource[child].push(childId);
        }
    };
}