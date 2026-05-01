import { createServerFn } from '@tanstack/react-start'
import { agentInputSchema } from '@/schemas/agentInput'

export const sendMessageToAgent = createServerFn({
	method: 'POST',
})
	.inputValidator(agentInputSchema)
	.handler(async ({ data }) => {
		console.log(
			'Server: Sending message to agent with conversation ID:',
			data.conversationId,
		)

		const backendUrl =
			import.meta.env.VITE_ENVIRONMENT === 'DEV'
				? import.meta.env.VITE_BACKEND_URL_DEV_INTERNAL
				: import.meta.env.VITE_BACKEND_URL_PROD

		const response = await fetch(`${backendUrl}/chat`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				conversation_id: data.conversationId,
			}),
		})

		if (!response.ok) {
			throw new Error('Failed to communicate with agent')
		}

		const result = await response.json()

		console.log('Agent result', result)

		return {
			success: true,
			message: result.message,
			sources: result.sources,
			message_id: result.message_id,
			created_at: result.created_at,
			conversation_id: result.conversation_id,
		}
	})
