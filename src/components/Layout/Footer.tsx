import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">HealthConnect</span>
            </div>
            <p className="text-gray-400 text-sm">
              Making healthcare accessible and convenient for everyone. 
              Book appointments with qualified doctors online.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/doctors" className="text-gray-400 hover:text-white transition-colors">Find Doctors</Link></li>
              <li><Link to="/specialties" className="text-gray-400 hover:text-white transition-colors">Specialties</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Specialties</h3>
            <ul className="space-y-2">
              <li><Link to="/doctors?specialty=cardiology" className="text-gray-400 hover:text-white transition-colors">Cardiology</Link></li>
              <li><Link to="/doctors?specialty=dermatology" className="text-gray-400 hover:text-white transition-colors">Dermatology</Link></li>
              <li><Link to="/doctors?specialty=pediatrics" className="text-gray-400 hover:text-white transition-colors">Pediatrics</Link></li>
              <li><Link to="/doctors?specialty=orthopedics" className="text-gray-400 hover:text-white transition-colors">Orthopedics</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>123 Healthcare Street,<br />Mumbai, Maharashtra 400001</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Mail className="h-4 w-4" />
                <span>support@healthconnect.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 HealthConnect. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
