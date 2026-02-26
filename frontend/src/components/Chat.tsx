import { useEffect, useRef } from 'react'
import { Bot, Send } from 'lucide-react'
import { useServerFn } from '@tanstack/react-start'
import MessageCard from './MessageCard'
import Dropzone from './Dropzone'
import { NoMessages } from './NoMessages'
import { Spinner } from './ui/spinner'
import type { Dispatch, SetStateAction } from 'react'
import type { Conversation } from '@/types/Conversation'
import type { ConversationMessage } from '@/types/ConversationMessage'
import { getSessionFn } from '@/server/fn/getSession'
import { createUserMessageFn } from '@/server/fn/createUserMessage'
import { sendMessageToAgent } from '@/server/fn/sendMessageToAgent'
import usePendingFilesStore from '@/store/pendingFilesStore'
import { useConversationMessages } from '@/hooks/useConversationMessages'
import { updateConversationFn } from '@/server/fn/updateConversation'

interface Props {
	selectedConversation: Conversation
	setSelectedConversation: Dispatch<SetStateAction<Conversation | null>>
	userId: string
	input: string
	setInput: Dispatch<SetStateAction<string>>
}

export function Chat({
	selectedConversation,
	setSelectedConversation,
	userId,
	input,
	setInput,
}: Props) {
	const {
		messages,
		setMessages,
		isLoading,
		setIsLoading,
		areMessagesLoading,
	} = useConversationMessages(selectedConversation)

	const messagesEndRef = useRef<HTMLDivElement>(null)

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	const pendingFiles = usePendingFilesStore((state) => state.pendingFiles)

	const getSession = useServerFn(getSessionFn)
	const createUserMessage = useServerFn(createUserMessageFn)
	const updateConversationTitle = useServerFn(updateConversationFn)

	const convMessages = messages[selectedConversation.id] || []

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!input.trim() || isLoading) return

		const inputValue = input
		setInput('')

		const session = await getSession()
		if (!session?.user) {
			console.error('User not authenticated')
			return
		}

		// Update conversation title
		if (selectedConversation.title === 'New conversation') {
			await updateConversationTitle({
				data: {
					conversationId: selectedConversation.id,
					title: inputValue,
				},
			})
			setSelectedConversation((prev) => {
				if (!prev) return prev

				return {
					...prev,
					title: inputValue,
				}
			})
		}

		// 2. Create message
		try {
			const result = await createUserMessage({
				data: {
					content: inputValue,
					conversationId: selectedConversation.id,
				},
			})

			if (!result.success) {
				console.error('Failed to create user message')
				return
			}

			const newMessage: ConversationMessage = {
				id: result.result.id,
				conversationId: result.result.conversationId,
				role: result.result.role,
				content: result.result.content,
				createdAt: result.result.createdAt,
				sources: [],
			}

			setMessages((prev) => ({
				...prev,
				[newMessage.conversationId]: [
					...prev[newMessage.conversationId],
					newMessage,
				],
			}))
		} catch (error) {
			console.error('Error creating user message:', error)
			return
		}

		// 3. Send message to agent and get response
		setIsLoading(true)
		try {
			const agentResult = await sendMessageToAgent({
				data: {
					query: inputValue,
					conversationId: selectedConversation.id.toString(),
				},
			})

			const assistantMessage: ConversationMessage = {
				id: agentResult.message_id,
				conversationId: agentResult.conversation_id,
				role: 'assistant',
				content: agentResult.message,
				createdAt: new Date(agentResult.created_at),
				sources: agentResult.sources || [],
			}

			setMessages((prev) => ({
				...prev,
				[agentResult.conversation_id]: [
					...prev[agentResult.conversation_id],
					assistantMessage,
				],
			}))
		} catch (error) {
			console.error('Error sending message to agent:', error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="flex flex-col h-full  rounded-lg border  overflow-hidden">
			{/* Header */}
			<div className="px-6 py-4 border-b">
				<h2 className="font-semibold text-xl font-crimson">
					Chat with your Documents
				</h2>
				<p className="text-sm text-muted-foreground">
					Ask any question related to the uploaded files
				</p>
			</div>

			{/* Messages */}
			<div
				className={`flex-1 ${
					convMessages.length === 0
						? 'overflow-hidden'
						: 'overflow-y-auto'
				} px-6 py-4 space-y-4`}
			>
				{areMessagesLoading ? (
					<div className="flex items-center justify-center h-full">
						<div className="text-center space-y-2">
							<Spinner className="w-12 h-12 text-slate-600 mx-auto" />
						</div>
					</div>
				) : convMessages.length === 0 ? (
					<NoMessages />
				) : (
					convMessages.map((message) => (
						<MessageCard key={message.id} message={message} />
					))
				)}
				{isLoading && (
					<div className="flex gap-3 justify-start">
						<div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
							<Bot className="w-5 h-5 text-white" />
						</div>
						<div className=" rounded-lg px-4 py-3">
							<div className="flex gap-1">
								<span
									className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
									style={{ animationDelay: '0ms' }}
								></span>
								<span
									className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
									style={{ animationDelay: '150ms' }}
								></span>
								<span
									className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
									style={{ animationDelay: '300ms' }}
								></span>
							</div>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			<Dropzone
				acceptedTypes={['application/pdf']}
				maxFiles={3}
				userId={userId}
				selectedConversation={selectedConversation}
			/>

			<div className="px-6 py-4 border-t">
				<form onSubmit={handleSubmit} className="flex gap-2">
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Ask a question..."
						disabled={isLoading}
						className="flex-1 rounded-lg px-4 py-3 bg-muted focus:outline-none focus:ring-2  disabled:opacity-50 disabled:cursor-not-allowed"
					/>
					<button
						type="submit"
						disabled={
							!input.trim() ||
							isLoading ||
							pendingFiles.length > 0
						}
						className="rounded-lg px-4 py-2 font-medium bg-black text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						<Send className="w-5 h-5" />
					</button>
				</form>
			</div>
		</div>
	)
}
