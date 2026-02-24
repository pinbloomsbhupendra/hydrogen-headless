import { Link } from 'react-router';

export default function Hero() {
    return (
        <section className="w-full relative">
            {/* Hero Background Image */}
            <div className="w-full h-[260px] sm:h-[340px] md:h-[460px] lg:h-[560px] overflow-hidden">
                <img
                    src="/Hero/car.png"
                    alt="Car with Prolock security system"
                    className="w-full h-full object-cover object-[center_30%]"
                />
            </div>

            {/* CTA Buttons overlay */}
            <div className="absolute inset-0 flex flex-col justify-between items-center px-6 pt-3 pb-4 sm:pt-4 sm:pb-5 md:flex-row md:items-start md:justify-between md:px-[8%] md:pt-6">

                {/* REGISTER WARRANTY — top on mobile, right on desktop */}
                <Link
                    to="/register-warranty"
                    className="hero-cta w-full max-w-[280px] sm:max-w-[320px] md:w-auto md:max-w-none md:order-2 text-sm sm:text-base"
                >
                    REGISTER WARRANTY
                </Link>

                {/* BUY PROLOCK — bottom on mobile, left on desktop */}
                <Link
                    to="/comparison-table"
                    className="hero-cta w-full max-w-[280px] sm:max-w-[320px] md:w-auto md:max-w-none md:order-1 text-sm sm:text-base"
                >
                    BUY PROLOCK
                </Link>
            </div>
        </section>
    );
}
