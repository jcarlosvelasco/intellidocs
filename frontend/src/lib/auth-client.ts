import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	baseURL:
		process.env.ENVIRONMENT === 'DEV'
			? process.env.BASE_URL_DEV
			: process.env.BASE_URL_PROD,
})
