import { useFetcher } from 'react-router';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '~/components/ui/input-otp';

export function LoginOtp() {
  const otpFetcher = useFetcher({ key: 'otp' });

  return (
    <div className="mx-auto w-fit py-10">
      <div className="w-full max-w-sm">
        <h2 className="mb-6 text-center text-2xl font-bold">Two-Factor Authentication</h2>
        <p className="text-muted-foreground mb-6 text-center">
          A verification code has been sent to your registered email.
        </p>

        <div className="mb-4">
          <div className="mb-2 font-medium">Verification Code</div>
          <InputOTP
            name="otp"
            disabled={otpFetcher.state !== 'idle'}
            onComplete={(otp) => {
              const formData = new FormData();
              formData.append('otp', otp);
              formData.append('actionName', 'otpSubmit');
              otpFetcher.submit(formData, {
                method: 'post',
                action: '/login',
              });
            }}
            maxLength={6}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {otpFetcher.data && !otpFetcher.data?.success && (
            <p className="mt-4 text-center text-sm text-red-500">{otpFetcher.data?.errorMsg || 'Wrong OTP.'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
