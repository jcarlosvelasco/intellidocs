import { createServerFn } from '@tanstack/react-start'
import { CreateUserMessageSchema } from '../schema/CreateUserMessageSchema'
import { getSessionFn } from './getSession'
import authMiddleware from '@/middleware/auth-middleware'
import { db } from '@/index'
import { conversationMessage } from '@/db/conversation-schema'

export const createUserMessageFn = createServerFn({
	method: 'POST',
})
	.inputValidator(CreateUserMessageSchema)
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
			.insert(conversationMessage)
			.values({
				content: data.content,
				conversationId: data.conversationId,
				role: data.role,
				sources: data.sources,
			})
			.returning()

		return {
			success: true,
			message: 'Conversation message created successfully',
			result: result[0],
		}
	})
