import React, { createContext, useContext, useState, ReactNode } from 'react';
import { startOfToday, addDays } from 'date-fns';

export type EventType = "meeting" | "personal" | "work" | "reminder";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: EventType;
  description?: string;
  location?: string;
  createdAt: Date;
}

interface EventsContextType {
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

const initialEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Design Review",
    date: startOfToday(),
    startTime: "10:00",
    endTime: "11:30",
    type: "work",
    location: "Conference Room A",
    createdAt: new Date(Date.now() - 10000000)
  },
  {
    id: "2",
    title: "Lunch with Sarah",
    date: startOfToday(),
    startTime: "12:30",
    endTime: "13:30",
    type: "personal",
    location: "The Green Bowl",
    createdAt: new Date(Date.now() - 8000000)
  },
  {
    id: "3",
    title: "Project Kickoff",
    date: addDays(startOfToday(), 2),
    startTime: "14:00",
    endTime: "15:00",
    type: "work",
    description: "Discussing Q4 roadmap",
    createdAt: new Date(Date.now() - 5000000)
  },
  {
    id: "4",
    title: "Dentist Appointment",
    date: addDays(startOfToday(), 5),
    startTime: "09:00",
    endTime: "10:00",
    type: "reminder",
    createdAt: new Date(Date.now() - 2000000)
  }
];

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);

  const addEvent = (event: CalendarEvent) => {
    setEvents((prev) => [...prev, event]);
  };

  return (
    <EventsContext.Provider value={{ events, addEvent }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
