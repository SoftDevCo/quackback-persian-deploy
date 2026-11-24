import { Heading, Link, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography, utils } from './shared-styles'

export interface DomainAttentionEmailProps {
  domain: string
  /** The ownership record to publish: its full name and exact value. */
  record: { name: string; value: string }
  /**
   * When set, a warning: the domain is still verified, and stops being on this
   * date (already formatted) unless the record is added back.
   */
  deadline?: string | null
  /**
   * Set once the domain stopped being verified: the sign-in domains that
   * stopped with it, possibly none.
   */
  signInDomains?: readonly string[] | null
  settingsUrl?: string | null
  workspaceName?: string
  logoUrl?: string
}

/** The heading and subject. */
export function domainAttentionTitle(
  domain: string,
  lapsed: boolean,
  locale: 'en' | 'fa' = 'en'
): string {
  if (locale === 'fa') {
    return lapsed ? `دامنهٔ ${domain} دیگر تأییدشده نیست` : `دامنهٔ ${domain} نیاز به بررسی دارد`
  }
  return lapsed ? `${domain} is no longer verified` : `${domain} needs attention`
}

/** What happened, in the words the bell and the email share. */
export function domainAttentionMessage(
  args: {
    domain: string
    recordName: string
    deadline?: string | null
    signInDomains?: readonly string[] | null
  },
  locale: 'en' | 'fa' = 'en'
): string {
  const { domain, recordName, deadline, signInDomains } = args
  if (locale === 'fa') {
    const named = `رکورد تأیید مالکیت (TXT ${recordName})`
    if (!signInDomains) {
      return deadline
        ? `${named} وجود ندارد. برای حفظ تأیید دامنهٔ ${domain}، رکورد را تا ${deadline} دوباره اضافه کنید.`
        : `${named} وجود ندارد.`
    }
    const base = `${named} همچنان وجود ندارد.`
    return signInDomains.length > 0
      ? `${base} ورود از طریق این دامنه‌ها دیگر تأییدشده نیست: ${signInDomains.join('، ')}.`
      : base
  }
  const named = `The verification record (TXT ${recordName})`
  if (!signInDomains) {
    return deadline
      ? `${named} is missing. Add it back by ${deadline} to keep ${domain} verified.`
      : `${named} is missing.`
  }
  const base = `${named} is still missing.`
  return signInDomains.length > 0
    ? `${base} Sign-in is no longer verified for ${signInDomains.join(', ')}.`
    : base
}

/**
 * Sent to the people who manage the workspace's domains when a domain added
 * by name loses its ownership record: with a deadline while it is still
 * verified, and without one once it is not.
 */
export function DomainAttentionEmail({
  domain,
  record,
  deadline,
  signInDomains,
  settingsUrl,
  workspaceName,
  logoUrl,
}: DomainAttentionEmailProps) {
  const title = domainAttentionTitle(domain, !!signInDomains, 'fa')
  return (
    <EmailLayout preview={title} logoUrl={logoUrl}>
      <Heading style={typography.h1}>{title}</Heading>
      <Text style={typography.text}>
        {domainAttentionMessage({ domain, recordName: record.name, deadline, signInDomains }, 'fa')}
      </Text>
      <Text style={typography.text}>مقدار: {record.value}</Text>
      {settingsUrl ? (
        <Text style={typography.text}>
          برای بررسی دوباره،{' '}
          <Link href={settingsUrl} style={utils.link}>
            تنظیمات دامنه را باز کنید
          </Link>
          .
        </Text>
      ) : null}
      <TransactionalFooter>
        این ایمیل را دریافت کرده‌اید چون دامنه‌های
        {workspaceName ? ` ${workspaceName}` : ' فضای کاری'} را مدیریت می‌کنید.
      </TransactionalFooter>
    </EmailLayout>
  )
}
