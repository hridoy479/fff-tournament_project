
import Link from 'next/link';

export default function PaymentFailure() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Failed</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Unfortunately, your payment could not be processed. Please try again or contact support.
        </p>
        <Link href="/add-money">
          <a className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Try Again
          </a>
        </Link>
      </div>
    </div>
  );
}
