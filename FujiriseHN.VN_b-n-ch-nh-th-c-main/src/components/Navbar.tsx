import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  MessageCircle,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CONTACT_INFO, NAVIGATION, getCachedSettings } from "../constants";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [logo, setLogo] = React.useState('/logo.svg'); // Initialize with local default logo
  // New state to manage open mobile submenus
  const [openMobileSubmenu, setOpenMobileSubmenu] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const fetchLogo = async () => {
      const { data } = await getCachedSettings(supabase);
      if (data?.content_dict?.web_content?.logoImage && data.content_dict.web_content.logoImage !== '/logo.svg') {
        setLogo(data.content_dict.web_content.logoImage);
      }
    };
    fetchLogo();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Khóa cuộn trang nền khi mở Menu Mobile
  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Function to toggle mobile submenu
  const toggleMobileSubmenu = (itemName: string) => {
    setOpenMobileSubmenu(openMobileSubmenu === itemName ? null : itemName);
  };

  // Function to close all menus
  const closeAllMenus = () => {
    setIsOpen(false);
    setOpenMobileSubmenu(null);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const id = href.replace('/#', '');
      if (location.pathname === '/') {
        const element = document.getElementById(id);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
        window.history.pushState(null, '', href);
      } else {
        navigate(href);
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Utility Bar - Ultra Minimal */}
      <div className="hidden md:block bg-fuji-blue text-white py-2 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[12px] font-medium tracking-wide">
          <div className="flex gap-8">
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Mail size={14} strokeWidth={2.5} className="text-fuji-accent" />{" "}
              {CONTACT_INFO.email}
            </a>
            <p className="flex items-center gap-2">
              <MapPin size={14} strokeWidth={2.5} className="text-fuji-accent" />{" "}
              KĐT Mới Mỗ Lao, Hà Nội
            </p>
          </div>
          <div className="flex gap-6 items-center">
            <a href="/#faq" onClick={(e) => handleNavClick(e, '/#faq')} className="hover:text-white transition-colors">
              FAQ
            </a>
          </div>
        </div>
      </div>

      <nav
        className={cn(
          "transition-all duration-500",
          scrolled
            ? "bg-white shadow-2xl shadow-fuji-blue/5 py-1"
            : "bg-white py-2",
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-8">
          {/* Logo Left */}
          <Link to="/" className="flex items-center group shrink-0">
            <img
              src={logo}
              alt="Fujirise Logo"
              onError={(e) => {
                e.currentTarget.src = logo != "" ? logo : "/logo.svg";
              }}
              className="h-12 md:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Desktop Menu - Centered */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-8 flex-1 justify-center">
            {NAVIGATION.map((item) => (
              <div key={item.name} className="relative group/nav flex items-center">
                {item.href.startsWith('/#') ? (
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="text-[11px] xl:text-[13px] font-bold uppercase tracking-wider text-fuji-blue hover:text-fuji-accent transition-all relative group/item whitespace-nowrap flex items-center gap-1 py-4"
                  >
                    {item.name}
                    {item.children && <ChevronDown size={14} className="group-hover/nav:rotate-180 transition-transform duration-300" />}
                    <span className="absolute bottom-3 left-0 w-0 h-0.5 bg-fuji-accent transition-all group-hover/item:w-full" />
                  </a>
                ) : (
                  <Link
                    to={item.href}
                    className="text-[11px] xl:text-[13px] font-bold uppercase tracking-wider text-fuji-blue hover:text-fuji-accent transition-all relative group/item whitespace-nowrap flex items-center gap-1 py-4"
                  >
                    {item.name}
                    {item.children && <ChevronDown size={14} className="group-hover/nav:rotate-180 transition-transform duration-300" />}
                    <span className="absolute bottom-3 left-0 w-0 h-0.5 bg-fuji-accent transition-all group-hover/item:w-full" />
                  </Link>
                )}

                {item.children && (
                  <div className="absolute top-full left-0 w-48 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-300 translate-y-2 group-hover/nav:translate-y-0 z-50 before:content-[''] before:absolute before:-top-4 before:left-0 before:w-full before:h-4">
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden flex flex-col py-2 mt-1">
                      {item.children.map((child) => (
                        child.href.startsWith('/#') ? (
                          <a
                            key={child.name}
                            href={child.href}
                            onClick={(e) => handleNavClick(e, child.href)}
                            className="px-5 py-3 text-[11px] xl:text-[12px] font-bold uppercase tracking-wider text-slate-600 hover:text-fuji-blue hover:bg-slate-50 transition-colors"
                          >
                            {child.name}
                          </a>
                        ) : (
                          <Link
                            key={child.name}
                            to={child.href}
                            className="px-5 py-3 text-[11px] xl:text-[12px] font-bold uppercase tracking-wider text-slate-600 hover:text-fuji-blue hover:bg-slate-50 transition-colors"
                          >
                            {child.name}
                          </Link>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Call to Action Right */}
          <div className="hidden md:flex items-center gap-6 shrink-0">
            <div className="text-right">
              <p className="text-[10px] text-fuji-accent uppercase font-bold tracking-wider leading-none mb-1">
                Hotline Tư vấn
              </p>
              <a
                href={`tel:${CONTACT_INFO.hotline}`}
                className="text-fuji-blue font-bold text-xl tracking-tight leading-none hover:opacity-70 transition-all"
              >
                {CONTACT_INFO.hotline}
              </a>
            </div>
            <a
              href="/#contact"
              onClick={(e) => handleNavClick(e, '/#contact')}
              className="px-6 py-3 bg-fuji-blue text-white rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-fuji-accent transition-all shadow-lg active:scale-95"
            >
              Tư vấn ngay
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden text-fuji-blue focus:outline-none p-2 hover:bg-slate-50 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Lớp Overlay tối màu bấm ra ngoài để đóng menu */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                onClick={closeAllMenus} 
                className="fixed inset-0 top-[60px] bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" 
              />
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-full left-0 right-0 bg-white shadow-2xl md:hidden border-t z-50 max-h-[80vh] overflow-y-auto"
              >
              <div className="flex flex-col p-6 gap-4">
                {NAVIGATION.map((item) => (
                  <div key={item.name} className="flex flex-col">
                    {item.children ? (
                      // If item has children, click toggles submenu visibility
                      <button
                        onClick={() => toggleMobileSubmenu(item.name)}
                        className="text-lg font-bold uppercase tracking-wider text-fuji-blue hover:text-fuji-accent flex items-center justify-between group w-full text-left"
                      >
                        {item.name}
                        <ChevronDown size={20} className={cn("text-fuji-blue/50 transition-transform duration-300", openMobileSubmenu === item.name && "rotate-180")} />
                      </button>
                    ) : (
                      item.href.startsWith('/#') ? (
                        <a
                          href={item.href}
                          onClick={(e) => handleNavClick(e, item.href)}
                          className="text-lg font-bold uppercase tracking-wider text-fuji-blue hover:text-fuji-accent flex items-center justify-between group"
                        >
                          {item.name}
                          <div className="w-1.5 h-1.5 bg-fuji-blue rounded-full opacity-0 group-hover:opacity-100" />
                        </a>
                      ) : (
                        <Link
                          to={item.href}
                          onClick={closeAllMenus}
                          className="text-lg font-bold uppercase tracking-wider text-fuji-blue hover:text-fuji-accent flex items-center justify-between group"
                        >
                          {item.name}
                          <div className="w-1.5 h-1.5 bg-fuji-blue rounded-full opacity-0 group-hover:opacity-100" />
                        </Link>
                      )
                    )}

                    {item.children && openMobileSubmenu === item.name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="flex flex-col gap-3 pl-4 border-l-2 border-slate-100 ml-2 mt-3 mb-2 overflow-hidden"
                      >
                        {item.children.map((child) => (
                          child.href.startsWith('/#') ? (
                            <a
                              key={child.name}
                              href={child.href}
                              onClick={(e) => handleNavClick(e, child.href)}
                              className="text-sm font-bold uppercase tracking-wider text-slate-500 hover:text-fuji-accent"
                            >
                              {child.name}
                            </a>
                          ) : (
                            <Link
                              key={child.name}
                              to={child.href}
                              onClick={closeAllMenus} // Close all menus when a child link is clicked
                              className="text-sm font-bold uppercase tracking-wider text-slate-500 hover:text-fuji-accent"
                            >
                              {child.name}
                            </Link>
                          )
                        ))}
                      </motion.div>
                    )}
                  </div>
                ))}
                <div className="pt-4 border-t flex flex-col gap-3">
                  <a
                    href={`tel:${CONTACT_INFO.hotline}`}
                    className="flex items-center gap-3 text-fuji-blue font-bold"
                  >
                    <Phone size={20} /> {CONTACT_INFO.hotline}
                  </a>
                  <div className="flex gap-4">
                    <a
                      href={CONTACT_INFO.facebook}
                      className="p-2 border rounded-full text-blue-600 hover:bg-slate-50"
                    >
                      <Facebook size={20} />
                    </a>
                    <a
                      href={CONTACT_INFO.zalo}
                      className="p-2 border rounded-full text-blue-400 hover:bg-slate-50"
                    >
                      <MessageCircle size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
