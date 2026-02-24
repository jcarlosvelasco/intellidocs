import { useEffect, useRef } from 'react'

export function useConversationSocket(
	conversationId: number | null,
	isLoading: boolean,
	onDone: () => void,
) {
	const socketRef = useRef<WebSocket | null>(null)

	const backendUrl =
		import.meta.env.VITE_ENVIRONMENT === 'DEV'
			? import.meta.env.VITE_BACKEND_URL_DEV
			: import.meta.env.VITE_BACKEND_URL_PROD

	useEffect(() => {
		if (!conversationId) return
		if (!isLoading) return

		const ws = new WebSocket(
			`${backendUrl}/ws/conversation/${conversationId}`,
		)

		socketRef.current = ws

		ws.onmessage = (event) => {
			console.log('Received message:', event.data)
			const data = JSON.parse(event.data)

			if (data.type === 'conversation_done') {
				onDone()
				ws.close()
			}
		}

		return () => {
			ws.close()
		}
	}, [conversationId, isLoading])
}
