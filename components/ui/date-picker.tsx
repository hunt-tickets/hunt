"use client"
import { DatePicker } from "@ark-ui/react/date-picker"
import { Portal } from "@ark-ui/react/portal"
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react"

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
}

export const HuntDatePicker = ({ value, onChange, placeholder = "Selecciona una fecha", name }: DatePickerProps) => {
  // Calculate max date (12 years ago from today)
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());

  // Calculate min date (100 years before max date)
  const minDate = new Date(maxDate.getFullYear() - 100, maxDate.getMonth(), maxDate.getDate());

  return (
    <DatePicker.Root
      name={name}
      value={value ? ([value] as unknown as Parameters<typeof DatePicker.Root>[0]['value']) : undefined}
      min={minDate.toISOString().split('T')[0] as unknown as Parameters<typeof DatePicker.Root>[0]['min']}
      max={maxDate.toISOString().split('T')[0] as unknown as Parameters<typeof DatePicker.Root>[0]['max']}
      onValueChange={(details) => {
        if (details.valueAsString && details.valueAsString.length > 0) {
          onChange?.(details.valueAsString[0]);
        }
      }}
      positioning={{ sameWidth: true }}
    >
      {/* Input + Controls */}
      <DatePicker.Control className="flex items-center gap-2 rounded-2xl border dark:border-[#303030] bg-foreground/5 backdrop-blur-sm px-4 py-4 transition-colors focus-within:border-primary/50 focus-within:bg-primary/5">
        <DatePicker.Trigger className="flex-1 flex items-center cursor-pointer">
          <DatePicker.Input
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground cursor-pointer"
            placeholder={placeholder}
            readOnly
          />
        </DatePicker.Trigger>
        <DatePicker.Trigger className="p-1 rounded-lg hover:bg-background/50 transition-colors">
          <Calendar size={18} className="text-muted-foreground" />
        </DatePicker.Trigger>
        <DatePicker.ClearTrigger className="p-1 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
          <X size={16} />
        </DatePicker.ClearTrigger>
      </DatePicker.Control>

      {/* Calendar Popup */}
      <Portal>
        <DatePicker.Positioner>
          <DatePicker.Content className="mt-2 w-full max-w-sm rounded-2xl border dark:border-[#303030] bg-background/95 backdrop-blur-xl shadow-2xl p-4 z-50">

            {/* Year + Month Select */}
            <div className="flex gap-2 mb-4">
              <DatePicker.YearSelect className="flex-1 rounded-xl border dark:border-[#303030] bg-foreground/5 backdrop-blur-sm px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 transition-colors" />
              <DatePicker.MonthSelect className="flex-1 rounded-xl border dark:border-[#303030] bg-foreground/5 backdrop-blur-sm px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 transition-colors" />
            </div>

            {/* Day View */}
            <DatePicker.View view="day">
              <DatePicker.Context>
                {(datePicker) => (
                  <>
                    <DatePicker.ViewControl className="flex justify-between items-center mb-3 text-sm font-medium text-foreground">
                      <DatePicker.PrevTrigger className="p-2 rounded-lg hover:bg-foreground/10 dark:hover:bg-foreground/5 transition-colors">
                        <ChevronLeft size={18} />
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger className="cursor-pointer px-3 py-1.5 rounded-lg hover:bg-foreground/10 dark:hover:bg-foreground/5 transition-colors">
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger className="p-2 rounded-lg hover:bg-foreground/10 dark:hover:bg-foreground/5 transition-colors">
                        <ChevronRight size={18} />
                      </DatePicker.NextTrigger>
                    </DatePicker.ViewControl>

                    <DatePicker.Table className="w-full text-center text-sm">
                      <DatePicker.TableHead>
                        <DatePicker.TableRow>
                          {datePicker.weekDays.map((weekDay, id) => (
                            <DatePicker.TableHeader
                              key={id}
                              className="py-2 text-xs font-medium text-muted-foreground"
                            >
                              {weekDay.short}
                            </DatePicker.TableHeader>
                          ))}
                        </DatePicker.TableRow>
                      </DatePicker.TableHead>
                      <DatePicker.TableBody>
                        {datePicker.weeks.map((week, id) => (
                          <DatePicker.TableRow key={id}>
                            {week.map((day, id) => (
                              <DatePicker.TableCell key={id} value={day}>
                                <DatePicker.TableCellTrigger
                                  className="w-10 h-10 flex items-center justify-center rounded-lg text-sm hover:bg-primary/20 data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[today]:border data-[today]:border-primary/50 data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed data-[disabled]:hover:bg-transparent data-[outside-range]:opacity-30 data-[outside-range]:cursor-not-allowed data-[outside-range]:hover:bg-transparent transition-colors"
                                >
                                  {day.day}
                                </DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>

            {/* Month View */}
            <DatePicker.View view="month">
              <DatePicker.Context>
                {(datePicker) => (
                  <>
                    <DatePicker.ViewControl className="flex justify-between items-center mb-3">
                      <DatePicker.PrevTrigger className="p-2 rounded-lg hover:bg-foreground/10 dark:hover:bg-foreground/5 transition-colors">
                        <ChevronLeft size={18} />
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger className="cursor-pointer px-3 py-1.5 rounded-lg hover:bg-foreground/10 dark:hover:bg-foreground/5 transition-colors">
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger className="p-2 rounded-lg hover:bg-foreground/10 dark:hover:bg-foreground/5 transition-colors">
                        <ChevronRight size={18} />
                      </DatePicker.NextTrigger>
                    </DatePicker.ViewControl>
                    <DatePicker.Table className="w-full text-sm">
                      <DatePicker.TableBody>
                        {datePicker.getMonthsGrid({ columns: 4, format: "short" }).map((months, id) => (
                          <DatePicker.TableRow key={id}>
                            {months.map((month, id) => (
                              <DatePicker.TableCell key={id} value={month.value}>
                                <DatePicker.TableCellTrigger className="px-3 py-2 rounded-lg hover:bg-primary/20 data-[selected]:bg-primary data-[selected]:text-primary-foreground transition-colors">
                                  {month.label}
                                </DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>

            {/* Year View */}
            <DatePicker.View view="year">
              <DatePicker.Context>
                {(datePicker) => (
                  <>
                    <DatePicker.ViewControl className="flex justify-between items-center mb-3">
                      <DatePicker.PrevTrigger className="p-2 rounded-lg hover:bg-foreground/10 dark:hover:bg-foreground/5 transition-colors">
                        <ChevronLeft size={18} />
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger className="cursor-pointer px-3 py-1.5 rounded-lg hover:bg-foreground/10 dark:hover:bg-foreground/5 transition-colors">
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger className="p-2 rounded-lg hover:bg-foreground/10 dark:hover:bg-foreground/5 transition-colors">
                        <ChevronRight size={18} />
                      </DatePicker.NextTrigger>
                    </DatePicker.ViewControl>
                    <DatePicker.Table className="w-full text-sm">
                      <DatePicker.TableBody>
                        {datePicker.getYearsGrid({ columns: 4 }).map((years, id) => (
                          <DatePicker.TableRow key={id}>
                            {years.map((year, id) => (
                              <DatePicker.TableCell key={id} value={year.value}>
                                <DatePicker.TableCellTrigger className="px-3 py-2 rounded-lg hover:bg-primary/20 data-[selected]:bg-primary data-[selected]:text-primary-foreground transition-colors">
                                  {year.label}
                                </DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal>
    </DatePicker.Root>
  )
}