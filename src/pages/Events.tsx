import { Calendar, Clock, MapPin, MessageCircle, Navigation as NavIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AddToCalendar from "@/components/AddToCalendar";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  description: string;
  location: string;
  is_booking_open: boolean;
  slots_status: string | null;
  map_link: string | null;
}

const Events = () => {
  const [whatsappContact, setWhatsappContact] = useState<string>("1234567890");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWhatsAppContact();
    fetchEvents();
  }, []);

  const fetchWhatsAppContact = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "whatsapp_contact")
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setWhatsappContact(data.value);
      }
    } catch (error) {
      console.error("Error fetching WhatsApp contact:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      
      if (data) {
        // Filter out expired events (24 hours after event date/time)
        const now = new Date();
        const filteredEvents = data.filter(event => {
          // Parse the event date and time
          const eventDate = new Date(event.date);
          
          // Parse time (e.g., "10:00 AM", "14:30", etc.)
          const timeStr = event.time || "00:00";
          const timeParts = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
          
          if (timeParts) {
            let hours = parseInt(timeParts[1], 10);
            const minutes = parseInt(timeParts[2] || "0", 10);
            const meridiem = timeParts[3]?.toUpperCase();
            
            if (meridiem === "PM" && hours !== 12) hours += 12;
            if (meridiem === "AM" && hours === 12) hours = 0;
            
            eventDate.setHours(hours, minutes, 0, 0);
          }
          
          // Add 24 hours to the event date/time
          const expiryDate = new Date(eventDate.getTime() + 24 * 60 * 60 * 1000);
          
          // Only show events that haven't expired
          return now < expiryDate;
        });

        setEvents(filteredEvents.map(event => ({
          id: event.id,
          name: event.name,
          date: event.date,
          time: event.time,
          description: event.description,
          location: event.location,
          is_booking_open: event.is_booking_open ?? true,
          slots_status: event.slots_status,
          map_link: event.map_link,
        })));
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookWhatsApp = (event: Event) => {
    const message = `Hi! I'd like to book the event: ${event.name} on ${event.date} at ${event.time}`;
    const whatsappUrl = `https://wa.me/${whatsappContact}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleOpenMap = (mapLink: string) => {
    window.open(mapLink, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Header */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Upcoming Events
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up">
            Join our community sessions, workshops, and support groups. Each event is designed to nurture your mental wellbeing.
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <div
                key={event.id}
                className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-glow border border-border hover-glow-strong neon-border animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-gradient-to-br from-primary/20 to-secondary/30 h-32 flex items-center justify-center group-hover:shadow-[inset_0_0_40px_rgba(255,127,107,0.3)] transition-glow">
                  <Calendar className="text-primary group-hover:scale-110 transition-glow" size={48} />
                </div>
                
                <div className="p-6 space-y-4">
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-smooth">
                    {event.name}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-primary" />
                      <span>{new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-primary" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-primary" />
                      <span>{event.location}</span>
                      {event.map_link && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-primary hover:text-primary/80"
                          onClick={() => handleOpenMap(event.map_link!)}
                        >
                          <NavIcon size={14} className="mr-1" />
                          Directions
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                  
                  {event.slots_status && (
                    <div className="bg-secondary/50 border border-primary/30 rounded-lg p-3 text-center">
                      <p className="text-primary font-semibold">{event.slots_status}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => handleBookWhatsApp(event)}
                      className="w-full shadow-soft"
                      disabled={!event.is_booking_open}
                    >
                      <MessageCircle className="mr-2" size={18} />
                      {event.is_booking_open ? "Book via WhatsApp" : "Booking Closed"}
                    </Button>
                    
                    {event.is_booking_open && (
                      <AddToCalendar
                        eventName={event.name}
                        eventDate={event.date}
                        eventTime={event.time}
                        eventLocation={event.location}
                        eventDescription={event.description}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;
