/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Lint errors will be shown as warnings during dev but won't fail production builds.
    // Fix remaining lint issues incrementally before launch.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors are caught during dev; build proceeds for deployment.
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
