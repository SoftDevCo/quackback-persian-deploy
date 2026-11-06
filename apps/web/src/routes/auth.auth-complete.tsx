import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { postAuthSuccess, postAuthError } from '@/lib/client/hooks/use-auth-broadcast'
import type { AuthBlockCode } from '@/lib/shared/auth-block-messages'
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'

const ERROR_MESSAGES: Record<AuthBlockCode, string> = {
  password_method_not_allowed:
    'ورود با گذرواژه برای این فضای کاری فعال نیست. از پیوند ورود یا ورود یکپارچه استفاده کنید.',
  magic_link_method_not_allowed: 'ورود با پیوند برای این فضای کاری فعال نیست.',
  oauth_method_not_allowed: 'این روش ورود برای فضای کاری فعال نیست.',
  auth_method_blocked: 'این روش ورود برای حساب شما مجاز نیست.',
  rate_limited: 'تعداد تلاش‌های ورود بیش از حد است. کمی صبر کنید و دوباره تلاش کنید.',
  reserved_email_domain: 'این دامنهٔ ایمیل قابل استفاده نیست. از نشانی ایمیل خود استفاده کنید.',
  verified_domain_requires_sso:
    'دامنهٔ ایمیل شما به ورود یکپارچه نیاز دارد. برای ادامه از گزینهٔ ورود یکپارچه استفاده کنید.',
  require_two_factor: 'احراز هویت دومرحله‌ای لازم است. مرحلهٔ دوم را تأیید کنید.',
  token_expired: 'اعتبار پیوند ورود پایان یافته است. پیوند جدید درخواست کنید.',
  invalid_token: 'پیوند ورود نامعتبر است یا تغییر کرده است. دوباره تلاش کنید.',
  signup_disabled: 'حساب شما برای ورود یکپارچه از پیش آماده نشده است. از مدیر درخواست دعوت کنید.',
  signup_not_allowed:
    'این فضای کاری حساب جدید نمی‌پذیرد. از مدیر دعوت‌نامه بخواهید و با همان حساب وارد شوید.',
  OAUTH_CALLBACK_ERROR:
    'ورود ناموفق بود. ارائه‌دهندهٔ هویت درخواست را رد کرد. تنظیمات برنامه را بررسی کنید و دوباره تلاش کنید.',
  oauth_signin_error:
    'ورود ناموفق بود. ارائه‌دهندهٔ هویت درخواست را رد کرد. تنظیمات برنامه را بررسی کنید و دوباره تلاش کنید.',
  not_team_member: 'این حساب دسترسی تیمی ندارد. برای عضویت با مدیر تماس بگیرید.',
  account_not_linked:
    'حسابی با این ایمیل وجود دارد. برای تأیید از روش ورود قبلی استفاده کنید تا ورود یکپارچه متصل شود.',
  "email_doesn't_match":
    'ایمیل ارائه‌دهندهٔ هویت با ایمیل حساب شما متفاوت است. با حسابی با ایمیل یکسان وارد شوید.',
  email_does_not_match:
    'ایمیل ارائه‌دهندهٔ هویت با ایمیل حساب شما متفاوت است. با حسابی با ایمیل یکسان وارد شوید.',
  account_already_linked_to_different_user:
    'این هویت به حساب دیگری متصل است. از حساب دیگری استفاده کنید یا با مدیر تماس بگیرید.',
  unable_to_link_account: 'اتصال روش ورود ناموفق بود. دوباره تلاش کنید.',
  email_is_missing:
    'ارائه‌دهندهٔ هویت نشانی ایمیل را ارسال نکرد. از مدیر بخواهید دسترسی ایمیل را فعال کند.',
  user_info_is_missing:
    'ارائه‌دهندهٔ هویت مشخصات قابل استفاده ارسال نکرد. از مدیر بخواهید ارسال ایمیل را فعال کند.',
  email_not_found:
    'ارائه‌دهندهٔ هویت نشانی ایمیل را ارسال نکرد. از مدیر بخواهید دسترسی ایمیل را فعال کند.',
  state_mismatch: 'اعتبار این تلاش ورود تمام شده یا قبلاً استفاده شده است. دوباره تلاش کنید.',
  please_restart_the_process:
    'اعتبار این تلاش ورود تمام شده یا قبلاً استفاده شده است. دوباره تلاش کنید.',
  oauth_code_verification_failed: 'تأیید ورود با ارائه‌دهندهٔ هویت ناموفق بود. دوباره تلاش کنید.',
  invalid_code: 'تأیید ورود با ارائه‌دهندهٔ هویت ناموفق بود. دوباره تلاش کنید.',
  no_code: 'تأیید ورود با ارائه‌دهندهٔ هویت ناموفق بود. دوباره تلاش کنید.',
  unable_to_create_user: 'ایجاد حساب ناموفق بود. دوباره تلاش کنید.',
  failed_to_create_user:
    'ایجاد حساب با این پیوند ممکن نشد. شاید پیوند منقضی شده یا فضای کاری حساب جدید نمی‌پذیرد. از مدیر دعوت‌نامه بخواهید.',
  unable_to_create_session: 'ورود ناموفق بود. دوباره تلاش کنید.',
  oauth_provider_not_found:
    'این ارائه‌دهندهٔ ورود در دسترس نیست و ممکن است مدیر آن را غیرفعال کرده باشد.',
  handoff_failed:
    'اعتبار انتقال فضای کاری تمام شده یا قبلاً استفاده شده است. اینجا وارد شوید یا فضای کاری را دوباره باز کنید.',
}

/**
 * Auth Complete Page
 *
 * Popup landing for OAuth sign-ins. On success it broadcasts to the
 * original window via BroadcastChannel and closes itself.
 *
 * It is also the popup's `errorCallbackURL`: a failed OAuth callback
 * lands here with `?error=<code>`. That error is broadcast to the
 * opener (whose dialog is still mounted and can react — e.g. offer the
 * link-conflict recovery for `account_not_linked`) and shown here so
 * the failure is never a silent "Signed in successfully!" + close.
 */
export const Route = createFileRoute('/auth/auth-complete')({
  validateSearch: (search: Record<string, unknown>): { error?: string } => ({
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  component: AuthCompletePage,
})

function AuthCompletePage() {
  const { error } = Route.useSearch()
  const [status, setStatus] = useState<'broadcasting' | 'success' | 'error'>('broadcasting')

  useEffect(() => {
    if (error) {
      postAuthError(error)
      setStatus('error')
      // account_not_linked recovery continues in the opener's dialog —
      // get this window out of the way quickly. Other errors keep the
      // window up long enough to read the message.
      const timeout = setTimeout(
        () => {
          window.close()
        },
        error === 'account_not_linked' ? 1500 : 6000
      )
      return () => clearTimeout(timeout)
    }

    // Post success message to other windows
    postAuthSuccess()
    setStatus('success')

    // Close the window after a brief delay
    const timeout = setTimeout(() => {
      window.close()
    }, 1000)

    return () => clearTimeout(timeout)
  }, [error])

  return (
    <div
      dir="rtl"
      lang="fa"
      className="min-h-screen flex items-center justify-center bg-background"
    >
      <div className="text-center space-y-4 p-8 max-w-md">
        {status === 'broadcasting' && (
          <>
            <ArrowPathIcon className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">در حال تکمیل ورود...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
            <p className="text-foreground font-medium">ورود با موفقیت انجام شد.</p>
            <p className="text-sm text-muted-foreground">این پنجره به‌صورت خودکار بسته می‌شود.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <ExclamationTriangleIcon className="h-12 w-12 text-amber-500 mx-auto" />
            <p className="text-foreground font-medium">ورود کامل نشد</p>
            <p className="text-sm text-muted-foreground">
              {ERROR_MESSAGES[error as AuthBlockCode] ??
                'ورود ناموفق بود. به پنجرهٔ قبلی برگردید و دوباره تلاش کنید.'}
            </p>
            <p className="text-sm text-muted-foreground">این پنجره به‌صورت خودکار بسته می‌شود.</p>
          </>
        )}
      </div>
    </div>
  )
}
