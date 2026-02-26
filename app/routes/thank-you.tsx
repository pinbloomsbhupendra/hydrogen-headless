import { Link } from 'react-router';

export default function ThankYou() {
    return (
        <div className="page-container-gray">
            <div className="form-card max-w-2xl text-center p-12">
                <div className="text-6xl mb-6">🎉</div>
                <h3 className="form-title-large font-bold mb-4 text-prolock-black uppercase">Thank You!</h3>
                <p className="text-gray-600 mb-8 text-lg">
                    Your request has been submitted successfully.<br />
                    We will show the warranty on your dashboard shortly.
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Link
                        to="/dashboard"
                        className="btn-secondary w-full md:w-auto text-center"
                    >
                        Go to Dashboard
                    </Link>

                    <Link
                        to="/register-warranty"
                        className="btn-form-submit w-full md:w-auto text-center"
                    >
                        Register New Warranty
                    </Link>
                </div>
            </div>
        </div>
    );
}
