import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Button } from './ui/button'
import { authClient } from '@/lib/auth-client'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Header() {
	const queryClient = useQueryClient()
	const routerState = useRouterState()

	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: ['session'] })
	}, [routerState.location.pathname])

	const { data: session } = useQuery({
		queryKey: ['session'],
		queryFn: () => authClient.getSession(),
	})

	const userId = session?.data?.user.id

	const navigate = useNavigate()

	const handleLogout = async () => {
		try {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						navigate({ to: '/' })
					},
				},
			})
		} catch (error) {
			console.error('Logout error:', error)
		}
	}

	return (
		<header className="px-8 py-4 flex items-center bg-transparent">
			<div className="w-full text-xl font-semibold flex flex-row items-center justify-between">
				<Link to="/home">
					<h1 className="font-crimson">IntelliDocs</h1>
				</Link>

				<div className="flex flex-row gap-4">
					{userId !== undefined && (
						<Link to="/home/settings">
							<Button>Settings</Button>
						</Link>
					)}

					<div className="hidden md:block">
						{userId !== undefined ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline">Profile</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-56"
									align="end"
								>
									<DropdownMenuLabel>
										My Account
									</DropdownMenuLabel>
									<DropdownMenuGroup>
										<Link to={'/home/settings'}>
											<DropdownMenuItem>
												Settings
											</DropdownMenuItem>
										</Link>
									</DropdownMenuGroup>
									<DropdownMenuGroup>
										<DropdownMenuItem
											onClick={handleLogout}
										>
											Logout
										</DropdownMenuItem>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<Link to={'/login'}>
								<Button>Login</Button>
							</Link>
						)}
					</div>
				</div>
			</div>
		</header>
	)
}
