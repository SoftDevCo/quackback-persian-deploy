import { Heading, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography, colors } from './shared-styles'

interface MessengerInstallEmailProps {
  senderName: string
  workspaceName: string
  snippet: string
  logoUrl?: string
}

/** A teammate asks whoever edits the website to add Messenger. */
export function MessengerInstallEmail({
  senderName,
  workspaceName,
  snippet,
  logoUrl,
}: MessengerInstallEmailProps) {
  return (
    <EmailLayout
      preview={`افزودن پیام‌رسان ${workspaceName} به وب‌سایت`}
      logoUrl={logoUrl}
      logoAlt={workspaceName}
    >
      <Heading style={typography.h1}>افزودن پیام‌رسان به وب‌سایت</Heading>
      <Text style={typography.text}>
        <strong>{senderName}</strong> از شما خواسته است پیام‌رسان {workspaceName} را به وب‌سایت
        اضافه کنید. این کد را در همهٔ صفحات، پیش از تگ بسته‌شدن body قرار دهید.
      </Text>
      <Section style={codeBlock}>
        <Text style={codeText}>{snippet}</Text>
      </Section>
      <Text style={typography.textSmall}>
        اگر از Google Tag Manager استفاده می‌کنید، یک تگ Custom HTML با همین کد بسازید و آن را برای
        همهٔ صفحات فعال کنید.
      </Text>
      <TransactionalFooter>
        پس از بارگذاری پیام‌رسان در سایت، اتصال آن برای {senderName} نمایش داده می‌شود.
      </TransactionalFooter>
    </EmailLayout>
  )
}

const codeBlock = {
  backgroundColor: '#F4F4F5',
  borderRadius: '8px',
  padding: '12px 16px',
  margin: '16px 0',
}

const codeText = {
  color: colors.text,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '12px',
  lineHeight: '18px',
  whiteSpace: 'pre-wrap' as const,
  direction: 'ltr' as const,
  textAlign: 'left' as const,
  margin: '0',
}
