import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface HeaderProps {
  currentUser: {
    id: number;
    username: string;
    fullName: string;
    role: string;
  } | null;
  onLogout: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const Header = ({ 
  currentUser, 
  onLogout, 
  mobileMenuOpen, 
  setMobileMenuOpen 
}: HeaderProps) => {
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <a className="flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-600">
                <path d="M17.3333 4H14.6667V14.6667H4V17.3333H14.6667V28H17.3333V17.3333H28V14.6667H17.3333V4Z" fill="currentColor"/>
              </svg>
              <span className="font-bold text-xl">ICU Aftercare</span>
            </a>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        {currentUser && (
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/doctor">
              <a className={`${isActive('/doctor') ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'} px-3 py-2 rounded-md font-medium`}>
                Dashboard
              </a>
            </Link>
            <Link href="/patient-onboarding">
              <a className={`${isActive('/patient-onboarding') ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'} px-3 py-2 rounded-md font-medium`}>
                Patients
              </a>
            </Link>
            <Link href="/data-review">
              <a className={`${isActive('/data-review') ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'} px-3 py-2 rounded-md font-medium`}>
                Data Review
              </a>
            </Link>
            <Link href="/aggregate-data">
              <a className={`${isActive('/aggregate-data') ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'} px-3 py-2 rounded-md font-medium`}>
                Reports
              </a>
            </Link>
          </nav>
        )}
        
        {/* User Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          {currentUser ? (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-medium">{currentUser.fullName}</span>
              <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center">
                <span className="text-primary-700 font-medium">
                  {currentUser.fullName.split(' ').map(name => name[0]).join('')}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/patient-login">
                <Button variant="ghost" size="sm">
                  Patient Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
