import React from 'react';
import './Article.css';

export default function Article() {
    return (
        <section
            id="article-component"
            className="bg-[#DADDDC] py-10 md:py-14 flex justify-center px-4"
        >
            {/* STRIP CONTAINER */}
            <div className="w-full max-w-[1400px] flex flex-col lg:flex-row items-stretch gap-2">

                {/* LEFT PRODUCT */}
                <div className="hidden lg:flex items-center justify-center w-[220px] mr-16">
                    <img
                        src="/img1.png"
                        alt="Prolock Original"
                        className="max-h-[520px] object-contain custom-shadow"
                    />
                </div>

                {/* CENTER light gray CONTENT */}
                <div className="flex-1 bg-[#E6E6E6] px-8 md:px-10 py-8 custom-shadow flex flex-col justify-center">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 text-[#1a1a1a] uppercase impact-text leading-none tracking-tight">
                        UP TO $2000 GUARANTEED REBATE*
                    </h1>

                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* DRIVER IMAGE */}
                        <div className="w-full md:w-[40%] shrink-0">
                            <img
                                src="/img3.png"
                                alt="Prolock in Use"
                                className="w-full h-auto object-cover border border-gray-100"
                            />
                        </div>

                        {/* TEXT */}
                        <div className="flex-1">
                            <p className="text-lg md:text-xl leading-relaxed text-[#1a1a1a] font-medium text-justify">
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

                {/* RIGHT PRODUCT */}
                <div className="hidden lg:flex items-center justify-center w-[220px] ml-16">
                    <img
                        src="/img2.png"
                        alt="Prolock Guardian"
                        className="max-h-[520px] object-contain custom-shadow"
                    />
                </div>

                {/* MOBILE PRODUCTS */}
                <div className="flex lg:hidden gap-4 mt-6">
                    <div className="flex-1 flex justify-center">
                        <img
                            src="/img1.png"
                            alt="Original"
                            className="h-44 object-contain custom-shadow"
                        />
                    </div>
                    <div className="flex-1 flex justify-center">
                        <img
                            src="/img2.png"
                            alt="Guardian"
                            className="h-44 object-contain custom-shadow"
                        />
                    </div>
                </div>

            </div>
        </section>
    );
}
