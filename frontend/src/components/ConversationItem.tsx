import { Trash } from 'lucide-react'
import { AlertDialogTrigger } from './ui/alert-dialog'
import type { Conversation } from '@/types/Conversation'

interface Props {
	conv: Conversation
	isSelected: boolean
	onSelect: (conv: Conversation) => void
	onTrashClick: (conv: Conversation) => void
}

export function ConversationItem({
	conv,
	isSelected,
	onSelect,
	onTrashClick,
}: Props) {
	function trashClicked(event: React.MouseEvent<SVGSVGElement>) {
		event.stopPropagation()
		onTrashClick(conv)
	}

	return (
		<div
			className={`flex flex-row items-center justify-between p-2 gap-4 rounded ${isSelected ? 'bg-slate-700' : 'bg-slate-800 hover:bg-slate-700'}`}
			onClick={() => onSelect(conv)}
		>
			<p className="text-white line-clamp-1">{conv.title}</p>
			<AlertDialogTrigger asChild>
				<Trash
					className="h-5 w-5 cursor-pointer"
					onClick={trashClicked}
				/>
			</AlertDialogTrigger>
		</div>
	)
}
