import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Menu, X, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, username, signOut } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Analyze", href: "#analyze" },
    { name: "Diets", href: "#diets" },
    { name: "Ayurveda", href: "#ayurveda" },
  ];

  const handleGetStarted = () => {
    navigate("/auth");
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="#home" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">NutriVeda</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-foreground font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
          </div>

          <button className="md:hidden p-2 text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground font-medium py-2 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {username || "User"}
                  </span>
                  <Button variant="outline" size="default" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-1" /> Logout
                  </Button>
                </>
              ) : (
                <Button variant="hero" size="default" onClick={handleGetStarted}>
                  Get Started
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
