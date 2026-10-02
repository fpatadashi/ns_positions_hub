import { AppDataProvider } from '../shared/context/AppDataContext';
import ChairIcons from '../icons/ChairIcons';
import AppShell from '../layout/AppShell';

export default function MainApp({ session }) {
  return (
    <AppDataProvider currentUserEmail={session.user.email}>
      <ChairIcons />
      <AppShell session={session} />
    </AppDataProvider>
  );
}
