import { createServerFn } from '@tanstack/react-start'
import { CreateConversationDocumentSchema } from '../schema/CreateConversationDocumentSchema'
import { getSessionFn } from './getSession'
import authMiddleware from '@/middleware/auth-middleware'
import { db } from '@/index'
import { conversationDocument } from '@/db/conversation-schema'

export const createConversationDocumentFn = createServerFn({
	method: 'POST',
})
	.inputValidator(CreateConversationDocumentSchema)
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
			.insert(conversationDocument)
			.values({
				documentName: data.name,
				sourceKey: data.sourceKey,
				conversationId: data.conversationId,
			})
			.returning()

		return {
			success: true,
			message: 'Conversation document created successfully',
			result: result[0],
		}
	})
