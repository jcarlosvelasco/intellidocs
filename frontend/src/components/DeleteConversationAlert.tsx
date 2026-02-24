import {
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from './ui/alert-dialog'

interface Props {
	onDelete: () => Promise<void>
	onCancel: () => void
}

export function DeleteConversationAlert({ onDelete, onCancel }: Props) {
	return (
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
				<AlertDialogDescription>
					This action cannot be undone. This will permanently delete
					your account and remove your data from our servers.
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel variant="outline" onClick={onCancel}>
					Cancel
				</AlertDialogCancel>
				<AlertDialogAction variant="destructive" onClick={onDelete}>
					Continue
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	)
}
