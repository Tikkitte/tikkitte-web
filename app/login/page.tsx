import LoginForm from './LoginForm'
import CreateAuthShell from '@/components/dashboard/CreateAuthShell'

export default function LoginPage() {
  return <CreateAuthShell heading="Sign in" description="Welcome back to Tikkitte Create."><LoginForm /></CreateAuthShell>
}
