import React, { useState } from "react";
import { Link } from "wouter";
import { DayPicker, DayClickEventHandler } from "react-day-picker";
import "react-day-picker/style.css";
import { format, isSameDay, startOfToday } from "date-fns";
import { es } from "date-fns/locale";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  MoreHorizontal,
  Bell,
  Search,
  List,
  X,
  Minus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
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
import { getAllEvents, createEvent, cancelEvent, deleteEvent } from "@/lib/api";
import type { InsertEvent } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type EventType = "interno" | "externo";

const eventTypeColors: Record<EventType, string> = {
  interno: "bg-blue-100 text-blue-700 border-blue-200",
  externo: "bg-green-100 text-green-700 border-green-200",
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfToday());
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: getAllEvents,
  });

  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setIsAddEventOpen(false);
      toast({
        title: "Evento creado",
        description: "Tu evento ha sido agregado al calendario.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cancelEventMutation = useMutation({
    mutationFn: cancelEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Evento cancelado",
        description: "El evento ha sido marcado como cancelado.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Evento eliminado",
        description: "El evento ha sido eliminado permanentemente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const dayEvents = events.filter(event => 
    selectedDate && isSameDay(event.date, selectedDate)
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleDayClick: DayClickEventHandler = (day) => {
    setSelectedDate(day);
  };

  const handleAddEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newEvent: InsertEvent = {
      title: formData.get("title") as string,
      date: selectedDate || new Date(),
      startTime: formData.get("startTime") as string || "09:00",
      endTime: formData.get("endTime") as string || "10:00",
      type: formData.get("type") as EventType || "interno",
      location: (formData.get("location") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
    };
    
    createEventMutation.mutate(newEvent);
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
                <h1 className="text-2xl font-display font-bold text-gray-900">Calendario Flow</h1>
                <p className="text-muted-foreground text-sm">Administra tu tiempo eficientemente</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CalendarIcon size={20} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => setIsAddEventOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl py-6 text-base transition-all hover:scale-[1.02]"
                data-testid="button-add-event"
              >
                <Plus className="mr-2 h-5 w-5" /> Agregar Evento
              </Button>
              
              <Link href="/events">
                <Button 
                  variant="outline"
                  className="w-full h-full border-2 border-primary/10 hover:bg-primary/5 hover:border-primary/20 text-primary rounded-xl py-6 text-base transition-all"
                  data-testid="link-view-log"
                >
                  <List className="mr-2 h-5 w-5" /> Ver Registro
                </Button>
              </Link>
            </div>
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
              locale={es}
              className="mx-auto w-full flex justify-center"
              modifiersClassNames={{
                selected: "bg-primary text-white rounded-full hover:bg-primary hover:text-white",
                today: "text-primary font-bold"
              }}
            />
            
            <div className="mt-auto pt-6 border-t border-border/50">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{capitalize(format(new Date(), 'MMMM', { locale: es }))} {format(new Date(), 'yyyy', { locale: es })}</span>
                <div className="flex gap-2">
                   <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100">Interno</Badge>
                   <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100">Externo</Badge>
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
                {selectedDate ? `${capitalize(format(selectedDate, 'EEEE', { locale: es }))}, ${format(selectedDate, 'd', { locale: es })} ${capitalize(format(selectedDate, 'MMMM', { locale: es }))}` : 'Selecciona una fecha'}
              </h2>
              <p className="text-muted-foreground mt-1 flex items-center gap-2" data-testid="text-event-count">
                {isLoading ? "Cargando..." : `${dayEvents.length} eventos programados`}
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
                    data-testid={`card-event-${event.id}`}
                  >
                    <div className="flex gap-6">
                      {/* Time Column */}
                      <div className="w-16 pt-3 text-right">
                        <span className={cn("text-sm font-medium block", event.cancelled ? "text-gray-400 line-through" : "text-gray-900")} data-testid={`text-start-time-${event.id}`}>{event.startTime}</span>
                        <span className={cn("text-xs block", event.cancelled ? "text-gray-400 line-through" : "text-muted-foreground")} data-testid={`text-end-time-${event.id}`}>{event.endTime}</span>
                      </div>

                      {/* Event Card */}
                      <div className={cn(
                        "flex-1 p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                        event.cancelled 
                          ? "bg-red-50 text-red-700 border-red-200 opacity-75" 
                          : cn(eventTypeColors[event.type as EventType], "hover:shadow-md cursor-pointer")
                      )}>
                        {/* Decor bar */}
                        <div className={cn(
                          "absolute left-0 top-0 bottom-0 w-1.5", 
                          event.cancelled ? 'bg-red-400' : (event.type === 'interno' ? 'bg-blue-400' : 'bg-green-400')
                        )} />
                        
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className={cn("font-bold text-lg mb-1", event.cancelled && "line-through")} data-testid={`text-title-${event.id}`}>{event.title}</h3>
                            {event.description && <p className={cn("text-sm opacity-80 mb-2 line-clamp-1", event.cancelled && "line-through")}>{event.description}</p>}
                            
                            <div className={cn("flex items-center gap-4 text-xs font-medium opacity-70 mt-3", event.cancelled && "line-through")}>
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
                          
                          <div className="flex items-center gap-2">
                            {event.cancelled ? (
                              <Badge variant="destructive" className="shadow-sm" data-testid={`badge-cancelled-${event.id}`}>
                                Cancelado
                              </Badge>
                            ) : (
                              <>
                                <Badge variant="secondary" className="bg-white/50 backdrop-blur-sm border-0 text-current capitalize shadow-sm" data-testid={`badge-type-${event.id}`}>
                                  {event.type}
                                </Badge>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-7 w-7 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cancelEventMutation.mutate(event.id);
                                  }}
                                  disabled={cancelEventMutation.isPending}
                                  data-testid={`button-cancel-event-${event.id}`}
                                >
                                  <X size={14} />
                                </Button>
                              </>
                            )}
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7 rounded-full text-red-600 hover:text-red-800 hover:bg-red-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEventMutation.mutate(event.id);
                              }}
                              disabled={deleteEventMutation.isPending}
                              data-testid={`button-delete-event-${event.id}`}
                            >
                              <Minus size={14} />
                            </Button>
                          </div>
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
                  <h3 className="text-lg font-medium text-foreground/80">No hay eventos planeados</h3>
                  <p className="text-sm max-w-xs mx-auto mt-1">Disfruta de tu tiempo libre o agenda algo nuevo.</p>
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
            <DialogTitle className="text-xl font-display">Agregar Nuevo Evento</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddEvent} className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Evento</Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="p.ej., Lluvia de ideas del equipo" 
                className="rounded-xl border-border/50 bg-white/50 focus:bg-white transition-all"
                data-testid="input-title"
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de Inicio</Label>
                <Input 
                  id="startTime" 
                  name="startTime" 
                  type="time" 
                  defaultValue="09:00"
                  className="rounded-xl border-border/50 bg-white/50"
                  data-testid="input-start-time"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora de Finalización</Label>
                <Input 
                  id="endTime" 
                  name="endTime" 
                  type="time" 
                  defaultValue="10:00"
                  className="rounded-xl border-border/50 bg-white/50"
                  data-testid="input-end-time"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select name="type" defaultValue="interno">
                <SelectTrigger className="rounded-xl border-border/50 bg-white/50" data-testid="select-type">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="interno">Interno</SelectItem>
                  <SelectItem value="externo">Externo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación (Opcional)</Label>
              <Input 
                id="location" 
                name="location" 
                placeholder="p.ej., Zoom u Oficina" 
                className="rounded-xl border-border/50 bg-white/50"
                data-testid="input-location"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Agregar detalles..." 
                className="rounded-xl border-border/50 bg-white/50 resize-none min-h-[80px]"
                data-testid="input-description"
              />
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="ghost" className="rounded-xl" data-testid="button-cancel">Cancelar</Button>
              </DialogClose>
              <Button 
                type="submit" 
                className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                disabled={createEventMutation.isPending}
                data-testid="button-create-event"
              >
                {createEventMutation.isPending ? "Creando..." : "Crear Evento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
