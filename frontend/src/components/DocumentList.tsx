export function DocumentList({
	files,
	onDelete,
}: {
	files: Array<File>
	onDelete: (file: File) => void
}) {
	if (!files.length)
		return <p className="text-white">No documents uploaded yet.</p>
	return files.map((file) => (
		<div key={file.name} className="flex justify-between mb-2 gap-4">
			<p className="font-semibold line-clamp-1 text-white">{file.name}</p>
			<button
				onClick={() => onDelete(file)}
				className="text-sm text-red-300 hover:text-red-500"
			>
				Delete
			</button>
		</div>
	))
}
