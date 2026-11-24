import { describe, expect, it } from 'vitest'
import {
  agentReplyDisplayName,
  assembleOutboundThreading,
  conversationMessageCopy,
  conversationReplySubject,
  isHumanReplyTemplate,
} from '../conversation-copy'

describe('conversationReplySubject', () => {
  it('prefixes the Persian reply label and never doubles it', () => {
    expect(conversationReplySubject('Billing overcharge')).toBe('پاسخ: Billing overcharge')
    expect(conversationReplySubject('Re: Billing overcharge')).toBe('پاسخ: Billing overcharge')
    expect(conversationReplySubject('RE: re: Billing overcharge')).toBe('پاسخ: Billing overcharge')
    expect(conversationReplySubject('  re:   Invoice  ')).toBe('پاسخ: Invoice')
  })

  it('returns null when there is no usable subject', () => {
    expect(conversationReplySubject(null)).toBeNull()
    expect(conversationReplySubject(undefined)).toBeNull()
    expect(conversationReplySubject('')).toBeNull()
    expect(conversationReplySubject('Re:')).toBeNull()
    expect(conversationReplySubject('   ')).toBeNull()
  })
})

describe('isHumanReplyTemplate', () => {
  it('is true only for email-channel agent correspondence', () => {
    expect(isHumanReplyTemplate('email', 'agent_reply')).toBe(true)
    expect(isHumanReplyTemplate('email', 'agent_started')).toBe(true)
    expect(isHumanReplyTemplate('email', 'visitor_message')).toBe(false)
    expect(isHumanReplyTemplate('messenger', 'agent_reply')).toBe(false)
    expect(isHumanReplyTemplate(undefined, 'agent_reply')).toBe(false)
  })
})

describe('conversationMessageCopy', () => {
  it('uses Re: {subject} for visitor-facing replies when a subject is stored', () => {
    const copy = conversationMessageCopy({
      direction: 'agent_reply',
      senderName: 'Alex',
      workspaceName: 'Acme',
      conversationSubject: 'Re: Billing overcharge',
      channel: 'email',
    })
    expect(copy.subject).toBe('پاسخ: Billing overcharge')
    expect(copy.useHumanTemplate).toBe(true)
  })

  it('speaks as the team when the sender is the support team, not a person', () => {
    const reply = conversationMessageCopy({
      direction: 'agent_reply',
      senderName: 'Acme',
      senderIsTeam: true,
      workspaceName: 'Acme',
      channel: 'messenger',
    })
    expect(reply.intro).toBe('Acme به گفتگوی شما پاسخ داده است.')
    const started = conversationMessageCopy({
      direction: 'agent_started',
      senderName: 'Acme Support',
      senderIsTeam: true,
      workspaceName: 'Acme',
      channel: 'messenger',
    })
    expect(started.intro).toBe('Acme Support برای شما پیامی فرستاده است.')
    // A person still reads as one from the workspace.
    const person = conversationMessageCopy({
      direction: 'agent_started',
      senderName: 'Alex',
      workspaceName: 'Acme',
      channel: 'messenger',
    })
    expect(person.intro).toBe('Alex از Acme برای شما پیامی فرستاده است.')
  })

  it('keeps the generic heading on messenger when there is no subject', () => {
    const copy = conversationMessageCopy({
      direction: 'agent_reply',
      senderName: 'Alex',
      workspaceName: 'Acme',
      channel: 'messenger',
    })
    expect(copy.subject).toBe('پاسخ جدید از Acme')
    expect(copy.heading).toBe('پاسخ جدید از Acme')
    expect(copy.useHumanTemplate).toBe(false)
  })

  it('forwards the subject onto the messenger card heading', () => {
    const copy = conversationMessageCopy({
      direction: 'agent_reply',
      senderName: 'Alex',
      workspaceName: 'Acme',
      conversationSubject: 'Widget offline',
      channel: 'messenger',
    })
    expect(copy.heading).toBe('پاسخ: Widget offline')
    expect(copy.useHumanTemplate).toBe(false)
  })

  it('distinguishes first team-alert copy from a follow-up', () => {
    const first = conversationMessageCopy({
      direction: 'visitor_message',
      senderName: 'Priya',
      workspaceName: 'Acme',
      isFirstMessage: true,
    })
    const follow = conversationMessageCopy({
      direction: 'visitor_message',
      senderName: 'Priya',
      workspaceName: 'Acme',
      isFirstMessage: false,
    })
    expect(first.intro).toBe('Priya در Acme یک گفتگو را آغاز کرد.')
    expect(follow.intro).toBe('Priya در Acme پیام جدیدی فرستاد.')
    expect(follow.useHumanTemplate).toBe(false)
    expect(first.subject).toBe('Priya: پیام جدید')
  })

  it('forwards the visitor name and subject on team alerts', () => {
    const copy = conversationMessageCopy({
      direction: 'visitor_message',
      senderName: 'Priya',
      workspaceName: 'Acme',
      conversationSubject: 'Re: Billing overcharge',
      preview: 'The invoice looks wrong',
    })
    expect(copy.subject).toBe('Priya: Billing overcharge')
  })

  it('falls back to the preview when the conversation has no subject', () => {
    const copy = conversationMessageCopy({
      direction: 'visitor_message',
      senderName: 'Priya',
      workspaceName: 'Acme',
      preview: 'The invoice looks wrong',
    })
    expect(copy.subject).toBe('Priya: The invoice looks wrong')
  })
})

describe('assembleOutboundThreading', () => {
  it('sets In-Reply-To to the latest inbound id when one exists', () => {
    const headers = assembleOutboundThreading({
      messageId: 'ours-new@x',
      outboundIds: ['ours-1@x', 'ours-2@x'],
      inboundIds: ['cust-1@x', 'cust-2@x'],
    })
    expect(headers.inReplyTo).toBe('cust-2@x')
    expect(headers.references).toEqual(['cust-1@x', 'cust-2@x', 'ours-1@x', 'ours-2@x'])
  })

  it('falls back to the latest outbound id when there is no inbound Message-ID', () => {
    const headers = assembleOutboundThreading({
      messageId: 'ours-new@x',
      outboundIds: ['ours-1@x', 'ours-2@x'],
      inboundIds: [],
    })
    expect(headers.inReplyTo).toBe('ours-2@x')
    expect(headers.references).toEqual(['ours-1@x', 'ours-2@x'])
  })

  it('omits parent headers when nothing precedes this mail', () => {
    const headers = assembleOutboundThreading({
      messageId: 'ours-new@x',
      outboundIds: [],
      inboundIds: [],
    })
    expect(headers.inReplyTo).toBeUndefined()
    expect(headers.references).toBeUndefined()
  })

  it('returns empty when no Message-ID can be minted', () => {
    expect(
      assembleOutboundThreading({
        outboundIds: ['ours-1@x'],
        inboundIds: ['cust-1@x'],
      })
    ).toEqual({})
  })
})

describe('agentReplyDisplayName', () => {
  it('reads as a person from the workspace', () => {
    expect(agentReplyDisplayName('Alex', 'Acme')).toBe('Alex from Acme')
  })
})
