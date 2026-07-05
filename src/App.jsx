import { useAppState } from './hooks/useAppState.js';
import Onboarding from './components/onboarding/Onboarding.jsx';
import AuthScreen from './components/auth/AuthScreen.jsx';
import AppShell from './components/layout/AppShell.jsx';
import LogModal from './components/modals/LogModal.jsx';
import Toast from './components/ui/Toast.jsx';

export default function App() {
  const [state, dispatch] = useAppState();

  const showOnboarding = !state.onboardingDone;
  const showAuth = state.onboardingDone && !state.user;

  return (
    <>
      <Onboarding
        visible={showOnboarding}
        dispatch={dispatch}
      />
      <AuthScreen
        visible={showAuth}
        dispatch={dispatch}
      />
      {state.user && (
        <>
          <AppShell state={state} dispatch={dispatch} />
          <LogModal
            open={state.modalOpen}
            prefill={state.modalPrefill}
            modalType={state.modalType}
            modalStatus={state.modalStatus}
            modalRating={state.modalRating}
            user={state.user}
            dispatch={dispatch}
          />
        </>
      )}
      <Toast msg={state.toast} dispatch={dispatch} />
    </>
  );
}
