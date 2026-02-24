import z from 'zod'

export const DeleteConversationDocumentSchema = z.object({
	conversationId: z.number(),
	conversationDocumentId: z.number(),
})
