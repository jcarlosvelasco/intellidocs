import { createServerFn } from '@tanstack/react-start'
import { Resend } from 'resend'
import { SendResetPasswordEmailSchema } from '../schema/SendResetPasswordEmailSchema'
import { ResetPasswordEmailTemplate } from '@/components/ResetPasswordEmailTemplate'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendResetPasswordEmail = createServerFn()
	.inputValidator(SendResetPasswordEmailSchema)
	.handler(async ({ data }) => {
		const { error } = await resend.emails.send({
			from: 'IntelliDocs <intellidocs@mail.jcarlosvelasco.com>',
			to: [`${data.email}`],
			subject: 'IntelliDocs Password Reset',
			react: ResetPasswordEmailTemplate({
				firstName: data.userName,
				url: data.url,
			}),
		})

		if (error) {
			return { success: false, message: error.message }
		}

		return { success: true, message: 'Email sent successfully' }
	})
