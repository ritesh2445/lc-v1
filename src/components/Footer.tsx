import { Link } from "react-router-dom";
import { Instagram, Linkedin, Mail, Heart } from "lucide-react";
import logo from "@/assets/logo.jpeg";
const Footer = () => {
  return <footer className="bg-secondary/50 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="ListeningClub Logo" className="w-12 h-12 rounded-full object-cover" />
              <span className="font-heading font-bold text-lg">Listening To
MannKiBaat
 </span>
            </div>
            <p className="text-sm text-muted-foreground">
              A space to listen, heal, and grow together.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/volunteers" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Volunteers
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Community</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/testimonials" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth">
                <Linkedin size={20} />
              </a>
              <a href="mailto:hello@listeningclub.com" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth">
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Listening To MannKiBaat. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-4 md:mt-0">
            Made with <Heart size={14} className="text-primary fill-primary" /> for mental wellness
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;