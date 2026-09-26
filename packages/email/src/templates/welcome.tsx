import { Button, Column, Heading, Row, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography, button, colors } from './shared-styles'

interface WelcomeEmailProps {
  name: string
  workspaceName: string
  dashboardUrl: string
  logoUrl?: string
}

export function WelcomeEmail({ name, workspaceName, dashboardUrl, logoUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout
      preview={`به ${workspaceName} در کوئک‌بک خوش آمدید`}
      logoUrl={logoUrl}
      logoAlt={workspaceName}
    >
      {/* Content */}
      <Heading style={typography.h1}>به کوئک‌بک خوش آمدید!</Heading>
      <Text style={typography.text}>
        سلام {name}، فضای کاری <strong>{workspaceName}</strong> شما آماده است. از امروز جمع‌آوری و
        مدیریت بازخورد مشتریان را شروع کنید.
      </Text>

      {/* Features List - using Row/Column instead of spans for email compatibility */}
      <Section style={{ marginBottom: '24px' }}>
        {[
          'ساخت تابلوی بازخورد',
          'دعوت از اعضای تیم',
          'اشتراک‌گذاری نقشه‌راه عمومی',
          'اتصال به GitHub، Slack و Discord',
        ].map((feature) => (
          <Row key={feature} style={{ marginBottom: '4px' }}>
            <Column style={{ width: '28px', verticalAlign: 'top' }}>
              <Text style={checkIcon}>&#10003;</Text>
            </Column>
            <Column>
              <Text style={featureText}>{feature}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      {/* CTA Button */}
      <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Button style={button.primary} href={dashboardUrl}>
          رفتن به داشبورد
        </Button>
      </Section>

      {/* Footer */}
      <TransactionalFooter>
        از جمع‌آوری بازخورد لذت ببرید!
        <br />
        تیم کوئک‌بک
      </TransactionalFooter>
    </EmailLayout>
  )
}

const checkIcon = {
  color: colors.primary,
  fontSize: '15px',
  fontWeight: '700' as const,
  lineHeight: '28px',
  marginTop: '0',
  marginBottom: '0',
}

const featureText = {
  color: colors.text,
  fontSize: '15px',
  lineHeight: '28px',
  marginTop: '0',
  marginBottom: '0',
}
