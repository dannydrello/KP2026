import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, MessageCircle } from 'lucide-react';
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return <footer className="bg-secondary border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Branding */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img src="https://horizons-cdn.hostinger.com/af6267a3-879e-4e3c-a1ed-86471b79742c/d5085528b6f818b588a7d9f9c0227726.png" alt="Kitchen Pastries Logo" className="w-[80px] sm:w-[90px] md:w-[100px] object-contain" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ALWAYS PASSIONATE ABOUT YOUR EXPERIENCE …. AWESOME GOD
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <span className="text-lg font-semibold text-foreground mb-4 block">Quick Links</span>
            <ul className="space-y-2">
              {['Home', 'Menu', 'Order', 'Contact'].map(item => <li key={item}>
                  <Link to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                    {item}
                  </Link>
                </li>)}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <span className="text-lg font-semibold text-foreground mb-4 block">Contact Us</span>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground"> 08069747505 ;07061174772; 07076027785</span>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">hello@kitchenpastries.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">8 Onitsha crescent independence layout Enugu. 3 Aguleri Street independence layout Enugu ( land mark ; Opp High court)</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <span className="text-lg font-semibold text-foreground mb-4 block">Follow Us</span>
            <div className="flex space-x-4">
              <a href="https://wa.me/15551234567" target="_blank" rel="noopener noreferrer" className="p-3 bg-background rounded-lg hover:bg-primary hover:scale-110 transition-smooth shadow-soft" aria-label="WhatsApp">
                <MessageCircle className="w-5 h-5 text-foreground" />
              </a>
              <a href="https://instagram.com/kitchenpastries" target="_blank" rel="noopener noreferrer" className="p-3 bg-background rounded-lg hover:bg-primary hover:scale-110 transition-smooth shadow-soft" aria-label="Instagram">
                <Instagram className="w-5 h-5 text-foreground" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {currentYear} Kitchen Pastries. All rights reserved. Baked with love.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;