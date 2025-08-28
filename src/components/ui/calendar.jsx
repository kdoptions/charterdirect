import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("", className)}
        classNames={{
          // Minimal styling - let our custom CSS handle everything
          months: "",
          month: "",
          caption: "",
          caption_label: "",
          nav: "",
          nav_button: "",
          nav_button_previous: "",
          nav_button_next: "",
          table: "",
          head_row: "",
          head_cell: "",
          row: "",
          cell: "",
          day: "",
          day_range_start: "",
          day_range_end: "",
          day_selected: "",
          day_today: "",
          day_outside: "",
          day_disabled: "",
          day_range_middle: "",
          day_hidden: "",
          ...classNames,
        }}
        components={{
          IconLeft: ({ className, ...props }) => (
            <ChevronLeft className={cn("h-4 w-4 text-gray-600 hover:text-blue-600 transition-colors", className)} {...props} />
          ),
          IconRight: ({ className, ...props }) => (
            <ChevronRight className={cn("h-4 w-4 text-gray-600 hover:text-blue-600 transition-colors", className)} {...props} />
          ),
        }}
        {...props}
      />
      
      {/* Custom CSS for clean, grid-based calendar */}
      <style jsx>{`
        /* Reset all default styles */
        :global(.rdp) {
          margin: 0;
          padding: 0;
          font-family: inherit;
        }

        /* Month container */
        :global(.rdp-months) {
          display: flex;
          justify-content: center;
        }

        :global(.rdp-month) {
          width: 100%;
        }

        /* Caption (month/year header) */
        :global(.rdp-caption) {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 0 16px 0;
          margin-bottom: 16px;
          position: relative;
        }

        :global(.rdp-caption_label) {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }

        /* Navigation buttons */
        :global(.rdp-nav) {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          gap: 4px;
        }

        :global(.rdp-nav_button) {
          width: 28px;
          height: 28px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        :global(.rdp-nav_button:hover) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        :global(.rdp-nav_button_previous) {
          left: 0;
        }

        :global(.rdp-nav_button_next) {
          right: 0;
        }

        /* Table structure - CRITICAL for grid layout */
        :global(.rdp-table) {
          width: 100%;
          border-collapse: collapse;
        }

        /* Header row */
        :global(.rdp-head_row) {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          margin-bottom: 8px;
        }

        :global(.rdp-head_cell) {
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px dotted #d1d5db;
        }

        /* Data rows */
        :global(.rdp-row) {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          margin-bottom: 1px;
        }

        :global(.rdp-cell) {
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        /* Day buttons */
        :global(.rdp-day) {
          width: 100%;
          height: 100%;
          border: none;
          background: transparent;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        :global(.rdp-day:hover) {
          background: #f3f4f6;
        }

        :global(.rdp-day:focus) {
          outline: 2px solid #3b82f6;
          outline-offset: 1px;
        }

        /* Selected day - BLUE like in your image */
        :global(.rdp-day_selected) {
          background: #3b82f6 !important;
          color: white !important;
          font-weight: 600;
        }

        :global(.rdp-day_selected:hover) {
          background: #2563eb !important;
        }

        /* Today */
        :global(.rdp-day_today) {
          font-weight: 600;
          color: #1f2937;
        }

        /* Outside month days - light gray */
        :global(.rdp-day_outside) {
          color: #9ca3af;
          opacity: 0.7;
        }

        /* Weekend days - RED like in your image */
        :global(.rdp-day[aria-label*="Sunday"],
                .rdp-day[aria-label*="Saturday"]) {
          color: #dc2626;
        }

        /* Disabled/past days */
        :global(.rdp-day_disabled) {
          color: #9ca3af;
          cursor: not-allowed;
          opacity: 0.6;
        }

        :global(.rdp-day_disabled:hover) {
          background: transparent;
        }

        /* Range selection */
        :global(.rdp-day_range_start) {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }

        :global(.rdp-day_range_end) {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }

        :global(.rdp-day_range_middle) {
          border-radius: 0;
          background: #eff6ff;
          color: #1d4ed8;
        }

        /* Hidden days */
        :global(.rdp-day_hidden) {
          visibility: hidden;
        }
      `}</style>
    </div>
  );
}

Calendar.displayName = "Calendar"

export { Calendar }
