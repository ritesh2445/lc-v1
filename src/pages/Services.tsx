import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { MessageCircle, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  name: string;
  description: string;
  banner_image_url: string | null;
  whatsapp_message: string | null;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [whatsappContact, setWhatsappContact] = useState<string>("1234567890");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
    fetchWhatsAppContact();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      if (data) setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWhatsAppContact = async () => {
    try {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "whatsapp_contact")
        .maybeSingle();
      if (data) setWhatsappContact(data.value);
    } catch (error) {
      console.error("Error fetching WhatsApp contact:", error);
    }
  };

  const handleWhatsAppConnect = (service: Service) => {
    const message = service.whatsapp_message || `Hi! I'm interested in your service: ${service.name}`;
    const whatsappUrl = `https://wa.me/${whatsappContact}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
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
            Our Services
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up">
            Comprehensive mental health support services designed to help you on your journey to emotional wellbeing.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {services.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="mx-auto text-muted-foreground mb-4" size={64} />
              <h3 className="text-2xl font-bold mb-2">No Services Available</h3>
              <p className="text-muted-foreground">Check back soon for our services.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-glow border border-border hover-glow-strong neon-border animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Banner Image */}
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/30 overflow-hidden">
                    {service.banner_image_url ? (
                      <img
                        src={service.banner_image_url}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Heart className="text-primary group-hover:scale-110 transition-glow" size={48} />
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-2xl font-bold group-hover:text-primary transition-smooth">
                      {service.name}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                    <Button 
                      onClick={() => handleWhatsAppConnect(service)}
                      className="w-full shadow-soft"
                    >
                      <MessageCircle className="mr-2" size={18} />
                      Connect via WhatsApp
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Take the first step towards better mental health. Book a session or contact us to learn more about our services.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/events">
              <Button size="lg" className="shadow-medium">
                Book a Session
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;