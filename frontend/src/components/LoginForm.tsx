import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'

export function LoginForm({
	className,
	...props
}: React.ComponentProps<'div'>) {
	const router = useRouter()

	const [emailVerificationHidden, setEmailVerificationHidden] = useState(true)
	const [isEmailSent, setIsEmailSent] = useState(false)
	const [isResetPasswordClicked, setIsResetPasswordClicked] = useState(false)
	const [email, setEmail] = useState<string>('')

	async function onResetPasswordClicked() {
		if (isResetPasswordClicked || email === '') return
		await authClient.requestPasswordReset({
			email: email,
			redirectTo: '/auth/reset-pass',
		})
		setIsResetPasswordClicked(true)
		toast.success('Password reset email sent!')
	}

	async function onSendEmailVerificationClicked() {
		if (email === '') return

		await authClient.sendVerificationEmail({
			email: email,
			callbackURL: '/login',
		})

		setIsEmailSent(true)
		toast.success('Verification email sent!')
	}

	async function loginWithGoogle() {
		await authClient.signIn.social(
			{
				provider: 'google',
				callbackURL: '/home',
			},
			{
				onError: ({ error }) => {
					toast.error('Login failed', {
						description: error.message,
					})
				},
			},
		)
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const toastId = toast.loading('Logging in...')

		const formData = new FormData(e.currentTarget)

		const email = formData.get('email') as string
		const pass = formData.get('password') as string

		await authClient.signIn.email(
			{
				email: email,
				password: pass,
			},
			{
				onError: ({ error }) => {
					if (error.status === 403) {
						setEmailVerificationHidden(false)
					}

					toast.error('Login failed', {
						id: toastId,
						description: error.message,
					})
				},
				onSuccess: () => {
					toast.success('Logged in successfully!', {
						id: toastId,
					})
					router.navigate({ to: '/home' })
				},
			},
		)
	}

	return (
		<div className={cn('flex flex-col gap-6', className)} {...props}>
			<Card className="overflow-hidden p-0">
				<CardContent className="p-0">
					<form className="p-6 md:p-8" onSubmit={handleSubmit}>
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<h1 className="text-2xl font-bold">
									Welcome back
								</h1>
								<p className="text-muted-foreground text-balance">
									Login to your IntelliDocs account
								</p>
							</div>
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									type="email"
									name="email"
									placeholder="m@example.com"
									required
									onChange={(e) => setEmail(e.target.value)}
								/>
							</Field>
							<Field>
								<div className="flex items-center">
									<FieldLabel htmlFor="password">
										Password
									</FieldLabel>
									<p
										onClick={onResetPasswordClicked}
										className="ml-auto text-sm underline-offset-2 hover:underline cursor-pointer"
									>
										Forgot your password?
									</p>
								</div>
								<Input
									id="password"
									type="password"
									name="password"
									required
								/>
							</Field>
							<Field>
								<Button type="submit">Login</Button>
							</Field>
							<Button
								variant="outline"
								type="button"
								onClick={loginWithGoogle}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
								>
									<path
										d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
										fill="currentColor"
									/>
								</svg>
								Continue with Google
							</Button>

							<FieldDescription className="text-center">
								Don&apos;t have an account?{' '}
								<a href="/signup">Sign up</a>
							</FieldDescription>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>

			<p
				onClick={onSendEmailVerificationClicked}
				hidden={emailVerificationHidden && !isEmailSent}
				className="text-center cursor-pointer underline underline-offset-4 text-primary hover:opacity-80"
			>
				Send verification email
			</p>
			{/* <FieldDescription className="px-6 text-center">
				By clicking continue, you agree to our{' '}
				<a href="#">Terms of Service</a> and{' '}
				<a href="#">Privacy Policy</a>.
			</FieldDescription> */}
		</div>
	)
}
