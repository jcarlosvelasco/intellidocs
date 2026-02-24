import z from 'zod'

export const UpdateConversationSchema = z.object({
	conversationId: z.int(),
	title: z.string().min(1).max(255),
})
