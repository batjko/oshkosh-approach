/** A11y skip link. Sits as the very first focusable element. */
export const SkipToContent = ({
  targetId = 'main-content'
}: {
  targetId?: string
}) => (
  <a
    href={`#${targetId}`}
    className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-content focus:shadow-lg"
  >
    Skip to main content
  </a>
)
