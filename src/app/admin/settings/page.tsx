import { db } from '@/lib/db';
import SettingsClient from './SettingsClient';

export const metadata = {
  title: 'Library System Settings | LibSphere',
};

export default async function AdminSettingsPage() {
  const settings = await db.settings.findFirst();

  const initialSettings = settings
    ? {
        libraryName: settings.libraryName,
        loanDurationDays: settings.loanDurationDays,
        finePerDay: Number(settings.finePerDay),
        maxBooksPerMember: settings.maxBooksPerMember,
      }
    : {
        libraryName: 'LibSphere Library',
        loanDurationDays: 14,
        finePerDay: 1.0,
        maxBooksPerMember: 5,
      };

  return <SettingsClient initialSettings={initialSettings} />;
}
