import { Heading, Hr, Link, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography, utils } from './shared-styles'

interface NewSignInEmailProps {
  workspaceName?: string
  occurredAt: string
  ipAddress?: string | null
  userAgent?: string | null
  location?: string | null
  settingsUrl?: string | null
  /** When true, skip the password CTA — the profile page hides PasswordForm. */
  ssoEnforced?: boolean
  logoUrl?: string
}

/**
 * "New device" sign-in notification — sent when an additional signed
 * device cookie is seen for the recipient's account. Browser/OS, IP
 * and location are shown as context; they are not the device identity.
 * The user is already signed in by the time this lands; the alert is
 * purely informational with a recovery path if it wasn't them.
 */
export function NewSignInEmail({
  workspaceName,
  occurredAt,
  ipAddress,
  userAgent,
  location,
  settingsUrl,
  ssoEnforced,
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
        {location ? (
          <Text style={typography.text}>
            <strong>مکان:</strong> {location}
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
        {ssoEnforced ? (
          'اگر این ورود را شما انجام داده‌اید، نیازی به اقدام نیست. در غیر این صورت، رمز عبور را در سامانهٔ هویت خود تغییر دهید و از مدیر فضای کاری بخواهید نشست‌های دیگر را ببندد.'
        ) : (
          <>
            اگر این ورود را شما انجام داده‌اید، نیازی به اقدام نیست. در غیر این صورت،{' '}
            {settingsUrl ? (
              <>
                <Link href={settingsUrl} style={utils.link}>
                  تعیین یا تغییر رمز عبور
                </Link>{' '}
                را از تنظیمات نمایه انجام دهید؛ این کار نشست‌های دیگر را می‌بندد.
              </>
            ) : (
              'رمز عبور را از تنظیمات نمایه تعیین یا تغییر دهید؛ این کار نشست‌های دیگر را می‌بندد.'
            )}
          </>
        )}
      </Text>

      <TransactionalFooter>
        این ایمیل به‌دلیل شناسایی ورود جدید به حساب شما ارسال شده است. این هشدار امنیتی ضروری است و
        نمی‌توان آن را غیرفعال کرد.
      </TransactionalFooter>
    </EmailLayout>
  )
}
