import { createFileRoute, Outlet } from '@tanstack/react-router'
import { IntlProvider } from 'react-intl'
import { DEFAULT_LOCALE, loadOnboardingMessages } from '@/lib/shared/i18n'
import { onIntlError } from '@/lib/client/intl-error'

/**
 * Parent route for onboarding: renders children under an IntlProvider.
 * The index route handles redirection logic.
 *
 * The wizard layout and every step render `useIntl` / `<FormattedMessage>`, so
 * the provider is mounted here, at the root of the onboarding tree, rather than
 * on the `_layout` below it: the index and any future onboarding route are then
 * covered too, and there is exactly one provider for the flow (the same shape
 * `/admin` uses for the admin tree).
 *
 * This admin-side flow keeps its English default instead of inheriting the
 * Persian default used by the public portal.
 *
 * The document's `<html lang>` deliberately stays on the default here (see
 * `documentLocale`): no catalog carries `onboarding.` keys yet, so the wizard
 * renders its inline English defaults and advertising another language would be
 * a lie. When translated onboarding copy lands, add this tree there too.
 */
export const Route = createFileRoute('/onboarding')({
  loader: async () => {
    const locale = DEFAULT_LOCALE
    return { locale, messages: await loadOnboardingMessages(locale) }
  },
  component: OnboardingRoot,
})

function OnboardingRoot() {
  const { locale, messages } = Route.useLoaderData()

  return (
    <IntlProvider
      locale={locale}
      messages={messages}
      defaultLocale={DEFAULT_LOCALE}
      onError={onIntlError}
    >
      <Outlet />
    </IntlProvider>
  )
}
