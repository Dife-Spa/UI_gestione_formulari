// components/ui/date-range-picker.tsx
"use client"

import * as React from "react"
import { CalendarIcon, X } from "lucide-react"
import { addDays, format } from "date-fns"
import { it } from "date-fns/locale"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
 Popover,
 PopoverContent,
 PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
 className?: string
 onChange?: (range: DateRange | undefined) => void
}

export function DateRangePicker({
 className,
 onChange
}: DateRangePickerProps) {
 const [date, setDate] = React.useState<DateRange | undefined>()

 React.useEffect(() => {
   onChange?.(date)
 }, [date, onChange])

 const handleReset = () => {
   setDate(undefined)
   onChange?.(undefined)
 }

 return (
   <div className={cn("relative", className)}>
     <Popover>
       <PopoverTrigger asChild>
         <Button
           id="date"
           variant={"outline"}
           className={cn(
             "w-[300px] justify-start text-left font-normal",
             !date && "text-muted-foreground"
           )}
         >
           <CalendarIcon className="mr-2 h-4 w-4" />
           {date?.from ? (
             date.to ? (
               <>
                 {format(date.from, "dd/MM/yyyy")} -{" "}
                 {format(date.to, "dd/MM/yyyy")}
               </>
             ) : (
               format(date.from, "dd/MM/yyyy")
             )
           ) : (
             <span>Seleziona un intervallo</span>
           )}
         </Button>
       </PopoverTrigger>
       <PopoverContent className="w-auto p-0" align="start">
         <Calendar
           initialFocus
           mode="range"
           defaultMonth={date?.from}
           selected={date}
           onSelect={setDate}
           numberOfMonths={2}
           locale={it}
         />
       </PopoverContent>
     </Popover>
     {date && (
       <Button
         variant="ghost"
         size="icon"
         className="absolute right-0 top-0 h-full"
         onClick={handleReset}
       >
         <X className="h-4 w-4" />
       </Button>
     )}
   </div>
 )
}