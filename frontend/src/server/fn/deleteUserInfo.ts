import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { supabaseClient } from '../db/supabase'
import { DeleteUserInfoSchema } from '../schema/DeleterUserInfoSchema'
import { conversation } from '@/db/conversation-schema'
import { db } from '@/index'

export const deleteUserInfo = createServerFn()
	.inputValidator(DeleteUserInfoSchema)
	.handler(async ({ data }) => {
		const userId = data.userId

		// Remove embeddings/documents from Supabase
		const supabaseDelete = supabaseClient
			.from('documents')
			.delete()
			.eq('metadata->>user_id', userId)

		// Remove conversations from Drizzle
		const drizzleDelete = db
			.delete(conversation)
			.where(eq(conversation.userId, userId))

		try {
			const [{ error }, _] = await Promise.all([
				supabaseDelete,
				drizzleDelete,
			])

			if (error) {
				console.error(
					'Error deleting documents for user',
					userId,
					error,
				)
				return { success: false, message: 'Failed to delete documents' }
			}

			return {
				success: true,
				message: 'User info deleted successfully',
			}
		} catch (err) {
			console.error('Deletion error for user', userId, err)
			return { success: false, message: 'Failed to delete user info' }
		}
	})
