export default function AboutPage({ params }: { params: { niche: string } }) {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 capitalize text-white">About Us</h1>
        <div className="prose prose-invert">
          <p>Welcome to our {params.niche} publication. We are dedicated to providing the highest quality news, analytics, and market sentiment.</p>
          <p>Our editorial team utilizes advanced aggregation models to ensure you receive timely, accurate, and actionable information.</p>
        </div>
      </div>
    </div>
  );
}
