import { GalleryVerticalEnd } from 'lucide-react';
import { useEffect, useState } from 'react';
import { redirect, useFetcher, type ClientActionFunctionArgs } from 'react-router';
import { mainAPI } from '~/api/config';
import { LoginForm } from '~/components/login-form';
import { LoginOtp } from '~/components/login-otp';

export async function clientLoader() {
  const publicToken = sessionStorage.getItem('publicToken');
  const token = sessionStorage.getItem('token');

  if (token) {
    return redirect('/app');
  }

  if (!publicToken) {
    const resp = await mainAPI.post('/security/token');
    sessionStorage.setItem('publicToken', resp.data.data.token);
  }
}

export async function clientAction({ request }: ClientActionFunctionArgs) {
  const publicToken = sessionStorage.getItem('publicToken');
  const formData = await request.formData();
  const email = formData.get('email')?.toString() || '';
  const otp = formData.get('otp')?.toString() || '';
  const password = formData.get('password')?.toString() || '';
  const actionName = formData.get('actionName')?.toString() || '';

  if (actionName === 'credentials') {
    try {
      await mainAPI.post(
        '/security/sign-in',
        {
          email,
          password,
          rememberMe: false,
        },
        {
          headers: {
            token: publicToken,
          },
        }
      );
      return { success: true };
    } catch (error) {
      if (typeof error === 'object' && error && 'response' in error) {
        if (error.response.status === 401) {
          const resp = await mainAPI.post('/security/token');
          sessionStorage.setItem('publicToken', resp.data.data.token);
          await mainAPI.post(
            '/security/sign-in',
            {
              email,
              password,
              rememberMe: false,
            },
            {
              headers: {
                token: resp.data.data.token,
              },
            }
          );
          return { success: true };
        }
        return { success: false, errorMsg: error.response?.data?.result?.error_msg ?? 'Access denied.' };
      }
      return { success: false, errorMsg: 'Access denied.' };
    }
  } else if (actionName === 'otpSubmit') {
    try {
      const resp = await mainAPI.post(
        '/security/confirm-otp',
        {
          enteredOtpCode: otp,
        },
        {
          headers: {
            token: publicToken,
          },
        }
      );
      sessionStorage.setItem('token', resp.data.data.token);
      return redirect('/app');
    } catch (error) {
      if (typeof error === 'object' && error && 'response' in error) {
        return { success: false, errorMsg: error.response?.data?.result?.errorMsg ?? 'Wrong OTP.' };
      }
      return { success: false, errorMsg: 'Wrong OTP' };
    }
  }
}

export default function Login() {
  const fetcher = useFetcher({ key: 'login' });
  const otpFetcher = useFetcher({ key: 'otp' });

  const [isOtpOpen, setIsOtpOpen] = useState(false);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success === true) {
      setIsOtpOpen(true);
    }
  }, [fetcher]);

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
            {!isOtpOpen && <LoginForm />}
            {isOtpOpen && <LoginOtp />}
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/winter30.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
