import Link from 'next/link';
import { Mail, Phone, MapPin, Award } from 'lucide-react';
import { Logo } from './brand';

export default function Footer() {
  return (
    <footer className="w-full bg-charcoal text-white/90 border-t border-gold/15 py-16 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center">
              <Logo variant="dark" size="sm" />
            </Link>
            <p className="text-xs text-white/60 leading-relaxed max-w-xs">
              Bespoke luxury interior designing for residential and elite commercial properties. Creating functional, elegant spaces tailored to your unique taste.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="text-white/60 hover:text-gold smooth-transition" aria-label="Instagram">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-gold smooth-transition" aria-label="Facebook">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-gold smooth-transition" aria-label="Award">
                <Award className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-sm font-semibold tracking-wider text-gold uppercase">Services</h3>
            <ul className="flex flex-col gap-2.5 text-xs text-white/70">
              <li><Link href="/services" className="hover:text-gold smooth-transition">Living Room Remodels</Link></li>
              <li><Link href="/services" className="hover:text-gold smooth-transition">Modular Smart Kitchens</Link></li>
              <li><Link href="/services" className="hover:text-gold smooth-transition">Luxury Penthouse Bedrooms</Link></li>
              <li><Link href="/services" className="hover:text-gold smooth-transition">Executive Office Spaces</Link></li>
            </ul>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-sm font-semibold tracking-wider text-gold uppercase">Studio</h3>
            <ul className="flex flex-col gap-2.5 text-xs text-white/70">
              <li><Link href="/" className="hover:text-gold smooth-transition">Home</Link></li>
              <li><Link href="/gallery" className="hover:text-gold smooth-transition">Design Portfolio</Link></li>
              <li><Link href="/how-it-works" className="hover:text-gold smooth-transition">Execution Workflow</Link></li>
              <li><Link href="/about" className="hover:text-gold smooth-transition">Our Architects</Link></li>
              <li><Link href="/contact" className="hover:text-gold smooth-transition">Book Consultation</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-sm font-semibold tracking-wider text-gold uppercase">Get In Touch</h3>
            <ul className="flex flex-col gap-3.5 text-xs text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-gold shrink-0" />
                <span>100 Luxury Avenue, Suite 400,<br />Beverly Hills, CA 90210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-gold" />
                <span>+1 (555) 019-2834</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-gold" />
                <span>concierge@crescentchique.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-xs text-white/40">
          <p>© {new Date().getFullYear()} Crescent Chique Designs. All Rights Reserved. Crafted with passion.</p>
        </div>
      </div>
    </footer>
  );
}
