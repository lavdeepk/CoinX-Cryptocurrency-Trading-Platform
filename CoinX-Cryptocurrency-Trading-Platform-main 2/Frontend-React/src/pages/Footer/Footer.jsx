// Page component for Footer.
import { Link } from "react-router-dom";
import { Twitter, Github, Linkedin, Mail } from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = [
        { name: "Markets", path: "/" },
        { name: "Portfolio", path: "/portfolio" },
        { name: "Watchlist", path: "/watchlist" },
        { name: "Activity", path: "/activity" },
        { name: "Privacy", path: "#" },
        { name: "Terms", path: "#" },
    ];

    const socialLinks = [
        { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
        { icon: Github, href: "https://github.com", label: "GitHub" },
        { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
        { icon: Mail, href: "mailto:hello@coinx.com", label: "Email" },
    ];

    return (
        <footer className="relative mt-16 border-t border-white/10 bg-slate-950/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    {/* Brand */}
                    <div className="flex flex-col items-center gap-1 md:items-start">
                        <h3 className="text-xl font-bold text-white">
                            <span className="gradient-text-orange">Coin</span>
                            <span className="gradient-text">X</span>
                        </h3>
                        <p className="text-xs text-slate-400">Secure crypto trading and portfolio intelligence</p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        {footerLinks.map((link, index) => (
                            link.path.startsWith('/') ? (
                                <Link
                                    key={index}
                                    to={link.path}
                                    className="text-slate-400 hover:text-cyan-200 text-sm transition-colors duration-200"
                                >
                                    {link.name}
                                </Link>
                            ) : (
                                <a
                                    key={index}
                                    href={link.path}
                                    className="text-slate-400 hover:text-cyan-200 text-sm transition-colors duration-200"
                                >
                                    {link.name}
                                </a>
                            )
                        ))}
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center gap-3">
                        {socialLinks.map((social, index) => (
                            <a
                                key={index}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={social.label}
                                className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-cyan-300/40 hover:bg-cyan-300/10 transition-all duration-200 group"
                            >
                                <social.icon className="h-4 w-4 text-slate-400 group-hover:text-cyan-200 transition-colors duration-200" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 pt-8 border-t border-white/10 text-center">
                    <p className="text-slate-500 text-sm">
                        © {currentYear} CoinX. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
