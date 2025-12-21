import type { Route } from '.react-router/types/app/routes/+types/new-content';
import MDEditor from '@uiw/react-md-editor';
import { useEffect, useState } from 'react';
import { redirect, useFetcher } from 'react-router';
import { toast } from 'sonner';
import { mainAPI } from '~/api/config';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const name = formData.get('name');
  const title = formData.get('title');
  const content = formData.get('content');

  try {
    const token = sessionStorage.getItem('token');
    await mainAPI.post(
      '/help/content',
      {
        name,
        title,
        content,
      },
      {
        headers: { token },
      }
    );

    return redirect('/contents');
  } catch (e) {
    return { success: false };
  }
}

export default function NewContent() {
  const [value, setValue] = useState('');

  const fetcher = useFetcher();

  const isSubmitting = fetcher.state !== 'idle';

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data && fetcher.data.success === false) {
      toast.error('There is already content with the same name');
    }
  }, [fetcher]);

  return (
    <div className="px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="text-3xl font-semibold">New Content</div>
      </div>
      <fetcher.Form
        method="POST"
        className="grid gap-4"
      >
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input
            disabled={isSubmitting}
            name="name"
            placeholder="name"
          />
        </div>
        <div className="grid gap-2">
          <Label>Title</Label>
          <Input
            disabled={isSubmitting}
            name="title"
            placeholder="title"
          />
        </div>
        <div className="grid gap-2">
          <Label>Content</Label>
          <MDEditor
            value={value}
            onChange={setValue}
            height={600}
          />
        </div>
        <input
          type="hidden"
          name="content"
          value={value}
        />
        <Button
          disabled={isSubmitting}
          type="submit"
          className="w-fit disabled:opacity-70"
        >
          Submit
        </Button>
      </fetcher.Form>
    </div>
  );
}
