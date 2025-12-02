import { Event, InsertEvent } from "@shared/schema";

const API_BASE = "/api";

export async function getAllEvents(): Promise<Event[]> {
  const response = await fetch(`${API_BASE}/events`);
  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }
  const events = await response.json();
  return events.map((e: any) => ({
    ...e,
    date: new Date(e.date),
    createdAt: new Date(e.createdAt),
  }));
}

export async function createEvent(event: InsertEvent): Promise<Event> {
  const response = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create event");
  }
  
  const newEvent = await response.json();
  return {
    ...newEvent,
    date: new Date(newEvent.date),
    createdAt: new Date(newEvent.createdAt),
  };
}

export async function updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event> {
  const response = await fetch(`${API_BASE}/events/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update event");
  }
  
  const updated = await response.json();
  return {
    ...updated,
    date: new Date(updated.date),
    createdAt: new Date(updated.createdAt),
  };
}

export async function deleteEvent(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/events/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete event");
  }
}

export async function cancelEvent(id: string): Promise<Event> {
  const response = await fetch(`${API_BASE}/events/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cancelled: true }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to cancel event");
  }
  
  const updated = await response.json();
  return {
    ...updated,
    date: new Date(updated.date),
    createdAt: new Date(updated.createdAt),
  };
}
