import React from 'react'
import { Link } from 'react-router-dom'
import { LuGithub, LuLinkedin, LuTwitter, LuMail, LuHeart } from 'react-icons/lu'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t-2 border-gray-200 mt-auto">
      <div className="container mx-auto px-4 md:px-20 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Interv.ai</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Your intelligent interview preparation companion. Practice with AI-generated questions 
              tailored to your role and experience level.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/chintankasundra"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-900 text-gray-700 hover:text-white transition-all"
                aria-label="GitHub"
              >
                <LuGithub className="text-lg" />
              </a>
              <a
                href="https://www.linkedin.com/in/chintan-kasundra/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-600 text-gray-700 hover:text-white transition-all"
                aria-label="LinkedIn"
              >
                <LuLinkedin className="text-lg" />
              </a>

              <a
                href="mailto:chintan@gmail.com"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-orange-500 text-gray-700 hover:text-white transition-all"
                aria-label="Email"
              >
                <LuMail className="text-lg" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <a href="#features" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#about" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#help" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            © {currentYear} Interv.ai. All rights reserved.
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            Made  by Chintan Kasundra 
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
