import Link from 'next/link'

const socials = [
  { label: 'instagram', href: 'https://www.instagram.com/cadarastudio/' },
  { label: 'linkedin', href: 'https://www.linkedin.com/company/cadarastudio' },
  { label: 'behance', href: 'https://www.behance.net/cadara' },
  { label: 'x', href: 'https://twitter.com/cadarastudio' },
  { label: 'dribbble', href: 'https://dribbble.com/Cadara' },
  { label: 'awwwards', href: 'https://www.awwwards.com/cadara/' },
]

export default function Footer() {
  return (
    <footer className="border-t border-black/10 dark:border-white/10 px-6 md:px-12 py-10 md:py-14">
      <div className="flex flex-col md:flex-row md:justify-between gap-10">
        {/* Left */}
        <div className="flex flex-col gap-6 max-w-xs">
          <div>
            <p className="text-[11px] uppercase tracking-widest opacity-40 mb-2">contact us</p>
            <a
              href="mailto:info@cadarastudio.com"
              className="text-[14px] hover:opacity-60 transition-opacity underline underline-offset-4"
            >
              info@cadarastudio.com
            </a>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest opacity-40 mb-2">yeah, sometimes all you need is an old-school pdf</p>
            <a
              href="https://cdn.prod.website-files.com/616d2f7455edd882e659539e/6a1042472071e9deee411fb9_tubik_studio_overview_2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] flex items-center gap-1.5 hover:opacity-60 transition-opacity"
            >
              <span>↓</span> download PDF profile
            </a>
          </div>
          <p className="text-[11px] opacity-30 leading-relaxed">
            The text and graphic content of the website belongs to cadara and cannot be used by other resources without our permission and without the link to the source.
          </p>
          <p className="text-[11px] opacity-40">© cadara 2026</p>
        </div>

        {/* Right */}
        <div>
          <p className="text-[11px] uppercase tracking-widest opacity-40 mb-4">follow us</p>
          <div className="grid grid-cols-2 gap-x-12 gap-y-3">
            {socials.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="text-[14px] hover:opacity-60 transition-opacity"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
