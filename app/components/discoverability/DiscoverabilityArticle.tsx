import type { MetaDescriptor } from '@remix-run/node'
import type { ReactNode } from 'react'
import { Link } from '@remix-run/react'
import { MdArrowBack, MdArrowForward, MdOpenInNew } from 'react-icons/md'

import {
  discoverabilityNav,
  relatedDiscoverabilityPages,
  type DiscoverabilityPage,
  type DiscoverabilityPageId
} from '~/content/discoverability'
import { notice, sourceList } from '~/content/oshkosh'
import { trackAppEvent } from '~/utils/analytics'
import {
  SITE_NAME,
  SOCIAL_IMAGE_HEIGHT,
  SOCIAL_IMAGE_PATH,
  SOCIAL_IMAGE_TYPE,
  SOCIAL_IMAGE_WIDTH,
  TWITTER_CARD,
  absoluteUrl,
  buildJsonLdGraph
} from '~/utils/seo'

interface DiscoverabilityArticleProps {
  page: DiscoverabilityPage
}

interface TrackedAppLinkProps {
  pageId: DiscoverabilityPageId
  surface: 'header' | 'intro' | 'footer'
  className: string
  children: ReactNode
}

const TrackedAppLink = ({
  pageId,
  surface,
  className,
  children
}: TrackedAppLinkProps) => (
  <Link
    to="/"
    className={className}
    onClick={() =>
      trackAppEvent('discoverability app opened', {
        page_id: pageId,
        surface
      })
    }
  >
    {children}
  </Link>
)

const sourceLinksForPage = (page: DiscoverabilityPage) =>
  sourceList(page.sourceIds).filter((source) => Boolean(source.url))

export const discoverabilityMeta = (
  page: DiscoverabilityPage
): MetaDescriptor[] => {
  const canonicalUrl = absoluteUrl(page.path)
  const socialImageUrl = absoluteUrl(SOCIAL_IMAGE_PATH)
  const sourceLinks = sourceLinksForPage(page).map((source) => source.url)

  const webPage = {
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: page.h1,
    headline: page.h1,
    description: page.description,
    isPartOf: { '@id': `${absoluteUrl('/')}#website` },
    about: [
      { '@id': `${absoluteUrl('/')}#app` },
      { '@id': `${absoluteUrl('/')}#airventure` }
    ],
    dateModified: page.lastmod,
    inLanguage: 'en',
    isAccessibleForFree: true,
    citation: sourceLinks.length > 0 ? sourceLinks : [notice.baselineUrl]
  }

  const faqPage = page.faqs?.length
    ? {
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        mainEntity: page.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      }
    : null

  return [
    { title: page.title },
    { name: 'description', content: page.description },
    { name: 'robots', content: 'index,follow,max-image-preview:large' },
    { name: 'googlebot', content: 'index,follow,max-image-preview:large' },
    { name: 'application-name', content: SITE_NAME },
    { name: 'category', content: 'Aviation' },
    { property: 'og:type', content: 'article' },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:title', content: page.title },
    { property: 'og:description', content: page.description },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:locale', content: 'en_US' },
    { property: 'og:image', content: socialImageUrl },
    { property: 'og:image:type', content: SOCIAL_IMAGE_TYPE },
    { property: 'og:image:width', content: String(SOCIAL_IMAGE_WIDTH) },
    { property: 'og:image:height', content: String(SOCIAL_IMAGE_HEIGHT) },
    { property: 'og:image:alt', content: `${SITE_NAME} app icon` },
    { name: 'twitter:card', content: TWITTER_CARD },
    { name: 'twitter:title', content: page.title },
    { name: 'twitter:description', content: page.description },
    { name: 'twitter:image', content: socialImageUrl },
    { name: 'twitter:image:alt', content: `${SITE_NAME} app icon` },
    { tagName: 'link', rel: 'canonical', href: canonicalUrl },
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@graph': [
          ...buildJsonLdGraph(),
          webPage,
          ...(faqPage ? [faqPage] : [])
        ]
      }
    }
  ]
}

export const DiscoverabilityArticle = ({ page }: DiscoverabilityArticleProps) => {
  const sourceLinks = sourceLinksForPage(page)
  const relatedPages = relatedDiscoverabilityPages(page)

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <header className="border-b border-base-300 bg-base-100">
        <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-3 px-4 py-4 tablet:flex-row tablet:items-center tablet:justify-between tablet:px-6">
          <TrackedAppLink
            pageId={page.id}
            surface="header"
            className="inline-flex min-h-11 items-center gap-2 rounded-cockpit px-1 text-sm font-semibold text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
          >
            <MdArrowBack aria-hidden="true" className="h-5 w-5" />
            Open app
          </TrackedAppLink>
          <nav
            aria-label="Briefing pages"
            className="-mx-2 flex min-w-0 gap-1 overflow-x-auto px-2 text-sm scrollbar-none"
          >
            {discoverabilityNav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="inline-flex min-h-11 shrink-0 items-center rounded-cockpit px-3 font-medium text-base-content/70 underline-offset-4 hover:text-base-content hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-screen-xl gap-6 px-4 py-8 pb-28 tablet:px-6 tablet:py-10 desktop:grid-cols-[minmax(0,1fr)_20rem] desktop:items-start">
        <article className="min-w-0 rounded-cockpit border border-base-300 bg-base-100 p-5 shadow-cockpit tablet:p-7 desktop:p-9">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Oshkosh Approach
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight text-base-content tablet:text-4xl">
            {page.h1}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-base-content/80">
            {page.intro}
          </p>

          <div className="mt-6 rounded-cockpit border border-primary/25 bg-primary/5 p-4 tablet:flex tablet:items-center tablet:justify-between tablet:gap-5">
            <div>
              <h2 className="text-base font-semibold text-base-content">
                Ready to use the operational companion?
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-base-content/70">
                Continue to the phase navigator, planning checklists, runway tools,
                and connected KOSH NOTAM view.
              </p>
            </div>
            <TrackedAppLink
              pageId={page.id}
              surface="intro"
              className="btn btn-primary tap-target mt-4 w-full shrink-0 gap-2 tablet:mt-0 tablet:w-auto"
            >
              Open live companion
              <MdArrowForward aria-hidden="true" className="h-5 w-5" />
            </TrackedAppLink>
          </div>

          <div className="mt-6 rounded-cockpit border border-warning/30 bg-warning/10 p-4 text-sm leading-relaxed">
            <strong className="font-semibold text-warning">Safety boundary:</strong>{' '}
            The FAA/EAA AirVenture Notice, live NOTAMs, ATIS, ATC, weather, and pilot
            judgment remain authoritative. This page is descriptive and source-backed.
          </div>

          <div className="mt-8 space-y-8">
            {page.sections.map((section) => (
              <section key={section.heading} className="min-w-0">
                <h2 className="text-xl font-semibold leading-snug text-base-content">
                  {section.heading}
                </h2>
                <p className="mt-2 leading-relaxed text-base-content/80">
                  {section.body}
                </p>
                {section.items && section.items.length > 0 && (
                  <ul className="mt-4 grid gap-2 text-sm leading-relaxed text-base-content/80">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-cockpit border border-base-300/70 bg-base-200 px-3 py-2"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {section.links && section.links.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {section.links.map((link) => {
                      const external = /^https?:\/\//i.test(link.href)
                      const className =
                        'inline-flex min-h-11 items-center gap-2 rounded-cockpit border border-base-300 bg-base-100 px-3 py-2 text-sm font-semibold text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100'
                      return external ? (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className={className}
                        >
                          {link.label}
                          <MdOpenInNew aria-hidden="true" className="h-4 w-4" />
                        </a>
                      ) : (
                        <Link key={link.href} to={link.href} className={className}>
                          {link.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </section>
            ))}
          </div>

          <section className="mt-10 border-t border-base-300 pt-8">
            <h2 className="text-xl font-semibold">Related briefings</h2>
            <p className="mt-2 text-sm leading-relaxed text-base-content/70">
              Continue with another source-backed planning overview.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {relatedPages.map((relatedPage) => (
                <Link
                  key={relatedPage.id}
                  to={relatedPage.path}
                  className="group rounded-cockpit border border-base-300 bg-base-200 p-4 transition hover:border-primary/40 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
                >
                  <span className="flex items-start justify-between gap-3 font-semibold leading-snug text-base-content">
                    {relatedPage.h1}
                    <MdArrowForward
                      aria-hidden="true"
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary transition group-hover:translate-x-0.5"
                    />
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-base-content/65">
                    {relatedPage.description}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {page.faqs && page.faqs.length > 0 && (
            <section className="mt-10 border-t border-base-300 pt-8">
              <h2 className="text-xl font-semibold">Common questions</h2>
              <div className="mt-4 grid gap-3">
                {page.faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="rounded-cockpit border border-base-300 bg-base-200 p-4"
                  >
                    <h3 className="font-semibold">{faq.question}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-base-content/75">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="rounded-cockpit border border-base-300 bg-base-100 p-5 shadow-cockpit desktop:sticky desktop:top-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/60">
            Sources
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-base-content/70">
            Current embedded Notice year: {notice.baselineYear}. Read the official
            Notice before flying.
          </p>
          <div className="mt-4 grid gap-2">
            {sourceLinks.map((source) => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-between gap-2 rounded-cockpit border border-base-300 px-3 py-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
              >
                <span>{source.label}</span>
                <MdOpenInNew aria-hidden="true" className="h-4 w-4 shrink-0" />
              </a>
            ))}
          </div>
        </aside>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-base-300/70 bg-base-100/90 text-[11px] shadow-sm backdrop-blur">
        <div className="scrollbar-none mx-auto flex w-full max-w-screen-xl items-center gap-3 overflow-x-auto px-4 py-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] tablet:px-6">
          <span className="shrink-0 font-semibold uppercase tracking-wide text-base-content/45">
            Briefing pages
          </span>
          {discoverabilityNav.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="inline-flex min-h-8 shrink-0 items-center font-medium text-primary/80 underline-offset-4 hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
            >
              {item.label}
            </Link>
          ))}
          <TrackedAppLink
            pageId={page.id}
            surface="footer"
            className="inline-flex min-h-8 shrink-0 items-center border-l border-base-300 pl-3 font-medium text-base-content/60 underline-offset-4 hover:text-base-content hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
          >
            App
          </TrackedAppLink>
        </div>
      </footer>
    </div>
  )
}
