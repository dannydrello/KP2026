
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useCart } from '@/components/CartContext.jsx';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { cartCount } = useCart();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Menu', path: '/menu' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Order', path: '/order' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col shadow-md transition-all duration-300">
      {/* Main Navigation */}
      <div className="bg-gradient-to-r from-white/90 to-[#FFC600]/90 backdrop-blur-md w-full">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <img 
                src="https://horizons-cdn.hostinger.com/af6267a3-879e-4e3c-a1ed-86471b79742c/d5085528b6f818b588a7d9f9c0227726.png" 
                alt="Kitchen Pastries Logo" 
                className="w-[120px] sm:w-[140px] md:w-[160px] lg:w-[160px] h-auto object-contain transition-smooth hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
                    isActive(link.path)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-gray-800 hover:bg-black/5 hover:text-black'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <Link to="/cart" className="relative p-2 ml-2 text-gray-800 hover:text-black hover:bg-black/5 rounded-lg transition-smooth">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Button & Cart */}
            <div className="flex items-center md:hidden space-x-4">
              <Link to="/cart" className="relative p-2 text-gray-800 hover:text-black transition-smooth">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-800 hover:bg-black/5 hover:text-black transition-smooth"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-black/10">
              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-smooth ${
                      isActive(link.path)
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-gray-800 hover:bg-black/5 hover:text-black'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
