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
  /** The value to publish, for a record the owner has to add back. */
  value?: string
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
  /**
   * When set, a warning: the domain still sends as itself, and stops on this
   * date (already formatted) unless the record is fixed.
   */
  deadline?: string | null
  settingsUrl?: string | null
  workspaceName?: string
  logoUrl?: string
}

const PURPOSE_LABEL: Record<SendingDomainAttentionRecord['purpose'], string> = {
  ownership: 'verification record',
  dkim: 'DKIM record',
  'mail-from': 'return path record',
}

const PERSIAN_PURPOSE_LABEL: Record<SendingDomainAttentionRecord['purpose'], string> = {
  ownership: 'رکورد مالکیت',
  dkim: 'رکورد DKIM',
  'mail-from': 'رکورد مسیر بازگشت',
}

/** One sentence naming the problem for the English admin notification. */
export function sendingDomainProblem(
  domain: string,
  record: SendingDomainAttentionProblem | null | undefined
): string {
  if (!record) return `The email provider stopped confirming ${domain}.`
  if (record === 'signing-key') return `The signing key for ${domain} isn't working.`
  const named = `The ${PURPOSE_LABEL[record.purpose]} (${record.type} ${record.name})`
  if (record.state === 'proxied') return `${named} is proxied. Turn off any proxy for it.`
  if (record.state === 'mismatch') {
    if (record.reason === 'truncated') return `${named} was cut short by your DNS host.`
    if (record.reason === 'quoted') return `${named} has quote marks saved in its value.`
    return record.seen
      ? `${named} has a different value: ${record.seen}.`
      : `${named} has a different value.`
  }
  return `${named} is missing.`
}

function persianSendingDomainProblem(
  domain: string,
  record: SendingDomainAttentionProblem | null | undefined
): string {
  if (!record) return `ارائه‌دهندهٔ ایمیل دیگر دامنهٔ ${domain} را تأیید نمی‌کند.`
  if (record === 'signing-key') return `کلید امضای دامنهٔ ${domain} کار نمی‌کند.`
  const named = `${PERSIAN_PURPOSE_LABEL[record.purpose]} (${record.type} ${record.name})`
  if (record.state === 'proxied')
    return `${named} از پراکسی عبور می‌کند. پراکسی آن را غیرفعال کنید.`
  if (record.state === 'mismatch') {
    if (record.reason === 'truncated') return `مقدار ${named} توسط میزبان DNS کوتاه شده است.`
    if (record.reason === 'quoted') return `مقدار ${named} همراه با علامت نقل‌قول ذخیره شده است.`
    return record.seen ? `مقدار ${named} متفاوت است: ${record.seen}.` : `مقدار ${named} متفاوت است.`
  }
  return `${named} وجود ندارد.`
}

/** The sentence giving the date a record has to be fixed by. */
export function sendingDomainDeadline(domain: string, deadline: string): string {
  return `Add it back by ${deadline} to keep sending from ${domain}.`
}

/**
 * Sent to the people who manage the workspace's email settings when a verified sending domain
 * stops verifying, because from that moment its email leaves from the default
 * address instead of the domain; or, with a deadline, when its ownership record
 * goes missing and it will stop verifying on that date unless the record is
 * added back.
 */
export function SendingDomainAttentionEmail({
  domain,
  record,
  deadline,
  settingsUrl,
  workspaceName,
  logoUrl,
}: SendingDomainAttentionEmailProps) {
  const title = `ارسال ایمیل از ${domain} نیاز به بررسی دارد`
  return (
    <EmailLayout preview={title} logoUrl={logoUrl}>
      <Heading style={typography.h1}>{title}</Heading>
      <Text style={typography.text}>{persianSendingDomainProblem(domain, record)}</Text>
      {record && record !== 'signing-key' && record.value ? (
        <Text style={typography.text}>مقدار: {record.value}</Text>
      ) : null}
      <Text style={typography.text}>
        {deadline
          ? `برای ادامهٔ ارسال از ${domain}، رکورد را تا ${deadline} دوباره اضافه کنید.`
          : 'تا زمان رفع مشکل، ایمیل‌ها از نشانی پیش‌فرض ارسال می‌شوند.'}
      </Text>
      {settingsUrl ? (
        <Text style={typography.text}>
          <Link href={settingsUrl} style={utils.link}>
            تنظیمات ایمیل را باز کنید
          </Link>{' '}
          تا همهٔ رکوردها را ببینید و تأیید کنید.
        </Text>
      ) : null}
      <TransactionalFooter>
        این ایمیل را دریافت کرده‌اید چون تنظیمات ایمیل
        {workspaceName ? ` ${workspaceName}` : ''} را مدیریت می‌کنید.
      </TransactionalFooter>
    </EmailLayout>
  )
}
