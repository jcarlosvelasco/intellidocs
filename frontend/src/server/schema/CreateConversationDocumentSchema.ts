import z from 'zod'

export const CreateConversationDocumentSchema = z.object({
	conversationId: z.number(),
	sourceKey: z.string().min(1).max(2048),
	name: z.string().min(1).max(255),
})
