import React, { useState } from "react";
import { DayPicker, DayClickEventHandler } from "react-day-picker";
import "react-day-picker/style.css";
import { format, isSameDay, addDays, startOfToday } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  MoreHorizontal,
  Bell,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Mock Data & Types ---

type EventType = "meeting" | "personal" | "work" | "reminder";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: EventType;
  description?: string;
  location?: string;
}

const initialEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Design Review",
    date: startOfToday(),
    startTime: "10:00",
    endTime: "11:30",
    type: "work",
    location: "Conference Room A"
  },
  {
    id: "2",
    title: "Lunch with Sarah",
    date: startOfToday(),
    startTime: "12:30",
    endTime: "13:30",
    type: "personal",
    location: "The Green Bowl"
  },
  {
    id: "3",
    title: "Project Kickoff",
    date: addDays(startOfToday(), 2),
    startTime: "14:00",
    endTime: "15:00",
    type: "work",
    description: "Discussing Q4 roadmap"
  },
  {
    id: "4",
    title: "Dentist Appointment",
    date: addDays(startOfToday(), 5),
    startTime: "09:00",
    endTime: "10:00",
    type: "reminder",
  }
];

const eventTypeColors: Record<EventType, string> = {
  meeting: "bg-blue-100 text-blue-700 border-blue-200",
  personal: "bg-green-100 text-green-700 border-green-200",
  work: "bg-purple-100 text-purple-700 border-purple-200",
  reminder: "bg-orange-100 text-orange-700 border-orange-200",
};

// --- Components ---

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfToday());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  
  // Filter events for the selected day
  const dayEvents = events.filter(event => 
    selectedDate && isSameDay(event.date, selectedDate)
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleDayClick: DayClickEventHandler = (day) => {
    setSelectedDate(day);
  };

  const handleAddEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEvent: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.get("title") as string,
      date: selectedDate || new Date(),
      startTime: formData.get("startTime") as string || "09:00",
      endTime: formData.get("endTime") as string || "10:00",
      type: formData.get("type") as EventType || "work",
      location: formData.get("location") as string,
      description: formData.get("description") as string,
    };
    
    setEvents([...events, newEvent]);
    setIsAddEventOpen(false);
  };

  return (
    <div className="min-h-screen bg-background/50 p-4 md:p-8 font-sans flex items-center justify-center">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 h-[85vh]">
        
        {/* Left Panel: Calendar & Mini Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 flex flex-col gap-6"
        >
          {/* Profile/Header Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-display font-bold text-gray-900">Flow Calendar</h1>
                <p className="text-muted-foreground text-sm">Manage your time efficiently</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CalendarIcon size={20} />
              </div>
            </div>
            
            <Button 
              onClick={() => setIsAddEventOpen(true)}
              className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl py-6 text-base transition-all hover:scale-[1.02]"
            >
              <Plus className="mr-2 h-5 w-5" /> Add New Event
            </Button>
          </div>

          {/* Date Picker Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/50 flex-1 flex flex-col">
             <style>{`
              .rdp { --rdp-cell-size: 40px; --rdp-accent-color: hsl(var(--primary)); --rdp-background-color: hsl(var(--accent)); margin: 0; }
              .rdp-day_selected:not([disabled]) { background-color: var(--rdp-accent-color); color: white; font-weight: bold; }
              .rdp-day_selected:hover:not([disabled]) { background-color: var(--rdp-accent-color); opacity: 0.8; }
              .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: var(--rdp-background-color); color: var(--rdp-accent-color); }
            `}</style>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onDayClick={handleDayClick}
              showOutsideDays
              className="mx-auto w-full flex justify-center"
              modifiersClassNames={{
                selected: "bg-primary text-white rounded-full hover:bg-primary hover:text-white",
                today: "text-primary font-bold"
              }}
            />
            
            <div className="mt-auto pt-6 border-t border-border/50">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{format(new Date(), 'MMMM yyyy')}</span>
                <div className="flex gap-2">
                   <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100">Work</Badge>
                   <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100">Personal</Badge>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Panel: Day View & Events */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 border border-white/50 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-border/40 flex items-center justify-between bg-white/40">
            <div>
              <h2 className="text-3xl font-display font-bold text-gray-800">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM do') : 'Select a date'}
              </h2>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                {dayEvents.length} events scheduled
              </p>
            </div>
            <div className="flex gap-3">
               <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-border/60 bg-white/50">
                 <Search className="h-4 w-4 text-muted-foreground" />
               </Button>
               <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-border/60 bg-white/50">
                 <Bell className="h-4 w-4 text-muted-foreground" />
               </Button>
               <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                 <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
               </Button>
            </div>
          </div>

          {/* Events List */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-white/30">
            <AnimatePresence mode="popLayout">
              {dayEvents.length > 0 ? (
                dayEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="group mb-4 relative"
                  >
                    <div className="flex gap-6">
                      {/* Time Column */}
                      <div className="w-16 pt-3 text-right">
                        <span className="text-sm font-medium text-gray-900 block">{event.startTime}</span>
                        <span className="text-xs text-muted-foreground block">{event.endTime}</span>
                      </div>

                      {/* Event Card */}
                      <div className={cn(
                        "flex-1 p-5 rounded-2xl border transition-all duration-300 hover:shadow-md cursor-pointer relative overflow-hidden",
                        eventTypeColors[event.type]
                      )}>
                        {/* Decor bar */}
                        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", event.type === 'work' ? 'bg-purple-400' : event.type === 'personal' ? 'bg-green-400' : event.type === 'meeting' ? 'bg-blue-400' : 'bg-orange-400')} />
                        
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                            {event.description && <p className="text-sm opacity-80 mb-2 line-clamp-1">{event.description}</p>}
                            
                            <div className="flex items-center gap-4 text-xs font-medium opacity-70 mt-3">
                               <span className="flex items-center gap-1">
                                 <Clock size={12} /> {event.endTime}
                               </span>
                               {event.location && (
                                 <span className="flex items-center gap-1">
                                   <MapPin size={12} /> {event.location}
                                 </span>
                               )}
                            </div>
                          </div>
                          
                          <Badge variant="secondary" className="bg-white/50 backdrop-blur-sm border-0 text-current capitalize shadow-sm">
                            {event.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed border-border/50 rounded-3xl bg-white/20"
                >
                  <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                    <CalendarIcon className="h-8 w-8 opacity-40" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground/80">No events planned</h3>
                  <p className="text-sm max-w-xs mx-auto mt-1">Enjoy your free time or schedule something new.</p>
                  <Button 
                    variant="link" 
                    onClick={() => setIsAddEventOpen(true)} 
                    className="mt-4 text-primary font-semibold"
                  >
                    Schedule an event
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden bg-white/95 backdrop-blur-xl">
          <DialogHeader className="px-6 pt-6 pb-4 bg-muted/20 border-b border-border/50">
            <DialogTitle className="text-xl font-display">Add New Event</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddEvent} className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="e.g., Team Brainstorming" 
                className="rounded-xl border-border/50 bg-white/50 focus:bg-white transition-all"
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input 
                  id="startTime" 
                  name="startTime" 
                  type="time" 
                  defaultValue="09:00"
                  className="rounded-xl border-border/50 bg-white/50" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input 
                  id="endTime" 
                  name="endTime" 
                  type="time" 
                  defaultValue="10:00"
                  className="rounded-xl border-border/50 bg-white/50" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue="work">
                <SelectTrigger className="rounded-xl border-border/50 bg-white/50">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input 
                id="location" 
                name="location" 
                placeholder="e.g., Zoom or Office" 
                className="rounded-xl border-border/50 bg-white/50" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Add details..." 
                className="rounded-xl border-border/50 bg-white/50 resize-none min-h-[80px]" 
              />
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="ghost" className="rounded-xl">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">Create Event</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
