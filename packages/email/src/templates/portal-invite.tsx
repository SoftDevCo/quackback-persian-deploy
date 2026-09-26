import { Button, Heading, Link, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography, button, utils } from './shared-styles'

interface PortalInviteEmailProps {
  workspaceName: string
  inviteLink: string
  logoUrl?: string
  personalMessage?: string
}

export function PortalInviteEmail({
  workspaceName,
  inviteLink,
  logoUrl,
  personalMessage,
}: PortalInviteEmailProps) {
  return (
    <EmailLayout
      preview={`برای دسترسی به پورتال ${workspaceName} دعوت شده‌اید`}
      logoUrl={logoUrl}
      logoAlt={workspaceName}
    >
      {/* Content */}
      <Heading style={typography.h1}>از شما دعوت شده است!</Heading>
      <Text style={typography.text}>
        برای دسترسی به پورتال <strong>{workspaceName}</strong> دعوت شده‌اید. برای پذیرش دعوت و
        ورود، روی دکمه‌ی زیر کلیک کنید.
      </Text>

      {personalMessage && (
        <Section
          style={{
            backgroundColor: '#f6f8fa',
            borderLeft: '3px solid #d0d7de',
            padding: '12px 16px',
            marginTop: '24px',
            marginBottom: '8px',
            borderRadius: '4px',
          }}
        >
          <Text style={{ ...typography.textSmall, margin: 0, fontStyle: 'italic' }}>
            {personalMessage}
          </Text>
        </Section>
      )}

      {/* CTA Button */}
      <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
        <Button style={button.primary} href={inviteLink}>
          پذیرش دعوت‌نامه
        </Button>
      </Section>

      {/* Fallback Link */}
      <Text style={typography.textSmall}>
        یا این پیوند را در مرورگر خود کپی و جای‌گذاری کنید:{' '}
        <Link href={inviteLink} style={utils.link}>
          {inviteLink}
        </Link>
      </Text>

      {/* Footer */}
      <TransactionalFooter>
        اگر منتظر این دعوت‌نامه نبوده‌اید، می‌توانید این ایمیل را نادیده بگیرید.
      </TransactionalFooter>
    </EmailLayout>
  )
}
