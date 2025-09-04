import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Control } from "react-hook-form";
import { cn } from "@/lib/utils";

interface DateFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  className?: string;
  allowFuture?: boolean; // Thêm prop này
  minDate?: Date; // Thêm prop để set minimum date
  maxDate?: Date; // Thêm prop để set maximum date
}

const DateField = ({
  control,
  name,
  label,
  placeholder = "Select date",
  className,
  allowFuture = false, // Default false để backward compatibility
  minDate,
  maxDate,
}: DateFieldProps) => {
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // Generate years - điều chỉnh range dựa trên allowFuture
  const currentYear = new Date().getFullYear();
  const startYear = allowFuture ? 1950 : 1950;
  const endYear = allowFuture ? currentYear + 10 : currentYear; // Cho phép 10 năm tương lai
  
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => endYear - i
  );

  // Function to determine disabled dates
  const getDisabledDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only dates
    
    let isDisabled = false;
    
    // Check minimum date
    if (minDate) {
      const minDateOnly = new Date(minDate);
      minDateOnly.setHours(0, 0, 0, 0);
      isDisabled = isDisabled || date < minDateOnly;
    }
    
    // Check maximum date
    if (maxDate) {
      const maxDateOnly = new Date(maxDate);
      maxDateOnly.setHours(0, 0, 0, 0);
      isDisabled = isDisabled || date > maxDateOnly;
    }
    
    // Check future dates if not allowed
    if (!allowFuture) {
      isDisabled = isDisabled || date > today;
    }
    
    // Check very old dates
    isDisabled = isDisabled || date < new Date("1900-01-01");
    
    return isDisabled;
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        useEffect(() => {
          if (field.value) {
            setCalendarMonth(new Date(field.value));
          }
        }, [field.value]);
        
        return (
          <FormItem className="flex flex-col">
            <FormLabel className="text-sm font-semibold">{label}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                      className
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>{placeholder}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                {/* Quick Selection */}
                <div className="p-3 border-b bg-slate-50">
                  <div className="text-sm font-medium mb-3">
                    Quick Date Selection
                  </div>
                  <div className="space-y-2">
                    {/* Year Selection */}
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">
                        Year
                      </label>
                      <Select
                        value={
                          field.value
                            ? field.value.getFullYear().toString()
                            : ""
                        }
                        onValueChange={(year) => {
                          const newDate = field.value
                            ? new Date(field.value)
                            : new Date();
                          newDate.setFullYear(parseInt(year));
                          field.onChange(newDate);
                        }}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Month Selection */}
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">
                        Month
                      </label>
                      <Select
                        value={
                          field.value ? field.value.getMonth().toString() : ""
                        }
                        onValueChange={(month) => {
                          const newDate = field.value
                            ? new Date(field.value)
                            : new Date();
                          newDate.setMonth(parseInt(month));
                          field.onChange(newDate);
                        }}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "January",
                            "February", 
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December",
                          ].map((monthName, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {monthName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Quick Date Buttons cho coupon */}
                  {allowFuture && (
                    <div className="mt-3 pt-3 border-t">
                      <label className="text-xs text-slate-600 block mb-2">
                        Quick Selection
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => {
                            const date = new Date();
                            date.setDate(date.getDate() + 7);
                            field.onChange(date);
                          }}
                        >
                          +1 Week
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => {
                            const date = new Date();
                            date.setMonth(date.getMonth() + 1);
                            field.onChange(date);
                          }}
                        >
                          +1 Month
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => {
                            const date = new Date();
                            date.setMonth(date.getMonth() + 3);
                            field.onChange(date);
                          }}
                        >
                          +3 Months
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => {
                            const date = new Date();
                            date.setFullYear(date.getFullYear() + 1);
                            field.onChange(date);
                          }}
                        >
                          +1 Year
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Traditional Calendar */}
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  disabled={getDisabledDate}
                  initialFocus
                  className="p-3"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default DateField;