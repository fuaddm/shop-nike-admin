// app/components/login-form.tsx
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import type { FetcherWithComponents } from 'react-router';
import type { ActionResult } from '~/routes/login'; // adjust path if needed

type Props = {
  className?: string;
  fetcher: FetcherWithComponents<ActionResult>;
};

export function LoginForm({ className, fetcher }: Props) {
  return (
    <fetcher.Form
      method="post"
      className={cn('mx-auto flex max-w-xs flex-col gap-6', className)}
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
            autoComplete="email"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
          />
        </Field>

        <Field>
          <Button
            disabled={fetcher.state !== 'idle'}
            type="submit"
          >
            {fetcher.state !== 'idle' ? 'Logging in…' : 'Login'}
          </Button>
        </Field>
      </FieldGroup>

      {fetcher.data?.success === false && (
        <p className="mt-4 text-center text-sm text-red-500">{fetcher.data.errorMsg}</p>
      )}
    </fetcher.Form>
  );
}
