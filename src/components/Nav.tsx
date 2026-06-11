'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Menu, X, Sun, Moon } from 'lucide-react'

const links = [
  { href: '/', label: 'work' },
  { href: '/services', label: 'services' },
  { href: '/about', label: 'about' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]">
      {/* Desktop nav */}
      <div className="hidden md:flex items-center justify-between px-8 lg:px-12 h-16">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.svg"
            alt="Cadara"
            width={36}
            height={36}
            className={`transition-all duration-200 ${mounted && theme === 'dark' ? 'invert' : ''}`}
          />
          <span className="text-[15px] font-medium tracking-tight">cadara</span>
        </Link>

        <nav className="flex items-center gap-10">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-[14px] tracking-tight transition-opacity hover:opacity-60 ${pathname === l.href ? 'opacity-100' : 'opacity-50'}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 rounded-full border border-current flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Toggle theme"
          >
            {mounted && theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <Link
            href="/contact"
            className={`text-[14px] tracking-tight transition-opacity ${pathname === '/contact' ? 'opacity-100' : 'text-blue-600 dark:text-blue-400 hover:opacity-80'}`}
          >
            contact us
          </Link>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-between px-5 h-[60px]">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.svg"
            alt="Cadara"
            width={32}
            height={32}
            className={`${mounted && theme === 'dark' ? 'invert' : ''}`}
          />
          <span className="text-[15px] font-medium tracking-tight">cadara</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 rounded-full border border-current flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Toggle theme"
          >
            {mounted && theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="w-8 h-8 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <div className="md:hidden bg-white dark:bg-black border-t border-black/10 dark:border-white/10">
          <nav className="flex flex-col px-5 py-6 gap-6">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-3xl font-medium tracking-tight transition-opacity ${pathname === l.href ? 'opacity-100' : 'opacity-40'}`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="text-3xl font-medium tracking-tight text-blue-600 dark:text-blue-400"
            >
              contact us
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
