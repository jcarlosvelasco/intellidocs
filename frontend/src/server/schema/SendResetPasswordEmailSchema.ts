import z from 'zod'

export const SendResetPasswordEmailSchema = z.object({
	url: z.string(),
	userName: z.string(),
	email: z.email(),
})
