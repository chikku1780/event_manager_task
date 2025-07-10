'use client';

import { useQuery, useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { GET_EVENT, GET_TAGS } from '@/lib/graphql/queries';
import { UPDATE_EVENT } from '@/lib/graphql/mutations';
import { Event, Tag } from '@/types';
import Link from 'next/link';
import { ArrowLeftIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/components/providers/AuthProvider';
import { useEffect, useState } from 'react';

const validationSchema = Yup.object({
	title: Yup.string()
		.required('Title is required')
		.min(3, 'Title must be at least 3 characters')
		.max(100, 'Title must be less than 100 characters'),
	date: Yup.string()
		.required('Date is required'),
	description: Yup.string()
		.max(500, 'Description must be less than 500 characters'),
});

export default function EditEventPage() {
	const { isAuthenticated, user } = useAuth();
	const params = useParams();
	const router = useRouter();
	const eventId = params.id as string;
	const [updateEvent, { loading }] = useMutation(UPDATE_EVENT);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [showDatePicker, setShowDatePicker] = useState(false);

	const { data: eventData, loading: eventLoading } = useQuery(GET_EVENT, {
		variables: { id: eventId },
		skip: !isAuthenticated
	});

	const { data: tagsData } = useQuery(GET_TAGS, {
		skip: !isAuthenticated
	});

	useEffect(() => {
		if (!isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, router]);

	useEffect(() => {
		if (eventData?.event) {
			setSelectedTags(eventData.event.tags.map((tag: Tag) => tag.id));
		}
	}, [eventData]);

	const event: Event = eventData?.event;
	const tags: Tag[] = tagsData?.tags || [];

	// Check if user is the event owner
	const isEventOwner = event && user && event.createdBy === user.id;

	useEffect(() => {
		if (event && !isEventOwner) {
			router.push('/events');
		}
	}, [event, isEventOwner, router]);

	const handleSubmit = async (values: any) => {
		try {
			const { data } = await updateEvent({
				variables: {
					id: eventId,
					input: {
						...values,
						tagIds: selectedTags.length > 0 ? selectedTags : undefined,
					}
				},
			});

			if (data?.updateEvent) {
				router.push(`/events/${eventId}`);
			}
		} catch (error) {
			console.error('Error updating event:', error);
		}
	};

	const handleTagToggle = (tagId: string) => {
		setSelectedTags(prev =>
			prev.includes(tagId)
				? prev.filter(id => id !== tagId)
				: [...prev, tagId]
		);
	};

	const getMinDateTime = () => {
		const now = new Date();
		now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
		return now.toISOString().slice(0, 16);
	};

	if (!isAuthenticated) {
		return null;
	}

	if (eventLoading) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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

	if (!event) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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

	if (!isEventOwner) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
						<p className="text-gray-600 mb-6">You can only edit events that you created.</p>
						<Link href="/events" className="btn-primary">
							Back to Events
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<Link
						href={`/events/${eventId}`}
						className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
					>
						<ArrowLeftIcon className="h-4 w-4 mr-2" />
						Back to Event
					</Link>
					<h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
				</div>

				<div className="card">
					<Formik
						initialValues={{
							title: event.title,
							date: new Date(event.date).toISOString().slice(0, 16),
							description: event.description || '',
						}}
						validationSchema={validationSchema}
						onSubmit={handleSubmit}
					>
						{({ isSubmitting, values }) => (
							<Form className="space-y-6">
								<div>
									<label htmlFor="title" className="block text-sm font-medium text-gray-700">
										Event Title
									</label>
									<div className="mt-1">
										<Field
											id="title"
											name="title"
											type="text"
											required
											className="input-field"
											placeholder="Enter event title"
										/>
										<ErrorMessage name="title" component="div" className="text-red-600 text-sm mt-1" />
									</div>
								</div>

								<div>
									<label htmlFor="date" className="block text-sm font-medium text-gray-700">
										Date & Time
									</label>
									<div className="mt-1 relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<CalendarIcon className="h-5 w-5 text-gray-400" />
										</div>
										<Field
											id="date"
											name="date"
											type="datetime-local"
											required
											min={getMinDateTime()}
											className="input-field pl-10"
										/>
										<ErrorMessage name="date" component="div" className="text-red-600 text-sm mt-1" />
									</div>
								</div>

								<div>
									<label htmlFor="description" className="block text-sm font-medium text-gray-700">
										Description
									</label>
									<div className="mt-1">
										<Field
											id="description"
											name="description"
											as="textarea"
											rows={4}
											className="input-field"
											placeholder="Enter event description (optional)"
										/>
										<ErrorMessage name="description" component="div" className="text-red-600 text-sm mt-1" />
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Tags
									</label>
									<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
										{tags.map((tag) => (
											<button
												key={tag.id}
												type="button"
												onClick={() => handleTagToggle(tag.id)}
												className={`p-2 rounded-lg border text-sm font-medium transition-colors ${selectedTags.includes(tag.id)
														? 'border-transparent'
														: 'border-gray-300 hover:border-gray-400'
													}`}
												style={{
													backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
													color: selectedTags.includes(tag.id) ? 'white' : tag.color,
												}}
											>
												{tag.name}
											</button>
										))}
									</div>
								</div>

								<div className="flex gap-4">
									<Link
										href={`/events/${eventId}`}
										className="flex-1 btn-secondary text-center"
									>
										Cancel
									</Link>
									<button
										type="submit"
										disabled={loading || isSubmitting}
										className="flex-1 btn-primary"
									>
										{loading || isSubmitting ? 'Updating...' : 'Update Event'}
									</button>
								</div>
							</Form>
						)}
					</Formik>
				</div>
			</div>
		</div>
	);
} 