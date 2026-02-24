import z from 'zod'

export const GetConversationDocumentsSchema = z.object({
	conversationId: z.number(),
})
