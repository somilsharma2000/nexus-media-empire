export default function ContactPage({ params }: { params: { niche: string } }) {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 capitalize text-white">Contact Us</h1>
        <div className="prose prose-invert space-y-4">
          <p>For editorial inquiries, advertising partnerships, or support, please email us at:</p>
          <p className="font-mono text-blue-400">contact@nexusmedia.com</p>
        </div>
      </div>
    </div>
  );
}
