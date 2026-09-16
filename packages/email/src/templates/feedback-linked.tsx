import { Button, Heading, Section, Text } from '@react-email/components'
import { EmailLayout, NotificationFooter } from './email-layout'
import { typography, button, colors } from './shared-styles'

interface FeedbackLinkedEmailProps {
  recipientName?: string
  postTitle: string
  postUrl: string
  workspaceName: string
  unsubscribeUrl: string
  preferencesUrl?: string
  attributedByName?: string
  logoUrl?: string
}

export function FeedbackLinkedEmail({
  recipientName,
  postTitle,
  postUrl,
  workspaceName,
  unsubscribeUrl,
  preferencesUrl,
  attributedByName,
  logoUrl,
}: FeedbackLinkedEmailProps) {
  const greeting = recipientName ? `ممنون ${recipientName}!` : 'ممنونیم!'
  const attribution = attributedByName
    ? ` ${attributedByName} از تیم ${workspaceName} بازخورد شما را به یک مطلب مرتبط کرده است.`
    : ` بازخورد شما به یک مطلب در ${workspaceName} مرتبط شده است.`

  return (
    <EmailLayout
      preview={`بازخورد شما به «${postTitle}» مرتبط شده است`}
      logoUrl={logoUrl}
      logoAlt={workspaceName}
    >
      {/* Content */}
      <Heading style={typography.h1}>بازخورد شما در حال پیگیری است!</Heading>
      <Text style={typography.text}>
        {greeting}
        {attribution} با تغییر وضعیت یا ثبت نظر جدید، به شما اطلاع داده می‌شود.
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

      {/* CTA Button */}
      <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
        <Button style={button.primary} href={postUrl}>
          مشاهده‌ی بازخورد
        </Button>
      </Section>

      {/* Footer */}
      <NotificationFooter
        reason="این ایمیل به این دلیل برای شما ارسال شده که بازخوردتان به این مطلب مرتبط شده است."
        unsubscribeUrl={unsubscribeUrl}
        preferencesUrl={preferencesUrl}
      />
    </EmailLayout>
  )
}
