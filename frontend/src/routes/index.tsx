import { Button } from '@/components/ui/button'
import MarqueeBrandsDemo from '@/components/ui/marquee'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRightIcon } from 'lucide-react'
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
		<div className="min-h-screen bg-linear-to-br bg-white text-black">
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
			<header className="">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<nav className="flex justify-between items-center py-5">
						<div className="flex items-center gap-2">
							<span className="text-2xl font-bold font-crimson">
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
								<Link to="/login" className="">
									<Button>Log in</Button>
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
					<div className="inline-block px-4 py-2 rounded-full text-sm border mb-8">
						🚀 Powered by Advanced RAG Technology
					</div>

					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight font-crimson">
						Transform Your Documents
						<br />
						into{' '}
						<span className="bg-clip-text ">
							Intelligent Conversations
						</span>
					</h1>

					<p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
						Upload your PDFs and get instant, accurate answers.
						IntelliDocs uses cutting-edge AI to understand your
						documents and provide intelligent responses to all your
						questions.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
						<Link to="/signup" className="">
							<Button className="group">
								Get Started
								<ArrowRightIcon className="transition-transform duration-200 group-hover:translate-x-0.5" />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			<div className="w-full text-center flex flex-col gap-8 text-lg text-muted-foreground">
				Powered by amazing technologies
				<MarqueeBrandsDemo />
			</div>

			{/* Features Section */}
			<section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 sm:p-12 border border-white/10">
						<div className="text-center mb-8">
							<h2 className="text-3xl sm:text-4xl font-bold  font-crimson">
								Powerful Features
							</h2>
							<p className="text-white/80 text-lg">
								Everything you need to unlock insights from your
								documents
							</p>
						</div>
					</div>

					<div className="flex flex-col md:flex-row gap-8 ">
						<div className="font-crimson flex flex-col gap-4">
							<h3 className="font-semibold text-xl">
								Smart AI Responses
							</h3>
							<p>
								Advanced RAG (Retrieval-Augmented Generation)
								technology processes your documents and provides
								accurate, context-aware answers to your
								questions.
							</p>
						</div>
						<div className="font-crimson flex flex-col gap-4">
							<h3 className="font-semibold text-xl">
								Multi-Document Analysis
							</h3>
							<p>
								Upload multiple PDFs at once and ask questions
								across all your documents. Get comprehensive
								insights from your entire document library.
							</p>
						</div>
						<div className="font-crimson flex flex-col gap-4">
							<h3 className="font-semibold text-xl">
								Citation Support
							</h3>
							<p>
								Every answer includes references to specific
								sections of your documents, so you can verify
								information and explore deeper.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-white/10 py-8 px-4 font-crimson">
				<div className="max-w-7xl mx-auto text-center font-semibold">
					<p>© 2026 IntelliDocs. All rights reserved.</p>
				</div>
			</footer>
		</div>
	)
}
