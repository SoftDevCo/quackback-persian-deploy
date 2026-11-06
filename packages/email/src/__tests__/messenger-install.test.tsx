import { describe, expect, it } from 'vitest'
import { render } from '@react-email/components'
import { MessengerInstallEmail } from '../templates/messenger-install'

describe('MessengerInstallEmail', () => {
  it('renders Persian instructions and preserves the left-to-right install snippet', async () => {
    const html = await render(
      MessengerInstallEmail({
        senderName: 'Ali',
        workspaceName: 'Tahesab',
        snippet: '<script src="https://example.com/widget.js"></script>',
      })
    )
    expect(html).toContain('افزودن پیام‌رسان')
    expect(html).toContain('Ali')
    expect(html).toContain('Tahesab')
    expect(html).toContain('https://example.com/widget.js')
    expect(html).toContain('direction:ltr')
  })
})
