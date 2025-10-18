'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, fetchWithErrorHandlers, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';
import { toast } from './toast';
import type { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { ChatSDKError } from '@/lib/errors';
import { BetaBanner } from '@/components/beta-banner';
import type { UIMessage, Attachment } from 'ai';
import { useSidebar } from './ui/sidebar';

interface ChatProps {
  id: string;
  initialMessages: Array<UIMessage>;
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
  showBetaBanner?: boolean;
}

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
  showBetaBanner = false,
}: ChatProps): React.JSX.Element {
  const { mutate } = useSWRConfig();
  const { setOpen } = useSidebar();

  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
    experimental_resume,
    data,
  } = useChat({
    id,
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    fetch: fetchWithErrorHandlers,
    experimental_prepareRequestBody: (body: any) => ({
      id,
      message: body.messages.at(-1),
      selectedChatModel: initialChatModel,
      selectedVisibilityType: visibilityType,
    }),
    onFinish: () => {
      setOpen(false);
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error: unknown) => {
      let errorMsg = 'An unknown error occurred.';
      if (error instanceof ChatSDKError) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        try {
          const parsed = JSON.parse(error);
          if (parsed && parsed.error) errorMsg = parsed.error;
        } catch {
          errorMsg = error;
        }
      }
      toast({
        type: 'error',
        description: errorMsg,
      });
    },
  });

  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      append({
        role: 'user',
        content: query,
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `/chat/${id}`);
    }
  }, [query, append, hasAppendedQuery, id]);

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    experimental_resume,
    data,
    setMessages,
  });

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <div
          style={{
            background: '#232526',
            color: '#fff',
            fontSize: 12,
            padding: '8px 0',
            textAlign: 'center',
            borderBottom: '1px solid #333',
            borderRadius: 0,
          }}
        >
          For support or inquiries, contact us at{' '}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=solaceaiassistance@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#f9d423',
              textDecoration: 'underline',
              fontWeight: 600,
            }}
          >
            support@solaceai.xyz
          </a>
        </div>
        {showBetaBanner && <BetaBanner />}
        <ChatHeader
          chatId={id}
          selectedModelId={initialChatModel}
          selectedVisibilityType={initialVisibilityType}
          isReadonly={isReadonly}
          session={session}
        />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
              selectedVisibilityType={visibilityType}
            />
          )}
        </form>
        <div
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: '#888',
            marginTop: -8,
            marginBottom: 8,
            opacity: 0.7,
          }}
        >
          Solace AI may make mistakes. Verify answers.
        </div>
        <div
          style={{
            textAlign: 'center',
            fontSize: 10,
            color: '#888',
            marginBottom: 8,
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowPrivacy(true);
            }}
            style={{
              marginRight: 16,
              textDecoration: 'underline',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'inherit',
              fontSize: 'inherit',
            }}
            type="button"
          >
            Privacy Policy
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowTerms(true);
            }}
            style={{
              textDecoration: 'underline',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'inherit',
              fontSize: 'inherit',
            }}
            type="button"
          >
            Terms of Service
          </button>
        </div>
        {showPrivacy && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => setShowPrivacy(false)}
          >
            <div
              style={{
                background: '#fff',
                color: '#222',
                borderRadius: 12,
                padding: 32,
                maxWidth: 600,
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                style={{
                  fontSize: 24,
                  marginBottom: 18,
                  fontWeight: 700,
                  textAlign: 'center',
                }}
              >
                Privacy Policy
              </h2>
              <div
                style={{
                  fontSize: 15,
                  textAlign: 'left',
                  lineHeight: 1.7,
                  maxHeight: '60vh',
                  overflowY: 'auto',
                  marginBottom: 24,
                }}
              >
                <strong>Solace AI Privacy Policy</strong>
                <br />
                <br />
                Effective Date: June 2024
                <br />
                <br />
                <strong>1. Introduction</strong>
                <br />
                This Privacy Policy describes how Solace AI (&quot;we&quot;,
                &quot;us&quot;, or &quot;our&quot;) collects, uses, discloses,
                and protects your information when you use our website,
                applications, and services (collectively, the
                &quot;Service&quot;). By using the Service, you consent to the
                practices described in this policy.
                <br />
                <br />
                <strong>2. Information We Collect</strong>
                <br />
                <u>Personal Information:</u> We collect information you provide
                directly, such as your email address, name, and authentication
                data (including Google profile information if you sign up with
                Google).
                <br />
                <u>Usage Data:</u> We collect data about your interactions with
                Solace AI, including chat logs, feedback, device and browser
                information, IP address, and usage statistics.
                <br />
                <u>Cookies & Tracking:</u> We use cookies and similar
                technologies to enhance your experience, analyze usage, and for
                security purposes.
                <br />
                <br />
                <strong>3. How We Use Your Information</strong>
                <br />- To provide, operate, and improve the Service
                <br />- To personalize your experience and deliver relevant
                content
                <br />- To communicate with you about updates, support, and
                security
                <br />- To analyze usage and trends to improve our offerings
                <br />- To comply with legal obligations and enforce our
                policies
                <br />
                <br />
                <strong>4. Data Sharing and Disclosure</strong>
                <br />- We do not sell your personal information.
                <br />- We may share data with trusted third-party service
                providers (e.g., cloud hosting, analytics, security) under
                strict confidentiality agreements.
                <br />- We may disclose information if required by law,
                regulation, legal process, or to protect the rights, property,
                or safety of Solace AI, our users, or others.
                <br />- In the event of a merger, acquisition, or asset sale,
                your information may be transferred as part of that transaction.
                <br />
                <br />
                <strong>5. Data Security</strong>
                <br />- We implement industry-standard security measures to
                protect your data, including encryption, access controls, and
                regular security reviews.
                <br />- Despite our efforts, no method of transmission over the
                Internet or electronic storage is 100% secure. We cannot
                guarantee absolute security.
                <br />
                <br />
                <strong>6. Data Retention</strong>
                <br />- We retain your information as long as necessary to
                provide the Service, comply with legal obligations, resolve
                disputes, and enforce our agreements.
                <br />- You may request deletion of your account and data by
                contacting support@solaceai.xyz.
                <br />
                <br />
                <strong>7. Your Rights and Choices</strong>
                <br />- You may access, correct, or delete your personal
                information by contacting us.
                <br />- You may opt out of marketing communications at any time.
                <br />- You may disable cookies in your browser, but this may
                affect Service functionality.
                <br />
                <br />
                <strong>8. International Data Transfers</strong>
                <br />- Your information may be transferred to and processed in
                countries outside your own. We take steps to ensure adequate
                protection of your data.
                <br />
                <br />
                <strong>9. Children&#39;s Privacy</strong>
                <br />- Solace AI is not intended for children under 13. We do
                not knowingly collect data from children. If we learn we have
                collected such data, we will delete it promptly.
                <br />
                <br />
                <strong>10. Changes to This Policy</strong>
                <br />- We may update this Privacy Policy from time to time. We
                will notify you of significant changes via email or in-app
                notice.
                <br />
                <br />
                <strong>11. Contact Us</strong>
                <br />- For questions or concerns, contact us at
                support@solaceai.xyz.
                <br />
                <br />
                <em>
                  This policy is designed to comply with applicable privacy laws
                  and to protect both users and Solace AI.
                </em>
              </div>
              <button
                style={{
                  margin: '0 auto',
                  display: 'block',
                  background: '#232526',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 28px',
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: 'pointer',
                }}
                onClick={() => setShowPrivacy(false)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        )}
        {showTerms && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => setShowTerms(false)}
          >
            <div
              style={{
                background: '#fff',
                color: '#222',
                borderRadius: 12,
                padding: 32,
                maxWidth: 600,
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                style={{
                  fontSize: 24,
                  marginBottom: 18,
                  fontWeight: 700,
                  textAlign: 'center',
                }}
              >
                Terms of Service
              </h2>
              <div
                style={{
                  fontSize: 15,
                  textAlign: 'left',
                  lineHeight: 1.7,
                  maxHeight: '60vh',
                  overflowY: 'auto',
                  marginBottom: 24,
                }}
              >
                <strong>Solace AI Terms of Service</strong>
                <br />
                <br />
                Effective Date: June 2024
                <br />
                <br />
                <strong>1. Acceptance of Terms</strong>
                <br />
                By accessing or using Solace AI, you agree to be bound by these
                Terms of Service and our Privacy Policy. If you do not agree, do
                not use the Service.
                <br />
                <br />
                <strong>2. Eligibility</strong>
                <br />- You must be at least 13 years old to use Solace AI.
                <br />- You represent that you have the legal capacity to enter
                into these terms.
                <br />
                <br />
                <strong>3. User Accounts</strong>
                <br />- You are responsible for maintaining the confidentiality
                of your account credentials.
                <br />- You are responsible for all activities that occur under
                your account.
                <br />- You agree to provide accurate and complete information.
                <br />- We reserve the right to suspend or terminate accounts
                for violations or suspected abuse.
                <br />
                <br />
                <strong>4. Use of Service</strong>
                <br />- You agree not to misuse the Service, attempt
                unauthorized access, or disrupt its operation.
                <br />- You may not use the Service for unlawful, harmful, or
                infringing purposes.
                <br />- You are solely responsible for your content and
                interactions.
                <br />
                <br />
                <strong>5. Intellectual Property</strong>
                <br />- All content, trademarks, and technology on Solace AI are
                owned by us or our licensors.
                <br />- You may not copy, modify, distribute, or create
                derivative works without permission.
                <br />
                <br />
                <strong>6. User Content</strong>
                <br />- You retain ownership of your content but grant Solace AI
                a worldwide, royalty-free license to use, display, and analyze
                it for service improvement.
                <br />- You must not submit content that is unlawful, harmful,
                or infringes on others&#39; rights.
                <br />
                <br />
                <strong>7. AI Output Disclaimer</strong>
                <br />- Solace AI may generate inaccurate, incomplete, or
                inappropriate content. You are responsible for verifying outputs
                before relying on them.
                <br />- We do not guarantee the accuracy, completeness, or
                appropriateness of AI-generated content.
                <br />- You agree to use AI outputs at your own risk and
                discretion.
                <br />
                <br />
                <strong>8. Limitation of Liability</strong>
                <br />- To the maximum extent permitted by law, Solace AI and
                its affiliates shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages.
                <br />- Our total liability for any claims shall not exceed the
                amount you paid for the Service.
                <br />
                <br />
                <strong>9. Changes to Terms</strong>
                <br />- We may modify these terms at any time. Continued use of
                the Service constitutes acceptance of modified terms.
                <br />- We will notify users of significant changes via email or
                in-app notice.
                <br />
                <br />
                <strong>10. Governing Law</strong>
                <br />- These terms shall be governed by and construed in
                accordance with applicable laws.
                <br />- Any disputes shall be subject to the exclusive
                jurisdiction of the courts in the applicable jurisdiction.
                <br />
                <br />
                <strong>11. Contact</strong>
                <br />- For questions about these terms, contact us at
                support@solaceai.xyz.
                <br />
                <br />
                <em>
                  By using Solace AI, you acknowledge that you have read,
                  understood, and agree to be bound by these terms.
                </em>
              </div>
              <button
                style={{
                  margin: '0 auto',
                  display: 'block',
                  background: '#232526',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 28px',
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: 'pointer',
                }}
                onClick={() => setShowTerms(false)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
      />
    </>
  );
}
