'use client';

import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { GET_EVENTS, SEARCH_EVENTS, GET_TAGS } from '@/lib/graphql/queries';
import { Event, Tag } from '@/types';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function EventsPage() {
	const { isAuthenticated, isEventManager } = useAuth();
	const router = useRouter();
	const [searchKeyword, setSearchKeyword] = useState('');
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		if (!isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, router]);

	const { loading: eventsLoading, error: eventsError, data: eventsData } = useQuery(GET_EVENTS, {
		skip: !isAuthenticated,
		pollInterval: 10000 // Poll every 10 seconds for real-time updates
	});
	const { loading: tagsLoading, data: tagsData } = useQuery(GET_TAGS, {
		skip: !isAuthenticated
	});
	const { loading: searchLoading, data: searchData } = useQuery(SEARCH_EVENTS, {
		variables: {
			input: {
				keyword: searchKeyword || undefined,
				tagIds: selectedTags.length > 0 ? selectedTags : undefined,
			},
		},
		skip: !searchKeyword && selectedTags.length === 0 || !isAuthenticated,
	});

	const events: Event[] = searchKeyword || selectedTags.length > 0
		? (searchData?.searchEvents || [])
		: (eventsData?.events || []);
	const tags: Tag[] = tagsData?.tags || [];

	const handleTagToggle = (tagId: string) => {
		setSelectedTags(prev =>
			prev.includes(tagId)
				? prev.filter(id => id !== tagId)
				: [...prev, tagId]
		);
	};

	const clearFilters = () => {
		setSearchKeyword('');
		setSelectedTags([]);
	};

	const hasActiveFilters = searchKeyword || selectedTags.length > 0;
	const isLoading = eventsLoading || searchLoading;

	if (!isAuthenticated) {
		return null;
	}

	if (eventsError) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Events</h1>
						<p className="text-gray-600">{eventsError.message}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Events</h1>
					<div className="flex gap-4">
						<Link
							href="/my-events"
							className="btn-secondary inline-flex items-center gap-2"
						>
							My Events
						</Link>
						{isEventManager && (
							<Link
								href="/events/new"
								className="btn-primary inline-flex items-center gap-2"
							>
								<PlusIcon className="h-5 w-5" />
								Create Event
							</Link>
						)}
					</div>
				</div>

				{/* Search and Filter Section */}
				<div className="mb-8">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1 relative">
							<MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
							<input
								type="text"
								placeholder="Search events by title or description..."
								value={searchKeyword}
								onChange={(e) => setSearchKeyword(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
						<button
							onClick={() => setShowFilters(!showFilters)}
							className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
						>
							<FunnelIcon className="h-4 w-4" />
							Filters
						</button>
						{hasActiveFilters && (
							<button
								onClick={clearFilters}
								className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
							>
								Clear
							</button>
						)}
					</div>

					{/* Tag Filters */}
					{showFilters && (
						<div className="mt-4 p-4 bg-white rounded-md border">
							<h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Tags</h3>
							{tagsLoading ? (
								<div className="animate-pulse flex gap-2">
									{[...Array(5)].map((_, i) => (
										<div key={i} className="h-8 bg-gray-200 rounded-full w-20"></div>
									))}
								</div>
							) : (
								<div className="flex flex-wrap gap-2">
									{tags.map((tag) => (
										<button
											key={tag.id}
											onClick={() => handleTagToggle(tag.id)}
											className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedTags.includes(tag.id)
												? 'bg-blue-100 text-blue-800 border border-blue-200'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
												}`}
											style={{
												borderColor: selectedTags.includes(tag.id) ? tag.color : undefined,
											}}
										>
											{tag.name}
										</button>
									))}
								</div>
							)}
						</div>
					)}
				</div>

				{/* Results Summary */}
				{hasActiveFilters && (
					<div className="mb-6 text-sm text-gray-600">
						Found {events.length} event{events.length !== 1 ? 's' : ''}
						{searchKeyword && ` matching "${searchKeyword}"`}
						{selectedTags.length > 0 && ` with selected tags`}
					</div>
				)}

				{/* Loading State */}
				{isLoading ? (
					<div className="animate-pulse">
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{[...Array(6)].map((_, i) => (
								<div key={i} className="card">
									<div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
									<div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
									<div className="h-3 bg-gray-200 rounded w-1/4"></div>
								</div>
							))}
						</div>
					</div>
				) : events.length === 0 ? (
					<div className="text-center py-12">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">
							{hasActiveFilters ? 'No events found' : 'No events found'}
						</h2>
						<p className="text-gray-600 mb-6">
							{hasActiveFilters
								? 'Try adjusting your search criteria or filters.'
								: 'Get started by creating your first event.'
							}
						</p>
						{!hasActiveFilters && isEventManager && (
							<Link href="/events/new" className="btn-primary">
								Create Your First Event
							</Link>
						)}
					</div>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{events.map((event) => (
							<Link
								key={event.id}
								href={`/events/${event.id}`}
								className="card hover:shadow-lg transition-shadow duration-200"
							>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									{event.title}
								</h3>
								<p className="text-gray-600 mb-4">
									{new Date(event.date).toLocaleDateString('en-US', {
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									})}
								</p>
								{event.description && (
									<p className="text-gray-500 text-sm mb-4 line-clamp-2">
										{event.description}
									</p>
								)}

								{/* Tags */}
								{event.tags && event.tags.length > 0 && (
									<div className="flex flex-wrap gap-1 mb-4">
										{event.tags.map((tag) => (
											<span
												key={tag.id}
												className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
												style={{
													backgroundColor: `${tag.color}20`,
													color: tag.color,
													border: `1px solid ${tag.color}40`,
												}}
											>
												{tag.name}
											</span>
										))}
									</div>
								)}

								<div className="flex justify-between items-center text-sm text-gray-500">
									<span>{event.attendeeCount} attendees</span>
									<span>
										{new Date(event.date).toLocaleTimeString('en-US', {
											hour: '2-digit',
											minute: '2-digit',
										})}
									</span>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
} 