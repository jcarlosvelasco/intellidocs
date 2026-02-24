import z from 'zod'

export const SendVerificationEmailSchema = z.object({
	url: z.string(),
	userName: z.string(),
	email: z.email(),
})
