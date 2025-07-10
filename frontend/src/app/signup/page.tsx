'use client';

import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CREATE_USER } from '@/lib/graphql/mutations';
import { CreateUserInput } from '@/types';
import Link from 'next/link';
import { useState } from 'react';

const validationSchema = Yup.object({
	name: Yup.string()
		.required('Name is required')
		.min(2, 'Name must be at least 2 characters')
		.max(100, 'Name must be less than 100 characters'),
	email: Yup.string()
		.email('Invalid email address')
		.required('Email is required'),
	password: Yup.string()
		.required('Password is required')
		.min(6, 'Password must be at least 6 characters'),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref('password')], 'Passwords must match')
		.required('Confirm password is required'),
});

export default function SignupPage() {
	const router = useRouter();
	const [createUser, { loading }] = useMutation(CREATE_USER);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (values: any) => {
		try {
			setError(null);
			// Extract only the fields that match CreateUserInput type
			const { confirmPassword, ...createUserInput } = values;
			const { data } = await createUser({
				variables: { input: createUserInput },
			});

			if (data?.createUser) {
				// Redirect to login page after successful signup
				router.push('/login?message=Account created successfully! Please sign in.');
			}
		} catch (error: any) {
			setError(error.message || 'Signup failed');
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Create your account
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					Or{' '}
					<Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
						sign in to your existing account
					</Link>
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<Formik
						initialValues={{
							name: '',
							email: '',
							password: '',
							confirmPassword: '',
						}}
						validationSchema={validationSchema}
						onSubmit={handleSubmit}
					>
						{({ isSubmitting }) => (
							<Form className="space-y-6">
								{error && (
									<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
										{error}
									</div>
								)}

								<div>
									<label htmlFor="name" className="block text-sm font-medium text-gray-700">
										Full Name
									</label>
									<div className="mt-1">
										<Field
											id="name"
											name="name"
											type="text"
											autoComplete="name"
											required
											className="input-field"
											placeholder="Enter your full name"
										/>
										<ErrorMessage name="name" component="div" className="text-red-600 text-sm mt-1" />
									</div>
								</div>

								<div>
									<label htmlFor="email" className="block text-sm font-medium text-gray-700">
										Email address
									</label>
									<div className="mt-1">
										<Field
											id="email"
											name="email"
											type="email"
											autoComplete="email"
											required
											className="input-field"
											placeholder="Enter your email"
										/>
										<ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
									</div>
								</div>

								<div>
									<label htmlFor="password" className="block text-sm font-medium text-gray-700">
										Password
									</label>
									<div className="mt-1">
										<Field
											id="password"
											name="password"
											type="password"
											autoComplete="new-password"
											required
											className="input-field"
											placeholder="Enter your password"
										/>
										<ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
									</div>
								</div>

								<div>
									<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
										Confirm Password
									</label>
									<div className="mt-1">
										<Field
											id="confirmPassword"
											name="confirmPassword"
											type="password"
											autoComplete="new-password"
											required
											className="input-field"
											placeholder="Confirm your password"
										/>
										<ErrorMessage name="confirmPassword" component="div" className="text-red-600 text-sm mt-1" />
									</div>
								</div>

								<div>
									<button
										type="submit"
										disabled={loading || isSubmitting}
										className="w-full btn-primary"
									>
										{loading || isSubmitting ? 'Creating account...' : 'Create account'}
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