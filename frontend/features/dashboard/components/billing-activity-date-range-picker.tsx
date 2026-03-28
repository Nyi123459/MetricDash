"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/common/components/ui/button";
import { Calendar } from "@/common/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover";
import { cn } from "@/common/lib/utils";

type BillingActivityDateRangePickerProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  maxDate: Date;
};

export function BillingActivityDateRangePicker({
  value,
  onChange,
  maxDate,
}: BillingActivityDateRangePickerProps) {
  const label =
    value.from && value.to
      ? `${format(value.from, "MMM d, yyyy")} - ${format(value.to, "MMM d, yyyy")}`
      : "Pick a date range";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-12 w-full justify-start rounded-2xl bg-white text-left font-medium text-slate-950 sm:w-auto sm:min-w-[280px]",
            !(value.from && value.to) && "text-slate-500",
          )}
        >
          <CalendarIcon className="size-4 text-slate-500" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <Calendar
          mode="range"
          defaultMonth={value.to ?? value.from ?? maxDate}
          selected={value}
          onSelect={(nextRange) => {
            if (nextRange?.from && nextRange.to) {
              onChange(nextRange);
            }
          }}
          disabled={(date) => date > maxDate}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
