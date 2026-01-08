import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-gray-400 pt-16 pb-8 px-6 lg:px-20 opacity-85">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand Info */}
        <div>
          <h3 className="text-white text-2xl font-serif italic mb-4">HOROLOGIE</h3>
          <p className="text-sm leading-relaxed font-light">
            Curating timeless masterpieces from the world’s finest watchmakers.
            Elegance, precision, and heritage—since 1924.
          </p>
        </div>

        {/* Explore Links */}
        <div>
          <h4 className="text-white text-sm uppercase mb-4 tracking-wider">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-white transition">Collections</Link></li>
            <li><Link to="/#heritage" className="hover:text-white transition">Our Heritage</Link></li>
            <li><Link to="/craftsmanship" className="hover:text-white transition">Craftsmanship</Link></li>
            <li><Link to="/account" className="hover:text-white transition">My Account</Link></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h4 className="text-white text-sm uppercase mb-4 tracking-wider">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
            <li><Link to="/faq" className="hover:text-white transition">FAQs</Link></li>
            <li><Link to="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Social / Contact */}
        <div>
          <h4 className="text-white text-sm uppercase mb-4 tracking-wider">Connect</h4>
          <div className="flex space-x-4 mb-4">
            <a href="#" className="hover:text-white transition"><FaFacebookF /></a>
            <a href="#" className="hover:text-white transition"><FaInstagram /></a>
            <a href="#" className="hover:text-white transition"><FaTwitter /></a>
            <a href="#" className="hover:text-white transition"><FaYoutube /></a>
          </div>
          <p className="text-sm font-light">
            support@horologie.com<br />
            +91 81294 58920
          </p>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="mt-12 border-t border-gray-800 pt-6 text-center text-xs tracking-wider text-gray-500">
        © {new Date().getFullYear()} HOROLOGIE. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
