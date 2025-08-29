import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  // Remove any disabled prop to ensure all dates are clickable
  const { disabled, ...cleanProps } = props;
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("", className)}
        classNames={{
          // Only override what we need for visual appeal
          months: "flex justify-center",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center mb-4",
          caption_label: "text-lg font-semibold text-gray-900",
          nav: "absolute inset-0 flex items-center justify-between",
          nav_button: "h-8 w-8 bg-white border border-gray-300 rounded-md p-0 hover:bg-gray-50 hover:border-gray-400 transition-colors",
          nav_button_previous: "",
          nav_button_next: "",
          // DON'T override table, head_row, head_cell, row, cell - let default handle grid
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 transition-colors hover:bg-blue-50 hover:text-blue-700 rounded-md cursor-pointer",
          day_selected: "bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-md",
          day_today: "font-bold text-gray-900",
          day_outside: "text-gray-400 cursor-pointer",
          day_disabled: "text-gray-300 cursor-not-allowed",
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
        // Force all dates to be selectable by not passing any disabled prop
        disabled={false}
        // Add debug logging
        onDayClick={(day, modifiers) => {
          console.log('Day clicked:', day.toDateString(), 'Modifiers:', modifiers);
          if (cleanProps.onSelect) {
            cleanProps.onSelect(day);
          }
        }}
        {...cleanProps}
      />
    </div>
  );
}

Calendar.displayName = "Calendar"

export { Calendar };

