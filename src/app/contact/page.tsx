
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Contact Us | Snug",
  description:
    "Get in touch with Snug for questions, feedback, or partnership inquiries.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 px-5 py-20">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur-md md:p-12">
          <div className="mb-6 inline-flex rounded-2xl bg-indigo-100 p-4 text-indigo-600">
            <Mail size={30} />
          </div>

          <h1 className="mb-4 text-4xl font-bold text-slate-900">
            Contact Snug
          </h1>

          <p className="mb-8 leading-7 text-slate-600">
            Have a question, suggestion, or partnership inquiry?
            We'd love to hear from you.
          </p>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6">
            <p className="mb-2 text-sm font-medium text-slate-500">
              Email us at
            </p>

            <a
              href="mailto:snug.support.online@gmail.com"
              className="break-all text-lg font-semibold text-indigo-700 hover:underline"
            >
              snug.support.online@gmail.com
            </a>
          </div>

          <p className="mt-8 text-sm leading-6 text-slate-500">
            For product purchases, order tracking, returns, and
            refunds, please contact the retailer directly.
            Snug is a product discovery website and does not
            process orders.
          </p>
        </div>
      </div>
    </main>
  );
}
