import {
	createFileRoute,
	redirect,
	useLoaderData,
} from '@tanstack/react-router'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import type { Conversation } from '@/types/Conversation'
import { Chat } from '@/components/Chat'
import { getSessionFn } from '@/server/fn/getSession'
import { getUserConversations } from '@/server/fn/getUserConversations'

import { AlertDialog } from '@/components/ui/alert-dialog'
import Header from '@/components/Header'
import { ConversationsList } from '@/components/ConversationsList'
import { useConversations } from '@/hooks/useConversations'

export const Route = createFileRoute('/home/')({
	component: App,
	notFoundComponent: () => {
		return <p>This setting page doesn't exist!</p>
	},
	loader: async () => {
		const [conversationsResult, session] = await Promise.all([
			getUserConversations(),
			getSessionFn(),
		])

		const conversations: Array<Conversation> = []
		if (conversationsResult.success) {
			conversations.push(...conversationsResult.conversations)
		}

		return {
			conversations: conversations,
			userId: session?.user.id || null,
		}
	},
	beforeLoad: async () => {
		const session = await getSessionFn()
		if (!session?.user) {
			throw redirect({
				to: '/login',
			})
		}
	},
})

function App() {
	const loaderData = useLoaderData({ from: Route.id })

	const {
		conversations,
		selectedConversation,
		setSelectedConversation,
		onCreateConversation,
		onDeleteConversation,
	} = useConversations(loaderData.conversations)

	const [input, setInput] = useState('')

	return (
		<AlertDialog>
			<div className="flex flex-col h-screen">
				<Header />

				<div className="flex flex-row px-8 py-6 gap-8 h-full overflow-y-auto">
					<ConversationsList
						conversations={conversations}
						selectedConversation={selectedConversation}
						onCreate={onCreateConversation}
						onSelect={(conv) => setSelectedConversation(conv)}
						onDeleteConversation={onDeleteConversation}
					/>

					<main className="flex-4">
						{loaderData.userId &&
							(selectedConversation ? (
								<Chat
									selectedConversation={selectedConversation}
									userId={loaderData.userId}
									input={input}
									setInput={setInput}
									setSelectedConversation={
										setSelectedConversation
									}
								/>
							) : (
								<div className="h-full flex flex-col items-center justify-center gap-8 text-muted-foreground">
									<MessageCircle className="w-16 h-16" />
									<p className="text-2xl text-center font-crimson font-semibold text-muted-foreground">
										Select a conversation or create a new
										one
									</p>
								</div>
							))}
					</main>
				</div>
			</div>
		</AlertDialog>
	)
}
