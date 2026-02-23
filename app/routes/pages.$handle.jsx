import { useLoaderData } from 'react-router';
import { Seo } from '@shopify/hydrogen';

export async function loader({ context, params }) {
    const { handle } = params;

    const { page } = await context.storefront.query(
        `
      query Page($handle: String!) {
        page(handle: $handle) {
          id
          title
          body
        }
      }
    `,
        {
            variables: { handle },
            cache: context.storefront.CacheLong(),
        }
    );

    if (!page) {
        throw new Response('Page not found', { status: 404 });
    }

    return { page };
}

export default function Page() {
    const { page } = useLoaderData();

    return (
        <div className="w-[85%] max-w-5xl mx-auto py-16 md:py-28 animate-fade-in">
            <Seo
                data={{
                    title: page.title,
                    description: page.body?.replace(/<[^>]+>/g, '').substring(0, 155),
                }}
            />

            {/* Heading - Centered */}
            <h1 className="text-4xl md:text-6xl italic-heavy text-[#001f3f] mb-12 uppercase text-center">
                {page.title}
            </h1>

            {/* Content - Left Aligned */}
            <div
                className="max-w-3xl mx-auto text-lg text-gray-700 leading-relaxed space-y-6 text-justify"
                dangerouslySetInnerHTML={{ __html: page.body }}
            />
        </div>
    );
}
