import z from 'zod'

export const DeleteConversationSchema = z.object({
	conversationId: z.number(),
})
