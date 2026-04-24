/* ============================================
   岗位训练模块 - 根据等级差异化训练
   - 基础级：步骤更多更细，带详细提示
   - 中级：标准步骤
   - 高级：简化步骤，自主完成
   ============================================ */

const Training = {
  activeScene: null,
  currentStep: 0,
  attempts: 0,

  // ---- 根据等级获取训练场景 ----
  getTrainingScenesByLevel() {
    const level = App.getUserLevel().id;

    const scenes = {
      'noodle-packing': {
        name: '方便面包装训练',
        low: {
          description: '学习如何包装方便面（详细版）',
          steps: [
            { id: 1, title: '走到工位', icon: '🚶', hint: '慢慢走到你的工作位置，不要着急' },
            { id: 2, title: '洗干净手', icon: '🧼', hint: '用洗手液洗手，冲干净，用纸巾擦干' },
            { id: 3, title: '戴手套', icon: '🧤', hint: '从盒子里拿出一双一次性手套，戴上' },
            { id: 4, title: '拿包装盒', icon: '📦', hint: '从左边的架子上拿一个空包装盒' },
            { id: 5, title: '检查盒子', icon: '👀', hint: '看看盒子有没有坏的地方' },
            { id: 6, title: '放方便面', icon: '🍜', hint: '从右边拿一包方便面，轻轻放进盒子中间' },
            { id: 7, title: '放调料包', icon: '🧂', hint: '拿一个小调料包，放在方便面旁边' },
            { id: 8, title: '拿胶带', icon: '📎', hint: '从工具区拿一段封口胶带' },
            { id: 9, title: '贴胶带', icon: '✂️', hint: '把胶带贴在盒子开口处，按紧' },
            { id: 10, title: '检查一下', icon: '✅', hint: '摸一摸胶带贴好了没有，盒子有没有鼓起来' },
            { id: 11, title: '放好成品', icon: '📋', hint: '把包装好的盒子轻轻放到右边的成品区' }
          ]
        },
        medium: {
          description: '学习如何包装方便面',
          steps: [
            { id: 1, title: '准备材料', icon: '📦', hint: '检查包装盒、方便面、调料包、胶带是否齐全' },
            { id: 2, title: '放方便面', icon: '🍜', hint: '将一包方便面放入包装盒' },
            { id: 3, title: '放调料包', icon: '🧂', hint: '将调料包放在方便面旁边' },
            { id: 4, title: '封口', icon: '✂️', hint: '用胶带封好包装盒' },
            { id: 5, title: '质检', icon: '✅', hint: '检查包装是否完好' },
            { id: 6, title: '装箱', icon: '📋', hint: '将成品放入成品箱' }
          ]
        },
        high: {
          description: '方便面包装训练',
          steps: [
            { id: 1, title: '包装', icon: '📦', hint: '完成装盒、放调料、封口' },
            { id: 2, title: '质检装箱', icon: '✅', hint: '检查质量并装箱' }
          ]
        }
      },
      'sorting': {
        name: '物品分类训练',
        low: {
          description: '学习按颜色分类物品（详细版）',
          steps: [
            { id: 1, title: '看第一个物品', icon: '👀', hint: '拿起第一个物品，仔细看它的颜色' },
            { id: 2, title: '找到对应箱子', icon: '🔍', hint: '找到和物品一样颜色的箱子' },
            { id: 3, title: '放进去', icon: '📥', hint: '把物品轻轻放进箱子里' },
            { id: 4, title: '看下一个', icon: '👀', hint: '拿起下一个物品，看颜色' },
            { id: 5, title: '再找箱子', icon: '🔍', hint: '找到对应颜色的箱子' },
            { id: 6, title: '放好', icon: '📥', hint: '把物品放进去' },
            { id: 7, title: '检查一遍', icon: '✅', hint: '看看每个箱子里的物品颜色对不对' }
          ]
        },
        medium: {
          description: '学习按颜色分类物品',
          steps: [
            { id: 1, title: '识别颜色', icon: '🎨', hint: '观察物品的颜色' },
            { id: 2, title: '分类放置', icon: '📂', hint: '将相同颜色的物品放在一起' },
            { id: 3, title: '检查结果', icon: '✅', hint: '确认分类是否正确' }
          ]
        },
        high: {
          description: '物品分类训练',
          steps: [
            { id: 1, title: '快速分类', icon: '📂', hint: '按颜色快速分类所有物品' },
            { id: 2, title: '自检', icon: '✅', hint: '确认分类正确' }
          ]
        }
      }
    };

    // 返回当前等级的场景
    const result = {};
    Object.entries(scenes).forEach(([key, scene]) => {
      result[key] = {
        name: scene.name,
        description: scene[level].description,
        steps: scene[level].steps
      };
    });

    return result;
  },

  // ---- 初始化 ----
  init() {
    this.renderTrainingList();
  },

  // ---- 渲染训练列表 ----
  renderTrainingList() {
    const scenes = this.getTrainingScenesByLevel();
    const container = document.getElementById('trainingList');
    if (!container) return;

    const level = App.getUserLevel().id;
    const levelLabels = { low: '基础级', medium: '中级', high: '高级' };
    const levelIcons = { low: '🌱', medium: '⭐', high: '🏆' };

    container.innerHTML = `
      <div style="text-align:center; margin-bottom:20px;">
        <span class="level-badge level-${level === 'medium' ? 'mid' : level}">
          ${levelIcons[level]} 当前等级：${levelLabels[level]}
        </span>
      </div>
    ` + Object.entries(scenes).map(([key, scene]) => `
      <div class="training-card" onclick="Training.startScene('${key}')">
        <div class="training-title">
          <span class="tr-icon">${scene.steps[0]?.icon || '🎯'}</span>
          <h3>${scene.name}</h3>
        </div>
        <p class="training-desc">${scene.description}</p>
        <div style="font-size:0.85rem; color:var(--text-light); margin-top:4px; margin-bottom:8px;">共 ${scene.steps.length} 个训练步骤</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
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
    const scenes = this.getTrainingScenesByLevel();
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
    const scenes = this.getTrainingScenesByLevel();
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
    const scenes = this.getTrainingScenesByLevel();
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
    const scenes = this.getTrainingScenesByLevel();
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
