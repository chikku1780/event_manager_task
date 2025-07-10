'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthResponse } from '@/types';

interface AuthContextType {
	user: User | null;
	token: string | null;
	login: (authResponse: AuthResponse) => void;
	logout: () => void;
	isAuthenticated: boolean;
	isAdmin: boolean;
	isEventManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);

	useEffect(() => {
		// Check for stored auth data on mount
		const storedToken = localStorage.getItem('authToken');
		const storedUser = localStorage.getItem('authUser');

		if (storedToken && storedUser) {
			try {
				setToken(storedToken);
				setUser(JSON.parse(storedUser));
			} catch (error) {
				console.error('Error parsing stored auth data:', error);
				localStorage.removeItem('authToken');
				localStorage.removeItem('authUser');
			}
		}
	}, []);

	const login = (authResponse: AuthResponse) => {
		setUser(authResponse.user);
		setToken(authResponse.token);
		localStorage.setItem('authToken', authResponse.token);
		localStorage.setItem('authUser', JSON.stringify(authResponse.user));
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem('authToken');
		localStorage.removeItem('authUser');
	};

	const isAuthenticated = !!user && !!token;
	const isAdmin = user?.role === 'ADMIN';
	const isEventManager = user?.role === 'EVENT_MANAGER' || user?.role === 'ADMIN';

	const value: AuthContextType = {
		user,
		token,
		login,
		logout,
		isAuthenticated,
		isAdmin,
		isEventManager,
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
}; 