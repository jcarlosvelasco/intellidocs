import { createServerFn } from '@tanstack/react-start'
import { and, eq, sql } from 'drizzle-orm'
import { DeleteConversationDocumentSchema } from '../schema/DeleteConversationDocumentSchema'
import authMiddleware from '@/middleware/auth-middleware'
import { db } from '@/index'
import { conversationDocument } from '@/db/conversation-schema'
import { documents } from '@/db/document-schema'

export const deleteConversationDocumentFn = createServerFn({})
	.inputValidator(DeleteConversationDocumentSchema)
	.middleware([authMiddleware])
	.handler(async ({ data }) => {
		const [documentsResult, conversationResult] = await Promise.allSettled([
			db
				.delete(documents)
				.where(
					and(
						eq(
							documents.conversationId,
							data.conversationId.toString(),
						),
						eq(
							sql`${documents.metadata}->>'document_id'`,
							data.conversationDocumentId.toString(),
						),
					),
				),

			db
				.delete(conversationDocument)
				.where(
					and(
						eq(
							conversationDocument.conversationId,
							data.conversationId,
						),
						eq(
							conversationDocument.id,
							data.conversationDocumentId,
						),
					),
				),
		])

		if (documentsResult.status === 'rejected') {
			console.error(
				'Error deleting document for user',
				documentsResult.reason,
			)
			return { success: false, message: 'Failed to delete documents' }
		}

		if (conversationResult.status === 'rejected') {
			console.error(
				'Error deleting document for user',
				conversationResult.reason,
			)
			return { success: false, message: 'Failed to delete conversation' }
		}

		return {
			success: true,
			message: 'Conversation deleted successfully',
		}
	})
