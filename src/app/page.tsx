import Link from 'next/link'

const works = [
  { slug: 'transform9', title: 'Transform9', desc: 'AI voice agents for streamlined medical practices', tags: ['Web Design', 'Development', 'Brand Identity'] },
  { slug: 'planetono', title: 'Planetoño', desc: 'A fictional space-food website exploring 3D scroll interactions', tags: ['Web Design', 'Development', 'Motion Design'] },
  { slug: 'netti', title: 'Netti', desc: 'Comprehensive analysis of connection performance', tags: ['Product Design', 'Web Design', 'Graphic Design'] },
  { slug: 'flashlights', title: 'Flashlights', desc: 'Interactive history section for an advocacy project on jailhouse lawyers', tags: ['Web Design', 'Development', 'Motion Design'] },
  { slug: 'manatee-energy', title: 'Manatee Energy', desc: 'Heat pump installation company', tags: ['Web Design', 'Product Design', 'Illustration'] },
  { slug: 'abuk', title: 'Abuk', desc: 'Ukrainian audiobooks platform', tags: ['Product Design', 'Brand Identity', 'Illustration'] },
  { slug: 'malloy-banks', title: 'Malloy Banks', desc: 'Visual identity and website for a pre-tax benefits administration company', tags: ['Web Design', 'Motion Design', 'Brand Identity'] },
  { slug: 'immediate', title: 'Immediate', desc: 'Fintech service for effective employee payments', tags: ['Development', 'Web Design'] },
]

const services = ['Brand Identity', 'Development', 'Graphic Design', 'Illustration', 'Motion Design', 'Product Design', 'Web Design']

export default function Home() {
  return (
    <div>
      <section className="px-6 md:px-12 pt-16 pb-10">
        <h1 className="text-[18vw] md:text-[10vw] font-medium tracking-tight leading-none opacity-10 select-none">work</h1>
        <h2 className="text-4xl md:text-6xl font-medium tracking-tight leading-tight -mt-6 md:-mt-8">
          we offer the diversity<br />of skills
        </h2>
      </section>

      <section className="px-6 md:px-12 pb-10">
        <div className="flex flex-wrap gap-2">
          {services.map(s => (
            <button key={s} className="px-4 py-2 text-[13px] rounded-full border border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white transition-colors">
              {s}
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {works.map((work, i) => (
            <div key={work.slug} className={`group relative overflow-hidden rounded-2xl bg-black/5 dark:bg-white/5 aspect-[4/3] flex flex-col justify-end p-6 hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${i === 0 ? 'md:col-span-2' : ''}`}>
              <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {work.tags.map(t => (
                    <span key={t} className="text-[11px] px-2.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10">{t}</span>
                  ))}
                </div>
                <h3 className="text-2xl md:text-3xl font-medium tracking-tight">{work.title}</h3>
                <p className="text-[13px] opacity-50 mt-1">{work.desc}</p>
              </div>
              <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[12px] border border-current rounded-full px-3 py-1">quick view</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 py-20 border-t border-black/10 dark:border-white/10">
        <p className="text-[11px] uppercase tracking-widest opacity-40 mb-4">say hi :)</p>
        <h2 className="text-5xl md:text-7xl font-medium tracking-tight mb-8">How can we help?</h2>
        <Link href="/contact" className="inline-flex items-center gap-2 text-[14px] border border-current rounded-full px-6 py-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
          contact us →
        </Link>
      </section>
    </div>
  )
}
