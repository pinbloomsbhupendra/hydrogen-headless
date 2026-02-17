import { useLoaderData } from 'react-router';


// Placeholder loader
export async function loader({ params }) {
    return {
        handle: params.handle,
        product: { title: 'Prolock Product', price: '$149.99' }
    };
}

export default function ProductPage() {
    const { product, handle } = useLoaderData();

    return (
        <div className="w-[80%] mx-auto py-20">
            <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
            <p className="text-gray-600 mb-8">Handle: {handle}</p>
            <button className="bg-red-600 text-white px-8 py-3 rounded">Add to Cart</button>
        </div>
    );
}
