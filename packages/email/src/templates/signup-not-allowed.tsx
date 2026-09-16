import { Heading, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography } from './shared-styles'

interface SignupNotAllowedEmailProps {
  workspaceName?: string
  logoUrl?: string
}

/**
 * Why no sign-in link arrived.
 *
 * The workspace refuses to open an account for this address, and the HTTP
 * response deliberately does not say so: an endpoint that answered differently
 * per address would tell any unauthenticated caller which addresses hold
 * accounts here. The inbox is the one channel that reaches only the person the
 * answer is about, so the refusal is delivered here instead.
 *
 * Carries no link and no code. There is nothing to grant, which is the point:
 * a message with no capability in it can be mailed to an address nobody has
 * proven they own.
 */
export function SignupNotAllowedEmail({ workspaceName, logoUrl }: SignupNotAllowedEmailProps) {
  const where = workspaceName ? `${workspaceName}` : 'این فضا'
  return (
    <EmailLayout preview="درباره‌ی درخواست ورود شما" logoUrl={logoUrl}>
      <Heading style={{ ...typography.h1, textAlign: 'center' }}>
        برای این نشانی حسابی وجود ندارد
      </Heading>
      <Text style={{ ...typography.text, textAlign: 'center' }}>
        شخصی در {where} برای این نشانی ایمیل درخواست پیوند ورود کرده است.
      </Text>
      <Text style={{ ...typography.text, textAlign: 'center' }}>
        برای این نشانی در {where} حسابی وجود ندارد و ثبت‌نام حساب جدید پذیرفته نمی‌شود. از مدیر
        بخواهید شما را دعوت کند و سپس با همان نشانی وارد شوید.
      </Text>

      <TransactionalFooter>
        اگر شما این درخواست را نداده‌اید، می‌توانید این ایمیل را نادیده بگیرید. هیچ حسابی ساخته
        نشده و تغییری انجام نشده است.
      </TransactionalFooter>
    </EmailLayout>
  )
}
