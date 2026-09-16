import { Heading, Hr, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography, utils } from './shared-styles'

interface NewSignInEmailProps {
  workspaceName?: string
  occurredAt: string
  ipAddress?: string | null
  userAgent?: string | null
  logoUrl?: string
}

/**
 * "New device" sign-in notification — sent only on first-sight of a
 * (UA, /24 IP) combination for the recipient's account. The user is
 * already signed in by the time this lands; the alert is purely
 * informational with a recovery path if it wasn't them.
 */
export function NewSignInEmail({
  workspaceName,
  occurredAt,
  ipAddress,
  userAgent,
  logoUrl,
}: NewSignInEmailProps) {
  return (
    <EmailLayout preview="ورود جدیدی به حساب شما شناسایی شد" logoUrl={logoUrl}>
      <Heading style={typography.h1}>ورود جدید به حساب شما</Heading>
      <Text style={typography.text}>
        {workspaceName
          ? `شخصی با دستگاهی که قبلاً ندیده‌ایم، به حساب ${workspaceName} شما وارد شده است.`
          : 'شخصی با دستگاهی که قبلاً ندیده‌ایم، به حساب شما وارد شده است.'}
      </Text>

      <Section style={utils.codeBox}>
        <Text style={typography.text}>
          <strong>زمان:</strong> {occurredAt}
        </Text>
        {ipAddress ? (
          <Text style={typography.text}>
            <strong>نشانی IP:</strong> {ipAddress}
          </Text>
        ) : null}
        {userAgent ? (
          <Text style={typography.text}>
            <strong>دستگاه:</strong> {userAgent}
          </Text>
        ) : null}
      </Section>

      <Hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />

      <Text style={typography.text}>
        اگر این ورود توسط شما انجام شده است، اقدامی لازم نیست. اگر شما نبوده‌اید، رمز عبور خود را
        تغییر دهید و نشست‌های فعال دیگر را لغو کنید.
      </Text>

      <TransactionalFooter>
        این ایمیل به دلیل شناسایی ورود جدید به حساب شما ارسال شده است. این هشدار امنیتی ضروری است
        و قابل غیرفعال‌کردن نیست.
      </TransactionalFooter>
    </EmailLayout>
  )
}
