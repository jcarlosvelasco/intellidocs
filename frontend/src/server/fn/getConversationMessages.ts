import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { GetConversationMessagesSchema } from '../schema/GetConversationMessagesSchema'
import { getSessionFn } from './getSession'
import authMiddleware from '@/middleware/auth-middleware'
import { db } from '@/index'
import { conversationMessage } from '@/db/conversation-schema'

export const getConversationMessages = createServerFn({
	method: 'GET',
})
	.inputValidator(GetConversationMessagesSchema)
	.middleware([authMiddleware])
	.handler(async ({ data }) => {
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
			.from(conversationMessage)
			.where(eq(conversationMessage.conversationId, data.conversationId))
			.orderBy(conversationMessage.createdAt)

		return {
			success: true,
			message: 'Conversations messages retrieved successfully',
			conversations: result,
		}
	})
