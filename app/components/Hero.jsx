import { Link } from 'react-router';

export default function Hero() {
    return (
        <section className="hero w-full relative">
            {/* Hero Background Image */}
            <div className="w-full h-[280px] sm:h-[380px] md:h-[500px] lg:h-[580px] overflow-hidden">
                <img
                    src="/car.png"
                    alt="Car with Prolock security system"
                    className="w-full h-full object-cover object-[center_30%]"
                />
            </div>

            {/* CTA Buttons — stacked in the center on mobile, spread apart on desktop */}
            <div className="absolute inset-0 flex flex-col justify-between items-center pt-3 pb-5 sm:pt-4 sm:pb-6 md:flex-row md:items-start md:justify-between md:pt-5 md:px-[10%]">
                {/* REGISTER WARRANTY — top on mobile, right on desktop */}
                <Link
                    to="/register-warranty"
                    className="hero-cta text-sm sm:text-base w-[80%] sm:w-[60%] md:w-auto md:order-2"
                >
                    REGISTER WARRANTY
                </Link>

                {/* BUY PROLOCK — bottom on mobile, left on desktop */}
                <Link
                    to="/comparison-table"
                    className="hero-cta text-sm sm:text-base w-[80%] sm:w-[60%] md:w-auto md:order-1"
                >
                    BUY PROLOCK
                </Link>
            </div>
        </section>
    );
}
