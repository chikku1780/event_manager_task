'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS, GET_EVENTS, GET_ROLE_REQUESTS, GET_MY_EVENTS } from '@/lib/graphql/queries';
import { UPDATE_USER_ROLE, APPROVE_ATTENDEE, REJECT_ATTENDEE } from '@/lib/graphql/mutations';
import { User, UserRole, Event, RoleRequest } from '@/types';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShieldCheckIcon, UserGroupIcon, UserIcon, CalendarIcon, CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AdminPage() {
	const { isAdmin } = useAuth();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<'users' | 'events' | 'requests'>('users');
	const [updateUserRole] = useMutation(UPDATE_USER_ROLE, {
		refetchQueries: [
			{ query: GET_USERS },
			{ query: GET_ROLE_REQUESTS }
		],
	});
	const [approveAttendee] = useMutation(APPROVE_ATTENDEE, {
		refetchQueries: [
			{ query: GET_EVENTS },
			{ query: GET_MY_EVENTS }
		],
	});
	const [rejectAttendee] = useMutation(REJECT_ATTENDEE, {
		refetchQueries: [
			{ query: GET_EVENTS },
			{ query: GET_MY_EVENTS }
		],
	});
	const [selectedRole, setSelectedRole] = useState<{ [key: string]: UserRole }>({});
	const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());
	const [processingAttendees, setProcessingAttendees] = useState<Set<string>>(new Set());

	const { loading: usersLoading, error: usersError, data: usersData } = useQuery(GET_USERS);
	const { loading: eventsLoading, error: eventsError, data: eventsData } = useQuery(GET_EVENTS);
	const { loading: requestsLoading, error: requestsError, data: requestsData } = useQuery(GET_ROLE_REQUESTS);

	useEffect(() => {
		if (!isAdmin) {
			router.push('/login');
		}
	}, [isAdmin, router]);

	const handleRoleChange = async (userId: string, newRole: UserRole) => {
		try {
			setUpdatingUsers(prev => new Set(prev).add(userId));
			await updateUserRole({
				variables: { userId, role: newRole },
			});
			setSelectedRole(prev => ({ ...prev, [userId]: newRole }));
		} catch (error) {
			console.error('Error updating user role:', error);
		} finally {
			setUpdatingUsers(prev => {
				const newSet = new Set(prev);
				newSet.delete(userId);
				return newSet;
			});
		}
	};

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

	const getRoleIcon = (role: UserRole) => {
		switch (role) {
			case UserRole.ADMIN:
				return <ShieldCheckIcon className="h-4 w-4 text-red-500" />;
			case UserRole.EVENT_MANAGER:
				return <UserGroupIcon className="h-4 w-4 text-blue-500" />;
			default:
				return <UserIcon className="h-4 w-4 text-gray-500" />;
		}
	};

	const getRoleBadgeColor = (role: UserRole) => {
		switch (role) {
			case UserRole.ADMIN:
				return 'bg-red-100 text-red-800 border-red-200';
			case UserRole.EVENT_MANAGER:
				return 'bg-blue-100 text-blue-800 border-blue-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	if (!isAdmin) {
		return null;
	}

	const users: User[] = usersData?.users || [];
	const events: Event[] = eventsData?.events || [];
	const roleRequests: RoleRequest[] = requestsData?.roleRequests || [];

	const isLoading = usersLoading || eventsLoading || requestsLoading;
	const hasError = usersError || eventsError || requestsError;

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
						<div className="space-y-4">
							{[...Array(5)].map((_, i) => (
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

	if (hasError) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Data</h1>
						<p className="text-gray-600">{usersError?.message || eventsError?.message}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
					<p className="text-gray-600 mt-2">Manage users and events</p>
				</div>

				{/* Tab Navigation */}
				<div className="border-b border-gray-200 mb-8">
					<nav className="-mb-px flex space-x-8">
						<button
							onClick={() => setActiveTab('users')}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
						>
							<UserIcon className="h-5 w-5 inline mr-2" />
							Users ({users.length})
						</button>
						<button
							onClick={() => setActiveTab('events')}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'events'
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
						>
							<CalendarIcon className="h-5 w-5 inline mr-2" />
							Events ({events.length})
						</button>
						<button
							onClick={() => setActiveTab('requests')}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'requests'
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
						>
							<ClockIcon className="h-5 w-5 inline mr-2" />
							Role Requests ({roleRequests.filter(r => r.status === 'PENDING').length})
						</button>
					</nav>
				</div>

				{/* Users Tab */}
				{activeTab === 'users' && (
					<>
						<div className="bg-white shadow overflow-hidden sm:rounded-md">
							<div className="px-4 py-5 sm:px-6 border-b border-gray-200">
								<h3 className="text-lg leading-6 font-medium text-gray-900">
									User Management
								</h3>
								<p className="mt-1 max-w-2xl text-sm text-gray-500">
									Total users: {users.length}
								</p>
							</div>

							{users.length === 0 ? (
								<div className="text-center py-12">
									<p className="text-gray-500">No users found</p>
								</div>
							) : (
								<ul className="divide-y divide-gray-200">
									{users.map((user) => (
										<li key={user.id} className="px-4 py-4 sm:px-6">
											<div className="flex items-center justify-between">
												<div className="flex items-center">
													<div className="flex-shrink-0">
														<div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
															<span className="text-sm font-medium text-gray-700">
																{user.name.charAt(0).toUpperCase()}
															</span>
														</div>
													</div>
													<div className="ml-4">
														<div className="flex items-center">
															<p className="text-sm font-medium text-gray-900">{user.name}</p>
															{getRoleIcon(user.role)}
														</div>
														<p className="text-sm text-gray-500">{user.email}</p>
														<div className="flex items-center mt-1">
															<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
																{user.role}
															</span>
															{!user.isActive && (
																<span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
																	Inactive
																</span>
															)}
														</div>
													</div>
												</div>

												<div className="flex items-center space-x-4">
													<select
														value={selectedRole[user.id] || user.role}
														onChange={(e) => {
															const newRole = e.target.value as UserRole;
															setSelectedRole(prev => ({ ...prev, [user.id]: newRole }));
															handleRoleChange(user.id, newRole);
														}}
														disabled={updatingUsers.has(user.id) || user.role === UserRole.ADMIN}
														className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
													>
														<option value={UserRole.USER}>User</option>
														<option value={UserRole.EVENT_MANAGER}>Event Manager</option>
														<option value={UserRole.ADMIN}>Admin</option>
													</select>

													{updatingUsers.has(user.id) && (
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
													)}
												</div>
											</div>
										</li>
									))}
								</ul>
							)}
						</div>

						<div className="mt-8 bg-white shadow sm:rounded-lg">
							<div className="px-4 py-5 sm:p-6">
								<h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
									Role Descriptions
								</h3>
								<div className="space-y-3">
									<div className="flex items-center">
										<UserIcon className="h-5 w-5 text-gray-500 mr-3" />
										<div>
											<p className="text-sm font-medium text-gray-900">User</p>
											<p className="text-sm text-gray-500">Can view events and register as attendees</p>
										</div>
									</div>
									<div className="flex items-center">
										<UserGroupIcon className="h-5 w-5 text-blue-500 mr-3" />
										<div>
											<p className="text-sm font-medium text-gray-900">Event Manager</p>
											<p className="text-sm text-gray-500">Can create events and manage attendees</p>
										</div>
									</div>
									<div className="flex items-center">
										<ShieldCheckIcon className="h-5 w-5 text-red-500 mr-3" />
										<div>
											<p className="text-sm font-medium text-gray-900">Admin</p>
											<p className="text-sm text-gray-500">Full access to all features and user management</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</>
				)}

				{/* Events Tab */}
				{activeTab === 'events' && (
					<div className="bg-white shadow overflow-hidden sm:rounded-md">
						<div className="px-4 py-5 sm:px-6 border-b border-gray-200">
							<h3 className="text-lg leading-6 font-medium text-gray-900">
								Event & Attendee Management
							</h3>
							<p className="mt-1 max-w-2xl text-sm text-gray-500">
								Total events: {events.length}
							</p>
						</div>

						{events.length === 0 ? (
							<div className="text-center py-12">
								<p className="text-gray-500">No events found</p>
							</div>
						) : (
							<ul className="divide-y divide-gray-200">
								{events.map((event) => (
									<li key={event.id} className="px-4 py-4 sm:px-6">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<h4 className="text-lg font-medium text-gray-900">{event.title}</h4>
												<p className="text-sm text-gray-500 mt-1">
													{new Date(event.date).toLocaleDateString('en-US', {
														weekday: 'long',
														year: 'numeric',
														month: 'long',
														day: 'numeric',
													})}
												</p>
												{event.description && (
													<p className="text-sm text-gray-600 mt-2 line-clamp-2">
														{event.description}
													</p>
												)}
												<div className="flex items-center mt-2">
													<span className="text-sm text-gray-500">
														{event.attendeeCount} attendees
													</span>
													{event.tags && event.tags.length > 0 && (
														<div className="ml-4 flex gap-1">
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
												</div>

												{/* Attendee Requests */}
												{event.attendees && event.attendees.length > 0 && (
													<div className="mt-4">
														<h5 className="text-sm font-medium text-gray-700 mb-2">Attendee Requests</h5>
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
											</div>
											<div className="ml-4">
												<Link
													href={`/events/${event.id}`}
													className="text-blue-600 hover:text-blue-800 text-sm font-medium"
												>
													View Details
												</Link>
											</div>
										</div>
									</li>
								))}
							</ul>
						)}
					</div>
				)}

				{/* Role Requests Tab */}
				{activeTab === 'requests' && (
					<div className="bg-white shadow overflow-hidden sm:rounded-md">
						<div className="px-4 py-5 sm:px-6 border-b border-gray-200">
							<h3 className="text-lg leading-6 font-medium text-gray-900">
								Role Promotion Requests
							</h3>
							<p className="mt-1 max-w-2xl text-sm text-gray-500">
								Total requests: {roleRequests.length} | Pending: {roleRequests.filter(r => r.status === 'PENDING').length}
							</p>
						</div>

						{roleRequests.length === 0 ? (
							<div className="text-center py-12">
								<ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
								<p className="text-gray-500 mt-2">No role requests found</p>
							</div>
						) : (
							<ul className="divide-y divide-gray-200">
								{roleRequests.map((request) => (
									<li key={request.id} className="px-4 py-4 sm:px-6">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center mb-2">
													<h4 className="text-lg font-medium text-gray-900">
														{request.user?.name || 'Unknown User'}
													</h4>
													<span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${request.status === 'PENDING'
														? 'bg-yellow-100 text-yellow-800'
														: request.status === 'APPROVED'
															? 'bg-green-100 text-green-800'
															: 'bg-red-100 text-red-800'
														}`}>
														{request.status}
													</span>
												</div>
												<p className="text-sm text-gray-500 mb-2">
													{request.user?.email} • Requesting: {request.requestedRole}
												</p>
												{request.message && (
													<div className="bg-gray-50 p-3 rounded-md mb-3">
														<p className="text-sm text-gray-700">{request.message}</p>
													</div>
												)}
												<p className="text-xs text-gray-400">
													Requested: {new Date(request.createdAt).toLocaleDateString()}
												</p>
											</div>
											{request.status === 'PENDING' && request.user && (
												<div className="flex gap-2 ml-4">
													<button
														onClick={() => handleRoleChange(request.user!.id, request.requestedRole)}
														disabled={updatingUsers.has(request.user!.id)}
														className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
													>
														<CheckIcon className="h-4 w-4 mr-1" />
														Approve
													</button>
													<button
														onClick={() => {
															// TODO: Implement reject functionality
															console.log('Reject request:', request.id);
														}}
														className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
													>
														<XMarkIcon className="h-4 w-4 mr-1" />
														Reject
													</button>
												</div>
											)}
										</div>
									</li>
								))}
							</ul>
						)}
					</div>
				)}
			</div>
		</div>
	);
} 