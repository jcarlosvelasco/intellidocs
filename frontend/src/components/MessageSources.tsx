import { ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { useState } from 'react'
import type { Source } from '@/types/Source'

interface SourcesProps {
	sources: Array<Source>
}

export function MessageSources({ sources }: SourcesProps) {
	const [isExpanded, setIsExpanded] = useState(false)

	if (sources.length === 0) return null

	return (
		<div className="mt-3 border-t border-slate-600 pt-2">
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className="flex items-center gap-2 text-xs text-white "
			>
				<FileText className="w-3 h-3" />
				<span>
					{sources.length}{' '}
					{sources.length === 1 ? 'source' : 'sources'}
				</span>
				{isExpanded ? (
					<ChevronUp className="w-3 h-3" />
				) : (
					<ChevronDown className="w-3 h-3" />
				)}
			</button>

			<div
				className={`mt-2 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
			>
				{sources.map((source, index) => (
					<div
						key={index}
						className="bg-slate-800/50 rounded p-2 text-xs"
					>
						<div className="flex items-start gap-2">
							<div className="flex-1 space-y-1">
								<div className="flex items-center gap-2 text-slate-300">
									<span className="font-medium">
										📄 {source.source}
									</span>
									{source.page && (
										<span className="text-slate-500">
											Page {source.page}
										</span>
									)}
								</div>
								{source.snippet && (
									<p className="text-slate-400 italic text-[10px] line-clamp-2">
										"{source.snippet}"
									</p>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
