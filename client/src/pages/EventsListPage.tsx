import React from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Filter,
  MoreVertical
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEvents, EventType } from "@/lib/events-context";
import { cn } from "@/lib/utils";

const eventTypeColors: Record<EventType, string> = {
  meeting: "bg-blue-100 text-blue-700 border-blue-200",
  personal: "bg-green-100 text-green-700 border-green-200",
  work: "bg-purple-100 text-purple-700 border-purple-200",
  reminder: "bg-orange-100 text-orange-700 border-orange-200",
};

export default function EventsListPage() {
  const { events } = useEvents();
  
  // Sort events by creation date (newest first) to show "additions"
  const sortedEvents = [...events].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="min-h-screen bg-background/50 p-4 md:p-8 font-sans flex justify-center">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        
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
              <h1 className="text-2xl font-display font-bold text-gray-900">Event Log</h1>
              <p className="text-muted-foreground text-sm">Recent additions to your calendar</p>
            </div>
          </div>
          
          <Button variant="outline" className="rounded-xl border-border/60 bg-white/50 gap-2 hidden sm:flex">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </motion.div>

        {/* List */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 border border-white/50 overflow-hidden">
          <div className="p-6 border-b border-border/40 bg-white/40 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">All Events ({events.length})</h2>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Sorted by Recently Added</div>
          </div>
          
          <div className="divide-y divide-border/40">
            {sortedEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-white/60 transition-colors group flex flex-col sm:flex-row gap-4 sm:items-center"
              >
                {/* Date Box */}
                <div className="flex-shrink-0 flex sm:flex-col items-center justify-center bg-white border border-border/50 rounded-2xl h-16 w-16 sm:h-20 sm:w-20 shadow-sm gap-2 sm:gap-0">
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">{format(event.date, 'MMM')}</span>
                  <span className="text-xl sm:text-2xl font-display font-bold text-gray-900">{format(event.date, 'd')}</span>
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-lg font-bold text-gray-900 truncate pr-4">{event.title}</h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity -mt-1">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary/60" />
                      <span>{event.startTime} - {event.endTime}</span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-primary/60" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="h-4 w-4 text-primary/60" />
                      <span>Added {format(event.createdAt, 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                  
                  {event.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-1">{event.description}</p>
                  )}
                </div>

                {/* Tag */}
                <div className="flex-shrink-0 self-start sm:self-center mt-2 sm:mt-0">
                   <Badge variant="secondary" className={cn("capitalize shadow-sm px-3 py-1 rounded-full", eventTypeColors[event.type])}>
                      {event.type}
                   </Badge>
                </div>
              </motion.div>
            ))}
            
            {sortedEvents.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                No events found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
