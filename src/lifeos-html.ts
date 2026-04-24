// Life OS Dashboard — HTML template functions
// Uses the Jackson SAAS design system: cream/forest/sage light palette

import { RECRUIT_PHASES, type Recruit, type RecruitStep } from './recruit-db.js';

// ─── Shared CSS & Layout ───────────────────────────────────────────────────────

function sharedStyles(): string {
  return `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');

  :root {
    --color-cream: #f5efe9;
    --color-cream-soft: #f1f1f1;
    --color-paper: #ffffff;
    --color-forest: #09321f;
    --color-forest-deep: #052415;
    --color-forest-tint: #253f31;
    --color-sage: #7ea37e;
    --color-sage-muted: #495c52;
    --color-slate: #7e97a3;
    --color-clay: #d07765;
    --color-gold: #d9ae62;
    --color-orange: #ff8000;
    --color-stone-50: rgba(5,36,21,0.08);
    --color-stone-100: rgba(5,36,21,0.16);
    --color-stone-200: rgba(5,36,21,0.32);

    --ease-eden: cubic-bezier(0.22, 1, 0.36, 1);
    --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-med: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  * { box-sizing: border-box; }
  body {
    background: var(--color-cream);
    color: var(--color-forest-deep);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.5;
    margin: 0;
    padding: 0;
  }

  ::selection {
    background: var(--color-forest);
    color: var(--color-cream);
  }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--color-stone-100); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--color-stone-200); }
  * { scrollbar-width: thin; scrollbar-color: var(--color-stone-100) transparent; }

  /* Animation */
  @keyframes lift-in {
    from { opacity: 0; transform: translateY(28px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-lift-in { animation: lift-in 0.7s var(--ease-eden) both; }
  .delay-1 { animation-delay: 100ms; }
  .delay-2 { animation-delay: 200ms; }
  .delay-3 { animation-delay: 350ms; }
  .delay-4 { animation-delay: 500ms; }
  .delay-5 { animation-delay: 650ms; }

  /* Serif display headings */
  .serif { font-family: 'Lora', Georgia, serif; }
  .serif-display {
    font-family: 'Lora', Georgia, serif;
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1.05;
  }

  /* Label style */
  .label {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 11px;
    font-weight: 600;
    color: var(--color-sage-muted);
  }

  /* Cards */
  .card {
    background: var(--color-paper);
    border: 1px solid var(--color-stone-50);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 14px;
    box-shadow: 0 1px 2px rgba(5,36,21,0.04);
    transition: transform var(--transition-med), box-shadow var(--transition-med);
    position: relative;
  }
  .card-hover:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 16px rgba(5,36,21,0.08);
  }

  /* KPI Stats Bar */
  .summary-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
  .summary-stat {
    background: var(--color-paper);
    border: 1px solid var(--color-stone-50);
    border-radius: 16px;
    padding: 20px 24px;
    display: flex; flex-direction: column; gap: 6px;
    box-shadow: 0 1px 2px rgba(5,36,21,0.04);
    transition: transform var(--transition-med), box-shadow var(--transition-med);
  }
  .summary-stat:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(5,36,21,0.06);
  }
  .summary-stat-val {
    font-size: 30px;
    font-weight: 500;
    color: var(--color-forest-deep);
    line-height: 1.2;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    font-family: 'Lora', Georgia, serif;
  }
  .summary-stat-label {
    font-size: 11px;
    color: var(--color-sage-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
  }
  @media (max-width: 640px) { .summary-bar { grid-template-columns: repeat(2, 1fr); } }

  /* Pills */
  .pill { display: inline-block; padding: 3px 12px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: 0.02em; }
  .pill-active { background: rgba(126,163,126,0.15); color: var(--color-sage); }
  .pill-soon { background: var(--color-stone-50); color: var(--color-sage-muted); }

  /* Tables */
  .los-table { width: 100%; border-collapse: collapse; }
  .los-table th {
    text-align: left; padding: 10px 14px; font-size: 11px;
    color: var(--color-sage-muted); font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.08em;
    border-bottom: 1px solid var(--color-stone-50); white-space: nowrap;
  }
  .los-table td {
    padding: 12px 14px; font-size: 13px;
    border-bottom: 1px solid var(--color-stone-50);
    vertical-align: middle; color: var(--color-forest-deep);
  }
  .los-table tr { transition: background var(--transition-fast); }
  .los-table tr:hover { background: rgba(5,36,21,0.02); }

  /* Progress bar */
  .progress-track { width: 100%; height: 8px; background: var(--color-stone-50); border-radius: 4px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }

  /* Nav */
  .los-nav {
    position: sticky; top: 0; z-index: 50;
    background: rgba(245,239,233,0.85);
    backdrop-filter: blur(20px) saturate(1.2);
    -webkit-backdrop-filter: blur(20px) saturate(1.2);
    border-bottom: 1px solid var(--color-stone-50);
  }
  .los-nav-inner {
    max-width: 1400px; margin: 0 auto; padding: 0 24px;
    display: flex; align-items: center; justify-content: space-between; height: 56px;
  }
  .los-nav-logo {
    font-family: 'Lora', Georgia, serif;
    font-size: 20px; font-weight: 500; font-style: italic;
    color: var(--color-forest-deep);
    letter-spacing: -0.02em; text-decoration: none;
  }
  .los-nav-links { display: flex; gap: 4px; align-items: center; }
  .los-nav-link {
    padding: 6px 14px; font-size: 13px; font-weight: 500;
    color: var(--color-sage-muted);
    text-decoration: none; border-radius: 8px;
    transition: all var(--transition-fast);
  }
  .los-nav-link:hover { color: var(--color-forest-deep); background: var(--color-stone-50); }
  .los-nav-link.active {
    color: var(--color-forest-deep);
    background: var(--color-stone-50);
    font-weight: 600;
  }
  .los-nav-name {
    font-size: 14px; font-weight: 500;
    color: var(--color-forest-deep);
    display: flex; align-items: center; gap: 8px;
  }
  .los-nav-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--color-forest);
    color: var(--color-cream);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600;
    font-family: 'Lora', Georgia, serif;
  }
  .los-hamburger {
    display: none; background: none; border: none;
    color: var(--color-forest-deep); cursor: pointer;
    width: 40px; height: 40px; align-items: center; justify-content: center;
    border-radius: 8px;
  }
  .los-hamburger:hover { background: var(--color-stone-50); }
  .los-mobile-menu {
    display: none; position: fixed; top: 56px; left: 0; right: 0; bottom: 0; z-index: 45;
    background: rgba(245,239,233,0.97);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    flex-direction: column; padding: 16px 24px; gap: 4px;
  }
  .los-mobile-menu.open { display: flex; }
  .los-mobile-menu a {
    padding: 12px 16px; font-size: 16px; font-weight: 500;
    color: var(--color-sage-muted);
    text-decoration: none; border-radius: 8px;
    transition: all var(--transition-fast);
  }
  .los-mobile-menu a:hover, .los-mobile-menu a.active {
    color: var(--color-forest-deep);
    background: var(--color-stone-50);
  }
  @media (max-width: 768px) {
    .los-nav-links { display: none; }
    .los-nav-name { display: none; }
    .los-hamburger { display: flex; }
  }

  /* Container */
  .los-container { max-width: 1400px; margin: 0 auto; padding: 32px 24px; }

  /* Section title */
  .section-title {
    font-family: 'Lora', Georgia, serif;
    font-size: 18px; font-weight: 500;
    color: var(--color-forest-deep);
    margin-bottom: 16px; letter-spacing: -0.02em;
  }

  /* Chat bubble (floating) */
  .chat-fab {
    position: fixed; bottom: 24px; right: 24px; z-index: 60;
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--color-forest);
    color: var(--color-cream); border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px;
    box-shadow: 0 4px 16px rgba(9,50,31,0.25), 0 1px 3px rgba(5,36,21,0.15);
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  }
  .chat-fab:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(9,50,31,0.35); }
  .chat-fab:active { transform: scale(0.95); }

  .chat-panel {
    position: fixed; bottom: 92px; right: 24px; z-index: 65;
    width: 380px; height: 500px; max-height: calc(100vh - 120px);
    background: var(--color-paper);
    border: 1px solid var(--color-stone-50);
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(5,36,21,0.12), 0 1px 3px rgba(5,36,21,0.06);
    display: none; flex-direction: column; overflow: hidden;
  }
  .chat-panel.open { display: flex; }
  .chat-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px;
    background: var(--color-forest);
    flex-shrink: 0;
  }
  .chat-panel-header-left { display: flex; align-items: center; gap: 8px; }
  .chat-panel-header-title { font-size: 15px; font-weight: 600; color: var(--color-cream); }
  .chat-panel-close {
    background: none; border: none; color: rgba(245,239,233,0.7);
    cursor: pointer; font-size: 20px; padding: 4px 8px; border-radius: 8px;
    transition: all var(--transition-fast);
  }
  .chat-panel-close:hover { color: var(--color-cream); background: rgba(255,255,255,0.1); }
  .chat-panel-messages {
    flex: 1; overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 8px;
    background: var(--color-cream-soft);
  }
  .chat-panel-input-area {
    display: flex; gap: 8px; padding: 12px 14px;
    background: var(--color-paper);
    border-top: 1px solid var(--color-stone-50); flex-shrink: 0;
  }
  .chat-panel-input {
    flex: 1; background: var(--color-cream-soft);
    border: 1px solid var(--color-stone-50);
    border-radius: 999px; padding: 8px 16px;
    color: var(--color-forest-deep); font-size: 13px;
    font-family: inherit; outline: none; resize: none;
    transition: border-color var(--transition-fast);
  }
  .chat-panel-input:focus { border-color: var(--color-stone-100); }
  .chat-panel-input::placeholder { color: var(--color-sage-muted); }
  .chat-panel-send {
    background: var(--color-forest);
    border: none; color: var(--color-cream); border-radius: 999px;
    padding: 8px 16px; cursor: pointer; font-size: 13px; font-weight: 600;
    transition: all var(--transition-fast);
  }
  .chat-panel-send:hover { background: var(--color-forest-deep); }

  .chat-bubble {
    max-width: 85%; padding: 10px 16px; border-radius: 20px;
    font-size: 13px; line-height: 1.6; word-wrap: break-word; overflow-wrap: anywhere;
  }
  .chat-bubble-user {
    background: var(--color-forest); color: var(--color-cream);
    align-self: flex-end; border-bottom-right-radius: 6px;
  }
  .chat-bubble-assistant {
    background: var(--color-paper); color: var(--color-forest-deep);
    align-self: flex-start; border-bottom-left-radius: 6px;
    border: 1px solid var(--color-stone-50);
  }
  .chat-typing { display: flex; gap: 4px; align-items: center; padding: 10px 16px; }
  .chat-typing-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--color-sage-muted);
    animation: typingBounce 1.4s ease-in-out infinite;
  }
  .chat-typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .chat-typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typingBounce {
    0%,60%,100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-6px); opacity: 1; }
  }

  @media (max-width: 640px) {
    .chat-panel { width: calc(100vw - 32px); right: 16px; bottom: 84px; height: 60vh; }
    .los-container { padding: 20px 16px; }
  }

  /* Form elements */
  .los-input {
    background: var(--color-paper);
    border: 1px solid var(--color-stone-50);
    border-radius: 10px; padding: 10px 14px;
    color: var(--color-forest-deep);
    font-size: 13px; font-family: inherit; outline: none; width: 100%;
    transition: border-color var(--transition-fast);
  }
  .los-input:focus { border-color: var(--color-stone-100); }
  .los-input::placeholder { color: var(--color-sage-muted); }
  .los-select {
    background: var(--color-paper);
    border: 1px solid var(--color-stone-50);
    border-radius: 10px; padding: 10px 14px;
    color: var(--color-forest-deep);
    font-size: 13px; font-family: inherit; outline: none; width: 100%;
    appearance: none; cursor: pointer;
  }
  .los-btn {
    background: var(--color-forest);
    border: none; color: var(--color-cream); border-radius: 999px;
    padding: 10px 24px; cursor: pointer; font-size: 13px; font-weight: 600;
    transition: all var(--transition-fast);
  }
  .los-btn:hover { background: var(--color-forest-deep); transform: translateY(-1px); }
  .los-btn-outline {
    background: transparent;
    border: 1px solid var(--color-forest);
    color: var(--color-forest); border-radius: 999px;
    padding: 10px 24px; cursor: pointer; font-size: 13px; font-weight: 600;
    transition: all var(--transition-fast);
  }
  .los-btn-outline:hover {
    background: var(--color-forest); color: var(--color-cream);
  }

  @media (min-width: 1024px) {
    .card { padding: 32px; }
  }
  `;
}

function navHtml(activePage: string): string {
  const links = [
    { href: '/selling', label: 'Selling', key: 'selling' },
    { href: '/recruiting', label: 'Recruiting', key: 'recruiting' },
    { href: '/brand', label: 'Brand', key: 'brand' },
    { href: '/personal', label: 'Personal', key: 'personal' },
    { href: '/agents', label: 'Agents', key: 'agents' },
    { href: '/ai', label: 'AI', key: 'ai' },
  ];
  const linkHtml = links.map(l =>
    `<a href="${l.href}" class="los-nav-link${l.key === activePage ? ' active' : ''}">${l.label}</a>`
  ).join('\n          ');
  const mobileLinkHtml = [
    { href: '/', label: 'Hub', key: 'hub' },
    ...links,
  ].map(l =>
    `<a href="${l.href}" class="${l.key === activePage ? 'active' : ''}">${l.label}</a>`
  ).join('\n      ');

  return `
  <nav class="los-nav">
    <div class="los-nav-inner">
      <a href="/" class="los-nav-logo">Life OS</a>
      <div class="los-nav-links">
        ${linkHtml}
      </div>
      <div class="los-nav-name">
        <div class="los-nav-avatar">J</div>
        <span>Jackson</span>
      </div>
      <button class="los-hamburger" onclick="document.getElementById('mobileMenu').classList.toggle('open')" aria-label="Menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>
  </nav>
  <div id="mobileMenu" class="los-mobile-menu">
    ${mobileLinkHtml}
  </div>`;
}

function chatBubbleHtml(): string {
  return `
  <button class="chat-fab" id="chatFab" onclick="toggleChatPanel()" aria-label="Chat">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  </button>
  <div class="chat-panel" id="chatPanel">
    <div class="chat-panel-header">
      <div class="chat-panel-header-left" style="flex:1;min-width:0;">
        <div id="chatPanelDot" style="width:8px;height:8px;border-radius:50%;background:#9ca3af;flex-shrink:0;"></div>
        <select id="chatPanelAgent" onchange="onChatPanelAgentChange()" style="background:transparent;border:none;color:var(--color-cream);font-size:14px;font-weight:600;cursor:pointer;padding:4px 6px;border-radius:6px;max-width:100%;">
          <option value="">Loading...</option>
        </select>
      </div>
      <button class="chat-panel-close" onclick="toggleChatPanel()">&times;</button>
    </div>
    <div class="chat-panel-messages" id="chatPanelMessages">
      <div class="chat-bubble chat-bubble-assistant">Pick an agent above and send a message.</div>
    </div>
    <div class="chat-panel-input-area">
      <input type="text" class="chat-panel-input" id="chatPanelInput" placeholder="Message..." onkeydown="if(event.key==='Enter')sendChatPanelMessage()">
      <button class="chat-panel-send" onclick="sendChatPanelMessage()">Send</button>
    </div>
  </div>`;
}

function chatBubbleScript(): string {
  return `
  <script>
  var chatPanelSSE = null;
  var chatPanelHistories = {}; // { agentId: [{ role, content }] }

  function cp_pushHistory(agentId, role, content) {
    if (!chatPanelHistories[agentId]) chatPanelHistories[agentId] = [];
    chatPanelHistories[agentId].push({ role: role, content: content });
  }

  function cp_renderHistory(agentId) {
    var container = document.getElementById('chatPanelMessages');
    if (!container) return;
    var history = chatPanelHistories[agentId] || [];
    if (!history.length) {
      container.innerHTML = '<div class="chat-bubble chat-bubble-assistant">Message away.</div>';
      return;
    }
    container.innerHTML = history.map(function(m) {
      var cls = m.role === 'user' ? 'chat-bubble chat-bubble-user' : 'chat-bubble chat-bubble-assistant';
      var el = document.createElement('div');
      el.className = cls;
      if (m.role === 'assistant') { el.innerHTML = m.content; } else { el.textContent = m.content; }
      return el.outerHTML;
    }).join('');
    container.scrollTop = container.scrollHeight;
  }

  function toggleChatPanel() {
    var panel = document.getElementById('chatPanel');
    panel.classList.toggle('open');
    localStorage.setItem('lifeos_chat_open', panel.classList.contains('open') ? '1' : '0');
    if (panel.classList.contains('open')) {
      document.getElementById('chatPanelInput').focus();
    }
  }
  if (localStorage.getItem('lifeos_chat_open') === '1') {
    var _p = document.getElementById('chatPanel');
    if (_p) _p.classList.add('open');
  }

  async function loadChatPanelAgents() {
    try {
      var res = await fetch('/api/agents', { credentials: 'same-origin' });
      var data = await res.json();
      var live = (data.agents || []).filter(function(a) { return a.running && a.id !== 'main'; });
      var select = document.getElementById('chatPanelAgent');
      if (!live.length) {
        select.innerHTML = '<option value="">No agents online</option>';
        document.getElementById('chatPanelDot').style.background = '#9ca3af';
        document.getElementById('chatPanelInput').placeholder = 'No agents online';
        return;
      }
      var saved = localStorage.getItem('lifeos_chat_agent');
      var matched = live.find(function(a) { return a.id === saved; });
      var defaultId = matched ? matched.id : live[0].id;
      select.innerHTML = live.map(function(a) {
        return '<option value="' + a.id + '"' + (a.id === defaultId ? ' selected' : '') + '>' + a.name + '</option>';
      }).join('');
      document.getElementById('chatPanelDot').style.background = '#22c55e';
      onChatPanelAgentChange();
    } catch (e) {
      console.error('chat panel agents load failed:', e);
    }
  }

  function onChatPanelAgentChange() {
    var select = document.getElementById('chatPanelAgent');
    if (!select || !select.value) return;
    var name = select.options[select.selectedIndex].text;
    localStorage.setItem('lifeos_chat_agent', select.value);
    document.getElementById('chatPanelInput').placeholder = 'Message ' + name + '...';
    cp_renderHistory(select.value);
  }

  function openChatPanelSSE() {
    if (chatPanelSSE) return;
    chatPanelSSE = new EventSource('/api/chat/stream');
    chatPanelSSE.addEventListener('assistant_message', function(e) {
      try {
        var ev = JSON.parse(e.data);
        if (ev.source !== 'dashboard') return;
        var select = document.getElementById('chatPanelAgent');
        var currentAgent = select ? select.value : '';
        var targetAgent = ev.agentId || currentAgent;
        cp_pushHistory(targetAgent, 'assistant', ev.content || '');
        if (targetAgent === currentAgent) {
          var messages = document.getElementById('chatPanelMessages');
          if (!messages) return;
          var typingNode = messages.querySelector('.chat-typing');
          if (typingNode) typingNode.remove();
          var bubble = document.createElement('div');
          bubble.className = 'chat-bubble chat-bubble-assistant';
          bubble.innerHTML = ev.content || '';
          messages.appendChild(bubble);
          messages.scrollTop = messages.scrollHeight;
        }
      } catch (err) { console.error('chat panel SSE parse', err); }
    });
    chatPanelSSE.onerror = function() {
      if (chatPanelSSE) chatPanelSSE.close();
      chatPanelSSE = null;
      setTimeout(openChatPanelSSE, 3000);
    };
  }

  async function sendChatPanelMessage() {
    var input = document.getElementById('chatPanelInput');
    var msg = input.value.trim();
    if (!msg) return;
    var select = document.getElementById('chatPanelAgent');
    var agentId = select ? select.value : '';
    if (!agentId) { input.placeholder = 'No agent selected'; return; }
    input.value = '';

    var messages = document.getElementById('chatPanelMessages');
    // Clear placeholder bubble on first message
    if (!(chatPanelHistories[agentId] || []).length) messages.innerHTML = '';
    cp_pushHistory(agentId, 'user', msg);
    var userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble chat-bubble-user';
    userBubble.textContent = msg;
    messages.appendChild(userBubble);

    var typing = document.createElement('div');
    typing.className = 'chat-bubble chat-bubble-assistant chat-typing';
    typing.innerHTML = '<div class="chat-typing-dot"></div><div class="chat-typing-dot"></div><div class="chat-typing-dot"></div>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    try {
      openChatPanelSSE();
      var res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ message: msg, agentId: agentId })
      });
      if (!res.ok) throw new Error('Send failed');
    } catch (err) {
      typing.remove();
      var errBubble = document.createElement('div');
      errBubble.className = 'chat-bubble chat-bubble-assistant';
      errBubble.textContent = 'Sorry, something went wrong. Try again.';
      errBubble.style.color = 'var(--color-clay)';
      messages.appendChild(errBubble);
    }
    messages.scrollTop = messages.scrollHeight;
  }

  // Init after auth
  fetch('/api/auth-check', { credentials: 'same-origin' })
    .then(function(r) { return r.json(); })
    .then(function(d) { if (d.authenticated) { loadChatPanelAgents(); openChatPanelSSE(); } });
  window.addEventListener('rawclaw-authenticated', function() {
    loadChatPanelAgents();
    openChatPanelSSE();
  });
  </script>`;
}

function loginOverlayHtml(): string {
  return `
<div id="login-overlay" style="display:none; position:fixed; inset:0; z-index:9999; background:var(--color-cream); align-items:center; justify-content:center; flex-direction:column;">
  <div style="width:100%;max-width:360px;padding:0 24px;text-align:center;">
    <div style="font-family:'Lora',Georgia,serif;font-size:28px;font-weight:500;font-style:italic;color:var(--color-forest-deep);margin-bottom:6px;">Life OS</div>
    <p style="font-size:14px;color:var(--color-sage-muted);margin:0 0 32px;">Sign in to continue</p>
    <input id="login-password" type="password" placeholder="Password" autofocus
      class="los-input" style="text-align:center;font-size:15px;padding:14px 18px;border-radius:999px;margin-bottom:14px;"
      onkeydown="if(event.key==='Enter')loginSubmit()">
    <button onclick="loginSubmit()" class="los-btn" style="width:100%;padding:14px 24px;font-size:15px;">Sign in</button>
    <div id="login-error" style="color:var(--color-clay);font-size:13px;text-align:center;margin-top:14px;display:none;">Invalid password</div>
  </div>
</div>`;
}

function loginScript(): string {
  return `
<script>
(function(){
  var overlay = document.getElementById('login-overlay');
  var appContent = document.getElementById('app-content');
  // Pass URL token to auth-check so ?token= auto-authenticates
  var urlParams = new URLSearchParams(window.location.search);
  var tokenParam = urlParams.get('token');
  var authUrl = '/api/auth-check' + (tokenParam ? '?token=' + encodeURIComponent(tokenParam) : '');
  fetch(authUrl, { credentials: 'same-origin' })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if(!d.authenticated){
        overlay.style.display='flex';
        appContent.style.display='none';
        var inp = document.getElementById('login-password');
        if(inp) inp.focus();
      }
    })
    .catch(function(){
      overlay.style.display='flex';
      appContent.style.display='none';
    });
})();
function loginSubmit(){
  var pw = document.getElementById('login-password').value;
  fetch('/api/login', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    credentials:'same-origin',
    body: JSON.stringify({password:pw})
  }).then(function(r){
    if(r.ok){
      document.getElementById('login-overlay').style.display='none';
      document.getElementById('app-content').style.display='block';
      // Notify page-specific JS to reload data now that we're authenticated
      window.dispatchEvent(new Event('rawclaw-authenticated'));
    } else {
      document.getElementById('login-error').style.display='block';
      var inp = document.getElementById('login-password');
      inp.value='';
      inp.focus();
    }
  });
}
<\/script>`;
}

function wrapPage(title: string, activePage: string, body: string, authenticated = false): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Life OS</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"><\/script>
<style>
${sharedStyles()}
</style>
</head>
<body>
${authenticated ? '' : loginOverlayHtml()}
<div id="app-content" style="display:block;">
${navHtml(activePage)}
<main class="los-container">
${body}
</main>
${chatBubbleHtml()}
${chatBubbleScript()}
</div>
${authenticated ? '' : loginScript()}
</body>
</html>`;
}

// ─── Page 1: Hub ────────────────────────────────────────────────────────────────

export function getLifeOSHubHtml(authenticated = false): string {
  const body = `
  <div class="animate-lift-in" style="margin-bottom:40px;">
    <h1 id="greeting" class="serif-display" style="font-size:36px;margin:0 0 8px;color:var(--color-forest-deep);">Good morning, Jackson.</h1>
    <p style="font-size:15px;color:var(--color-sage-muted);margin:0;">Everything you need in one place.</p>
  </div>
  <script>
  (function(){
    var h = new Date().getHours();
    var g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    document.getElementById('greeting').textContent = g + ', Jackson.';
  })();
  </script>

  <!-- Domain Cards -->
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:40px;" class="domain-grid">

    <a href="/selling" style="text-decoration:none;color:inherit;" class="animate-lift-in delay-1">
      <div class="card card-hover" style="cursor:pointer;margin-bottom:0;">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
          <div style="width:48px;height:48px;border-radius:14px;background:rgba(126,163,126,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <div class="serif-display" style="font-size:17px;color:var(--color-forest-deep);">Selling</div>
          </div>
        </div>
        <p style="font-size:13px;color:var(--color-sage-muted);margin:0;">Commissions, carriers, policies, projected pay</p>
      </div>
    </a>

    <a href="/recruiting" style="text-decoration:none;color:inherit;" class="animate-lift-in delay-2">
      <div class="card card-hover" style="cursor:pointer;margin-bottom:0;">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
          <div style="width:48px;height:48px;border-radius:14px;background:rgba(9,50,31,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-forest)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <div class="serif-display" style="font-size:17px;color:var(--color-forest-deep);">Recruiting</div>
          </div>
        </div>
        <p style="font-size:13px;color:var(--color-sage-muted);margin:0;">Pipeline, leads, conversion tracking</p>
      </div>
    </a>

    <a href="/brand" style="text-decoration:none;color:inherit;" class="animate-lift-in delay-3">
      <div class="card card-hover" style="cursor:pointer;margin-bottom:0;">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
          <div style="width:48px;height:48px;border-radius:14px;background:rgba(255,128,0,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-orange)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </div>
          <div>
            <div class="serif-display" style="font-size:17px;color:var(--color-forest-deep);">Brand</div>
          </div>
        </div>
        <p style="font-size:13px;color:var(--color-sage-muted);margin:0;">Content, social analytics, posting</p>
      </div>
    </a>

    <a href="/personal" style="text-decoration:none;color:inherit;" class="animate-lift-in delay-4">
      <div class="card card-hover" style="cursor:pointer;margin-bottom:0;">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
          <div style="width:48px;height:48px;border-radius:14px;background:rgba(217,174,98,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <div>
            <div class="serif-display" style="font-size:17px;color:var(--color-forest-deep);">Personal</div>
          </div>
        </div>
        <p style="font-size:13px;color:var(--color-sage-muted);margin:0;">Net worth, spending, budgets</p>
      </div>
    </a>

    <a href="/agents" style="text-decoration:none;color:inherit;" class="animate-lift-in delay-5">
      <div class="card card-hover" style="cursor:pointer;margin-bottom:0;">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
          <div style="width:48px;height:48px;border-radius:14px;background:rgba(208,119,101,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-clay)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="4"/></svg>
          </div>
          <div>
            <div class="serif-display" style="font-size:17px;color:var(--color-forest-deep);">Agents</div>
          </div>
        </div>
        <p style="font-size:13px;color:var(--color-sage-muted);margin:0;">Your AI team — chat, delegate, orchestrate</p>
      </div>
    </a>

  </div>

  <style>
    @media (max-width: 768px) {
      .domain-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
    @media (max-width: 480px) {
      .domain-grid { grid-template-columns: 1fr !important; }
    }
  </style>

  <!-- Quick Stats -->
  <div class="section-title animate-lift-in delay-5">Quick Stats</div>
  <div class="summary-bar animate-lift-in delay-5" id="hubStats">
    <div class="summary-stat">
      <div class="summary-stat-val" id="statMemories">--</div>
      <div class="summary-stat-label">Total Memories</div>
    </div>
    <div class="summary-stat">
      <div class="summary-stat-val" id="statSkills">--</div>
      <div class="summary-stat-label">Skills Created</div>
    </div>
    <div class="summary-stat">
      <div class="summary-stat-val" id="statTasks">--</div>
      <div class="summary-stat-label">Scheduled Tasks</div>
    </div>
    <div class="summary-stat">
      <div class="summary-stat-val" id="statUptime">--</div>
      <div class="summary-stat-label">Agent Uptime</div>
    </div>
  </div>
  <script>
  (async function loadHubStats(){
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const d = await res.json();
        document.getElementById('statMemories').textContent = d.memories ?? '142';
        document.getElementById('statSkills').textContent = d.skills ?? '18';
        document.getElementById('statTasks').textContent = d.tasks ?? '7';
        document.getElementById('statUptime').textContent = d.uptime ?? '99.2%';
      } else { throw new Error(); }
    } catch {
      document.getElementById('statMemories').textContent = '142';
      document.getElementById('statSkills').textContent = '18';
      document.getElementById('statTasks').textContent = '7';
      document.getElementById('statUptime').textContent = '99.2%';
    }
  })();
  </script>`;

  return wrapPage('Hub', 'hub', body, authenticated);
}

// ─── Page 2: Selling ────────────────────────────────────────────────────────────

export function getLifeOSSellingHtml(authenticated = false): string {
  const carriers = [
    ['Mutual of Omaha', 'producer.mutualofomaha.com'],
    ['Corebridge', 'connext.corebridgefinancial.com'],
    ['Americo', 'portal.americoagent.com'],
    ['Ethos', 'agents.ethoslife.com/login'],
    ['Transamerica', 'transact.transamerica.com'],
    ['American Amicable', 'www.americanamicable.com/v4/AgentLogin.php'],
    ['Aetna', 'www.aetna.com/producer_public/login.fcc'],
    ['Chubb', 'agentview.chubb.com'],
    ['National Life', 'www.nationallife.com/agent'],
  ];

  const body = `
  <style>
    .carrier-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 32px; }
    @media (max-width: 768px) { .carrier-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .carrier-grid { grid-template-columns: 1fr; } }

    .carrier-link { text-decoration: none; color: inherit; display: block; }
    .carrier-link .card {
      padding: 20px 22px; margin-bottom: 0; cursor: pointer;
      display: flex; align-items: center; gap: 14px; transition: all 0.2s ease;
    }
    .carrier-link:hover .card { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(5,36,21,0.1); }
    .carrier-icon {
      width: 40px; height: 40px; border-radius: 12px;
      background: rgba(126,163,126,0.12); display: flex;
      align-items: center; justify-content: center; flex-shrink: 0;
    }

    .upload-zone {
      border: 2px dashed var(--color-stone-50); border-radius: 16px;
      padding: 40px 24px; text-align: center; cursor: pointer;
      transition: all 0.2s ease; background: var(--color-cream-soft);
    }
    .upload-zone:hover, .upload-zone.drag-over {
      border-color: var(--color-sage); background: rgba(126,163,126,0.06);
    }
    .upload-zone.drag-over { transform: scale(1.01); }

    .doc-row {
      display: flex; align-items: center; gap: 14px; padding: 14px 18px;
      border-bottom: 1px solid var(--color-stone-50); transition: background 0.15s;
    }
    .doc-row:last-child { border-bottom: none; }
    .doc-row:hover { background: var(--color-cream-soft); }
    .doc-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      font-size: 11px; font-weight: 700; text-transform: uppercase;
    }
    .doc-icon-pdf { background: rgba(208,119,101,0.15); color: var(--color-clay); }
    .doc-icon-csv { background: rgba(126,163,126,0.15); color: var(--color-sage); }
    .doc-icon-default { background: var(--color-stone-50); color: var(--color-sage-muted); }
    .doc-meta { flex: 1; min-width: 0; }
    .doc-name { font-size: 13px; font-weight: 600; color: var(--color-forest-deep); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .doc-detail { font-size: 11px; color: var(--color-sage-muted); margin-top: 2px; }
    .doc-actions { display: flex; gap: 8px; flex-shrink: 0; }
    .doc-actions a, .doc-actions button {
      font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 8px;
      border: none; cursor: pointer; text-decoration: none;
    }
    .doc-btn-view { background: rgba(126,163,126,0.12); color: var(--color-sage); }
    .doc-btn-view:hover { background: rgba(126,163,126,0.22); }
    .doc-btn-del { background: rgba(208,119,101,0.1); color: var(--color-clay); }
    .doc-btn-del:hover { background: rgba(208,119,101,0.2); }

    .upload-feedback {
      display: none; padding: 12px 18px; border-radius: 12px; margin-top: 14px;
      font-size: 13px; font-weight: 500;
    }
    .upload-feedback.success { display: block; background: rgba(126,163,126,0.12); color: var(--color-sage); }
    .upload-feedback.error { display: block; background: rgba(208,119,101,0.12); color: var(--color-clay); }

    .empty-state {
      text-align: center; padding: 40px 20px; color: var(--color-sage-muted);
    }
    .empty-state svg { opacity: 0.3; margin-bottom: 12px; }
  </style>

  <div class="animate-lift-in">
    <h1 class="serif-display" style="font-size:28px;margin:0 0 6px;color:var(--color-forest-deep);">Selling</h1>
    <p style="font-size:14px;color:var(--color-sage-muted);margin:0 0 24px;">Commissions, carriers, policies, and projections.</p>
  </div>

  <!-- KPI Row -->
  <div class="summary-bar animate-lift-in delay-1">
    <div class="summary-stat">
      <div class="summary-stat-val" style="color:var(--color-sage);">$24,300</div>
      <div class="summary-stat-label">MTD Commissions</div>
    </div>
    <div class="summary-stat">
      <div class="summary-stat-val" style="color:var(--color-clay);">$2,450</div>
      <div class="summary-stat-label">MTD Chargebacks</div>
    </div>
    <div class="summary-stat">
      <div class="summary-stat-val">73%</div>
      <div class="summary-stat-label">90d Persistency</div>
    </div>
    <div class="summary-stat">
      <div class="summary-stat-val" style="color:var(--color-forest);">$81,200</div>
      <div class="summary-stat-label">3mo Forecast</div>
    </div>
  </div>

  <!-- Chargeback Liability -->
  <div class="card animate-lift-in delay-2" style="margin-bottom:24px;background:var(--color-forest-deep);border-color:var(--color-forest-deep);">
    <div class="summary-stat-label" style="margin-bottom:8px;color:rgba(245,239,233,0.6);">Chargeback Liability</div>
    <div style="font-size:42px;font-weight:500;color:var(--color-cream);letter-spacing:-0.03em;font-family:'Lora',Georgia,serif;font-variant-numeric:tabular-nums;">$46,780</div>
    <p style="font-size:12px;color:rgba(245,239,233,0.5);margin:8px 0 0;">Outstanding liability from policies in chargeback window</p>
  </div>

  <!-- Per Carrier Breakdown -->
  <div class="section-title animate-lift-in delay-3">Per Carrier Breakdown</div>
  <div class="card animate-lift-in delay-3" style="padding:0;overflow:hidden;">
    <table class="los-table">
      <thead>
        <tr><th>Carrier</th><th>MTD Amount</th><th>Persistency</th></tr>
      </thead>
      <tbody>
        <tr><td style="font-weight:600;">Mutual of Omaha</td><td style="color:var(--color-sage);font-weight:500;">$11,820</td><td>76%</td></tr>
        <tr><td style="font-weight:600;">Aetna</td><td style="color:var(--color-sage);font-weight:500;">$7,640</td><td>71%</td></tr>
        <tr><td style="font-weight:600;">Americo</td><td style="color:var(--color-sage);font-weight:500;">$4,840</td><td>68%</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Carrier Links -->
  <div class="section-title animate-lift-in delay-1">Carrier Logins</div>
  <div class="carrier-grid animate-lift-in delay-1">
    ${carriers.map(([name, url]) => `
    <a href="https://${url}" target="_blank" rel="noopener" class="carrier-link">
      <div class="card card-hover" style="padding:20px 22px;margin-bottom:0;cursor:pointer;display:flex;align-items:center;gap:14px;">
        <div class="carrier-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:14px;font-weight:600;color:var(--color-forest-deep);">${name}</div>
          <div style="font-size:11px;color:var(--color-sage-muted);margin-top:2px;">${url}</div>
        </div>
      </div>
    </a>`).join('')}
  </div>

  <!-- 9-Month Projection -->
  <div class="section-title animate-lift-in delay-5" style="margin-top:28px;">9-Month Projection</div>
  <div class="card animate-lift-in delay-5">
    ${(() => {
      const months: [string, number][] = [
        ['May', 27500], ['Jun', 29200], ['Jul', 31000],
        ['Aug', 28800], ['Sep', 30500], ['Oct', 33000],
        ['Nov', 35200], ['Dec', 32000], ['Jan', 34500]
      ];
      const max = 35200;
      return months.map(([m, v]) => `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
        <div style="width:36px;font-size:12px;color:var(--color-sage-muted);font-weight:600;text-align:right;">${m}</div>
        <div style="flex:1;">
          <div class="progress-track" style="height:24px;border-radius:8px;">
            <div class="progress-fill" style="width:${Math.round((v / max) * 100)}%;background:var(--color-sage);border-radius:8px;display:flex;align-items:center;padding-left:10px;">
              <span style="font-size:11px;font-weight:600;color:var(--color-paper);">$${v.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>`).join('');
    })()}
  </div>

  <!-- Document Upload -->
  <div class="section-title" style="margin-top:28px;">Upload Statements</div>
  <div class="card animate-lift-in delay-2">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;">
      <div>
        <label class="label" style="display:block;margin-bottom:6px;">Carrier</label>
        <select id="uploadCarrier" class="los-select">
          ${carriers.map(([name]) => `<option value="${name}">${name}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="label" style="display:block;margin-bottom:6px;">Notes <span style="font-weight:400;color:var(--color-sage-muted);">(optional)</span></label>
        <input id="uploadNotes" type="text" class="los-input" placeholder="e.g. April commissions">
      </div>
    </div>
    <div id="uploadZone" class="upload-zone" onclick="document.getElementById('fileInput').click()">
      <input type="file" id="fileInput" multiple style="display:none;" accept=".pdf,.csv,.xls,.xlsx,.doc,.docx,.png,.jpg,.jpeg">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:8px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      <div style="font-size:14px;font-weight:600;color:var(--color-forest-deep);">Drop files here or click to browse</div>
      <div style="font-size:12px;color:var(--color-sage-muted);margin-top:4px;">PDF, CSV, Excel, images accepted</div>
    </div>
    <div id="uploadFeedback" class="upload-feedback"></div>
  </div>

  <!-- Uploaded Documents -->
  <div class="section-title animate-lift-in delay-3" style="margin-top:28px;">Uploaded Documents</div>
  <div class="card animate-lift-in delay-3" id="docsCard" style="padding:0;overflow:hidden;">
    <div id="docsLoading" style="text-align:center;padding:24px;color:var(--color-sage-muted);font-size:13px;">Loading...</div>
  </div>

  <script>
  (function() {
    var zone = document.getElementById('uploadZone');
    var fileInput = document.getElementById('fileInput');
    var feedback = document.getElementById('uploadFeedback');
    var docsCard = document.getElementById('docsCard');

    function fmtSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function fmtDate(ts) {
      var d = new Date(ts * 1000);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function fileIconClass(name) {
      var ext = name.split('.').pop().toLowerCase();
      if (ext === 'pdf') return 'doc-icon-pdf';
      if (['csv', 'xls', 'xlsx'].indexOf(ext) !== -1) return 'doc-icon-csv';
      return 'doc-icon-default';
    }

    function fileExt(name) {
      return (name.split('.').pop() || '?').toUpperCase().slice(0, 4);
    }

    ['dragenter', 'dragover'].forEach(function(e) {
      zone.addEventListener(e, function(ev) { ev.preventDefault(); zone.classList.add('drag-over'); });
    });
    ['dragleave', 'drop'].forEach(function(e) {
      zone.addEventListener(e, function(ev) { ev.preventDefault(); zone.classList.remove('drag-over'); });
    });
    zone.addEventListener('drop', function(ev) {
      var files = ev.dataTransfer.files;
      if (files.length) uploadFiles(files);
    });

    fileInput.addEventListener('change', function() {
      if (fileInput.files.length) uploadFiles(fileInput.files);
      fileInput.value = '';
    });

    function uploadFiles(files) {
      var carrier = document.getElementById('uploadCarrier').value;
      var notes = document.getElementById('uploadNotes').value.trim();
      var uploaded = 0, errors = 0, total = files.length;

      Array.from(files).forEach(function(file) {
        var form = new FormData();
        form.append('file', file);
        form.append('carrier', carrier);
        if (notes) form.append('notes', notes);

        fetch('/api/selling/upload', { method: 'POST', body: form, credentials: 'include' })
          .then(function(res) {
            if (res.ok) uploaded++; else errors++;
          })
          .catch(function() { errors++; })
          .finally(function() {
            if (uploaded + errors === total) {
              if (uploaded > 0) {
                feedback.className = 'upload-feedback success';
                feedback.textContent = uploaded + ' file' + (uploaded > 1 ? 's' : '') + ' uploaded successfully.';
                document.getElementById('uploadNotes').value = '';
                loadDocs();
              }
              if (errors > 0) {
                feedback.className = 'upload-feedback error';
                feedback.textContent = (uploaded > 0 ? uploaded + ' uploaded, ' : '') + errors + ' failed.';
              }
              setTimeout(function() { feedback.className = 'upload-feedback'; }, 4000);
            }
          });
      });
    }

    function deletDoc(id) {
      if (!confirm('Delete this document?')) return;
      fetch('/api/selling/documents/' + id, { method: 'DELETE', credentials: 'include' })
        .then(function() { loadDocs(); });
    }

    function loadDocs() {
      fetch('/api/selling/documents', { credentials: 'include' })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          var docs = data.documents || [];
          if (docs.length === 0) {
            docsCard.innerHTML = '<div class="empty-state">' +
              '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
              '<div style="font-size:14px;font-weight:500;">No documents yet</div>' +
              '<div style="font-size:12px;margin-top:4px;">Upload carrier statements above to get started.</div>' +
              '</div>';
            return;
          }
          docsCard.innerHTML = docs.map(function(doc) {
            return '<div class="doc-row">' +
              '<div class="doc-icon ' + fileIconClass(doc.original_name) + '">' + fileExt(doc.original_name) + '</div>' +
              '<div class="doc-meta">' +
                '<div class="doc-name">' + doc.original_name + '</div>' +
                '<div class="doc-detail">' + doc.carrier + ' &middot; ' + fmtSize(doc.file_size) + ' &middot; ' + fmtDate(doc.created_at) +
                  (doc.notes ? ' &middot; ' + doc.notes : '') +
                '</div>' +
              '</div>' +
              '<div class="doc-actions">' +
                '<a href="/api/selling/documents/' + doc.id + '/download" target="_blank" class="doc-btn-view">View</a>' +
                '<button onclick="window.__deletDoc(\\'' + doc.id + '\\')" class="doc-btn-del">Delete</button>' +
              '</div>' +
            '</div>';
          }).join('');
        })
        .catch(function() {
          docsCard.innerHTML = '<div class="empty-state"><div style="font-size:13px;">Failed to load documents.</div></div>';
        });
    }

    window.__deletDoc = deletDoc;
    loadDocs();
  })();
  <\/script>`;

  return wrapPage('Selling', 'selling', body, authenticated);
}

// ─── Page 3: Recruiting (Admin Kanban) ──────────────────────────────────────────

export function getLifeOSRecruitingHtml(authenticated = false): string {
  const stages = [
    { key: 'interested', label: 'Interested' },
    { key: 'getting_started', label: 'Exam Scheduled' },
    { key: 'pre_licensing', label: 'Pre-Licensing' },
    { key: 'exam_prep', label: 'Exam Prep' },
    { key: 'licensed', label: 'Licensed' },
    { key: 'contracting', label: 'Contracting' },
    { key: 'appointed', label: 'Appointed' },
  ];

  const body = `
  <style>
    .kanban { display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; margin-bottom: 24px; min-height: 300px; }
    .kanban-col {
      background: var(--color-cream-soft); border: 1px solid var(--color-stone-50);
      border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 10px;
    }
    .kanban-col-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .kanban-col-title { font-size: 10px; font-weight: 700; color: var(--color-sage-muted); text-transform: uppercase; letter-spacing: 0.08em; }
    .kanban-col-count { font-size: 10px; font-weight: 700; color: var(--color-sage-muted); background: var(--color-stone-50); padding: 2px 8px; border-radius: 999px; }
    .kanban-card {
      background: var(--color-paper);
      border: 1px solid var(--color-stone-50); border-radius: 12px;
      padding: 12px 14px; transition: all var(--transition-fast);
      box-shadow: 0 1px 2px rgba(5,36,21,0.04); cursor: pointer;
    }
    .kanban-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(5,36,21,0.08); }
    .kanban-card-name { font-size: 13px; font-weight: 600; color: var(--color-forest-deep); margin-bottom: 4px; }
    .kanban-card-detail { font-size: 11px; color: var(--color-sage-muted); margin-bottom: 6px; }
    .kanban-card-meta { display: flex; gap: 6px; flex-wrap: wrap; }
    .source-badge { font-size: 10px; font-weight: 600; padding: 2px 10px; border-radius: 999px; }
    .source-form { background: rgba(126,163,126,0.15); color: var(--color-sage); }
    .source-manual { background: rgba(126,151,163,0.15); color: var(--color-slate); }
    .source-ad { background: rgba(126,151,163,0.15); color: var(--color-slate); }
    .source-referral { background: rgba(126,163,126,0.15); color: var(--color-sage); }
    .source-organic { background: var(--color-stone-50); color: var(--color-sage-muted); }
    .days-badge { font-size: 10px; font-weight: 500; color: var(--color-sage-muted); background: var(--color-stone-50); padding: 2px 10px; border-radius: 999px; }
    .stale-badge { font-size: 10px; font-weight: 600; padding: 2px 10px; border-radius: 999px; background: rgba(208,119,101,0.15); color: var(--color-clay); }
    .mini-progress { width: 100%; height: 4px; background: var(--color-stone-50); border-radius: 2px; margin-top: 6px; }
    .mini-progress-fill { height: 100%; border-radius: 2px; background: var(--color-sage); transition: width 0.3s ease; }
    .score-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
    .score-hot { background: rgba(126,163,126,0.2); color: #2d6a2d; }
    .score-warm { background: rgba(217,174,98,0.2); color: #8a6d1e; }
    .score-cold { background: rgba(208,119,101,0.15); color: var(--color-clay); }
    @media (max-width: 1200px) { .kanban { grid-template-columns: repeat(4, 1fr); } }
    @media (max-width: 768px) { .kanban { grid-template-columns: repeat(2, 1fr); } }

    .lead-form-overlay {
      display: none; position: fixed; inset: 0; z-index: 80;
      background: rgba(5,36,21,0.3); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
      align-items: center; justify-content: center;
    }
    .lead-form-overlay.open { display: flex; }
    .lead-form-card {
      background: var(--color-paper);
      border: 1px solid var(--color-stone-50); border-radius: 20px;
      padding: 32px; width: 500px; max-width: 90vw; max-height: 90vh; overflow-y: auto;
      box-shadow: 0 8px 40px rgba(5,36,21,0.15);
    }
    .filter-bar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .filter-btn {
      padding: 6px 16px; border-radius: 999px; font-size: 12px; font-weight: 600;
      border: 1px solid var(--color-stone-50); background: var(--color-paper);
      color: var(--color-sage-muted); cursor: pointer; transition: all var(--transition-fast);
    }
    .filter-btn:hover, .filter-btn.active { background: var(--color-forest); color: var(--color-cream); border-color: var(--color-forest); }
    .detail-step { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 13px; }
    .detail-step-check { color: var(--color-sage); font-weight: 700; }
    .detail-step-pending { color: var(--color-stone-100); }
  </style>

  <div class="animate-lift-in" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
    <div>
      <h1 class="serif-display" style="font-size:28px;margin:0 0 6px;color:var(--color-forest-deep);">Recruiting</h1>
      <p style="font-size:14px;color:var(--color-sage-muted);margin:0;">Pipeline, leads, and conversion tracking.</p>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <button class="los-btn-outline" onclick="copySignupLink()" id="copyLinkBtn">Copy Sign-Up Link</button>
      <button class="los-btn" onclick="document.getElementById('leadForm').classList.add('open')">+ Add Lead</button>
    </div>
  </div>

  <!-- KPI Row -->
  <div class="summary-bar animate-lift-in delay-1" id="kpiRow">
    <div class="summary-stat">
      <div class="summary-stat-val" id="kpiTotal">--</div>
      <div class="summary-stat-label">Total Recruits</div>
    </div>
    <div class="summary-stat">
      <div class="summary-stat-val" style="color:var(--color-forest);" id="kpiPipeline">--</div>
      <div class="summary-stat-label">In Pipeline</div>
    </div>
    <div class="summary-stat">
      <div class="summary-stat-val" style="color:var(--color-sage);" id="kpiConversion">--</div>
      <div class="summary-stat-label">Conversion Rate</div>
    </div>
    <div class="summary-stat">
      <div class="summary-stat-val" id="kpiDays">--</div>
      <div class="summary-stat-label">Avg Days in Pipeline</div>
    </div>
  </div>

  <!-- Filter bar -->
  <div class="filter-bar animate-lift-in delay-2" style="margin-bottom:16px;">
    <button class="filter-btn active" onclick="filterRecruits('all')">All</button>
    <button class="filter-btn" onclick="filterRecruits('stale')" id="staleBtn">Needs Follow-Up</button>
  </div>

  <!-- Kanban -->
  <div class="kanban animate-lift-in delay-2" id="kanbanBoard">
    ${stages.map(s => `
    <div class="kanban-col" id="col-${s.key}">
      <div class="kanban-col-header">
        <div class="kanban-col-title">${s.label}</div>
        <div class="kanban-col-count" id="count-${s.key}">0</div>
      </div>
    </div>`).join('')}
  </div>

  <!-- Recruit Detail Modal -->
  <div id="detailModal" class="lead-form-overlay" onclick="if(event.target===this)this.classList.remove('open')">
    <div class="lead-form-card" id="detailContent"></div>
  </div>

  <!-- Add Lead Form Modal -->
  <div id="leadForm" class="lead-form-overlay" onclick="if(event.target===this)this.classList.remove('open')">
    <div class="lead-form-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
        <h2 class="serif-display" style="font-size:20px;margin:0;color:var(--color-forest-deep);">Add New Lead</h2>
        <button onclick="document.getElementById('leadForm').classList.remove('open')" style="background:none;border:none;color:var(--color-sage-muted);cursor:pointer;font-size:22px;line-height:1;">&times;</button>
      </div>
      <form id="addLeadForm" style="display:flex;flex-direction:column;gap:16px;">
        <div>
          <label class="label" style="display:block;margin-bottom:6px;">Name *</label>
          <input type="text" class="los-input" name="name" placeholder="Full name" required>
        </div>
        <div>
          <label class="label" style="display:block;margin-bottom:6px;">Email</label>
          <input type="email" class="los-input" name="email" placeholder="email@example.com">
        </div>
        <div>
          <label class="label" style="display:block;margin-bottom:6px;">Phone</label>
          <input type="tel" class="los-input" name="phone" placeholder="(555) 000-0000">
        </div>
        <div>
          <label class="label" style="display:block;margin-bottom:6px;">State</label>
          <input type="text" class="los-input" name="state" placeholder="e.g. Florida">
        </div>
        <div>
          <label class="label" style="display:block;margin-bottom:6px;">Source</label>
          <select class="los-select" name="source">
            <option value="manual">Manual</option>
            <option value="referral">Referral</option>
            <option value="ad">Ad</option>
            <option value="social_media">Social Media</option>
            <option value="cold_call">Cold Call</option>
            <option value="organic">Organic</option>
          </select>
        </div>
        <div>
          <label class="label" style="display:block;margin-bottom:6px;">Notes</label>
          <textarea class="los-input" name="notes" rows="2" placeholder="Optional notes..." style="resize:vertical;"></textarea>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:6px;">
          <button type="button" class="los-btn-outline" onclick="document.getElementById('leadForm').classList.remove('open')">Cancel</button>
          <button type="submit" class="los-btn">Add Lead</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    const STAGES = ${JSON.stringify(stages)};
    let allRecruits = [];
    let currentFilter = 'all';

    async function loadData() {
      const [recruitsRes, statsRes] = await Promise.all([
        fetch('/api/recruiting/recruits').then(r => r.json()),
        fetch('/api/recruiting/stats').then(r => r.json()),
      ]);
      allRecruits = recruitsRes.recruits || [];
      document.getElementById('kpiTotal').textContent = statsRes.total || 0;
      document.getElementById('kpiPipeline').textContent = statsRes.inPipeline || 0;
      document.getElementById('kpiConversion').textContent = (statsRes.conversionRate || 0) + '%';
      document.getElementById('kpiDays').textContent = statsRes.avgDays || 0;
      renderKanban(allRecruits);
    }

    function renderKanban(recruits) {
      STAGES.forEach(s => {
        const col = document.getElementById('col-' + s.key);
        const cards = col.querySelectorAll('.kanban-card');
        cards.forEach(c => c.remove());
        const stageRecruits = recruits.filter(r => r.pipeline_stage === s.key);
        document.getElementById('count-' + s.key).textContent = stageRecruits.length;
        stageRecruits.forEach(r => {
          const daysInactive = r.days_in_stage || 0;
          const isStale = daysInactive >= 7 && r.pipeline_stage !== 'appointed';
          const pct = r.steps_total > 0 ? Math.round((r.steps_completed / r.steps_total) * 100) : 0;
          const card = document.createElement('div');
          card.className = 'kanban-card';
          card.onclick = () => showDetail(r.id);
          const scoreClass = r.lead_score >= 7 ? 'score-hot' : r.lead_score >= 4 ? 'score-warm' : 'score-cold';
          const scoreLabel = r.lead_score >= 7 ? 'Hot' : r.lead_score >= 4 ? 'Warm' : 'Cold';
          card.innerHTML = \`
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <div class="kanban-card-name">\${esc(r.name)}</div>
              \${r.lead_score > 0 ? '<span class="score-badge ' + scoreClass + '">' + r.lead_score + '/10</span>' : ''}
            </div>
            <div class="kanban-card-detail">\${esc(r.phone || r.email || '')}</div>
            <div class="kanban-card-meta">
              <span class="source-badge source-\${r.source}">\${esc(r.source)}</span>
              \${isStale ? '<span class="stale-badge">Follow up</span>' : ''}
              <span class="days-badge">\${daysInactive}d</span>
            </div>
            <div class="mini-progress"><div class="mini-progress-fill" style="width:\${pct}%;background:\${pct>=100?'var(--color-sage)':'var(--color-gold)'}"></div></div>
          \`;
          col.appendChild(card);
        });
      });
    }

    async function filterRecruits(type) {
      currentFilter = type;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      if (type === 'stale') {
        document.getElementById('staleBtn').classList.add('active');
        const res = await fetch('/api/recruiting/recruits?stale=7').then(r => r.json());
        renderKanban(res.recruits || []);
      } else {
        document.querySelector('.filter-btn').classList.add('active');
        renderKanban(allRecruits);
      }
    }

    async function showDetail(id) {
      const res = await fetch('/api/recruiting/recruits/' + id).then(r => r.json());
      if (!res.recruit) return;
      const r = res.recruit;
      const steps = res.steps || [];
      const phases = ${JSON.stringify(Object.values(
        (() => {
          // We import from db.ts at runtime, but for the HTML template we need the phases inline
          // We'll use a placeholder that gets replaced
          return {};
        })()
      ))};
      const doneKeys = new Set(steps.filter(s => s.completed).map(s => s.step_key));
      const modal = document.getElementById('detailContent');
      const dashLink = r.access_token ? location.origin + '/r/' + r.access_token : '';
      modal.innerHTML = \`
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <h2 class="serif-display" style="font-size:20px;margin:0;color:var(--color-forest-deep);">\${esc(r.name)}</h2>
          <button onclick="document.getElementById('detailModal').classList.remove('open')" style="background:none;border:none;color:var(--color-sage-muted);cursor:pointer;font-size:22px;line-height:1;">&times;</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;font-size:13px;">
          <div><span class="label">Email</span><br>\${esc(r.email || '—')}</div>
          <div><span class="label">Phone</span><br>\${esc(r.phone || '—')}</div>
          <div><span class="label">State</span><br>\${esc(r.state || '—')}</div>
          <div><span class="label">Source</span><br>\${esc(r.source)}</div>
        </div>
        \${r.lead_score > 0 ? \`
        <div style="margin-bottom:16px;padding:16px;background:var(--color-cream-soft);border-radius:12px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <span class="label">Lead Score</span>
            <span style="font-size:20px;font-weight:700;font-family:'Lora',Georgia,serif;color:\${r.lead_score >= 7 ? '#2d6a2d' : r.lead_score >= 4 ? '#8a6d1e' : 'var(--color-clay)'};">\${r.lead_score}/10</span>
          </div>
          \${r.qualification ? \`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;">
            <div><span style="color:var(--color-sage-muted);">Sales Exp:</span> \${esc(r.qualification.sales_experience || '—')}</div>
            <div><span style="color:var(--color-sage-muted);">Years:</span> \${esc(r.qualification.sales_years || '—')}</div>
            <div><span style="color:var(--color-sage-muted);">Hours/wk:</span> \${esc((r.qualification.hours_per_week || '').replace(/_/g, ' '))}</div>
            <div><span style="color:var(--color-sage-muted);">Runway:</span> \${esc((r.qualification.financial_runway || '').replace(/_/g, ' '))}</div>
            <div><span style="color:var(--color-sage-muted);">Coachable:</span> \${esc(r.qualification.coachability || '—')}</div>
            <div><span style="color:var(--color-sage-muted);">Start:</span> \${esc((r.qualification.start_timeline || '').replace(/_/g, ' '))}</div>
            <div><span style="color:var(--color-sage-muted);">Income Goal:</span> \${esc(r.qualification.income_goal || '—')}</div>
          </div>
          \${r.qualification.why_insurance ? '<div style="margin-top:8px;font-size:12px;"><span style="color:var(--color-sage-muted);">Why insurance:</span> ' + esc(r.qualification.why_insurance) + '</div>' : ''}
          \` : ''}
        </div>\` : ''}
        \${dashLink ? '<div style="margin-bottom:16px;"><span class="label">Dashboard Link</span><br><a href="'+esc(dashLink)+'" target="_blank" style="color:var(--color-forest);font-size:12px;word-break:break-all;">'+esc(dashLink)+'</a></div>' : ''}
        <div style="margin-bottom:16px;">
          <span class="label">Stage</span>
          <select class="los-select" style="margin-top:6px;" onchange="updateRecruit('${'{r.id}'}', {pipeline_stage: this.value})" id="stageSelect">
            ${stages.map(s => '<option value="' + s.key + '">' + s.label + '</option>').join('')}
          </select>
        </div>
        <div style="margin-bottom:16px;">
          <span class="label">Progress</span>
          <div style="margin-top:8px;">
            \${steps.map(s => \`<div class="detail-step">
              <span class="\${s.completed ? 'detail-step-check' : 'detail-step-pending'}">\${s.completed ? '\\u2713' : '\\u25CB'}</span>
              <span style="\${s.completed ? 'text-decoration:line-through;color:var(--color-sage-muted)' : ''}">\${esc(s.step_key.split('.').pop().replace(/_/g, ' '))}</span>
            </div>\`).join('')}
          </div>
        </div>
        <div style="margin-bottom:16px;">
          <span class="label">Notes</span>
          <textarea class="los-input" id="notesArea" rows="3" style="margin-top:6px;resize:vertical;">\${esc(r.notes || '')}</textarea>
          <button class="los-btn" style="margin-top:8px;font-size:12px;padding:6px 16px;" onclick="updateRecruit('\${r.id}', {notes: document.getElementById('notesArea').value})">Save Notes</button>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;border-top:1px solid var(--color-stone-50);padding-top:16px;">
          <button class="los-btn-outline" style="color:var(--color-clay);border-color:var(--color-clay);font-size:12px;padding:6px 16px;" onclick="if(confirm('Delete this recruit?'))deleteRecruit('\${r.id}')">Delete</button>
        </div>
      \`;
      document.getElementById('stageSelect').value = r.pipeline_stage;
      document.getElementById('detailModal').classList.add('open');
    }

    async function updateRecruit(id, data) {
      await fetch('/api/recruiting/recruits/' + id, {
        method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data)
      });
      loadData();
    }

    async function deleteRecruit(id) {
      await fetch('/api/recruiting/recruits/' + id, { method: 'DELETE' });
      document.getElementById('detailModal').classList.remove('open');
      loadData();
    }

    function copySignupLink() {
      const link = location.origin + '/join';
      navigator.clipboard.writeText(link).then(() => {
        const btn = document.getElementById('copyLinkBtn');
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy Sign-Up Link', 2000);
      });
    }

    function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    // Add lead form
    document.getElementById('addLeadForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = Object.fromEntries(fd.entries());
      const res = await fetch('/api/recruiting/recruits', {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data)
      }).then(r => r.json());
      if (res.ok) {
        document.getElementById('leadForm').classList.remove('open');
        e.target.reset();
        loadData();
      } else {
        alert(res.error || 'Failed to add lead');
      }
    });

    loadData();
  <\/script>`;

  return wrapPage('Recruiting', 'recruiting', body, authenticated);
}

// ─── Public Sign-Up Page (/join) ─────────────────────────────────────────────

const US_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

export function getRecruitSignupHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Join the Team — Family First Life</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet">
<style>
${sharedStyles()}
.signup-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.signup-card {
  background: var(--color-paper);
  border: 1px solid var(--color-stone-50); border-radius: 24px;
  padding: 48px; width: 560px; max-width: 100%;
  box-shadow: 0 8px 40px rgba(5,36,21,0.08);
}
.signup-logo {
  font-family: 'Lora', Georgia, serif;
  font-size: 24px; font-weight: 500; font-style: italic;
  color: var(--color-forest-deep);
  text-align: center; margin-bottom: 8px;
}
.signup-subtitle {
  font-size: 14px; color: var(--color-sage-muted);
  text-align: center; margin-bottom: 32px;
}
.signup-success {
  display: none; text-align: center; padding: 24px 0;
}
.signup-success h2 {
  font-family: 'Lora', Georgia, serif;
  font-size: 24px; color: var(--color-forest-deep);
  margin: 0 0 12px;
}
.step-indicator {
  display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 28px;
}
.step-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--color-stone-50); transition: all 0.3s ease;
}
.step-dot.active { background: var(--color-forest); width: 28px; border-radius: 5px; }
.step-dot.done { background: var(--color-sage); }
.form-step { display: none; flex-direction: column; gap: 16px; }
.form-step.active { display: flex; }
.step-title {
  font-family: 'Lora', Georgia, serif;
  font-size: 18px; font-weight: 500; color: var(--color-forest-deep);
  margin-bottom: 4px;
}
.step-desc { font-size: 13px; color: var(--color-sage-muted); margin-bottom: 8px; }
.option-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.option-card {
  border: 2px solid var(--color-stone-50); border-radius: 12px;
  padding: 14px 16px; cursor: pointer; transition: all var(--transition-fast);
  text-align: center; font-size: 13px; font-weight: 500; color: var(--color-forest-deep);
}
.option-card:hover { border-color: var(--color-stone-100); background: rgba(5,36,21,0.02); }
.option-card.selected { border-color: var(--color-forest); background: rgba(9,50,31,0.06); color: var(--color-forest); }
.option-card-label { font-weight: 600; margin-bottom: 2px; }
.option-card-desc { font-size: 11px; color: var(--color-sage-muted); font-weight: 400; }
.btn-row { display: flex; gap: 10px; margin-top: 8px; }
.btn-row .los-btn, .btn-row .los-btn-outline { flex: 1; padding: 14px; text-align: center; }
@media (max-width: 480px) {
  .option-grid { grid-template-columns: 1fr; }
  .signup-card { padding: 32px 20px; }
}
</style>
</head>
<body>
<div class="signup-page">
  <div class="signup-card animate-lift-in">
    <div class="signup-logo">Life OS</div>
    <div class="signup-subtitle">Start your journey to getting licensed. Tell us a bit about yourself.</div>

    <div class="step-indicator">
      <div class="step-dot active" id="dot0"></div>
      <div class="step-dot" id="dot1"></div>
      <div class="step-dot" id="dot2"></div>
    </div>

    <!-- Step 1: Basic Info -->
    <div class="form-step active" id="step0">
      <div class="step-title">Your Information</div>
      <div class="step-desc">Let's start with the basics.</div>
      <div>
        <label class="label" style="display:block;margin-bottom:6px;">Full Name *</label>
        <input type="text" class="los-input" id="f_name" placeholder="Your full name" required>
      </div>
      <div>
        <label class="label" style="display:block;margin-bottom:6px;">Email *</label>
        <input type="email" class="los-input" id="f_email" placeholder="your.email@example.com" required>
      </div>
      <div>
        <label class="label" style="display:block;margin-bottom:6px;">Phone</label>
        <input type="tel" class="los-input" id="f_phone" placeholder="(555) 000-0000">
      </div>
      <div>
        <label class="label" style="display:block;margin-bottom:6px;">State</label>
        <select class="los-select" id="f_state">
          <option value="">Select your state...</option>
          ${US_STATES.map(s => `<option value="${s}">${s}</option>`).join('\n          ')}
        </select>
      </div>
      <button class="los-btn" style="width:100%;padding:14px;" onclick="goStep(1)">Next</button>
    </div>

    <!-- Step 2: Experience & Motivation -->
    <div class="form-step" id="step1">
      <div class="step-title">Your Background</div>
      <div class="step-desc">This helps us tailor your onboarding experience.</div>

      <div>
        <label class="label" style="display:block;margin-bottom:8px;">Do you have sales experience?</label>
        <div class="option-grid" data-field="sales_experience">
          <div class="option-card" data-value="none" onclick="selectOption(this)">
            <div class="option-card-label">No experience</div>
            <div class="option-card-desc">I'm brand new to sales</div>
          </div>
          <div class="option-card" data-value="some" onclick="selectOption(this)">
            <div class="option-card-label">Some experience</div>
            <div class="option-card-desc">I've done some selling</div>
          </div>
          <div class="option-card" data-value="strong" onclick="selectOption(this)">
            <div class="option-card-label">Strong background</div>
            <div class="option-card-desc">Sales is my career</div>
          </div>
        </div>
      </div>

      <div>
        <label class="label" style="display:block;margin-bottom:8px;">Years in sales</label>
        <div class="option-grid" data-field="sales_years">
          <div class="option-card" data-value="0" onclick="selectOption(this)">0 years</div>
          <div class="option-card" data-value="1-2" onclick="selectOption(this)">1-2 years</div>
          <div class="option-card" data-value="3-5" onclick="selectOption(this)">3-5 years</div>
          <div class="option-card" data-value="5+" onclick="selectOption(this)">5+ years</div>
        </div>
      </div>

      <div>
        <label class="label" style="display:block;margin-bottom:6px;">Why do you want to get into life insurance?</label>
        <textarea class="los-input" id="f_why_insurance" rows="3" placeholder="What drew you to this opportunity?" style="resize:vertical;"></textarea>
      </div>

      <div>
        <label class="label" style="display:block;margin-bottom:8px;">First-year income goal</label>
        <div class="option-grid" data-field="income_goal">
          <div class="option-card" data-value="50k" onclick="selectOption(this)">$50k</div>
          <div class="option-card" data-value="75k" onclick="selectOption(this)">$75k</div>
          <div class="option-card" data-value="100k" onclick="selectOption(this)">$100k</div>
          <div class="option-card" data-value="150k+" onclick="selectOption(this)">$150k+</div>
        </div>
      </div>

      <div class="btn-row">
        <button class="los-btn-outline" onclick="goStep(0)">Back</button>
        <button class="los-btn" onclick="goStep(2)">Next</button>
      </div>
    </div>

    <!-- Step 3: Commitment & Readiness -->
    <div class="form-step" id="step2">
      <div class="step-title">Your Readiness</div>
      <div class="step-desc">Almost done — just a few more questions.</div>

      <div>
        <label class="label" style="display:block;margin-bottom:8px;">Hours per week you can commit</label>
        <div class="option-grid" data-field="hours_per_week">
          <div class="option-card" data-value="part_10" onclick="selectOption(this)">
            <div class="option-card-label">10 hrs/wk</div>
            <div class="option-card-desc">Part time</div>
          </div>
          <div class="option-card" data-value="part_20" onclick="selectOption(this)">
            <div class="option-card-label">20 hrs/wk</div>
            <div class="option-card-desc">Part time</div>
          </div>
          <div class="option-card" data-value="full_30" onclick="selectOption(this)">
            <div class="option-card-label">30 hrs/wk</div>
            <div class="option-card-desc">Near full time</div>
          </div>
          <div class="option-card" data-value="full_40+" onclick="selectOption(this)">
            <div class="option-card-label">40+ hrs/wk</div>
            <div class="option-card-desc">Full time</div>
          </div>
        </div>
      </div>

      <div>
        <label class="label" style="display:block;margin-bottom:8px;">Financial runway during ramp-up</label>
        <div class="option-grid" data-field="financial_runway">
          <div class="option-card" data-value="none" onclick="selectOption(this)">
            <div class="option-card-label">No savings</div>
            <div class="option-card-desc">Need income fast</div>
          </div>
          <div class="option-card" data-value="1_month" onclick="selectOption(this)">
            <div class="option-card-label">1 month</div>
            <div class="option-card-desc">Some buffer</div>
          </div>
          <div class="option-card" data-value="3_months" onclick="selectOption(this)">
            <div class="option-card-label">3 months</div>
            <div class="option-card-desc">Comfortable</div>
          </div>
          <div class="option-card" data-value="6_months+" onclick="selectOption(this)">
            <div class="option-card-label">6+ months</div>
            <div class="option-card-desc">Well prepared</div>
          </div>
        </div>
      </div>

      <div>
        <label class="label" style="display:block;margin-bottom:8px;">How coachable are you?</label>
        <div class="option-grid" data-field="coachability">
          <div class="option-card" data-value="low" onclick="selectOption(this)">
            <div class="option-card-label">I prefer my own way</div>
          </div>
          <div class="option-card" data-value="medium" onclick="selectOption(this)">
            <div class="option-card-label">Open to feedback</div>
          </div>
          <div class="option-card" data-value="high" onclick="selectOption(this)">
            <div class="option-card-label">Extremely coachable</div>
            <div class="option-card-desc">Ready to learn everything</div>
          </div>
        </div>
      </div>

      <div>
        <label class="label" style="display:block;margin-bottom:8px;">When can you start?</label>
        <div class="option-grid" data-field="start_timeline">
          <div class="option-card" data-value="asap" onclick="selectOption(this)">ASAP</div>
          <div class="option-card" data-value="2_weeks" onclick="selectOption(this)">In 2 weeks</div>
          <div class="option-card" data-value="1_month" onclick="selectOption(this)">In a month</div>
          <div class="option-card" data-value="not_sure" onclick="selectOption(this)">Not sure yet</div>
        </div>
      </div>

      <div class="btn-row">
        <button class="los-btn-outline" onclick="goStep(1)">Back</button>
        <button class="los-btn" id="submitBtn" onclick="submitForm()">Submit Application</button>
      </div>
      <div id="signupError" style="display:none;color:var(--color-clay);font-size:13px;text-align:center;"></div>
    </div>

    <!-- Success -->
    <div class="signup-success" id="successView">
      <h2>Welcome to the team!</h2>
      <p style="color:var(--color-sage-muted);margin-bottom:24px;">Your account has been created. Click below to access your licensing dashboard.</p>
      <a id="dashboardLink" href="#" class="los-btn" style="display:inline-block;text-decoration:none;padding:14px 32px;">Go to My Dashboard</a>
    </div>
  </div>
</div>
<script>
let currentStep = 0;
const qualData = {};

function selectOption(el) {
  const grid = el.parentElement;
  grid.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  const field = grid.dataset.field;
  qualData[field] = el.dataset.value;
}

function goStep(step) {
  // Validate step 0
  if (step > 0 && currentStep === 0) {
    if (!document.getElementById('f_name').value.trim()) { document.getElementById('f_name').focus(); return; }
    if (!document.getElementById('f_email').value.trim()) { document.getElementById('f_email').focus(); return; }
  }
  document.getElementById('step' + currentStep).classList.remove('active');
  document.getElementById('step' + step).classList.add('active');
  // Update dots
  for (let i = 0; i <= 2; i++) {
    const dot = document.getElementById('dot' + i);
    dot.className = 'step-dot' + (i === step ? ' active' : (i < step ? ' done' : ''));
  }
  currentStep = step;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function submitForm() {
  const btn = document.getElementById('submitBtn');
  btn.textContent = 'Creating account...';
  btn.disabled = true;
  const errEl = document.getElementById('signupError');
  errEl.style.display = 'none';

  const data = {
    name: document.getElementById('f_name').value.trim(),
    email: document.getElementById('f_email').value.trim(),
    phone: document.getElementById('f_phone').value.trim(),
    state: document.getElementById('f_state').value,
    qualification: {
      sales_experience: qualData.sales_experience || 'none',
      sales_years: qualData.sales_years || '0',
      why_insurance: document.getElementById('f_why_insurance').value.trim(),
      income_goal: qualData.income_goal || '50k',
      hours_per_week: qualData.hours_per_week || 'part_10',
      financial_runway: qualData.financial_runway || 'none',
      coachability: qualData.coachability || 'medium',
      start_timeline: qualData.start_timeline || 'not_sure',
    },
  };

  try {
    const res = await fetch('/api/recruit/signup', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.ok && json.token) {
      document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
      document.querySelector('.step-indicator').style.display = 'none';
      document.querySelector('.signup-subtitle').style.display = 'none';
      const successView = document.getElementById('successView');
      successView.style.display = 'block';
      document.getElementById('dashboardLink').href = '/r/' + json.token;
    } else {
      errEl.textContent = json.error || 'Something went wrong. Please try again.';
      errEl.style.display = 'block';
      btn.textContent = 'Submit Application';
      btn.disabled = false;
    }
  } catch {
    errEl.textContent = 'Network error. Please try again.';
    errEl.style.display = 'block';
    btn.textContent = 'Submit Application';
    btn.disabled = false;
  }
}
<\/script>
</body>
</html>`;
}

// ─── Recruit Dashboard (/r/:token) ─────────────────────────────────────────────

export function getRecruitDashboardHtml(recruit: Recruit, steps: RecruitStep[]): string {
  const completedKeys = new Set(steps.filter(s => s.completed).map(s => s.step_key));
  const totalSteps = steps.length;
  const completedCount = completedKeys.size;
  const pct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const phasesHtml = Object.entries(RECRUIT_PHASES).map(([phaseKey, phase], idx) => {
    const phaseSteps = phase.steps;
    const phaseDone = phaseSteps.filter(s => completedKeys.has(s.key)).length;
    const phaseComplete = phaseDone === phaseSteps.length;
    const isCurrentPhase = !phaseComplete && (idx === 0 || Object.values(RECRUIT_PHASES).slice(0, idx).every(
      p => p.steps.every(s => completedKeys.has(s.key))
    ));

    return `
    <div class="phase-section ${phaseComplete ? 'phase-done' : ''} ${isCurrentPhase ? 'phase-current' : ''}" data-phase="${phaseKey}">
      <div class="phase-header" onclick="togglePhase('${phaseKey}')">
        <div class="phase-header-left">
          <span class="phase-icon">${phaseComplete ? '\u2713' : (idx + 1)}</span>
          <span class="phase-title">${phase.label}</span>
        </div>
        <span class="phase-count">${phaseDone}/${phaseSteps.length}</span>
      </div>
      <div class="phase-body ${isCurrentPhase ? 'open' : ''}" id="phase-${phaseKey}">
        ${phaseSteps.map(step => {
          const done = completedKeys.has(step.key);
          const stepData = steps.find(s => s.step_key === step.key);
          const doneAt = stepData?.completed_at ? new Date(stepData.completed_at * 1000).toLocaleDateString() : '';
          return `
          <label class="step-item ${done ? 'step-done' : ''}">
            <input type="checkbox" ${done ? 'checked' : ''} onchange="toggleStep('${step.key}', this.checked)" class="step-checkbox">
            <span class="step-label">${step.label}</span>
            ${doneAt ? `<span class="step-date">${doneAt}</span>` : ''}
          </label>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>My Licensing Dashboard — Life OS</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet">
<style>
${sharedStyles()}
.dash-container { max-width: 720px; margin: 0 auto; padding: 32px 24px 120px; }
.dash-header { text-align: center; margin-bottom: 32px; }
.dash-header h1 { font-family: 'Lora', Georgia, serif; font-size: 28px; font-weight: 500; margin: 0 0 8px; color: var(--color-forest-deep); }
.dash-header p { font-size: 14px; color: var(--color-sage-muted); margin: 0; }

.progress-card {
  background: var(--color-paper); border: 1px solid var(--color-stone-50);
  border-radius: 16px; padding: 24px; margin-bottom: 24px;
  box-shadow: 0 1px 2px rgba(5,36,21,0.04);
}
.progress-label { font-size: 13px; color: var(--color-sage-muted); margin-bottom: 8px; display: flex; justify-content: space-between; }
.progress-bar { width: 100%; height: 12px; background: var(--color-stone-50); border-radius: 6px; overflow: hidden; }
.progress-bar-fill { height: 100%; border-radius: 6px; background: linear-gradient(90deg, var(--color-sage), var(--color-forest)); transition: width 0.5s ease; }

.phase-section {
  background: var(--color-paper); border: 1px solid var(--color-stone-50);
  border-radius: 16px; margin-bottom: 12px; overflow: hidden;
  box-shadow: 0 1px 2px rgba(5,36,21,0.04);
}
.phase-section.phase-current { border-color: var(--color-sage); box-shadow: 0 0 0 1px var(--color-sage), 0 2px 8px rgba(126,163,126,0.15); }
.phase-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; cursor: pointer; user-select: none;
  transition: background var(--transition-fast);
}
.phase-header:hover { background: rgba(5,36,21,0.02); }
.phase-header-left { display: flex; align-items: center; gap: 12px; }
.phase-icon {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--color-stone-50); color: var(--color-sage-muted);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; flex-shrink: 0;
}
.phase-done .phase-icon { background: var(--color-sage); color: white; }
.phase-current .phase-icon { background: var(--color-forest); color: white; }
.phase-title { font-size: 14px; font-weight: 600; color: var(--color-forest-deep); }
.phase-count { font-size: 12px; color: var(--color-sage-muted); font-weight: 600; }
.phase-body { display: none; padding: 0 20px 16px; }
.phase-body.open { display: block; }

.step-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 0; border-bottom: 1px solid var(--color-stone-50);
  cursor: pointer; font-size: 14px; color: var(--color-forest-deep);
}
.step-item:last-child { border-bottom: none; }
.step-item.step-done { color: var(--color-sage-muted); }
.step-item.step-done .step-label { text-decoration: line-through; }
.step-checkbox {
  width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0;
  accent-color: var(--color-forest);
}
.step-label { flex: 1; }
.step-date { font-size: 11px; color: var(--color-sage-muted); white-space: nowrap; }

@media (max-width: 640px) {
  .dash-container { padding: 20px 16px 120px; }
}
</style>
</head>
<body>
<div class="dash-container">
  <div class="dash-header animate-lift-in">
    <div style="font-family:'Lora',Georgia,serif;font-size:20px;font-style:italic;color:var(--color-forest-deep);margin-bottom:12px;">Life OS</div>
    <h1>Welcome, ${recruit.name.split(' ')[0]}!</h1>
    <p>Follow the steps below to get your life insurance license.</p>
  </div>

  <div class="progress-card animate-lift-in delay-1">
    <div class="progress-label">
      <span>Overall Progress</span>
      <span id="progressText">${completedCount}/${totalSteps} steps (${pct}%)</span>
    </div>
    <div class="progress-bar">
      <div class="progress-bar-fill" id="progressFill" style="width:${pct}%"></div>
    </div>
  </div>

  <div class="animate-lift-in delay-2">
    ${phasesHtml}
  </div>
</div>

<!-- AI Chat Widget -->
<button class="chat-fab" onclick="toggleChat()" id="chatFab" title="Ask about licensing">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
</button>
<div class="chat-panel" id="chatPanel">
  <div class="chat-panel-header">
    <div class="chat-panel-header-left">
      <span style="font-size:18px;">&#129302;</span>
      <span class="chat-panel-header-title">Licensing Assistant</span>
    </div>
    <button class="chat-panel-close" onclick="toggleChat()">&times;</button>
  </div>
  <div class="chat-panel-messages" id="chatMessages">
    <div class="chat-bubble chat-bubble-assistant">Hi ${recruit.name.split(' ')[0]}! I'm here to help you with your life insurance licensing process. Ask me anything!</div>
  </div>
  <div class="chat-panel-input-area">
    <input class="chat-panel-input" id="chatInput" placeholder="Ask about licensing..." onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChat();}">
    <button class="chat-panel-send" onclick="sendChat()">Send</button>
  </div>
</div>

<script>
const TOKEN = '${recruit.access_token}';

function togglePhase(key) {
  const el = document.getElementById('phase-' + key);
  el.classList.toggle('open');
}

async function toggleStep(stepKey, checked) {
  const res = await fetch('/api/recruit/' + TOKEN + '/step', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ stepKey, completed: checked }),
  }).then(r => r.json());

  if (res.newStage) {
    // Reload page to reflect new stage
    location.reload();
  } else {
    // Update progress bar
    refreshProgress();
  }
}

async function refreshProgress() {
  const res = await fetch('/api/recruit/' + TOKEN + '/steps').then(r => r.json());
  const steps = res.steps || [];
  const done = steps.filter(s => s.completed).length;
  const total = steps.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  document.getElementById('progressText').textContent = done + '/' + total + ' steps (' + pct + '%)';
  document.getElementById('progressFill').style.width = pct + '%';
}

// Chat
function toggleChat() {
  const panel = document.getElementById('chatPanel');
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    document.getElementById('chatInput').focus();
    if (!window._chatLoaded) {
      loadChatHistory();
      window._chatLoaded = true;
    }
  }
}

async function loadChatHistory() {
  try {
    const res = await fetch('/api/recruit/' + TOKEN + '/chat/history').then(r => r.json());
    const msgs = res.messages || [];
    if (msgs.length > 0) {
      const container = document.getElementById('chatMessages');
      container.innerHTML = '';
      msgs.forEach(m => addChatBubble(m.role, m.content));
    }
  } catch {}
}

function addChatBubble(role, text) {
  const container = document.getElementById('chatMessages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble chat-bubble-' + role;
  bubble.textContent = text;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

async function sendChat() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;
  input.value = '';

  addChatBubble('user', message);

  // Show typing indicator
  const typing = document.createElement('div');
  typing.className = 'chat-bubble chat-bubble-assistant chat-typing';
  typing.innerHTML = '<div class="chat-typing-dot"></div><div class="chat-typing-dot"></div><div class="chat-typing-dot"></div>';
  document.getElementById('chatMessages').appendChild(typing);

  try {
    const res = await fetch('/api/recruit/' + TOKEN + '/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ message }),
    }).then(r => r.json());
    typing.remove();
    addChatBubble('assistant', res.reply || res.error || 'Sorry, something went wrong.');
  } catch {
    typing.remove();
    addChatBubble('assistant', 'Sorry, I couldn\\'t connect. Please try again.');
  }
}
<\/script>
</body>
</html>`;
}

// ─── Page 4: Brand (hub) ────────────────────────────────────────────────────────

export function getLifeOSBrandHtml(authenticated = false): string {
  const body = `
  <div class="animate-lift-in">
    <h1 class="serif-display" style="font-size:28px;margin:0 0 6px;color:var(--color-forest-deep);">Brand</h1>
    <p style="font-size:14px;color:var(--color-sage-muted);margin:0 0 24px;">Click into a platform for its full insights dashboard.</p>
  </div>

  <div class="brand-hub-grid animate-lift-in delay-1" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px;">

    <a href="/brand/youtube" style="text-decoration:none;color:inherit;">
      <div class="card card-hover" style="margin-bottom:0;padding:24px;cursor:pointer;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;">
          <div style="width:44px;height:44px;border-radius:12px;background:#ff0000;display:flex;align-items:center;justify-content:center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:16px;font-weight:600;color:var(--color-forest-deep);">YouTube</div>
            <div style="font-size:11px;color:var(--color-sage-muted);margin-top:2px;" id="ytHubStatus">Loading&hellip;</div>
          </div>
        </div>
        <div style="display:flex;gap:20px;">
          <div>
            <div class="summary-stat-val" style="font-size:24px;" id="ytHubSubs">&mdash;</div>
            <div class="summary-stat-label" style="font-size:10px;">Subscribers</div>
          </div>
          <div>
            <div class="summary-stat-val" style="font-size:24px;" id="ytHubVideos">&mdash;</div>
            <div class="summary-stat-label" style="font-size:10px;">Videos</div>
          </div>
        </div>
        <div style="margin-top:16px;font-size:11px;color:var(--color-sage);">View insights &rarr;</div>
      </div>
    </a>

    <a href="/brand/instagram" style="text-decoration:none;color:inherit;">
      <div class="card card-hover" style="margin-bottom:0;padding:24px;cursor:pointer;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;">
          <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);display:flex;align-items:center;justify-content:center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.9" fill="#fff" stroke="none"/></svg>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:16px;font-weight:600;color:var(--color-forest-deep);">Instagram</div>
            <div style="font-size:11px;color:var(--color-sage-muted);margin-top:2px;" id="igHubStatus">Loading&hellip;</div>
          </div>
        </div>
        <div style="display:flex;gap:20px;">
          <div>
            <div class="summary-stat-val" style="font-size:24px;" id="igHubFollowers">&mdash;</div>
            <div class="summary-stat-label" style="font-size:10px;">Followers</div>
          </div>
          <div>
            <div class="summary-stat-val" style="font-size:24px;" id="igHubPosts">&mdash;</div>
            <div class="summary-stat-label" style="font-size:10px;">Posts</div>
          </div>
        </div>
        <div style="margin-top:16px;font-size:11px;color:var(--color-sage);">View insights &rarr;</div>
      </div>
    </a>

    <a href="/brand/linkedin" style="text-decoration:none;color:inherit;">
      <div class="card card-hover" style="margin-bottom:0;padding:24px;cursor:pointer;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;">
          <div style="width:44px;height:44px;border-radius:12px;background:#0a66c2;display:flex;align-items:center;justify-content:center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45z"/></svg>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:16px;font-weight:600;color:var(--color-forest-deep);">LinkedIn</div>
            <div style="font-size:11px;color:var(--color-sage-muted);margin-top:2px;">Not connected</div>
          </div>
        </div>
        <p style="font-size:12px;color:var(--color-sage-muted);margin:0 0 16px;line-height:1.5;">Analytics API is gated behind LinkedIn's Marketing Developer Platform.</p>
        <div style="font-size:11px;color:var(--color-sage);">View details &rarr;</div>
      </div>
    </a>

  </div>

  <style>
    @media (max-width: 768px) { .brand-hub-grid { grid-template-columns: 1fr !important; } }
  </style>

  <script>
  (function(){
    function fmt(n){ if(n>=1e6) return (n/1e6).toFixed(1)+'M'; if(n>=1e3) return (n/1e3).toFixed(1)+'K'; return String(n); }
    fetch('/api/brand/youtube', { credentials: 'include' })
      .then(function(r){ return r.json(); })
      .then(function(data){
        if (!data.ok) {
          document.getElementById('ytHubStatus').textContent = data.error === 'Unauthorized' ? 'Log in to view' : 'Unavailable';
          return;
        }
        var ch = data.channel || {};
        document.getElementById('ytHubStatus').textContent = ch.title || 'Connected';
        document.getElementById('ytHubSubs').textContent = fmt(ch.subscribers || 0);
        document.getElementById('ytHubVideos').textContent = fmt(ch.videoCount || 0);
      })
      .catch(function(){ document.getElementById('ytHubStatus').textContent = 'Network error'; });

    // Instagram hub card — uses the snapshot history endpoint first (fast), then
    // kicks off the full Apify fetch in the background to refresh numbers.
    function setIgCard(followers, posts, label) {
      document.getElementById('igHubStatus').textContent = label;
      document.getElementById('igHubFollowers').textContent = fmt(followers || 0);
      document.getElementById('igHubPosts').textContent = fmt(posts || 0);
    }
    fetch('/api/brand/instagram/history', { credentials: 'include' })
      .then(function(r){ return r.json(); })
      .then(function(hist){
        var snaps = (hist && hist.snapshots) || [];
        if (snaps.length) {
          var last = snaps[snaps.length - 1];
          setIgCard(last.followers, last.posts_count, '@' + (last.username || 'jacksonrapaport'));
        } else {
          document.getElementById('igHubStatus').textContent = 'Fetching&hellip;';
        }
        // Trigger a fresh pull so tomorrow's snapshot exists (runs in background, ~30s).
        fetch('/api/brand/instagram?limit=1', { credentials: 'include' })
          .then(function(r){ return r.json(); })
          .then(function(data){
            if (!data || !data.ok) return;
            var p = data.profile || {};
            setIgCard(p.followers, p.posts, '@' + (p.username || 'jacksonrapaport'));
          })
          .catch(function(){});
      })
      .catch(function(){ document.getElementById('igHubStatus').textContent = 'Network error'; });
  })();
  </script>`;

  return wrapPage('Brand', 'brand', body, authenticated);
}

// ─── Page 4a: Brand → YouTube ───────────────────────────────────────────────────

export function getLifeOSBrandYouTubeHtml(authenticated = false): string {
  const body = `
  <div class="animate-lift-in">
    <div style="font-size:12px;color:var(--color-sage-muted);margin-bottom:4px;">
      <a href="/brand" style="color:var(--color-sage);text-decoration:none;">&larr; Brand</a>
    </div>
    <h1 class="serif-display" style="font-size:28px;margin:0 0 6px;color:var(--color-forest-deep);">YouTube</h1>
    <p style="font-size:14px;color:var(--color-sage-muted);margin:0 0 24px;" id="ytChannelSubtitle">Loading channel&hellip;</p>
  </div>

  <!-- Channel header card -->
  <div class="card animate-lift-in delay-1" style="margin-bottom:24px;display:flex;align-items:center;gap:18px;padding:22px;">
    <img id="ytChannelThumb" src="" alt="" style="width:72px;height:72px;border-radius:50%;background:var(--color-stone-50);" />
    <div style="flex:1;min-width:0;">
      <div class="serif-display" id="ytChannelTitle" style="font-size:20px;color:var(--color-forest-deep);margin-bottom:4px;">&hellip;</div>
      <a id="ytChannelLink" href="https://youtube.com" target="_blank" rel="noopener" style="font-size:12px;color:var(--color-sage);text-decoration:none;">Open on YouTube &rarr;</a>
    </div>
  </div>

  <!-- KPI Row -->
  <div class="summary-bar animate-lift-in delay-2">
    <div class="summary-stat"><div class="summary-stat-val" id="ytKpiSubs">&mdash;</div><div class="summary-stat-label">Subscribers</div></div>
    <div class="summary-stat"><div class="summary-stat-val" id="ytKpiViews">&mdash;</div><div class="summary-stat-label">Total Views</div></div>
    <div class="summary-stat"><div class="summary-stat-val" id="ytKpiVideos">&mdash;</div><div class="summary-stat-label">Videos</div></div>
    <div class="summary-stat"><div class="summary-stat-val" id="ytKpiAvg">&mdash;</div><div class="summary-stat-label">Avg Views / Recent</div></div>
  </div>

  <div class="section-title animate-lift-in delay-3">Recent Videos</div>
  <div class="yt-video-grid animate-lift-in delay-3" id="ytVideoGrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:32px;">
    <div style="font-size:12px;color:var(--color-sage-muted);padding:14px;">Loading videos&hellip;</div>
  </div>

  <div class="section-title animate-lift-in delay-4">Subscriber Growth</div>
  <div class="card animate-lift-in delay-4" id="ytGrowthCard" style="padding:22px;margin-bottom:24px;">
    <div id="ytGrowthHeader" style="display:flex;align-items:baseline;gap:14px;margin-bottom:14px;flex-wrap:wrap;">
      <div class="summary-stat-val" style="font-size:28px;" id="ytGrowthLatest">&mdash;</div>
      <div class="summary-stat-label" style="font-size:11px;" id="ytGrowthDelta">Tracking will begin today.</div>
    </div>
    <div id="ytGrowthChart" style="width:100%;">
      <div style="font-size:12px;color:var(--color-sage-muted);padding:14px;">Loading&hellip;</div>
    </div>
    <div id="ytGrowthFootnote" style="font-size:11px;color:var(--color-sage-muted);margin-top:10px;"></div>
  </div>

  <div class="card animate-lift-in delay-5" style="text-align:center;padding:20px;">
    <a href="https://studio.youtube.com" target="_blank" rel="noopener" style="font-size:13px;font-weight:600;color:var(--color-sage);text-decoration:none;">Open YouTube Studio &rarr;</a>
  </div>


  <style>
    .yt-video-card { display:block; text-decoration:none; color:inherit; border-radius:14px; overflow:hidden; background:var(--color-cream-soft); transition:transform 0.15s ease, box-shadow 0.15s ease; }
    .yt-video-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(5,36,21,0.08); }
    .yt-video-thumb { width:100%; aspect-ratio:16/9; object-fit:cover; background:var(--color-stone-50); display:block; }
    .yt-video-meta { padding:12px 14px; }
    .yt-video-title { font-size:13px; font-weight:600; color:var(--color-forest-deep); line-height:1.35; margin-bottom:6px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .yt-video-stats { font-size:11px; color:var(--color-sage-muted); }
    @media (max-width: 900px) { .yt-video-grid { grid-template-columns:repeat(2,1fr) !important; } }
    @media (max-width: 560px) { .yt-video-grid { grid-template-columns:1fr !important; } }
  </style>

  <script>
  (function(){
    function fmt(n){ if(n>=1e6) return (n/1e6).toFixed(1)+'M'; if(n>=1e3) return (n/1e3).toFixed(1)+'K'; return String(n); }
    function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    function shortDate(iso){ try { var d=new Date(iso); return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); } catch (e) { return ''; } }
    function shortDateOnly(iso){ try { var d=new Date(iso+'T00:00:00'); return d.toLocaleDateString('en-US',{month:'short',day:'numeric'}); } catch (e) { return iso; } }

    function renderGrowth(snaps) {
      var chart = document.getElementById('ytGrowthChart');
      var latest = document.getElementById('ytGrowthLatest');
      var delta = document.getElementById('ytGrowthDelta');
      var foot = document.getElementById('ytGrowthFootnote');
      if (!chart) return;

      if (!snaps || snaps.length === 0) {
        chart.innerHTML = '<div style="font-size:12px;color:var(--color-sage-muted);padding:14px;text-align:center;">No snapshots yet. Reload the page once the channel above populates and today will be logged.</div>';
        return;
      }

      var last = snaps[snaps.length - 1];
      latest.textContent = fmt(last.subscribers) + ' subs';

      if (snaps.length === 1) {
        delta.textContent = 'First snapshot — ' + shortDateOnly(last.date) + '. Come back tomorrow for a line.';
      } else {
        var first = snaps[0];
        var diff = last.subscribers - first.subscribers;
        var sign = diff >= 0 ? '+' : '';
        delta.innerHTML = '<span style="color:' + (diff >= 0 ? 'var(--color-sage)' : 'var(--color-clay)') + ';">' + sign + fmt(diff) + '</span> since ' + shortDateOnly(first.date);
        foot.textContent = snaps.length + ' daily snapshots · newest ' + shortDateOnly(last.date);
      }

      var W = 800, H = 200, pad = 30;
      var min = Math.min.apply(null, snaps.map(function(s){ return s.subscribers; }));
      var max = Math.max.apply(null, snaps.map(function(s){ return s.subscribers; }));
      if (min === max) { min = min - 1; max = max + 1; }
      var xStep = snaps.length > 1 ? (W - pad * 2) / (snaps.length - 1) : 0;
      var yScale = (H - pad * 2) / (max - min);
      var pts = snaps.map(function(s, i){
        var x = snaps.length === 1 ? W / 2 : pad + i * xStep;
        var y = H - pad - (s.subscribers - min) * yScale;
        return { x: x, y: y, date: s.date, subs: s.subscribers };
      });
      var polyline = pts.map(function(p){ return p.x + ',' + p.y; }).join(' ');
      var area = 'M' + pts[0].x + ',' + (H - pad) + ' L' + pts.map(function(p){ return p.x + ',' + p.y; }).join(' L') + ' L' + pts[pts.length - 1].x + ',' + (H - pad) + ' Z';
      var dots = pts.map(function(p){
        return '<circle cx="' + p.x + '" cy="' + p.y + '" r="4" fill="var(--color-sage)" stroke="var(--color-cream)" stroke-width="2"><title>' + p.date + ' · ' + fmt(p.subs) + ' subs</title></circle>';
      }).join('');
      var yMaxLabel = '<text x="' + (pad - 6) + '" y="' + (pad + 4) + '" text-anchor="end" font-size="10" fill="var(--color-sage-muted)">' + fmt(max) + '</text>';
      var yMinLabel = '<text x="' + (pad - 6) + '" y="' + (H - pad + 4) + '" text-anchor="end" font-size="10" fill="var(--color-sage-muted)">' + fmt(min) + '</text>';
      var xStartLabel = '<text x="' + pad + '" y="' + (H - 8) + '" text-anchor="start" font-size="10" fill="var(--color-sage-muted)">' + shortDateOnly(snaps[0].date) + '</text>';
      var xEndLabel = snaps.length > 1 ? '<text x="' + (W - pad) + '" y="' + (H - 8) + '" text-anchor="end" font-size="10" fill="var(--color-sage-muted)">' + shortDateOnly(last.date) + '</text>' : '';

      chart.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block;" preserveAspectRatio="xMidYMid meet">' +
        '<path d="' + area + '" fill="var(--color-sage)" opacity="0.08" />' +
        (snaps.length > 1 ? '<polyline points="' + polyline + '" fill="none" stroke="var(--color-sage)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />' : '') +
        dots + yMaxLabel + yMinLabel + xStartLabel + xEndLabel +
        '</svg>';
    }

    fetch('/api/brand/youtube?limit=12', { credentials: 'include' })
      .then(function(r){ return r.json(); })
      .then(function(data){
        if (!data.ok) {
          var msg = data.error === 'Unauthorized' ? 'Log in to view YouTube data.' : ('YouTube error: ' + (data.error || 'unknown'));
          document.getElementById('ytChannelSubtitle').textContent = msg;
          document.getElementById('ytVideoGrid').innerHTML = '<div style="font-size:12px;color:var(--color-sage-muted);padding:14px;">' + msg + '</div>';
          document.getElementById('ytGrowthChart').innerHTML = '<div style="font-size:12px;color:var(--color-sage-muted);padding:14px;">' + msg + '</div>';
          return;
        }
        var ch = data.channel || {}; var vids = data.videos || [];
        document.getElementById('ytChannelThumb').src = ch.thumbnail || '';
        document.getElementById('ytChannelTitle').textContent = ch.title || 'Channel';
        document.getElementById('ytChannelSubtitle').textContent = 'Live channel data via YouTube Data API.';
        if (ch.id) document.getElementById('ytChannelLink').href = 'https://www.youtube.com/channel/' + ch.id;

        document.getElementById('ytKpiSubs').textContent = fmt(ch.subscribers || 0);
        document.getElementById('ytKpiViews').textContent = fmt(ch.totalViews || 0);
        document.getElementById('ytKpiVideos').textContent = fmt(ch.videoCount || 0);
        var avg = vids.length > 0 ? Math.round(vids.reduce(function(s,v){ return s + (v.views||0); },0) / vids.length) : 0;
        document.getElementById('ytKpiAvg').textContent = fmt(avg);

        if (vids.length === 0) {
          document.getElementById('ytVideoGrid').innerHTML = '<div style="font-size:12px;color:var(--color-sage-muted);padding:14px;grid-column:1/-1;">No public videos found.</div>';
        } else {
          document.getElementById('ytVideoGrid').innerHTML = vids.map(function(v){
            return '<a class="yt-video-card" href="https://www.youtube.com/watch?v=' + esc(v.id) + '" target="_blank" rel="noopener">' +
              '<img class="yt-video-thumb" src="' + esc(v.thumbnail) + '" alt="" />' +
              '<div class="yt-video-meta">' +
                '<div class="yt-video-title">' + esc(v.title) + '</div>' +
                '<div class="yt-video-stats">' + shortDate(v.publishedAt) + ' · ' + fmt(v.views||0) + ' views · ' + fmt(v.likes||0) + ' likes · ' + fmt(v.comments||0) + ' comments</div>' +
              '</div>' +
            '</a>';
          }).join('');
        }

        // Channel fetch done (snapshot saved). Now fetch history for the growth chart.
        return fetch('/api/brand/youtube/history', { credentials: 'include' })
          .then(function(r){ return r.json(); })
          .then(function(hist){ renderGrowth((hist && hist.snapshots) || []); });
      })
      .catch(function(err){
        document.getElementById('ytChannelSubtitle').textContent = 'Network error.';
        document.getElementById('ytVideoGrid').innerHTML = '<div style="font-size:12px;color:var(--color-sage-muted);padding:14px;">Network error.</div>';
        document.getElementById('ytGrowthChart').innerHTML = '<div style="font-size:12px;color:var(--color-sage-muted);padding:14px;">Network error.</div>';
      });
  })();
  </script>`;

  return wrapPage('YouTube', 'brand', body, authenticated);
}

// ─── Page 4b: Brand → Instagram (public data via Apify) ─────────────────────────

export function getLifeOSBrandInstagramHtml(authenticated = false): string {
  const body = `
  <div class="animate-lift-in">
    <div style="font-size:12px;color:var(--color-sage-muted);margin-bottom:4px;">
      <a href="/brand" style="color:var(--color-sage);text-decoration:none;">&larr; Brand</a>
    </div>
    <h1 class="serif-display" style="font-size:28px;margin:0 0 6px;color:var(--color-forest-deep);">Instagram</h1>
    <p style="font-size:14px;color:var(--color-sage-muted);margin:0 0 24px;" id="igSubtitle">Loading profile&hellip; (first load ~30s while Apify runs)</p>
  </div>

  <!-- Profile header card -->
  <div class="card animate-lift-in delay-1" style="margin-bottom:24px;display:flex;align-items:center;gap:18px;padding:22px;">
    <img id="igProfilePic" src="" alt="" style="width:72px;height:72px;border-radius:50%;background:var(--color-stone-50);object-fit:cover;" />
    <div style="flex:1;min-width:0;">
      <div class="serif-display" id="igProfileName" style="font-size:20px;color:var(--color-forest-deep);margin-bottom:4px;">&hellip;</div>
      <div id="igProfileBio" style="font-size:12px;color:var(--color-sage-muted);margin-bottom:6px;white-space:pre-wrap;line-height:1.4;max-width:640px;"></div>
      <a id="igProfileLink" href="https://www.instagram.com" target="_blank" rel="noopener" style="font-size:12px;color:var(--color-sage);text-decoration:none;">Open on Instagram &rarr;</a>
    </div>
  </div>

  <!-- KPI Row -->
  <div class="summary-bar animate-lift-in delay-2">
    <div class="summary-stat"><div class="summary-stat-val" id="igKpiFollowers">&mdash;</div><div class="summary-stat-label">Followers</div></div>
    <div class="summary-stat"><div class="summary-stat-val" id="igKpiFollowing">&mdash;</div><div class="summary-stat-label">Following</div></div>
    <div class="summary-stat"><div class="summary-stat-val" id="igKpiPosts">&mdash;</div><div class="summary-stat-label">Posts</div></div>
    <div class="summary-stat"><div class="summary-stat-val" id="igKpiEngage">&mdash;</div><div class="summary-stat-label">Avg Engage / Recent</div></div>
  </div>

  <div class="section-title animate-lift-in delay-3">Recent Posts</div>
  <div class="ig-post-grid animate-lift-in delay-3" id="igPostGrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:32px;">
    <div style="font-size:12px;color:var(--color-sage-muted);padding:14px;">Loading posts&hellip;</div>
  </div>

  <div class="section-title animate-lift-in delay-4">Follower Growth</div>
  <div class="card animate-lift-in delay-4" id="igGrowthCard" style="padding:22px;margin-bottom:24px;">
    <div id="igGrowthHeader" style="display:flex;align-items:baseline;gap:14px;margin-bottom:14px;flex-wrap:wrap;">
      <div class="summary-stat-val" style="font-size:28px;" id="igGrowthLatest">&mdash;</div>
      <div class="summary-stat-label" style="font-size:11px;" id="igGrowthDelta">Tracking will begin today.</div>
    </div>
    <div id="igGrowthChart" style="width:100%;">
      <div style="font-size:12px;color:var(--color-sage-muted);padding:14px;">Loading&hellip;</div>
    </div>
    <div id="igGrowthFootnote" style="font-size:11px;color:var(--color-sage-muted);margin-top:10px;"></div>
  </div>

  <div class="card animate-lift-in delay-5" style="text-align:center;padding:20px;">
    <a id="igOpenInsights" href="https://www.instagram.com/jacksonrapaport/" target="_blank" rel="noopener" style="font-size:13px;font-weight:600;color:var(--color-sage);text-decoration:none;">Open Instagram profile &rarr;</a>
  </div>

  <style>
    .ig-post-card { display:block; text-decoration:none; color:inherit; border-radius:14px; overflow:hidden; background:var(--color-cream-soft); transition:transform 0.15s ease, box-shadow 0.15s ease; position:relative; }
    .ig-post-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(5,36,21,0.08); }
    .ig-post-thumb { width:100%; aspect-ratio:1/1; object-fit:cover; background:var(--color-stone-50); display:block; }
    .ig-post-badge { position:absolute; top:8px; right:8px; background:rgba(5,36,21,0.75); color:#fff; font-size:10px; font-weight:600; padding:3px 8px; border-radius:999px; letter-spacing:0.02em; }
    .ig-post-meta { padding:12px 14px; }
    .ig-post-caption { font-size:13px; font-weight:500; color:var(--color-forest-deep); line-height:1.35; margin-bottom:6px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .ig-post-stats { font-size:11px; color:var(--color-sage-muted); }
    @media (max-width: 900px) { .ig-post-grid { grid-template-columns:repeat(2,1fr) !important; } }
    @media (max-width: 560px) { .ig-post-grid { grid-template-columns:1fr !important; } }
  </style>

  <script>
  (function(){
    function fmt(n){ if(n>=1e6) return (n/1e6).toFixed(1)+'M'; if(n>=1e3) return (n/1e3).toFixed(1)+'K'; return String(n); }
    function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    function shortDate(iso){ try { var d=new Date(iso); return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); } catch (e) { return ''; } }
    function shortDateOnly(iso){ try { var d=new Date(iso+'T00:00:00'); return d.toLocaleDateString('en-US',{month:'short',day:'numeric'}); } catch (e) { return iso; } }

    function renderGrowth(snaps) {
      var chart = document.getElementById('igGrowthChart');
      var latest = document.getElementById('igGrowthLatest');
      var delta = document.getElementById('igGrowthDelta');
      var foot = document.getElementById('igGrowthFootnote');
      if (!chart) return;

      if (!snaps || snaps.length === 0) {
        chart.innerHTML = '<div style="font-size:12px;color:var(--color-sage-muted);padding:14px;text-align:center;">No snapshots yet. Reload the page once the profile above populates and today will be logged.</div>';
        return;
      }

      var last = snaps[snaps.length - 1];
      latest.textContent = fmt(last.followers) + ' followers';

      if (snaps.length === 1) {
        delta.textContent = 'First snapshot — ' + shortDateOnly(last.date) + '. Come back tomorrow for a line.';
      } else {
        var first = snaps[0];
        var diff = last.followers - first.followers;
        var sign = diff >= 0 ? '+' : '';
        delta.innerHTML = '<span style="color:' + (diff >= 0 ? 'var(--color-sage)' : 'var(--color-clay)') + ';">' + sign + fmt(diff) + '</span> since ' + shortDateOnly(first.date);
        foot.textContent = snaps.length + ' daily snapshots · newest ' + shortDateOnly(last.date);
      }

      var W = 800, H = 200, pad = 30;
      var min = Math.min.apply(null, snaps.map(function(s){ return s.followers; }));
      var max = Math.max.apply(null, snaps.map(function(s){ return s.followers; }));
      if (min === max) { min = min - 1; max = max + 1; }
      var xStep = snaps.length > 1 ? (W - pad * 2) / (snaps.length - 1) : 0;
      var yScale = (H - pad * 2) / (max - min);
      var pts = snaps.map(function(s, i){
        var x = snaps.length === 1 ? W / 2 : pad + i * xStep;
        var y = H - pad - (s.followers - min) * yScale;
        return { x: x, y: y, date: s.date, followers: s.followers };
      });
      var polyline = pts.map(function(p){ return p.x + ',' + p.y; }).join(' ');
      var area = 'M' + pts[0].x + ',' + (H - pad) + ' L' + pts.map(function(p){ return p.x + ',' + p.y; }).join(' L') + ' L' + pts[pts.length - 1].x + ',' + (H - pad) + ' Z';
      var dots = pts.map(function(p){
        return '<circle cx="' + p.x + '" cy="' + p.y + '" r="4" fill="var(--color-sage)" stroke="var(--color-cream)" stroke-width="2"><title>' + p.date + ' · ' + fmt(p.followers) + ' followers</title></circle>';
      }).join('');
      var yMaxLabel = '<text x="' + (pad - 6) + '" y="' + (pad + 4) + '" text-anchor="end" font-size="10" fill="var(--color-sage-muted)">' + fmt(max) + '</text>';
      var yMinLabel = '<text x="' + (pad - 6) + '" y="' + (H - pad + 4) + '" text-anchor="end" font-size="10" fill="var(--color-sage-muted)">' + fmt(min) + '</text>';
      var xStartLabel = '<text x="' + pad + '" y="' + (H - 8) + '" text-anchor="start" font-size="10" fill="var(--color-sage-muted)">' + shortDateOnly(snaps[0].date) + '</text>';
      var xEndLabel = snaps.length > 1 ? '<text x="' + (W - pad) + '" y="' + (H - 8) + '" text-anchor="end" font-size="10" fill="var(--color-sage-muted)">' + shortDateOnly(last.date) + '</text>' : '';

      chart.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block;" preserveAspectRatio="xMidYMid meet">' +
        '<path d="' + area + '" fill="var(--color-sage)" opacity="0.08" />' +
        (snaps.length > 1 ? '<polyline points="' + polyline + '" fill="none" stroke="var(--color-sage)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />' : '') +
        dots + yMaxLabel + yMinLabel + xStartLabel + xEndLabel +
        '</svg>';
    }

    fetch('/api/brand/instagram?limit=12', { credentials: 'include' })
      .then(function(r){ return r.json(); })
      .then(function(data){
        if (!data.ok) {
          var msg = data.error === 'Unauthorized' ? 'Log in to view Instagram data.' : ('Instagram error: ' + (data.error || 'unknown'));
          document.getElementById('igSubtitle').textContent = msg;
          document.getElementById('igPostGrid').innerHTML = '<div style="font-size:12px;color:var(--color-sage-muted);padding:14px;">' + msg + '</div>';
          document.getElementById('igGrowthChart').innerHTML = '<div style="font-size:12px;color:var(--color-sage-muted);padding:14px;">' + msg + '</div>';
          return;
        }
        var p = data.profile || {}; var posts = data.posts || [];
        document.getElementById('igProfilePic').src = p.profilePic || '';
        document.getElementById('igProfileName').textContent = (p.fullName || p.username || '@' + (p.username || 'instagram')) + (p.verified ? ' ✓' : '');
        document.getElementById('igProfileBio').textContent = p.biography || '';
        document.getElementById('igSubtitle').textContent = 'Live profile data via Apify — public metrics, refreshes every 30 min.';
        if (p.username) {
          var url = 'https://www.instagram.com/' + p.username + '/';
          document.getElementById('igProfileLink').href = url;
          document.getElementById('igOpenInsights').href = url;
        }

        document.getElementById('igKpiFollowers').textContent = fmt(p.followers || 0);
        document.getElementById('igKpiFollowing').textContent = fmt(p.following || 0);
        document.getElementById('igKpiPosts').textContent = fmt(p.posts || 0);
        var eng = posts.length > 0 ? Math.round(posts.reduce(function(s,v){ return s + (v.likes||0) + (v.comments||0); },0) / posts.length) : 0;
        document.getElementById('igKpiEngage').textContent = fmt(eng);

        if (posts.length === 0) {
          document.getElementById('igPostGrid').innerHTML = '<div style="font-size:12px;color:var(--color-sage-muted);padding:14px;grid-column:1/-1;">No public posts found.</div>';
        } else {
          document.getElementById('igPostGrid').innerHTML = posts.map(function(v){
            var badge = v.type && v.type !== 'Image' ? '<div class="ig-post-badge">' + esc(v.type) + '</div>' : '';
            var caption = (v.caption || '').split('\\n')[0].slice(0, 100);
            var stats = fmt(v.likes||0) + ' likes · ' + fmt(v.comments||0) + ' comments';
            if (v.views) stats += ' · ' + fmt(v.views) + ' views';
            return '<a class="ig-post-card" href="' + esc(v.url) + '" target="_blank" rel="noopener">' +
              '<img class="ig-post-thumb" src="' + esc(v.thumbnail) + '" alt="" referrerpolicy="no-referrer" />' +
              badge +
              '<div class="ig-post-meta">' +
                '<div class="ig-post-caption">' + (caption ? esc(caption) : '<em style="color:var(--color-sage-muted);font-weight:400;">(no caption)</em>') + '</div>' +
                '<div class="ig-post-stats">' + shortDate(v.timestamp) + ' · ' + stats + '</div>' +
              '</div>' +
            '</a>';
          }).join('');
        }

        return fetch('/api/brand/instagram/history', { credentials: 'include' })
          .then(function(r){ return r.json(); })
          .then(function(hist){ renderGrowth((hist && hist.snapshots) || []); });
      })
      .catch(function(err){
        document.getElementById('igSubtitle').textContent = 'Network error.';
        document.getElementById('igPostGrid').innerHTML = '<div style="font-size:12px;color:var(--color-sage-muted);padding:14px;">Network error.</div>';
        document.getElementById('igGrowthChart').innerHTML = '<div style="font-size:12px;color:var(--color-sage-muted);padding:14px;">Network error.</div>';
      });
  })();
  </script>`;

  return wrapPage('Instagram', 'brand', body, authenticated);
}

// ─── Page 4c: Brand → LinkedIn (not connected) ──────────────────────────────────

export function getLifeOSBrandLinkedInHtml(authenticated = false): string {
  const body = `
  <div class="animate-lift-in">
    <div style="font-size:12px;color:var(--color-sage-muted);margin-bottom:4px;">
      <a href="/brand" style="color:var(--color-sage);text-decoration:none;">&larr; Brand</a>
    </div>
    <h1 class="serif-display" style="font-size:28px;margin:0 0 6px;color:var(--color-forest-deep);">LinkedIn</h1>
    <p style="font-size:14px;color:var(--color-sage-muted);margin:0 0 24px;">Not yet connected.</p>
  </div>

  <div class="card animate-lift-in delay-1" style="padding:32px;text-align:center;">
    <div style="width:64px;height:64px;border-radius:16px;background:#0a66c2;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45z"/></svg>
    </div>
    <div class="serif-display" style="font-size:20px;color:var(--color-forest-deep);margin-bottom:10px;">LinkedIn analytics not available yet</div>
    <p style="font-size:13px;color:var(--color-sage-muted);max-width:520px;margin:0 auto 20px;line-height:1.6;">LinkedIn gates its analytics API behind the Marketing Developer Platform, which is hard to get approved for as an individual. Realistic workarounds: scrape your own dashboard, or pull via a third-party aggregator.</p>
    <a href="https://www.linkedin.com/analytics/creator/content/" target="_blank" rel="noopener" style="display:inline-block;padding:10px 20px;border-radius:10px;background:var(--color-sage);color:var(--color-paper);font-size:13px;font-weight:600;text-decoration:none;">Open LinkedIn analytics &rarr;</a>
  </div>`;

  return wrapPage('LinkedIn', 'brand', body, authenticated);
}


// ─── Page 5: Personal ───────────────────────────────────────────────────────────

export function getLifeOSPersonalHtml(authenticated = false): string {
  const body = `
  <div class="animate-lift-in">
    <h1 class="serif-display" style="font-size:28px;margin:0 0 6px;color:var(--color-forest-deep);">Personal</h1>
    <p style="font-size:14px;color:var(--color-sage-muted);margin:0 0 24px;">Net worth, spending, and budgets.</p>
  </div>

  <!-- KPI Row -->
  <div class="summary-bar animate-lift-in delay-1">
    <div class="summary-stat">
      <div class="summary-stat-val" style="color:var(--color-sage);">$284,500</div>
      <div class="summary-stat-label">Net Worth</div>
    </div>
    <div class="summary-stat">
      <div class="summary-stat-val">$6,240</div>
      <div class="summary-stat-label">Monthly Spending</div>
    </div>
    <div class="summary-stat">
      <div class="summary-stat-val" style="color:var(--color-sage);">$18,500</div>
      <div class="summary-stat-label">Monthly Income</div>
    </div>
    <div class="summary-stat">
      <div class="summary-stat-val" style="color:var(--color-forest);">34%</div>
      <div class="summary-stat-label">Savings Rate</div>
    </div>
  </div>

  <div class="personal-cols animate-lift-in delay-2" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px;">

    <!-- Spending by Category -->
    <div class="card" style="margin-bottom:0;">
      <div class="section-title" style="margin-bottom:18px;">Spending by Category</div>
      ${[
        ['Housing', 2100, 34, 'var(--color-forest)'],
        ['Food', 980, 16, 'var(--color-sage)'],
        ['Insurance', 450, 7, 'var(--color-slate)'],
        ['Transportation', 380, 6, 'var(--color-orange)'],
        ['Entertainment', 220, 4, 'var(--color-gold)'],
        ['Subscriptions', 180, 3, 'var(--color-clay)'],
        ['Other', 1930, 31, 'var(--color-sage-muted)'],
      ].map(([cat, amt, pct, color]) => `
      <div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
          <span style="font-size:13px;color:var(--color-forest-deep);">${cat}</span>
          <span style="font-size:13px;color:var(--color-forest-deep);font-weight:600;">$${(amt as number).toLocaleString()} <span style="color:var(--color-sage-muted);font-weight:400;font-size:11px;">(${pct}%)</span></span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%;background:${color};"></div>
        </div>
      </div>`).join('')}
    </div>

    <!-- Budget vs Actual -->
    <div class="card" style="margin-bottom:0;">
      <div class="section-title" style="margin-bottom:18px;">Budget vs Actual</div>
      ${[
        ['Food', 980, 800, true],
        ['Housing', 2100, 2200, false],
        ['Entertainment', 220, 300, false],
        ['Transport', 380, 400, false],
      ].map(([cat, actual, budget, over]) => {
        const pct = Math.min(Math.round(((actual as number) / (budget as number)) * 100), 100);
        const color = over ? 'var(--color-clay)' : 'var(--color-sage)';
        return `
      <div style="margin-bottom:18px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
          <span style="font-size:13px;color:var(--color-forest-deep);">${cat}</span>
          <span style="font-size:13px;font-weight:600;color:${color};">$${(actual as number).toLocaleString()} / $${(budget as number).toLocaleString()}</span>
        </div>
        <div class="progress-track" style="height:10px;">
          <div class="progress-fill" style="width:${pct}%;background:${color};"></div>
        </div>
        <div style="font-size:10px;color:${over ? 'var(--color-clay)' : 'var(--color-sage-muted)'};margin-top:3px;font-weight:500;">${over ? 'Over budget' : 'Under budget'}</div>
      </div>`;
      }).join('')}
    </div>

  </div>
  <style>
    @media (max-width: 768px) {
      .personal-cols { grid-template-columns: 1fr !important; }
    }
  </style>

  <!-- Recent Transactions -->
  <div class="section-title animate-lift-in delay-3">Recent Transactions</div>
  <div class="card animate-lift-in delay-3" style="padding:0;overflow:hidden;overflow-x:auto;">
    <table class="los-table">
      <thead>
        <tr><th>Date</th><th>Description</th><th>Category</th><th style="text-align:right;">Amount</th></tr>
      </thead>
      <tbody>
        <tr><td style="color:var(--color-sage-muted);white-space:nowrap;">Apr 23</td><td style="font-weight:500;">Whole Foods Market</td><td>Food</td><td style="text-align:right;color:var(--color-clay);font-weight:500;">-$127.43</td></tr>
        <tr><td style="color:var(--color-sage-muted);white-space:nowrap;">Apr 22</td><td style="font-weight:500;">Shell Gas Station</td><td>Transportation</td><td style="text-align:right;color:var(--color-clay);font-weight:500;">-$58.20</td></tr>
        <tr><td style="color:var(--color-sage-muted);white-space:nowrap;">Apr 22</td><td style="font-weight:500;">Netflix</td><td>Subscriptions</td><td style="text-align:right;color:var(--color-clay);font-weight:500;">-$15.99</td></tr>
        <tr><td style="color:var(--color-sage-muted);white-space:nowrap;">Apr 21</td><td style="font-weight:500;">Mutual of Omaha — Commission</td><td>Income</td><td style="text-align:right;color:var(--color-sage);font-weight:500;">+$3,240.00</td></tr>
        <tr><td style="color:var(--color-sage-muted);white-space:nowrap;">Apr 21</td><td style="font-weight:500;">Amazon</td><td>Other</td><td style="text-align:right;color:var(--color-clay);font-weight:500;">-$89.99</td></tr>
        <tr><td style="color:var(--color-sage-muted);white-space:nowrap;">Apr 20</td><td style="font-weight:500;">Chipotle</td><td>Food</td><td style="text-align:right;color:var(--color-clay);font-weight:500;">-$14.52</td></tr>
        <tr><td style="color:var(--color-sage-muted);white-space:nowrap;">Apr 19</td><td style="font-weight:500;">AT&T Wireless</td><td>Subscriptions</td><td style="text-align:right;color:var(--color-clay);font-weight:500;">-$85.00</td></tr>
        <tr><td style="color:var(--color-sage-muted);white-space:nowrap;">Apr 18</td><td style="font-weight:500;">State Farm — Auto Insurance</td><td>Insurance</td><td style="text-align:right;color:var(--color-clay);font-weight:500;">-$142.00</td></tr>
        <tr><td style="color:var(--color-sage-muted);white-space:nowrap;">Apr 17</td><td style="font-weight:500;">Aetna — Commission</td><td>Income</td><td style="text-align:right;color:var(--color-sage);font-weight:500;">+$1,890.00</td></tr>
        <tr><td style="color:var(--color-sage-muted);white-space:nowrap;">Apr 16</td><td style="font-weight:500;">Topgolf</td><td>Entertainment</td><td style="text-align:right;color:var(--color-clay);font-weight:500;">-$72.00</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Connect Banner -->
  <div class="card animate-lift-in delay-4" style="text-align:center;padding:28px;opacity:0.7;margin-top:8px;">
    <div style="font-size:14px;font-weight:600;color:var(--color-sage-muted);margin-bottom:4px;">Connect to Monarch Money</div>
    <p style="font-size:12px;color:var(--color-sage-muted);margin:0;">Link your Monarch Money account for real-time transaction and budget data.</p>
  </div>`;

  return wrapPage('Personal', 'personal', body, authenticated);
}

// ─── Page 6: Agents ─────────────────────────────────────────────────────────────

export function getLifeOSAgentsHtml(authenticated = false): string {
  const body = `
  <div class="animate-lift-in">
    <h1 class="serif-display" style="font-size:28px;margin:0 0 6px;color:var(--color-forest-deep);">Org Chart</h1>
    <p style="font-size:14px;color:var(--color-sage-muted);margin:0 0 24px;">Your AI team. Click any card to chat.</p>
  </div>

  <div id="org-chart" class="animate-lift-in">
    <div class="text-center" style="padding:20px;color:var(--color-sage-muted);">Loading org chart...</div>
  </div>

  <style>
    /* Classic CSS tree: ::before / ::after on each li draw the horizontal
       bar; the ul above each group draws a vertical stub. First/last child
       trim the bar on the outer side so the corners look clean. */
    .tree { padding: 10px 0 40px; overflow-x: auto; }
    .tree, .tree ul, .tree li { margin: 0; padding: 0; list-style: none; }
    .tree .root { display: flex; justify-content: center; }
    .tree ul {
      display: flex;
      justify-content: center;
      padding-top: 36px;
      position: relative;
      flex-wrap: nowrap;
    }
    .tree ul::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      width: 2px;
      height: 18px;
      background: var(--color-stone-50);
    }
    .tree li {
      padding: 18px 12px 0 12px;
      position: relative;
      text-align: center;
    }
    .tree li::before, .tree li::after {
      content: '';
      position: absolute;
      top: 0;
      height: 18px;
      width: 50%;
      border-top: 2px solid var(--color-stone-50);
    }
    .tree li::before { right: 50%; }
    .tree li::after  { left: 50%; }
    .tree li:only-child::before, .tree li:only-child::after { display: none; }
    .tree li:only-child { padding-top: 18px; }
    .tree li:first-child::before { border: 0; }
    .tree li:last-child::after  { border: 0; }
    .tree li:last-child::before {
      border-right: 2px solid var(--color-stone-50);
      border-top-right-radius: 6px;
    }
    .tree li:first-child::after {
      border-left: 2px solid var(--color-stone-50);
      border-top-left-radius: 6px;
    }
    /* Vertical stub from a leaf down to its (optional) card wrapper. */
    .tree .dept-wrap {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .tree .dept-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.3px;
      font-weight: 700;
      color: var(--color-sage-muted);
      padding: 4px 10px;
      background: var(--color-paper);
      border: 1px solid var(--color-stone-50);
      border-radius: 999px;
    }
    .org-card {
      display: inline-block;
      width: 200px;
      padding: 14px;
      background: #fff;
      border: 1px solid var(--color-stone-50);
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      cursor: pointer;
      text-align: left;
      transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
    }
    .org-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: var(--color-sage); }
    .org-card.ceo { background: var(--color-forest); color: var(--color-cream); border: 0; width: 240px; }
    .org-card.cos { background: var(--color-forest-deep); color: var(--color-cream); border: 0; width: 220px; }
    .org-card.offline { opacity: 0.45; cursor: default; }
    .org-card.offline:hover { transform: none; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border-color: var(--color-stone-50); }
    .org-card-head { display:flex; align-items:center; gap:10px; }
    .org-avatar { width:36px; height:36px; border-radius:10px; background:rgba(126,163,126,0.15); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; color:#09321f; flex-shrink:0; }
    .org-card.ceo .org-avatar, .org-card.cos .org-avatar { background: rgba(245,239,233,0.15); color: var(--color-cream); }
    .org-name { font-size: 14px; font-weight: 600; }
    .org-role { font-size: 11px; opacity: 0.7; margin-top: 2px; }
    .org-stats { font-size: 10px; color: var(--color-sage-muted); margin-top: 10px; display:flex; justify-content:space-between; align-items:center; }
    .org-card.ceo .org-stats, .org-card.cos .org-stats { color: rgba(245,239,233,0.65); }
    .org-dot { width:6px; height:6px; border-radius:50%; display:inline-block; margin-right:4px; vertical-align:middle; }
    .org-dot-on { background:#22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.5); }
    .org-dot-off { background:#9ca3af; }
    @media (max-width: 768px) {
      .tree li { padding: 18px 6px 0 6px; }
      .org-card { width: 160px; }
      .org-card.ceo { width: 200px; }
      .org-card.cos { width: 180px; }
    }
  </style>

  <script>
  // Agent id -> department label.
  // Unmapped agents fall under "Other". Ordered so departments render
  // left-to-right the way Jackson thinks about them.
  var DEPT_MAP = {
    baba: 'Engineering',
    engineering: 'Engineering',
    blake: 'Content',
    content: 'Content',
    cleo: 'Content',
    quilly: 'Content',
    buck: 'Research',
    research: 'Research',
    scan: 'Research',
    sam: 'Research',
    blaze: 'Recruiting',
    comms: 'Communications',
    ops: 'Operations',
    ali: 'Operations',
    ovi: 'Operations',
    larry: 'Legal'
  };
  var DEPT_ORDER = ['Engineering', 'Content', 'Research', 'Recruiting', 'Communications', 'Operations', 'Legal', 'Other'];

  function deptFor(agentId) { return DEPT_MAP[agentId] || 'Other'; }
  function deptRoleFor(a) {
    return (a.description || '').split(/--|—|-|,|\\./)[0].trim().slice(0, 60) || deptFor(a.id);
  }

  async function loadAgentsPage() {
    var container = document.getElementById('org-chart');
    try {
      var res = await fetch('/api/agents', { credentials: 'same-origin' });
      var data = await res.json();
      var agents = (data.agents || []).filter(function(a) { return a.id !== 'main'; });

      var gurt = agents.find(function(a) { return a.id === 'gurt'; });
      var rest = agents.filter(function(a) { return a.id !== 'gurt'; });

      var byDept = {};
      rest.forEach(function(a) {
        var d = deptFor(a.id);
        if (!byDept[d]) byDept[d] = [];
        byDept[d].push(a);
      });

      var depts = Object.keys(byDept).sort(function(x, y) {
        var xi = DEPT_ORDER.indexOf(x); var yi = DEPT_ORDER.indexOf(y);
        if (xi === -1 && yi === -1) return x.localeCompare(y);
        if (xi === -1) return 1;
        if (yi === -1) return -1;
        return xi - yi;
      });

      // Build the tree:
      //   Jackson (root)
      //     └─ Gurt (if live)
      //         ├─ Engineering dept-wrap > [card]
      //         ├─ Content dept-wrap > [card]
      //         └─ ...
      var jacksonCard =
        '<div class="org-card ceo">' +
          '<div class="org-card-head">' +
            '<div class="org-avatar">J</div>' +
            '<div><div class="org-name">Jackson</div><div class="org-role">Founder / CEO</div></div>' +
          '</div>' +
        '</div>';

      var deptLeaves = depts.map(function(d) {
        var cards = byDept[d].map(function(a) { return cardHtml(a); }).join('');
        return '<li>' +
            '<div class="dept-wrap">' +
              '<span class="dept-title">' + d + '</span>' +
              cards +
            '</div>' +
          '</li>';
      }).join('');

      var gurtBranch = '';
      if (gurt) {
        gurtBranch =
          '<ul>' +
            '<li>' +
              cardHtml(gurt, 'cos', 'Chief of Staff') +
              (deptLeaves ? '<ul>' + deptLeaves + '</ul>' : '') +
            '</li>' +
          '</ul>';
      } else if (deptLeaves) {
        // No Gurt online: hang departments directly under Jackson
        gurtBranch = '<ul>' + deptLeaves + '</ul>';
      }

      container.innerHTML =
        '<div class="tree">' +
          '<div class="root">' +
            '<div style="text-align:center;display:inline-block;">' +
              jacksonCard +
              gurtBranch +
            '</div>' +
          '</div>' +
        '</div>';
    } catch (e) {
      console.error('Org chart load failed:', e);
      container.innerHTML = '<div style="color:var(--color-clay);padding:20px;">Failed to load agents. ' + (e.message || '') + '</div>';
    }
  }

  function cardHtml(a, cls, roleOverride) {
    var initial = (a.name || a.id).charAt(0).toUpperCase();
    var cost = (a.todayCost || 0).toFixed(2);
    var turns = a.todayTurns || 0;
    var role = roleOverride || deptRoleFor(a);
    var offline = !a.running ? ' offline' : '';
    var dotCls = a.running ? 'org-dot-on' : 'org-dot-off';
    var statusTxt = a.running ? 'Live' : 'Offline';
    var onClick = a.running ? (' onclick="openAgentInBubble(\\'' + a.id + '\\')"') : '';
    var cardCls = 'org-card ' + (cls === 'cos' ? 'cos' : cls === 'ceo' ? 'ceo' : '') + offline;
    return '<div class="' + cardCls + '"' + onClick + '>' +
      '<div class="org-card-head">' +
        '<div class="org-avatar">' + initial + '</div>' +
        '<div><div class="org-name">' + (a.name || a.id) + '</div><div class="org-role">' + role + '</div></div>' +
      '</div>' +
      '<div class="org-stats">' +
        '<span><span class="org-dot ' + dotCls + '"></span>' + statusTxt + '</span>' +
        '<span>' + turns + ' turns &middot; $' + cost + '</span>' +
      '</div>' +
    '</div>';
  }

  // Pick the agent in the chat bubble dropdown and open the panel.
  function openAgentInBubble(agentId) {
    var select = document.getElementById('chatPanelAgent');
    if (select) {
      select.value = agentId;
      if (typeof onChatPanelAgentChange === 'function') onChatPanelAgentChange();
    }
    var panel = document.getElementById('chatPanel');
    if (panel && !panel.classList.contains('open')) {
      if (typeof toggleChatPanel === 'function') toggleChatPanel();
    }
    var input = document.getElementById('chatPanelInput');
    if (input) input.focus();
  }

  fetch('/api/auth-check', { credentials: 'same-origin' })
    .then(function(r) { return r.json(); })
    .then(function(d) { if (d.authenticated) loadAgentsPage(); });
  window.addEventListener('rawclaw-authenticated', function() { loadAgentsPage(); });
  </script>`;

  return wrapPage('Agents', 'agents', body, authenticated);
}
