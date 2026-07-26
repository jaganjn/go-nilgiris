import Link from "next/link";

export default function OwnerPendingPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-12 text-slate-900">
      <section className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-7 text-center shadow-sm sm:p-10">
        <div className="text-6xl">⏳</div>

        <p className="mt-6 text-sm font-bold uppercase tracking-widest text-amber-700">
          Registration received
        </p>

        <h1 className="mt-3 text-3xl font-black">
          Approval Pending
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          Your Go Nilgiris business-owner account has been created
          successfully. Our admin will review your details before
          activating owner access.
        </p>

        <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-left text-sm leading-6 text-amber-900">
          <p className="font-bold">What happens next?</p>

          <p className="mt-2">
            After approval, you will be able to submit and manage your
            business listing and view enquiries received for your
            business.
          </p>
        </div>

        <Link
          href="/"
          className="mt-7 inline-block rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-800"
        >
          Return to Website
        </Link>
      </section>
    </main>
  );
}
