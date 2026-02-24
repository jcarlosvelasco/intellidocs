import { create } from 'zustand'
import type { ConversationDocument } from '@/types/ConversationDocument'

interface ConversationDocumentStore {
	conversationDocuments: Record<string, Array<ConversationDocument>>
	addConversationDocument: (document: ConversationDocument) => void
	removeConversationDocument: (document: ConversationDocument) => void
	removeAllConversationDocuments: (conversationId?: string) => void
	updateConversationDocuments: (
		conversationId: number,
		documents: Array<ConversationDocument>,
	) => void
}

const useConversationDocumentStore = create<ConversationDocumentStore>(
	(set) => ({
		conversationDocuments: {},

		addConversationDocument: (document: ConversationDocument) =>
			set((state) => {
				const convId = document.conversationId.toString()
				return {
					conversationDocuments: {
						...state.conversationDocuments,
						[convId]: [
							...(state.conversationDocuments[convId] || []),
							document,
						],
					},
				}
			}),

		removeConversationDocument: (document: ConversationDocument) =>
			set((state) => {
				const convId = document.conversationId.toString()
				return {
					conversationDocuments: {
						...state.conversationDocuments,
						[convId]: (
							state.conversationDocuments[convId] || []
						).filter((d) => d.id !== document.id),
					},
				}
			}),

		removeAllConversationDocuments: (conversationId?: string) =>
			set((state) => {
				if (conversationId) {
					const convId = conversationId.toString()
					return {
						conversationDocuments: {
							...state.conversationDocuments,
							[convId]: [],
						},
					}
				}
				return { conversationDocuments: {} }
			}),

		updateConversationDocuments: (
			conversationId: number,
			documents: Array<ConversationDocument>,
		) =>
			set((state) => ({
				...state,
				conversationDocuments: {
					...state.conversationDocuments,
					[conversationId]: documents,
				},
			})),
	}),
)

export default useConversationDocumentStore
