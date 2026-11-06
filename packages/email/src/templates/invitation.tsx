import { Button, Heading, Link, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography, button, utils } from './shared-styles'

/** The invitation's words in the team's language, written by the caller. */
export interface InvitationEmailCopy {
  lang: string
  dir: 'ltr' | 'rtl'
  preview: string
  heading: string
  body: string
  cta: string
  fallback: string
  footer: string
}

interface InvitationEmailProps {
  invitedByName: string
  inviteeName?: string
  organizationName: string
  inviteLink: string
  logoUrl?: string
  /** Localised copy. Without it the email reads in Persian. */
  copy?: InvitationEmailCopy
}

function persianCopy({
  invitedByName,
  inviteeName,
  organizationName,
}: Pick<InvitationEmailProps, 'invitedByName' | 'inviteeName' | 'organizationName'>) {
  const body = `${invitedByName} از شما دعوت کرده است به ${organizationName} در کوئک‌بک بپیوندید.`
  return {
    lang: 'fa',
    dir: 'rtl' as const,
    preview: body,
    heading: inviteeName ? `سلام ${inviteeName}، از شما دعوت شده است!` : 'از شما دعوت شده است!',
    body,
    cta: 'پذیرش دعوت‌نامه',
    fallback: 'یا این پیوند را در مرورگر خود کپی و جای‌گذاری کنید:',
    footer: 'اگر منتظر این دعوت‌نامه نبوده‌اید، می‌توانید این ایمیل را نادیده بگیرید.',
  }
}

export function InvitationEmail(props: InvitationEmailProps) {
  const { organizationName, inviteLink, logoUrl } = props
  const copy = props.copy ?? persianCopy(props)
  return (
    <EmailLayout
      preview={copy.preview}
      logoUrl={logoUrl}
      logoAlt={organizationName}
      lang={copy.lang}
      dir={copy.dir}
    >
      <Heading style={typography.h1}>{copy.heading}</Heading>
      <Text style={typography.text}>{copy.body}</Text>

      <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
        <Button style={button.primary} href={inviteLink}>
          {copy.cta}
        </Button>
      </Section>

      <Text style={typography.textSmall}>
        {copy.fallback}{' '}
        <Link href={inviteLink} style={{ ...utils.link, direction: 'ltr', unicodeBidi: 'isolate' }}>
          {inviteLink}
        </Link>
      </Text>

      <TransactionalFooter>{copy.footer}</TransactionalFooter>
    </EmailLayout>
  )
}
