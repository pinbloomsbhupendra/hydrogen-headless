import { Link } from 'react-router';

export const Footer = () => {
    return (
        <footer className="w-full">
            {/* Top Red Section */}
            <div className="bg-prolock-red">
                <div className="max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-12 flex flex-col md:flex-row justify-between items-start gap-8 md:gap-4">

                    {/* Logo Section */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-[36px] md:text-[52px] logo-text text-black select-none flex items-start">
                            PROLOCK<span className="text-[9px] md:text-[11px] not-italic ml-0.5 font-black mt-1">TM</span>
                        </Link>
                    </div>

                    {/* Links Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-6 text-white w-full md:w-auto">
                        {/* Column 1: Prolock */}
                        <div className="flex flex-col space-y-1.5">
                            <h3 className="text-[17px] font-extrabold mb-1">Prolock</h3>
                            <Link to="/prolock" className="hover:text-black transition-colors duration-200 text-sm font-semibold">Prolock Original</Link>
                            <Link to="/prolock-guardian" className="hover:text-black transition-colors duration-200 text-sm font-semibold">Prolock Guardian</Link>
                            <Link to="/login" className="hover:text-black transition-colors duration-200 text-sm font-semibold">Account Login</Link>
                        </div>

                        {/* Column 2: Information */}
                        <div className="flex flex-col space-y-1.5">
                            <h3 className="text-[17px] font-extrabold mb-1">Information</h3>
                            <a href="#" className="hover:text-black transition-colors duration-200 text-sm font-semibold">Cookie Policy</a>
                            <a href="#" className="hover:text-black transition-colors duration-200 text-sm font-semibold">Privacy Policy</a>
                            <a href="#" className="hover:text-black transition-colors duration-200 text-sm font-semibold">Shipping & Returns</a>
                        </div>

                        {/* Column 3: About */}
                        <div className="flex flex-col space-y-1.5">
                            <h3 className="text-[17px] font-extrabold mb-1">About</h3>
                            <a href="#" className="hover:text-black transition-colors duration-200 text-sm font-semibold">About Us</a>
                            <a href="#" className="hover:text-black transition-colors duration-200 text-sm font-semibold">Contact Us</a>
                            <a href="#" className="hover:text-black transition-colors duration-200 text-sm font-semibold">Terms & Conditions</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Black Attribution Bar */}
            <div className="bg-prolock-black-alt text-white py-5 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Left: Copyright */}
                    <div className="text-[11px] font-bold uppercase tracking-wider opacity-50 order-2 md:order-1">
                        &copy; Prolock AU All Rights Reserved 2026
                    </div>

                    {/* Center: Brand Info */}
                    <div className="text-[11px] font-bold uppercase tracking-wider opacity-50 order-3 md:order-2">
                        Prolock is a Sperling Brand
                    </div>

                    {/* Right: Brand Logo - Styled as a pill like the original */}
                    <div className="order-1 md:order-3">
                        <div className="bg-transparent border border-white/10 rounded-full px-4 py-1.5 flex items-center group cursor-pointer hover:border-white/30 transition-all">
                            <div className="w-20 h-5 flex items-center justify-center">
                                <svg viewBox="0 0 100 30" className="w-full h-full" aria-label="Sperling Logo">
                                    <ellipse cx="50" cy="15" rx="48" ry="13" fill="none" stroke="white" strokeWidth="0.8" />
                                    <text x="50" y="21" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="serif" className="sperling-italic">
                                        S<tspan fontSize="10" fontStyle="normal" fontWeight="bold" fontFamily="sans-serif">PERLING</tspan>
                                    </text>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
