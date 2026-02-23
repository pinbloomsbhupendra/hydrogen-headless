import { Link } from 'react-router';
import { Money } from '@shopify/hydrogen';

const ComparisonTable = ({ prolock, guardian }) => {
    const prolockData = prolock;
    const guardianData = guardian;

    if (!prolockData || !guardianData) {
        // Fallback mock data for demonstration if products are missing in Shopify
        const mockProlock = prolockData || {
            title: "Prolock Original",
            descriptionHtml: "<ul><li>Standard Size for Easy Storage</li><li>Fits in Vehicle Glove Box</li><li>Up to $2000 Guaranteed Rebate</li></ul>",
            priceRange: { minVariantPrice: { amount: "199.0", currencyCode: "USD" } },
            images: { nodes: [{ url: "/prolock.png" }] }
        };
        const mockGuardian = guardianData || {
            title: "Prolock Guardian",
            descriptionHtml: "<ul><li>Larger Size for Enhanced Deterrence</li><li>Stored on Floor or Boot</li><li>Up to $1500 Guaranteed Rebate</li></ul>",
            priceRange: { minVariantPrice: { amount: "249.0", currencyCode: "USD" } },
            images: { nodes: [{ url: "/prolock guardian.png" }] }
        };

        return <ComparisonTable prolock={mockProlock} guardian={mockGuardian} />;
    }

    const renderPrice = (product) => {
        const price = product?.priceRange?.minVariantPrice;
        if (!price) return null;
        return (
            <div className="text-3xl font-black mb-8">
                <Money data={price} />
            </div>
        );
    };

    const renderFeatures = (product, defaultFeatures, isDark = false) => {
        const html = product?.descriptionHtml;
        const textColor = isDark ? 'text-black' : 'text-gray-800';
        const borderColor = isDark ? 'border-gray-500' : 'border-gray-200';

        // Check if we have a valid list in HTML
        if (html && html.includes('<li>')) {
            const items = html.match(/<li>(.*?)<\/li>/g).map(item => item.replace(/<\/?li>/g, ''));
            return (
                <ul className="w-full list-none p-0 m-0 flex flex-col gap-6">
                    {items.map((item, idx) => (
                        <li key={idx} className={`flex items-center pb-4 border-b ${borderColor}`}>
                            <div className="shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm mr-4">
                                {idx + 1}
                            </div>
                            <span className={`text-lg font-medium ${textColor}`} dangerouslySetInnerHTML={{ __html: item }} />
                        </li>
                    ))}
                </ul>
            );
        }

        // Fallback to hardcoded list if description is empty or not a list
        return (
            <ul className="w-full list-none p-0 m-0 flex flex-col gap-6">
                {defaultFeatures.map((feature, idx) => (
                    <li key={idx} className={`flex items-center pb-4 border-b ${idx === 2 ? 'border-transparent' : borderColor}`}>
                        <div className="shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm mr-4">
                            {idx + 1}
                        </div>
                        <span className={`text-lg font-medium ${textColor}`}>{feature}</span>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto my-10 font-sans">
            <div className="flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden relative bg-white">

                {/* VS Badge */}
                <div className="absolute left-1/2 top-[50%] md:top-[12rem] -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-16 h-16 bg-red-600 rounded-full border-4 border-white shadow-md">
                    <span className="text-white font-extrabold italic text-2xl">VS</span>
                </div>

                {/* Left Column: PROLOCK */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col items-center relative bg-gray-200 border-b border-gray-300 md:border-b-0 md:border-r">
                    <img src={prolockData.images.nodes[0]?.url || "/prolock.png"} alt={prolockData.title} className="h-32 md:h-40 object-contain mb-8" />
                    <h2 className="text-3xl font-black uppercase tracking-wider text-center flex items-center justify-center min-h-[4.5rem] leading-tight mb-2">
                        {prolockData.title}
                    </h2>

                    {renderPrice(prolockData)}

                    {renderFeatures(prolockData, [
                        "Standard Size for Easy Storage",
                        "Fits in Vehicle Glove Box",
                        "Up to $2000 Guaranteed Rebate"
                    ])}

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
                    <img src={guardianData.images.nodes[0]?.url || "/prolock guardian.png"} alt={guardianData.title} className="h-32 md:h-40 object-contain mb-8" />
                    <h2 className="text-3xl font-black uppercase tracking-wider text-center flex items-center justify-center min-h-[4.5rem] leading-tight mb-2 text-black">
                        {guardianData.title}
                    </h2>

                    {renderPrice(guardianData)}

                    {renderFeatures(guardianData, [
                        "Larger Size for Enhanced Deterrence",
                        "Stored on Floor or Boot",
                        "Up to $1500 Guaranteed Rebate"
                    ], true)}

                    <div className="mt-auto pt-12 w-full flex justify-center">
                        <Link
                            to="/buy-prolock-guardian"
                            className="bg-red-600 text-white font-bold italic px-12 py-3 text-xl rounded shadow hover:bg-red-700 transition-colors uppercase border-2 border-white whitespace-nowrap"
                        >
                            GUARDIAN
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Packaging Section */}
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