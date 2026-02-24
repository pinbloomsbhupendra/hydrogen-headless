import { Link } from 'react-router';
import { Money, Image } from '@shopify/hydrogen';

const ComparisonTable = ({ prolock, guardian }) => {
    const prolockData = prolock;
    const guardianData = guardian;

    if (!prolockData || !guardianData) {
        return (
            <div className="text-center p-20">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Product Data Unavailable</h2>
                <p className="text-gray-600">Could not fetch product details from Shopify.</p>
            </div>
        );
    }

    // Helper to get raw price string or Money component
    const PriceDisplay = ({ product }) => {
        const price = product?.priceRange?.minVariantPrice;
        if (!price) return null;
        return <Money data={price} />;
    };

    const featuresProlock = [
        <PriceDisplay product={prolockData} />,
        "Fits in Vehicle Glove Box",
        "Up to $2000 Guaranteed Rebate"
    ];

    const featuresGuardian = [
        <PriceDisplay product={guardianData} />,
        <span className="whitespace-nowrap tracking-tighter sm:tracking-normal text-[10.5px] sm:text-sm md:text-xl md:tracking-normal">Larger Size Stored on Floor or Boot</span>,
        "Up to $1500 Guaranteed Rebate"
    ];

    return (
        <div className="w-full bg-white pb-10">
            {/* Split Comparison Section - Edge to Edge */}
            <div className="flex flex-row w-full relative">

                {/* Left Column: PROLOCK (White) */}
                <div className="w-1/2 flex flex-col items-center bg-white border-r border-[#d1d5db]">
                    {/* Top Section */}
                    <div className="h-[200px] md:h-[320px] w-full flex flex-col items-center justify-end pb-4 md:pb-10">
                        <div className="h-[100px] sm:h-[140px] md:h-[200px] w-full flex items-center justify-center mb-4 md:mb-8 px-4 md:px-8">
                            {prolockData.images.nodes[0] ? (
                                <Image
                                    data={prolockData.images.nodes[0]}
                                    className="max-h-full w-auto object-contain mix-blend-darken"
                                    sizes="(min-width: 768px) 400px, 200px"
                                />
                            ) : (
                                <img src="/Product/img1.png" alt={prolockData.title} className="max-h-full w-auto object-contain mix-blend-darken" />
                            )}
                        </div>
                        <h2 className="text-lg md:text-3xl lg:text-4xl font-bold uppercase tracking-widest text-[#0f172a] text-center flex items-center justify-center h-12 md:h-20 leading-none">
                            PROLOCK
                        </h2>
                    </div>

                    {/* Features List */}
                    <ul className="w-full list-none p-0 m-0 flex flex-col border-t border-[#d1d5db]">
                        {featuresProlock.map((feature, idx) => (
                            <li key={idx} className={`py-4 md:py-6 border-b ${idx === 2 ? 'border-transparent' : 'border-[#d1d5db]'} flex justify-center w-full`}>
                                <div className="flex items-center w-full max-w-[220px] md:max-w-[420px] px-2 md:px-6">
                                    <div className="shrink-0 w-6 h-6 md:w-9 md:h-9 rounded-full bg-[#e60000] flex items-center justify-center text-white font-bold text-[11px] md:text-base mr-3 md:mr-6">
                                        {idx + 1}
                                    </div>
                                    <div className="text-sm md:text-xl font-normal text-gray-800 text-left w-full">
                                        {feature}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Button */}
                    <div className="mt-8 md:mt-12 mb-8 md:mb-16 w-full flex justify-center">
                        <Link to="/prolock" prefetch="intent">
                            <button className="bg-[#e60000] text-white font-bold px-8 md:px-14 py-2 md:py-4 text-sm md:text-2xl hover:bg-red-700 transition-colors uppercase tracking-wider">
                                PROLOCK
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Right Column: PROLOCK GUARDIAN (Gray) */}
                <div className="w-1/2 flex flex-col items-center bg-[#b1b5bb]">
                    {/* Top Section */}
                    <div className="h-[200px] md:h-[320px] w-full flex flex-col items-center justify-end pb-4 md:pb-10">
                        <div className="h-[100px] sm:h-[140px] md:h-[200px] w-full flex items-center justify-center mb-4 md:mb-8 px-4 md:px-8">
                            {guardianData.images.nodes[0] ? (
                                <Image
                                    data={guardianData.images.nodes[0]}
                                    className="max-h-full w-auto object-contain mix-blend-darken"
                                    sizes="(min-width: 768px) 400px, 200px"
                                />
                            ) : (
                                <img src="/Product/img2.png" alt={guardianData.title} className="max-h-full w-auto object-contain mix-blend-darken" />
                            )}
                        </div>
                        <h2 className="text-lg md:text-3xl lg:text-4xl font-bold uppercase tracking-widest text-[#0f172a] text-center flex flex-col items-center justify-center h-12 md:h-20 leading-tight md:leading-snug">
                            <span>PROLOCK</span>
                            <span>GUARDIAN</span>
                        </h2>
                    </div>

                    {/* Features List */}
                    <ul className="w-full list-none p-0 m-0 flex flex-col border-t border-[#9ca3af]">
                        {featuresGuardian.map((feature, idx) => (
                            <li key={idx} className={`py-4 md:py-6 border-b ${idx === 2 ? 'border-transparent' : 'border-[#9ca3af]'} flex justify-center w-full`}>
                                <div className="flex items-center w-full max-w-[220px] md:max-w-[420px] px-2 md:px-6">
                                    <div className="shrink-0 w-6 h-6 md:w-9 md:h-9 rounded-full bg-[#e60000] flex items-center justify-center text-white font-bold text-[11px] md:text-base mr-3 md:mr-6">
                                        {idx + 1}
                                    </div>
                                    <div className="text-sm md:text-xl font-normal text-gray-900 text-left w-full">
                                        {feature}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Button */}
                    <div className="mt-8 md:mt-12 mb-8 md:mb-16 w-full flex justify-center">
                        <Link to="/prolock-guardian" prefetch="intent">
                            <button className="bg-[#e60000] text-white font-bold px-8 md:px-14 py-2 md:py-4 text-sm md:text-2xl hover:bg-red-700 transition-colors uppercase tracking-wider border-2 md:border-[3px] border-white">
                                GUARDIAN
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Center VS Badge */}
                <div className="absolute left-1/2 top-[160px] md:top-[280px] -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 md:w-16 md:h-16 bg-[#e60000] rounded-full">
                    <span className="text-white font-extrabold text-sm md:text-2xl tracking-tighter">VS</span>
                </div>
            </div>

            {/* Bottom Packaging Images Section */}
            <div className="flex flex-row justify-center items-center mt-6 md:mt-12 gap-8 md:gap-32 w-full bg-white px-4">
                <div className="flex justify-center p-2">
                    <img src="/Product/img1.png" alt="Prolock Packaging" width="300" height="280" style={{ height: '280px', width: 'auto', maxWidth: '100%' }} className="object-contain drop-shadow-lg transform transition-transform hover:scale-105 rounded-xl border border-gray-100" />
                </div>
                <div className="flex justify-center p-2">
                    <img src="/Product/img2.png" alt="Prolock Guardian Packaging" width="300" height="280" style={{ height: '280px', width: 'auto', maxWidth: '100%' }} className="object-contain drop-shadow-lg transform transition-transform hover:scale-105 rounded-xl border border-gray-100" />
                </div>
            </div>
        </div>
    );
};

export default ComparisonTable;