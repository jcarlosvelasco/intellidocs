import { Bot, Check, Copy, User } from 'lucide-react'
import Markdown from 'react-markdown'
import { useState } from 'react'
import { MessageSources } from './MessageSources'
import type { ConversationMessage } from '@/types/ConversationMessage'

interface Props {
	message: ConversationMessage
}

export default function MessageCard({ message }: Props) {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		await navigator.clipboard.writeText(message.content)
		setCopied(true)
		setTimeout(() => setCopied(false), 1500)
	}

	return (
		<div
			className={`flex gap-3 ${
				message.role === 'user' ? 'justify-end' : 'justify-start'
			}`}
		>
			{message.role === 'assistant' && (
				<div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
					<Bot className="w-5 h-5 text-white" />
				</div>
			)}
			<div
				className={`max-w-[70%] rounded-lg px-4 py-3 ${
					message.role === 'user'
						? 'bg-blue-600 text-white'
						: 'bg-slate-700 text-slate-100'
				}`}
			>
				<div className="text-sm/8">
					<Markdown>{message.content}</Markdown>
				</div>

				{message.role === 'assistant' && (
					<button
						onClick={handleCopy}
						className="w-2 h-2 opacity-60 hover:opacity-100 transition"
						title="Copiar mensaje"
					>
						{copied ? (
							<Check className="w-4 h-4 " />
						) : (
							<Copy className="w-4 h-4" />
						)}
					</button>
				)}

				{message.role === 'assistant' && message.sources && (
					<MessageSources sources={message.sources} />
				)}

				<p className="text-xs mt-1 opacity-60">
					{message.createdAt.toLocaleTimeString('es-ES', {
						hour: '2-digit',
						minute: '2-digit',
					})}
				</p>
			</div>
			{message.role === 'user' && (
				<div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
					<User className="w-5 h-5 text-white" />
				</div>
			)}
		</div>
	)
}
