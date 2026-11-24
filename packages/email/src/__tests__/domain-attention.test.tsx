/**
 * The email a workspace admin gets when a domain added by name loses its
 * ownership record: first a warning with a date, then, if the record stays
 * missing, that the domain and the sign-in domains resting on it stopped
 * being verified.
 */
import { describe, expect, it } from 'vitest'
import { render } from '@react-email/components'
import { DomainAttentionEmail, domainAttentionMessage } from '../templates/domain-attention'

function visibleText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

const record = { name: '_quackback.acme.com', value: 'quackback-domain-verification=abc123' }

describe('DomainAttentionEmail', () => {
  it('warns with the record, its value and the date it has to be back by', async () => {
    const text = visibleText(
      await render(
        DomainAttentionEmail({
          domain: 'acme.com',
          record,
          deadline: '۸ نوامبر ۲۰۲۶',
          settingsUrl: 'https://help.acme.com/admin/settings/domains/acme.com',
        })
      )
    )
    expect(text).toContain('دامنهٔ acme.com نیاز به بررسی دارد')
    expect(text).toContain('رکورد تأیید مالکیت (TXT _quackback.acme.com) وجود ندارد.')
    expect(text).toContain('مقدار: quackback-domain-verification=abc123')
    expect(text).toContain(
      'برای حفظ تأیید دامنهٔ acme.com، رکورد را تا ۸ نوامبر ۲۰۲۶ دوباره اضافه کنید.'
    )
    expect(text).toContain('تنظیمات دامنه را باز کنید')
    expect(text).not.toMatch(/—/)
  })

  it('says the domain is no longer verified, naming the sign-in domains that stopped with it', async () => {
    const text = visibleText(
      await render(
        DomainAttentionEmail({
          domain: 'acme.com',
          record,
          signInDomains: ['acme.com', 'eu.acme.com'],
        })
      )
    )
    expect(text).toContain('دامنهٔ acme.com دیگر تأییدشده نیست')
    expect(text).toContain('رکورد تأیید مالکیت (TXT _quackback.acme.com) همچنان وجود ندارد.')
    expect(text).toContain('ورود از طریق این دامنه‌ها دیگر تأییدشده نیست: acme.com، eu.acme.com.')
  })

  it('leaves sign-in out when nothing rested on the domain', () => {
    expect(
      domainAttentionMessage({ domain: 'acme.com', recordName: record.name, signInDomains: [] })
    ).toBe('The verification record (TXT _quackback.acme.com) is still missing.')
  })
})
