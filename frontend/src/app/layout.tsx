import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ApolloProvider } from '@/components/providers/ApolloProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Event Manager',
	description: 'A mini event manager built with Next.js and GraphQL',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<ApolloProvider>
					<AuthProvider>
						<Navigation />
						<main>
							{children}
						</main>
					</AuthProvider>
				</ApolloProvider>
			</body>
		</html>
	)
} 