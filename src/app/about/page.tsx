const stats = [
  { value: '1000+', label: 'Projects' },
  { value: '160', label: 'Awards' },
  { value: '13', label: 'Years of experience' },
]

const awards = [
  { org: 'Awwwards', items: ['11× Site Of The Day', '2× Agency Of The Year Nominee', '23× Honorable Mention'] },
  { org: 'The Webby Awards', items: ['3× Webby Winner', '2× Webby People\'s Voice Winner', '6× Webby Nominee'] },
  { org: 'The FWA', items: ['5× FWA Of The Day'] },
  { org: 'Communication Arts', items: ['2× Webpick'] },
  { org: 'Red Dot Design Award', items: ['1× Red Dot Winner'] },
  { org: 'App Store', items: ['1× App Of The Day'] },
]

export default function About() {
  return (
    <div>
      <section className="px-6 md:px-12 pt-16 pb-12">
        <h1 className="text-[14vw] md:text-[8vw] font-medium tracking-tight leading-none opacity-10 select-none">about</h1>
        <h2 className="text-4xl md:text-6xl font-medium tracking-tight leading-tight -mt-5 md:-mt-7 max-w-3xl">
          we help brands & products achieve goals
        </h2>
      </section>

      <section className="px-6 md:px-12 pb-16 grid md:grid-cols-2 gap-10">
        <div className="space-y-5 text-[15px] leading-relaxed opacity-70">
          <p>We form small teams for the necessary tasks, which can consist of UI/UX designers, graphic designers, artists, motion designers, and other specialists.</p>
          <p>Since 2013, we have constantly been changing in search of ourselves and organically came to the format of a studio that can create digital products and design systems of any level.</p>
          <p>Cadara is a group of people united by the desire to work with various companies and increase their capital with the help of websites, mobile applications, graphic design, and creative projects.</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {stats.map(s => (
            <div key={s.label}>
              <div className="text-4xl md:text-5xl font-medium tracking-tight">{s.value}</div>
              <div className="text-[12px] opacity-40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 py-16 border-t border-black/10 dark:border-white/10">
        <h3 className="text-[11px] uppercase tracking-widest opacity-40 mb-10">Awards and recognition</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {awards.map(a => (
            <div key={a.org}>
              <h4 className="text-[15px] font-medium mb-3">{a.org}</h4>
              <ul className="space-y-1.5">
                {a.items.map(item => (
                  <li key={item} className="text-[13px] opacity-50">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
