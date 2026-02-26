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
			className={`group flex flex-row items-center justify-between p-2 gap-4 rounded
        ${isSelected ? 'text-white bg-slate-500' : 'text-black bg-slate-300 hover:bg-slate-500 hover:text-white'}`}
			onClick={() => onSelect(conv)}
		>
			<p className="line-clamp-1">{conv.title}</p>

			<AlertDialogTrigger asChild>
				<Trash
					className={`h-5 w-5 cursor-pointer
          ${isSelected ? 'text-white' : 'text-black group-hover:text-white'}`}
					onClick={trashClicked}
				/>
			</AlertDialogTrigger>
		</div>
	)
}
