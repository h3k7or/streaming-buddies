import { useReducer, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import {
  getFeed, getTrending, getMyEntries, getMyLikes,
  getPeople, getNotifications,
  insertEntry, addLike, removeLike,
  addFollow, removeFollow,
  markAllNotificationsRead,
} from '../utils/api.js';

const initialState = {
  user: null,
  loading: true,
  currentScreen: 'feed',
  prevScreen: 'feed',
  feedFilter: 'all',
  trendFilter: 'all',
  peopleTab: 'friends',
  liked: new Set(),
  feed: [],
  myEntries: [],
  people: [],
  trending: [],
  notifications: [],
  onboardingDone: false,
  modalOpen: false,
  modalPrefill: '',
  modalType: 'movie',
  modalStatus: 'finished',
  modalRating: 4,
  modalPosterPath: null,
  modalYear: null,
  toast: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.loading };

    case 'SET_USER':
      return { ...state, user: action.user, loading: false };

    case 'SET_DATA':
      return { ...state, ...action.payload };

    case 'SHOW_SCREEN': {
      return {
        ...state,
        prevScreen: state.currentScreen,
        currentScreen: action.screen,
      };
    }
    case 'GO_BACK':
      return { ...state, currentScreen: state.prevScreen || 'feed' };

    case 'SET_FEED_FILTER':
      return { ...state, feedFilter: action.filter };

    case 'SET_TREND_FILTER':
      return { ...state, trendFilter: action.filter };

    case 'SET_PEOPLE_TAB':
      return { ...state, peopleTab: action.tab };

    case 'TOGGLE_LIKE_LOCAL': {
      const liked = new Set(state.liked);
      const feed = state.feed.map(e => {
        if (e.id !== action.id) return e;
        const delta = liked.has(action.id) ? -1 : 1;
        return { ...e, likes: Math.max(0, e.likes + delta) };
      });
      if (liked.has(action.id)) liked.delete(action.id); else liked.add(action.id);
      return { ...state, liked, feed };
    }

    case 'TOGGLE_FOLLOW_LOCAL': {
      const people = state.people.map(p =>
        p.id === action.id ? { ...p, isFollowing: !p.isFollowing } : p
      );
      return { ...state, people };
    }

    case 'OPEN_MODAL': {
      const item = action.item || {};
      return {
        ...state,
        modalOpen: true,
        modalPrefill: item.title || action.prefill || '',
        modalType: item.type || state.modalType,
        modalPosterPath: item.posterPath || null,
        modalYear: item.year || null,
      };
    }

    case 'CLOSE_MODAL':
      return { ...state, modalOpen: false, modalPrefill: '', modalPosterPath: null, modalYear: null };

    case 'SET_MODAL_TYPE':
      return { ...state, modalType: action.modalType, modalStatus: 'finished' };

    case 'SET_MODAL_STATUS':
      return { ...state, modalStatus: action.modalStatus };

    case 'SET_MODAL_RATING':
      return { ...state, modalRating: action.rating };

    case 'PREPEND_ENTRY': {
      return {
        ...state,
        feed: [action.entry, ...state.feed],
        myEntries: [action.entry, ...state.myEntries],
        modalOpen: false,
        modalPrefill: '',
      };
    }

    case 'SHOW_TOAST':
      return { ...state, toast: action.msg };

    case 'HIDE_TOAST':
      return { ...state, toast: null };

    case 'LOGOUT':
      return { ...initialState, loading: false, onboardingDone: state.onboardingDone };

    case 'FINISH_ONBOARDING':
      return { ...state, onboardingDone: true };

    case 'MARK_ALL_NOTIF_READ': {
      const notifications = state.notifications.map(n => ({ ...n, read: true }));
      return { ...state, notifications };
    }

    default:
      return state;
  }
}

async function ensureProfile(u) {
  const meta = u.user_metadata || {};
  const uname = meta.username || u.email.split('@')[0];
  await supabase.from('profiles').upsert({
    id: u.id,
    username: uname,
    display_name: uname,
    avatar_letter: uname[0].toUpperCase(),
    avatar_color: '#E84830',
  }, { onConflict: 'id', ignoreDuplicates: true });
}

async function loadUserData(userId, dispatch) {
  try {
    const [feed, trending, myEntries, liked, notifications] = await Promise.all([
      getFeed(userId),
      getTrending(),
      getMyEntries(userId),
      getMyLikes(userId),
      getNotifications(userId),
    ]);
    dispatch({ type: 'SET_DATA', payload: { feed, trending, myEntries, liked, notifications } });
  } catch (e) {
    console.error('loadUserData', e);
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Restore onboarding flag from localStorage
  useEffect(() => {
    const done = localStorage.getItem('sb:onboardingDone') === 'true';
    if (done) dispatch({ type: 'FINISH_ONBOARDING' });
  }, []);

  useEffect(() => {
    if (state.onboardingDone) localStorage.setItem('sb:onboardingDone', 'true');
  }, [state.onboardingDone]);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        await ensureProfile(u);
        dispatch({
          type: 'SET_USER',
          user: {
            id: u.id,
            email: u.email,
            username: meta.username || u.email.split('@')[0],
            displayName: meta.username || u.email.split('@')[0],
            avatar: (meta.username || u.email)[0].toUpperCase(),
            avatarColor: '#E84830',
          },
        });
        loadUserData(u.id, dispatch);
      } else {
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        await ensureProfile(u);
        dispatch({
          type: 'SET_USER',
          user: {
            id: u.id,
            email: u.email,
            username: meta.username || u.email.split('@')[0],
            displayName: meta.username || u.email.split('@')[0],
            avatar: (meta.username || u.email)[0].toUpperCase(),
            avatarColor: '#E84830',
          },
        });
        loadUserData(u.id, dispatch);
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Async actions passed down alongside dispatch
  const actions = {
    async login(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },

    async signup(email, password, username) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) throw error;
    },

    async logout() {
      await supabase.auth.signOut();
    },

    async submitLog(entry) {
      const saved = await insertEntry(entry, state.user.id);
      dispatch({ type: 'PREPEND_ENTRY', entry: saved });
    },

    async toggleLike(entryId) {
      const isLiked = state.liked.has(entryId);
      dispatch({ type: 'TOGGLE_LIKE_LOCAL', id: entryId });
      try {
        if (isLiked) await removeLike(entryId, state.user.id);
        else await addLike(entryId, state.user.id);
      } catch {
        dispatch({ type: 'TOGGLE_LIKE_LOCAL', id: entryId }); // revert
      }
    },

    async toggleFollow(personId) {
      const person = state.people.find(p => p.id === personId);
      const isFollowing = person?.isFollowing;
      dispatch({ type: 'TOGGLE_FOLLOW_LOCAL', id: personId });
      try {
        if (isFollowing) await removeFollow(personId, state.user.id);
        else await addFollow(personId, state.user.id);
      } catch {
        dispatch({ type: 'TOGGLE_FOLLOW_LOCAL', id: personId }); // revert
      }
    },

    async loadPeople() {
      const people = await getPeople(state.user.id);
      dispatch({ type: 'SET_DATA', payload: { people } });
    },

    async markAllRead() {
      dispatch({ type: 'MARK_ALL_NOTIF_READ' });
      await markAllNotificationsRead(state.user.id);
    },

    async refreshFeed() {
      const [feed, myEntries] = await Promise.all([
        getFeed(state.user.id),
        getMyEntries(state.user.id),
      ]);
      dispatch({ type: 'SET_DATA', payload: { feed, myEntries } });
    },
  };

  return [state, dispatch, actions];
}
