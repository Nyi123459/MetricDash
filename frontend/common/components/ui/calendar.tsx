"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { buttonVariants } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";

type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: cn("w-full", defaultClassNames.root),
        months: "flex flex-col gap-4 sm:flex-row",
        month: "flex w-full flex-col gap-4",
        month_caption: "relative flex h-8 items-center justify-center",
        caption_label: "text-sm font-medium text-slate-950",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "size-8 rounded-xl bg-white p-0 opacity-80 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "size-8 rounded-xl bg-white p-0 opacity-80 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 rounded-md text-[0.8rem] font-medium text-slate-500",
        weeks: "mt-2 flex flex-col gap-2",
        week: "flex w-full",
        day: "relative h-9 w-9 p-0 text-center text-sm [&:has([aria-selected].day-range-end)]:rounded-r-xl [&:has([aria-selected].day-outside)]:bg-sky-50/50 [&:has([aria-selected])]:bg-sky-50 first:[&:has([aria-selected])]:rounded-l-xl last:[&:has([aria-selected])]:rounded-r-xl focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "size-9 rounded-xl p-0 font-normal aria-selected:opacity-100",
        ),
        selected:
          "bg-sky-600 text-white hover:bg-sky-600 hover:text-white focus:bg-sky-600 focus:text-white",
        today: "bg-slate-100 text-slate-950",
        outside:
          "text-slate-400 opacity-50 aria-selected:bg-sky-50 aria-selected:text-slate-400 aria-selected:opacity-30",
        disabled: "text-slate-400 opacity-50",
        range_middle: "aria-selected:bg-sky-50 aria-selected:text-slate-950",
        range_start:
          "aria-selected:bg-sky-600 aria-selected:text-white aria-selected:hover:bg-sky-600",
        range_end:
          "aria-selected:bg-sky-600 aria-selected:text-white aria-selected:hover:bg-sky-600",
        hidden: "invisible",
        chevron: "size-4 text-slate-500",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className, ...iconProps }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;

          return <Icon className={cn("size-4", className)} {...iconProps} />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
