import { Button, Column, Heading, Row, Section, Text } from '@react-email/components'
import { EmailLayout, NotificationFooter } from './email-layout'
import { typography, button, colors } from './shared-styles'

interface NewCommentEmailProps {
  postTitle: string
  postUrl: string
  commenterName: string
  commentPreview: string
  isTeamMember: boolean
  organizationName: string
  unsubscribeUrl: string
  preferencesUrl?: string
  logoUrl?: string
}

export function NewCommentEmail({
  postTitle,
  postUrl,
  commenterName,
  commentPreview,
  isTeamMember,
  organizationName,
  unsubscribeUrl,
  preferencesUrl,
  logoUrl,
}: NewCommentEmailProps) {
  return (
    <EmailLayout
      preview={`نظر جدید درباره‌ی «${postTitle}»`}
      logoUrl={logoUrl}
      logoAlt={organizationName}
    >
      {/* Content */}
      <Heading style={typography.h1}>نظر جدید درباره‌ی بازخورد شما</Heading>
      <Text style={typography.text}>
        {commenterName}
        {isTeamMember ? ' (عضو تیم)' : ''} درباره‌ی بازخورد شما در {organizationName} نظر داده است.
      </Text>

      {/* Post Title */}
      <Section
        style={{
          backgroundColor: colors.surfaceMuted,
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '16px',
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
          بازخورد
        </Text>
        <Text style={{ ...typography.text, marginTop: '0', marginBottom: '0', fontWeight: '600' }}>
          {postTitle}
        </Text>
      </Section>

      {/* Comment Preview - using Row/Column instead of border-left for Outlook compatibility */}
      <Row style={{ marginBottom: '24px' }}>
        <Column style={{ width: '3px', backgroundColor: colors.primary, borderRadius: '2px' }} />
        <Column style={{ paddingLeft: '16px' }}>
          <Text
            style={{
              ...typography.text,
              marginTop: '0',
              marginBottom: '0',
              fontStyle: 'italic',
            }}
          >
            &quot;{commentPreview}&quot;
          </Text>
        </Column>
      </Row>

      {/* CTA Button */}
      <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
        <Button style={button.primary} href={postUrl}>
          مشاهده‌ی نظر
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
