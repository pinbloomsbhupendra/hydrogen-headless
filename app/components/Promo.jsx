import React from 'react';

export default function Promo() {
    return (
        <section id="article-component" className="promo-section">

            {/* RED BANNER TOP */}

            <div className="bg-prolock-red w-full py-4 mb-6 md:mb-8 text-center px-4 -mt-[30px] md:-mt-[57px] relative z-20"
                style={{
                    fontSize: "10px",
                }}  >
                <p className="text-white font-black text-xs sm:text-sm md:text-xl uppercase tracking-widest leading-tight">
                    THE SPERLING PROLOCK NOT ONLY ACTS AS A VISIBLE DETERRENT
                    <br />
                    IT PHYSICALLY PREVENTS THE THIEF DRIVING OFF IN YOUR VEHICLE
                </p>
            </div>

            {/* MAIN CONTENT CARD — full width on mobile, flanked by product images on desktop */}
            <div className="px-3 md:px-6">
                <div className="flex items-stretch gap-3 max-w-[1650px] mx-auto">

                    {/* LEFT PRODUCT IMAGE — desktop only */}
                    <div className="hidden lg:flex items-center justify-center flex-shrink-0 w-[200px] xl:w-[240px]">
                        <img
                            src="/Product/img1.png"
                            alt="Prolock Original"
                            width="240"
                            height="600"
                            className="max-h-[600px] w-auto object-contain"
                        />
                    </div>

                    {/* CENTER GRAY CARD */}
                    <div className="flex-1 min-w-0 bg-[#E6E6E6] p-5 sm:p-8 lg:p-12">

                        <h2 className="promo-heading !text-black mb-5 font-black tracking-tight">
                            UP TO $2000 GUARANTEED REBATE*
                        </h2>

                        <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8 md:gap-10">
                            {/* DRIVER IMAGE */}
                            <div className="w-full sm:w-[38%] md:w-[32%] flex-shrink-0">
                                <img
                                    src="/Hero/img3.png"
                                    alt="Prolock in Use"
                                    width="400"
                                    height="300"
                                    className="w-full object-cover border border-gray-200"
                                />
                            </div>

                            {/* TEXT */}
                            <div className="flex-1 flex flex-col justify-center">
                                <p className="text-base md:text-lg lg:text-xl leading-relaxed text-black font-medium text-justify">
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

                        {/* MOBILE: product images shown inside card */}
                        <div className="flex lg:hidden gap-4 mt-8 justify-center">
                            <div className="flex-1 flex justify-center">
                                <img
                                    src="/Product/img1.png"
                                    alt="Prolock Original"
                                    width="200"
                                    height="200"
                                    className="h-44 sm:h-56 object-contain"
                                />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <img
                                    src="/Product/img2.png"
                                    alt="Prolock Guardian"
                                    width="200"
                                    height="200"
                                    className="h-44 sm:h-56 object-contain"
                                />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PRODUCT IMAGE — desktop only */}
                    <div className="hidden lg:flex items-center justify-center flex-shrink-0 w-[200px] xl:w-[240px]">
                        <img
                            src="/Product/img2.png"
                            alt="Prolock Guardian"
                            width="240"
                            height="600"
                            className="max-h-[600px] w-auto object-contain"
                        />
                    </div>

                </div>
            </div>
        </section >
    );
}
