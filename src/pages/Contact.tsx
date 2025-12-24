import { useState, useEffect } from "react";
import { Mail, Phone, Instagram, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  age: z.string()
    .min(1, "Age is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 150, "Please enter a valid age"),
  profession: z.string()
    .min(1, "Profession is required")
    .max(100, "Profession must be less than 100 characters")
    .trim(),
  city: z.string()
    .min(1, "City is required")
    .max(100, "City must be less than 100 characters")
    .trim(),
});

interface ContactInfo {
  email: string | null;
  phone: string | null;
  instagram_url: string | null;
}

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    profession: "",
    city: "",
  });
  const [formErrors, setFormErrors] = useState<{ name?: string; age?: string; profession?: string; city?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: "hello@listeningclub.com",
    phone: "+1 (234) 567-890",
    instagram_url: "https://instagram.com",
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
          instagram_url: data.instagram_url || "https://instagram.com",
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
      const errors: { name?: string; age?: string; profession?: string; city?: string } = {};
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
          age: parseInt(result.data.age),
          profession: result.data.profession,
          city: result.data.city,
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
        title: "Submitted Successfully!",
        description: "Thank you for reaching out. We'll get back to you soon.",
      });

      setFormData({ name: "", age: "", profession: "", city: "" });
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit. Please try again later.",
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
              <h2 className="text-3xl font-bold mb-6">Tell Us About Yourself</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
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
                  <label htmlFor="age" className="block text-sm font-medium mb-2">
                    Age
                  </label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Your age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className={`bg-secondary/50 ${formErrors.age ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                    min={1}
                    max={150}
                  />
                  {formErrors.age && (
                    <p className="text-destructive text-sm mt-1">{formErrors.age}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="profession" className="block text-sm font-medium mb-2">
                    Profession
                  </label>
                  <Input
                    id="profession"
                    type="text"
                    placeholder="e.g., Software Engineer, Teacher, Student"
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    className={`bg-secondary/50 ${formErrors.profession ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                    maxLength={100}
                  />
                  {formErrors.profession && (
                    <p className="text-destructive text-sm mt-1">{formErrors.profession}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-2">
                    City
                  </label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Your city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`bg-secondary/50 ${formErrors.city ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                    maxLength={100}
                  />
                  {formErrors.city && (
                    <p className="text-destructive text-sm mt-1">{formErrors.city}</p>
                  )}
                </div>

                <Button type="submit" size="lg" className="w-full shadow-soft" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2" size={18} />
                      Submit
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
