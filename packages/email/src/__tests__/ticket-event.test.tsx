import { describe, it, expect } from 'vitest'
import { render } from '@react-email/components'
import { TicketEventEmail } from '../templates/ticket-event'

const base = {
  heading: 'پاسخ جدید به تیکت شما',
  intro: 'Sarah به #142 با عنوان «Export fails» پاسخ داد:',
  ctaUrl: 'https://acme.example.com/support/ticket/ticket_1',
  ctaLabel: 'مشاهده‌ی تیکت',
  organizationName: 'Acme',
  reason: 'این ایمیل به این دلیل برای شما ارسال شده که تیکت شمارهٔ #142 را در Acme باز کرده‌اید.',
  preferencesUrl: 'https://acme.example.com/settings/preferences',
}

describe('TicketEventEmail', () => {
  it('renders the full message body as paragraphs with the author attribution', async () => {
    const html = await render(
      <TicketEventEmail
        {...base}
        authorName="Sarah"
        messageBody={'First paragraph of the reply.\n\nSecond paragraph after a blank line.'}
      />
    )
    expect(html).toContain('First paragraph of the reply.')
    expect(html).toContain('Second paragraph after a blank line.')
    expect(html).toContain('Sarah')
    expect(html).toContain('مشاهده‌ی تیکت')
    expect(html).toContain('مدیریت تنظیمات اعلان‌ها')
    expect(html).toContain('https://acme.example.com/settings/preferences')
  })

  it('escapes markup in the message body (plain-text rendering)', async () => {
    const html = await render(
      <TicketEventEmail {...base} messageBody={'<img src=x onerror=alert(1)> hello'} />
    )
    expect(html).not.toContain('<img src=x')
    expect(html).toContain('hello')
  })

  it('renders the status transition only when present', async () => {
    const withChange = await render(
      <TicketEventEmail
        {...base}
        heading="تیکت شما حل شد"
        statusChange={{ previousLabel: 'In progress', newLabel: 'Resolved' }}
      />
    )
    expect(withChange).toContain('در حال انجام')
    expect(withChange).toContain('حل‌شده')

    const without = await render(<TicketEventEmail {...base} />)
    expect(without).not.toContain('در حال انجام')
  })

  it('renders the SLA fact line and note blocks when present', async () => {
    const html = await render(
      <TicketEventEmail
        {...base}
        heading="First response SLA approaching breach"
        factLine="First response due 14:30"
        note="Replying reopens the ticket."
      />
    )
    expect(html).toContain('First response due 14:30')
    expect(html).toContain('Replying reopens the ticket.')
  })
})
