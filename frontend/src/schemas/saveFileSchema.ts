import z from 'zod'

export const saveFileSchema = z.object({
	key: z.string().min(1, 'key must be a non-empty string'),
	data: z.union([z.instanceof(Buffer), z.instanceof(File).optional()]),
})
