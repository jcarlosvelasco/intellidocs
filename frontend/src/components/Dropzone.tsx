import React, { useCallback, useState } from 'react'
import { File, FileText, ImageIcon, Upload, X } from 'lucide-react'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { Spinner } from './ui/spinner'
import type { Conversation } from '@/types/Conversation'
import type { ConversationDocument } from '@/types/ConversationDocument'
import { createConversationDocumentFn } from '@/server/fn/createConversationDocument'
import useConversationDocumentStore from '@/store/conversationDocumentStore'
import usePendingFilesStore from '@/store/pendingFilesStore'
import { deleteConversationDocumentFn } from '@/server/fn/deleteConversationDocument'

interface DropzoneProps {
	maxFiles?: number
	acceptedTypes?: Array<string>
	className?: string
	userId: string
	selectedConversation: Conversation
}

const Dropzone: React.FC<DropzoneProps> = ({
	maxFiles = 5,
	acceptedTypes = ['image/*', 'application/pdf'],
	className = '',
	userId,
	selectedConversation,
}) => {
	const conversationDocumentsStore = useConversationDocumentStore(
		(state) => state.conversationDocuments,
	)
	const addConversationDocument = useConversationDocumentStore(
		(state) => state.addConversationDocument,
	)
	const removeConversationDocument = useConversationDocumentStore(
		(state) => state.removeConversationDocument,
	)

	const pendingFiles = usePendingFilesStore((state) => state.pendingFiles)

	const setPendingFiles = usePendingFilesStore(
		(state) => state.setPendingFiles,
	)

	const removePendingFile = usePendingFilesStore(
		(state) => state.removePendingFile,
	)

	const createConversationDocument = useServerFn(createConversationDocumentFn)
	const deleteConversationDocument = useServerFn(deleteConversationDocumentFn)

	const [isDragging, setIsDragging] = useState<boolean>(false)

	const backendUrl =
		import.meta.env.VITE_ENVIRONMENT === 'DEV'
			? import.meta.env.VITE_BACKEND_URL_DEV
			: import.meta.env.VITE_BACKEND_URL_PROD

	const isSameFile = (a: File, b: File): boolean =>
		a.name === b.name &&
		a.size === b.size &&
		a.lastModified === b.lastModified

	const conversationId = selectedConversation.id.toString()

	const conversationDocuments =
		conversationDocumentsStore[conversationId] || []

	const getFileIcon = (fileType: string): React.ReactNode => {
		if (fileType.startsWith('image/'))
			return <ImageIcon className="w-4 h-4" />
		if (fileType === 'application/pdf')
			return <FileText className="w-4 h-4" />
		return <File className="w-4 h-4" />
	}

	const validateFile = (file: File): boolean => {
		const isValidType = acceptedTypes.some((type: string) => {
			if (type.endsWith('/*')) {
				const baseType = type.split('/')[0]
				return file.type.startsWith(baseType + '/')
			}
			return file.type === type
		})
		return isValidType
	}

	const handleFiles = useCallback(
		(newFiles: FileList | null) => {
			if (!newFiles) return

			const incomingFiles = Array.from(newFiles).filter(validateFile)

			if (incomingFiles.length !== newFiles.length) {
				toast.error('Some files have an invalid type')
				return
			}

			const nonDuplicateFiles = incomingFiles.filter((newFile) => {
				const isInPending = pendingFiles.some((f) =>
					isSameFile(f, newFile),
				)
				const isInExisting = conversationDocuments.some(
					(doc) => doc.documentName === newFile.name,
				)

				return !isInPending && !isInExisting
			})

			if (nonDuplicateFiles.length < incomingFiles.length) {
				toast.error('Some files were already added')
			}

			const totalFilesCount =
				pendingFiles.length +
				conversationDocuments.length +
				nonDuplicateFiles.length

			if (totalFilesCount > maxFiles) {
				toast.error(`You can only upload up to ${maxFiles} files`)
				return
			}

			setPendingFiles([...pendingFiles, ...nonDuplicateFiles])

			onFilesAdded(nonDuplicateFiles)
		},
		[pendingFiles, maxFiles, acceptedTypes],
	)

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
		e.preventDefault()
		setIsDragging(true)
	}

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
		e.preventDefault()
		setIsDragging(false)
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
		e.preventDefault()
		setIsDragging(false)
		handleFiles(e.dataTransfer.files)
	}

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
		handleFiles(e.target.files)
	}

	const removeFile = async (file: ConversationDocument) => {
		const toastId = toast.loading(`Removing file ${file.documentName}...`)

		removeConversationDocument(file)
		await deleteConversationDocument({
			data: {
				conversationDocumentId: file.id,
				conversationId: selectedConversation.id,
			},
		})

		toast.success(`File ${file.documentName} removed`, {
			id: toastId,
		})
	}

	const uploadFile = async (file: File): Promise<void> => {
		try {
			const toastId = toast.loading(`Uploading file ${file.name}...`)

			const timestamp = Date.now()
			const sourceKey = `${timestamp}-${file.name}`

			const createResult = await createConversationDocument({
				data: {
					name: file.name,
					sourceKey: sourceKey,
					conversationId: selectedConversation.id,
				},
			})

			if (!createResult.success) {
				toast.error('Failed to create conversation document', {
					id: toastId,
				})
				return
			}

			const formData = new FormData()
			formData.append('file', file)
			formData.append('user_id', userId)
			formData.append('source_key', sourceKey)
			formData.append(
				'conversation_id',
				selectedConversation.id.toString(),
			)
			formData.append('document_id', createResult.result.id.toString())

			const response = await fetch(`${backendUrl}/process-pdf`, {
				method: 'POST',
				body: formData,
			})

			const conversationDocument: ConversationDocument = {
				id: createResult.result.id,
				conversationId: createResult.result.conversationId,
				sourceKey: createResult.result.sourceKey,
				documentName: createResult.result.documentName,
				createdAt: createResult.result.createdAt,
			}

			addConversationDocument(conversationDocument)
			removePendingFile(file)

			if (!response.ok) {
				toast.error('Failed to upload file', { id: toastId })
				return
			}

			await response.json()

			toast.success('File uploaded successfully', { id: toastId })
		} catch (err) {
			toast.error('Failed to upload file')
		}
	}

	const onFilesAdded = async (newFiles: Array<File>): Promise<void> => {
		for (const file of newFiles) {
			await uploadFile(file)
		}
	}

	return (
		<div className="w-full space-y-3 px-6 pb-4">
			<div className="flex gap-2 overflow-x-auto">
				{pendingFiles.map((file) => (
					<div
						key={`${file.name} + ${file.bytes.length}`}
						className="flex items-center gap-2 bg-muted rounded-md px-3 py-2 min-w-fit group "
					>
						<div className="text-muted-foreground">
							{getFileIcon('application/pdf')}
						</div>
						<span className="text-sm text-muted-foreground max-w-[150px] truncate">
							{file.name}
						</span>
						<div className="text-gray-200 ">
							<Spinner className="w-4 h-4" />
						</div>
					</div>
				))}

				{conversationDocuments.map((file) => (
					<div
						key={file.id}
						className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-2 min-w-fit group hover:bg-gray-200 transition-colors"
					>
						<div className="text-gray-600">
							{getFileIcon('application/pdf')}
						</div>
						<span className="text-sm text-gray-700 max-w-[150px] truncate">
							{file.documentName}
						</span>
						<button
							onClick={() => removeFile(file)}
							className="text-gray-500 hover:text-red-600 transition-colors"
							type="button"
						>
							<X className="w-4 h-4" />
						</button>
					</div>
				))}
			</div>

			<div
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={`
          relative border-2 border-dashed rounded-lg p-4 transition-all
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${className}
        `}
			>
				<input
					type="file"
					multiple
					accept={acceptedTypes.join(',')}
					onChange={handleFileInput}
					className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
				/>

				<div className="flex items-center justify-center gap-2 text-sm ">
					<Upload className="w-5 h-5" />
					<span>Drag files here or click to select</span>
					<span className="text-xs text-muted-foreground">
						(max. {maxFiles} files)
					</span>
				</div>
			</div>
		</div>
	)
}
export default Dropzone
