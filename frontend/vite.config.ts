import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { devtools } from '@tanstack/devtools-vite'

const config = defineConfig({
	server: {
		host: '0.0.0.0',
		port: 3000,
		strictPort: true,
	},
	plugins: [
		devtools(),
		nitro(),
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ['./tsconfig.json'],
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact({
			babel: {
				plugins: ['babel-plugin-react-compiler'],
			},
		}),
	],
})

export default config
