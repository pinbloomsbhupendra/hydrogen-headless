import React from 'react';
import { Link } from 'react-router-dom';

const ComparisonTable = () => {
    return (
        <div className="w-full max-w-7xl mx-auto my-10 font-sans">
            {/* Main Comparison Section */}
            <div className="flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden relative bg-white">

                {/* VS Badge - Absolute Centered */}
                <div className="absolute left-1/2 top-[12rem] -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-16 h-16 bg-red-600 rounded-full border-4 border-white shadow-md">
                    <span className="text-white font-extrabold italic text-2xl">VS</span>
                </div>

                {/* Left Column: PROLOCK */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col items-center relative bg-white border-b border-gray-200 md:border-b-0 md:border-r">
                    <img src="/prolock.png" alt="Prolock" className="h-32 md:h-40 object-contain mb-8" />
                    <h2 className="text-3xl font-black uppercase mb-10 tracking-wider text-center flex items-center justify-center min-h-[4.5rem] leading-tight">PROLOCK Test</h2>

                    <ul className="w-full list-none p-0 m-0 flex flex-col gap-6">
                        {/* Item 1 */}
                        <li className="flex items-center pb-4 border-b border-gray-200">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm mr-4">1</div>
                            <span className="text-2xl font-semibold text-gray-800">$79.99</span>
                        </li>
                        {/* Item 2 */}
                        <li className="flex items-center pb-4 border-b border-gray-200">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm mr-4">2</div>
                            <span className="text-lg font-medium text-gray-700">Fits in Vehicle Glove Box</span>
                        </li>
                        {/* Item 3 */}
                        <li className="flex items-center">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm mr-4">3</div>
                            <span className="text-lg font-medium text-gray-700">Up to $2000 Guaranteed Rebate</span>
                        </li>
                    </ul>

                    <div className="mt-auto pt-12 w-full flex justify-center">
                        <Link
                            to="/buy-prolock"
                            className="bg-red-600 text-white font-bold italic px-12 py-3 text-xl rounded shadow hover:bg-red-700 transition-colors uppercase whitespace-nowrap"
                        >
                            PROLOCK
                        </Link>
                    </div>
                </div>

                {/* Right Column: PROLOCK GUARDIAN */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col items-center relative bg-gray-400">
                    <img src="/prolock guardian.png" alt="Prolock Guardian" className="h-32 md:h-40 object-contain mb-8" />
                    <h2 className="text-3xl font-black uppercase mb-10 tracking-wider text-center flex items-center justify-center min-h-[4.5rem] leading-tight text-black">PROLOCK <br /> GUARDIAN</h2>

                    <ul className="w-full list-none p-0 m-0 flex flex-col gap-6">
                        {/* Item 1 */}
                        <li className="flex items-center pb-4 border-b border-gray-500">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm mr-4">1</div>
                            <span className="text-2xl font-semibold text-black">$69.99</span>
                        </li>
                        {/* Item 2 */}
                        <li className="flex items-center pb-4 border-b border-gray-500">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm mr-4">2</div>
                            <span className="text-lg font-medium text-black">Larger Size Stored on Floor or Boot</span>
                        </li>
                        {/* Item 3 */}
                        <li className="flex items-center">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm mr-4">3</div>
                            <span className="text-lg font-medium text-black">Up to $1500 Guaranteed Rebate</span>
                        </li>
                    </ul>

                    <Link to="/buy-prolock-guardian">
                        <div className="mt-auto pt-12 w-full flex justify-center">
                            <button className="bg-red-600 text-white font-bold italic px-12 py-3 text-xl rounded shadow hover:bg-red-700 transition-colors uppercase border-2 border-white whitespace-nowrap">
                                GUARDIAN
                            </button>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Bottom Packaging Images Section */}
            <div className="flex flex-col md:flex-row justify-center items-center mt-16 gap-10">
                <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white flex justify-center">
                    <img src="/img1.png" alt="Prolock Packaging" className="h-64 w-auto object-contain" />
                </div>
                <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white flex justify-center">
                    <img src="/img2.png" alt="Prolock Guardian Packaging" className="h-64 w-auto object-contain" />
                </div>
            </div>
        </div>
    );
};

export default ComparisonTable;