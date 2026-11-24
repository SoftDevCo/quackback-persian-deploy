import { describe, it, expect } from 'vitest'
import { render } from '@react-email/components'
import {
  ModerationDecisionEmail,
  moderationDecisionHeadline,
} from '../templates/moderation-decision'

const base = {
  postTitle: 'Dark mode please',
  workspaceName: 'Acme',
  unsubscribeUrl: 'https://acme.test/unsubscribe?token=t',
}

describe('ModerationDecisionEmail', () => {
  it('tells the author their post is public and links to it', async () => {
    const html = await render(
      <ModerationDecisionEmail
        {...base}
        item="post"
        decision="approved"
        postUrl="https://acme.test/b/ideas/posts/post_1"
      />
    )
    expect(html).toContain('پیشنهاد شما اکنون عمومی است')
    expect(html).toContain('تیم Acme، پیشنهاد شما را بررسی و منتشر کرد.')
    expect(html).toContain('Dark mode please')
    expect(html).toContain('https://acme.test/b/ideas/posts/post_1')
    expect(html).toContain('مشاهدهٔ پیشنهاد')
  })

  it('tells the author their post was not published, with no link', async () => {
    const html = await render(<ModerationDecisionEmail {...base} item="post" decision="rejected" />)
    expect(html).toContain('پیشنهاد شما منتشر نشد')
    expect(html).toContain('آن را منتشر نکرد')
    expect(html).not.toContain('مشاهدهٔ پیشنهاد')
  })

  it('words a comment as a comment on the post', async () => {
    const html = await render(
      <ModerationDecisionEmail
        {...base}
        item="comment"
        decision="approved"
        postUrl="https://acme.test/b/ideas/posts/post_1#comment-c1"
      />
    )
    expect(html).toContain('نظر شما اکنون عمومی است')
    expect(html).toContain('نظر شما دربارهٔ این مطلب را بررسی')
    expect(html).toContain('مشاهدهٔ نظر')
  })

  it('never says idea and uses no em dash', () => {
    for (const item of ['post', 'comment'] as const) {
      for (const decision of ['approved', 'rejected'] as const) {
        const headline = moderationDecisionHeadline(item, decision)
        expect(headline).not.toMatch(/idea/i)
        expect(headline).not.toContain('—')
      }
    }
  })
})
