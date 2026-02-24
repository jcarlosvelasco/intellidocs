import { Bot } from 'lucide-react'

export function NoMessages() {
	return (
		<div className="flex items-center justify-center h-full">
			<div className="text-center space-y-2">
				<Bot className="w-12 h-12 text-slate-600 mx-auto" />
				<p className="text-slate-400">No messages</p>
				<p className="text-slate-500 text-sm">
					Start asking about your uploaded documents!
				</p>
			</div>
		</div>
	)
}
