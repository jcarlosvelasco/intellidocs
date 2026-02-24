import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({
	component: App,
	notFoundComponent: () => {
		return <p>This setting page doesn't exist!</p>
	},
})

function App() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	const scrollToSection = (id) => {
		const element = document.getElementById(id)
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
			<style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fadeInUp 0.6s ease-out;
                }
            `}</style>

			{/* Header */}
			<header className="border-b border-white/10 backdrop-blur-lg bg-slate-900/50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<nav className="flex justify-between items-center py-5">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-linear-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-xl">
								📄
							</div>
							<span className="text-2xl font-bold">
								IntelliDocs
							</span>
						</div>

						{/* Desktop Navigation */}
						<ul className="hidden md:flex gap-8 items-center">
							<li>
								<button
									onClick={() => scrollToSection('features')}
									className="text-white/80 hover:text-white transition-colors"
								>
									Features
								</button>
							</li>
							{/* <li>
								<button
									onClick={() =>
										scrollToSection('how-it-works')
									}
									className="text-white/80 hover:text-white transition-colors"
								>
									How It Works
								</button>
							</li>*/}
							{/* <li>
								<button
									onClick={() => scrollToSection('pricing')}
									className="text-white/80 hover:text-white transition-colors"
								>
									Pricing
								</button>
							</li>*/}
							<li>
								<Link
									to="/login"
									className="px-6 py-2.5 bg-linear-to-r from-purple-500 to-indigo-600 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:-translate-y-0.5"
								>
									Get Started
								</Link>
							</li>
						</ul>

						{/* Mobile Menu Button */}
						<button
							className="md:hidden text-white"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</button>
					</nav>

					{/* Mobile Menu */}
					{mobileMenuOpen && (
						<div className="md:hidden pb-4">
							<button
								onClick={() => scrollToSection('features')}
								className="block w-full text-left py-2 text-white/80 hover:text-white"
							>
								Features
							</button>
							<button
								onClick={() => scrollToSection('how-it-works')}
								className="block w-full text-left py-2 text-white/80 hover:text-white"
							>
								How It Works
							</button>
							<button
								onClick={() => scrollToSection('pricing')}
								className="block w-full text-left py-2 text-white/80 hover:text-white"
							>
								Pricing
							</button>
						</div>
					)}
				</div>
			</header>

			{/* Hero Section */}
			<section className="py-20 px-4 sm:px-6 lg:px-8 animate-fade-in">
				<div className="max-w-7xl mx-auto text-center">
					<div className="inline-block bg-purple-500/20 px-4 py-2 rounded-full text-sm border border-purple-500/30 mb-8">
						🚀 Powered by Advanced RAG Technology
					</div>

					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
						Transform Your Documents
						<br />
						into{' '}
						<span className="bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
							Intelligent Conversations
						</span>
					</h1>

					<p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10">
						Upload your PDFs and get instant, accurate answers.
						IntelliDocs uses cutting-edge AI to understand your
						documents and provide intelligent responses to all your
						questions.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
						<Link
							to="/signup"
							className="px-8 py-4 bg-linear-to-r from-purple-500 to-indigo-600 rounded-lg font-medium text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:-translate-y-1"
						>
							Start Free Trial
						</Link>
						{/* <button
							onClick={() => alert('Watch demo video')}
							className="px-8 py-4 bg-white/10 border border-white/20 rounded-lg font-medium text-lg hover:bg-white/15 transition-all"
						>
							See It In Action
						</button> */}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 sm:p-12 border border-white/10">
						<div className="text-center mb-12">
							<h2 className="text-3xl sm:text-4xl font-bold mb-4">
								Powerful Features
							</h2>
							<p className="text-white/80 text-lg">
								Everything you need to unlock insights from your
								documents
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<FeatureCard
								icon="🤖"
								title="Smart AI Assistant"
								description="Advanced RAG (Retrieval-Augmented Generation) technology processes your documents and provides accurate, context-aware answers to your questions."
							/>
							<FeatureCard
								icon="📊"
								title="Multi-Document Analysis"
								description="Upload multiple PDFs at once and ask questions across all your documents. Get comprehensive insights from your entire document library."
							/>
							<FeatureCard
								icon="⚡"
								title="Instant Responses"
								description="Get answers in seconds, not hours. Our optimized AI engine processes documents quickly and delivers precise information when you need it."
							/>
							<FeatureCard
								icon="🔒"
								title="Secure & Private"
								description="Your documents are encrypted and stored securely. We prioritize your privacy and never share your data with third parties."
							/>
							<FeatureCard
								icon="💡"
								title="Context-Aware"
								description="Our AI understands context and nuance, providing relevant answers based on the complete content of your documents."
							/>
							<FeatureCard
								icon="📝"
								title="Citation Support"
								description="Every answer includes references to specific sections of your documents, so you can verify information and explore deeper."
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Auth Section */}
			<section id="auth" className="py-20 px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-3xl sm:text-4xl font-bold mb-6">
						Ready to Get Started?
					</h2>
					<p className="text-lg text-white/80 mb-10">
						Join thousands of professionals who trust IntelliDocs to
						unlock insights from their documents
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link
							to="/signup"
							className="px-8 py-4 bg-linear-to-r from-purple-500 to-indigo-600 rounded-lg font-medium text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:-translate-y-1"
						>
							Sign Up Free
						</Link>
						<Link
							to="/login"
							className="px-8 py-4 bg-white/10 border border-white/20 rounded-lg font-medium text-lg hover:bg-white/15 transition-all"
						>
							Login
						</Link>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-white/10 py-8 px-4">
				<div className="max-w-7xl mx-auto text-center text-white/60">
					<p>© 2026 IntelliDocs. All rights reserved.</p>
				</div>
			</footer>
		</div>
	)
}

function FeatureCard({ icon, title, description }) {
	return (
		<div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/8 hover:border-purple-500/50 transition-all hover:-translate-y-1">
			<div className="w-12 h-12 bg-linear-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4">
				{icon}
			</div>
			<h3 className="text-xl font-semibold mb-3">{title}</h3>
			<p className="text-white/80 leading-relaxed">{description}</p>
		</div>
	)
}
