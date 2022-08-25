import {
    ADD_CONTRIBUTORS_TO_THREAD,
    ADD_POST_ID_TO_THREAD,
    ADD_THREAD_TO_FORUM,
    ADD_THREAD_TO_USER,
    CLEAR_UNSUBSCRIBES,
    SET_AUTH_ID,
    SET_AUTH_OBSERVER_UNSUBSCRIBE,
    SET_AUTH_USER_UNSUBSCRIBE,
    SET_ITEM,
    UNSUBSCRIBE,
} from '@/store/mutation-types';
import { docToResource, findByID } from '@/helpers';
import {
    onSnapshot,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    increment,
    writeBatch,
    serverTimestamp,
} from 'firebase/firestore';
import db from '@/firebase';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
} from 'firebase/auth';

export default {
    initAuthentication({ dispatch, commit, state }) {
        if (state.authObserverUnsubscribe) {
            state.authObserverUnsubscribe();
        }
        return new Promise((resolve) => {
            const unsubscribe = getAuth().onAuthStateChanged(async (user) => {
                console.log('👣 the user has changed');
                dispatch('unsubscribeAuthUserSnapshot');
                if (user) {
                    await dispatch('fetchAuthUser');
                    resolve(user);
                } else {
                    resolve(null);
                }
            });
            commit(SET_AUTH_OBSERVER_UNSUBSCRIBE, unsubscribe);
        });
    },

    async registerUserWithEmailAndPassword({ dispatch }, { avatar = null, email, name, username, password }) {
        const auth = getAuth();
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await dispatch('createUser', { id: result.user.uid, email, name, username, avatar });
        await dispatch('fetchAuthUser');
    },

    signInWithEmailAndPassword({ commit }, { email, password }) {
        const auth = getAuth();
        return signInWithEmailAndPassword(auth, email, password);
    },

    async signInWithGoogle({ dispatch }) {
        const provider = new GoogleAuthProvider();
        const auth = getAuth();
        const response = await signInWithPopup(auth, provider);
        const user = response.user;
        const userRef = doc(db, 'users', user.uid);
        const userDoc = getDoc(userRef);
        if (!userDoc.exists) {
            return dispatch('createUser', {
                id: user.uid,
                name: user.displayName,
                email: user.email,
                username: user.email,
                avatar: user.photoURL,
            });
        }
    },

    async signOut({ commit }) {
        await getAuth().signOut();
        commit(SET_AUTH_ID, null);
    },

    async createUser({ commit }, { id, email, name, username, avatar = null }) {
        const registeredAt = serverTimestamp();
        const usernameLower = username.toLowerCase();
        email = email.toLowerCase();
        const user = { registeredAt, name, username, usernameLower, email, avatar };
        const userRef = doc(db, 'users', id);
        await setDoc(userRef, user);
        const newUser = getDoc(userRef);
        commit(SET_ITEM, { resource: 'users', item: newUser });
        return docToResource(newUser);
    },

    async createPost({ commit, state }, post) {
        post.userId = state.authId;
        post.publishedAt = serverTimestamp();

        const batch = writeBatch(db);

        const postRef = doc(collection(db, 'posts'));
        const threadRef = doc(db, 'threads', post.threadId);
        const userRef = doc(db, 'users', state.authId);
        batch.set(postRef, post);

        batch.update(threadRef, {
            posts: arrayUnion(postRef.id),
            contributors: arrayUnion(state.authId),
        });

        batch.update(userRef, {
            postsCount: increment(1),
        });

        await batch.commit();

        const newPost = await getDoc(postRef);

        /*const newPost = await addDoc(collection(db, 'posts'), post);
        const threadRef = doc(db, 'threads', post.threadId);

        await updateDoc(threadRef, {
            posts: arrayUnion(newPost.id),
            contributors: arrayUnion(state.authId),
        });*/

        commit(SET_ITEM, { resource: 'posts', item: { ...newPost.data(), id: newPost.id } });
        commit(ADD_POST_ID_TO_THREAD, { childId: newPost.id, parentId: post.threadId });
        commit(ADD_CONTRIBUTORS_TO_THREAD, { childId: state.authId, parentId: post.threadId });
    },

    async createThread({ commit, state, dispatch }, { text, title, forumId }) {
        const userId = state.authId;
        const publishedAt = serverTimestamp();

        const batch = writeBatch(db);

        const threadRef = doc(collection(db, 'threads'));
        const thread = { forumId, text, title, publishedAt, userId, id: threadRef.id };
        const userRef = doc(db, 'users', userId);
        const forumRef = doc(db, 'forums', forumId);

        batch.set(threadRef, thread);

        batch.update(userRef, {
            threads: arrayUnion(threadRef.id),
        });

        batch.update(forumRef, {
            threads: arrayUnion(threadRef.id),
        });

        await batch.commit();

        const newThread = await getDoc(threadRef);

        commit(SET_ITEM, { resource: 'threads', item: { ...newThread.data(), id: newThread.id } });
        commit(ADD_THREAD_TO_FORUM, { parentId: forumId, childId: threadRef.id });
        commit(ADD_THREAD_TO_USER, { parentId: userId, childId: threadRef.id });
        await dispatch('createPost', { text, threadId: threadRef.id });

        return findByID(state.threads, threadRef.id);
    },

    async updatePost({ commit, state }, { text, id }) {
        const post = {
            text,
            edited: {
                at: serverTimestamp(),
                by: state.authId,
                moderated: false,
            },
        };

        const postRef = doc(db, 'posts', id);
        await updateDoc(postRef, post);
        const updatedPost = await getDoc(postRef);

        commit(SET_ITEM, { resource: 'posts', item: updatedPost });
    },

    async updateThread({ commit, state }, { text, title, id }) {
        const thread = findByID(state.threads, id);
        const post = findByID(state.posts, thread.posts[0]);
        let newThread = { ...thread, title };
        let newPost = { ...post, text };

        const batch = writeBatch(db);

        const threadRef = doc(db, 'threads', id);
        const postRef = doc(db, 'posts', post.id);
        batch.set(postRef, post);

        batch.update(threadRef, newThread);
        batch.update(postRef, newPost);

        await batch.commit();

        newThread = await getDoc(threadRef);
        newPost = await getDoc(postRef);

        commit(SET_ITEM, { resource: 'threads', item: newThread });
        commit(SET_ITEM, { resource: 'posts', item: newPost });
        return docToResource(newThread);
    },

    updateUser({ commit }, user) {
        commit(SET_ITEM, { resource: 'users', item: user });
    },

    // ---------------------------------------
    // Fetch Single Resource
    // ---------------------------------------
    fetchCategory: ({ dispatch }, { id }) => dispatch('fetchItem', { id, resource: 'categories' }),
    fetchForum: ({ dispatch }, { id }) => dispatch('fetchItem', { id, resource: 'forums' }),
    fetchThread: ({ dispatch }, { id }) => dispatch('fetchItem', { id, resource: 'threads' }),
    fetchPost: ({ dispatch }, { id }) => dispatch('fetchItem', { id, resource: 'posts' }),
    fetchUser: ({ dispatch }, { id }) => dispatch('fetchItem', { id, resource: 'users' }),
    fetchAuthUser: async ({ dispatch, commit }) => {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        /*const userRef = doc(db, 'users', userId);
        const user = await getDoc(userRef);
        const item = docToResource(user);
        commit(SET_ITEM, { resource: 'users', item });*/

        await dispatch('fetchItem', {
            resource: 'users',
            id: userId,
            handleUnsubscribe: (unsubscribe) => {
                commit(SET_AUTH_USER_UNSUBSCRIBE, unsubscribe);
            },
        });
        commit(SET_AUTH_ID, userId);
    },

    // ---------------------------------------
    // Fetch All of a Resource
    // ---------------------------------------
    async fetchAllCategories({ commit }) {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        return new Promise(resolve => {
            const categories = [];
            querySnapshot.forEach((doc) => {
                const item = { ...doc.data(), id: doc.id };
                categories.push(item);
                commit(SET_ITEM, { resource: 'categories', item });
            });
            resolve(categories);
        });
    },

    // ---------------------------------------
    // Fetch Multiple Resources
    // ---------------------------------------
    fetchCategories: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'categories', ids }),
    fetchForums: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'forums', ids }),
    fetchThreads: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'threads', ids }),
    fetchPosts: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'posts', ids }),
    fetchUsers: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'users', ids }),

    async fetchItem({ state, commit }, { id, resource, handleUnsubscribe = null }) {
        console.log('fetchItem');
        return new Promise(resolve => {
            const docRef = doc(db, resource, id);
            const unsubscribe = onSnapshot(docRef, (doc) => {
                if (doc.exists()) {
                    const item = { ...doc.data(), id: doc.id };
                    commit(SET_ITEM, { resource, item });
                    resolve(item);
                } else {
                    resolve(null);
                }
            });
            if (handleUnsubscribe) {
                handleUnsubscribe(unsubscribe);
            } else {
                commit(UNSUBSCRIBE, { unsubscribe });
            }
        });
    },

    fetchItems({ dispatch }, { ids, resource }) {
        return Promise.all(ids.map(id => dispatch('fetchItem', { id, resource })));
    },

    async unsubscribeAllSnapshots({ state, commit }) {
        state.unsubscribes.forEach(unsubscribe => unsubscribe());
        commit(CLEAR_UNSUBSCRIBES);
    },

    async unsubscribeAuthUserSnapshot({ state, commit }) {
        if (state.authUserUnsubscribe) {
            state.authUserUnsubscribe();
            commit(SET_AUTH_USER_UNSUBSCRIBE, null);
        }
    },
};