import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { useFetcher, type FetcherFormProps } from 'react-router';

export function LoginForm({ className, ...props }: FetcherFormProps & { className?: string }) {
  const fetcher = useFetcher({ key: 'login' });

  return (
    <fetcher.Form
      method="POST"
      className={cn('mx-auto flex max-w-xs flex-col gap-6', className)}
      {...props}
    >
      <input
        type="hidden"
        name="actionName"
        value="credentials"
      />
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">Enter your email below to login to your account</p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="m@example.com"
            required
          />
        </Field>
        <Field>
          <Input
            id="password"
            type="password"
            name="password"
            required
          />
        </Field>
        <Field>
          <Button
            disabled={fetcher.state !== 'idle'}
            type="submit"
          >
            Login
          </Button>
        </Field>
      </FieldGroup>
      {fetcher.data && !fetcher.data?.success && (
        <p className="mt-4 text-center text-sm text-red-500">
          {fetcher.data?.errorMsg || 'Login failed. Check credentials and try again.'}
        </p>
      )}
    </fetcher.Form>
  );
}
