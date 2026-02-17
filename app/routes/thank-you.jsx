import { Link } from 'react-router';

export default function ThankYou() {
    return (
        <div className="min-h-screen bg-[#b3b3b3] flex flex-col items-center justify-center px-4">
            <div className="bg-white p-12 rounded-lg shadow-lg border-t-4 border-red-600 w-full max-w-2xl text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h3 className="text-3xl font-bold mb-4 text-[#1a1a1a] uppercase">Thank You!</h3>
                <p className="text-gray-600 mb-8 text-lg">
                    Your request has been submitted successfully.<br />
                    We will show the warranty on your dashboard shortly.
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Link
                        to="/dashboard"
                        className="bg-[#1a1a1a] text-white px-8 py-4 rounded font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors w-full md:w-auto"
                    >
                        Go to Dashboard
                    </Link>

                    <Link
                        to="/register-warranty"
                        className="bg-red-600 text-white px-8 py-4 rounded font-bold uppercase tracking-wider hover:bg-red-700 transition-colors w-full md:w-auto"
                    >
                        Register New Warranty
                    </Link>
                </div>
            </div>
        </div>
    );
}
