import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { db } from '..'
import { account, session, user, verification } from '@/db/auth-schema'
import { sendVerificationEmail } from '@/server/fn/sendVerificationEmail'
import { sendResetPasswordEmail } from '@/server/fn/sendResetPasswordEmail'
import { deleteUserInfo } from '@/server/fn/deleteUserInfo'

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			user: user,
			session: session,
			account: account,
			verification: verification,
		},
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			await sendResetPasswordEmail({
				data: { userName: user.name, url: url, email: user.email },
			})
		},
		onPasswordReset: async ({ user }) => {
			await console.log(`Password for user ${user.email} has been reset.`)
		},
	},
	plugins: [tanstackStartCookies()],
	user: {
		deleteUser: {
			enabled: true,
			beforeDelete: async (userToDelete) => {
				await deleteUserInfo({ data: { userId: userToDelete.id } })
			},
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		sendVerificationEmail: async ({ user, url }) => {
			await sendVerificationEmail({
				data: { userName: user.name, url: url, email: user.email },
			})
		},
	},
	baseURL:
		process.env.ENVIRONMENT === 'DEV'
			? process.env.BASE_URL_DEV
			: process.env.BASE_URL_PROD,
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
})
