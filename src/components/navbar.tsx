import { useEffect, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useBrand } from "#/lib/store";

const navLinks = ["About", "Program", "Pricing", "Testimonials", "FAQ"];

export function Navbar() {
  const brand = useBrand();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      setIsDark(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <nav className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${scrolled ? "glass-card border-b py-3" : "bg-transparent py-5"}`}>
      <div className="container mx-auto flex items-center justify-between px-4">
        <a href="/" className="text-xl font-bold glow-text">{brand.companyName}</a>
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <a key={l} href={`/#${l.toLowerCase()}`} className="text-sm text-muted-foreground transition-colors hover:text-primary">{l}</a>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <button type="button" onClick={toggleTheme} className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a href="/#pricing" className="glow-button text-sm">Join Now</a>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <button type="button" onClick={toggleTheme} className="p-2 text-muted-foreground">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button type="button" onClick={() => setIsOpen(!isOpen)} className="p-2 text-foreground">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isOpen ? (
        <div className="glass-card mx-4 mt-2 rounded-xl p-4 md:hidden">
          {navLinks.map((l) => (
            <a key={l} href={`/#${l.toLowerCase()}`} onClick={() => setIsOpen(false)} className="block py-2 text-muted-foreground transition-colors hover:text-primary">{l}</a>
          ))}
          <a href="/#pricing" className="glow-button mt-3 block text-center text-sm">Join Now</a>
        </div>
      ) : null}
    </nav>
  );
}
