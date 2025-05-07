import React from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaYoutube } from 'react-icons/fa'; // Added Twitter & Youtube, used FaFacebookF for a more standard icon
import { MdEmail, MdLocalPhone, MdLocationPin } from 'react-icons/md'; // For contact details

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Quick Links',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Shop', href: '/products' },
        { label: 'About Us', href: '/about' },
        { label: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Us', href: '/contact' },
        { label: 'FAQs', href: '/faq' },
        { label: 'Shipping & Returns', href: '/shipping-returns' },
        { label: 'Track Your Order', href: '/track-order' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms of Service', href: '/terms-of-service' },
        { label: 'Cookie Policy', href: '/cookie-policy' },
      ],
    },
  ];

  const socialLinks = [
    { label: 'Facebook', icon: <FaFacebookF />, href: 'https://facebook.com/yourpage', colorClass: 'hover:text-blue-500' },
    { label: 'Instagram', icon: <FaInstagram />, href: 'https://instagram.com/yourpage', colorClass: 'hover:text-pink-500' },
    { label: 'LinkedIn', icon: <FaLinkedinIn />, href: 'https://linkedin.com/yourcompany', colorClass: 'hover:text-blue-700' },
    { label: 'Twitter', icon: <FaTwitter />, href: 'https://twitter.com/yourprofile', colorClass: 'hover:text-sky-500' },
    { label: 'YouTube', icon: <FaYoutube />, href: 'https://youtube.com/yourchannel', colorClass: 'hover:text-red-600' },
  ];


  return (
    <footer className="bg-slate-800 text-slate-300 border-t border-slate-700">
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Brand and About */}
          <div className="space-y-4">
            {/* Placeholder for Logo */}
            <a href="/" className="text-2xl font-bold text-white">
              YourLogo
            </a>
            <p className="text-sm text-slate-400">
              Your trusted source for high-quality products and amazing experiences. Discover more with us.
            </p>
            <div className="space-y-2 text-sm">
                <a href="mailto:info@example.com" className="flex items-center gap-2 hover:text-primary-300 transition-colors">
                    <MdEmail className="text-primary-400"/> info@example.com
                </a>
                <a href="tel:+1234567890" className="flex items-center gap-2 hover:text-primary-300 transition-colors">
                    <MdLocalPhone className="text-primary-400"/> +1 (234) 567-890
                </a>
                <p className="flex items-start gap-2">
                    <MdLocationPin className="text-primary-400 mt-1"/> 123 Main Street, Anytown, USA
                </p>
            </div>
          </div>

          {/* Columns 2-4: Links from footerSections */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-lg font-semibold text-white">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-primary-300 hover:underline transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {/* Newsletter Section (Optional - if not using a separate column) */}
          {/* Or integrate into one of the columns above if preferred */}
          <div className="sm:col-span-2 lg:col-span-1 lg:col-start-4 space-y-4 bg-slate-700 p-6 rounded-lg shadow-md">
             <h3 className="text-lg font-semibold text-white">Stay Updated</h3>
             <p className="text-sm text-slate-400">Subscribe to our newsletter for the latest deals and updates.</p>
             <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2">
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 rounded-md bg-slate-600 text-white border border-slate-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none placeholder-slate-400 text-sm"
                    aria-label="Email for newsletter"
                />
                <button
                    type="submit"
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    Subscribe
                </button>
             </form>
          </div>

        </div>

        {/* Bottom Bar: Copyright and Social Media */}
        <div className="mt-8 pt-8 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400 text-center md:text-left">
            &copy; {currentYear} YourCompanyName. All Rights Reserved.
          </p>
          <div className="flex items-center gap-3 justify-center">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow us on ${social.label}`}
                className={`text-xl text-slate-400 transition-colors ${social.colorClass}`}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;