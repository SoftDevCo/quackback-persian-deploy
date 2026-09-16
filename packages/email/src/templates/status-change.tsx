import { Button, Heading, Section, Text } from '@react-email/components'
import { EmailLayout, NotificationFooter } from './email-layout'
import { typography, button, colors } from './shared-styles'

interface StatusChangeEmailProps {
  postTitle: string
  postUrl: string
  previousStatus: string
  newStatus: string
  organizationName: string
  unsubscribeUrl: string
  preferencesUrl?: string
  logoUrl?: string
}

function getStatusEmoji(status: string): string {
  const map: Record<string, string> = {
    open: '\u{1F4E5}',
    under_review: '\u{1F440}',
    planned: '\u{1F4C5}',
    in_progress: '\u{1F6A7}',
    complete: '\u2705',
    closed: '\u{1F512}',
  }
  return map[status.toLowerCase().replace(/\s+/g, '_')] || '\u{1F4CC}'
}

function capitalizeStatus(status: string): string {
  const key = status.toLowerCase().replace(/[_\s-]+/g, '_')
  const labels: Record<string, string> = {
    open: 'باز',
    under_review: 'در حال بررسی',
    planned: 'برنامه‌ریزی‌شده',
    in_progress: 'در حال انجام',
    complete: 'تکمیل‌شده',
    completed: 'تکمیل‌شده',
    closed: 'بسته‌شده',
    resolved: 'حل‌شده',
  }
  if (labels[key]) return labels[key]
  return status
    .split(/[_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function StatusChangeEmail({
  postTitle,
  postUrl,
  previousStatus,
  newStatus,
  organizationName,
  unsubscribeUrl,
  preferencesUrl,
  logoUrl,
}: StatusChangeEmailProps) {
  const emoji = getStatusEmoji(newStatus)
  const formattedNewStatus = capitalizeStatus(newStatus)
  const formattedPreviousStatus = capitalizeStatus(previousStatus)

  return (
    <EmailLayout
      preview={`${emoji} وضعیت بازخورد شما اکنون ${formattedNewStatus} است`}
      logoUrl={logoUrl}
      logoAlt={organizationName}
    >
      {/* Content */}
      <Heading style={typography.h1}>
        {emoji} وضعیت بازخورد شما اکنون {formattedNewStatus} است!
      </Heading>
      <Text style={typography.text}>
        خبر خوب! وضعیت بازخورد شما در {organizationName} به‌روزرسانی شده است.
      </Text>

      {/* Post Title */}
      <Section
        style={{
          backgroundColor: colors.surfaceMuted,
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '24px',
        }}
      >
        <Text style={{ ...typography.text, marginTop: '0', marginBottom: '0', fontWeight: '600' }}>
          {postTitle}
        </Text>
      </Section>

      {/* Status Change */}
      <Text style={typography.text}>
        {formattedPreviousStatus}
        {' \u2192 '}
        <strong>{formattedNewStatus}</strong>
      </Text>

      {/* CTA Button */}
      <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
        <Button style={button.primary} href={postUrl}>
          مشاهده‌ی بازخورد
        </Button>
      </Section>

      {/* Footer */}
      <NotificationFooter
        reason="این ایمیل به این دلیل برای شما ارسال شده که این بازخورد را ثبت کرده‌اید یا دریافت اعلان‌های آن را فعال کرده‌اید."
        unsubscribeUrl={unsubscribeUrl}
        preferencesUrl={preferencesUrl}
      />
    </EmailLayout>
  )
}
