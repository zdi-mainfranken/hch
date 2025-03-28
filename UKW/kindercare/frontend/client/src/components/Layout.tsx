import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useLocation } from 'wouter';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: {
    id: number;
    username: string;
    fullName: string;
    role: string;
  } | null;
  onLogout: () => void;
}

const Layout = ({ children, currentUser, onLogout }: LayoutProps) => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when location changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header 
        currentUser={currentUser} 
        onLogout={onLogout} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <nav className="px-4 py-3 space-y-1 bg-white border-b">
            <a 
              href="/doctor" 
              className={`block px-3 py-2 rounded-md ${location === '/doctor' ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-primary-50 hover:text-primary-600'} font-medium`}
            >
              Dashboard
            </a>
            <a 
              href="/patient-onboarding" 
              className={`block px-3 py-2 rounded-md ${location === '/patient-onboarding' ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-primary-50 hover:text-primary-600'} font-medium`}
            >
              Patients
            </a>
            <a 
              href="/data-review" 
              className={`block px-3 py-2 rounded-md ${location === '/data-review' ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-primary-50 hover:text-primary-600'} font-medium`}
            >
              Data Review
            </a>
            <a 
              href="/aggregate-data" 
              className={`block px-3 py-2 rounded-md ${location === '/aggregate-data' ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-primary-50 hover:text-primary-600'} font-medium`}
            >
              Reports
            </a>
            {currentUser && (
              <div className="border-t pt-2 mt-2 flex items-center gap-2 px-3">
                <span className="text-sm font-medium">{currentUser.fullName}</span>
                <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center">
                  <span className="text-primary-700 font-medium">
                    {currentUser.fullName.split(' ').map(name => name[0]).join('')}
                  </span>
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
