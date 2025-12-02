import React, { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  format, 
  addDays, 
  subDays, 
  isToday, 
  isSameDay,
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

function useAutoDateUpdate() {
  const [currentDate, setCurrentDate] = useState(() => startOfDay(new Date()));

  const checkAndUpdateDate = useCallback(() => {
    const today = startOfDay(new Date());
    setCurrentDate(prevDate => {
      if (!isSameDay(prevDate, today)) {
        return today;
      }
      return prevDate;
    });
  }, []);

  useEffect(() => {
    checkAndUpdateDate();
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const midnightTimeout = setTimeout(() => {
      checkAndUpdateDate();
    }, msUntilMidnight);
    
    const intervalId = setInterval(checkAndUpdateDate, 60000);
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndUpdateDate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearTimeout(midnightTimeout);
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAndUpdateDate]);

  return { currentDate, setCurrentDate };
}
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin,
  Calendar as CalendarIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getAllEvents } from "@/lib/api";
import inacapLogo from "@assets/thumbnail_Outlook-o4d0fj3m_1764687146741.png";

type EventType = "interno" | "externo";

const eventTypeColors: Record<EventType, string> = {
  interno: "bg-blue-100 text-blue-700 border-blue-200",
  externo: "bg-green-100 text-green-700 border-green-200",
};

const eventTypeBorderColors: Record<EventType, string> = {
  interno: "border-blue-500",
  externo: "border-green-500",
};

export default function EventsListPage() {
  const { currentDate, setCurrentDate } = useAutoDateUpdate();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: getAllEvents,
  });

  const nextDay = () => setCurrentDate(addDays(currentDate, 1));
  const prevDay = () => setCurrentDate(subDays(currentDate, 1));
  const jumpToToday = () => setCurrentDate(new Date());

  const dayEvents = events
    .filter(event => isSameDay(event.date, currentDate))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="min-h-screen bg-background/50 p-4 md:p-8 font-sans flex justify-center">
      <div className="w-full max-w-5xl flex flex-col gap-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/50 gap-4"
        >
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-display font-bold text-gray-900">Actividades Auditorio</h1>
              <img src={inacapLogo} alt="INACAP Sede Puerto Montt" className="h-10 mt-2" data-testid="img-inacap-logo" />
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/50 rounded-full p-1.5 border border-border/60 self-center sm:self-auto">
            <Button variant="ghost" size="icon" onClick={prevDay} className="rounded-full h-9 w-9" data-testid="button-prev-day">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col items-center min-w-[140px]">
              <span className="font-bold text-gray-900 text-lg">
                {capitalize(format(currentDate, 'EEEE', { locale: es }))}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                {format(currentDate, 'd', { locale: es })} {capitalize(format(currentDate, 'MMMM', { locale: es }))} {format(currentDate, 'yyyy', { locale: es })}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={nextDay} className="rounded-full h-9 w-9" data-testid="button-next-day">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button 
            variant={isToday(currentDate) ? "default" : "outline"} 
            onClick={jumpToToday}
            className="rounded-xl hidden sm:flex"
            data-testid="button-today"
          >
            Hoy
          </Button>
        </motion.div>

        {/* Agenda List */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 border border-white/50 overflow-hidden min-h-[700px] flex flex-col"
        >
          <div className="p-6 border-b border-border/40 bg-white/40 flex justify-between items-center">
             <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
               <CalendarIcon className="h-5 w-5 text-primary" />
               Actividades ({dayEvents.length})
             </h2>
             {dayEvents.length > 0 && (
               <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                 {dayEvents[0].startTime} - {dayEvents[dayEvents.length - 1].endTime}
               </span>
             )}
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="relative">
              {/* Vertical Timeline Line */}
              {dayEvents.length > 0 && (
                <div className="absolute left-[4.5rem] top-4 bottom-4 w-px bg-border/60 hidden sm:block" />
              )}

              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground">Cargando...</div>
                ) : dayEvents.length > 0 ? (
                  dayEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group mb-6 relative flex flex-col sm:flex-row gap-4 sm:gap-8"
                      data-testid={`event-item-${event.id}`}
                    >
                      {/* Time Column */}
                      <div className="w-full sm:w-16 pt-1 text-left sm:text-right flex-shrink-0 flex sm:block justify-between items-center">
                        <div>
                          <span className={cn("text-sm font-bold block", event.cancelled ? "text-gray-400 line-through" : "text-gray-900")}>{event.startTime}</span>
                          <span className={cn("text-xs block opacity-60", event.cancelled ? "text-gray-400 line-through" : "text-muted-foreground")}>{event.endTime}</span>
                        </div>
                        {/* Mobile line connector */}
                        <div className="h-px flex-1 bg-border/50 mx-4 sm:hidden" />
                      </div>

                      {/* Timeline Dot */}
                      <div className="absolute left-[4.5rem] top-1.5 -ml-[5px] hidden sm:flex h-2.5 w-2.5 rounded-full border-2 border-white ring-1 ring-border bg-muted z-10 items-center justify-center">
                         <div className={cn("h-1.5 w-1.5 rounded-full", event.cancelled ? "bg-red-400" : eventTypeColors[event.type as EventType].replace('bg-', 'bg-opacity-100 bg-').split(' ')[0])} />
                      </div>

                      {/* Event Card */}
                      <div className={cn(
                        "flex-1 p-8 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                        event.cancelled 
                          ? "bg-red-50 text-red-700 border-red-200 opacity-75" 
                          : cn("bg-white hover:shadow-md hover:-translate-y-0.5", eventTypeColors[event.type as EventType])
                      )}>
                        {/* Left accent border */}
                        <div className={cn("absolute left-0 top-0 bottom-0 w-1", event.cancelled ? "bg-red-400" : eventTypeBorderColors[event.type as EventType].replace('border-', 'bg-'))} />
                        
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className={cn("font-bold text-2xl mb-3", event.cancelled ? "line-through text-red-700" : "text-gray-900")}>{event.title}</h3>
                            
                            <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 text-base opacity-80 font-medium mb-3", event.cancelled && "line-through")}>
                               {event.location && (
                                 <span className="flex items-center gap-1.5">
                                   <MapPin className="h-5 w-5" /> {event.location}
                                 </span>
                               )}
                               <span className="flex items-center gap-1.5">
                                  <Clock className="h-5 w-5" /> {event.startTime} - {event.endTime}
                               </span>
                            </div>

                            {event.description && (
                              <p className={cn("text-base opacity-70 leading-relaxed", event.cancelled && "line-through")}>{event.description}</p>
                            )}
                          </div>
                          
                          {event.cancelled ? (
                            <Badge variant="destructive" className="shadow-sm flex-shrink-0">
                              Cancelado
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-white/60 backdrop-blur-sm border-0 text-current capitalize shadow-sm flex-shrink-0">
                              {event.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-[400px] flex flex-col items-center justify-center text-center text-muted-foreground"
                  >
                    <div className="h-24 w-24 bg-muted/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <CalendarIcon className="h-10 w-10 opacity-30" />
                    </div>
                    <h3 className="text-xl font-medium text-foreground/80 mb-2">No hay actividades programadas</h3>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </motion.div>
      </div>
    </div>
  );
}
