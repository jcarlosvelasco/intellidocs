import { createServerFn } from '@tanstack/react-start'
import { Resend } from 'resend'
import { SendVerificationEmailSchema } from '../schema/SendVerificationEmailSchema'
import { VerificationEmailTemplate } from '@/components/EmailTemplate'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendVerificationEmail = createServerFn()
	.inputValidator(SendVerificationEmailSchema)
	.handler(async ({ data }) => {
		const { error } = await resend.emails.send({
			from: 'IntelliDocs <intellidocs@mail.jcarlosvelasco.com>',
			to: [data.email],
			subject: 'IntelliDocs Email Verification',
			react: VerificationEmailTemplate({
				firstName: data.userName,
				url: data.url,
			}),
		})

		if (error) {
			return { success: false, message: error.message }
		}

		return { success: true, message: 'Email sent successfully' }
	})
