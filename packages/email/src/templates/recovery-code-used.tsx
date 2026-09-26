import { Heading, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography } from './shared-styles'

interface RecoveryCodeUsedEmailProps {
  workspaceName?: string
  ipAddress?: string | null
  userAgent?: string | null
  occurredAt: string
  logoUrl?: string
}

/**
 * Security alert sent after a recovery code is consumed. Mirrors the
 * "new sign-in from unrecognised device" pattern most platforms send
 * — the recipient is the one whose code was used, so the email is
 * their canary against unauthorised access.
 */
export function RecoveryCodeUsedEmail({
  workspaceName,
  ipAddress,
  userAgent,
  occurredAt,
  logoUrl,
}: RecoveryCodeUsedEmailProps) {
  const workspaceLabel = workspaceName ? ` for ${workspaceName}` : ''
  return (
    <EmailLayout preview={`برای ورود از کد بازیابی استفاده شد${workspaceLabel}`} logoUrl={logoUrl}>
      <Heading style={{ ...typography.h1, textAlign: 'center' }}>از کد بازیابی استفاده شد</Heading>
      <Text style={{ ...typography.text, textAlign: 'center' }}>
        شخصی با استفاده از یکی از کدهای بازیابی ذخیره‌شده‌ی شما به حساب‌تان وارد شده است{workspaceLabel}.
      </Text>

      <Section style={{ marginTop: '24px', marginBottom: '24px' }}>
        <Text style={typography.textSmall}>
          <strong>زمان:</strong> {occurredAt}
        </Text>
        {ipAddress ? (
          <Text style={typography.textSmall}>
            <strong>نشانی IP:</strong> {ipAddress}
          </Text>
        ) : null}
        {userAgent ? (
          <Text style={typography.textSmall}>
            <strong>دستگاه:</strong> {userAgent}
          </Text>
        ) : null}
      </Section>

      <Text style={typography.text}>
        اگر این کار توسط شما انجام شده است، اقدامی لازم نیست. این کد مصرف شده و دوباره قابل استفاده نیست.
      </Text>
      <Text style={typography.text}>
        اگر شما نبوده‌اید، فوراً وارد حساب شوید و کدهای بازیابی خود را تعویض کنید. شخصی که از کد
        استفاده کرده اکنون نشست فعال دارد؛ آن را از تنظیمات امنیتی لغو کنید.
      </Text>

      <TransactionalFooter>
        این ایمیل به دلیل استفاده از یکی از کدهای بازیابی حساب شما ارسال شده است. این هشدارها
        ضروری هستند و قابل غیرفعال‌کردن نیستند.
      </TransactionalFooter>
    </EmailLayout>
  )
}
