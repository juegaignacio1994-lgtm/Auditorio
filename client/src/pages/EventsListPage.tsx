import React, { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { 
  format, 
  addDays, 
  subDays, 
  isToday, 
  startOfDay, 
  isSameDay,
  differenceInMinutes,
  setHours,
  setMinutes,
  getHours,
  getMinutes
} from "date-fns";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin,
  Calendar as CalendarIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEvents, EventType, CalendarEvent } from "@/lib/events-context";
import { cn } from "@/lib/utils";

const eventTypeColors: Record<EventType, string> = {
  meeting: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
  personal: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
  work: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200",
  reminder: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200",
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function EventsListPage() {
  const { events } = useEvents();
  const [currentDate, setCurrentDate] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to 8 AM on mount
  useEffect(() => {
    if (scrollRef.current) {
      const eightAM = 8 * 60; // 8 AM in minutes (assuming 60px per hour)
      // If using 80px per hour, it would be 8 * 80
      // Let's wait for render
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: 8 * 80, behavior: 'smooth' });
      }, 100);
    }
  }, []);

  const nextDay = () => setCurrentDate(addDays(currentDate, 1));
  const prevDay = () => setCurrentDate(subDays(currentDate, 1));
  const jumpToToday = () => setCurrentDate(new Date());

  const dayEvents = events.filter(event => isSameDay(event.date, currentDate));

  // Helper to calculate position and height
  const getEventStyle = (event: CalendarEvent) => {
    const [startHour, startMin] = event.startTime.split(':').map(Number);
    const [endHour, endMin] = event.endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const duration = endMinutes - startMinutes;

    return {
      top: `${(startMinutes / 60) * 80}px`, // 80px per hour height
      height: `${(duration / 60) * 80}px`,
      minHeight: '40px'
    };
  };

  return (
    <div className="min-h-screen bg-background/50 p-4 md:p-8 font-sans flex justify-center">
      <div className="w-full max-w-5xl flex flex-col gap-6 h-[90vh]">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/50 gap-4"
        >
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">Daily Schedule</h1>
              <p className="text-muted-foreground text-sm">Detailed timeline view</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/50 rounded-full p-1.5 border border-border/60 self-center sm:self-auto">
            <Button variant="ghost" size="icon" onClick={prevDay} className="rounded-full h-9 w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col items-center min-w-[140px]">
              <span className="font-bold text-gray-900 text-sm">
                {format(currentDate, 'EEEE')}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {format(currentDate, 'MMMM do, yyyy')}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={nextDay} className="rounded-full h-9 w-9">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button 
            variant={isToday(currentDate) ? "default" : "outline"} 
            onClick={jumpToToday}
            className="rounded-xl hidden sm:flex"
          >
            Today
          </Button>
        </motion.div>

        {/* Daily Timeline */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 border border-white/50 overflow-hidden flex flex-col flex-1 relative"
        >
          {/* Header with current day indicator if needed */}
          <div className="h-14 border-b border-border/40 bg-white/40 flex items-center px-6 sticky top-0 z-10">
             <div className="w-16 text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</div>
             <div className="flex-1 pl-4 border-l border-border/40 h-full flex items-center">
               <span className="text-sm font-semibold text-gray-600">Events</span>
             </div>
          </div>

          {/* Scrollable Timeline Area */}
          <ScrollArea className="flex-1 relative bg-white/20" ref={scrollRef}>
            <div className="relative min-h-[1920px]" style={{ height: '1920px' }}> {/* 24h * 80px */}
              
              {/* Background Grid Lines */}
              {HOURS.map((hour) => (
                <div 
                  key={hour} 
                  className="absolute w-full border-b border-border/30 flex items-start group hover:bg-white/30 transition-colors"
                  style={{ top: `${hour * 80}px`, height: '80px' }}
                >
                  <div className="w-16 text-right pr-4 -mt-2.5">
                    <span className="text-xs font-medium text-muted-foreground/70 group-hover:text-primary transition-colors">
                      {format(setHours(new Date(), hour), 'h a')}
                    </span>
                  </div>
                  <div className="flex-1 border-l border-border/40 h-full relative">
                    {/* Half-hour marker */}
                    <div className="absolute top-1/2 left-0 w-full border-b border-border/20 border-dashed" />
                  </div>
                </div>
              ))}

              {/* Current Time Indicator (if today) */}
              {isToday(currentDate) && (
                <div 
                  className="absolute left-16 right-0 border-t-2 border-red-500 z-20 flex items-center pointer-events-none"
                  style={{ top: `${(getHours(new Date()) * 60 + getMinutes(new Date())) / 60 * 80}px` }}
                >
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500 -ml-1.5" />
                </div>
              )}

              {/* Events */}
              <div className="absolute top-0 left-16 right-4 bottom-0">
                {dayEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "absolute left-2 right-2 rounded-xl border shadow-sm p-3 flex flex-col justify-center transition-all hover:z-10 hover:shadow-md cursor-pointer overflow-hidden",
                      eventTypeColors[event.type]
                    )}
                    style={getEventStyle(event)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm leading-tight line-clamp-1">{event.title}</h3>
                      {/* Only show badge if height allows */}
                      {parseInt(getEventStyle(event).height) > 60 && (
                        <Badge variant="secondary" className="bg-white/50 border-0 text-[10px] h-5 px-1.5">
                          {event.type}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1 text-xs opacity-80 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.startTime} - {event.endTime}
                      </span>
                      {event.location && parseInt(getEventStyle(event).height) > 60 && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                    </div>

                    {event.description && parseInt(getEventStyle(event).height) > 80 && (
                      <p className="text-xs mt-2 opacity-70 line-clamp-2">{event.description}</p>
                    )}
                  </motion.div>
                ))}
              </div>

            </div>
          </ScrollArea>
        </motion.div>
      </div>
    </div>
  );
}
