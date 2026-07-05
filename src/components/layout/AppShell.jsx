import Header from './Header.jsx';
import BottomNav from './BottomNav.jsx';
import FeedScreen from '../../screens/FeedScreen.jsx';
import SearchScreen from '../../screens/SearchScreen.jsx';
import PeopleScreen from '../../screens/PeopleScreen.jsx';
import TrendingScreen from '../../screens/TrendingScreen.jsx';
import ProfileScreen from '../../screens/ProfileScreen.jsx';
import DetailScreen from '../../screens/DetailScreen.jsx';
import NotificationsScreen from '../../screens/NotificationsScreen.jsx';
import StatsScreen from '../../screens/StatsScreen.jsx';

const MAIN_SCREENS = ['feed', 'search', 'people', 'trending', 'profile'];

export default function AppShell({ state, dispatch, actions }) {
  const { currentScreen } = state;

  function navigate(screen) {
    dispatch({ type: 'SHOW_SCREEN', screen });
  }

  function openModal(itemOrPrefill = '') {
    if (typeof itemOrPrefill === 'string') {
      dispatch({ type: 'OPEN_MODAL', prefill: itemOrPrefill });
    } else {
      dispatch({ type: 'OPEN_MODAL', item: itemOrPrefill });
    }
  }

  function showToast(msg) {
    dispatch({ type: 'SHOW_TOAST', msg });
  }

  function goBack() {
    dispatch({ type: 'GO_BACK' });
  }

  // Determine which bottom-nav item is active (sub-screens keep highlighting their parent)
  const activeNav = MAIN_SCREENS.includes(currentScreen) ? currentScreen : state.prevScreen;

  return (
    <div id="app">
      <Header onLogClick={() => openModal()} />
      <div id="screens">
        <FeedScreen    active={currentScreen === 'feed'}    state={state} dispatch={dispatch} actions={actions} onDetail={id => navigate(`detail:${id}`)} onOpenModal={openModal} onToast={showToast} onNavigate={navigate} />
        <SearchScreen  active={currentScreen === 'search'}  state={state} dispatch={dispatch} onOpenModal={openModal} onToast={showToast} onNavigate={navigate} />
        <PeopleScreen  active={currentScreen === 'people'}  state={state} dispatch={dispatch} actions={actions} onToast={showToast} />
        <TrendingScreen active={currentScreen === 'trending'} state={state} dispatch={dispatch} onDetail={id => navigate(`detail:${id}`)} />
        <ProfileScreen active={currentScreen === 'profile'} state={state} dispatch={dispatch} actions={actions} onOpenModal={openModal} onToast={showToast} onNavigate={navigate} />
        <DetailScreen  active={currentScreen.startsWith('detail:')} state={state} dispatch={dispatch} actions={actions} itemId={currentScreen.startsWith('detail:') ? currentScreen.slice(7) : null} onBack={goBack} onToast={showToast} />
        <NotificationsScreen active={currentScreen === 'notifications'} state={state} dispatch={dispatch} actions={actions} onBack={goBack} />
        <StatsScreen   active={currentScreen === 'stats'}   state={state} dispatch={dispatch} onBack={goBack} />
      </div>
      <BottomNav current={activeNav} onNavigate={navigate} />
    </div>
  );
}
