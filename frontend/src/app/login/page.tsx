'use client';

import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { LOGIN } from '@/lib/graphql/mutations';
import { LoginInput } from '@/types';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const validationSchema = Yup.object({
	email: Yup.string()
		.email('Invalid email address')
		.required('Email is required'),
	password: Yup.string()
		.required('Password is required')
		.min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
	const router = useRouter();
	const { login, isAuthenticated } = useAuth();
	const [loginUser, { loading }] = useMutation(LOGIN);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isAuthenticated) {
			router.push('/events');
		}
	}, [isAuthenticated, router]);

	const handleSubmit = async (values: LoginInput) => {
		try {
			setError(null);
			const { data } = await loginUser({
				variables: { input: values },
			});

			if (data?.login) {
				login(data.login);
				router.push('/events');
			}
		} catch (error: any) {
			setError(error.message || 'Login failed');
		}
	};

	if (isAuthenticated) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Sign in to your account
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					Or{' '}
					<Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
						create a new account
					</Link>
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<Formik
						initialValues={{
							email: '',
							password: '',
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
											autoComplete="current-password"
											required
											className="input-field"
											placeholder="Enter your password"
										/>
										<ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
									</div>
								</div>

								<div>
									<button
										type="submit"
										disabled={loading || isSubmitting}
										className="w-full btn-primary"
									>
										{loading || isSubmitting ? 'Signing in...' : 'Sign in'}
									</button>
								</div>

								<div className="text-center">
									<p className="text-sm text-gray-600 font-medium mb-2">
										Demo Accounts:
									</p>
									<div className="space-y-2 text-xs text-gray-500">
										<div className="bg-gray-50 p-2 rounded border border-gray-200">
											<p className="font-medium text-gray-800">Regular User Accounts:</p>
											<p>Email: user2@gmail.com | Password: Pass@123</p>
											<p>Email: user3@gmail.com | Password: Pass@123</p>
										</div>
										<div className="bg-green-50 p-2 rounded border border-green-200">
											<p className="font-medium text-green-800">Event Manager Account:</p>
											<p>Email: user1@gmail.com</p>
											<p>Password: Pass@123</p>
										</div>
										<div className="bg-blue-50 p-2 rounded border border-blue-200">
											<p className="font-medium text-blue-800">Admin Account:</p>
											<p>Email: chikku1780@gmail.com</p>
											<p>Password: Chikku@123</p>
										</div>
									</div>
								</div>
							</Form>
						)}
					</Formik>
				</div>
			</div>
		</div>
	);
} 