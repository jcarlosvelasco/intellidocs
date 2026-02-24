import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { GetConversationDocumentsSchema } from '../schema/GetConversationDocumentsSchema'
import { getSessionFn } from './getSession'
import authMiddleware from '@/middleware/auth-middleware'
import { db } from '@/index'
import { conversationDocument } from '@/db/conversation-schema'

export const getConversationDocuments = createServerFn({
	method: 'GET',
})
	.inputValidator(GetConversationDocumentsSchema)
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
			.from(conversationDocument)
			.where(eq(conversationDocument.conversationId, data.conversationId))
			.orderBy(conversationDocument.createdAt)

		return {
			success: true,
			message: 'Conversations messages retrieved successfully',
			conversations: result,
		}
	})
