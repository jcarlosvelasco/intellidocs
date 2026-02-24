import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'
import { ResetPassForm } from '@/components/ResetPassForm'

const searchSchema = z.object({
	token: z.string().min(1),
})

export const Route = createFileRoute('/auth/reset-pass/')({
	validateSearch: searchSchema,
	component: RouteComponent,
})

function RouteComponent() {
	const { token } = Route.useSearch()

	return (
		<div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm md:max-w-4xl">
				<ResetPassForm token={token} />
			</div>
		</div>
	)
}
