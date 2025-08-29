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
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <style>{`
        /* Force selected day styling with maximum specificity */
        .rdp-day_selected,
        .rdp-day_selected:hover,
        .rdp-day_selected:focus {
          background-color: #2563eb !important;
          color: white !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }
        
        /* Force hover effects */
        .rdp-day:hover:not(.rdp-day_selected) {
          background-color: #eff6ff !important;
          color: #1d4ed8 !important;
        }
        
        /* Override any react-day-picker default styles */
        .rdp-day_selected.rdp-day {
          background-color: #2563eb !important;
          color: white !important;
        }
        
        /* Target the specific day element when selected */
        div[role="button"].rdp-day_selected {
          background-color: #2563eb !important;
          color: white !important;
          font-weight: 600 !important;
        }
      `}</style>
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
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 transition-colors hover:bg-blue-50 hover:text-blue-700 rounded-md",
          day_selected: "bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-md",
          day_today: "font-bold text-gray-900",
          day_outside: "text-gray-400",
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
        modifiers={{
          selected: (date) => props.selected === date,
        }}
        modifiersStyles={{
          selected: {
            backgroundColor: '#2563eb',
            color: 'white',
            fontWeight: '600',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }
        }}
        {...props}
      />
    </div>
  );
}

Calendar.displayName = "Calendar"

export { Calendar };

