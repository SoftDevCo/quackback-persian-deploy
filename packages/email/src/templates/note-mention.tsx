import { Button, Heading, Section, Text } from '@react-email/components'
import { EmailLayout, NotificationFooter } from './email-layout'
import { typography, button, colors } from './shared-styles'

export interface NoteMentionEmailProps {
  /** Teammate who wrote the note. */
  authorName: string
  /** Plain-text note preview. Empty string suppresses the quote block. */
  preview: string
  /** Admin inbox deep link — the note is internal, so this is never a portal URL. */
  conversationUrl: string
  workspaceName: string
  preferencesUrl?: string
  logoUrl?: string
}

/**
 * Alert for a teammate @-mentioned in an internal note on a conversation.
 *
 * Agent-facing, so there is no unsubscribe token: the only opt-out is the
 * notification-preferences surface, and the footer links straight to it.
 */
export function NoteMentionEmail({
  authorName,
  preview,
  conversationUrl,
  workspaceName,
  preferencesUrl,
  logoUrl,
}: NoteMentionEmailProps) {
  const displayName = authorName || 'یکی از هم‌تیمی‌ها'
  const paragraphs = preview
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <EmailLayout
      preview={`${displayName} شما را در یک یادداشت داخلی ذکر کرده است`}
      logoUrl={logoUrl}
      logoAlt={workspaceName}
    >
      <Heading style={typography.h1}>نام شما در یک یادداشت ذکر شده است</Heading>
      <Text style={typography.text}>
        {displayName} نام شما را در یک یادداشت داخلی در یک گفتگو ذکر کرده است.
      </Text>

      {paragraphs.length > 0 && (
        <Section
          style={{
            backgroundColor: colors.surfaceMuted,
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '16px',
            borderLeft: `3px solid ${colors.primary}`,
          }}
        >
          <Text
            style={{
              ...typography.textSmall,
              marginTop: '0',
              marginBottom: '4px',
              color: colors.textMuted,
            }}
          >
            {displayName}
          </Text>
          {paragraphs.map((p, i) => (
            <Text
              key={i}
              style={{ ...typography.text, marginTop: i === 0 ? '0' : '8px', marginBottom: '0' }}
            >
              {p}
            </Text>
          ))}
        </Section>
      )}

      <Text style={{ ...typography.textSmall, color: colors.textMuted }}>
        یادداشت‌های داخلی فقط برای تیم شما قابل مشاهده هستند.
      </Text>

      <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
        <Button style={button.primary} href={conversationUrl}>
          بازکردن گفتگو
        </Button>
      </Section>

      {preferencesUrl ? (
        <NotificationFooter
          reason={`این ایمیل به این دلیل برای شما ارسال شده که نام‌تان در ${workspaceName} ذکر شده است.`}
          unsubscribeUrl={preferencesUrl}
          unsubscribeLabel="مدیریت تنظیمات اعلان‌ها"
        />
      ) : (
        <Text style={typography.footer}>
          این ایمیل به این دلیل برای شما ارسال شده که نام‌تان در {workspaceName} ذکر شده است.
        </Text>
      )}
    </EmailLayout>
  )
}
