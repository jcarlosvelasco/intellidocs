import { Plus } from 'lucide-react'
import { useState } from 'react'
import { EmptyConversations } from './EmptyConversations'
import { ConversationItem } from './ConversationItem'
import { DeleteConversationAlert } from './DeleteConversationAlert'
import type { Conversation } from '@/types/Conversation'

interface ConversationsListProps {
	conversations: Array<Conversation>
	selectedConversation: Conversation | null
	onCreate: () => void
	onSelect: (conv: Conversation) => void
	onDeleteConversation: (conversationId: number | undefined) => Promise<void>
}

export function ConversationsList({
	conversations,
	onCreate,
	selectedConversation,
	onSelect,
	onDeleteConversation,
}: ConversationsListProps) {
	const [clickedConv, setClickedConv] = useState<Conversation | null>(null)

	async function handleClickedConv() {
		if (!clickedConv) {
			return
		}

		await onDeleteConversation(clickedConv.id)
		setClickedConv(null)
	}

	function handleTrashClick(conv: Conversation) {
		setClickedConv(conv)
	}

	return (
		<>
			<DeleteConversationAlert
				onDelete={handleClickedConv}
				onCancel={() => setClickedConv(null)}
			/>
			<div className="flex flex-col gap-2 w-1/4 h-full overflow-y-auto">
				<div className="flex flex-row items-center justify-between">
					<p className="sticky top-0 pb-2 font-bold font-crimson text-lg">
						Conversations
					</p>
					<Plus
						className="h-5 w-5 cursor-pointer"
						onClick={onCreate}
					/>
				</div>

				{conversations.length === 0 ? (
					<EmptyConversations />
				) : (
					conversations.map((conv) => (
						<ConversationItem
							key={conv.id}
							conv={conv}
							isSelected={selectedConversation?.id === conv.id}
							onSelect={onSelect}
							onTrashClick={handleTrashClick}
						/>
					))
				)}
			</div>
		</>
	)
}
