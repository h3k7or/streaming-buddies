import { useReducer, useEffect } from 'react';
import { store } from './useStore.js';
import { FEED_DATA } from '../data/feed.js';
import { TRENDING_DATA } from '../data/trending.js';
import { PEOPLE_DATA } from '../data/people.js';
import { NOTIFICATIONS_DATA } from '../data/notifications.js';

const initialState = {
  user: null,
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
  showingAuth: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return { ...state, ...action.payload };

    case 'SHOW_SCREEN': {
      const isSubScreen = ['detail', 'notifications', 'stats'].includes(action.screen);
      return {
        ...state,
        prevScreen: isSubScreen ? state.currentScreen : state.currentScreen,
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

    case 'TOGGLE_LIKE': {
      const liked = new Set(state.liked);
      if (liked.has(action.id)) liked.delete(action.id); else liked.add(action.id);
      return { ...state, liked };
    }

    case 'TOGGLE_FOLLOW': {
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

    case 'SUBMIT_LOG': {
      const feed = [action.entry, ...state.feed];
      const myEntries = [action.entry, ...state.myEntries];
      return { ...state, feed, myEntries, modalOpen: false, modalPrefill: '' };
    }

    case 'SHOW_TOAST':
      return { ...state, toast: action.msg };

    case 'HIDE_TOAST':
      return { ...state, toast: null };

    case 'LOGIN':
      return { ...state, user: action.user, showingAuth: false };

    case 'LOGOUT':
      return { ...state, user: null, showingAuth: true };

    case 'FINISH_ONBOARDING':
      return { ...state, onboardingDone: true, showingAuth: !state.user };

    case 'MARK_NOTIF_READ': {
      const notifications = state.notifications.map(n =>
        n.id === action.id ? { ...n, read: true } : n
      );
      return { ...state, notifications };
    }

    case 'MARK_ALL_NOTIF_READ': {
      const notifications = state.notifications.map(n => ({ ...n, read: true }));
      return { ...state, notifications };
    }

    default:
      return state;
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const liked = new Set(store.get('liked') || []);
    const feed = store.get('feed') || FEED_DATA;
    const myEntries = store.get('myEntries') || [];
    const people = store.get('people') || PEOPLE_DATA;
    const user = store.get('user');
    const onboardingDone = store.get('onboardingDone') || false;

    dispatch({
      type: 'INIT',
      payload: {
        liked,
        feed,
        myEntries,
        people,
        trending: TRENDING_DATA,
        notifications: NOTIFICATIONS_DATA,
        user,
        onboardingDone,
        showingAuth: onboardingDone && !user,
      },
    });
  }, []);

  // Persist liked, feed, myEntries, people, user after each change
  useEffect(() => {
    store.set('liked', [...state.liked]);
  }, [state.liked]);

  useEffect(() => {
    store.set('feed', state.feed);
    store.set('myEntries', state.myEntries);
  }, [state.feed, state.myEntries]);

  useEffect(() => {
    store.set('people', state.people);
  }, [state.people]);

  useEffect(() => {
    store.set('user', state.user);
  }, [state.user]);

  useEffect(() => {
    if (state.onboardingDone) store.set('onboardingDone', true);
  }, [state.onboardingDone]);

  return [state, dispatch];
}
