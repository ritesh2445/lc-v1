import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
}

const FAQ = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactEmail, setContactEmail] = useState<string>("");

  useEffect(() => {
    fetchFAQs();
    fetchContactEmail();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      if (data) setFaqs(data);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactEmail = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_info")
        .select("email")
        .limit(1)
        .single();

      if (error) throw error;
      if (data?.email) setContactEmail(data.email);
    } catch (error) {
      console.error("Error fetching contact email:", error);
    }
  };

  const handleContactClick = () => {
    const subject = encodeURIComponent("Inquiry about ListeningClub");
    const body = encodeURIComponent("Hey Listening Club, I'd like to know more about .....");
    const mailtoLink = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
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
          <HelpCircle className="mx-auto text-primary mb-6" size={64} />
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Frequently Asked Questions
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up">
            Find answers to common questions about ListeningClub, our services, and how we can support your mental wellness journey.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {faqs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={faq.id}
                    value={`item-${faq.id}`}
                    className="bg-card rounded-2xl border border-border shadow-soft px-6 animate-fade-in hover-glow neon-border"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <AccordionTrigger className="text-left hover:text-primary transition-glow py-6">
                      <span className="text-lg font-semibold">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-center text-muted-foreground">No FAQs available at the moment.</p>
            )}
          </div>

          {/* Still Have Questions CTA */}
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col items-center gap-6 p-8 bg-gradient-to-r from-primary/10 to-secondary/30 rounded-2xl shadow-medium max-w-2xl">
              <h3 className="text-2xl font-bold">Still have questions?</h3>
              <p className="text-muted-foreground">
                We're here to help! Reach out to our team and we'll get back to you as soon as possible.
              </p>
              <button 
                onClick={handleContactClick}
                disabled={!contactEmail}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:scale-105 transition-smooth shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
