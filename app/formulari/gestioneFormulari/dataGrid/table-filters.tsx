// dataGrid/table-filters.tsx
import React, { useState, useEffect } from "react";
import { Table } from "@tanstack/react-table";
import { FormularioRecord } from "./types";
import DatePicker, { registerLocale } from "react-datepicker";
import { format, isValid } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar, Search, X } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

// Registra la localizzazione italiana
registerLocale("it", it);

interface TableFiltersProps {
  table: Table<FormularioRecord>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
}

export function TableFilters({
  table,
  globalFilter,
  setGlobalFilter,
}: TableFiltersProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Applica il filtro alla tabella quando cambiano le date
  useEffect(() => {
    if (startDate || endDate) {
      const filterValue = {
        from: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        to: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      };
      table.getColumn("dataEmissione")?.setFilterValue(filterValue);
    } else {
      table.getColumn("dataEmissione")?.setFilterValue(undefined);
    }
  }, [startDate, endDate, table]);

  // Formatta l'intervallo di date per la visualizzazione
  const formatDateRange = () => {
    if (!startDate && !endDate) return "Seleziona date";
    
    const formatDisplayDate = (date: Date | null) => {
      if (!date || !isValid(date)) return "";
      return format(date, "dd MMM", { locale: it });
    };
    
    if (startDate && endDate) {
      return `${formatDisplayDate(startDate)} — ${formatDisplayDate(endDate)}`;
    } else if (startDate) {
      return `Dal ${formatDisplayDate(startDate)}`;
    } else if (endDate) {
      return `Fino al ${formatDisplayDate(endDate)}`;
    }
    
    return "Seleziona date";
  };

  // Reset del filtro date
  const resetDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    table.getColumn("dataEmissione")?.setFilterValue(undefined);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Filtro globale */}
        <div>
          <label htmlFor="global-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Ricerca globale
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="global-filter"
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Cerca in tutti i campi..."
              className="pl-10 border border-gray-300 bg-white p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition-colors"
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Selettore di date avanzato */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtra per data di emissione
          </label>
          <div className="relative">
            <DatePicker
              selected={startDate}
              onChange={(dates) => {
                if (Array.isArray(dates)) {
                  const [start, end] = dates;
                  setStartDate(start);
                  setEndDate(end);
                }
              }}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              monthsShown={2}
              locale="it"
              dateFormat="dd/MM/yyyy"
              placeholderText="Seleziona un intervallo di date"
              popperClassName="z-[9999]"
              calendarClassName="shadow-lg rounded-md border border-gray-200"
              wrapperClassName="w-full"
              customInput={
                <div className="flex items-center justify-between w-full cursor-pointer px-3 py-2.5 border border-gray-300 rounded-md bg-white hover:border-blue-300 transition-colors">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                    <span className={startDate || endDate ? "text-gray-800" : "text-gray-500"}>
                      {formatDateRange()}
                    </span>
                  </div>
                  {(startDate || endDate) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        resetDateFilter();
                      }}
                      className="text-gray-400 hover:text-gray-600"
                      title="Cancella date"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Pulsante per reimpostare tutti i filtri */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setGlobalFilter("");
            resetDateFilter();
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
        >
          Reimposta tutti i filtri
        </button>
      </div>

      {/* CSS personalizzato per il datepicker */}
      <style jsx global>{`
        .react-datepicker-wrapper {
          width: 100%;
        }
        
        .react-datepicker-popper {
          z-index: 9999 !important;
        }

        .react-datepicker {
          font-family: inherit;
          border-radius: 0.375rem;
          border: 1px solid #e5e7eb;
        }

        .react-datepicker__header {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .react-datepicker__day-name, 
        .react-datepicker__day {
          width: 2rem;
          line-height: 2rem;
          margin: 0.2rem;
        }

        .react-datepicker__day--selected,
        .react-datepicker__day--in-selecting-range,
        .react-datepicker__day--in-range {
          background-color: #3b82f6;
          border-radius: 0.375rem;
        }

        .react-datepicker__day--keyboard-selected {
          background-color: rgba(59, 130, 246, 0.5);
          border-radius: 0.375rem;
        }

        .react-datepicker__day:hover {
          background-color: #f3f4f6;
          border-radius: 0.375rem;
        }

        .react-datepicker__day--in-selecting-range:not(.react-datepicker__day--in-range) {
          background-color: rgba(59, 130, 246, 0.5);
        }

        .react-datepicker__current-month {
          font-size: 1rem;
          font-weight: 500;
        }

        .react-datepicker__navigation {
          top: 0.8rem;
        }

        .react-datepicker__month-container {
          float: left;
          border-right: 1px solid #e5e7eb;
        }

        .react-datepicker__month-container:last-child {
          border-right: none;
        }
      `}</style>
    </div>
  );
}