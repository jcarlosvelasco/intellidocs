import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'

interface MyRouterContext {
	queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: 'utf-8',
			},
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			},
			{
				title: 'IntelliDocs - AI-Powered Documentation Analysis & Search',
			},
			{
				name: 'description',
				content:
					'IntelliDocs: Intelligent documentation analysis and search powered by AI. Upload your docs and get instant answers with RAG technology.',
			},
			{
				name: 'keywords',
				content:
					'documentation, AI search, RAG, document analysis, intelligent search',
			},
			{
				property: 'og:title',
				content: 'IntelliDocs - AI-Powered Documentation Analysis',
			},
			{
				property: 'og:description',
				content:
					'Upload your documentation and get instant intelligent answers powered by AI.',
			},
			{
				property: 'og:type',
				content: 'website',
			},
		],
		links: [
			{
				rel: 'stylesheet',
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="dark">
			<head>
				<HeadContent />
			</head>
			<body className="flex flex-col min-h-screen">
				{children}
				<Toaster position="bottom-right" />

				<TanStackDevtools
					config={{
						position: 'bottom-right',
					}}
					plugins={[
						{
							name: 'Tanstack Router',
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	)
}
