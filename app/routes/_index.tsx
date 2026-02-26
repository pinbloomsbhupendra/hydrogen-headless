import Hero from '~/components/Hero';
import Promo from '~/components/Promo';

export async function loader() {
    return new Response(null, {
        headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    });
}

/**
 * Index Route Component
 * 
 * Homepage route for the Prolock storefront.
 * Displays the guaranteed rebate promotion.
 * 
 * @component
 * @returns {JSX.Element} The homepage content
 */
export default function Index() {
    return (
        <>
            {/* Hero Section */}
            <Hero />

            {/* Promo Section */}
            <Promo />
        </>
    );
}