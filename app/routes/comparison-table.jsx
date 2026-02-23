import { useLoaderData, Await } from 'react-router';
import { Suspense } from 'react';
import ComparisonTable from '../components/ComparisonTable/comparison-table';

import { PRODUCT_COMPARISON_QUERY } from '~/graphql/product/queries';

export async function loader({ context }) {
  const { storefront } = context;

  const dataPromise = Promise.all([
    storefront.query(PRODUCT_COMPARISON_QUERY, {
      variables: { handle: 'prolock' },
      cache: storefront.CacheLong(),
    }).catch(e => ({ error: e.message || 'Error fetching prolock' })),
    storefront.query(PRODUCT_COMPARISON_QUERY, {
      variables: { handle: 'prolock-guardian' },
      cache: storefront.CacheLong(),
    }).catch(e => ({ error: e.message || 'Error fetching guardian' }))
  ]).then(([prolockData, guardianData]) => {
    return {
      prolock: prolockData?.product || null,
      guardian: guardianData?.product || null,
      errors: {
        prolock: prolockData?.error,
        guardian: guardianData?.error
      }
    };
  });

  return { comparisonData: dataPromise };
}

export default function ComparisonPage() {
  const { comparisonData } = useLoaderData();

  return (
    <div className="w-full bg-white">
      <div className="w-[80%] mx-auto py-20">
        <h1 className="text-4xl font-bold mb-12 text-center">Compare Prolock</h1>
        <Suspense fallback={<div className="p-20 text-center italic text-gray-400">Loading comparison details...</div>}>
          <Await resolve={comparisonData}>
            {({ prolock, guardian, errors }) => (
              <ComparisonTable prolock={prolock} guardian={guardian} errors={errors} />
            )}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }) {
  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Page</h1>
      <p className="text-gray-600 mb-6">
        {error?.message || 'There was an issue loading the comparison data.'}
      </p>
    </div>
  );
}

