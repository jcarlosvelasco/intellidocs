import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Conversation } from '@/types/Conversation'
import { createConversationFn } from '@/server/fn/createConversation'
import { deleteConversation } from '@/server/fn/deleteConversation'

export function useConversations(initialConversations: Array<Conversation>) {
	const [conversations, setConversations] = useState(initialConversations)
	const [selectedConversation, setSelectedConversation] =
		useState<Conversation | null>(null)

	const createConversation = useServerFn(createConversationFn)
	const deleteConversationFn = useServerFn(deleteConversation)

	async function onCreateConversation() {
		const toastId = toast.loading('Creating conversation...')

		const result = await createConversation({
			data: { title: 'New conversation' },
		})

		if (!result.success) {
			toast.error('Failed to create conversation', { id: toastId })
			return
		}

		toast.success('Conversation created', { id: toastId })

		const newConversation: Conversation = {
			id: result.result.id,
			title: result.result.title,
			userId: result.result.userId,
			createdAt: result.result.createdAt,
			updatedAt: result.result.updatedAt,
			status: 'idle',
		}

		setConversations((prev) => [...prev, newConversation])
		setSelectedConversation(newConversation)
	}

	const onDeleteConversation = async (conversationId: number | undefined) => {
		if (!conversationId) return

		const toastId = toast.loading('Deleting conversation...')

		const result = await deleteConversationFn({
			data: { conversationId },
		})

		if (!result.success) {
			toast.error('Failed to delete conversation', { id: toastId })
			return
		}

		toast.success('Conversation deleted', { id: toastId })
		setConversations((prev) => prev.filter((c) => c.id !== conversationId))
		setSelectedConversation(null)
	}

	return {
		conversations,
		selectedConversation,
		setSelectedConversation,
		onCreateConversation,
		onDeleteConversation,
	}
}
