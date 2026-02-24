import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { UpdateConversationSchema } from '../schema/UpdateConversationSchema'
import authMiddleware from '@/middleware/auth-middleware'
import { db } from '@/index'
import { conversation } from '@/db/conversation-schema'

export const updateConversationFn = createServerFn({
	method: 'POST',
})
	.inputValidator(UpdateConversationSchema)
	.middleware([authMiddleware])
	.handler(async ({ data }) => {
		await db
			.update(conversation)
			.set({ title: data.title })
			.where(eq(conversation.id, data.conversationId))

		return {
			success: true,
			message: 'Conversation updated successfully',
		}
	})
