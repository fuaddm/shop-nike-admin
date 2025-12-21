import { clsx, type ClassValue } from 'clsx';
import { redirect } from 'react-router';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Checks for a valid access token in client storage (e.g., localStorage).
 * If no token is found, throws a client-side redirect.
 */
export function requireClientAuth() {
  // NOTE: This assumes you store your access token in localStorage on login.
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    // Build the redirect URL including the current path for post-login return
    const currentPath = window.location.pathname;
    const loginUrl = `/login?redirectTo=${encodeURIComponent(currentPath)}`;

    throw redirect(loginUrl);
  }

  return accessToken;
}

// Optional: Function to create headers with the token
export function createAuthHeaders(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}
