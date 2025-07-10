'use client';

import { useQuery, useMutation } from '@apollo/client';
import Link from 'next/link';
import { GET_MY_EVENTS, GET_EVENTS } from '@/lib/graphql/queries';
import { APPROVE_ATTENDEE, REJECT_ATTENDEE } from '@/lib/graphql/mutations';
import { Event } from '@/types';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PlusIcon, CalendarIcon, UserGroupIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import RequestRolePromotion from '@/components/RequestRolePromotion';

export default function MyEventsPage() {
	const { isAuthenticated, isEventManager, user } = useAuth();
	const router = useRouter();
	const [processingAttendees, setProcessingAttendees] = useState<Set<string>>(new Set());
	const [showRoleRequest, setShowRoleRequest] = useState(false);
	const { loading, error, data } = useQuery(GET_MY_EVENTS, {
		pollInterval: 8000 // Poll every 8 seconds for real-time updates
	});

	const [approveAttendee] = useMutation(APPROVE_ATTENDEE, {
		refetchQueries: [
			{ query: GET_MY_EVENTS },
			{ query: GET_EVENTS }
		],
	});

	const [rejectAttendee] = useMutation(REJECT_ATTENDEE, {
		refetchQueries: [
			{ query: GET_MY_EVENTS },
			{ query: GET_EVENTS }
		],
	});

	useEffect(() => {
		if (!isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, router]);

	if (!isAuthenticated) {
		return null;
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
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
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Events</h1>
						<p className="text-gray-600">{error.message}</p>
					</div>
				</div>
			</div>
		);
	}

	const events: Event[] = data?.myEvents || [];

	const handleApproveAttendee = async (attendeeId: string) => {
		try {
			setProcessingAttendees(prev => new Set(prev).add(attendeeId));
			await approveAttendee({
				variables: { attendeeId },
			});
		} catch (error) {
			console.error('Error approving attendee:', error);
		} finally {
			setProcessingAttendees(prev => {
				const newSet = new Set(prev);
				newSet.delete(attendeeId);
				return newSet;
			});
		}
	};

	const handleRejectAttendee = async (attendeeId: string) => {
		try {
			setProcessingAttendees(prev => new Set(prev).add(attendeeId));
			await rejectAttendee({
				variables: { attendeeId },
			});
		} catch (error) {
			console.error('Error rejecting attendee:', error);
		} finally {
			setProcessingAttendees(prev => {
				const newSet = new Set(prev);
				newSet.delete(attendeeId);
				return newSet;
			});
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">My Events</h1>
						<p className="text-gray-600 mt-2">Manage your created events</p>
					</div>
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

				{events.length === 0 ? (
					<div className="text-center py-12">
						<CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
						<h2 className="text-xl font-semibold text-gray-900 mb-4">No events found</h2>
						<p className="text-gray-600 mb-6">
							{isEventManager
								? "You haven't created any events yet."
								: "You need to be an Event Manager to create events."
							}
						</p>
						{isEventManager ? (
							<Link href="/events/new" className="btn-primary">
								Create Your First Event
							</Link>
						) : (
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
								<h3 className="text-sm font-medium text-blue-900 mb-2">Request Event Manager Role</h3>
								<p className="text-sm text-blue-700 mb-3">
									To create events, you need to be promoted to Event Manager. Submit a request below.
								</p>
								<p className="text-xs text-blue-600 mb-3">
									Current role: <span className="font-medium">{user?.role}</span>
								</p>
								<button
									onClick={() => setShowRoleRequest(true)}
									className="btn-primary text-sm"
								>
									Request Promotion
								</button>
							</div>
						)}
					</div>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{events.map((event) => (
							<div key={event.id} className="card">
								<div className="flex justify-between items-start mb-4">
									<h3 className="text-xl font-semibold text-gray-900">
										{event.title}
									</h3>
									<Link
										href={`/events/${event.id}`}
										className="text-blue-600 hover:text-blue-800 text-sm font-medium"
									>
										View Details
									</Link>
								</div>

								<div className="flex items-center text-gray-600 mb-4">
									<CalendarIcon className="h-4 w-4 mr-2" />
									<span>
										{new Date(event.date).toLocaleDateString('en-US', {
											weekday: 'long',
											year: 'numeric',
											month: 'long',
											day: 'numeric',
										})}
									</span>
								</div>

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

								<div className="flex items-center justify-between text-sm text-gray-500">
									<div className="flex items-center">
										<UserGroupIcon className="h-4 w-4 mr-1" />
										<span>{event.attendeeCount} attendees</span>
									</div>
									<span>
										{new Date(event.date).toLocaleTimeString('en-US', {
											hour: '2-digit',
											minute: '2-digit',
										})}
									</span>
								</div>

								{/* Attendee Requests */}
								{event.attendees && event.attendees.length > 0 && (
									<div className="mt-4">
										<h4 className="text-sm font-medium text-gray-700 mb-2">Attendee Requests</h4>
										<div className="space-y-2">
											{event.attendees.map((attendee) => (
												<div key={attendee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
													<div className="flex-1">
														<p className="text-sm font-medium text-gray-900">{attendee.name}</p>
														{attendee.email && (
															<p className="text-xs text-gray-500">{attendee.email}</p>
														)}
														<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${attendee.rsvpStatus === 'APPROVED'
															? 'bg-green-100 text-green-800'
															: attendee.rsvpStatus === 'REJECTED'
																? 'bg-red-100 text-red-800'
																: 'bg-yellow-100 text-yellow-800'
															}`}>
															{attendee.rsvpStatus}
														</span>
													</div>
													{attendee.rsvpStatus === 'PENDING' && (
														<div className="flex gap-1">
															<button
																onClick={() => handleApproveAttendee(attendee.id)}
																disabled={processingAttendees.has(attendee.id)}
																className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
																title="Approve"
															>
																<CheckIcon className="h-4 w-4" />
															</button>
															<button
																onClick={() => handleRejectAttendee(attendee.id)}
																disabled={processingAttendees.has(attendee.id)}
																className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
																title="Reject"
															>
																<XMarkIcon className="h-4 w-4" />
															</button>
														</div>
													)}
												</div>
											))}
										</div>
									</div>
								)}

								<div className="mt-4 flex gap-2">
									<Link
										href={`/events/${event.id}`}
										className="flex-1 btn-secondary text-center text-sm"
									>
										View Details
									</Link>
									<Link
										href={`/events/${event.id}/edit`}
										className="flex-1 btn-primary text-center text-sm"
									>
										Edit Event
									</Link>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Role Request Modal */}
				{showRoleRequest && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
							<RequestRolePromotion
								onSuccess={() => setShowRoleRequest(false)}
								onCancel={() => setShowRoleRequest(false)}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
} 