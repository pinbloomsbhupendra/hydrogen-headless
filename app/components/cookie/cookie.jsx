import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
    // Set to true by default for testing/design as requested
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Commenting out logic that hides it if accepted, to keep it visible on refresh
        // const consent = localStorage.getItem('cookieConsent');
        // if (!consent) {
        //     setIsVisible(true);
        // }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] bg-slate-50 border border-gray-200 shadow-2xl rounded-xl p-6 z-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
                <p className="text-gray-700 text-sm md:text-base leading-relaxed font-medium italic">
                    111111111We and our partners, including Shopify, use cookies and other technologies to personalize your experience, show you ads, and perform analytics, and we will not use cookies or other technologies for these purposes unless you accept them. Learn more in our <Link to="/policies/privacy-policy" className="underline hover:text-red-600 transition-colors">Cookie Policy</Link>.
                </p>
            </div>
            <div className="flex gap-4 shrink-0">
                <button
                    onClick={handleAccept}
                    className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold py-2 px-8 rounded transition-colors text-sm uppercase tracking-wider"
                >
                    Accept
                </button>
                <button
                    onClick={handleDecline}
                    className="bg-white text-gray-700 font-semibold py-2 px-8 rounded transition-colors text-sm uppercase tracking-wider border border-gray-300 hover:bg-gray-50"
                >
                    Decline
                </button>
            </div>
        </div>
    );
};

export default CookieBanner;
