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
 * The locale comes from the request when available; otherwise this admin-side
 * flow uses the platform's English default rather than the public portal's
 * Persian default.
 *
 * The document's `<html lang>` deliberately stays on the default here (see
 * `documentLocale`): the wizard's copy remains English, so advertising another
 * language would be a lie.
 */
export const Route = createFileRoute('/onboarding')({
  loader: async ({ context }) => {
    const locale = context.acceptLanguageLocale ?? DEFAULT_LOCALE
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
