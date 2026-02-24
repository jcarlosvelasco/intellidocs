import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { authClient } from '@/lib/auth-client'
import { getSessionFn } from '@/server/fn/getSession'
import Header from '@/components/Header'

export const Route = createFileRoute('/home/settings/')({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await getSessionFn()
		if (!session?.user) {
			throw redirect({
				to: '/login',
			})
		}
	},
})

function RouteComponent() {
	const router = useRouter()

	function handleDeleteAccount() {
		const toastId = toast.loading('Deleting user...')
		authClient.deleteUser().then((result) => {
			if (result.error) {
				toast.error('Login failed', {
					id: toastId,
					description: result.error.message,
				})
				console.log(result.error.message)
			} else {
				toast.success('User deleted successfully!', {
					id: toastId,
				})
				router.navigate({ to: '/home' })
			}
		})
	}

	return (
		<div className="min-h-svh bg-linear-to-b from-slate-900 via-slate-800 to-slate-900">
			<Header />
			<div className="flex h-full flex-col items-center px-6 md:px-10 py-4 md:py-6">
				<div className="w-full max-w-7xl">
					<p className="font-bold text-lg mb-12">Settings</p>
					<div className="flex flex-col gap-8">
						<Dialog>
							<DialogTrigger asChild>
								<Button
									className="cursor-pointer w-fit"
									variant="destructive"
								>
									Delete account
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>
										Are you absolutely sure?
									</DialogTitle>
									<DialogDescription>
										This action cannot be undone. This will
										permanently delete your account and
										remove your data from our servers.
									</DialogDescription>
								</DialogHeader>

								<DialogFooter>
									<DialogClose asChild>
										<Button variant="outline">
											Cancel
										</Button>
									</DialogClose>
									<DialogClose asChild>
										<Button
											onClick={handleDeleteAccount}
											variant="outline"
										>
											Delete account
										</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</div>
		</div>
	)
}
