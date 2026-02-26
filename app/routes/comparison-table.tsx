import { useLoaderData } from 'react-router';
import ComparisonTable from '../components/ComparisonTable/comparison-table';

import { PRODUCT_COMPARISON_QUERY } from '~/graphql/product/queries';

export async function loader({ context }) {
  const { storefront } = context;

  try {
    const [prolockData, guardianData] = await Promise.all([
      storefront.query(PRODUCT_COMPARISON_QUERY, {
        variables: { handle: 'prolock' },
        cache: storefront.CacheLong(),
      }).catch(e => ({ error: e.message || 'Error fetching prolock' })),
      storefront.query(PRODUCT_COMPARISON_QUERY, {
        variables: { handle: 'prolock-guardian' },
        cache: storefront.CacheLong(),
      }).catch(e => ({ error: e.message || 'Error fetching guardian' }))
    ]);

    // Return data with browser caching instructions (1 hour)
    return new Response(JSON.stringify({
      prolock: prolockData?.product || null,
      guardian: guardianData?.product || null,
      errors: {
        prolock: prolockData?.error,
        guardian: guardianData?.error
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Comparison loader error:', error);
    return { prolock: null, guardian: null, errors: { global: error.message } };
  }
}

export default function ComparisonPage() {
  const { prolock, guardian, errors } = useLoaderData();

  if (errors?.global) {
    return <div className="p-10 text-center text-red-600">Error: {errors.global}</div>;
  }

  console.log('Loader Data:', { prolock, guardian, errors });

  return (
    <div className="w-full bg-white">
      <ComparisonTable prolock={prolock} guardian={guardian} errors={errors} />
    </div>
  );
}
