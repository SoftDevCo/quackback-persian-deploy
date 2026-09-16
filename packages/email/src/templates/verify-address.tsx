import { Heading, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography, utils } from './shared-styles'

interface VerifyAddressEmailProps {
  code: string
  workspaceName?: string
  logoUrl?: string
}

/**
 * Proves control of an address someone is adding to, or moving, their account.
 *
 * Deliberately NOT the sign-in template. That one is headed "Sign in to
 * Quackback", and showing it to someone who just asked to change their address
 * reads as a phishing attempt — the action they took and the mail they received
 * would not match. Same code presentation, different sentence.
 *
 * There is no link. The person is already in the app, on the page that asked
 * for the address, so a code they type back keeps them in that context and
 * gives a cross-device link no chance to be intercepted.
 */
export function VerifyAddressEmail({ code, workspaceName, logoUrl }: VerifyAddressEmailProps) {
  const where = workspaceName ? ` برای ${workspaceName}` : ''
  return (
    <EmailLayout preview={`کد تأیید ایمیل${where}`} logoUrl={logoUrl}>
      <Heading style={{ ...typography.h1, textAlign: 'center' }}>تأیید ایمیل</Heading>
      <Text style={{ ...typography.text, textAlign: 'center' }}>
        برای تأیید این نشانی، کد زیر را وارد کنید{where}. این کد تا ۱۰ دقیقه معتبر است.
      </Text>
      <Section style={utils.codeBox}>
        <Text style={utils.code}>{code}</Text>
      </Section>
      <Text style={{ ...typography.footer, textAlign: 'center' }}>
        اگر شما این درخواست را نداده‌اید، آن را نادیده بگیرید؛ بدون این کد هیچ تغییری انجام نمی‌شود.
      </Text>
      <TransactionalFooter>
        این ایمیل به این دلیل ارسال شده که شخصی این نشانی را در یک حساب وارد کرده است. تا زمان
        تأیید، از این نشانی برای هیچ کاری استفاده نمی‌شود.
      </TransactionalFooter>
    </EmailLayout>
  )
}
