export default function PrivacyPage({ params }: { params: { niche: string } }) {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 capitalize text-white">Privacy Policy</h1>
        <div className="prose prose-invert space-y-4">
          <p>Last Updated: October 2026</p>
          <h2 className="text-xl font-semibold text-white">1. Analytics & Tracking</h2>
          <p>We use third-party analytics tools (including Google Analytics) to measure traffic. These tools use cookies to collect standard internet log information.</p>
          <h2 className="text-xl font-semibold text-white">2. Third-Party Advertising</h2>
          <p>We use third-party advertising companies (such as Google AdSense and Mediavine) to serve ads when you visit our Website. These companies may use aggregated information about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.</p>
          <h2 className="text-xl font-semibold text-white">3. Affiliate Disclosure</h2>
          <p>Some of the links on this website are affiliate links, meaning we may earn a commission if you click through and make a purchase. This comes at no additional cost to you.</p>
        </div>
      </div>
    </div>
  );
}
