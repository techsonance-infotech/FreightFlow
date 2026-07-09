import type { Metadata } from 'next';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Insights, Guides & Compliance Articles — FreightFlow Blog',
  description: 'Read practical articles on statutory GST compliance, transport tax laws, driver registries, PostgreSQL security architecture, and logistics efficiency.',
};

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: 'Automating GST e-Invoice & e-Way Bill Gateways',
      excerpt: 'Learn how direct API integrations with the NIC portal can reduce dispatch delays and completely eliminate manual registration errors.',
      date: 'June 28, 2026',
      readTime: '5 min read',
      tag: 'Compliance',
      color: 'text-ff-teal-400 bg-ff-teal-500/10 border-ff-teal-500/20',
    },
    {
      id: 2,
      title: 'How Multi-Tenant Databases Ensure Freight Security',
      excerpt: 'A deep dive into PostgreSQL Row-Level Security (RLS) and encryption protocols securing shipper directories in shared database structures.',
      date: 'June 15, 2026',
      readTime: '6 min read',
      tag: 'Security',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      id: 3,
      title: 'Mitigating TDS Leakage Under Section 194C',
      excerpt: 'Transporter TDS deductions can become complex. Discover how automated registries and automatic PAN validation streamline transport accounting.',
      date: 'May 30, 2026',
      readTime: '4 min read',
      tag: 'Finance & Tax',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    'name': 'The FreightFlow Blog',
    'description': 'Practical articles on statutory compliance, transport tax laws, driver registries, and logistics efficiency.',
    'url': 'https://freightflow.techsonance.co.in/blog',
    'publisher': {
      '@type': 'Organization',
      'name': 'Techsonance InfoTech LLP',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://freightflow.techsonance.co.in/favicon_io/android-chrome-512x512.png'
      }
    },
    'blogPost': posts.map(post => ({
      '@type': 'BlogPosting',
      '@id': `https://freightflow.techsonance.co.in/blog#post-${post.id}`,
      'headline': post.title,
      'description': post.excerpt,
      'datePublished': post.id === 1 ? '2026-06-28T00:00:00Z' : post.id === 2 ? '2026-06-15T00:00:00Z' : '2026-05-30T00:00:00Z',
      'author': {
        '@type': 'Organization',
        'name': 'FreightFlow Team'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Techsonance InfoTech LLP'
      }
    }))
  };

  return (
    <main className="overflow-x-hidden min-h-screen flex flex-col bg-[#050D1E]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <Nav />

      {/* Hero Section */}
      <section 
        className="relative pt-36 pb-16 px-4 sm:px-6 lg:px-8 border-b border-white/5 overflow-hidden bg-[#050D1E]"
      >
        {/* Glowing blur blobs matching landing hero */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-12 left-1/4 w-[40vw] h-[40vw] rounded-full filter blur-[150px] opacity-[0.08]" style={{ background: '#2563EB' }} />
          <div className="absolute bottom-20 right-1/4 w-[35vw] h-[35vw] rounded-full filter blur-[120px] opacity-[0.05]" style={{ background: '#FFB300' }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <span className="inline-flex items-center text-ff-teal-300 font-extrabold text-[11px] sm:text-xs uppercase tracking-widest bg-ff-teal-500/10 px-3.5 py-1.5 rounded-full border border-ff-teal-500/30 shadow-lg shadow-ff-teal-500/10">
            Insights & Guides
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-6 mb-6 leading-tight">
            The FreightFlow <span className="text-transparent bg-clip-text bg-gradient-to-r from-ff-teal-400 to-ff-teal-300 drop-shadow-sm">Blog</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
            Practical articles on statutory compliance, transport tax laws, driver registries, and logistics efficiency.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex-grow relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article 
              key={post.id} 
              className="flex flex-col bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300 group"
            >
              {/* Decorative top colored border */}
              <div className="h-1 bg-gradient-to-r from-ff-teal-500 to-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />

              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${post.color}`}>
                      {post.tag}
                    </span>
                    <span className="text-white/40">{post.readTime}</span>
                  </div>
                  
                  <h2 className="text-lg font-bold text-white tracking-tight leading-snug group-hover:text-ff-teal-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                  <span className="text-white/30">{post.date}</span>
                  <span className="text-ff-teal-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Article &rarr;
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
