import { createServerFn } from '@tanstack/react-start'
import { CreateConversationSchema } from '../schema/CreateConversationSchema'
import { getSessionFn } from './getSession'
import authMiddleware from '@/middleware/auth-middleware'
import { db } from '@/index'
import { conversation } from '@/db/conversation-schema'

export const createConversationFn = createServerFn({
	method: 'POST',
})
	.inputValidator(CreateConversationSchema)
	.middleware([authMiddleware])
	.handler(async ({ data }) => {
		const session = await getSessionFn()
		const userId = session?.user.id

		if (!userId) {
			return {
				success: false,
				message: 'User not authenticated',
				result: null,
			}
		}

		const result = await db
			.insert(conversation)
			.values({
				title: data.title,
				userId: userId,
				status: 'idle',
			})
			.returning()

		return {
			success: true,
			message: 'Conversations created successfully',
			result: result[0],
		}
	})
