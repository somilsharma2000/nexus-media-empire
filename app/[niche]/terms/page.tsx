export default function TermsPage({ params }: { params: { niche: string } }) {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 capitalize text-white">Terms of Service</h1>
        <div className="prose prose-invert space-y-4">
          <p>By accessing this website, you agree to be bound by these Terms of Service.</p>
          <h2 className="text-xl font-semibold text-white">Informational Purposes Only</h2>
          <p>All content provided on this publication is for informational purposes only. We make no representations as to the accuracy or completeness of any information on this site. Content regarding finance or cryptocurrency does not constitute financial advice.</p>
        </div>
      </div>
    </div>
  );
}
