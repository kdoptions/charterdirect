import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "./calendar.css"

import { cn } from "@/lib/utils"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  // Debug logging
  console.log('Calendar props:', props);
  console.log('Calendar classNames:', classNames);
    return (
    <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center mb-4",
          caption_label: "text-lg font-bold text-gray-900",
          nav: "space-x-1 flex items-center",
          nav_button: "h-8 w-8 bg-gray-200 hover:bg-gray-300 rounded-md p-0 transition-colors",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse",
          head_row: "flex",
          head_cell: "text-gray-600 font-medium text-sm uppercase tracking-wide pb-2 px-1 w-9",
          row: "flex w-full mt-1",
          cell: "text-center p-0 relative w-9 h-9",
          day: "h-9 w-9 p-0 font-normal hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          day_selected: "!bg-blue-500 !text-white hover:!bg-blue-600 font-semibold shadow-md transform scale-105 transition-transform duration-200",
          day_today: "bg-gray-200 text-gray-900 font-medium",
          day_outside: "text-gray-400",
          day_disabled: "text-gray-300 cursor-not-allowed",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
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
        }}
        {...props}
      />
    </div>
  );
}
Calendar.displayName = "Calendar"

export { Calendar }
