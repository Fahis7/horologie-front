import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-gray-400 pt-12 pb-6 px-4 md:px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Mobile View - Stacked Layout */}
        <div className="block lg:hidden">
          {/* Brand Info */}
          <div className="mb-8">
            <h3 className="text-white text-2xl font-serif italic mb-4">HOROLOGIE</h3>
            <p className="text-sm leading-relaxed font-light">
              Curating timeless masterpieces from the world's finest watchmakers.
              Elegance, precision, and heritage—since 1924.
            </p>
          </div>

          {/* Links Grid for Mobile */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Explore Links */}
            <div>
              <h4 className="text-white text-sm uppercase mb-4 tracking-wider">Explore</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/products" className="hover:text-white transition-colors block py-1">Collections</Link></li>
                <li><Link to="/#heritage" className="hover:text-white transition-colors block py-1">Our Heritage</Link></li>
                <li><Link to="/craftsmanship" className="hover:text-white transition-colors block py-1">Craftsmanship</Link></li>
                <li><Link to="/account" className="hover:text-white transition-colors block py-1">My Account</Link></li>
              </ul>
            </div>

            {/* Customer Support */}
            <div>
              <h4 className="text-white text-sm uppercase mb-4 tracking-wider">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/contact" className="hover:text-white transition-colors block py-1">Contact Us</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors block py-1">FAQs</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors block py-1">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors block py-1">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Social & Contact - Mobile */}
          <div className="mb-8">
            <h4 className="text-white text-sm uppercase mb-4 tracking-wider">Connect</h4>
            <div className="flex space-x-4 mb-6">
              <a 
                href="#" 
                className="hover:text-white transition-colors p-3 bg-gray-900 hover:bg-gray-800 rounded-full"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="hover:text-white transition-colors p-3 bg-gray-900 hover:bg-gray-800 rounded-full"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="hover:text-white transition-colors p-3 bg-gray-900 hover:bg-gray-800 rounded-full"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="hover:text-white transition-colors p-3 bg-gray-900 hover:bg-gray-800 rounded-full"
                aria-label="YouTube"
              >
                <FaYoutube className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm font-light mb-2">
              support@horologie.com
            </p>
            <p className="text-sm font-light">
              +91 81294 58920
            </p>
          </div>

          {/* Mobile Newsletter */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-3">Stay updated with our latest</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 px-4 py-3 text-sm bg-gray-900 border border-gray-800 focus:outline-none focus:border-gray-600 placeholder-gray-600"
              />
              <button className="bg-gray-800 hover:bg-gray-700 text-sm px-5 py-3 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Desktop View - Grid Layout */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-12">
          
          {/* Brand Info */}
          <div>
            <h3 className="text-white text-2xl font-serif italic mb-4">HOROLOGIE</h3>
            <p className="text-sm leading-relaxed font-light">
              Curating timeless masterpieces from the world's finest watchmakers.
              Elegance, precision, and heritage—since 1924.
            </p>
          </div>

          {/* Explore Links */}
          <div>
            <h4 className="text-white text-sm uppercase mb-4 tracking-wider">Explore</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/products" className="hover:text-white transition-colors block py-1">Collections</Link></li>
              <li><Link to="/#heritage" className="hover:text-white transition-colors block py-1">Our Heritage</Link></li>
              <li><Link to="/craftsmanship" className="hover:text-white transition-colors block py-1">Craftsmanship</Link></li>
              <li><Link to="/account" className="hover:text-white transition-colors block py-1">My Account</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-white text-sm uppercase mb-4 tracking-wider">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/contact" className="hover:text-white transition-colors block py-1">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors block py-1">FAQs</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors block py-1">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors block py-1">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Social / Contact */}
          <div>
            <h4 className="text-white text-sm uppercase mb-4 tracking-wider">Connect</h4>
            <div className="flex space-x-4 mb-6">
              <a 
                href="#" 
                className="hover:text-white transition-colors p-3 bg-gray-900 hover:bg-gray-800 rounded-full"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="hover:text-white transition-colors p-3 bg-gray-900 hover:bg-gray-800 rounded-full"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="hover:text-white transition-colors p-3 bg-gray-900 hover:bg-gray-800 rounded-full"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="hover:text-white transition-colors p-3 bg-gray-900 hover:bg-gray-800 rounded-full"
                aria-label="YouTube"
              >
                <FaYoutube className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm font-light mb-2">
              support@horologie.com
            </p>
            <p className="text-sm font-light mb-6">
              +91 81294 58920
            </p>
            
            {/* Desktop Newsletter */}
            <div>
              <p className="text-sm text-gray-500 mb-3">Stay updated with our latest</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-1 px-4 py-2 text-sm bg-gray-900 border border-gray-800 focus:outline-none focus:border-gray-600 placeholder-gray-600"
                />
                <button className="bg-gray-800 hover:bg-gray-700 text-sm px-4 py-2 transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Line - Both Mobile & Desktop */}
        <div className="mt-8 lg:mt-12 border-t border-gray-800 pt-6 text-center">
          <p className="text-xs tracking-wider text-gray-500 mb-2">
            © {new Date().getFullYear()} HOROLOGIE. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 lg:gap-6 text-xs text-gray-600">
            <Link to="/sitemap" className="hover:text-gray-300 transition-colors">Sitemap</Link>
            <Link to="/cookies" className="hover:text-gray-300 transition-colors">Cookie Policy</Link>
            <Link to="/accessibility" className="hover:text-gray-300 transition-colors">Accessibility</Link>
            <Link to="/returns" className="hover:text-gray-300 transition-colors">Returns</Link>
            <Link to="/shipping" className="hover:text-gray-300 transition-colors">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;