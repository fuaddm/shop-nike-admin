// app/routes/login.tsx (or wherever your Login route lives)
import { GalleryVerticalEnd } from 'lucide-react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { redirect, useFetcher, type ClientActionFunctionArgs } from 'react-router';
import { mainAPI } from '~/api/config';
import { LoginForm } from '~/components/login-form';
import { LoginOtp } from '~/components/login-otp';

type ActionOk = { success: true };
type ActionErr = { success: false; errorMsg: string };
export type ActionResult = ActionOk | ActionErr;

function authHeaders(token: string | null) {
  return token ? { token } : undefined;
}

async function ensurePublicToken(): Promise<string> {
  const existing = sessionStorage.getItem('publicToken');
  if (existing) return existing;

  const resp = await mainAPI.post('/security/token');
  const token = resp.data?.data?.token as string;
  sessionStorage.setItem('publicToken', token);
  return token;
}

function getAxiosStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

function getBackendMessage(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  const data = error.response?.data as any;

  return data?.result?.error_msg ?? data?.result?.errorMsg ?? data?.message ?? data?.error ?? undefined;
}

export async function clientLoader() {
  const token = sessionStorage.getItem('token');
  if (token) return redirect('/app');

  await ensurePublicToken();
  return null;
}

export async function clientAction({ request }: ClientActionFunctionArgs): Promise<ActionResult | Response> {
  const formData = await request.formData();
  const email = formData.get('email')?.toString() || '';
  const otp = formData.get('otp')?.toString() || '';
  const password = formData.get('password')?.toString() || '';
  const actionName = formData.get('actionName')?.toString() || '';

  const publicToken = sessionStorage.getItem('publicToken');

  if (actionName === 'credentials') {
    if (!email) return { success: false, errorMsg: 'Please enter your email.' };
    if (!password) return { success: false, errorMsg: 'Please enter your password.' };

    try {
      await mainAPI.post(
        '/security/sign-in',
        { email, password, rememberMe: false },
        { headers: authHeaders(publicToken) }
      );
      return { success: true };
    } catch (error) {
      const status = getAxiosStatus(error);
      const backendMsg = getBackendMessage(error);

      if (status === 401) {
        // Keep your original business logic: refresh token + retry sign-in
        try {
          const resp = await mainAPI.post('/security/token');
          const newToken = resp.data?.data?.token as string;
          sessionStorage.setItem('publicToken', newToken);

          await mainAPI.post(
            '/security/sign-in',
            { email, password, rememberMe: false },
            { headers: authHeaders(newToken) }
          );
          return { success: true };
        } catch (retryError) {
          const retryStatus = getAxiosStatus(retryError);
          const retryMsg = getBackendMessage(retryError);

          if (retryStatus === 404) return { success: false, errorMsg: 'User not found.' };
          if (retryStatus === 401) return { success: false, errorMsg: 'Incorrect email or password.' };
          if (retryStatus === 429) return { success: false, errorMsg: 'Too many attempts. Please try again later.' };
          if (retryStatus && retryStatus >= 500) return { success: false, errorMsg: 'Server error. Please try again.' };

          return { success: false, errorMsg: retryMsg ?? 'Access denied.' };
        }
      }

      if (status === 404) return { success: false, errorMsg: 'User not found.' };
      if (status === 400)
        return { success: false, errorMsg: backendMsg ?? 'Invalid request. Please check your input.' };
      if (status === 403) return { success: false, errorMsg: 'Access denied.' };
      if (status === 429) return { success: false, errorMsg: 'Too many attempts. Please try again later.' };
      if (status && status >= 500) return { success: false, errorMsg: 'Server error. Please try again.' };

      if (axios.isAxiosError(error) && !error.response) {
        return { success: false, errorMsg: 'Network error. Please check your connection.' };
      }

      return { success: false, errorMsg: backendMsg ?? 'Access denied.' };
    }
  }

  if (actionName === 'otpSubmit') {
    if (!otp) return { success: false, errorMsg: 'Please enter the OTP code.' };

    try {
      const resp = await mainAPI.post(
        '/security/confirm-otp',
        { enteredOtpCode: otp },
        { headers: authHeaders(publicToken) }
      );

      sessionStorage.setItem('token', resp.data?.data?.token);
      return redirect('/app');
    } catch (error) {
      const status = getAxiosStatus(error);
      const backendMsg = getBackendMessage(error);

      if (status === 400) return { success: false, errorMsg: backendMsg ?? 'Invalid OTP code format.' };
      if (status === 401) return { success: false, errorMsg: 'Wrong OTP.' };
      if (status === 403) return { success: false, errorMsg: 'OTP verification not allowed. Please sign in again.' };
      if (status === 404) return { success: false, errorMsg: 'OTP session expired. Please sign in again.' };
      if (status === 429) return { success: false, errorMsg: 'Too many OTP attempts. Please try again later.' };
      if (status && status >= 500) return { success: false, errorMsg: 'Server error. Please try again.' };

      if (axios.isAxiosError(error) && !error.response) {
        return { success: false, errorMsg: 'Network error. Please check your connection.' };
      }

      return { success: false, errorMsg: backendMsg ?? 'Wrong OTP.' };
    }
  }

  return { success: false, errorMsg: 'Unknown action.' };
}

export default function Login() {
  // IMPORTANT: fetchers are created ONLY here (not inside child components)
  const loginFetcher = useFetcher<ActionResult>({ key: 'login' });
  const otpFetcher = useFetcher<ActionResult>({ key: 'otp' });

  const [isOtpOpen, setIsOtpOpen] = useState(false);

  useEffect(() => {
    if (loginFetcher.state === 'idle' && loginFetcher.data?.success === true) {
      setIsOtpOpen(true);
    }
    if (loginFetcher.state === 'idle' && loginFetcher.data?.success === false) {
      setIsOtpOpen(false);
    }
  }, [loginFetcher.state, loginFetcher.data]);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a
            href="#"
            className="flex items-center gap-2 font-medium"
          >
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Omar Inc.
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full">
            {!isOtpOpen && <LoginForm fetcher={loginFetcher} />}
            {isOtpOpen && <LoginOtp fetcher={otpFetcher} />}
          </div>
        </div>
      </div>

      <div className="bg-muted relative hidden lg:block">
        <img
          src="/login-poster.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
