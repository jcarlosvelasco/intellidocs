import z from 'zod'

export const SourceSchema = z.object({
	source: z.string(),
	page: z.number().nullable(),
	snippet: z.string(),
})

export type Source = z.infer<typeof SourceSchema>

export const CreateUserMessageSchema = z.object({
	content: z.string().min(1),
	conversationId: z.number(),
	role: z.string().default('user'),
	sources: z.array(SourceSchema).default([]),
})
