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

export function VerificationEmailTemplate({
	firstName,
	url,
}: EmailTemplateProps) {
	return (
		<Html>
			<Head />
			<Body style={{ backgroundColor: '#f5f7ff', padding: '32px' }}>
				<Container
					style={{
						backgroundColor: '#ffffff',
						borderRadius: '12px',
						padding: '32px',
					}}
				>
					<Section style={{ textAlign: 'center' }}>
						<Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
							Verify your IntelliDocs account
						</Text>
						<Text style={{ color: '#555' }}>
							Welcome to IntelliDocs! We’re excited to have you.
						</Text>
					</Section>

					<Section>
						<Text>
							Hi <strong>{firstName}</strong>,
						</Text>
						<Text>
							Please verify your email address by clicking the
							button below.
						</Text>
					</Section>

					<Section style={{ textAlign: 'center', margin: '32px 0' }}>
						<Button
							href={url}
							style={{
								backgroundColor: '#2563eb',
								color: '#ffffff',
								padding: '14px 24px',
								borderRadius: '8px',
								textDecoration: 'none',
								fontWeight: 'bold',
							}}
						>
							Verify Email Address
						</Button>
					</Section>

					<Text style={{ fontSize: '12px', color: '#666' }}>
						Or copy and paste this link into your browser:
					</Text>
					<Text style={{ fontSize: '12px', color: '#2563eb' }}>
						{url}
					</Text>

					<Hr />

					<Text
						style={{
							fontSize: '12px',
							color: '#999',
							textAlign: 'center',
						}}
					>
						© 2026 IntelliDocs. All rights reserved.
					</Text>
				</Container>
			</Body>
		</Html>
	)
}
