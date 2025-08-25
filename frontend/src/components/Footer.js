import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa';
import { SiAppstore, SiGoogleplay } from 'react-icons/si';
import logo from "../assets/logo.png";

// Renamed and streamlined footer sections
const footerLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'FAQs', href: '/faq' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
  { label: 'Track Your Order', href: '/success/:orderId' },
];

const socialLinks = [
  {
    label: 'Facebook',
    icon: <FaFacebookF />,
    href: 'https://facebook.com/yourpage',
    colorClass: 'hover:text-blue-500',
  },
  {
    label: 'Instagram',
    icon: <FaInstagram />,
    href: 'https://instagram.com/yourpage',
    colorClass: 'hover:text-pink-500',
  },
  {
    label: 'Twitter',
    icon: <FaTwitter />,
    href: 'https://twitter.com/yourprofile',
    colorClass: 'hover:text-sky-500',
  },
  {
    label: 'LinkedIn',
    icon: <FaLinkedinIn />,
    href: 'https://linkedin.com/yourcompany',
    colorClass: 'hover:text-blue-700',
  },
  {
    label: 'YouTube',
    icon: <FaYoutube />,
    href: 'https://youtube.com/yourchannel',
    colorClass: 'hover:text-red-600',
  },
];

const appDownloadLinks = [
  {
    label: 'App Store',
    icon: <SiAppstore />,
    href: 'https://www.apple.com/app-store/',
  },
  {
    label: 'Google Play',
    icon: <SiGoogleplay />,
    href: 'https://play.google.com/store/apps',
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Top Section: Logo, Tagline, App Downloads */}
        <div className="flex flex-col items-center justify-between md:flex-row gap-8 pb-8 mb-8 border-b border-slate-700">
          <div className="text-center md:text-left">
            <a href="/" className="flex items-center gap-2" aria-label="Homepage">
              <img src={logo} alt="Logo" className="h-12" />
            </a>
            <p className="text-sm">Get your groceries delivered in minutes.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {appDownloadLinks.map((app) => (
              <a
                key={app.label}
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 text-white flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-slate-700 hover:bg-slate-700 transition-colors"
                aria-label={`Download on ${app.label}`}
              >
                <div className="text-xl">{app.icon}</div>
                <div>
                  <span className="block text-xs text-slate-400">Download on the</span>
                  <span className="font-semibold">{app.label}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Middle Section: Navigation and Social Links */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 pb-8 mb-8 border-b border-slate-700">
          <ul className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="hover:text-white hover:underline transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          
          <div className="flex items-center gap-3 justify-center md:justify-end">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow us on ${social.label}`}
                className={`text-xl text-slate-500 transition-colors ${social.colorClass}`}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
        
        {/* Bottom Section: Copyright */}
        <div className="text-center text-xs text-slate-500">
          <p>&copy; {currentYear} GroceryStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;