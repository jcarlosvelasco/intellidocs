import z from 'zod'

export const GetConversationMessagesSchema = z.object({
	conversationId: z.number(),
})
