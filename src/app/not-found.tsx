import Link from 'next/link';
import { CreditCard, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-200">
          <CreditCard className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Page Not Found</h1>
        <p className="text-xs text-slate-500">
          The page or digital visiting card you are looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
        </div>
        <div className="pt-4 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">Powered by TapCard</span>
        </div>
      </div>
    </div>
  );
}
