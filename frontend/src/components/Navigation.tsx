'use client';

import Link from 'next/link';
import { useAuth } from './providers/AuthProvider';
import { UserIcon, CogIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Navigation() {
	const { user, logout, isAuthenticated, isAdmin, isEventManager } = useAuth();

	const handleLogout = () => {
		logout();
	};

	return (
		<nav className="bg-white shadow-sm border-b">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex items-center">
						<Link href="/" className="text-xl font-bold text-gray-900">
							Event Manager
						</Link>

						<div className="ml-10 flex items-baseline space-x-4">
							<Link
								href="/events"
								className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
							>
								Events
							</Link>

							{isAuthenticated && (
								<Link
									href="/my-events"
									className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
								>
									My Events
								</Link>
							)}

							{isEventManager && (
								<Link
									href="/manage-attendees"
									className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
								>
									Manage Attendees
								</Link>
							)}

							{isAdmin && (
								<Link
									href="/admin"
									className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
								>
									Admin Panel
								</Link>
							)}
						</div>
					</div>

					<div className="flex items-center">
						{isAuthenticated ? (
							<div className="flex items-center space-x-4">
								<div className="flex items-center space-x-2">
									<UserIcon className="h-5 w-5 text-gray-400" />
									<span className="text-sm text-gray-700">{user?.name}</span>
									<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
										{user?.role}
									</span>
								</div>

								<button
									onClick={handleLogout}
									className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
								>
									<ArrowRightOnRectangleIcon className="h-4 w-4" />
									<span>Logout</span>
								</button>
							</div>
						) : (
							<div className="flex items-center space-x-4">
								<Link
									href="/login"
									className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
								>
									Login
								</Link>
								<Link
									href="/signup"
									className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
								>
									Sign Up
								</Link>
							</div>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
} 