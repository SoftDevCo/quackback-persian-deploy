import { useSessionContext, useWorkspaceSettings } from '@/lib/client/hooks/use-root-context'
import { realEmail } from '@/lib/shared/anonymous-email'
import { useEffect, useState } from 'react'
import { useIntl, type IntlShape } from 'react-intl'
import { createFileRoute } from '@tanstack/react-router'
import { DomainAccessPicker } from '@/components/domain-access-picker'
import { PortalIntlProvider } from '@/components/portal-intl-provider'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { DEFAULT_LOCALE, PERSIAN_DEFAULT_LOCALE, seedAreaMessages } from '@/lib/shared/i18n'
import { htmlLangDir } from '@/lib/shared/document-locale'
import { portalScopeWords } from '@/components/settings/api-keys/portal-key-messages'
import {
  ACCESS_DOMAINS,
  domainAccessLevels,
  scopesFromDomainLevels,
  type DomainAccessLevels,
} from '@/lib/shared/api-key-scopes'
import { consentQueryFields, consentQueryFromSearch } from '@/lib/shared/oauth-consent-query'
import {
  clientRequestedFromConsentSearch,
  consentGrantScope,
  consentPreset,
  consentPresetLevels,
  defaultSelectedScopes,
  type ConsentPreset,
} from '@/lib/shared/mcp-consent-scopes'
import { cn } from '@/lib/shared/utils'
import { BadgeCheck, ChevronRight, ExternalLink, Globe, ShieldCheck } from 'lucide-react'

export const Route = createFileRoute('/oauth/consent')({
  // Kept as the router parsed it: the signed query is read from it whole
  // (consentQueryFromSearch), never from fields the router may have retyped.
  validateSearch: (search: Record<string, unknown>) => search,
  loader: async ({ context }) => {
    const locale =
      context.acceptLanguageLocale === PERSIAN_DEFAULT_LOCALE
        ? PERSIAN_DEFAULT_LOCALE
        : DEFAULT_LOCALE
    return { locale, messages: await seedAreaMessages(locale, 'personalApiKeys') }
  },
  component: ConsentRoute,
})

function ConsentRoute() {
  const { locale, messages } = Route.useLoaderData()
  return (
    <PortalIntlProvider locale={locale} messages={messages}>
      <div {...htmlLangDir(locale)}>
        <ConsentPage />
      </div>
    </PortalIntlProvider>
  )
}

type ConsentRedirectTarget =
  { kind: 'web'; host: string } | { kind: 'device' } | { kind: 'app'; scheme: string }

/** What the server can vouch for about the client (see consent-client-identity.ts). */
type ClientIdentity =
  | { verified: true; host: string; redirect: ConsentRedirectTarget | null }
  | { verified: false; redirect: ConsentRedirectTarget | null }

interface OAuthClientInfo {
  client_name?: string
  client_uri?: string
  logo_uri?: string
  policy_uri?: string
  tos_uri?: string
  client_identity?: ClientIdentity
}

/** Where the authorization code goes, in words. */
function redirectTargetText(target: ConsentRedirectTarget, persian: boolean): string {
  if (target.kind === 'web')
    return persian ? `شما را به ${target.host} برمی‌گرداند` : `Sends you back to ${target.host}`
  if (target.kind === 'device')
    return persian
      ? 'شما را به برنامه‌ای در این دستگاه برمی‌گرداند'
      : 'Sends you back to an app on this device'
  return persian
    ? `شما را به برنامهٔ ${target.scheme} در این دستگاه برمی‌گرداند`
    : `Sends you back to the ${target.scheme} app on this device`
}

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function useClientInfo(clientId: string, redirectUri: string | undefined) {
  const [client, setClient] = useState<OAuthClientInfo | null>(null)

  useEffect(() => {
    const query = new URLSearchParams({ client_id: clientId })
    if (redirectUri) query.set('redirect_uri', redirectUri)
    fetch(`/api/auth/oauth2/public-client?${query}`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setClient(data ?? {}))
      .catch(() => setClient({}))
  }, [clientId, redirectUri])

  return client
}

/** One sentence saying what the current selection lets the client do. */
function accessSummary(
  intl: IntlShape,
  clientName: string,
  preset: ConsentPreset,
  levels: DomainAccessLevels
): string {
  const persian = intl.locale === PERSIAN_DEFAULT_LOCALE
  if (preset === 'full') {
    return persian
      ? `${clientName} می‌تواند داده‌ها و تنظیمات فضای کاری را در حد مجوزهای نقش شما بخواند و تغییر دهد.`
      : `${clientName} can read and make changes across your workspace, including settings, up to what your role allows.`
  }
  if (preset === 'read') {
    return persian
      ? `${clientName} می‌تواند جست‌وجو کند و داده‌ها را بخواند. ثبت مطلب، پاسخ، انتشار و تغییر تنظیمات در این دسترسی مجاز نیست.`
      : `${clientName} can search and read. It cannot post, reply, publish or change settings.`
  }
  const { label } = portalScopeWords(intl)
  const writes = ACCESS_DOMAINS.filter((d) => ['read_write', 'write'].includes(levels[d.domain]))
  const reads = ACCESS_DOMAINS.filter((d) => levels[d.domain] === 'read')
  if (writes.length + reads.length === 0)
    return persian
      ? 'برای ادامه دست‌کم یک بخش را انتخاب کنید.'
      : 'Select at least one area to continue.'
  const parts: string[] = []
  if (writes.length > 0) {
    const areas = intl.formatList(writes.map((d) => label(d.domain)))
    parts.push(
      persian
        ? `${clientName} می‌تواند این بخش‌ها را تغییر دهد: ${areas}.`
        : `${clientName} can change ${areas}.`
    )
  }
  if (reads.length > 0) {
    const areas = intl.formatList(reads.map((d) => label(d.domain)))
    parts.push(
      persian
        ? `دسترسی ${writes.length > 0 ? 'آن' : clientName} به این بخش‌ها فقط برای خواندن است: ${areas}.`
        : `${writes.length > 0 ? 'It' : clientName} can only read ${areas}.`
    )
  }
  return parts.join(' ')
}

function AccessChoice({
  value,
  selected,
  title,
  description,
  recommended,
  disabled,
  onSelect,
}: {
  value: ConsentPreset
  selected: boolean
  title: string
  description: string
  recommended?: string
  disabled?: boolean
  onSelect: () => void
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors',
        'has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring',
        selected ? 'border-primary bg-primary/10' : 'border-border/60 hover:border-border',
        disabled && 'cursor-not-allowed opacity-60'
      )}
    >
      <input
        type="radio"
        name="access-level"
        value={value}
        checked={selected}
        disabled={disabled}
        onChange={onSelect}
        className="mt-0.5 size-4 shrink-0 appearance-none rounded-full border border-muted-foreground/60 bg-transparent outline-none checked:border-[5px] checked:border-foreground"
      />
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-sm font-medium">
          {title}
          {recommended && (
            <span className="text-[11px] font-medium text-muted-foreground">{recommended}</span>
          )}
        </span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </label>
  )
}

function ConsentPage() {
  const intl = useIntl()
  const persian = intl.locale === PERSIAN_DEFAULT_LOCALE
  const text = (english: string, farsi: string) => (persian ? farsi : english)
  const scopeWords = portalScopeWords(intl)
  // Posted back unchanged on submit: Better Auth checks its signature.
  const oauthQuery = consentQueryFromSearch(Route.useSearch())
  const search = consentQueryFields(oauthQuery)
  const session = useSessionContext()
  const settings = useWorkspaceSettings()
  // An anonymous session's address is synthetic, never a person's.
  const signedInAs = realEmail(session?.user?.email)
  const workspaceName = settings?.name ?? null
  const client = useClientInfo(search.clientId, search.redirectUri)
  const clientRequested = clientRequestedFromConsentSearch({
    requested: search.requested,
    scope: search.scope,
  })
  const defaults = defaultSelectedScopes(clientRequested)
  const [levels, setLevels] = useState(() => domainAccessLevels(defaults))
  // A narrower prefill (a step-up) opens the detail so the person sees what is being asked.
  const [showDetail, setShowDetail] = useState(
    () => consentPreset(domainAccessLevels(defaults)) === 'custom'
  )
  const [offlineAccess, setOfflineAccess] = useState(() => defaults.includes('offline_access'))
  const [submitting, setSubmitting] = useState<'accept' | 'deny' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const clientName = client?.client_name || text('An application', 'یک برنامه')
  // A self-registered client's link is never shown: it chose it freely, so it
  // could point at anyone. No client's logo is shown: loading it from the
  // client's host would tell that host who is consenting and when, and the
  // draft requires a displayed logo to be prefetched and served from a trusted
  // host (CIMD §10.9).
  const identity = client?.client_identity
  const verifiedHost = identity?.verified ? identity.host : null
  const redirectTarget = identity?.redirect ?? null
  // The server keeps a CIMD client's `client_uri` only on its verified host.
  const verifiedLink =
    verifiedHost && client?.client_uri && isSafeUrl(client.client_uri) ? client.client_uri : null
  // CIMD cannot stop a program on this device from claiming a client whose
  // document lists loopback redirects, so say so plainly.
  const codeStaysOnDevice = redirectTarget?.kind === 'device' || redirectTarget?.kind === 'app'

  const preset = consentPreset(levels)
  const capabilityScopes = scopesFromDomainLevels(levels)
  const canAuthorize = capabilityScopes.length > 0

  async function handleConsent(accept: boolean) {
    setSubmitting(accept ? 'accept' : 'deny')
    setError(null)
    try {
      const response = await fetch('/api/auth/oauth2/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          accept,
          scope: accept
            ? consentGrantScope(
                offlineAccess ? [...capabilityScopes, 'offline_access'] : capabilityScopes
              )
            : search.scope,
          oauth_query: oauthQuery,
        }),
      })

      if (response.redirected) {
        window.location.href = response.url
        return
      }

      const data = await response.json()
      const redirectTo = data.url ?? data.uri ?? data.redirectUrl
      if (redirectTo) {
        window.location.href = redirectTo
      }
    } catch {
      setSubmitting(null)
      setError(text('Something went wrong. Please try again.', 'مشکلی پیش آمد. دوباره تلاش کنید.'))
    }
  }

  if (client === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex flex-col items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-muted animate-pulse" />
            <div className="h-5 w-52 rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-40 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center gap-1.5">
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full border border-border/50 bg-muted/50">
            <Globe className="h-5 w-5 text-muted-foreground" />
          </div>

          <h1 className="text-xl font-semibold">{clientName}</h1>

          {verifiedHost ? (
            <p className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {text('Verified:', 'تأیید شده:')}{' '}
              {verifiedLink ? (
                <a
                  href={verifiedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  {verifiedHost}
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              ) : (
                verifiedHost
              )}
            </p>
          ) : (
            <p className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {text('Unverified app', 'برنامهٔ تأییدنشده')}
            </p>
          )}

          <p className="text-sm text-muted-foreground">
            {text(
              `wants to access ${workspaceName ?? 'your account'}`,
              `درخواست دسترسی به ${workspaceName ?? 'حساب شما'} را دارد`
            )}
          </p>

          {(!verifiedHost || redirectTarget) && (
            <p className="text-xs text-muted-foreground/70">
              {!verifiedHost &&
                text(
                  'This app chose its own name, so it may not be who it says. ',
                  'این برنامه نام خود را تعیین کرده است و ممکن است هویت واقعی آن با نام نمایش‌داده‌شده فرق داشته باشد. '
                )}
              {redirectTarget && <>{redirectTargetText(redirectTarget, persian)}.</>}
            </p>
          )}

          {codeStaysOnDevice && (
            <p className="text-xs text-muted-foreground/70">
              {text(
                'Only continue if you started this from an app on this device yourself.',
                'فقط اگر خودتان این درخواست را از برنامه‌ای روی همین دستگاه شروع کرده‌اید ادامه دهید.'
              )}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div
            role="radiogroup"
            aria-label={text('Access level', 'سطح دسترسی')}
            className="space-y-2"
          >
            <AccessChoice
              value="full"
              selected={preset === 'full'}
              title={text('Full access', 'دسترسی کامل')}
              description={text(
                'Read and make changes, up to what your role allows',
                'خواندن و تغییر دادن در حد مجوزهای نقش شما'
              )}
              recommended={text('Recommended', 'پیشنهادی')}
              disabled={submitting !== null}
              onSelect={() => setLevels(consentPresetLevels('full'))}
            />
            <AccessChoice
              value="read"
              selected={preset === 'read'}
              title={text('Read only', 'فقط خواندن')}
              description={text(
                'Search and look things up. No changes.',
                'جست‌وجو و مشاهدهٔ داده‌ها بدون امکان تغییر'
              )}
              disabled={submitting !== null}
              onSelect={() => setLevels(consentPresetLevels('read'))}
            />
            {preset === 'custom' && (
              <AccessChoice
                value="custom"
                selected
                title={text('Custom', 'سفارشی')}
                description={text('Your own selection below', 'بخش‌های انتخابی شما در پایین')}
                disabled={submitting !== null}
                onSelect={() => {}}
              />
            )}
          </div>

          <button
            type="button"
            aria-expanded={showDetail}
            aria-controls="consent-access-detail"
            onClick={() => setShowDetail((open) => !open)}
            className="inline-flex items-center gap-1.5 rounded-sm px-1 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <ChevronRight
              className={cn(
                'h-3.5 w-3.5 transition-transform rtl:-scale-x-100',
                showDetail && 'rotate-90'
              )}
              aria-hidden
            />
            {text(
              `Choose what ${clientName} can access`,
              `انتخاب بخش‌هایی که ${clientName} به آن‌ها دسترسی دارد`
            )}
          </button>

          {showDetail && (
            <div
              id="consent-access-detail"
              className="rounded-xl border border-border/50 bg-card overflow-hidden"
            >
              <DomainAccessPicker
                levels={levels}
                onChange={setLevels}
                disabled={submitting !== null}
                flagHighImpact
                words={{
                  ...scopeWords,
                  description: (domain) =>
                    domain === 'settings'
                      ? text(
                          'Branding, Messenger, modules, office hours, and webhooks',
                          'هویت بصری، پیام‌رسان، بخش‌ها، ساعت‌های کاری و وب‌هوک‌ها'
                        )
                      : scopeWords.description(domain),
                }}
              />
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/30">
                <div className="min-w-0 pe-4">
                  <p className="text-sm font-medium">{text('Stay signed in', 'حفظ دسترسی')}</p>
                  <p className="text-xs text-muted-foreground">
                    {text(
                      `Let ${clientName} refresh access without asking again`,
                      `به ${clientName} اجازه دهید دسترسی خود را بدون درخواست مجدد تمدید کند`
                    )}
                  </p>
                </div>
                <Switch
                  checked={offlineAccess}
                  onCheckedChange={setOfflineAccess}
                  disabled={submitting !== null}
                  aria-label={text('Stay signed in', 'حفظ دسترسی')}
                />
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground px-1" aria-live="polite">
            {accessSummary(intl, clientName, preset, levels)}
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              disabled={submitting !== null}
              onClick={() => handleConsent(false)}
            >
              {submitting === 'deny'
                ? text('Denying...', 'در حال رد دسترسی…')
                : text('Deny', 'رد دسترسی')}
            </Button>
            <Button
              size="lg"
              className="flex-1"
              disabled={submitting !== null || !canAuthorize}
              onClick={() => handleConsent(true)}
            >
              {submitting === 'accept'
                ? text('Authorizing...', 'در حال ثبت اجازه…')
                : text('Authorize', 'اجازهٔ دسترسی')}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <p>
              {signedInAs
                ? text(`Signed in as ${signedInAs}. `, `با نشانی ${signedInAs} وارد شده‌اید. `)
                : ''}
              {text(
                'Revoke any time in account settings',
                'هر زمان می‌توانید این دسترسی را در تنظیمات حساب لغو کنید'
              )}
            </p>
          </div>

          {(() => {
            const hasTos = !!client.tos_uri && isSafeUrl(client.tos_uri)
            const hasPolicy = !!client.policy_uri && isSafeUrl(client.policy_uri)
            if (!hasTos && !hasPolicy) return null
            return (
              <p className="text-center text-xs text-muted-foreground/60">
                {text(
                  'By authorizing, you agree to ',
                  'با دادن اجازهٔ دسترسی، این موارد را می‌پذیرید: '
                )}
                {hasTos && (
                  <a
                    href={client.tos_uri!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-muted-foreground transition-colors"
                  >
                    {text('Terms of Service', 'شرایط استفاده')}
                  </a>
                )}
                {hasTos && hasPolicy && text(' and ', ' و ')}
                {hasPolicy && (
                  <a
                    href={client.policy_uri!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-muted-foreground transition-colors"
                  >
                    {text('Privacy Policy', 'سیاست حریم خصوصی')}
                  </a>
                )}
                .
              </p>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
