import { Form } from 'react-router';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export function AddNewCategory() {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add new Category</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Category</DialogTitle>
            <DialogDescription>Add new "Category"</DialogDescription>
          </DialogHeader>
          <Form
            method="POST"
            navigate={false}
          >
            <input
              type="hidden"
              name="actionMethod"
              value="add"
            />
            <div className="mb-4 grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="name-1">Name</Label>
                <Input
                  id="name-1"
                  name="name"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit">Save</Button>
              </DialogClose>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
