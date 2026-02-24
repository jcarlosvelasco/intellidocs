import z from 'zod'

export const DeleteUserInfoSchema = z.object({
	userId: z.string(),
})
