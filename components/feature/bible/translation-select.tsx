"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, type TranslationOption } from "@/hooks/use-translations";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type TranslationSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  searchPlaceholder?: string;
  bookId?: string;
};

export function TranslationSelect({
  value,
  onChange,
  options,
  placeholder = "Select",
  className,
  buttonClassName,
  searchPlaceholder = "Search translations...",
  bookId,
}: TranslationSelectProps) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useTranslations(bookId);
  const resolvedOptions = useMemo(() => {
    if (options && options.length > 0) {
      return options;
    }
    const normalized = data.map((item: TranslationOption) => ({
      label: item.label,
      value: item.id,
    }));
    return normalized;
  }, [options, data]);
  const selected = useMemo(
    () => resolvedOptions.find((option) => option.value === value),
    [resolvedOptions, value],
  );
  const displayLabel = selected?.label ?? (value ? value.toUpperCase() : "");

  // Normalize to a valid option once options are available.
  useEffect(() => {
    if (resolvedOptions.length === 0) return;
    if (selected) return;
    onChange(resolvedOptions[0].value);
  }, [resolvedOptions, selected, onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-foreground",
            buttonClassName,
          )}
          aria-label="Translation"
        >
          <span
            className={cn(
              "min-w-0 flex-1 truncate",
              displayLabel ? "text-foreground" : "text-muted-foreground",
            )}
            title={displayLabel || placeholder}
          >
            {displayLabel || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-64 p-0", className)} align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading translations..." : "No translations found."}
            </CommandEmpty>
            <CommandGroup>
              {resolvedOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value}`}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      option.value === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
