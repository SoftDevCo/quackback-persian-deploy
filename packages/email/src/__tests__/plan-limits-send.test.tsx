/**
 * The plan limits email as it leaves: the subject each variant gets on the
 * wire, and copy that never uses the words kept from users, whatever is known
 * about the workspace and its plans.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@react-email/components'
import * as email from '../index'
import {
  PlanLimitsEmail,
  planLimitsSubject,
  type PlanLimitsEmailProps,
} from '../templates/plan-limits'
import { sealedTo } from './brands'

const resendSend = vi.hoisted(() => vi.fn())

vi.mock('resend', async (importOriginal) => {
  const actual = await importOriginal<typeof import('resend')>()
  return {
    ...actual,
    Resend: class {
      emails = { send: resendSend }
    },
  }
})

const ENV_KEYS = [
  'EMAIL_SES_ACCESS_KEY_ID',
  'EMAIL_SES_SECRET_ACCESS_KEY',
  'EMAIL_SMTP_HOST',
  'EMAIL_RESEND_API_KEY',
  'RESEND_API_KEY',
  'EMAIL_INBOUND_PROVIDER',
  'EMAIL_FROM',
] as const

const saved: Record<string, string | undefined> = {}
beforeEach(() => {
  for (const key of ENV_KEYS) {
    saved[key] = process.env[key]
    delete process.env[key]
  }
  process.env.EMAIL_RESEND_API_KEY = 're_test'
  process.env.EMAIL_FROM = 'noreply@platform.test'
  resendSend.mockReset()
  resendSend.mockResolvedValue({ data: { id: 'resend-email-id' }, error: null, headers: null })
})
afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] !== undefined) process.env[key] = saved[key]
    else delete process.env[key]
  }
})

const wire = () =>
  resendSend.mock.calls.at(-1)?.[0] as { subject: string; html: string; to: unknown }

const rows = [{ label: 'بردها', used: 5, cap: 1, effect: '۴ برد فقط‌خواندنی می‌شود' }]

const base: Omit<PlanLimitsEmailProps, 'kind'> = {
  workspaceName: 'Acme Support',
  planName: 'Free',
  fromPlanName: 'Pro',
  deadline: '۲۴ نوامبر',
  deadlineHeading: 'سه‌شنبه ۲۴ نوامبر',
  rows,
  pausingFeatures: ['Webhooks'],
  limitsUrl: 'https://app.example.com/admin/settings/billing/limits',
  planUrl: 'https://app.example.com/admin/settings/billing',
}

function visibleText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

describe('sendPlanLimitsEmail', () => {
  it('puts each variant subject on the wire, naming the workspace and the plan', async () => {
    const to = sealedTo('billing@example.test')
    await email.sendPlanLimitsEmail({ to, kind: 'start', ...base })
    expect(wire().subject).toBe('Acme Support از سقف‌های طرح Free عبور کرده و نیاز به اقدام دارد')
    expect(wire().html).toContain('تا سه‌شنبه ۲۴ نوامبر ۱ مورد را برطرف کنید')

    await email.sendPlanLimitsEmail({ to, kind: 'reminder', ...base })
    expect(wire().subject).toBe('۲ روز تا رفع موارد مربوط به محدودیت طرح Acme Support باقی است')

    await email.sendPlanLimitsEmail({ to, kind: 'enforced', ...base })
    expect(wire().subject).toBe('بخشی از امکانات Acme Support متوقف شده است')
  })

  it('gives the features-only start email its own subject with the date', async () => {
    await email.sendPlanLimitsEmail({
      to: sealedTo('billing@example.test'),
      kind: 'start',
      ...base,
      rows: [],
    })
    expect(wire().subject).toBe('برخی امکانات Acme Support پس از ۲۴ نوامبر متوقف می‌شوند')
  })
})

describe('features-only reminder', () => {
  it('names the features and the date, not issues to fix, when no cap is over', async () => {
    await email.sendPlanLimitsEmail({
      to: sealedTo('billing@example.test'),
      kind: 'reminder',
      ...base,
      rows: [],
    })
    expect(wire().subject).toBe('برخی امکانات Acme Support پس از ۲۴ نوامبر متوقف می‌شوند')
    expect(planLimitsSubject('reminder', 'Acme Support', 'Free')).toBe(
      '۲ روز تا رفع موارد مربوط به محدودیت طرح Acme Support باقی است'
    )
  })
})

/** Words never shown to users (see the plan limits glossary). */
const BANNED =
  /\b(grace|enforced?|enforcement|frozen|held|extras|switch|current plan|choose a plan|keep pro|choose pro)\b/i

describe('plan limits email copy', () => {
  const kinds = ['start', 'reminder', 'enforced'] as const
  const variants: Partial<PlanLimitsEmailProps>[] = [
    {},
    { planName: null },
    { fromPlanName: null },
    { workspaceName: undefined },
    { rows: [] },
    { pausingFeatures: [] },
    { planName: null, fromPlanName: null, workspaceName: undefined, rows: [] },
    { limitsUrl: null, planUrl: null },
  ]

  it('never uses a word kept from users, in any variant or subject', async () => {
    for (const kind of kinds) {
      for (const variant of variants) {
        const props = { ...base, ...variant, kind }
        const text = visibleText(await render(PlanLimitsEmail(props)))
        const subject = planLimitsSubject(
          kind,
          props.workspaceName,
          props.planName,
          props.rows.length === 0 ? props.deadline : undefined
        )
        expect(`${subject} | ${text}`, JSON.stringify({ kind, variant })).not.toMatch(BANNED)
        expect(text).not.toMatch(/—|!/)
        expect(subject).not.toMatch(/—|!/)
        expect(text.match(/چیزی حذف نمی‌شود\./g) ?? []).toHaveLength(1)
      }
    }
  })

  it('reads plainly when the plan is not known', async () => {
    expect(planLimitsSubject('start', 'Acme Support', null)).toBe(
      'Acme Support از سقف‌های طرح فعلی عبور کرده و نیاز به اقدام دارد'
    )
    const text = visibleText(
      await render(PlanLimitsEmail({ ...base, planName: null, kind: 'enforced' }))
    )
    expect(text).toContain('وب‌هوک‌ها فعلاً متوقف شده است.')
  })
})
