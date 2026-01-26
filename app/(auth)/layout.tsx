import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">
              FA
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Food Assistance Directory
          </h1>
          <p className="text-gray-600">Carteret County, NC</p>
        </div>
        {children}
        <p className="mt-8 text-center text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">
            Return to Directory
          </Link>
        </p>
      </div>
    </div>
  );
}
