import SignupForm from './SignupForm'
import CreateAuthShell from '@/components/dashboard/CreateAuthShell'

export default function SignupPage() {
  return <CreateAuthShell heading="Request access" description="We review all requests and approve within 24 hours."><SignupForm /></CreateAuthShell>
}
