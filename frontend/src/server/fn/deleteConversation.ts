import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { DeleteConversationSchema } from '../schema/DeleteConversationSchema'
import { getSessionFn } from './getSession'
import authMiddleware from '@/middleware/auth-middleware'
import { db } from '@/index'
import { conversation } from '@/db/conversation-schema'
import { documents } from '@/db/document-schema'

export const deleteConversation = createServerFn({})
	.inputValidator(DeleteConversationSchema)
	.middleware([authMiddleware])
	.handler(async ({ data }) => {
		const session = await getSessionFn()
		const userId = session?.user.id

		if (!userId) {
			return {
				success: false,
				message: 'User not authenticated',
			}
		}

		const [documentsResult, conversationResult] = await Promise.allSettled([
			db
				.delete(documents)
				.where(
					eq(
						documents.conversationId,
						data.conversationId.toString(),
					),
				),

			db
				.delete(conversation)
				.where(
					and(
						eq(conversation.id, data.conversationId),
						eq(conversation.userId, userId),
					),
				),
		])

		if (documentsResult.status === 'rejected') {
			console.error(
				'Error deleting documents for user',
				userId,
				documentsResult.reason,
			)
			return { success: false, message: 'Failed to delete documents' }
		}

		if (conversationResult.status === 'rejected') {
			console.error(
				'Error deleting conversation for user',
				userId,
				conversationResult.reason,
			)
			return { success: false, message: 'Failed to delete conversation' }
		}

		return {
			success: true,
			message: 'Conversation deleted successfully',
		}
	})
