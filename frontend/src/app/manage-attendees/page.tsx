'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_MY_EVENTS, GET_PENDING_ATTENDEES } from '@/lib/graphql/queries';
import { APPROVE_ATTENDEE, REJECT_ATTENDEE } from '@/lib/graphql/mutations';
import { Event, Attendee } from '@/types';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckIcon, XMarkIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

export default function ManageAttendeesPage() {
	const { isEventManager } = useAuth();
	const router = useRouter();
	const [selectedEvent, setSelectedEvent] = useState<string>('');
	const [approveAttendee] = useMutation(APPROVE_ATTENDEE, {
		refetchQueries: [
			{ query: GET_MY_EVENTS },
			{ query: GET_PENDING_ATTENDEES, variables: { eventId: selectedEvent } }
		],
	});
	const [rejectAttendee] = useMutation(REJECT_ATTENDEE, {
		refetchQueries: [
			{ query: GET_MY_EVENTS },
			{ query: GET_PENDING_ATTENDEES, variables: { eventId: selectedEvent } }
		],
	});
	const [processingAttendees, setProcessingAttendees] = useState<Set<string>>(new Set());

	const { loading: eventsLoading, error: eventsError, data: eventsData } = useQuery(GET_MY_EVENTS);
	const { loading: attendeesLoading, data: attendeesData, refetch: refetchAttendees } = useQuery(GET_PENDING_ATTENDEES, {
		variables: { eventId: selectedEvent },
		skip: !selectedEvent,
	});

	useEffect(() => {
		if (!isEventManager) {
			router.push('/login');
		}
	}, [isEventManager, router]);

	useEffect(() => {
		if (eventsData?.myEvents?.length > 0 && !selectedEvent) {
			setSelectedEvent(eventsData.myEvents[0].id);
		}
	}, [eventsData, selectedEvent]);

	const handleApprove = async (attendeeId: string) => {
		try {
			setProcessingAttendees(prev => new Set(prev).add(attendeeId));
			await approveAttendee({
				variables: { attendeeId },
			});
			refetchAttendees();
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

	const handleReject = async (attendeeId: string) => {
		try {
			setProcessingAttendees(prev => new Set(prev).add(attendeeId));
			await rejectAttendee({
				variables: { attendeeId },
			});
			refetchAttendees();
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

	if (!isEventManager) {
		return null;
	}

	if (eventsLoading) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
						<div className="space-y-4">
							{[...Array(3)].map((_, i) => (
								<div key={i} className="bg-white p-6 rounded-lg shadow">
									<div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
									<div className="h-3 bg-gray-200 rounded w-1/4"></div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
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

	const events: Event[] = eventsData?.myEvents || [];
	const pendingAttendees: Attendee[] = attendeesData?.pendingAttendees || [];

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Manage Attendees</h1>
					<p className="text-gray-600 mt-2">Approve or reject attendee requests for your events</p>
				</div>

				{events.length === 0 ? (
					<div className="text-center py-12">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">No events found</h2>
						<p className="text-gray-600 mb-6">You need to create events first to manage attendees.</p>
						<button
							onClick={() => router.push('/events/new')}
							className="btn-primary"
						>
							Create Your First Event
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Event Selection */}
						<div className="lg:col-span-1">
							<div className="bg-white shadow rounded-lg">
								<div className="px-4 py-5 sm:p-6">
									<h3 className="text-lg font-medium text-gray-900 mb-4">Select Event</h3>
									<div className="space-y-2">
										{events.map((event) => (
											<button
												key={event.id}
												onClick={() => setSelectedEvent(event.id)}
												className={`w-full text-left p-3 rounded-md border transition-colors ${selectedEvent === event.id
													? 'border-blue-500 bg-blue-50'
													: 'border-gray-200 hover:border-gray-300'
													}`}
											>
												<h4 className="font-medium text-gray-900">{event.title}</h4>
												<p className="text-sm text-gray-500">
													{new Date(event.date).toLocaleDateString()}
												</p>
												<p className="text-sm text-gray-500">
													{event.attendeeCount} attendees
												</p>
											</button>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Pending Attendees */}
						<div className="lg:col-span-2">
							<div className="bg-white shadow rounded-lg">
								<div className="px-4 py-5 sm:p-6">
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-lg font-medium text-gray-900">
											Pending Attendees
										</h3>
										{selectedEvent && (
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
												{pendingAttendees.length} pending
											</span>
										)}
									</div>

									{!selectedEvent ? (
										<div className="text-center py-8">
											<ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
											<p className="text-gray-500 mt-2">Select an event to view pending attendees</p>
										</div>
									) : attendeesLoading ? (
										<div className="animate-pulse space-y-4">
											{[...Array(3)].map((_, i) => (
												<div key={i} className="flex items-center space-x-4 p-4 border rounded-md">
													<div className="h-10 w-10 bg-gray-200 rounded-full"></div>
													<div className="flex-1">
														<div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
														<div className="h-3 bg-gray-200 rounded w-1/4"></div>
													</div>
												</div>
											))}
										</div>
									) : pendingAttendees.length === 0 ? (
										<div className="text-center py-8">
											<CheckIcon className="mx-auto h-12 w-12 text-green-400" />
											<p className="text-gray-500 mt-2">No pending attendees for this event</p>
										</div>
									) : (
										<div className="space-y-4">
											{pendingAttendees.map((attendee) => (
												<div key={attendee.id} className="flex items-center justify-between p-4 border rounded-md">
													<div className="flex items-center space-x-4">
														<div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
															<UserIcon className="h-5 w-5 text-gray-600" />
														</div>
														<div>
															<p className="font-medium text-gray-900">{attendee.name}</p>
															{attendee.email && (
																<p className="text-sm text-gray-500">{attendee.email}</p>
															)}
															<p className="text-xs text-gray-400">
																Requested: {new Date(attendee.createdAt).toLocaleDateString()}
															</p>
														</div>
													</div>
													<div className="flex items-center space-x-2">
														<button
															onClick={() => handleApprove(attendee.id)}
															disabled={processingAttendees.has(attendee.id)}
															className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
														>
															<CheckIcon className="h-4 w-4 mr-1" />
															Approve
														</button>
														<button
															onClick={() => handleReject(attendee.id)}
															disabled={processingAttendees.has(attendee.id)}
															className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
														>
															<XMarkIcon className="h-4 w-4 mr-1" />
															Reject
														</button>
														{processingAttendees.has(attendee.id) && (
															<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
														)}
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
} 