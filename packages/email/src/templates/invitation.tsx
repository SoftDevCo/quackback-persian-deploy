import { Button, Heading, Link, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography, button, utils } from './shared-styles'

interface InvitationEmailProps {
  invitedByName: string
  inviteeName?: string
  organizationName: string
  inviteLink: string
  logoUrl?: string
}

export function InvitationEmail({
  invitedByName,
  inviteeName,
  organizationName,
  inviteLink,
  logoUrl,
}: InvitationEmailProps) {
  return (
    <EmailLayout
      preview={`پیوستن به ${organizationName} در کوئک‌بک`}
      logoUrl={logoUrl}
      logoAlt={organizationName}
    >
      {/* Content */}
      <Heading style={typography.h1}>
        {inviteeName ? `سلام ${inviteeName}، از شما دعوت شده است!` : 'از شما دعوت شده است!'}
      </Heading>
      <Text style={typography.text}>
        <strong>{invitedByName}</strong> از شما دعوت کرده است به <strong>{organizationName}</strong>{' '}
        در کوئک‌بک بپیوندید.
      </Text>

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
