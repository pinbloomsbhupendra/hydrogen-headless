import { Link } from 'react-router';

// /**
//  * Hero Component
//  * 
//  * Main hero section for the Prolock homepage featuring:
//  * - Full-width hero image with car visual
//  * - Two prominent CTA buttons (Register Warranty & Buy Prolock)
//  * - Responsive layout that adapts from mobile to desktop
//  * - Product description banner (desktop only)
//  * 
//  * @component
//  * @returns {JSX.Element} The hero section component
//  * 
//  * @example
//  * <Hero />
//  */
export default function Hero() {
    return (
        <section className="hero w-full relative">
            {/* Call-to-Action Buttons Container
                Mobile: Stacked vertically with Register Warranty at top, Buy Prolock at bottom
                Desktop: Horizontal layout with Buy Prolock on left, Register Warranty on right */}
            <div className="absolute top-0 z-10 w-[80%] left-1/2 -translate-x-1/2 h-full flex flex-col justify-start md:justify-between items-center md:flex-row md:items-start pt-4">
                {/* REGISTER WARRANTY - Top center on mobile, right on desktop */}
                <Link
                    to="/register-warranty"
                    className="hero-cta w-[90%] max-w-sm md:max-w-none md:w-auto mb-0 md:mb-0 md:order-2"
                >
                    REGISTER WARRANTY
                </Link>

                {/* Secondary CTA: Buy Prolock
                    Positioned at bottom-center on mobile, left side on desktop
                    Matching styling for visual consistency */}
                <Link
                    to="/comparison-table"
                    className="hero-cta w-[90%] max-w-sm md:max-w-none md:w-auto mt-auto mb-20 md:mt-0 md:mb-0 md:order-1"
                >
                    BUY PROLOCK
                </Link>
            </div>

            {/* Hero Background Image
                Responsive height: 300px on mobile, 400px on desktop
                Image positioned to show center-top area for optimal visual impact */}
            <div className="hero-image w-full h-[300px] md:h-[550px] overflow-hidden">
                <img
                    src="/car.png"
                    alt="Car with Prolock security system"
                    className="w-full h-full object-cover object-[center_30%]"
                />
            </div>

        </section>
    );
}
