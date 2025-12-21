import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { User, Linkedin, Instagram, Twitter } from "lucide-react";

interface Founder {
  id: string;
  name: string;
  role: string | null;
  bio: string;
  work: string | null;
  motto: string | null;
  image_url: string;
  linkedin_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  display_order: number;
}

const Founders = () => {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);
  const [footerText, setFooterText] = useState<string>("");

  useEffect(() => {
    fetchFounders();
    fetchFooterText();
  }, []);

  const fetchFounders = async () => {
    try {
      const { data, error } = await supabase
        .from("founders")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      if (data) setFounders(data);
    } catch (error) {
      console.error("Error fetching founders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFooterText = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "founders_footer_text")
        .maybeSingle();

      if (error) throw error;
      if (data) setFooterText(data.value);
    } catch (error) {
      console.error("Error fetching footer text:", error);
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
            Meet Our Founders
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up">
            The passionate individuals behind ListeningClub who are dedicated to making mental health support accessible to everyone.
          </p>
        </div>
      </section>

      {/* Founders Grid - Side by Side */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {founders.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">Founder information coming soon.</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {founders.slice(0, 2).map((founder, index) => (
                  <div
                    key={founder.id}
                    className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-glow border border-border hover-glow-strong neon-border animate-fade-in text-center"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Circular Profile Image */}
                    <div className="pt-8 flex justify-center">
                      <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                        <img
                          src={founder.image_url}
                          alt={founder.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                        />
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold group-hover:text-primary transition-smooth">
                          {founder.name}
                        </h3>
                        {founder.role && (
                          <p className="text-primary font-medium">{founder.role}</p>
                        )}
                        {founder.work && (
                          <p className="text-sm text-muted-foreground">{founder.work}</p>
                        )}
                      </div>

                      {founder.motto && (
                        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground text-left">
                          "{founder.motto}"
                        </blockquote>
                      )}

                      <p className="text-muted-foreground leading-relaxed text-left">
                        {founder.bio}
                      </p>

                      {/* Social Media Links */}
                      {(founder.linkedin_url || founder.instagram_url || founder.twitter_url) && (
                        <div className="flex gap-3 pt-2 justify-center">
                          {founder.linkedin_url && (
                            <a
                              href={founder.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
                            >
                              <Linkedin size={20} />
                            </a>
                          )}
                          {founder.instagram_url && (
                            <a
                              href={founder.instagram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
                            >
                              <Instagram size={20} />
                            </a>
                          )}
                          {founder.twitter_url && (
                            <a
                              href={founder.twitter_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
                            >
                              <Twitter size={20} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Text Block */}
              {footerText && (
                <div className="max-w-3xl mx-auto mt-12 text-center animate-fade-in">
                  <div className="bg-gradient-to-r from-primary/10 via-secondary/20 to-primary/10 rounded-2xl p-8 border border-primary/20">
                    <p className="text-lg md:text-xl text-foreground leading-relaxed whitespace-pre-line">
                      {footerText}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Founders;