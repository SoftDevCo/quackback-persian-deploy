import { Button, Heading, Section, Text } from '@react-email/components'
import { EmailLayout, NotificationFooter } from './email-layout'
import { typography, button } from './shared-styles'

const MAINTENANCE_BLUE = '#3b82f6'
const MAINTENANCE_BLUE_BG = '#eff6ff'
const MAINTENANCE_BLUE_BORDER = '#bfdbfe'

interface StatusMaintenanceScheduledEmailProps {
  workspaceName: string
  maintenanceTitle: string
  /** Plain text description of the maintenance. */
  body: string
  /** Pre-formatted display string for the start of the maintenance window. */
  startLabel: string
  /** Pre-formatted display string for the end of the maintenance window. */
  endLabel: string
  /** Component names only (no status), since maintenance is scheduled ahead of impact. */
  affectedComponents: string[]
  incidentUrl: string
  unsubscribeUrl: string
  preferencesUrl?: string
  logoUrl?: string
}

export function StatusMaintenanceScheduledEmail({
  workspaceName,
  maintenanceTitle,
  body,
  startLabel,
  endLabel,
  affectedComponents,
  incidentUrl,
  unsubscribeUrl,
  preferencesUrl,
  logoUrl,
}: StatusMaintenanceScheduledEmailProps) {
  return (
    <EmailLayout
      preview={`تعمیر و نگهداری زمان‌بندی‌شده: ${maintenanceTitle} (${startLabel})`}
      logoUrl={logoUrl}
      logoAlt={workspaceName}
    >
      {/* Content */}
      <Text
        style={{
          color: MAINTENANCE_BLUE,
          fontSize: '13px',
          fontWeight: '700',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginTop: '0',
          marginBottom: '8px',
        }}
      >
        تعمیر و نگهداری زمان‌بندی‌شده
      </Text>
      <Heading style={typography.h1}>{maintenanceTitle}</Heading>
      <Text style={typography.text}>
        {workspaceName} تعمیر و نگهداری زمان‌بندی‌شده‌ای دارد که ممکن است بر سرویس‌های آن تأثیر بگذارد.
      </Text>
      {body && <Text style={typography.text}>{body}</Text>}

      {/* Maintenance window */}
      <Section
        style={{
          backgroundColor: MAINTENANCE_BLUE_BG,
          border: `1px solid ${MAINTENANCE_BLUE_BORDER}`,
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '24px',
        }}
      >
        <Text
          style={{
            color: MAINTENANCE_BLUE,
            fontSize: '13px',
            fontWeight: '600',
            marginTop: '0',
            marginBottom: '4px',
          }}
        >
          بازه‌ی تعمیر و نگهداری
        </Text>
        <Text style={{ ...typography.text, marginTop: '0', marginBottom: '0', fontWeight: '600' }}>
          {startLabel} تا {endLabel}
        </Text>
      </Section>

      {/* Affected components */}
      {affectedComponents.length > 0 && (
        <Section style={{ marginBottom: '24px' }}>
          <Text
            style={{
              ...typography.textSmall,
              fontWeight: '600',
              marginTop: '0',
              marginBottom: '8px',
            }}
          >
            مؤلفه‌های تحت تأثیر
          </Text>
          <Text style={{ ...typography.textSmall, marginTop: '0', marginBottom: '0' }}>
            {affectedComponents.join(', ')}
          </Text>
        </Section>
      )}

      {/* CTA Button */}
      <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
        <Button style={button.primary} href={incidentUrl}>
          مشاهده‌ی صفحه‌ی وضعیت
        </Button>
      </Section>

      {/* Footer */}
      <NotificationFooter
        reason="این ایمیل به این دلیل برای شما ارسال شده که دریافت به‌روزرسانی‌های وضعیت را فعال کرده‌اید."
        unsubscribeUrl={unsubscribeUrl}
        preferencesUrl={preferencesUrl}
      />
    </EmailLayout>
  )
}
