import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-display text-2xl text-navy">FoodAssist</span>
          </Link>
          <p className="text-sm text-muted-text mt-2">Carteret County, NC</p>
        </div>
        {children}
        <p className="mt-8 text-center text-sm text-muted-text">
          <Link href="/" className="hover:text-navy transition-colors">
            Return to Directory
          </Link>
        </p>
      </div>
    </div>
  );
}
