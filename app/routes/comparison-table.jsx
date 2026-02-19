import { useLoaderData } from 'react-router';
import ComparisonTable from '../components/ComparisonTable/comparison-table';

import { PRODUCT_COMPARISON_QUERY } from '~/graphql/product/queries';

export async function loader({ context }) {
  const { storefront } = context;

  try {
    const [prolockData, guardianData] = await Promise.all([
      storefront.query(PRODUCT_COMPARISON_QUERY, {
        variables: { handle: 'prolock' },
        cache: storefront.CacheNone(),
      }).catch(e => ({ error: e.message || 'Error fetching prolock' })),
      storefront.query(PRODUCT_COMPARISON_QUERY, {
        variables: { handle: 'prolock-guardian' },
        cache: storefront.CacheNone(),
      }).catch(e => ({ error: e.message || 'Error fetching guardian' }))
    ]);

    return {
      prolock: prolockData?.product || null,
      guardian: guardianData?.product || null,
      errors: {
        prolock: prolockData?.error,
        guardian: guardianData?.error
      }
    };
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
      <div className="w-[80%] mx-auto py-20">
        <h1 className="text-4xl font-bold mb-12 text-center">Compare Prolock</h1>
        <ComparisonTable prolock={prolock} guardian={guardian} errors={errors} />
      </div>
    </div>
  );
}
