"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type CategoryOption = {
  id: string;
  name: string;
  icon?: string | null;
};

interface CategoryComboboxProps {
  categories: CategoryOption[];
  value: string | null | undefined;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  allowClear?: boolean;
  clearLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function CategoryCombobox({
  categories,
  value,
  onValueChange,
  placeholder = "Seleccionar categoría...",
  emptyMessage = "No se encontraron categorías.",
  searchPlaceholder = "Buscar categoría...",
  allowClear = true,
  clearLabel = "Sin categoría",
  disabled = false,
  className,
}: Readonly<CategoryComboboxProps>) {
  const [open, setOpen] = React.useState(false);

  const selectedCategory = React.useMemo(
    () => categories.find((cat) => cat.id === value),
    [categories, value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between bg-background border-border text-foreground hover:bg-accent",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {selectedCategory ? (
              <>
                {selectedCategory.icon && (
                  <span className="mr-2">{selectedCategory.icon}</span>
                )}
                {selectedCategory.name}
              </>
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {allowClear && (
                <CommandItem
                  value="__clear__"
                  onSelect={() => {
                    onValueChange(null);
                    setOpen(false);
                  }}
                  className="text-muted-foreground"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {clearLabel}
                </CommandItem>
              )}
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={`${category.name} ${category.icon || ""}`}
                  onSelect={() => {
                    onValueChange(category.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === category.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {category.icon && (
                    <span className="mr-2">{category.icon}</span>
                  )}
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
