import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { getSessionFn } from './getSession'
import authMiddleware from '@/middleware/auth-middleware'
import { db } from '@/index'
import { conversation } from '@/db/conversation-schema'

export const getUserConversations = createServerFn({
	method: 'GET',
})
	.middleware([authMiddleware])
	.handler(async () => {
		const session = await getSessionFn()
		const userId = session?.user.id

		if (!userId) {
			return {
				success: false,
				message: 'User not authenticated',
				conversations: [],
			}
		}

		const result = await db
			.select()
			.from(conversation)
			.where(eq(conversation.userId, userId))
			.orderBy(conversation.updatedAt)

		return {
			success: true,
			message: 'Conversations retrieved successfully',
			conversations: result,
		}
	})
