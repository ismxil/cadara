// Articles first published elsewhere, imported once into Sanity. Editors own them after import.
let key = 0
const span = (text, marks = []) => ({_type: 'span', _key: `span-${key++}`, text, marks})
const block = (style, children, markDefs = []) => ({_type: 'block', _key: `block-${key++}`, style, markDefs, children: typeof children === 'string' ? [span(children)] : children})
export const insights = [{
  _id: 'insight-what-is-killing-traditional-banks', _type: 'insight',
  title: 'Here is what I think is killing traditional banks in Nigeria and maybe all over the world.',
  slug: {_type: 'slug', current: 'what-is-killing-traditional-banks'},
  excerpt: 'Auto-responses, twenty-minute hold queues and no one with the authority to help. Bad customer service is pushing people away from traditional banks, and it can be solved with proper service design.',
  category: 'Opinion', tags: ['Banking', 'Customer experience', 'UX', 'Service design'],
  coverImage: {_type: 'contentImage', alt: 'Editorial illustration of a traditional bank', localPath: 'insights/images/traditional-banks-cover.jpg'},
  coverCaption: 'Illustration by Jason Ford for The Times',
  author: 'Ismail Ahmad', authorRole: 'Creative Partner, Cadara',
  authorImage: {_type: 'contentImage', alt: 'Ismail Ahmad', localPath: 'asset/studio/team-ismail.png'},
  publishedAt: '2021-11-20',
  seoDescription: 'Why bad customer service is driving people away from traditional banks, and how service design and strong UX can win them back.',
  body: [
    block('normal', 'The world has moved past the age of human trusting robots, you have to make your bot sound more likely like human to be taking seriously, people don’t care because we are close to the singularity (interacting with tech as if it is human), and it’s obvious. People want to interact with services or programs without obstacles, but the mistake that is common among these traditional banking systems is they try to automate every little interaction with a robot which is not bad if it is done right, but I bet it is.'),
    block('normal', 'I cannot count how many times I have sent out an email to my banks, and I always got hit off with auto-response. Even when you call the customer representative, you have to wait in line for nothing less than 20+mins on the phone wasting your precious time away. Plus, that is not sad enough, until you finally have someone attend to you, with a response like;'),
    block('blockquote', [span('“We don’t have the authority to decide on our end, and we will be redirecting you to either one of the engineering team or some executives blah blah blah.”', ['em'])]),
    block('normal', [
      span('This is very frustrating for the users who are time conscious and are in urgent need, of maybe a life decision or something vital. These organizations might be big enough not to see the effect this is having on their customers, but trust me they will. If you look at the statistic most complain about these banks is '),
      span('“bad customer service”', ['strong', 'complaints']),
      span(',', ['strong']),
      span(' and customers are looking for every alternative to ditch the traditional banking (including me).'),
    ], [{_type: 'link', _key: 'complaints', href: 'https://www.financial-ombudsman.org.uk/data-insight/annual-complaints-data'}]),
    block('h2', 'How can this be best approach?'),
    block('normal', 'I believe it can be solved with proper service design with strong UX, and I know for sure these organizations have the resources to tackle the challenges from the bottoms-up. These will be one of the reasons they lose so bad in this new digital banking era because everything is instant. I have worked on at least more than four digital banking products, and what I discovered from my research was mostly on customer service you can check the playstores or check statistics platforms you’re familiar with to counter this yourself.'),
    block('normal', 'Sometimes innovation doesn’t have to be building a massive platform, it can be as little as paying more attention to your customers and focusing on their core needs until that is solved, everything else you build will be half baked — because your existing customers won’t trust you.'),
    block('h3', 'Lastly, don’t make your products suck so you don’t have your customers on your neck for every little thing. And, we are in the future stop living in the past.'),
  ],
}]
