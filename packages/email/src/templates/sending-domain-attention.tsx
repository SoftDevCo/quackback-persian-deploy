import { Heading, Link, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography, utils } from './shared-styles'

/** The record whose check failed, as the settings page names it. */
export interface SendingDomainAttentionRecord {
  purpose: 'ownership' | 'dkim' | 'mail-from'
  type: string
  /** The full DNS name, e.g. `qb-bounce.acme.com`. */
  name: string
  state: 'missing' | 'mismatch' | 'proxied'
  /** What was found instead, for a mismatch. */
  seen?: string
  /** A value the DNS host cut short or saved with its quote marks. */
  reason?: 'truncated' | 'quoted'
}

/**
 * What is wrong: the first listed record that failed its check, or
 * `signing-key` when every listed record looks right (or the key signing the
 * mail is not one of them) and signing still fails.
 */
export type SendingDomainAttentionProblem = SendingDomainAttentionRecord | 'signing-key'

export interface SendingDomainAttentionEmailProps {
  domain: string
  /** What failed; absent when nothing more specific is known. */
  record?: SendingDomainAttentionProblem | null
  settingsUrl?: string | null
  workspaceName?: string
  logoUrl?: string
}

const PURPOSE_LABEL: Record<SendingDomainAttentionRecord['purpose'], string> = {
  ownership: 'رکورد مالکیت',
  dkim: 'رکورد DKIM',
  'mail-from': 'رکورد مسیر بازگشت',
}

/** One sentence naming the record and what is wrong with it. */
export function sendingDomainProblem(
  domain: string,
  record: SendingDomainAttentionProblem | null | undefined
): string {
  if (!record) return `ارائه‌دهندهٔ ایمیل دیگر دامنهٔ ${domain} را تأیید نمی‌کند.`
  if (record === 'signing-key') return `کلید امضای دامنهٔ ${domain} کار نمی‌کند.`
  const named = `${PURPOSE_LABEL[record.purpose]} (${record.type} ${record.name})`
  if (record.state === 'proxied')
    return `${named} از پراکسی عبور می‌کند. پراکسی آن را غیرفعال کنید.`
  if (record.state === 'mismatch') {
    if (record.reason === 'truncated') return `مقدار ${named} توسط میزبان DNS کوتاه شده است.`
    if (record.reason === 'quoted') return `مقدار ${named} همراه با علامت نقل‌قول ذخیره شده است.`
    return record.seen ? `مقدار ${named} متفاوت است: ${record.seen}.` : `مقدار ${named} متفاوت است.`
  }
  return `${named} وجود ندارد.`
}

/**
 * Sent to the people who manage email channels when a verified sending domain
 * stops verifying, because from that moment replies leave from the default
 * address instead of the domain.
 */
export function SendingDomainAttentionEmail({
  domain,
  record,
  settingsUrl,
  workspaceName,
  logoUrl,
}: SendingDomainAttentionEmailProps) {
  const title = `ارسال ایمیل از ${domain} نیاز به بررسی دارد`
  return (
    <EmailLayout preview={title} logoUrl={logoUrl}>
      <Heading style={typography.h1}>{title}</Heading>
      <Text style={typography.text}>{sendingDomainProblem(domain, record)}</Text>
      <Text style={typography.text}>تا زمان رفع مشکل، پاسخ‌ها از نشانی پیش‌فرض ارسال می‌شوند.</Text>
      {settingsUrl ? (
        <Text style={typography.text}>
          <Link href={settingsUrl} style={utils.link}>
            تنظیمات ایمیل را باز کنید
          </Link>{' '}
          تا همهٔ رکوردها را ببینید و تأیید کنید.
        </Text>
      ) : null}
      <TransactionalFooter>
        این ایمیل را دریافت کرده‌اید چون کانال‌های ایمیل{workspaceName ? ` ${workspaceName}` : ''}{' '}
        را مدیریت می‌کنید.
      </TransactionalFooter>
    </EmailLayout>
  )
}
