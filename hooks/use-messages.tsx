import { useState, useEffect } from 'react';
import { useScrollToBottom } from './use-scroll-to-bottom';
import type { UseChatHelpers } from '@ai-sdk/react';

export function useMessages({
  chatId,
  status,
  messages,
}: {
  chatId: string;
  status: UseChatHelpers['status'];
  messages: Array<{ role: string }>;
}) {
  const {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
  } = useScrollToBottom();

  const [hasSentMessage, setHasSentMessage] = useState(false);
  const [lastAssistantMsgCount, setLastAssistantMsgCount] = useState(0);

  useEffect(() => {
    if (chatId) {
      scrollToBottom('instant');
      setHasSentMessage(false);
      setLastAssistantMsgCount(0);
    }
  }, [chatId, scrollToBottom]);

  useEffect(() => {
    if (status === 'submitted') {
      setHasSentMessage(true);
    }
  }, [status]);

  // Scroll to bottom when a new assistant message is added, but only if user is at bottom
  useEffect(() => {
    const assistantMsgs = messages.filter((m) => m.role === 'assistant');
    if (assistantMsgs.length > lastAssistantMsgCount) {
      if (isAtBottom) {
        scrollToBottom('smooth');
      }
      setLastAssistantMsgCount(assistantMsgs.length);
    }
  }, [messages, lastAssistantMsgCount, scrollToBottom, isAtBottom]);

  return {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  };
}
