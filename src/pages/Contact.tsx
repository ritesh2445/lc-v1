import { useState, useEffect } from "react";
import { Mail, MapPin, Phone, Instagram, Linkedin, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Form validation schema
const contactFormSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters")
    .trim(),
  message: z.string()
    .min(1, "Message is required")
    .max(2000, "Message must be less than 2000 characters")
    .trim(),
});

interface ContactInfo {
  email: string | null;
  phone: string | null;
  address: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
}

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: "hello@listeningclub.com",
    phone: "+1 (234) 567-890",
    address: "123 Wellness Street\nMental Health District\nCity, State 12345",
    instagram_url: "https://instagram.com",
    linkedin_url: "https://linkedin.com",
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_info")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setContactInfo({
          email: data.email || "hello@listeningclub.com",
          phone: data.phone || "+1 (234) 567-890",
          address: data.address || "123 Wellness Street\nMental Health District\nCity, State 12345",
          instagram_url: data.instagram_url || "https://instagram.com",
          linkedin_url: data.linkedin_url || "https://linkedin.com",
        });
      }
    } catch (error) {
      console.error("Error fetching contact info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validate form data using Zod
    const result = contactFormSchema.safeParse(formData);
    
    if (!result.success) {
      const errors: { name?: string; email?: string; message?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof errors;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-contact', {
        body: {
          name: result.data.name,
          email: result.data.email,
          message: result.data.message,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We'll get back to you soon.",
      });

      setFormData({ name: "", email: "", message: "" });
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            Get in Touch
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up">
            Have questions? Want to learn more? We're here to help. Reach out and let's start a conversation.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="bg-card rounded-2xl p-8 shadow-medium border border-border animate-fade-in hover-glow neon-border">
              <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Your Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`bg-secondary/50 ${formErrors.name ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                    maxLength={100}
                  />
                  {formErrors.name && (
                    <p className="text-destructive text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`bg-secondary/50 ${formErrors.email ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                    maxLength={255}
                  />
                  {formErrors.email && (
                    <p className="text-destructive text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Your Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell us how we can help you..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`bg-secondary/50 resize-none ${formErrors.message ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                    maxLength={2000}
                  />
                  {formErrors.message && (
                    <p className="text-destructive text-sm mt-1">{formErrors.message}</p>
                  )}
                  <p className="text-muted-foreground text-xs mt-1">
                    {formData.message.length}/2000 characters
                  </p>
                </div>

                <Button type="submit" size="lg" className="w-full shadow-soft" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2" size={18} />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="bg-card rounded-2xl p-8 shadow-soft border border-border hover-glow neon-border">
                <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  {contactInfo.email && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="text-primary" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Email</h3>
                        <a href={`mailto:${contactInfo.email}`} className="text-muted-foreground hover:text-primary transition-smooth">
                          {contactInfo.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {contactInfo.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Phone className="text-primary" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Phone</h3>
                        <a href={`tel:${contactInfo.phone}`} className="text-muted-foreground hover:text-primary transition-smooth">
                          {contactInfo.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {contactInfo.address && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="text-primary" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Location</h3>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {contactInfo.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-card rounded-2xl p-8 shadow-soft border border-border hover-glow neon-border">
                <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
                <p className="text-muted-foreground mb-6">
                  Follow us on social media for updates, resources, and community stories.
                </p>
                <div className="flex gap-4">
                  {contactInfo.instagram_url && (
                    <a
                      href={contactInfo.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-glow hover:shadow-[0_0_30px_rgba(255,127,107,0.6)] hover:scale-110"
                    >
                      <Instagram size={24} />
                    </a>
                  )}
                  {contactInfo.linkedin_url && (
                    <a
                      href={contactInfo.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-glow hover:shadow-[0_0_30px_rgba(255,127,107,0.6)] hover:scale-110"
                    >
                      <Linkedin size={24} />
                    </a>
                  )}
                  {contactInfo.email && (
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-glow hover:shadow-[0_0_30px_rgba(255,127,107,0.6)] hover:scale-110"
                    >
                      <Mail size={24} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;