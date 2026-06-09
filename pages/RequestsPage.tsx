import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  acceptApplication,
  getMessagesForRequest,
  readApplications,
  readJobs,
  sendMessage,
  type Message,
} from '../lib/marketplaceStore'
import type { Application, Job } from '../types'

function buildWhatsAppLink(phone: string, jobTitle: string, clientName: string) {
  const clean = phone.replace(/\D/g, '')
  const normalized = clean.startsWith('0') ? '263' + clean.slice(1) : clean.startsWith('263') ? clean : '263' + clean
  const text = encodeURIComponent(
    `Hi, I saw your job request on SkillLink — "${jobTitle}". My name is ${clientName}. I'd love to discuss. Is this still available?`,
  )
  return `https://wa.me/${normalized}?text=${text}`
}

function ChatPanel({
  application,
  currentUserEmail,
  currentUserName,
}: {
  application: Application
  currentUserEmail: string
  currentUserName: string
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')

  useEffect(() => {
    setMessages(getMessagesForRequest(application.id))
  }, [application.id])

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed) return
    const isClient = currentUserEmail.toLowerCase() === application.clientEmail.toLowerCase()
    const receiverId = isClient ? application.tradespersonEmail : application.clientEmail
    sendMessage({
      requestId: application.id,
      jobId: application.jobId,
      senderId: currentUserEmail,
      senderName: currentUserName,
      receiverId,
      text: trimmed,
    })
    setMessages(getMessagesForRequest(application.id))
    setText('')
  }

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="muted" style={{ padding: '0.5rem 0' }}>
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((m) => {
          const isMine = m.senderId.toLowerCase() === currentUserEmail.toLowerCase()
          return (
            <div key={m.id} className={`chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
              <span className="bubble-name">{m.senderName}</span>
              <p>{m.text}</p>
              <span className="bubble-time">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )
        })}
      </div>
      <div className="chat-input-row">
        <input
          className="text-input"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
        />
        <button className="primary-button" type="button" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  )
}

export function RequestsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [openChat, setOpenChat] = useState<number | null>(null)

  useEffect(() => {
    setApplications(readApplications())
    setJobs(readJobs())
  }, [])

  const email = user?.email.trim().toLowerCase() ?? ''
  const role = user?.role ?? 'client'

  // Tradesperson sees requests where they applied
  // Client sees requests on their jobs
  const relevant = useMemo(() => {
    if (role === 'tradesperson') {
      return applications.filter((a) => a.tradespersonEmail.trim().toLowerCase() === email)
    }
    return applications.filter((a) => a.clientEmail.trim().toLowerCase() === email)
  }, [applications, email, role])

  function getJob(jobId: number) {
    return jobs.find((j) => j.id === jobId)
  }

  function handleAccept(applicationId: number) {
    const updated = acceptApplication(applicationId)
    setApplications(updated)
    setJobs(readJobs())
  }

  const statusColor: Record<string, string> = {
    Pending: '#f59e0b',
    Accepted: '#22c55e',
    Completed: '#6366f1',
  }

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <span className="eyebrow">
            {role === 'tradesperson' ? 'Your job applications' : 'Responses to your requests'}
          </span>
          <h1>{role === 'tradesperson' ? 'Requests & Messages' : 'Tradesperson Responses'}</h1>
          <p className="muted">
            {role === 'tradesperson'
              ? 'View the jobs you applied for. Once accepted you can message the client directly.'
              : 'Review tradespeople who responded to your posts. Accept to start working together.'}
          </p>
        </div>
      </section>

      {relevant.length === 0 && (
        <section className="panel">
          <p className="muted">
            {role === 'tradesperson'
              ? 'You have not applied to any jobs yet. Go to the Jobs page to find work.'
              : 'No tradespeople have responded to your requests yet.'}
          </p>
        </section>
      )}

      <div className="list-stack">
        {relevant.map((application) => {
          const job = getJob(application.jobId)
          const isOpen = openChat === application.id

          return (
            <section className="panel request-card" key={application.id}>
              <div className="request-header">
                <div>
                  <span className="eyebrow" style={{ color: statusColor[application.status] ?? '#888' }}>
                    {application.status}
                  </span>
                  <h3>{application.jobTitle}</h3>
                  <p className="muted">
                    {role === 'tradesperson'
                      ? `Client: ${application.clientName} · ${application.suburb}`
                      : `Tradesperson: ${application.tradespersonName} · $${application.proposedRate} proposed`}
                  </p>
                  {job && (
                    <p className="muted" style={{ fontSize: '0.8rem' }}>
                      {job.description}
                    </p>
                  )}
                </div>

                <div className="request-actions">
                  {/* Client: accept or message tradesperson */}
                  {role === 'client' && application.status === 'Pending' && (
                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => handleAccept(application.id)}
                    >
                      Accept
                    </button>
                  )}

                  {/* WhatsApp link — always visible once there's a phone */}
                  {role === 'client' && application.tradespersonEmail && (
                    <a
                      className="whatsapp-button"
                      href={buildWhatsAppLink(
                        application.tradespersonEmail, // email used as fallback; real phone in tradesperson profile
                        application.jobTitle,
                        user?.name ?? 'A client',
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💬 WhatsApp
                    </a>
                  )}

                  {role === 'tradesperson' && job?.clientEmail && (
                    <a
                      className="whatsapp-button"
                      href={buildWhatsAppLink(
                        job.clientEmail,
                        application.jobTitle,
                        user?.name ?? 'A tradesperson',
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💬 WhatsApp Client
                    </a>
                  )}

                  {/* In-app chat toggle */}
                  {(application.status === 'Accepted' || role === 'tradesperson') && (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => setOpenChat(isOpen ? null : application.id)}
                    >
                      {isOpen ? 'Close chat' : 'Message'}
                    </button>
                  )}
                </div>
              </div>

              {isOpen && user && (
                <ChatPanel
                  application={application}
                  currentUserEmail={user.email}
                  currentUserName={user.name}
                />
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
