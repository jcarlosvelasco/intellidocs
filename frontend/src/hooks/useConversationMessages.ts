import { useServerFn } from '@tanstack/react-start'
import { useEffect, useState } from 'react'
import { useConversationSocket } from './useConversationSocket'
import type { ConversationMessage } from '@/types/ConversationMessage'
import type { Conversation } from '@/types/Conversation'
import { getConversationDocuments } from '@/server/fn/getConversationDocuments'
import { getConversationMessages } from '@/server/fn/getConversationMessages'
import useConversationDocumentStore from '@/store/conversationDocumentStore'
import usePendingFilesStore from '@/store/pendingFilesStore'

export function useConversationMessages(conversation: Conversation | null) {
	const conversationId = conversation?.id

	const [messages, setMessages] = useState<
		Record<number, Array<ConversationMessage>>
	>({})
	const [isLoading, setIsLoading] = useState(false)
	const [areMessagesLoading, setAreMessagesLoading] = useState(false)

	const getMessagesFn = useServerFn(getConversationMessages)
	const getDocumentsFn = useServerFn(getConversationDocuments)

	const { updateConversationDocuments, removeAllConversationDocuments } =
		useConversationDocumentStore()
	const { removeAllPendingFiles } = usePendingFilesStore()

	useConversationSocket(conversationId ?? null, isLoading, async () => {
		if (!conversationId) return
		if (isLoading === false) return

		const messagesRes = await getMessagesFn({
			data: { conversationId },
		})

		if (messagesRes.success) {
			setMessages((prev) => ({
				...prev,
				[conversationId]: messagesRes.conversations,
			}))
		}

		setIsLoading(false)
	})

	useEffect(() => {
		if (!conversationId) {
			removeAllConversationDocuments()
			return
		}

		removeAllPendingFiles()
		setIsLoading(conversation.status === 'loading')

		const fetchData = async () => {
			setAreMessagesLoading(true)
			const [messagesRes, documentsRes] = await Promise.all([
				getMessagesFn({ data: { conversationId } }),
				getDocumentsFn({ data: { conversationId } }),
			])

			if (messagesRes.success) {
				setMessages((prev) => ({
					...prev,
					[conversationId]: messagesRes.conversations,
				}))
			}

			if (documentsRes.success) {
				updateConversationDocuments(
					conversationId,
					documentsRes.conversations,
				)
			}

			setAreMessagesLoading(false)
		}

		fetchData()
	}, [conversationId])

	return {
		messages,
		setMessages,
		isLoading,
		setIsLoading,
		areMessagesLoading,
	}
}
