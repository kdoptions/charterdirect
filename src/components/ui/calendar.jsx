import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    (<DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 bg-white rounded-xl shadow-lg border-0 p-6",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-lg font-semibold text-gray-900",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-white border-gray-300 p-0 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex mb-2",
        head_cell:
          "text-gray-600 rounded-md w-8 font-medium text-sm uppercase tracking-wide",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-30 bg-gray-100 line-through",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
        Day: ({ date, displayMonth, ...props }) => {
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <button
              {...props}
              className={cn(
                "relative h-9 w-9 p-0 font-normal transition-all duration-200 rounded-md",
                "hover:bg-blue-50 hover:border-blue-200 hover:scale-105",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "border border-transparent",
                isPast && "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100 hover:scale-100 border-gray-200",
                isToday && "bg-blue-100 text-blue-700 font-semibold border-2 border-blue-400 shadow-sm",
                props.className
              )}
              style={{
                textDecoration: isPast ? 'line-through' : 'none',
                opacity: isPast ? 0.7 : 1,
              }}
              disabled={isPast}
            >
              <span className="relative z-10">{date.getDate()}</span>
              {isPast && (
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-gray-50 opacity-30 rounded-md" />
              )}
            </button>
          );
        },
      }}
      {...props} />)
  );
}
Calendar.displayName = "Calendar"

export { Calendar }
