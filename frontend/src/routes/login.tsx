import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginForm } from '@/components/LoginForm'
import { getSessionFn } from '@/server/fn/getSession'

export const Route = createFileRoute('/login')({
	component: App,
	notFoundComponent: () => <p>Página no encontrada</p>,
	beforeLoad: async () => {
		const session = await getSessionFn()
		if (session?.user) {
			throw redirect({
				to: '/home',
			})
		}
	},
})

function App() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm md:max-w-4xl">
				<LoginForm />
			</div>
		</div>
	)
}
