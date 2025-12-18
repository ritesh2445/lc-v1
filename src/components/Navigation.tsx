import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.jpeg";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) {
      checkAdminRole(session.user.id);
    }
  };

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out",
    });
    navigate("/");
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/founders", label: "Founders" },
    { path: "/events", label: "Events" },
    { path: "/services", label: "Services" },
    { path: "/testimonials", label: "Testimonials" },
    { path: "/memory-lane", label: "Gallery" },
    { path: "/faq", label: "FAQs" },
    { path: "/contact", label: "Contact Us" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src={logo} alt="ListeningClub Logo" className="w-12 h-12 rounded-full object-cover" />
            <span className="font-heading font-bold text-xl">ListeningClub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-glow ${
                  isActive(link.path)
                    ? "bg-primary text-primary-foreground shadow-[0_0_25px_rgba(255,127,107,0.4)]"
                    : "hover:bg-secondary hover:shadow-[0_0_20px_rgba(255,243,199,0.5)] hover:scale-105"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="ml-2">
                  Admin
                </Button>
              </Link>
            )}
            <div className="ml-2 flex items-center gap-2">
              {user ? (
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="shadow-soft"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/auth")}
                  size="sm"
                  className="shadow-soft"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-smooth"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-glow ${
                    isActive(link.path)
                      ? "bg-primary text-primary-foreground shadow-[0_0_25px_rgba(255,127,107,0.4)]"
                      : "hover:bg-secondary hover:shadow-[0_0_20px_rgba(255,243,199,0.5)]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link to="/admin" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Admin
                  </Button>
                </Link>
              )}
              <div className="pt-4 border-t border-border space-y-3">
                {user ? (
                  <>
                    <p className="text-sm text-muted-foreground px-4">
                      Signed in as: {user.email}
                    </p>
                    <Button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      variant="outline"
                      className="w-full shadow-soft"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      navigate("/auth");
                      setIsOpen(false);
                    }}
                    className="w-full shadow-soft"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
