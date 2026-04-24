/* ============================================
   工作流程模块 - 根据等级拆解步骤与提醒
   ============================================ */

const Workflow = {
  activeWorkflow: null,
  currentStep: 0,
  timer: null,
  timeLeft: 0,

  // ---- 初始化 ----
  init() {
    this.renderWorkflows();
  },

  // ---- 渲染工作流程列表 ----
  renderWorkflows() {
    const workflows = App.getWorkflows();
    const container = document.getElementById('workflowList');
    if (!container) return;

    const level = App.getUserLevel();
    const levelLabels = { low: '基础级', medium: '中级', high: '高级' };

    container.innerHTML = Object.entries(workflows).map(([key, wf]) => `
      <div class="workflow-card" id="wf-${key}">
        <div class="workflow-title">
          <span class="wf-icon">${wf.steps[0]?.icon || '📦'}</span>
          <h3>${wf.name}</h3>
        </div>
        <p style="color:var(--text-secondary); margin-bottom:16px; font-size:0.95rem;">${wf.description}</p>
        <div id="wf-steps-${key}">
          ${this.renderSteps(wf.steps, 0)}
        </div>
        <div class="step-actions" id="wf-actions-${key}">
          <button class="btn btn-primary" onclick="Workflow.startWorkflow('${key}')">
            ▶️ 开始工作
          </button>
        </div>
      </div>
    `).join('');
  },

  // ---- 渲染步骤 ----
  renderSteps(steps, currentStep) {
    return steps.map((step, i) => {
      let statusClass = '';
      if (i < currentStep) statusClass = 'done';
      else if (i === currentStep) statusClass = 'current';

      return `
        <div class="step-card ${statusClass}" id="step-${i}">
          <div class="step-num">${i < currentStep ? '✓' : (i + 1)}</div>
          <div class="step-info">
            <div class="step-name">${step.icon} ${step.title}</div>
            <div class="step-hint">${step.desc}</div>
          </div>
          <span class="step-emoji">${i === currentStep ? '👆' : (i < currentStep ? '✅' : '⬜')}</span>
        </div>
      `;
    }).join('');
  },

  // ---- 开始工作流程 ----
  startWorkflow(key) {
    const workflows = App.getWorkflows();
    const wf = workflows[key];
    if (!wf) return;

    this.activeWorkflow = key;
    this.currentStep = 0;

    this.updateStepDisplay();
    App.playSound('success');
    App.toast('开始工作！加油！💪', 'success');
  },

  // ---- 更新步骤显示 ----
  updateStepDisplay() {
    const workflows = App.getWorkflows();
    const wf = workflows[this.activeWorkflow];
    if (!wf) return;

    const stepsContainer = document.getElementById(`wf-steps-${this.activeWorkflow}`);
    const actionsContainer = document.getElementById(`wf-actions-${this.activeWorkflow}`);

    stepsContainer.innerHTML = this.renderSteps(wf.steps, this.currentStep);

    if (this.currentStep >= wf.steps.length) {
      // 全部完成
      actionsContainer.innerHTML = `
        <div style="text-align:center; padding:20px;">
          <div style="font-size:3rem; margin-bottom:12px;">🎉</div>
          <div style="font-size:1.3rem; font-weight:700; color:var(--success); margin-bottom:8px;">太棒了！全部完成！</div>
          <p style="color:var(--text-secondary); margin-bottom:16px;">你做得很好！</p>
          <button class="btn btn-primary" onclick="Workflow.resetWorkflow('${this.activeWorkflow}')">
            🔄 重新开始
          </button>
        </div>
      `;
      App.playSound('complete');
    } else {
      const step = wf.steps[this.currentStep];
      actionsContainer.innerHTML = `
        <div style="text-align:center; padding:12px; background:var(--bg-cool); border-radius:12px; margin-bottom:12px;">
          <div style="font-size:1.1rem; font-weight:600; color:var(--primary);">
            ${step.icon} 当前：${step.title}
          </div>
          <div style="font-size:0.95rem; color:var(--text-secondary); margin-top:4px;">
            ${step.desc}
          </div>
        </div>
        <button class="btn btn-primary" onclick="Workflow.completeStep()">
          ✅ 完成这一步
        </button>
        <button class="btn btn-outline" onclick="Workflow.showHelp()">
          🆘 需要帮助
        </button>
      `;
    }
  },

  // ---- 完成当前步骤 ----
  completeStep() {
    const workflows = App.getWorkflows();
    const wf = workflows[this.activeWorkflow];
    if (!wf) return;

    App.playSound('success');
    this.currentStep++;
    this.updateStepDisplay();
  },

  // ---- 显示帮助 ----
  showHelp() {
    const workflows = App.getWorkflows();
    const wf = workflows[this.activeWorkflow];
    if (!wf) return;

    const step = wf.steps[this.currentStep];

    App.showModal({
      icon: '💡',
      title: '操作提示',
      content: `
        <div style="text-align:center; padding:16px;">
          <div style="font-size:3rem; margin-bottom:12px;">${step.icon}</div>
          <div style="font-size:1.2rem; font-weight:700; margin-bottom:8px;">${step.title}</div>
          <div style="color:var(--text-secondary); line-height:1.8;">
            <p>📌 ${step.desc}</p>
            <p style="margin-top:8px;">⏱️ 预计用时：${step.duration}分钟</p>
          </div>
        </div>
      `,
      buttons: [
        { text: '我知道了', type: 'primary' },
        { text: '叫辅导员', type: 'warning', onClick: () => {
          App.toast('已通知辅导员，请稍等...', 'warning');
        }}
      ]
    });
  },

  // ---- 重置工作流程 ----
  resetWorkflow(key) {
    this.activeWorkflow = key;
    this.currentStep = 0;
    this.updateStepDisplay();
    App.playSound('click');
  }
};

// ---- 初始化函数 ----
function initWorkflow() {
  Workflow.init();
}
