import { createServerFn } from '@tanstack/react-start'
import { and, eq, sql } from 'drizzle-orm'
import { DeleteUserInfoSchema } from '../schema/DeleterUserInfoSchema'
import { conversation } from '@/db/conversation-schema'
import { db } from '@/index'
import { documents } from '@/db/document-schema'

export const deleteUserInfo = createServerFn()
	.inputValidator(DeleteUserInfoSchema)
	.handler(async ({ data }) => {
		const userId = data.userId

		// Remove embeddings/documents
		const documentDelete = db
			.delete(documents)
			.where(and(eq(sql`${documents.metadata}->>'user_id'`, userId)))

		// Remove conversations
		const conversationDelete = db
			.delete(conversation)
			.where(eq(conversation.userId, userId))

		try {
			const [result1, result2] = await Promise.all([
				documentDelete,
				conversationDelete,
			])

			return {
				success: true,
				message: 'User info deleted successfully',
			}
		} catch (err) {
			console.error('Deletion error for user', userId, err)
			return { success: false, message: 'Failed to delete user info' }
		}
	})
