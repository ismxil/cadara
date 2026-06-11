const serviceList = [
  {
    title: 'product design',
    desc: "We'll create MVP concepts, test hypotheses, prepare presentations for stakeholders, start a design system for your designers, and write guides for developers.",
    items: ['Competitors Research', 'Features Analysis', 'User Journeys', 'UX/UI Design', 'Prototyping', 'Design System', 'Product Maintenance', 'UI Kit'],
  },
  {
    title: 'web design',
    desc: "We'll design a website that users will want to tweet and competitors will want to bookmark.",
    items: ['Design Audit', 'Competitors Research', 'Content Architecture', 'Visual Concept', 'UX/UI Design', 'UI Kit', 'Adaptations', 'Website Maintenance'],
  },
  {
    title: 'graphics and motion',
    desc: 'We can enhance your product design with custom illustrations, icons sets, and videos because sometimes, graphic design can tell more than words.',
    items: ['2D & 3D Illustrations', 'Promo Videos', 'Icons Sets', 'Creative Visuals', 'Print Materials', 'Collage Art'],
  },
  {
    title: 'brand identity',
    desc: 'Rebranding or brand new identity, we create the visual language that makes your brand unforgettable.',
    items: ['Brand Strategy', 'Logo Design', 'Visual Identity', 'Brand Guidelines', 'Packaging', 'Marketing Materials'],
  },
]

export default function Services() {
  return (
    <div>
      <section className="px-6 md:px-12 pt-16 pb-12">
        <h1 className="text-[12vw] md:text-[7vw] font-medium tracking-tight leading-none opacity-10 select-none">services</h1>
        <h2 className="text-4xl md:text-6xl font-medium tracking-tight leading-tight -mt-5 md:-mt-7">
          we build strong products
        </h2>
      </section>

      <section className="px-6 md:px-12 pb-8 max-w-2xl">
        <p className="text-[15px] leading-relaxed opacity-60">
          In Cadara we help both large and small businesses employ design to improve communication with your customers or users and increase sales of products and services.
        </p>
      </section>

      <section className="pb-24">
        {serviceList.map((s, i) => (
          <div key={s.title} className={`px-6 md:px-12 py-12 ${i < serviceList.length - 1 ? 'border-b border-black/10 dark:border-white/10' : ''}`}>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">{s.title}</h3>
                <p className="text-[14px] opacity-60 leading-relaxed max-w-sm">{s.desc}</p>
              </div>
              <div className="flex flex-wrap gap-2 content-start">
                {s.items.map(item => (
                  <span key={item} className="px-3 py-1.5 text-[12px] rounded-full border border-black/20 dark:border-white/20">{item}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
