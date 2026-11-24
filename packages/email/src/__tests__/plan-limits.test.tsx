/**
 * The plan limits email: its three variants and their mail classes.
 */
import { describe, expect, it } from 'vitest'
import { render } from '@react-email/components'
import { PlanLimitsEmail, featureList, planLimitsSubject } from '../templates/plan-limits'
import {
  EMAIL_BILLABLE,
  EMAIL_TENANTED,
  METERED_EMAIL_TYPES,
  isEmailBillable,
  isTenantedEmailType,
} from '../mail-class'

function visibleText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/ ([.,:])/g, '$1')
    .trim()
}

const base = {
  workspaceName: 'Acme Support',
  planName: 'Free',
  fromPlanName: 'Pro',
  deadline: '۲۴ نوامبر',
  deadlineHeading: 'سه‌شنبه ۲۴ نوامبر',
  rows: [
    { label: 'بردها', used: 5, cap: 1, effect: '۴ برد فقط‌خواندنی می‌شود' },
    {
      label: 'ظرفیت اعضای تیم',
      used: 3,
      cap: 1,
      effect: 'دسترسی مدیریتی ۲ هم‌تیمی تا آزاد شدن ظرفیت قطع می‌شود',
    },
  ],
  pausingFeatures: ['Webhooks', 'Custom domain'],
  limitsUrl: 'https://app.example.com/admin/settings/billing/limits',
  planUrl: 'https://app.example.com/admin/settings/billing',
}

const BANNED = /\b(grace|enforce|enforced|enforcement|frozen|extras|held)\b/i

describe('PlanLimitsEmail', () => {
  it('start: names the issues and the date, what pauses, and that nothing is deleted', async () => {
    const html = await render(PlanLimitsEmail({ ...base, kind: 'start' }))
    const text = visibleText(html)
    expect(text).toContain('تا سه‌شنبه ۲۴ نوامبر ۲ مورد را برطرف کنید')
    expect(text).toContain(
      'تا ۲۴ نوامبر ۲ مورد را برطرف کنید یا برای حفظ همهٔ امکانات، طرح را ارتقا دهید.'
    )
    expect(text).toContain('بردها: ۵ از ۱. ۴ برد فقط‌خواندنی می‌شود.')
    expect(text).toContain(
      'ظرفیت اعضای تیم: ۳ از ۱. دسترسی مدیریتی ۲ هم‌تیمی تا آزاد شدن ظرفیت قطع می‌شود.'
    )
    expect(text).toContain('وب‌هوک‌ها و دامنهٔ اختصاصی شما پس از ۲۴ نوامبر متوقف می‌شوند.')
    expect(text.match(/چیزی حذف نمی‌شود\./g)).toHaveLength(1)
    expect(text).toContain('بررسی موارد')
    expect(text).toContain('ارتقا به Pro')
    expect(text).toContain(
      'این ایمیل را دریافت کرده‌اید چون امور مالی Acme Support را مدیریت می‌کنید.'
    )
    expect(text).not.toMatch(BANNED)
    expect(html).toContain('href="https://app.example.com/admin/settings/billing/limits"')
    expect(html).toContain('href="https://app.example.com/admin/settings/billing"')
  })

  it('reminder: same content', async () => {
    const text = visibleText(await render(PlanLimitsEmail({ ...base, kind: 'reminder' })))
    expect(text).toContain('تا ۲۴ نوامبر ۲ مورد را برطرف کنید')
    expect(text).toContain('بردها: ۵ از ۱.')
    expect(text).not.toMatch(BANNED)
  })

  it('after the deadline: says what is paused and that it comes back on upgrade', async () => {
    const text = visibleText(await render(PlanLimitsEmail({ ...base, kind: 'enforced' })))
    expect(text).toContain('بخشی از امکانات Acme Support متوقف شده است')
    expect(text).toContain('وب‌هوک‌ها و دامنهٔ اختصاصی شما در طرح Free متوقف شده‌اند.')
    expect(text).toContain('چیزی حذف نمی‌شود. با ارتقای طرح، موارد متوقف‌شده دوباره فعال می‌شوند.')
    expect(text).toContain('بررسی موارد')
    expect(text).not.toMatch(BANNED)
  })

  it('says features pause, not "Fix 0 issues", when no cap is over', async () => {
    const props = { ...base, rows: [], kind: 'start' as const }
    const text = visibleText(await render(PlanLimitsEmail(props)))
    expect(text).toContain('برخی امکانات پس از سه‌شنبه ۲۴ نوامبر متوقف می‌شوند')
    expect(text).toContain('برای حفظ همهٔ امکانات، طرح را ارتقا دهید.')
    expect(text).not.toMatch(/[۰-۹]+ مورد را برطرف کنید/)
    expect(planLimitsSubject('start', 'Acme Support', 'Free', '۲۴ نوامبر')).toBe(
      'برخی امکانات Acme Support پس از ۲۴ نوامبر متوقف می‌شوند'
    )
  })

  it('falls back to Compare plans when the earlier plan is unknown', async () => {
    const text = visibleText(
      await render(PlanLimitsEmail({ ...base, kind: 'start', fromPlanName: null }))
    )
    expect(text).toContain('مقایسهٔ طرح‌ها')
  })

  it('lists one, two and three features as a sentence', () => {
    expect(featureList(['Webhooks'])).toBe('وب‌هوک‌ها')
    expect(featureList(['Webhooks', 'Custom domain'])).toBe('وب‌هوک‌ها و دامنهٔ اختصاصی شما')
    expect(featureList(['Webhooks', 'Workflows', 'Integrations'])).toBe(
      'وب‌هوک‌ها، گردش‌های کار و اتصال‌ها'
    )
    expect(featureList(['Workflows', 'AI assistant', 'Custom CSS'])).toBe(
      'گردش‌های کار، دستیار هوش مصنوعی و CSS سفارشی شما'
    )
    expect(featureList(['Custom domain'])).toBe('دامنهٔ اختصاصی شما')
    expect(featureList(['Webhooks', 'Acme Integration'])).toBe('وب‌هوک‌ها و Acme Integration')
  })

  it('words the three subjects', () => {
    expect(planLimitsSubject('start', 'Acme Support', 'Free')).toBe(
      'Acme Support از سقف‌های طرح Free عبور کرده و نیاز به اقدام دارد'
    )
    expect(planLimitsSubject('reminder', 'Acme Support', 'Free')).toBe(
      '۲ روز تا رفع موارد مربوط به محدودیت طرح Acme Support باقی است'
    )
    expect(planLimitsSubject('enforced', 'Acme Support', 'Free')).toBe(
      'بخشی از امکانات Acme Support متوقف شده است'
    )
  })

  it('names the workspace in every subject', () => {
    const subjects = (['start', 'reminder', 'enforced'] as const).flatMap((kind) => [
      planLimitsSubject(kind, 'Acme Support', 'Free'),
      planLimitsSubject(kind, 'Acme Support', 'Free', '۲۴ نوامبر'),
    ])
    for (const subject of subjects) expect(subject).toContain('Acme Support')
  })
})

describe('PlanLimitsEmail mail class', () => {
  it('is not metered, so it never counts against the monthly email cap', () => {
    expect(EMAIL_BILLABLE.PlanLimitsEmail).toBe(false)
    expect(isEmailBillable('PlanLimitsEmail')).toBe(false)
    expect((METERED_EMAIL_TYPES as readonly string[]).includes('PlanLimitsEmail')).toBe(false)
  })

  it('sends under the workspace provider tenant, like the other attention mail', () => {
    expect(EMAIL_TENANTED.PlanLimitsEmail).toBe(true)
    expect(isTenantedEmailType('PlanLimitsEmail')).toBe(true)
  })
})
