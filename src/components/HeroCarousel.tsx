import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Users, Calendar, Heart, Sparkles, Star, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-image.jpg";

interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string | null;
  cta_text: string;
  cta_link: string;
  icon_type: string;
}

const iconMap: { [key: string]: React.ElementType } = {
  users: Users,
  calendar: Calendar,
  heart: Heart,
  sparkles: Sparkles,
  star: Star,
  shield: Shield,
};

const defaultSlides: BannerSlide[] = [
  {
    id: "1",
    title: "Meet Our Founders",
    subtitle: "The Heart Behind ListeningClub",
    description: "Geetika – Counsellor, Psychotherapist, and Parenting Coach, Geetika helps you feel heard, understood, and supported.\n\nSneha – NLP Practitioner, Life Coach, and Certified Zentangle Teacher, Sneha sparks creativity and empowers positive shifts in life.\n\nTogether, they run Listening to Mann ki Baat – a safe space where loneliness ends and real connection begins.",
    image_url: null,
    cta_text: "Meet the Team",
    cta_link: "/founders",
    icon_type: "users",
  },
  {
    id: "2",
    title: "Upcoming Events",
    subtitle: "Join Our Community Sessions",
    description: "Participate in workshops, support groups, and wellness sessions designed to nurture your mental wellbeing.",
    image_url: null,
    cta_text: "View Events",
    cta_link: "/events",
    icon_type: "calendar",
  },
  {
    id: "3",
    title: "Our Mission",
    subtitle: "A Space to Listen, Heal, and Grow",
    description: "ListeningClub is dedicated to creating safe, judgment-free spaces where everyone can find support on their mental health journey.",
    image_url: null,
    cta_text: "Learn More",
    cta_link: "/services",
    icon_type: "heart",
  },
];

const HeroCarousel = () => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<BannerSlide[]>(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleCtaClick = (ctaLink: string) => {
    if (ctaLink.includes('#')) {
      const [path, hash] = ctaLink.split('#');
      if (path === '' || path === '/') {
        // Same page scroll
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Navigate to page then scroll
        navigate(path);
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } else {
      navigate(ctaLink);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from("banner_slides")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setSlides(data);
      }
    } catch (error) {
      console.error("Error fetching banner slides:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;
    
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, slides.length]);

  const handleManualNav = (direction: 'prev' | 'next') => {
    setIsAutoPlaying(false);
    if (direction === 'prev') prevSlide();
    else nextSlide();
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Reset image loaded state when slide changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentSlide]);

  const getSlideImage = (slide: BannerSlide, index: number) => {
    return slide.image_url || heroImage;
  };

  // Get current slide for rendering
  const currentSlideData = slides[currentSlide];
  const CurrentIcon = iconMap[currentSlideData?.icon_type] || Heart;

  // Show skeleton during initial load
  if (isLoading) {
    return (
      <section className="relative gradient-hero overflow-hidden">
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24 lg:py-32">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="w-full order-2 lg:order-1 space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-xl animate-pulse" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-12 sm:h-16 w-3/4 bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
              </div>
              <div className="flex gap-4 pt-4">
                <div className="h-10 w-32 bg-muted rounded animate-pulse" />
                <div className="h-10 w-32 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="w-full order-1 lg:order-2">
              <div className="aspect-[4/3] lg:aspect-square bg-muted rounded-2xl sm:rounded-3xl animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative gradient-hero overflow-hidden">
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content - Always visible, no absolute positioning on mobile */}
          <div className="relative z-10 w-full order-2 lg:order-1">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CurrentIcon className="text-primary" size={20} />
                </div>
                <span className="text-primary font-medium text-sm sm:text-base">{currentSlideData?.subtitle}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                {currentSlideData?.title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground whitespace-pre-line line-clamp-6 sm:line-clamp-none">
                {currentSlideData?.description}
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4">
                <Button 
                  size="lg" 
                  className="shadow-medium w-full sm:w-auto"
                  onClick={() => handleCtaClick(currentSlideData?.cta_link || "/")}
                >
                  {currentSlideData?.cta_text}
                </Button>
                <Link to="/contact" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="shadow-soft w-full sm:w-auto">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Image - Responsive container that adapts to any aspect ratio */}
          <div className="relative w-full order-1 lg:order-2 animate-scale-in">
            <div className="relative w-full max-h-[300px] sm:max-h-[400px] lg:max-h-none overflow-hidden rounded-2xl sm:rounded-3xl">
              {/* Skeleton placeholder while image loads */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse rounded-2xl sm:rounded-3xl" />
              )}
              <img
                src={getSlideImage(currentSlideData, currentSlide)}
                alt={currentSlideData?.title}
                className={`w-full h-auto object-cover rounded-2xl sm:rounded-3xl shadow-large transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            </div>
            {/* Floating accents - Hidden on mobile for cleaner look */}
            <div className="hidden sm:block absolute -top-8 -right-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-float animate-pulse-glow"></div>
            <div className="hidden sm:block absolute -bottom-8 -left-8 w-32 h-32 bg-secondary/40 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
          </div>
        </div>

        {/* Navigation */}
        {slides.length > 1 && (
          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-12">
            <button
              onClick={() => handleManualNav('prev')}
              className="p-2 rounded-full bg-card border border-border shadow-soft hover:shadow-medium hover:scale-105 transition-smooth"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </button>

            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-primary w-6 sm:w-8 shadow-[0_0_15px_rgba(255,127,107,0.5)]"
                      : "bg-muted hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => handleManualNav('next')}
              className="p-2 rounded-full bg-card border border-border shadow-soft hover:shadow-medium hover:scale-105 transition-smooth"
              aria-label="Next slide"
            >
              <ChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroCarousel;