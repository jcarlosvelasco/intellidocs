import type { Source } from './Source'

interface ConversationMessage {
	id: number
	conversationId: number
	role: string
	content: string
	createdAt: Date
	sources: Array<Source> | null
}

export type { ConversationMessage }
