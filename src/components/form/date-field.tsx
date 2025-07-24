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
}

const DateField = ({
  control,
  name,
  label,
  placeholder = "Select date",
  className,
}: DateFieldProps) => {
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // Generate years (current year to 1950)
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1949 },
    (_, i) => currentYear - i
  );

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
                </div>

                {/* Traditional Calendar */}
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
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
