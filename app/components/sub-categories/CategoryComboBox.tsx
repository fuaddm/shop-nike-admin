import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import type { Category } from '~/routes/categories';

export function CategoryComboBox({
  categories,
  inputName = 'category',
}: {
  categories: { id: string | number; name: string }[];
  inputName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  return (
    <>
      <input
        type="hidden"
        name={inputName}
        value={value}
      />
      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value ? categories.find((category) => String(category.id) === value)?.name : 'Select value...'}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          data-align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command>
            <CommandInput
              placeholder="Search value..."
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>No value found.</CommandEmpty>
              <CommandGroup>
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={String(category.name)}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? '' : String(category.id));
                      setOpen(false);
                    }}
                  >
                    {category.name}
                    <Check className={cn('ml-auto', value === String(category.id) ? 'opacity-100' : 'opacity-0')} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
