import { redirect } from 'next/navigation';

export default function LegacyNewJobRedirect() {
  redirect('/submit');
}
