/**
 * The email a workspace admin gets when a sending domain stops verifying.
 * Its job is to name the record that failed, so each case reads the text.
 */
import { describe, expect, it } from 'vitest'
import { render } from '@react-email/components'
import { SendingDomainAttentionEmail } from '../templates/sending-domain-attention'

function visibleText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

describe('SendingDomainAttentionEmail', () => {
  it('says the signing key is not working when no listed record is at fault', async () => {
    const text = visibleText(
      await render(SendingDomainAttentionEmail({ domain: 'acme.com', record: 'signing-key' }))
    )
    expect(text).toContain('کلید امضای دامنهٔ acme.com کار نمی‌کند.')
  })

  it('names the domain and the record that is missing', async () => {
    const text = visibleText(
      await render(
        SendingDomainAttentionEmail({
          domain: 'acme.com',
          record: {
            purpose: 'mail-from',
            type: 'MX',
            name: 'qb-bounce.acme.com',
            state: 'missing',
          },
          settingsUrl: 'https://help.example.com/admin/settings/channels/email',
        })
      )
    )
    expect(text).toContain('ارسال ایمیل از acme.com نیاز به بررسی دارد')
    expect(text).toContain('رکورد مسیر بازگشت (MX qb-bounce.acme.com) وجود ندارد.')
    expect(text).toContain('تا زمان رفع مشکل، پاسخ‌ها از نشانی پیش‌فرض ارسال می‌شوند.')
    expect(text).toContain('تا همهٔ رکوردها را ببینید و تأیید کنید.')
  })

  it('says what was found instead when the value is wrong', async () => {
    const text = visibleText(
      await render(
        SendingDomainAttentionEmail({
          domain: 'acme.com',
          record: {
            purpose: 'ownership',
            type: 'TXT',
            name: '_quackback.acme.com',
            state: 'mismatch',
            seen: 'quackback-domain-verification=old',
          },
        })
      )
    )
    expect(text).toContain(
      'مقدار رکورد مالکیت (TXT _quackback.acme.com) متفاوت است: quackback-domain-verification=old.'
    )
  })

  it('names a proxied DKIM record', async () => {
    const text = visibleText(
      await render(
        SendingDomainAttentionEmail({
          domain: 'acme.com',
          record: {
            purpose: 'dkim',
            type: 'CNAME',
            name: 'tok._domainkey.acme.com',
            state: 'proxied',
          },
        })
      )
    )
    expect(text).toContain(
      'رکورد DKIM (CNAME tok._domainkey.acme.com) از پراکسی عبور می‌کند. پراکسی آن را غیرفعال کنید.'
    )
  })

  it('falls back to the provider when every record still looks right', async () => {
    const text = visibleText(await render(SendingDomainAttentionEmail({ domain: 'acme.com' })))
    expect(text).toContain('ارائه‌دهندهٔ ایمیل دیگر دامنهٔ acme.com را تأیید نمی‌کند.')
  })

  it('links to the settings page when given one', async () => {
    const html = await render(
      SendingDomainAttentionEmail({
        domain: 'acme.com',
        settingsUrl: 'https://help.example.com/admin/settings/channels/email',
      })
    )
    expect(html).toContain('href="https://help.example.com/admin/settings/channels/email"')
  })

  it('uses no em dash in what it says', async () => {
    const html = await render(SendingDomainAttentionEmail({ domain: 'acme.com' }))
    expect(html).not.toContain('—')
  })

  it.each([
    ['truncated', 'مقدار رکورد DKIM (TXT qb1._domainkey.acme.com) توسط میزبان DNS کوتاه شده است.'],
    [
      'quoted',
      'مقدار رکورد DKIM (TXT qb1._domainkey.acme.com) همراه با علامت نقل‌قول ذخیره شده است.',
    ],
  ] as const)('names a value the DNS host mangled (%s)', async (reason, sentence) => {
    const text = visibleText(
      await render(
        SendingDomainAttentionEmail({
          domain: 'acme.com',
          record: {
            purpose: 'dkim',
            type: 'TXT',
            name: 'qb1._domainkey.acme.com',
            state: 'mismatch',
            seen: 'v=DKIM1; k=rsa; p=AAA',
            reason,
          },
        })
      )
    )
    expect(text).toContain(sentence)
  })
})
