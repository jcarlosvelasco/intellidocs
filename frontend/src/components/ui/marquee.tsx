import { Marquee } from './marquee-anims'

type BrandList = {
	image: string
	lightimg: string
	name: string
}

export default function MarqueeBrandsDemo() {
	const brandList: BrandList[] = [
		{
			image: 'https://tanstack.com/images/logos/logo-word-black.svg',
			lightimg: 'https://tanstack.com/images/logos/logo-word-white.svg',
			name: 'TanStack Start',
		},
		{
			image: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Vitejs-logo.svg',
			lightimg:
				'https://upload.wikimedia.org/wikipedia/commons/f/f1/Vitejs-logo.svg',
			name: 'Vite',
		},
		{
			image: 'https://upload.wikimedia.org/wikipedia/commons/6/60/LangChain_Logo.svg',
			lightimg:
				'https://upload.wikimedia.org/wikipedia/commons/6/60/LangChain_Logo.svg',
			name: 'LangChain',
		},
		{
			image: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/FastAPI_logo.svg',
			lightimg:
				'https://upload.wikimedia.org/wikipedia/commons/1/1a/FastAPI_logo.svg',
			name: 'FastAPI',
		},
		{
			image: 'https://cdn.resend.com/brand/resend-wordmark-black.svg',
			lightimg: 'https://cdn.resend.com/brand/resend-wordmark-black.svg',
			name: 'Resend',
		},
		{
			image: '	https://neon.com/brand/neon-logo-light-color.svg?updated=2026-01-21',
			lightimg:
				'	https://neon.com/brand/neon-logo-light-color.svg?updated=2026-01-21',
			name: 'Neon',
		},
		{
			image: 'https://tailwindcss.com/_next/static/media/tailwindcss-logotype.fdb2542f.svg',
			lightimg:
				'	https://tailwindcss.com/_next/static/media/tailwindcss-logotype.fdb2542f.svg',
			name: 'Tailwind CSS',
		},
		{
			image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Docker_Logo.svg',
			lightimg:
				'	https://upload.wikimedia.org/wikipedia/commons/8/89/Docker_Logo.svg',
			name: 'Docker',
		},
	]

	return (
		<>
			<Marquee className="[--duration:20s] p-0" pauseOnHover>
				{brandList.map((brand, index) => (
					<div key={index}>
						<img
							src={brand.image}
							alt={brand.name}
							className="w-36 h-8 mr-6 lg:mr-20 dark:hidden"
						/>
						<img
							src={brand.lightimg}
							alt={brand.name}
							className="hidden dark:block w-36 h-8 mr-12 lg:mr-20"
						/>
					</div>
				))}
			</Marquee>
		</>
	)
}
