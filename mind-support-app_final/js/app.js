/* ============================================
   心智障碍群体就业支持应用 - 共享工具库
   ============================================ */

const App = {
  // ---- 数据存储 ----
  store: {
    _data: {},
    get(key, defaultVal = null) {
      try {
        const val = localStorage.getItem('mind_support_' + key);
        return val ? JSON.parse(val) : defaultVal;
      } catch (e) {
        return defaultVal;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem('mind_support_' + key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error('Storage error:', e);
        return false;
      }
    },
    remove(key) {
      localStorage.removeItem('mind_support_' + key);
    },
    clear() {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('mind_support_')) {
          localStorage.removeItem(key);
        }
      });
    }
  },

  // ---- 用户等级定义 ----
  levels: {
    LOW: {
      id: 'low',
      name: '基础级',
      color: '#FF7875',
      description: '基础认知弱、指令只能单步、注意力短，适合单一简单重复岗位',
      features: ['大图标', '语音提示', '单步骤任务', '频繁提醒'],
      jobs: '纯单一动作（放料、递物品、简单装箱）'
    },
    MEDIUM: {
      id: 'medium',
      name: '中级',
      color: '#FFC53D',
      description: '能理解2步指令、会简单操作、情绪较稳定，适合2-3步流水线岗位',
      features: ['中等图标', '文字+图标', '2-3步骤任务', '定时提醒'],
      jobs: '2-3步流水线（方便面装袋+封口、贴标+装箱）'
    },
    HIGH: {
      id: 'high',
      name: '高级',
      color: '#73D13D',
      description: '理解多步骤、注意力好、会表达、适应变化，适合多步骤+质检岗位',
      features: ['标准界面', '文字为主', '多步骤任务', '自主管理'],
      jobs: '多步骤+简单质检（分拣、点数、分类、检查不良品）'
    }
  },

  // ---- 获取当前用户等级 ----
  getUserLevel() {
    const levelId = this.store.get('user_level', 'medium');
    return this.levels[levelId.toUpperCase()] || this.levels.MEDIUM;
  },

  // ---- 设置用户等级 ----
  setUserLevel(levelId) {
    const level = this.levels[levelId.toUpperCase()];
    if (level) {
      this.store.set('user_level', level.id);
      return level;
    }
    return null;
  },

  // ---- 根据总分计算等级（国标：0-40低/41-70中/71-100高） ----
  calculateLevel(totalScore) {
    if (totalScore >= 71) return this.levels.HIGH;
    if (totalScore >= 41) return this.levels.MEDIUM;
    return this.levels.LOW;
  },

  // ---- 提示消息 ----
  toast(message, type = 'info', duration = 3000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // ---- 显示模态框 ----
  showModal(options) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    if (options.icon) {
      const icon = document.createElement('div');
      icon.className = 'modal-icon';
      icon.textContent = options.icon;
      modal.appendChild(icon);
    }

    if (options.title) {
      const title = document.createElement('h2');
      title.textContent = options.title;
      modal.appendChild(title);
    }

    if (options.content) {
      const content = document.createElement('div');
      content.className = 'modal-content';
      content.innerHTML = options.content;
      modal.appendChild(content);
    }

    if (options.buttons) {
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'modal-buttons';
      buttonContainer.style.display = 'flex';
      buttonContainer.style.gap = '12px';
      buttonContainer.style.justifyContent = 'center';
      buttonContainer.style.marginTop = '20px';

      options.buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `btn btn-${btn.type || 'primary'}`;
        button.textContent = btn.text;
        button.onclick = () => {
          if (btn.onClick) btn.onClick();
          overlay.remove();
        };
        buttonContainer.appendChild(button);
      });

      modal.appendChild(buttonContainer);
    }

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.onclick = (e) => {
      if (e.target === overlay && options.closeOnBackdrop !== false) {
        overlay.remove();
      }
    };

    return overlay;
  },

  // ---- 播放声音 ----
  playSound(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const sounds = {
      success: { freq: 523.25, duration: 0.2 },
      error: { freq: 261.63, duration: 0.3 },
      click: { freq: 440, duration: 0.1 },
      complete: { freq: 659.25, duration: 0.4 }
    };

    const sound = sounds[type] || sounds.click;
    oscillator.frequency.value = sound.freq;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
  },

  // ---- 随机打乱数组 ----
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  // ---- 生成随机数 ----
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // ---- 延迟 ----
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // ---- 格式化时间 ----
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },

  // ---- 检查是否支持触摸 ----
  isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // ---- 添加触摸反馈 ----
  addTouchFeedback(element) {
    if (this.isTouchDevice()) {
      element.addEventListener('touchstart', () => {
        element.style.transform = 'scale(0.95)';
      });
      element.addEventListener('touchend', () => {
        element.style.transform = 'scale(1)';
      });
    }
  },

  // ---- 创建SVG图标 ----
  createIcon(name, size = 24) {
    const icons = {
      clock: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
      shape: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
      color: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>`,
      count: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>`,
      home: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>`,
      workflow: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
      emotion: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
      training: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
      user: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      admin: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      check: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>`,
      arrow: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>`,
      star: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/></svg>`
    };

    return icons[name] || '';
  },

  // ---- 获取评估题目 ----
  getAssessmentQuestions() {
    return {
      clock: {
        title: '时钟识别',
        icon: '🕐',
        questions: [
          { hour: 3, minute: 0, options: ['3:00', '12:15', '9:00', '6:30'], correct: 0 },
          { hour: 9, minute: 30, options: ['9:30', '10:30', '9:00', '8:30'], correct: 0 },
          { hour: 12, minute: 15, options: ['12:15', '3:00', '12:45', '1:15'], correct: 0 },
          { hour: 6, minute: 45, options: ['6:45', '7:45', '6:15', '5:45'], correct: 0 },
          { hour: 2, minute: 20, options: ['2:20', '2:40', '1:20', '3:20'], correct: 0 }
        ]
      },
      shape: {
        title: '图形识别',
        icon: '🔷',
        questions: [
          { target: 'circle', options: ['circle', 'square', 'triangle', 'star'], correct: 0 },
          { target: 'square', options: ['triangle', 'circle', 'square', 'star'], correct: 2 },
          { target: 'triangle', options: ['square', 'triangle', 'circle', 'star'], correct: 1 },
          { target: 'star', options: ['circle', 'triangle', 'square', 'star'], correct: 3 }
        ]
      },
      color: {
        title: '颜色识别',
        icon: '🎨',
        questions: [
          { target: '#FF4D4F', options: ['#FF4D4F', '#52C41A', '#4A90D9', '#FAAD14'], correct: 0 },
          { target: '#52C41A', options: ['#FAAD14', '#52C41A', '#FF4D4F', '#4A90D9'], correct: 1 },
          { target: '#4A90D9', options: ['#FF4D4F', '#FAAD14', '#52C41A', '#4A90D9'], correct: 3 },
          { target: '#FAAD14', options: ['#4A90D9', '#FF4D4F', '#FAAD14', '#52C41A'], correct: 2 }
        ]
      },
      count: {
        title: '计数能力',
        icon: '🔢',
        questions: [
          { count: 3, options: ['2', '3', '4', '5'], correct: 1 },
          { count: 5, options: ['4', '6', '5', '7'], correct: 2 },
          { count: 7, options: ['6', '8', '7', '5'], correct: 2 },
          { count: 10, options: ['9', '10', '11', '8'], correct: 1 }
        ]
      }
    };
  },

  // ---- 获取工作流程示例 ----
  getWorkflows() {
    return {
      'noodle-factory': {
        name: '方便面厂包装流程',
        description: '将方便面包装成盒装产品',
        level: 'medium',
        steps: [
          {
            id: 1,
            title: '检查包装材料',
            desc: '确认包装盒、封口胶带齐全',
            icon: '📦',
            duration: 2
          },
          {
            id: 2,
            title: '放置方便面',
            desc: '将一包方便面放入包装盒',
            icon: '🍜',
            duration: 3
          },
          {
            id: 3,
            title: '添加调料包',
            desc: '放入调料包',
            icon: '🧂',
            duration: 2
          },
          {
            id: 4,
            title: '封口',
            desc: '使用封口胶带封好包装盒',
            icon: '✂️',
            duration: 3
          },
          {
            id: 5,
            title: '质量检查',
            desc: '检查包装是否完好',
            icon: '✅',
            duration: 2
          },
          {
            id: 6,
            title: '装箱',
            desc: '将包装好的产品放入箱子',
            icon: '📋',
            duration: 3
          }
        ]
      },
      'assembly-line': {
        name: '流水线装配流程',
        description: '简单的零件装配工作',
        level: 'low',
        steps: [
          {
            id: 1,
            title: '拿取零件',
            desc: '从传送带上拿取零件',
            icon: '🔧',
            duration: 2
          },
          {
            id: 2,
            title: '检查零件',
            desc: '确认零件完好无损',
            icon: '👀',
            duration: 2
          },
          {
            id: 3,
            title: '安装零件',
            desc: '将零件安装到指定位置',
            icon: '⚙️',
            duration: 4
          },
          {
            id: 4,
            title: '确认安装',
            desc: '检查零件是否安装牢固',
            icon: '✅',
            duration: 2
          }
        ]
      }
    };
  },

  // ---- 获取情绪选项 ----
  getEmotions() {
    return [
      { id: 'happy', emoji: '😊', label: '开心', color: '#52C41A' },
      { id: 'sad', emoji: '😢', label: '难过', color: '#4A90D9' },
      { id: 'angry', emoji: '😠', label: '生气', color: '#FF4D4F' },
      { id: 'tired', emoji: '😴', label: '疲劳', color: '#8C8C8C' },
      { id: 'scared', emoji: '😨', label: '害怕', color: '#722ED1' },
      { id: 'confused', emoji: '😕', label: '困惑', color: '#FAAD14' },
      { id: 'hungry', emoji: '😋', label: '饥饿', color: '#FA8C16' },
      { id: 'thirsty', emoji: '🥤', label: '口渴', color: '#13C2C2' }
    ];
  },

  // ---- 获取需求选项 ----
  getNeeds() {
    return [
      { id: 'rest', icon: '🛋️', label: '休息' },
      { id: 'toilet', icon: '🚻', label: '卫生间' },
      { id: 'water', icon: '💧', label: '喝水' },
      { id: 'food', icon: '🍽️', label: '吃饭' },
      { id: 'help', icon: '🆘', label: '需要帮助' },
      { id: 'break', icon: '☕', label: '休息一下' },
      { id: 'medicine', icon: '💊', label: '吃药' },
      { id: 'quiet', icon: '🤫', label: '安静一下' },
      { id: 'talk', icon: '💬', label: '想说话' }
    ];
  },

  // ---- 获取训练场景 ----
  getTrainingScenes() {
    return {
      'noodle-packing': {
        name: '方便面包装训练',
        description: '练习将方便面包装到盒子里',
        steps: [
          { id: 1, title: '拿包装盒', icon: '📦', hint: '从左侧拿取包装盒' },
          { id: 2, title: '放方便面', icon: '🍜', hint: '将方便面放入盒子中央' },
          { id: 3, title: '放调料包', icon: '🧂', hint: '将调料包放在方便面上' },
          { id: 4, title: '封口', icon: '✂️', hint: '用胶带封好盒子' }
        ]
      },
      'sorting': {
        name: '物品分类训练',
        description: '练习按颜色和形状分类物品',
        steps: [
          { id: 1, title: '识别颜色', icon: '🎨', hint: '观察物品的颜色' },
          { id: 2, title: '分类放置', icon: '📂', hint: '将相同颜色的物品放在一起' },
          { id: 3, title: '检查结果', icon: '✅', hint: '确认分类是否正确' }
        ]
      }
    };
  }
};

// ---- 初始化应用 ----
document.addEventListener('DOMContentLoaded', () => {
  // 添加全局触摸反馈
  if (App.isTouchDevice()) {
    document.querySelectorAll('.btn, .icon-card, .answer-option').forEach(el => {
      App.addTouchFeedback(el);
    });
  }
});
