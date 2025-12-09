"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
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

interface CategoryFilterComboboxProps {
  categories: CategoryOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  allLabel?: string;
  noCategoryLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function CategoryFilterCombobox({
  categories,
  value,
  onValueChange,
  placeholder = "Filtrar por categoría...",
  emptyMessage = "No se encontraron categorías.",
  searchPlaceholder = "Buscar categoría...",
  allLabel = "Todas las categorías",
  noCategoryLabel = "Sin categoría",
  disabled = false,
  className,
}: Readonly<CategoryFilterComboboxProps>) {
  const [open, setOpen] = React.useState(false);

  const getDisplayText = React.useMemo(() => {
    if (value === "all") return allLabel;
    if (value === "sin-categoria") return noCategoryLabel;
    const category = categories.find((cat) => cat.id === value);
    if (category) {
      return (
        <>
          {category.icon && <span className="mr-2">{category.icon}</span>}
          {category.name}
        </>
      );
    }
    return placeholder;
  }, [value, categories, allLabel, noCategoryLabel, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full sm:w-[280px] justify-between bg-background border-border text-foreground hover:bg-accent",
            className
          )}
        >
          <span className="flex items-center truncate">
            <Filter className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            {getDisplayText}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] sm:w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__all__"
                onSelect={() => {
                  onValueChange("all");
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "all" ? "opacity-100" : "opacity-0"
                  )}
                />
                {allLabel}
              </CommandItem>
              <CommandItem
                value="__sin-categoria__"
                onSelect={() => {
                  onValueChange("sin-categoria");
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "sin-categoria" ? "opacity-100" : "opacity-0"
                  )}
                />
                {noCategoryLabel}
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Categorías">
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
