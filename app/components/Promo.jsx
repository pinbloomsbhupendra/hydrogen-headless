import React from 'react';

export default function Promo() {
    return (
        <section
            id="article-component"
            className="promo-section"
        >
            {/* RED BANNER TOP */}
            <div className="bg-prolock-red w-full py-4 mb-8 text-center px-4">
                <p className="text-white font-black text-sm md:text-xl uppercase tracking-widest leading-tight">
                    THE SPERLING PROLOCK NOT ONLY ACTS AS A VISIBLE DETERRENT
                    <br />
                    IT PHYSICALLY PREVENTS THE THIEF DRIVING OFF IN YOUR VEHICLE
                </p>
            </div>

            {/* THREE CARD CONTAINER */}
            <div className="flex justify-center px-4">
                <div className="w-full max-w-[1650px]">
                    <div className="promo-container flex-col lg:flex-row gap-4">
                        {/* LEFT PRODUCT - TRANSPARENT */}
                        <div className="hidden lg:flex promo-card promo-card-transparent items-center justify-center flex-[0_0_220px]">
                            <img
                                src="/img1.png"
                                alt="Prolock Original"
                                className="max-h-[650px] w-auto object-contain"
                            />
                        </div>

                        {/* CENTER CONTENT - GRAY CARD */}
                        <div className="promo-card promo-card-gray promo-content-card !py-12">
                            <h1 className="promo-heading !text-black text-4xl lg:text-[3.5rem] mb-6 whitespace-nowrap font-black tracking-tight">
                                UP TO $2000 GUARANTEED REBATE*
                            </h1>

                            <div className="flex flex-col md:flex-row items-stretch gap-10">
                                {/* DRIVER IMAGE */}
                                <div className="w-full md:w-[32%] shrink-0">
                                    <img
                                        src="/img3.png"
                                        alt="Prolock in Use"
                                        className="w-full h-full object-cover border border-gray-200"
                                    />
                                </div>

                                {/* TEXT */}
                                <div className="flex-1 flex flex-col justify-center">
                                    <p className="promo-text !text-left text-lg lg:text-2xl leading-snug mb-0 text-black font-medium">
                                        In the event of your vehicle being stolen with Prolock correctly
                                        fitted within one year of the purchase date (and your insurance
                                        company accepts the claim), we will pay up to $2000 of your motor
                                        vehicle insurance policy excess. Simply keep your record of
                                        purchase (receipt) in a safe place for one year. Fill in and
                                        return registration form on the packaging and contact Sperling
                                        Enterprises in the event of a claim.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT PRODUCT - TRANSPARENT */}
                        <div className="hidden lg:flex promo-card promo-card-transparent items-center justify-center flex-[0_0_220px]">
                            <img
                                src="/img2.png"
                                alt="Prolock Guardian"
                                className="max-h-[650px] w-auto object-contain"
                            />
                        </div>
                    </div>

                    {/* MOBILE PRODUCTS */}
                    <div className="flex lg:hidden gap-4 mt-8">
                        <div className="flex-1 flex justify-center py-4">
                            <img
                                src="/img1.png"
                                alt="Original"
                                className="h-56 object-contain"
                            />
                        </div>
                        <div className="flex-1 flex justify-center py-4">
                            <img
                                src="/img2.png"
                                alt="Guardian"
                                className="h-56 object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
