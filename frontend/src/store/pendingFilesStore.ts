import { create } from 'zustand'

interface PendingFilesStore {
	pendingFiles: Array<File>
	addFiles: (files: Array<File>) => void
	removeAllPendingFiles: () => void
	removePendingFile: (file: File) => void
	setPendingFiles: (files: Array<File>) => void
}

const usePendingFilesStore = create<PendingFilesStore>((set) => ({
	pendingFiles: [],
	addFiles: (files: Array<File>) =>
		set((state) => ({
			...state,
			pendingFiles: [...state.pendingFiles, ...files],
		})),
	removeAllPendingFiles: () =>
		set((state) => ({
			...state,
			pendingFiles: [],
		})),

	removePendingFile: (file: File) =>
		set((state) => ({
			...state,
			pendingFiles: state.pendingFiles.filter((f) => f !== file),
		})),
	setPendingFiles: (files: Array<File>) =>
		set((state) => ({
			...state,
			pendingFiles: files,
		})),
}))

export default usePendingFilesStore
