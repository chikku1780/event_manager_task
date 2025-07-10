'use client';

import { useMutation } from '@apollo/client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CREATE_ATTENDEE } from '@/lib/graphql/mutations';
import { GET_EVENT } from '@/lib/graphql/queries';
import { CreateAttendeeInput } from '@/types';

interface AddAttendeeFormProps {
	eventId: string;
}

const validationSchema = Yup.object({
	name: Yup.string()
		.required('Name is required')
		.min(2, 'Name must be at least 2 characters')
		.max(50, 'Name must be less than 50 characters'),
	email: Yup.string()
		.email('Invalid email format')
		.max(100, 'Email must be less than 100 characters'),
});

export function AddAttendeeForm({ eventId }: AddAttendeeFormProps) {
	const [createAttendee, { loading }] = useMutation(CREATE_ATTENDEE, {
		refetchQueries: [{ query: GET_EVENT, variables: { id: eventId } }],
	});

	const handleSubmit = async (values: { name: string; email: string }, { resetForm }: any) => {
		try {
			const input: CreateAttendeeInput = {
				name: values.name,
				email: values.email || undefined,
				eventId,
			};

			await createAttendee({
				variables: { input },
			});

			resetForm();
		} catch (error) {
			console.error('Error adding attendee:', error);
		}
	};

	return (
		<Formik
			initialValues={{
				name: '',
				email: '',
			}}
			validationSchema={validationSchema}
			onSubmit={handleSubmit}
		>
			{({ isSubmitting }) => (
				<Form className="space-y-4">
					<div>
						<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
							Name *
						</label>
						<Field
							type="text"
							id="name"
							name="name"
							className="input-field"
							placeholder="Enter attendee name"
						/>
						<ErrorMessage name="name" component="div" className="text-red-600 text-sm mt-1" />
					</div>

					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
							Email (optional)
						</label>
						<Field
							type="email"
							id="email"
							name="email"
							className="input-field"
							placeholder="Enter attendee email"
						/>
						<ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
					</div>

					<button
						type="submit"
						disabled={loading || isSubmitting}
						className="btn-primary w-full"
					>
						{loading || isSubmitting ? 'Adding...' : 'Add Attendee'}
					</button>
				</Form>
			)}
		</Formik>
	);
} 