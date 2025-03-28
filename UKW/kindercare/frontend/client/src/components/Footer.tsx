import React from 'react';
import { Link } from 'wouter';

const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-white py-4">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-slate-500">
          © {new Date().getFullYear()} ICU Aftercare Platform
        </div>
        <div className="flex items-center gap-4">
          <Link href="/privacy">
            <a className="text-sm text-slate-500 hover:text-slate-700">Privacy Policy</a>
          </Link>
          <Link href="/terms">
            <a className="text-sm text-slate-500 hover:text-slate-700">Terms of Service</a>
          </Link>
          <Link href="/support">
            <a className="text-sm text-slate-500 hover:text-slate-700">Contact Support</a>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
