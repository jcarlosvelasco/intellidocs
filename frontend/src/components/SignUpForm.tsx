import { toast } from 'sonner'
import { useRouter } from '@tanstack/react-router'
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

export function SignupForm({
	className,
	...props
}: React.ComponentProps<'div'>) {
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const toastId = toast.loading('Creating account...')

		const formData = new FormData(e.currentTarget)

		const name = formData.get('name') as string
		const email = formData.get('email') as string
		const password = formData.get('password') as string
		const confirmPassword = formData.get('confirm-password') as string

		if (password !== confirmPassword) {
			return
		}

		await authClient.signUp.email(
			{
				name: name,
				email: email,
				password: password,
			},
			{
				onError: ({ error }) => {
					toast.error('Error creating account', {
						id: toastId,
						description: error.message,
					})
					console.log(error)
				},
				onSuccess: () => {
					toast.success('Created account successfully!', {
						id: toastId,
					})
					router.navigate({ to: '/login' })
				},
			},
		)
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

	return (
		<div className={cn('flex flex-col gap-6', className)} {...props}>
			<Card className="overflow-hidden p-0">
				<CardContent className="p-0">
					<form className="p-6 md:p-8" onSubmit={handleSubmit}>
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<h1 className="text-2xl font-bold">
									Create your IntelliDocs account
								</h1>
								<p className="text-muted-foreground text-sm text-balance">
									Enter your email below to create your
									account
								</p>
							</div>
							<Field>
								<FieldLabel htmlFor="name">Name</FieldLabel>
								<Input
									id="name"
									name="name"
									type="text"
									placeholder="John Doe"
									required
								/>
							</Field>

							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="m@example.com"
									required
								/>
								<FieldDescription>
									We&apos;ll use this to contact you. We will
									not share your email with anyone else.
								</FieldDescription>
							</Field>
							<Field>
								<Field className="grid grid-cols-2 gap-4">
									<Field>
										<FieldLabel htmlFor="password">
											Password
										</FieldLabel>
										<Input
											id="password"
											name="password"
											type="password"
											minLength={8}
											required
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor="confirm-password">
											Confirm Password
										</FieldLabel>
										<Input
											id="confirm-password"
											name="confirm-password"
											type="password"
											minLength={8}
											required
										/>
									</Field>
								</Field>
								<FieldDescription>
									Must be at least 8 characters long.
								</FieldDescription>
							</Field>
							<Field>
								<Button type="submit">Create Account</Button>
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
								Already have an account?{' '}
								<a href="/login">Sign in</a>
							</FieldDescription>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
			{/* <FieldDescription className="px-6 text-center">
				By clicking continue, you agree to our{' '}
				<a href="#">Terms of Service</a> and{' '}
				<a href="#">Privacy Policy</a>.
			</FieldDescription> */}
		</div>
	)
}
