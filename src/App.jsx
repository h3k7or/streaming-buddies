import { useAppState } from './hooks/useAppState.js';
import Onboarding from './components/onboarding/Onboarding.jsx';
import AuthScreen from './components/auth/AuthScreen.jsx';
import AppShell from './components/layout/AppShell.jsx';
import LogModal from './components/modals/LogModal.jsx';
import Toast from './components/ui/Toast.jsx';

export default function App() {
  const [state, dispatch, actions] = useAppState();

  const showOnboarding = !state.onboardingDone;
  const showAuth = state.onboardingDone && !state.user && !state.loading;

  return (
    <>
      <Onboarding visible={showOnboarding} dispatch={dispatch} />
      <AuthScreen visible={showAuth} actions={actions} />
      {state.user && (
        <>
          <AppShell state={state} dispatch={dispatch} actions={actions} />
          <LogModal
            open={state.modalOpen}
            prefill={state.modalPrefill}
            modalType={state.modalType}
            modalStatus={state.modalStatus}
            modalRating={state.modalRating}
            modalPosterPath={state.modalPosterPath}
            modalYear={state.modalYear}
            user={state.user}
            dispatch={dispatch}
            actions={actions}
          />
        </>
      )}
      <Toast msg={state.toast} dispatch={dispatch} />
    </>
  );
}
