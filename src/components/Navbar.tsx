import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Leaf, Menu, X, LogOut, User, Moon, Sun } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const { user, username, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("nutriveda-theme", dark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, [dark]);

  useEffect(() => {
    try {
      if (localStorage.getItem("nutriveda-theme") === "dark") {
        document.documentElement.classList.add("dark");
        setDark(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const goAnchor = (hash: string) => {
    setIsOpen(false);
    if (location.pathname !== "/") {
      navigate(`/${hash}`);
    } else {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goRoute = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const anchorLinks = [
    { name: "Home", hash: "#home" },
    { name: "Analyze", hash: "#analyze" },
    { name: "Diets", hash: "#diets" },
    { name: "Ayurveda", hash: "#ayurveda" },
  ];
  const routeLinks = [
    { name: "Meal Log", path: "/meal-log" },
    { name: "Meal Plans", path: "/meal-plans" },
    { name: "Dosha Quiz", path: "/dosha-quiz" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => goRoute("/")} className="flex items-center gap-2 group" aria-label="NutriVeda home">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">NutriVeda</span>
          </button>

          <div className="hidden md:flex items-center gap-6">
            {anchorLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => goAnchor(link.hash)}
                className="text-muted-foreground hover:text-foreground font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
              >
                {link.name}
              </button>
            ))}
            {routeLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => goRoute(link.path)}
                className="text-muted-foreground hover:text-foreground font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-border/50 p-1 pr-3 hover:bg-accent transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {username ? username[0].toUpperCase() : <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">{username || "Profile"}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/meal-log")}>Meal Log</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/meal-plans")}>Meal Plans</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" onClick={() => navigate("/auth")}>Get Started</Button>
            )}
          </div>

          <div className="md:hidden flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <button className="p-2 text-foreground" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? "Close menu" : "Open menu"} aria-expanded={isOpen}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-1">
              {anchorLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => goAnchor(link.hash)}
                  className="text-muted-foreground hover:text-foreground font-medium py-2 transition-colors text-left"
                >
                  {link.name}
                </button>
              ))}
              {routeLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => goRoute(link.path)}
                  className="text-muted-foreground hover:text-foreground font-medium py-2 transition-colors text-left"
                >
                  {link.name}
                </button>
              ))}
              <div className="pt-3 mt-2 border-t border-border/50 flex gap-2">
                {user ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => goRoute("/profile")}>Profile</Button>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={handleSignOut}>Sign out</Button>
                  </>
                ) : (
                  <Button size="sm" className="flex-1" onClick={() => goRoute("/auth")}>Get Started</Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
