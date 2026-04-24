/* ============================================
   沟通辅助模块 - 情绪/需求表达支持
   ============================================ */

const Communication = {
  selectedEmotion: null,
  selectedNeed: null,

  // ---- 初始化 ----
  init() {
    this.renderEmotions();
    this.renderNeeds();
  },

  // ---- 渲染情绪选择 ----
  renderEmotions() {
    const emotions = App.getEmotions();
    const grid = document.getElementById('emotionGrid');
    if (!grid) return;

    grid.innerHTML = emotions.map(em => `
      <div class="emotion-card" onclick="Communication.selectEmotion('${em.id}')" id="emotion-${em.id}">
        <span class="emoji">${em.emoji}</span>
        <span class="emotion-label">${em.label}</span>
      </div>
    `).join('');
  },

  // ---- 渲染需求选择 ----
  renderNeeds() {
    const needs = App.getNeeds();
    const grid = document.getElementById('needsGrid');
    if (!grid) return;

    grid.innerHTML = needs.map(need => `
      <div class="need-card" onclick="Communication.selectNeed('${need.id}')" id="need-${need.id}">
        <span class="need-icon">${need.icon}</span>
        <span class="need-label">${need.label}</span>
      </div>
    `).join('');
  },

  // ---- 选择情绪 ----
  selectEmotion(id) {
    const emotions = App.getEmotions();
    const emotion = emotions.find(e => e.id === id);
    if (!emotion) return;

    // 更新选中状态
    document.querySelectorAll('.emotion-card').forEach(c => c.classList.remove('selected'));
    document.getElementById(`emotion-${id}`).classList.add('selected');

    this.selectedEmotion = emotion;

    // 显示选中的情绪
    const display = document.getElementById('emotionDisplay');
    display.classList.remove('hidden');
    document.getElementById('currentEmotion').textContent = emotion.emoji;
    document.getElementById('emotionText').textContent = `我现在感觉：${emotion.label}`;

    App.playSound('click');
    this.checkCanSend();
  },

  // ---- 选择需求 ----
  selectNeed(id) {
    const needs = App.getNeeds();
    const need = needs.find(n => n.id === id);
    if (!need) return;

    // 更新选中状态
    document.querySelectorAll('.need-card').forEach(c => c.classList.remove('selected'));
    document.getElementById(`need-${id}`).classList.add('selected');

    this.selectedNeed = need;

    // 显示选中的需求
    const display = document.getElementById('needDisplay');
    display.classList.remove('hidden');
    document.getElementById('currentNeed').textContent = need.icon;
    document.getElementById('needText').textContent = `我需要：${need.label}`;

    App.playSound('click');
    this.checkCanSend();
  },

  // ---- 检查是否可以发送 ----
  checkCanSend() {
    const btn = document.getElementById('sendCommBtn');
    if (this.selectedEmotion) {
      btn.classList.remove('hidden');
    }
  },

  // ---- 发送沟通信息 ----
  sendCommunication() {
    if (!this.selectedEmotion) {
      App.toast('请先选择你的感受', 'warning');
      return;
    }

    const emotionText = this.selectedEmotion.label;
    const needText = this.selectedNeed ? this.selectedNeed.label : '无';

    // 保存到历史记录
    const history = App.store.get('history', []);
    history.unshift({
      name: '员工',
      action: '发送沟通需求',
      detail: `情绪：${emotionText} | 需求：${needText}`,
      time: new Date().toLocaleString('zh-CN')
    });
    App.store.set('history', history.slice(0, 50));

    // 显示成功提示
    App.showModal({
      icon: '✅',
      title: '已发送！',
      content: `
        <div style="text-align:center; padding:16px;">
          <div style="font-size:3rem; margin-bottom:12px;">${this.selectedEmotion.emoji}</div>
          <p style="font-size:1.1rem; margin-bottom:8px;">辅导员已经收到你的消息</p>
          <p style="color:var(--text-secondary);">
            ${this.selectedNeed ? `你的需求「${needText}」已记录` : '稍后会有辅导员来帮助你'}
          </p>
        </div>
      `,
      buttons: [
        { text: '好的 👍', type: 'primary', onClick: () => {
          this.resetSelection();
        }}
      ]
    });

    App.playSound('success');
  },

  // ---- 重置选择 ----
  resetSelection() {
    this.selectedEmotion = null;
    this.selectedNeed = null;

    document.querySelectorAll('.emotion-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.need-card').forEach(c => c.classList.remove('selected'));

    document.getElementById('emotionDisplay').classList.add('hidden');
    document.getElementById('needDisplay').classList.add('hidden');
    document.getElementById('sendCommBtn').classList.add('hidden');
  }
};

// ---- 初始化函数 ----
function initCommunication() {
  Communication.init();
}

function sendCommunication() {
  Communication.sendCommunication();
}
