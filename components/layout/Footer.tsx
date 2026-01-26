import Link from 'next/link';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Food Assistance Directory
            </h3>
            <p className="text-sm text-gray-600">
              A project by the Carteret County Food & Health Council to connect
              community members with food assistance resources.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Find Food Assistance
                </Link>
              </li>
              <li>
                <Link
                  href="/volunteers"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Volunteer Opportunities
                </Link>
              </li>
              <li>
                <Link
                  href="/portal/dashboard"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Organization Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Carteret County Food & Health Council</li>
              <li>Beaufort, NC</li>
              <li>
                <a
                  href="mailto:info@carteretfood.org"
                  className="hover:text-blue-600 transition-colors"
                >
                  info@carteretfood.org
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
          <p className="flex items-center justify-center">
            Made with <Heart className="w-4 h-4 mx-1 text-red-500" /> for
            Carteret County
          </p>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} Carteret County Food & Health
            Council
          </p>
        </div>
      </div>
    </footer>
  );
}
