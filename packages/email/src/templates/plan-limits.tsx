import { Button, Heading, Link, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { button, typography, utils } from './shared-styles'

/** Which of the three plan limits emails this is. */
export type PlanLimitsEmailKind = 'start' | 'reminder' | 'enforced'

/** One cap the workspace is over: what it uses and what happens to the excess. */
export interface PlanLimitsEmailRow {
  label: string
  used: number
  cap: number
  /** What happens to the excess, e.g. "4 become read-only". */
  effect: string
}

export interface PlanLimitsEmailProps {
  kind: PlanLimitsEmailKind
  workspaceName?: string
  /** The plan the workspace is on now; absent when unknown. */
  planName?: string | null
  /** The plan it had before, named on the upgrade link when known. */
  fromPlanName?: string | null
  /** The last full day to fix as it reads in a sentence, e.g. "Nov 23". */
  deadline: string
  /** The deadline as it reads in a heading, e.g. "Mon, Nov 23". */
  deadlineHeading: string
  rows: readonly PlanLimitsEmailRow[]
  /** Names of the paid features that pause. */
  pausingFeatures: readonly string[]
  limitsUrl: string | null
  planUrl: string | null
  logoUrl?: string
}

const countFormat = new Intl.NumberFormat('fa-IR')

function issues(count: number): string {
  return `${countFormat.format(Math.max(count, 1))} مورد`
}

/** The subject of a plan limits email. */
export function planLimitsSubject(
  kind: PlanLimitsEmailKind,
  workspaceName: string | undefined,
  planName: string | null | undefined,
  /** Set when only features pause and no cap is over: the date, as in a sentence. */
  featuresOnlyDeadline?: string
): string {
  const name = workspaceName ?? 'فضای کاری شما'
  if (featuresOnlyDeadline && kind !== 'enforced') {
    return `برخی امکانات ${name} پس از ${featuresOnlyDeadline} متوقف می‌شوند`
  }
  if (kind === 'start') {
    const plan = planName ? `طرح ${planName}` : 'طرح فعلی'
    return `${name} از سقف‌های ${plan} عبور کرده و نیاز به اقدام دارد`
  }
  if (kind === 'reminder') return `۲ روز تا رفع موارد مربوط به محدودیت طرح ${name} باقی است`
  return `بخشی از امکانات ${name} متوقف شده است`
}

function heading(props: PlanLimitsEmailProps): string {
  if (props.kind === 'enforced') return planLimitsSubject(props.kind, props.workspaceName, null)
  if (props.rows.length === 0) return `برخی امکانات پس از ${props.deadlineHeading} متوقف می‌شوند`
  return `تا ${props.deadlineHeading} ${issues(props.rows.length)} را برطرف کنید`
}

function intro(props: PlanLimitsEmailProps): string {
  const name = props.workspaceName ?? 'فضای کاری شما'
  const plan = props.planName ? `طرح ${props.planName}` : 'طرح فعلی'
  if (props.kind === 'enforced') {
    return `${name} همچنان بیش از سقف‌های ${plan} استفاده می‌کند و موارد زیر فعلاً متوقف شده‌اند.`
  }
  const overLimit = `${name} از سقف‌های ${plan} عبور کرده است.`
  if (props.rows.length === 0) {
    return `${overLimit} برای حفظ همهٔ امکانات، طرح را ارتقا دهید.`
  }
  return `${overLimit} تا ${props.deadline} ${issues(props.rows.length)} را برطرف کنید یا برای حفظ همهٔ امکانات، طرح را ارتقا دهید.`
}

const FEATURE_LABELS_FA: ReadonlyMap<string, string> = new Map([
  ['Custom domain', 'دامنهٔ اختصاصی شما'],
  ['Single sign-on', 'ورود یکپارچه'],
  ['Webhooks', 'وب‌هوک‌ها'],
  ['Workflows', 'گردش‌های کار'],
  ['Integrations', 'اتصال‌ها'],
  ['Custom CSS', 'CSS سفارشی شما'],
  ['AI assistant', 'دستیار هوش مصنوعی'],
  ['AI article translation', 'ترجمهٔ مقاله با هوش مصنوعی'],
])

/** Localize the feature labels supplied by the shared admin catalogue. */
export function featureList(names: readonly string[]): string {
  const labels = names.map((name) => FEATURE_LABELS_FA.get(name) ?? name)
  return labels.length < 2
    ? (labels[0] ?? '')
    : `${labels.slice(0, -1).join('، ')} و ${labels.at(-1)}`
}

function featureLine(props: PlanLimitsEmailProps): string {
  const list = featureList(props.pausingFeatures)
  const ended = props.pausingFeatures.length === 1 ? 'شده است' : 'شده‌اند'
  if (props.kind === 'enforced') {
    return props.planName
      ? `${list} در طرح ${props.planName} متوقف ${ended}.`
      : `${list} فعلاً متوقف ${ended}.`
  }
  return `${list} پس از ${props.deadline} متوقف ${props.pausingFeatures.length === 1 ? 'می‌شود' : 'می‌شوند'}.`
}

/**
 * Sent to the people who manage billing when a workspace is over its plan's
 * limits: when it is first seen over, two days before the deadline, and once
 * the deadline has passed and the items are paused.
 */
export function PlanLimitsEmail(props: PlanLimitsEmailProps) {
  const { kind, rows, pausingFeatures, limitsUrl, planUrl, workspaceName, logoUrl } = props
  const title = heading(props)
  return (
    <EmailLayout preview={title} logoUrl={logoUrl}>
      <Heading style={typography.h1}>{title}</Heading>
      <Text style={typography.text}>{intro(props)}</Text>
      <Section>
        {rows.map((row) => (
          <Text key={row.label} style={typography.text}>
            <strong>{row.label}</strong>: {countFormat.format(row.used)} از{' '}
            {countFormat.format(row.cap)}. {row.effect}.
          </Text>
        ))}
        {pausingFeatures.length > 0 ? (
          <Text style={typography.text}>{featureLine(props)}</Text>
        ) : null}
      </Section>
      <Text style={typography.text}>
        {kind === 'enforced'
          ? 'چیزی حذف نمی‌شود. با ارتقای طرح، موارد متوقف‌شده دوباره فعال می‌شوند.'
          : 'چیزی حذف نمی‌شود.'}
      </Text>
      {limitsUrl ? (
        <Section style={{ margin: '24px 0' }}>
          <Button style={button.primary} href={limitsUrl}>
            بررسی موارد
          </Button>
        </Section>
      ) : null}
      {planUrl ? (
        <Text style={typography.text}>
          <Link href={planUrl} style={utils.link}>
            {props.fromPlanName ? `ارتقا به ${props.fromPlanName}` : 'مقایسهٔ طرح‌ها'}
          </Link>
        </Text>
      ) : null}
      <TransactionalFooter>
        این ایمیل را دریافت کرده‌اید چون امور مالی
        {workspaceName ? ` ${workspaceName}` : ' فضای کاری'} را مدیریت می‌کنید.
      </TransactionalFooter>
    </EmailLayout>
  )
}
