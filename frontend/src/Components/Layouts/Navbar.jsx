import React, { useState } from 'react'
import ProfileInfoCard from "../Cards/ProfileInfoCard"
import { Link } from 'react-router-dom'
import { LuMenu, LuX } from 'react-icons/lu'

const Navbar = () => {
  const pathname = window.location.pathname
  const linkTo = pathname === '/dashboard' ? '/' : '/dashboard'
  const [isNavOpen, setIsNavOpen] = useState(false)

  return (
    <div 
      className='h-16 pb-[60px] bg-white border-b-2 border-gray-200 backdrop-blur-[2px] py-2.5 px-4 md:px-20 pt-6 sticky top-0 z-30 shadow-sm'
      onMouseEnter={() =>
        window.dispatchEvent(
          new CustomEvent("cursor-hover", { detail: { active: true } })
        )
      }
      onMouseLeave={() =>
        window.dispatchEvent(
          new CustomEvent("cursor-hover", { detail: { active: false } })
        )
      }
    >
      <div className="container mx-auto flex items-center justify-between gap-5">
        <Link to={linkTo}>
          <h2 className="text-lg md:text-xl font-medium text-black leading-5">
            Interv.ai
          </h2>
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/dashboard" 
              className={`text-sm md:text-base font-medium transition-colors hover:text-blue-600 ${
                pathname === '/dashboard' ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/pricing" 
              className={`text-sm md:text-base font-medium transition-colors hover:text-[#e99a4b] ${
                pathname === '/pricing' ? 'text-[#e99a4b]' : 'text-gray-700'
              }`}
            >
              Pricing
            </Link>
            <Link 
              to="/profile" 
              className={`text-sm md:text-base font-medium transition-colors hover:text-blue-600 ${
                pathname === '/profile' ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              Profile
            </Link>
          </nav>
          
          <button
            onClick={() => setIsNavOpen(!isNavOpen)}
            className="md:hidden text-gray-700 hover:text-black transition-colors"
            aria-label="Toggle menu"
          >
            {isNavOpen ? <LuX size={24} /> : <LuMenu size={24} />}
          </button>

          <div className="hidden md:flex">
            <ProfileInfoCard />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isNavOpen && (
        <nav className="md:hidden absolute top-16 left-0 right-0 bg-white border-b-2 border-gray-200 shadow-lg z-50">
          <div className="flex flex-col items-start gap-4 p-4">
            <Link 
              to="/dashboard" 
              onClick={() => setIsNavOpen(false)}
              className={`text-sm font-medium transition-colors hover:text-blue-600 w-full ${
                pathname === '/dashboard' ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/pricing" 
              onClick={() => setIsNavOpen(false)}
              className={`text-sm font-medium transition-colors hover:text-[#e99a4b] w-full ${
                pathname === '/pricing' ? 'text-[#e99a4b]' : 'text-gray-700'
              }`}
            >
              Pricing
            </Link>
            <Link 
              to="/profile" 
              onClick={() => setIsNavOpen(false)}
              className={`text-sm font-medium transition-colors hover:text-blue-600 w-full ${
                pathname === '/profile' ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              Profile
            </Link>
            <div className="w-full border-t border-gray-200 pt-4 mt-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <ProfileInfoCard />
              </div>
            </div>
          </div>
        </nav>
      )}
    </div>
  )
}

export default Navbar