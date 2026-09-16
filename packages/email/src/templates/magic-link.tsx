import { Button, Heading, Hr, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography, button, utils } from './shared-styles'

interface MagicLinkEmailProps {
  signInUrl: string
  code: string
  logoUrl?: string
}

/**
 * Sign-in email containing both a one-click magic link and a 6-digit code.
 *
 * The link is the lower-friction path on desktop; the code is the
 * cross-device fallback (start on desktop, open email on phone — type
 * the code on the device that started the flow). Either consumes the
 * verification record on the server, so the user can pick whichever is
 * convenient.
 */
export function MagicLinkEmail({ signInUrl, code, logoUrl }: MagicLinkEmailProps) {
  return (
    <EmailLayout preview="پیوند ورود به حساب" logoUrl={logoUrl}>
      <Heading style={{ ...typography.h1, textAlign: 'center' }}>ورود به کوئک‌بک</Heading>
      <Text style={{ ...typography.text, textAlign: 'center' }}>
        برای تکمیل ورود، روی دکمه‌ی زیر کلیک کنید.
      </Text>

      <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
        <Button style={button.primary} href={signInUrl}>
          ورود
        </Button>
      </Section>

      <Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />

      <Text style={{ ...typography.text, textAlign: 'center' }}>
        یا این کد را در صفحه‌ی ورود وارد کنید:
      </Text>

      <Section style={utils.codeBox}>
        <Text style={utils.code}>{code}</Text>
      </Section>

      <Text style={{ ...typography.textSmall, textAlign: 'center' }}>
        این پیوند و کد تا ۱۰ دقیقه معتبر هستند.
      </Text>

      <TransactionalFooter>
        اگر شما درخواست ورود نداده‌اید، می‌توانید این ایمیل را نادیده بگیرید.
      </TransactionalFooter>
    </EmailLayout>
  )
}
