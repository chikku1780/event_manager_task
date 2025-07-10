'use client';

import { useQuery, useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { GET_EVENT, GET_USER } from '@/lib/graphql/queries';
import { REQUEST_TO_JOIN_EVENT, DELETE_ATTENDEE } from '@/lib/graphql/mutations';
import { Event, User } from '@/types';
import Link from 'next/link';
import { ArrowLeftIcon, TrashIcon, UserPlusIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/components/providers/AuthProvider';
import { useEffect, useState } from 'react';

export default function EventDetailPage() {
	const { isAuthenticated, user, isAdmin } = useAuth();
	const params = useParams();
	const router = useRouter();
	const eventId = params.id as string;
	const [requestingJoin, setRequestingJoin] = useState(false);

	useEffect(() => {
		if (!isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, router]);

	const { loading, error, data } = useQuery(GET_EVENT, {
		variables: { id: eventId },
		skip: !isAuthenticated,
		pollInterval: 5000 // Poll every 5 seconds for real-time updates
	});

	const { data: ownerData } = useQuery(GET_USER, {
		variables: { id: data?.event?.createdBy || '' },
		skip: !data?.event?.createdBy || !isAuthenticated
	});

	const [deleteAttendee] = useMutation(DELETE_ATTENDEE, {
		refetchQueries: [{ query: GET_EVENT, variables: { id: eventId } }],
	});

	const [requestToJoinEvent] = useMutation(REQUEST_TO_JOIN_EVENT, {
		refetchQueries: [{ query: GET_EVENT, variables: { id: eventId } }],
	});

	if (!isAuthenticated) {
		return null;
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
						<div className="card">
							<div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
							<div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
							<div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Event</h1>
						<p className="text-gray-600">{error.message}</p>
					</div>
				</div>
			</div>
		);
	}

	const event: Event = data?.event;

	if (!event) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
						<Link href="/events" className="btn-primary">
							Back to Events
						</Link>
					</div>
				</div>
			</div>
		);
	}

	const handleDeleteAttendee = async (attendeeId: string) => {
		try {
			await deleteAttendee({
				variables: { id: attendeeId },
			});
		} catch (error) {
			console.error('Error deleting attendee:', error);
		}
	};

	const handleRequestToJoin = async () => {
		try {
			setRequestingJoin(true);
			await requestToJoinEvent({
				variables: { input: { eventId } },
			});
		} catch (error) {
			console.error('Error requesting to join event:', error);
		} finally {
			setRequestingJoin(false);
		}
	};

	// Check if current user is already an attendee and get their status
	const currentUserAttendee = event?.attendees.find(attendee => attendee.email === user?.email);
	const isCurrentUserAttendee = !!currentUserAttendee;

	// Check if current user is the event owner
	const isEventOwner = event && user && event.createdBy === user.id;

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<Link
						href="/events"
						className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
					>
						<ArrowLeftIcon className="h-4 w-4 mr-2" />
						Back to Events
					</Link>
					<h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
				</div>

				<div className="grid gap-8 lg:grid-cols-3">
					{/* Event Details */}
					<div className="lg:col-span-2">
						<div className="card mb-6">
							<div className="flex justify-between items-start mb-4">
								<div>
									<h2 className="text-xl font-semibold text-gray-900 mb-2">Event Details</h2>
									<p className="text-gray-600">
										{new Date(event.date).toLocaleDateString('en-US', {
											weekday: 'long',
											year: 'numeric',
											month: 'long',
											day: 'numeric',
										})}
									</p>
									<p className="text-gray-600">
										{new Date(event.date).toLocaleTimeString('en-US', {
											hour: '2-digit',
											minute: '2-digit',
										})}
									</p>
								</div>
								<span className="text-sm text-gray-500">
									{event.attendeeCount} attendees
								</span>
							</div>

							{event.description && (
								<div className="mb-4">
									<h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
									<p className="text-gray-600">{event.description}</p>
								</div>
							)}

							{ownerData?.user && (
								<div className="mb-4">
									<h3 className="text-sm font-medium text-gray-700 mb-2">Event Owner</h3>
									<div className="flex items-center gap-2">
										<UserIcon className="h-4 w-4 text-gray-500" />
										<span className="text-gray-600">{ownerData.user.name}</span>
										<span className="text-sm text-gray-500">({ownerData.user.email})</span>
									</div>
								</div>
							)}

							{event.tags && event.tags.length > 0 && (
								<div>
									<h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
									<div className="flex gap-2">
										{event.tags.map((tag) => (
											<span
												key={tag.id}
												className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
											>
												{tag.name}
											</span>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Attendees List */}
						<div className="card">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-xl font-semibold text-gray-900">Attendees</h2>
								<span className="text-sm text-gray-500">
									{event.attendees.length} people
								</span>
							</div>

							{event.attendees.length === 0 ? (
								<p className="text-gray-500 text-center py-8">No attendees yet</p>
							) : (
								<div className="space-y-4">
									{event.attendees.map((attendee) => (
										<div
											key={attendee.id}
											className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
										>
											<div>
												<h3 className="font-medium text-gray-900">{attendee.name}</h3>
												{attendee.email && (
													<p className="text-sm text-gray-600">{attendee.email}</p>
												)}
												<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${attendee.rsvpStatus === 'CONFIRMED'
													? 'bg-green-100 text-green-800'
													: attendee.rsvpStatus === 'DECLINED'
														? 'bg-red-100 text-red-800'
														: 'bg-yellow-100 text-yellow-800'
													}`}>
													{attendee.rsvpStatus}
												</span>
											</div>
											{(isEventOwner || isAdmin) && (
												<button
													onClick={() => handleDeleteAttendee(attendee.id)}
													className="text-red-600 hover:text-red-800 p-2"
													title="Remove attendee"
												>
													<TrashIcon className="h-5 w-5" />
												</button>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Request to Join Section */}
					<div className="lg:col-span-1">
						<div className="card">
							<h2 className="text-xl font-semibold text-gray-900 mb-4">Join Event</h2>
							{isCurrentUserAttendee ? (
								<div className="text-center py-4">
									{currentUserAttendee?.rsvpStatus === 'APPROVED' ? (
										<div>
											<p className="text-green-600 font-medium">You are approved for this event!</p>
											<p className="text-sm text-gray-500 mt-2">You can now attend this event</p>
										</div>
									) : currentUserAttendee?.rsvpStatus === 'REJECTED' ? (
										<div>
											<p className="text-red-600 font-medium">Your request was rejected</p>
											<p className="text-sm text-gray-500 mt-2">Contact the event manager for more information</p>
										</div>
									) : (
										<div>
											<p className="text-yellow-600 font-medium">You have requested to join this event</p>
											<p className="text-sm text-gray-500 mt-2">Waiting for approval from the event manager</p>
										</div>
									)}
								</div>
							) : (
								<button
									onClick={handleRequestToJoin}
									disabled={requestingJoin}
									className="w-full btn-primary inline-flex items-center justify-center gap-2"
								>
									<UserPlusIcon className="h-5 w-5" />
									{requestingJoin ? 'Requesting...' : 'Request to Join'}
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
} 