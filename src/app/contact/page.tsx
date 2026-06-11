'use client'
import { useState } from 'react'

const serviceOptions = ['Interface design', 'Illustration', 'Brand identity', 'Motion design', 'Development']
const budgetOptions = ["Let's talk", '10K–50K', 'more than 50K']

export default function Contact() {
  const [selected, setSelected] = useState<string[]>([])
  const [budget, setBudget] = useState('')

  const toggle = (s: string) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  return (
    <div className="px-6 md:px-12 pt-16 pb-24">
      <h1 className="text-[12vw] md:text-[7vw] font-medium tracking-tight leading-none opacity-10 select-none">contact</h1>
      <h2 className="text-4xl md:text-6xl font-medium tracking-tight -mt-5 md:-mt-7 mb-12">How can we help?</h2>

      <div className="grid md:grid-cols-2 gap-16">
        <form className="space-y-8">
          <div>
            <p className="text-[11px] uppercase tracking-widest opacity-40 mb-4">Service</p>
            <div className="flex flex-wrap gap-2">
              {serviceOptions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(s)}
                  className={`px-4 py-2 text-[13px] rounded-full border transition-colors ${selected.includes(s) ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' : 'border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-widest opacity-40 mb-4">Budget in USD</p>
            <div className="flex flex-wrap gap-2">
              {budgetOptions.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(b)}
                  className={`px-4 py-2 text-[13px] rounded-full border transition-colors ${budget === b ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' : 'border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white'}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {['Name', 'Email', 'Tell us about your project'].map(field => (
              <div key={field} className="border-b border-black/20 dark:border-white/20 pb-2">
                {field === 'Tell us about your project' ? (
                  <textarea
                    placeholder={field}
                    rows={3}
                    className="w-full bg-transparent text-[14px] placeholder:opacity-40 outline-none resize-none"
                  />
                ) : (
                  <input
                    type={field === 'Email' ? 'email' : 'text'}
                    placeholder={field}
                    className="w-full bg-transparent text-[14px] placeholder:opacity-40 outline-none"
                  />
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="text-[14px] text-blue-600 dark:text-blue-400 hover:opacity-70 transition-opacity"
          >
            send message →
          </button>
        </form>

        <div className="space-y-8">
          <div>
            <p className="text-[11px] uppercase tracking-widest opacity-40 mb-2">contact us</p>
            <a href="mailto:info@cadarastudio.com" className="text-[15px] hover:opacity-60 transition-opacity underline underline-offset-4">
              info@cadarastudio.com
            </a>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest opacity-40 mb-2">old-school pdf</p>
            <a
              href="https://cdn.prod.website-files.com/616d2f7455edd882e659539e/6a1042472071e9deee411fb9_tubik_studio_overview_2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] hover:opacity-60 transition-opacity flex items-center gap-2"
            >
              ↓ download PDF profile
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
