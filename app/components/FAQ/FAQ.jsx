export default function FAQ() {
    return (
        <section className="w-[80%] mx-auto py-12">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
                <details className="p-4 border rounded shadow-sm group">
                    <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-lg">
                        How do I install Prolock?
                        <span className="transition group-open:rotate-180">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                        Prolock installs easily in seconds...
                    </p>
                </details>
                {/* More FAQs... */}
            </div>
        </section>
    );
}
