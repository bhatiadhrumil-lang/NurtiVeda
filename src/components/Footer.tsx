import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();
  const columns: Array<{ title: string; links: Array<{ label: string; to: string }> }> = [
    {
      title: "Product",
      links: [
        { label: "Analyze food", to: "/#home" },
        { label: "Meal log", to: "/meal-log" },
        { label: "Meal plans", to: "/meal-plans" },
        { label: "Dosha quiz", to: "/dosha-quiz" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Diets", to: "/#diets" },
        { label: "Ayurveda", to: "/#ayurveda" },
        { label: "Profile", to: "/profile" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Sign in", to: "/auth" },
        { label: "Complete profile", to: "/complete-profile" },
      ],
    },
  ];

  return (
    <footer className="bg-foreground text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4" aria-label="NutriVeda home">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <span className="font-serif text-xl font-semibold">NutriVeda</span>
            </Link>
            <p className="text-primary-foreground/70 max-w-sm mb-6">
              Discover the power of nutrition with AI-driven insights and ancient Ayurvedic wisdom. Your journey to better health starts here.
            </p>
            <p className="text-primary-foreground/60 text-xs max-w-sm">
              Nutrition estimates are AI-generated and informational only — not medical advice. Consult a professional for health decisions.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © {year} NutriVeda. All rights reserved.
          </p>
          <p className="text-primary-foreground/60 text-sm">
            Made for your health
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
