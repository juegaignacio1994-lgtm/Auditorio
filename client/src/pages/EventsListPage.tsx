import React, { useState } from "react";
import { Link } from "wouter";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  startOfWeek,
  endOfWeek
} from "date-fns";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  MapPin
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEvents, EventType, CalendarEvent } from "@/lib/events-context";
import { cn } from "@/lib/utils";

const eventTypeColors: Record<EventType, string> = {
  meeting: "bg-blue-100 text-blue-700 border-blue-200",
  personal: "bg-green-100 text-green-700 border-green-200",
  work: "bg-purple-100 text-purple-700 border-purple-200",
  reminder: "bg-orange-100 text-orange-700 border-orange-200",
};

const eventTypeDotColors: Record<EventType, string> = {
  meeting: "bg-blue-500",
  personal: "bg-green-500",
  work: "bg-purple-500",
  reminder: "bg-orange-500",
};

export default function EventsListPage() {
  const { events } = useEvents();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className="min-h-screen bg-background/50 p-4 md:p-8 font-sans flex justify-center">
      <div className="w-full max-w-6xl flex flex-col gap-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/50"
        >
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">Full Calendar</h1>
              <p className="text-muted-foreground text-sm">View all your activities at a glance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white/50 rounded-full p-1 border border-border/60">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-full h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-full h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Calendar Grid */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 border border-white/50 overflow-hidden flex flex-col flex-1"
        >
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-border/40 bg-white/40">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-4 text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          
          {/* Days Grid */}
          <div className="grid grid-cols-7 grid-rows-5 sm:grid-rows-6 flex-1 min-h-[600px]">
            {calendarDays.map((day, dayIdx) => {
              const dayEvents = getEventsForDay(day);
              const isSelectedMonth = isSameMonth(day, monthStart);
              const isTodayDate = isToday(day);

              return (
                <div 
                  key={day.toString()}
                  className={cn(
                    "min-h-[120px] border-b border-r border-border/40 p-2 transition-colors hover:bg-white/60 flex flex-col gap-1",
                    !isSelectedMonth && "bg-muted/20 text-muted-foreground/50",
                    dayIdx % 7 === 6 && "border-r-0" // Remove right border for last column
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className={cn(
                      "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                      isTodayDate ? "bg-primary text-white" : "text-muted-foreground"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-muted-foreground/70 bg-white/50 px-1.5 py-0.5 rounded-full">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1 mt-1 overflow-y-auto custom-scrollbar max-h-[100px]">
                    {dayEvents.map(event => (
                      <Popover key={event.id}>
                        <PopoverTrigger asChild>
                          <button className={cn(
                            "text-left text-xs px-2 py-1 rounded-md truncate border w-full transition-all hover:scale-[1.02] hover:shadow-sm",
                            eventTypeColors[event.type]
                          )}>
                            <span className="font-semibold mr-1">{event.startTime}</span>
                            {event.title}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 rounded-2xl overflow-hidden border-border/50 shadow-xl backdrop-blur-xl bg-white/90">
                          <div className={cn("h-2 w-full", eventTypeDotColors[event.type].replace("bg-", "bg-opacity-50 bg-"))} />
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-lg">{event.title}</h3>
                              <Badge variant="outline" className={cn("capitalize", eventTypeColors[event.type])}>
                                {event.type}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 text-sm text-muted-foreground mb-4">
                               <div className="flex items-center gap-2">
                                 <Clock className="h-4 w-4 text-primary" />
                                 <span>{format(event.date, 'EEEE, MMMM do')}</span>
                               </div>
                               <div className="flex items-center gap-2 pl-6 text-xs">
                                 <span>{event.startTime} - {event.endTime}</span>
                               </div>
                               {event.location && (
                                 <div className="flex items-center gap-2">
                                   <MapPin className="h-4 w-4 text-primary" />
                                   <span>{event.location}</span>
                                 </div>
                               )}
                            </div>
                            
                            {event.description && (
                              <div className="bg-muted/30 p-3 rounded-xl text-sm text-foreground/80">
                                {event.description}
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
