import SignupForm from './SignupForm'
import CreateAuthShell from '@/components/dashboard/CreateAuthShell'

export default function SignupPage() {
  return <CreateAuthShell heading="Create your account"><SignupForm /></CreateAuthShell>
}
