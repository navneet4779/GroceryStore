import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa';
import {
  MdEmail,
  MdLocalPhone,
  MdLocationPin,
} from 'react-icons/md';

const footerSections = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About Us', href: '/about' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQs', href: '/faq' },
      { label: 'Shipping & Returns', href: '/shipping-returns' },
      { label: 'Track Your Order', href: '/success/:orderId' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms-of-service' },
    ],
  },
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
    label: 'LinkedIn',
    icon: <FaLinkedinIn />,
    href: 'https://linkedin.com/yourcompany',
    colorClass: 'hover:text-blue-700',
  },
  {
    label: 'Twitter',
    icon: <FaTwitter />,
    href: 'https://twitter.com/yourprofile',
    colorClass: 'hover:text-sky-500',
  },
  {
    label: 'YouTube',
    icon: <FaYoutube />,
    href: 'https://youtube.com/yourchannel',
    colorClass: 'hover:text-red-600',
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-800 text-slate-300 border-t border-slate-700">
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand and Contact Info */}
          <div className="space-y-4">
            <a href="/" className="text-2xl font-bold text-white" aria-label="Homepage">
              YourLogo
            </a>
            <p className="text-sm text-slate-400">
              Your trusted source for high-quality products and amazing experiences.
            </p>
            <div className="space-y-2 text-sm">
              <a
                href="mailto:info@example.com"
                className="flex items-center gap-2 hover:text-primary-300 transition-colors"
              >
                <MdEmail className="text-primary-400" /> info@example.com
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-2 hover:text-primary-300 transition-colors"
              >
                <MdLocalPhone className="text-primary-400" /> +1 (234) 567-890
              </a>
              <p className="flex items-start gap-2">
                <MdLocationPin className="text-primary-400 mt-1" /> 123 Main Street, Anytown, USA
              </p>
            </div>
          </div>

          {/* Navigation Sections */}
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
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400 text-center md:text-left">
            &copy; {currentYear} GroceryStore. All Rights Reserved.
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
