import ComparisonTable from '../components/ComparisonTable/comparison-table';

export default function ComparisonPage() {
    return (
        <div className="w-full bg-white">
            <div className="w-[80%] mx-auto py-20">
                <h1 className="text-4xl font-bold mb-12 text-center">Compare Prolock</h1>
                <ComparisonTable />
            </div>
        </div>
    );
}
