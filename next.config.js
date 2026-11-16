/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/admin/academic/:path*',
        destination: '/principal/:path*',
        permanent: false,
      },
      {
        source: '/admin/finance/:path*',
        destination: '/finance/:path*',
        permanent: false,
      },
      {
        source: '/admin/hr/:path*',
        destination: '/hr/:path*',
        permanent: false,
      },
      {
        source: '/teacher/:path*',
        destination: '/teachers/:path*',
        permanent: false,
      },
      {
        source: '/parent/:path*',
        destination: '/parents/:path*',
        permanent: false,
      },
      {
        source: '/student/:path*',
        destination: '/students/:path*',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;