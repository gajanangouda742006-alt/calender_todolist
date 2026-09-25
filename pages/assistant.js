export function renderAssistantPage(state = {}) {
  const messages = Array.isArray(state.assistantMessages) && state.assistantMessages.length ? state.assistantMessages : [
    { role: 'assistant', text: "I'm Sahra, your AI assistant. I can help you manage tasks, events, and your progress." },
  ];
  const disabled = state.assistantLoading ? 'disabled' : '';

  return `
    <section class="screen assistant-screen">
      <header class="assistant-header glass-card">
        <div class="assistant-header-row">
          <button class="back-button" type="button" data-action="back-home">← Back</button>
          <div class="assistant-brand">
            <div class="assistant-mark"><img class="sahra-logo" src="/images/sahra.png" alt="Sahra logo" width="48" height="48" /></div>
            <div class="assistant-title">
              <h1>Sahra</h1>
              <span>AI ASSISTANT:</span>
            </div>
          </div>
          <button class="assistant-clear-btn" type="button" data-action="clear-assistant-chat" aria-label="Clear chat">🗑 Clear</button>
        </div>
      </header>

      <div class="assistant-chat">
        ${messages.map((message) => {
          const isUser = message.role === 'user';
          return `
            <div class="chat-row ${isUser ? 'user-row' : 'assistant-row'}">
              ${!isUser ? '<div class="chat-avatar bot-avatar">🤖</div>' : ''}
              <div class="message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}">${message.text}</div>
              ${isUser ? '<div class="chat-avatar user-avatar">👩</div>' : ''}
            </div>
          `;
        }).join('')}

        ${state.assistantLoading ? '<div class="message-time">Sahra is thinking...</div>' : ''}
      </div>

      <div class="assistant-composer">
        <!-- Replace your old mic emoji/icon with this -->
    <button type="button" data-action="toggle-mic" style="background: transparent; border: none; padding: 0; cursor: pointer; display: flex; align-items: center; justify-content: center;">
    <img src="mic.png" alt="Mic" class="mic-icon" id="chat-mic-img" style="width: 45px; height: 45px; object-fit: contain;">
    </button>
        <input class="assistant-input" type="text" placeholder="Type a message or speak..." aria-label="Type a message" ${disabled} />
        <button class="composer-send" type="button" aria-label="Send message" ${disabled}>➤</button>
      </div>
    </section>
  `;
}
