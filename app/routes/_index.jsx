import Hero from '../components/Hero/Hero';
import Promo from '../components/Article/Article';

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