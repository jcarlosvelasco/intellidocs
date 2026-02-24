import { useNavigate } from '@tanstack/react-router'
import { Button } from './ui/button'
import { authClient } from '@/lib/auth-client'

export function LogoutButton() {
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

	return <Button onClick={handleLogout}>Cerrar sesión</Button>
}
