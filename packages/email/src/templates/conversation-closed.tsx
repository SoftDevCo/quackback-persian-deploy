import { Body, Head, Html, Preview, Text } from '@react-email/components'

export interface ConversationClosedEmailProps {
  workspaceName: string
  variant: 'closed' | 'auto_closed'
  viewUrl?: string
  csatPrompt?: string
  ratingUrls?: readonly [string, string, string, string, string]
}

const CSAT_FACES = ['😞', '🙁', '😐', '🙂', '😄'] as const

const page: React.CSSProperties = {
  backgroundColor: '#ffffff',
  color: '#1d2939',
  fontFamily: 'Vazirmatn, Vazir, Tahoma, Arial, sans-serif',
  fontSize: '15px',
  lineHeight: '1.65',
  margin: 0,
  padding: '24px 8px 32px',
  direction: 'rtl',
  textAlign: 'right',
}

const muted: React.CSSProperties = {
  color: '#667085',
  fontSize: '13px',
  lineHeight: '1.55',
}

export function ConversationClosedEmail({
  workspaceName,
  variant,
  viewUrl,
  csatPrompt,
  ratingUrls,
}: ConversationClosedEmailProps) {
  const intro =
    variant === 'auto_closed'
      ? 'این گفتگو به دلیل دریافت‌نکردن پاسخ از شما بسته شد.'
      : `${workspaceName} این گفتگو را حل‌شده علامت‌گذاری کرد.`
  const followUp =
    variant === 'auto_closed'
      ? 'هنوز به کمک نیاز دارید؟ کافی است به همین ایمیل پاسخ دهید تا گفتگو دوباره باز شود.'
      : 'اگر مشکل برطرف نشده است، به همین ایمیل پاسخ دهید تا گفتگو دوباره باز شود.'

  return (
    <Html lang="fa" dir="rtl">
      <Head />
      <Preview>{intro}</Preview>
      <Body style={page}>
        <Text
          style={{ margin: '0 0 13px', color: '#1d2939', fontSize: '15px', lineHeight: '1.65' }}
        >
          {intro}
        </Text>
        {ratingUrls ? (
          <>
            <Text style={{ margin: '20px 0 8px', color: '#1d2939', fontSize: '15px' }}>
              {csatPrompt || 'عملکرد ما چطور بود؟'}
            </Text>
            <Text style={{ margin: '0 0 16px', fontSize: '28px', letterSpacing: '8px' }}>
              {CSAT_FACES.map((face, i) => (
                <a key={face} href={ratingUrls[i]} style={{ textDecoration: 'none' }}>
                  {face}
                </a>
              ))}
            </Text>
          </>
        ) : null}
        <Text style={muted}>{followUp}</Text>
        {viewUrl ? (
          <Text style={muted}>
            <a href={viewUrl} style={{ color: '#667085' }}>
              مشاهده‌ی آنلاین
            </a>
          </Text>
        ) : null}
      </Body>
    </Html>
  )
}
