import {
	Body,
	Button,
	Container,
	Head,
	Hr,
	Html,
	Section,
	Text,
} from '@react-email/components'

interface EmailTemplateProps {
	firstName: string
	url: string
}

export function ResetPasswordEmailTemplate({
	firstName,
	url,
}: EmailTemplateProps) {
	return (
		<Html>
			<Head />
			<Body
				style={{
					backgroundColor: '#fff7ed',
					padding: '32px',
					fontFamily: 'Arial, sans-serif',
				}}
			>
				<Container
					style={{
						backgroundColor: '#ffffff',
						borderRadius: '12px',
						padding: '32px',
						maxWidth: '600px',
					}}
				>
					{/* Header */}
					<Section
						style={{ textAlign: 'center', marginBottom: '24px' }}
					>
						<Text
							style={{
								fontSize: '26px',
								fontWeight: 'bold',
								color: '#111827',
								marginBottom: '8px',
							}}
						>
							Reset your password
						</Text>
						<Text style={{ fontSize: '16px', color: '#6b7280' }}>
							We received a request to reset your IntelliDocs
							password
						</Text>
					</Section>

					{/* Greeting */}
					<Section>
						<Text style={{ fontSize: '16px', color: '#374151' }}>
							Hi <strong>{firstName}</strong>,
						</Text>
						<Text style={{ fontSize: '16px', color: '#4b5563' }}>
							Someone requested a password reset for your
							IntelliDocs account. If this was you, click the
							button below to create a new password.
						</Text>
					</Section>

					{/* CTA */}
					<Section style={{ textAlign: 'center', margin: '32px 0' }}>
						<Button
							href={url}
							style={{
								backgroundColor: '#ea580c',
								color: '#ffffff',
								padding: '14px 28px',
								borderRadius: '8px',
								textDecoration: 'none',
								fontSize: '16px',
								fontWeight: 'bold',
							}}
						>
							Reset Password
						</Button>
					</Section>

					{/* Fallback link */}
					<Section>
						<Text style={{ fontSize: '13px', color: '#6b7280' }}>
							Or copy and paste this link into your browser:
						</Text>
						<Text
							style={{
								fontSize: '13px',
								color: '#ea580c',
								wordBreak: 'break-all',
							}}
						>
							{url}
						</Text>
					</Section>

					{/* Security notice */}
					<Section
						style={{
							backgroundColor: '#fef2f2',
							border: '1px solid #fecaca',
							borderRadius: '8px',
							padding: '16px',
							marginTop: '24px',
						}}
					>
						<Text
							style={{
								fontSize: '14px',
								fontWeight: 'bold',
								color: '#991b1b',
								marginBottom: '4px',
							}}
						>
							⚠️ Security Notice
						</Text>
						<Text style={{ fontSize: '14px', color: '#b91c1c' }}>
							If you didn’t request a password reset, you can
							safely ignore this email or contact support if you
							have concerns about your account.
						</Text>
					</Section>

					{/* Footer */}
					<Section style={{ marginTop: '32px' }}>
						<Hr />
						<Text
							style={{
								fontSize: '12px',
								color: '#9ca3af',
								textAlign: 'center',
								marginTop: '12px',
							}}
						>
							This password reset link will expire in 1 hour for
							security reasons.
						</Text>
						<Text
							style={{
								fontSize: '12px',
								color: '#9ca3af',
								textAlign: 'center',
							}}
						>
							© 2026 IntelliDocs. All rights reserved.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	)
}
