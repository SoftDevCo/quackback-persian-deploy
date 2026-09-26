import { Button, Heading, Link, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography, button, utils } from './shared-styles'

interface PasswordResetEmailProps {
  resetLink: string
  logoUrl?: string
}

export function PasswordResetEmail({ resetLink, logoUrl }: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="بازیابی رمز عبور کوئک‌بک" logoUrl={logoUrl}>
      {/* Content */}
      <Heading style={{ ...typography.h1, textAlign: 'center' }}>بازیابی رمز عبور</Heading>
      <Text style={{ ...typography.text, textAlign: 'center' }}>
        برای تعیین رمز عبور جدید، روی دکمه‌ی زیر کلیک کنید. این پیوند تا ۲۴ ساعت معتبر است.
      </Text>

      {/* CTA Button */}
      <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
        <Button style={button.primary} href={resetLink}>
          تغییر رمز عبور
        </Button>
      </Section>

      {/* Fallback Link */}
      <Text style={typography.textSmall}>
        یا این پیوند را در مرورگر خود کپی و جای‌گذاری کنید:{' '}
        <Link href={resetLink} style={utils.link}>
          {resetLink}
        </Link>
      </Text>

      {/* Footer */}
      <TransactionalFooter>
        اگر درخواست تغییر رمز عبور نداده‌اید، می‌توانید این ایمیل را نادیده بگیرید.
      </TransactionalFooter>
    </EmailLayout>
  )
}
