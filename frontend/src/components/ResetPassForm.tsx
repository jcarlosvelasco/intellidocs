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

type ResetPassFormProps = React.ComponentProps<'div'> & {
	token: string
}

export function ResetPassForm({
	className,
	token,
	...props
}: ResetPassFormProps) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsLoading(true)

		const toastId = toast.loading('Resetting password...')

		const formData = new FormData(e.currentTarget)
		const newPassword = formData.get('password') as string
		const confirmPassword = formData.get('confirmPassword') as string

		if (newPassword !== confirmPassword) {
			toast.error('Passwords do not match', { id: toastId })
			setIsLoading(false)
			return
		}

		if (newPassword.length < 8) {
			toast.error('Password must be at least 8 characters', {
				id: toastId,
			})
			setIsLoading(false)
			return
		}

		try {
			await authClient.resetPassword({
				newPassword: newPassword,
				token,
			})

			toast.success('Password reset successfully!', {
				id: toastId,
			})

			setTimeout(() => {
				router.navigate({ to: '/login' })
			}, 1000)
		} catch (error: any) {
			toast.error('Failed to reset password', {
				id: toastId,
				description: error.message || 'Please try again',
			})
			console.error(error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className={cn('flex flex-col gap-6', className)} {...props}>
			<Card className="overflow-hidden p-0">
				<CardContent className="p-0">
					<form className="p-6 md:p-8" onSubmit={handleSubmit}>
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<h1 className="text-2xl font-bold">
									Reset Password
								</h1>
								<p className="text-muted-foreground text-balance">
									Enter your new password below
								</p>
							</div>
							<Field>
								<FieldLabel htmlFor="password">
									New Password
								</FieldLabel>
								<Input
									id="password"
									type="password"
									name="password"
									placeholder="Enter new password"
									required
									minLength={8}
									disabled={isLoading}
								/>
								<FieldDescription>
									Password must be at least 8 characters
								</FieldDescription>
							</Field>
							<Field>
								<FieldLabel htmlFor="confirmPassword">
									Confirm Password
								</FieldLabel>
								<Input
									id="confirmPassword"
									type="password"
									name="confirmPassword"
									placeholder="Confirm new password"
									required
									minLength={8}
									disabled={isLoading}
								/>
							</Field>
							<Field>
								<Button type="submit" disabled={isLoading}>
									Reset Password
								</Button>
							</Field>
							<FieldDescription className="text-center">
								Remember your password?{' '}
								<a href="/login">Back to login</a>
							</FieldDescription>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
