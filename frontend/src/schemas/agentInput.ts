import { z } from 'zod'

export const agentInputSchema = z.object({
	query: z.string().min(1, 'Query cannot be empty'),
	conversationId: z.string(),
})
