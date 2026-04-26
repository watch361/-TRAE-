/* ============================================
   工作流程模块 - 根据等级拆解步骤与提醒
   - 不同等级对应不同流程分解（病约严重分解越细）
   - 记录完成次数
   - 管理员可切换等级查看不同流程
   ============================================ */

const Workflow = {
  activeWorkflow: null,
  currentStep: 0,
  viewLevel: null, // 手动查看等级（null=自动跟随评估）

  // Timer properties
  timerInterval: null,
  timerSeconds: 0,
  timerRunning: false,

  // ---- 获取当前等级（手动优先，否则自动） ----
  getCurrentLevel() {
    return this.viewLevel || App.getUserLevel().id;
  },

  // ---- 根据等级获取工作流程（病越严重分解越细） ----
  getWorkflowsByLevel() {
    const level = this.getCurrentLevel();

    const workflows = {
      'noodle-factory': {
        name: '方便面厂包装流程',
        low: {
          description: '将方便面包装成盒装产品（详细步骤版）',
          steps: [
            { id: 1, title: '走到工位', desc: '慢慢走到你的工作位置', icon: '🚶', duration: 1 },
            { id: 2, title: '洗手', desc: '用洗手液洗手，擦干净', icon: '🧼', duration: 2 },
            { id: 3, title: '戴上手套', desc: '拿出一次性手套戴上', icon: '🧤', duration: 1 },
            { id: 4, title: '拿一个包装盒', desc: '从左边拿一个空包装盒', icon: '📦', duration: 1 },
            { id: 5, title: '检查包装盒', desc: '看看盒子有没有破损', icon: '👀', duration: 1 },
            { id: 6, title: '拿一包方便面', desc: '从右边拿一包方便面', icon: '🍜', duration: 1 },
            { id: 7, title: '放入方便面', desc: '把方便面轻轻放进盒子里', icon: '📥', duration: 2 },
            { id: 8, title: '拿调料包', desc: '拿一个小调料包', icon: '🧂', duration: 1 },
            { id: 9, title: '放入调料包', desc: '把调料包放在方便面旁边', icon: '📥', duration: 1 },
            { id: 10, title: '拿封口胶带', desc: '从工具区拿一段胶带', icon: '📎', duration: 1 },
            { id: 11, title: '封好盒子', desc: '用胶带把盒子封好', icon: '✂️', duration: 3 },
            { id: 12, title: '检查封口', desc: '摸一摸胶带贴好了没有', icon: '✋', duration: 1 },
            { id: 13, title: '放到成品区', desc: '把包装好的盒子放到右边', icon: '📋', duration: 1 },
            { id: 14, title: '完成一个', desc: '太棒了！再来一个吧', icon: '🎉', duration: 0 }
          ]
        },
        medium: {
          description: '将方便面包装成盒装产品',
          steps: [
            { id: 1, title: '准备材料', desc: '检查包装盒、方便面、调料包、胶带', icon: '📦', duration: 2 },
            { id: 2, title: '放入方便面', desc: '将一包方便面放入包装盒', icon: '🍜', duration: 2 },
            { id: 3, title: '添加调料包', desc: '放入调料包', icon: '🧂', duration: 1 },
            { id: 4, title: '封口', desc: '用胶带封好包装盒', icon: '✂️', duration: 3 },
            { id: 5, title: '质量检查', desc: '检查包装是否完好', icon: '✅', duration: 2 },
            { id: 6, title: '装箱', desc: '将包装好的产品放入成品箱', icon: '📋', duration: 2 }
          ]
        },
        high: {
          description: '方便面包装流水线作业',
          steps: [
            { id: 1, title: '包装作业', desc: '完成方便面的装盒、放调料、封口', icon: '📦', duration: 5 },
            { id: 2, title: '质检', desc: '检查包装完好性并分类', icon: '✅', duration: 3 },
            { id: 3, title: '装箱入库', desc: '按标准数量装箱并放到指定区域', icon: '📋', duration: 4 }
          ]
        }
      },
      'assembly-line': {
        name: '流水线装配流程',
        low: {
          description: '简单的零件装配工作（详细步骤版）',
          steps: [
            { id: 1, title: '走到工位', desc: '慢慢走到你的工作位置', icon: '🚶', duration: 1 },
            { id: 2, title: '戴上护具', desc: '戴上手套和护目镜', icon: '🥽', duration: 2 },
            { id: 3, title: '看传送带', desc: '等零件传送到你面前', icon: '👀', duration: 1 },
            { id: 4, title: '拿住零件', desc: '用一只手轻轻拿住零件', icon: '🤏', duration: 1 },
            { id: 5, title: '看零件', desc: '检查零件有没有问题', icon: '🔍', duration: 2 },
            { id: 6, title: '对准位置', desc: '把零件对准安装位置', icon: '🎯', duration: 2 },
            { id: 7, title: '按下去', desc: '轻轻按下去，听到咔嗒声', icon: '👆', duration: 2 },
            { id: 8, title: '检查安装', desc: '轻轻拉一拉，确认装好了', icon: '✋', duration: 1 },
            { id: 9, title: '放回传送带', desc: '把装好的产品放回传送带', icon: '📤', duration: 1 },
            { id: 10, title: '完成一个', desc: '做得好！等下一个', icon: '🎉', duration: 0 }
          ]
        },
        medium: {
          description: '简单的零件装配工作',
          steps: [
            { id: 1, title: '拿取零件', desc: '从传送带上拿取零件', icon: '🔧', duration: 1 },
            { id: 2, title: '检查零件', desc: '确认零件完好无损', icon: '👀', duration: 2 },
            { id: 3, title: '安装零件', desc: '将零件安装到指定位置', icon: '⚙️', duration: 3 },
            { id: 4, title: '确认安装', desc: '检查零件是否安装牢固', icon: '✅', duration: 2 }
          ]
        },
        high: {
          description: '流水线装配作业',
          steps: [
            { id: 1, title: '装配作业', desc: '完成零件的取料、检查、安装', icon: '⚙️', duration: 5 },
            { id: 2, title: '自检', desc: '确认安装质量并放回产线', icon: '✅', duration: 3 }
          ]
        }
      }
    };

    // 返回当前等级的流程
    const result = {};
    Object.entries(workflows).forEach(([key, wf]) => {
      result[key] = {
        name: wf.name,
        description: wf[level].description,
        steps: wf[level].steps
      };
    });

    return result;
  },

  // ---- 获取完成次数 ----
  getCompletionCount(key) {
    const counts = App.store.get('workflow_completions', {});
    return counts[key] || 0;
  },

  // ---- 增加完成次数 ----
  incrementCompletion(key) {
    const counts = App.store.get('workflow_completions', {});
    counts[key] = (counts[key] || 0) + 1;
    App.store.set('workflow_completions', counts);

    // 记录到历史
    const workflows = this.getWorkflowsByLevel();
    const wf = workflows[key];
    const timeStr = this.formatTime(this.timerSeconds);
    const history = App.store.get('history', []);
    history.unshift({
      name: '员工',
      action: '完成工作流程',
      detail: `${wf.name} - 第${counts[key]}次完成 - 用时${timeStr}`,
      time: new Date().toLocaleString('zh-CN')
    });
    App.store.set('history', history.slice(0, 50));

    return counts[key];
  },

  // ---- 检查训练状态 ----
  checkTrainingStatus() {
    const trainingStatus = App.store.get('training_completed', {});
    const hasTraining = Object.keys(trainingStatus).length > 0;
    return hasTraining;
  },

  // ---- 初始化 ----
  init() {
    this.renderWorkflows();
  },

  // ---- 渲染工作流程列表 ----
  renderWorkflows() {
    const workflows = this.getWorkflowsByLevel();
    const container = document.getElementById('workflowList');
    if (!container) return;

    const level = this.getCurrentLevel();
    const autoLevel = App.getUserLevel().id;
    const levelLabels = { low: '基础级', medium: '中级', high: '高级' };
    const levelIcons = { low: '🌱', medium: '⭐', high: '🏆' };
    const isManual = this.viewLevel !== null;

    container.innerHTML = `
      <div style="text-align:center; margin-bottom:16px;">
        <span class="level-badge level-${level === 'medium' ? 'mid' : level}">
          ${levelIcons[level]} 当前查看：${levelLabels[level]}${isManual ? '（手动切换）' : '（评估自动）'}
        </span>
      </div>
      <div style="display:flex; gap:8px; justify-content:center; margin-bottom:20px; flex-wrap:wrap;">
        <span style="font-size:0.9rem; color:var(--text-secondary); font-weight:600; line-height:36px;">切换等级：</span>
        <button class="btn btn-outline wf-level-btn ${level === 'low' ? 'active-level' : ''}" onclick="Workflow.switchViewLevel('low')" style="padding:6px 16px; font-size:0.9rem; ${level === 'low' ? 'background:var(--level-low);color:white;border-color:var(--level-low);' : ''}">🌱 基础级</button>
        <button class="btn btn-outline wf-level-btn ${level === 'medium' ? 'active-level' : ''}" onclick="Workflow.switchViewLevel('medium')" style="padding:6px 16px; font-size:0.9rem; ${level === 'medium' ? 'background:var(--level-mid);color:#D48806;border-color:var(--level-mid);' : ''}">⭐ 中级</button>
        <button class="btn btn-outline wf-level-btn ${level === 'high' ? 'active-level' : ''}" onclick="Workflow.switchViewLevel('high')" style="padding:6px 16px; font-size:0.9rem; ${level === 'high' ? 'background:var(--level-high);color:#389E0D;border-color:var(--level-high);' : ''}">🏆 高级</button>
        ${isManual ? `<button class="btn btn-outline" onclick="Workflow.resetViewLevel()" style="padding:6px 16px; font-size:0.9rem;">🔄 跟随评估</button>` : ''}
      </div>
      ${isManual ? `<div style="text-align:center; margin-bottom:16px; padding:8px 16px; background:var(--bg-warm); border-radius:10px; font-size:0.9rem; color:var(--text-secondary);">
        💡 你正在手动查看${levelLabels[level]}流程，你的评估等级是${levelIcons[autoLevel]} ${levelLabels[autoLevel]}
      </div>` : ''}
    ` + Object.entries(workflows).map(([key, wf]) => {
      const count = this.getCompletionCount(key);
      return `
        <div class="workflow-card" id="wf-${key}">
          <div class="workflow-title">
            <span class="wf-icon">${wf.steps[0]?.icon || '📦'}</span>
            <h3>${wf.name}</h3>
            ${count > 0 ? `<span style="background:var(--bg-warm); padding:4px 12px; border-radius:12px; font-size:0.85rem; font-weight:600;">已完成 ${count} 次</span>` : ''}
          </div>
          <p style="color:var(--text-secondary); margin-bottom:16px; font-size:0.95rem;">${wf.description}</p>
          <div style="font-size:0.85rem; color:var(--text-light); margin-bottom:12px;">共 ${wf.steps.length} 个步骤</div>
          <div id="wf-steps-${key}">
            ${this.renderSteps(wf.steps, 0)}
          </div>
          <div class="step-actions" id="wf-actions-${key}">
            <button class="btn btn-primary" onclick="Workflow.startWorkflow('${key}')">
              ▶️ 开始工作
            </button>
          </div>
        </div>
      `;
    }).join('');
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
    // Check training status
    if (!this.checkTrainingStatus()) {
      App.showModal({
        icon: '⚠️',
        title: '还没完成训练哦',
        content: `
          <div style="text-align:center; padding:16px;">
            <div style="font-size:3rem; margin-bottom:12px;">🎯</div>
            <p style="font-size:1.1rem; margin-bottom:8px;">建议先完成「岗位训练」</p>
            <p style="color:var(--text-secondary);">训练可以帮助你更好地完成工作</p>
          </div>
        `,
        buttons: [
          { text: '去训练', type: 'primary', onClick: () => {
            navigateTo('trainingPage', 2);
          }},
          { text: '还是直接工作', type: 'outline', onClick: () => {
            this.doStartWorkflow(key);
          }}
        ]
      });
      return;
    }
    this.doStartWorkflow(key);
  },

  doStartWorkflow(key) {
    const workflows = this.getWorkflowsByLevel();
    const wf = workflows[key];
    if (!wf) return;

    this.activeWorkflow = key;
    this.currentStep = 0;
    this.resetTimer();
    this.startTimer();

    this.updateStepDisplay();
    App.playSound('success');
    App.toast('开始工作！加油！💪', 'success');
  },

  // ---- 更新步骤显示 ----
  updateStepDisplay() {
    const workflows = this.getWorkflowsByLevel();
    const wf = workflows[this.activeWorkflow];
    if (!wf) return;

    const stepsContainer = document.getElementById(`wf-steps-${this.activeWorkflow}`);
    const actionsContainer = document.getElementById(`wf-actions-${this.activeWorkflow}`);

    stepsContainer.innerHTML = this.renderSteps(wf.steps, this.currentStep);

    if (this.currentStep >= wf.steps.length) {
      // 全部完成 - 暂停计时器
      this.pauseTimer();
      const timeStr = this.formatTime(this.timerSeconds);
      const count = this.incrementCompletion(this.activeWorkflow);

      actionsContainer.innerHTML = `
        <div style="text-align:center; padding:20px;">
          <div style="font-size:3rem; margin-bottom:12px;">🎉</div>
          <div style="font-size:1.3rem; font-weight:700; color:var(--success); margin-bottom:8px;">太棒了！全部完成！</div>
          <p style="color:var(--text-secondary); margin-bottom:4px;">你做得很好！</p>
          <p style="color:var(--text-secondary);">⏱️ 用时：${timeStr}</p>
          <p style="color:var(--primary); font-weight:600; margin-bottom:16px;">累计完成 ${count} 次</p>
          <button class="btn btn-primary" onclick="Workflow.resetWorkflow('${this.activeWorkflow}')">
            🔄 再做一次
          </button>
        </div>
      `;
      App.playSound('complete');
    } else {
      const step = wf.steps[this.currentStep];
      // 获取动画HTML
      let animHTML = '';
      if (typeof StepAnimation !== 'undefined') {
        animHTML = StepAnimation.getAnimation(step.title, step.desc);
      }

      actionsContainer.innerHTML = `
        ${animHTML}
        <div style="text-align:center; padding:12px; background:var(--bg-cool); border-radius:12px; margin-bottom:12px;">
          <div style="font-size:0.9rem; color:var(--text-light); margin-bottom:4px;">
            第 ${this.currentStep + 1} 步 / 共 ${wf.steps.length} 步
          </div>
          <div style="font-size:1.1rem; font-weight:600; color:var(--primary);">
            ${step.icon} ${step.title}
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
    const workflows = this.getWorkflowsByLevel();
    const wf = workflows[this.activeWorkflow];
    if (!wf) return;

    App.playSound('success');
    this.currentStep++;
    this.updateStepDisplay();
  },

  // ---- 显示帮助 ----
  showHelp() {
    const workflows = this.getWorkflowsByLevel();
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
    this.resetTimer();
    this.updateStepDisplay();
    App.playSound('click');
  },

  // ---- 手动切换查看等级 ----
  switchViewLevel(level) {
    this.viewLevel = level;
    this.activeWorkflow = null;
    this.currentStep = 0;
    this.renderWorkflows();
    App.playSound('click');
  },

  // ---- 恢复跟随评估等级 ----
  resetViewLevel() {
    this.viewLevel = null;
    this.activeWorkflow = null;
    this.currentStep = 0;
    this.renderWorkflows();
    App.playSound('click');
    App.toast('已恢复跟随评估等级', 'info');
  },

  // ---- 计时器方法 ----

  // Start timer
  startTimer() {
    if (this.timerRunning) return;
    this.timerRunning = true;
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this.updateTimerDisplay();
    }, 1000);
  },

  // Pause timer
  pauseTimer() {
    this.timerRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  // Reset timer
  resetTimer() {
    this.pauseTimer();
    this.timerSeconds = 0;
    this.updateTimerDisplay();
  },

  // Update timer display (syncs with employee.html timer)
  updateTimerDisplay() {
    // Try the workflow.js timer display first, then the employee.html one
    let display = document.getElementById('workflowTimerDisplay');
    if (!display) display = document.getElementById('timerDisplay');
    if (!display) return;
    const h = Math.floor(this.timerSeconds / 3600);
    const m = Math.floor((this.timerSeconds % 3600) / 60);
    const s = this.timerSeconds % 60;
    const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    display.textContent = timeStr;
    // Sync both displays if both exist
    if (display.id === 'workflowTimerDisplay') {
      const other = document.getElementById('timerDisplay');
      if (other) other.textContent = timeStr;
    } else {
      const other = document.getElementById('workflowTimerDisplay');
      if (other) other.textContent = timeStr;
    }
  },

  // Format timer for display
  formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
};

// ---- 初始化函数 ----
function initWorkflow() {
  Workflow.init();
}
