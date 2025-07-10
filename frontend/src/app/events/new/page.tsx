'use client';

import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CREATE_EVENT } from '@/lib/graphql/mutations';
import { GET_TAGS, GET_MY_EVENTS, GET_EVENTS } from '@/lib/graphql/queries';
import { CreateEventInput, Tag } from '@/types';
import Link from 'next/link';
import { ArrowLeftIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

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

export default function NewEventPage() {
	const { isAuthenticated } = useAuth();
	const router = useRouter();
	const [createEvent, { loading }] = useMutation(CREATE_EVENT, {
		refetchQueries: [
			{ query: GET_MY_EVENTS },
			{ query: GET_EVENTS }
		],
	});
	const { data: tagsData } = useQuery(GET_TAGS, {
		skip: !isAuthenticated
	});
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [showDatePicker, setShowDatePicker] = useState(false);

	useEffect(() => {
		if (!isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, router]);

	const tags: Tag[] = tagsData?.tags || [];

	const handleSubmit = async (values: CreateEventInput) => {
		try {
			const { data } = await createEvent({
				variables: {
					input: {
						...values,
						tagIds: selectedTags.length > 0 ? selectedTags : undefined,
					}
				},
			});

			if (data?.createEvent) {
				router.push(`/events/${data.createEvent.id}`);
			}
		} catch (error) {
			console.error('Error creating event:', error);
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

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<Link
						href="/events"
						className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
					>
						<ArrowLeftIcon className="h-4 w-4 mr-2" />
						Back to Events
					</Link>
					<h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
				</div>

				<div className="card">
					<Formik
						initialValues={{
							title: '',
							date: '',
							description: '',
						}}
						validationSchema={validationSchema}
						onSubmit={handleSubmit}
					>
						{({ isSubmitting, setFieldValue, values }) => (
							<Form className="space-y-6">
								<div>
									<label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
										Event Title *
									</label>
									<Field
										type="text"
										id="title"
										name="title"
										className="input-field"
										placeholder="Enter event title"
									/>
									<ErrorMessage name="title" component="div" className="text-red-600 text-sm mt-1" />
								</div>

								<div>
									<label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
										Event Date & Time *
									</label>
									<div className="relative">
										<div className="flex items-center">
											<CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 z-10" />
											<Field
												type="datetime-local"
												id="date"
												name="date"
												min={getMinDateTime()}
												className="input-field pl-10"
												onFocus={() => setShowDatePicker(true)}
											/>
											{values.date && (
												<button
													type="button"
													onClick={() => setFieldValue('date', '')}
													className="absolute right-3 text-gray-400 hover:text-gray-600"
												>
													×
												</button>
											)}
										</div>
										{showDatePicker && values.date && (
											<div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
												<div className="flex items-center text-sm text-blue-800">
													<ClockIcon className="h-4 w-4 mr-2" />
													Selected: {new Date(values.date).toLocaleString()}
												</div>
											</div>
										)}
									</div>
									<ErrorMessage name="date" component="div" className="text-red-600 text-sm mt-1" />
								</div>

								<div>
									<label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
										Description
									</label>
									<Field
										as="textarea"
										id="description"
										name="description"
										rows={4}
										className="input-field"
										placeholder="Enter event description (optional)"
									/>
									<ErrorMessage name="description" component="div" className="text-red-600 text-sm mt-1" />
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Tags (Optional)
									</label>
									<div className="flex flex-wrap gap-2">
										{tags.map((tag) => (
											<button
												key={tag.id}
												type="button"
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
									{selectedTags.length > 0 && (
										<p className="text-sm text-gray-500 mt-2">
											Selected: {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''}
										</p>
									)}
								</div>

								<div className="flex gap-4">
									<button
										type="submit"
										disabled={loading || isSubmitting}
										className="btn-primary flex-1"
									>
										{loading || isSubmitting ? 'Creating...' : 'Create Event'}
									</button>
									<Link href="/events" className="btn-secondary flex-1 text-center">
										Cancel
									</Link>
								</div>
							</Form>
						)}
					</Formik>
				</div>
			</div>
		</div>
	);
} 