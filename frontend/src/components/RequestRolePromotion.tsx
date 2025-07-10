'use client';

import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { REQUEST_ROLE_PROMOTION } from '@/lib/graphql/mutations';
import { RequestRolePromotionInput, UserRole } from '@/types';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const validationSchema = Yup.object({
	message: Yup.string()
		.min(10, 'Message must be at least 10 characters')
		.max(500, 'Message must be less than 500 characters')
		.required('Message is required'),
});

interface RequestRolePromotionProps {
	onSuccess?: () => void;
	onCancel?: () => void;
}

export default function RequestRolePromotion({ onSuccess, onCancel }: RequestRolePromotionProps) {
	const [requestRolePromotion, { loading }] = useMutation(REQUEST_ROLE_PROMOTION);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSubmit = async (values: RequestRolePromotionInput) => {
		try {
			await requestRolePromotion({
				variables: {
					input: {
						requestedRole: UserRole.EVENT_MANAGER,
						message: values.message,
					},
				},
			});
			setIsSubmitted(true);
			onSuccess?.();
		} catch (error: any) {
			console.error('Error requesting role promotion:', error);
		}
	};

	if (isSubmitted) {
		return (
			<div className="bg-green-50 border border-green-200 rounded-lg p-6">
				<div className="flex items-center">
					<CheckIcon className="h-6 w-6 text-green-600 mr-3" />
					<div>
						<h3 className="text-lg font-medium text-green-900">Request Submitted</h3>
						<p className="text-green-700 mt-1">
							Your request for Event Manager role has been submitted successfully.
							An admin will review your request and get back to you soon.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-6">
			<div className="mb-6">
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					Request Event Manager Role
				</h3>
				<p className="text-gray-600">
					To create and manage events, you need to be promoted to Event Manager.
					Please provide a reason for your request below.
				</p>
			</div>

			<Formik
				initialValues={{
					requestedRole: UserRole.EVENT_MANAGER,
					message: '',
				}}
				validationSchema={validationSchema}
				onSubmit={handleSubmit}
			>
				{({ isSubmitting }) => (
					<Form className="space-y-4">
						<div>
							<label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
								Reason for Request *
							</label>
							<Field
								as="textarea"
								id="message"
								name="message"
								rows={4}
								className="input-field"
								placeholder="Please explain why you need Event Manager privileges..."
							/>
							<ErrorMessage name="message" component="div" className="text-red-600 text-sm mt-1" />
						</div>

						<div className="flex gap-3">
							<button
								type="submit"
								disabled={loading || isSubmitting}
								className="btn-primary flex-1"
							>
								{loading || isSubmitting ? 'Submitting...' : 'Submit Request'}
							</button>
							{onCancel && (
								<button
									type="button"
									onClick={onCancel}
									className="btn-secondary flex-1"
								>
									Cancel
								</button>
							)}
						</div>
					</Form>
				)}
			</Formik>
		</div>
	);
} 