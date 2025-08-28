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
    <div className="bg-white rounded-2xl shadow-xl border-0 p-6">
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
            <ChevronLeft className={cn("h-5 w-5 text-gray-600 hover:text-blue-600 transition-colors", className)} {...props} />
          ),
          IconRight: ({ className, ...props }) => (
            <ChevronRight className={cn("h-5 w-5 text-gray-600 hover:text-blue-600 transition-colors", className)} {...props} />
          ),
        }}
        {...props}
      />
      
      {/* Custom CSS for beautiful styling */}
      <style jsx>{`
        /* Container styling */
        :global(.rdp) {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #3b82f6;
          --rdp-background-color: #f8fafc;
          --rdp-accent-color-dark: #1d4ed8;
          --rdp-background-color-dark: #1e293b;
          --rdp-outline: 2px solid var(--rdp-accent-color);
          --rdp-outline-selected: 2px solid rgba(0, 0, 0, 0.75);
          margin: 0;
          padding: 0;
        }

        /* Month container */
        :global(.rdp-months) {
          display: flex;
          justify-content: center;
        }

        :global(.rdp-month) {
          background: white;
          border-radius: 16px;
          padding: 0;
          margin: 0;
        }

        /* Caption (month/year header) */
        :global(.rdp-caption) {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px 0;
          margin-bottom: 16px;
          position: relative;
        }

        :global(.rdp-caption_label) {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          text-transform: capitalize;
        }

        /* Navigation buttons */
        :global(.rdp-nav) {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          gap: 8px;
        }

        :global(.rdp-nav_button) {
          width: 32px;
          height: 32px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        :global(.rdp-nav_button:hover) {
          background: #f1f5f9;
          border-color: #cbd5e1;
          transform: scale(1.05);
        }

        :global(.rdp-nav_button_previous) {
          left: 0;
        }

        :global(.rdp-nav_button_next) {
          right: 0;
        }

        /* Table structure */
        :global(.rdp-table) {
          width: 100%;
          border-collapse: collapse;
        }

        /* Header row */
        :global(.rdp-head_row) {
          display: flex;
          margin-bottom: 8px;
        }

        :global(.rdp-head_cell) {
          width: var(--rdp-cell-size);
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Data rows */
        :global(.rdp-row) {
          display: flex;
          margin-bottom: 4px;
        }

        :global(.rdp-cell) {
          width: var(--rdp-cell-size);
          height: var(--rdp-cell-size);
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
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        :global(.rdp-day:hover) {
          background: #eff6ff;
          color: #1d4ed8;
          transform: scale(1.1);
        }

        :global(.rdp-day:focus) {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Selected day */
        :global(.rdp-day_selected) {
          background: #3b82f6 !important;
          color: white !important;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          transform: scale(1.05);
        }

        :global(.rdp-day_selected:hover) {
          background: #2563eb !important;
          transform: scale(1.1);
        }

        /* Today */
        :global(.rdp-day_today) {
          background: #dbeafe;
          color: #1d4ed8;
          font-weight: 600;
          border: 2px solid #3b82f6;
        }

        /* Outside month days */
        :global(.rdp-day_outside) {
          color: #94a3b8;
          opacity: 0.6;
        }

        /* Disabled/past days */
        :global(.rdp-day_disabled) {
          color: #cbd5e1;
          background: #f8fafc;
          cursor: not-allowed;
          text-decoration: line-through;
          opacity: 0.6;
        }

        :global(.rdp-day_disabled:hover) {
          background: #f8fafc;
          transform: none;
          color: #cbd5e1;
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
