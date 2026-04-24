/* ============================================
   岗位训练模块 - 可视化训练工具
   ============================================ */

const Training = {
  activeScene: null,
  currentStep: 0,
  attempts: 0,

  // ---- 初始化 ----
  init() {
    this.renderTrainingList();
  },

  // ---- 渲染训练列表 ----
  renderTrainingList() {
    const scenes = App.getTrainingScenes();
    const container = document.getElementById('trainingList');
    if (!container) return;

    container.innerHTML = Object.entries(scenes).map(([key, scene]) => `
      <div class="training-card" onclick="Training.startScene('${key}')">
        <div class="training-title">
          <span class="tr-icon">${scene.steps[0]?.icon || '🎯'}</span>
          <h3>${scene.name}</h3>
        </div>
        <p class="training-desc">${scene.description}</p>
        <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
          ${scene.steps.map(s => `
            <span style="padding:4px 10px; background:var(--bg-main); border-radius:12px; font-size:0.85rem;">
              ${s.icon} ${s.title}
            </span>
          `).join('')}
        </div>
      </div>
    `).join('');
  },

  // ---- 开始训练场景 ----
  startScene(key) {
    const scenes = App.getTrainingScenes();
    const scene = scenes[key];
    if (!scene) return;

    this.activeScene = key;
    this.currentStep = 0;
    this.attempts = 0;

    document.getElementById('trainingList').classList.add('hidden');
    document.getElementById('trainingSession').classList.remove('hidden');

    document.getElementById('sessionTitle').textContent = scene.name;
    this.updateTrainingStep();

    App.playSound('click');
  },

  // ---- 更新训练步骤 ----
  updateTrainingStep() {
    const scenes = App.getTrainingScenes();
    const scene = scenes[this.activeScene];
    if (!scene) return;

    const step = scene.steps[this.currentStep];
    const total = scene.steps.length;
    const progress = ((this.currentStep) / total) * 100;

    document.getElementById('sessionProgress').textContent = `${this.currentStep + 1} / ${total}`;
    document.getElementById('trainingProgress').style.width = progress + '%';

    document.getElementById('visualIcon').textContent = step.icon;
    document.getElementById('visualTitle').textContent = step.title;
    document.getElementById('visualHint').textContent = step.hint;

    // 按钮状态
    document.getElementById('prevStepBtn').disabled = this.currentStep === 0;
    document.getElementById('nextStepBtn').textContent =
      this.currentStep >= total - 1 ? '✅ 完成' : '下一步 ➡';
  },

  // ---- 上一步 ----
  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateTrainingStep();
      App.playSound('click');
    }
  },

  // ---- 下一步 ----
  nextStep() {
    const scenes = App.getTrainingScenes();
    const scene = scenes[this.activeScene];
    if (!scene) return;

    this.attempts++;

    if (this.currentStep >= scene.steps.length - 1) {
      // 训练完成
      this.completeTraining();
    } else {
      this.currentStep++;
      this.updateTrainingStep();
      App.playSound('success');
    }
  },

  // ---- 完成训练 ----
  completeTraining() {
    const scenes = App.getTrainingScenes();
    const scene = scenes[this.activeScene];

    // 保存记录
    const history = App.store.get('history', []);
    history.unshift({
      name: '员工',
      action: '完成岗位训练',
      detail: `${scene.name} - 完成 ${scene.steps.length}/${scene.steps.length} 步骤`,
      time: new Date().toLocaleString('zh-CN')
    });
    App.store.set('history', history.slice(0, 50));

    // 显示完成界面
    document.getElementById('trainingSession').classList.add('hidden');
    document.getElementById('trainingList').classList.remove('hidden');

    App.showModal({
      icon: '🎉',
      title: '训练完成！',
      content: `
        <div style="text-align:center; padding:16px;">
          <div style="font-size:3rem; margin-bottom:12px;">🏆</div>
          <p style="font-size:1.2rem; font-weight:700; margin-bottom:8px;">你做得太棒了！</p>
          <p style="color:var(--text-secondary);">
            完成了「${scene.name}」的全部 ${scene.steps.length} 个步骤
          </p>
          <div style="margin-top:16px; display:flex; justify-content:center; gap:24px;">
            <div class="result-score-item">
              <div class="score-num">${scene.steps.length}</div>
              <div class="score-name">完成步骤</div>
            </div>
            <div class="result-score-item">
              <div class="score-num">${this.attempts}</div>
              <div class="score-name">操作次数</div>
            </div>
          </div>
        </div>
      `,
      buttons: [
        { text: '再练一次', type: 'primary', onClick: () => {
          this.startScene(this.activeScene);
        }},
        { text: '返回列表', type: 'outline', onClick: () => {
          document.getElementById('trainingSession').classList.add('hidden');
          document.getElementById('trainingList').classList.remove('hidden');
        }}
      ]
    });

    App.playSound('complete');
  }
};

// ---- 初始化函数 ----
function initTraining() {
  Training.init();
}

function trainingPrevStep() {
  Training.prevStep();
}

function trainingNextStep() {
  Training.nextStep();
}
