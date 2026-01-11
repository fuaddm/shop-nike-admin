import { Check, ChevronsUpDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function CategoryComboBox({
  categories,
  inputName = 'category',
  value,
  onChange,
  disabled = false,
  placeholder = 'Select value...',
  searchPlaceholder = 'Search value...',
  emptyText = 'No value found.',
}: {
  categories: { id: string | number; name: string }[];
  inputName?: string;

  /** Controlled value (id as string/number). If omitted, component is uncontrolled. */
  value?: string | number;
  onChange?: (nextId: string) => void;

  disabled?: boolean;

  /** Optional UI text overrides */
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);

  // Uncontrolled internal state fallback
  const [internalValue, setInternalValue] = useState<string>('');
  const isControlled = value !== undefined;

  const currentValue = isControlled ? String(value) : internalValue;

  // If options change and current selection no longer exists, clear it
  useEffect(() => {
    if (!currentValue) return;
    const exists = categories.some((c) => String(c.id) === currentValue);
    if (!exists) {
      if (isControlled) onChange?.('');
      else setInternalValue('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const selectedLabel = useMemo(() => {
    return categories.find((c) => String(c.id) === currentValue)?.name ?? '';
  }, [categories, currentValue]);

  const setNextValue = (nextId: string) => {
    if (isControlled) onChange?.(nextId);
    else setInternalValue(nextId);
  };

  return (
    <>
      {/* Always post the selected id to the form */}
      <input
        type="hidden"
        name={inputName}
        value={currentValue}
      />

      <Popover
        open={open}
        onOpenChange={(next) => {
          if (disabled) return;
          setOpen(next);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn('w-full justify-between', disabled && 'opacity-60')}
          >
            {currentValue ? selectedLabel : placeholder}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          data-align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {categories.map((category) => {
                  const idStr = String(category.id);
                  return (
                    <CommandItem
                      key={idStr}
                      value={String(category.name)}
                      onSelect={() => {
                        // toggle off if same selected
                        const nextId = currentValue === idStr ? '' : idStr;
                        setNextValue(nextId);
                        setOpen(false);
                      }}
                    >
                      {category.name}
                      <Check className={cn('ml-auto', currentValue === idStr ? 'opacity-100' : 'opacity-0')} />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
