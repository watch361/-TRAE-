/* ============================================
   评估模块 - 参考国标重构
   总分100分，5大板块各20分，共20题
   板块1: 基础认知 (钟表/图形/颜色/数字/文字)
   板块2: 指令理解 (单步/两步/规则判断)
   板块3: 专注与操作 (重复操作/注意力/配对/排序)
   板块4: 环境适应 (环境/时间/安全/服从)
   板块5: 情绪与表达 (需求/情绪/变化/求助)
   ============================================ */

const Assessment = {
  // 5大板块，按顺序完成
  sections: [
    { id: 'cognition', name: '基础认知', icon: '🧠', maxScore: 20 },
    { id: 'instruction', name: '指令理解', icon: '👂', maxScore: 20 },
    { id: 'focus', name: '专注与操作', icon: '🎯', maxScore: 20 },
    { id: 'adaptation', name: '环境适应', icon: '🏭', maxScore: 20 },
    { id: 'emotion', name: '情绪与表达', icon: '😊', maxScore: 20 }
  ],
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  sectionScores: {},
  speechSynth: window.speechSynthesis || null,
  currentSpeakText: '',

  // ======== 题库定义 ========
  // 基础认知：简化（2-3选1，适合认知能力较弱的群体）
  // 其他板块：标准4选1（参考国标，有区分度）
  getQuestions() {
    return {
      cognition: [
        {
          type: 'clock',
          score: 4,
          speak: '看这个钟表，短针指着12，长针也指着12，这是几点？',
          render: () => this.renderClock(12, 0),
          options: [
            { text: '🕐 12点', score: 4 },
            { text: '🕐 6点', score: 0 },
            { text: '🕐 3点', score: 0 }
          ]
        },
        {
          type: 'shape',
          score: 4,
          speak: '看这个图形，它是什么形状？',
          render: () => this.renderSingleShape('circle'),
          options: [
            { text: '🔵 圆形', score: 4 },
            { text: '🟥 方形', score: 0 }
          ]
        },
        {
          type: 'color',
          score: 4,
          speak: '看这个颜色，它是什么颜色？',
          render: () => this.renderSingleColor('#FF4D4F'),
          options: [
            { text: '🔴 红色', score: 4 },
            { text: '🟢 绿色', score: 0 }
          ]
        },
        {
          type: 'count',
          score: 4,
          speak: '数一数，这里有几个苹果？',
          render: () => this.renderCount(3, '🍎'),
          options: [
            { text: '2', score: 0 },
            { text: '3', score: 4 },
            { text: '4', score: 0 }
          ]
        },
        {
          type: 'sign',
          score: 4,
          speak: '这个标志是什么意思？',
          render: () => this.renderSign('🚻', '厕所'),
          options: [
            { text: '🚻 厕所', score: 4 },
            { text: '🚪 出口', score: 0 }
          ]
        }
      ],
      instruction: [
        {
          type: 'single',
          score: 4,
          speak: '听指令：拿起这个盒子。你要怎么做？',
          render: () => this.renderInstruction('🧑‍🔧', '拿起这个盒子', '📦'),
          options: [
            { text: '✅ 做', score: 4 },
            { text: '❌ 不做', score: 0 }
          ]
        },
        {
          type: 'double',
          score: 6,
          speak: '听指令：先贴标签，再放进箱子。应该怎么做？',
          render: () => this.renderDoubleInstruction('🏷️ 贴标签', '📦 放进箱子'),
          options: [
            { text: '只贴标签', score: 2 },
            { text: '只放箱子', score: 2 },
            { text: '先贴再放', score: 6 },
            { text: '不会', score: 0 }
          ]
        },
        {
          type: 'rule',
          score: 5,
          speak: '上班时随便乱跑，可以吗？',
          render: () => this.renderRuleScene('🏃', '上班时随便乱跑'),
          options: [
            { text: '可以', score: 0 },
            { text: '不可以', score: 5 },
            { text: '不知道', score: 0 }
          ]
        },
        {
          type: 'rule',
          score: 5,
          speak: '上班要穿工作服吗？',
          render: () => this.renderRuleScene('👔', '穿工作服上班'),
          options: [
            { text: '要', score: 5 },
            { text: '不要', score: 0 },
            { text: '随便', score: 0 }
          ]
        }
      ],
      focus: [
        {
          type: 'repeat',
          score: 6,
          speak: '请连续点击面饼放入袋中，重复五次',
          render: () => this.renderRepeatTask(),
          options: null
        },
        {
          type: 'attention',
          score: 5,
          speak: '请盯着这个图片十秒钟，不要点击其他地方',
          render: () => this.renderAttentionTask(),
          options: null
        },
        {
          type: 'match',
          score: 5,
          speak: '左边是红色盒子，请在右边选出一样的',
          render: () => this.renderMatchTask('#FF4D4F', '盒子'),
          options: null
        },
        {
          type: 'sort',
          score: 4,
          speak: '请把数字按从小到大的顺序排列，点击正确的顺序',
          render: () => this.renderSortTask(),
          options: null
        }
      ],
      adaptation: [
        {
          type: 'choice',
          score: 5,
          speak: '工厂是什么地方？',
          render: () => this.renderSceneChoice('🏭', '工厂'),
          options: [
            { text: '💼 工作的地方', score: 5 },
            { text: '🎮 玩的地方', score: 0 },
            { text: '🛏️ 睡觉的地方', score: 0 },
            { text: '❓ 不知道', score: 0 }
          ]
        },
        {
          type: 'choice',
          score: 5,
          speak: '上班的时候应该做什么？',
          render: () => this.renderSceneChoice('⏰', '上班时间'),
          options: [
            { text: '💪 认真干活', score: 5 },
            { text: '🚶 随便走动', score: 0 },
            { text: '😴 睡觉', score: 0 },
            { text: '📱 玩手机', score: 0 }
          ]
        },
        {
          type: 'choice',
          score: 5,
          speak: '机器在转，能不能用手碰？',
          render: () => this.renderSceneChoice('⚙️', '转动的机器'),
          options: [
            { text: '能碰', score: 0 },
            { text: '不能碰', score: 5 },
            { text: '不知道', score: 0 },
            { text: '看情况', score: 0 }
          ]
        },
        {
          type: 'choice',
          score: 5,
          speak: '老板说停下，你要怎么做？',
          render: () => this.renderSceneChoice('🛑', '老板说停下'),
          options: [
            { text: '马上停', score: 5 },
            { text: '继续做', score: 0 },
            { text: '不理他', score: 0 },
            { text: '等一下再停', score: 0 }
          ]
        }
      ],
      emotion: [
        {
          type: 'choice',
          score: 5,
          speak: '如果有人说"我很累"，这是什么意思？',
          render: () => this.renderEmotionScene('😫', '我很累'),
          options: [
            { text: '🛋️ 想休息', score: 5 },
            { text: '💧 想喝水', score: 0 },
            { text: '🍽️ 想吃饭', score: 0 },
            { text: '❓ 不知道', score: 0 }
          ]
        },
        {
          type: 'choice',
          score: 5,
          speak: '工作做不好的时候，应该怎么办？',
          render: () => this.renderEmotionScene('😟', '工作做不好'),
          options: [
            { text: '😠 发脾气', score: 0 },
            { text: '🆘 请人帮忙', score: 5 },
            { text: '🗑️ 扔掉东西', score: 0 },
            { text: '😢 哭', score: 0 }
          ]
        },
        {
          type: 'choice',
          score: 5,
          speak: '今天换一个岗位干活，可以吗？',
          render: () => this.renderEmotionScene('🔄', '换岗位'),
          options: [
            { text: '👍 可以试试', score: 5 },
            { text: '👎 不可以', score: 0 },
            { text: '😢 哭闹', score: 0 },
            { text: '🚪 不干了', score: 0 }
          ]
        },
        {
          type: 'choice',
          score: 5,
          speak: '不会做的时候，应该怎么办？',
          render: () => this.renderEmotionScene('❓', '不会做'),
          options: [
            { text: '🤝 找同事帮忙', score: 5 },
            { text: '🪑 坐着不动', score: 0 },
            { text: '❌ 乱做', score: 0 },
            { text: '🏠 回家', score: 0 }
          ]
        }
      ]
    };
  },

  // ======== 渲染方法 ========

  // 钟表
  renderClock(hour, minute) {
    const hourDeg = (hour % 12) * 30 + minute * 0.5;
    const minuteDeg = minute * 6;
    let nums = '';
    for (let i = 1; i <= 12; i++) {
      const angle = (i * 30 - 90) * Math.PI / 180;
      const x = 110 * Math.cos(angle) + 110 - 18;
      const y = 110 * Math.sin(angle) + 110 - 18;
      nums += `<div class="clock-number" style="left:${x}px;top:${y}px;font-size:1.2rem;">${i}</div>`;
    }
    return `<div class="clock-container" style="width:220px;height:220px;">
      ${nums}
      <div class="clock-hand clock-hand-hour" style="transform:rotate(${hourDeg}deg);height:55px;"></div>
      <div class="clock-hand clock-hand-minute" style="transform:rotate(${minuteDeg}deg);height:75px;"></div>
      <div class="clock-center"></div>
    </div>`;
  },

  // 显示单个图形（问"这是什么形状"）
  renderSingleShape(shape) {
    const shapes = {
      circle: '<circle cx="30" cy="30" r="22" fill="#4A90D9"/>',
      square: '<rect x="8" y="8" width="44" height="44" fill="#FF4D4F"/>',
      triangle: '<polygon points="30,8 52,52 8,52" fill="#52C41A"/>'
    };
    return `<div style="display:flex;justify-content:center;">
      <svg viewBox="0 0 60 60" width="120" height="120">${shapes[shape]}</svg>
    </div>`;
  },

  // 显示单个颜色（问"这是什么颜色"）
  renderSingleColor(color) {
    return `<div style="display:flex;justify-content:center;">
      <div style="width:120px;height:120px;background:${color};border-radius:24px;box-shadow:var(--shadow-lg);"></div>
    </div>`;
  },

  // 常见标志识别
  renderSign(emoji, label) {
    return `<div style="text-align:center;padding:24px;">
      <div style="font-size:5rem;margin-bottom:16px;">${emoji}</div>
      <div style="font-size:1.1rem;color:var(--text-secondary);">这是什么地方？</div>
    </div>`;
  },

  // 计数
  renderCount(count, emoji) {
    let items = '';
    for (let i = 0; i < count; i++) items += `<span style="font-size:2.2rem;margin:4px;">${emoji}</span>`;
    return `<div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;padding:20px;background:white;border-radius:16px;box-shadow:var(--shadow-sm);">${items}</div>`;
  },

  // 文字识别
  renderText(text) {
    return `<div style="display:flex;justify-content:center;padding:24px;">
      <div style="background:white;padding:24px 48px;border-radius:16px;box-shadow:var(--shadow-lg);border:3px solid var(--primary);">
        <span style="font-size:3rem;font-weight:900;color:var(--primary);">${text}</span>
      </div>
    </div>`;
  },

  // 单步指令
  renderInstruction(person, instruction, item) {
    return `<div style="display:flex;align-items:center;justify-content:center;gap:20px;padding:20px;">
      <span style="font-size:3rem;">${person}</span>
      <div style="font-size:1.5rem;font-weight:700;color:var(--primary);animation:pulse 1.5s infinite;">➡️ ${instruction}</div>
      <span style="font-size:3rem;">${item}</span>
    </div>`;
  },

  // 两步指令
  renderDoubleInstruction(step1, step2) {
    return `<div style="text-align:center;padding:20px;">
      <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:16px;">
        <span style="font-size:1.3rem;font-weight:700;background:#E6F7FF;padding:8px 16px;border-radius:10px;">第一步：${step1}</span>
        <span style="font-size:1.5rem;">➡️</span>
        <span style="font-size:1.3rem;font-weight:700;background:#F6FFED;padding:8px 16px;border-radius:10px;">第二步：${step2}</span>
      </div>
      <div style="font-size:3rem;">🧑‍🔧</div>
    </div>`;
  },

  // 规则场景
  renderRuleScene(emoji, scene) {
    return `<div style="text-align:center;padding:20px;">
      <div style="font-size:3.5rem;margin-bottom:12px;">${emoji}</div>
      <div style="font-size:1.2rem;font-weight:600;color:var(--text-primary);">${scene}</div>
    </div>`;
  },

  // 场景选择
  renderSceneChoice(emoji, scene) {
    return `<div style="text-align:center;padding:20px;">
      <div style="font-size:3.5rem;margin-bottom:12px;">${emoji}</div>
      <div style="font-size:1.2rem;font-weight:600;color:var(--text-primary);">${scene}</div>
    </div>`;
  },

  // 情绪场景
  renderEmotionScene(emoji, scene) {
    return `<div style="text-align:center;padding:20px;">
      <div style="font-size:3.5rem;margin-bottom:12px;">${emoji}</div>
      <div style="font-size:1.2rem;font-weight:600;color:var(--text-primary);">${scene}</div>
    </div>`;
  },

  // ======== 交互题渲染 ========

  // 重复操作题（点击面饼放入袋中5次）
  renderRepeatTask() {
    return `<div id="repeatTaskArea" style="text-align:center;padding:16px;">
      <div style="display:flex;align-items:center;justify-content:center;gap:24px;margin-bottom:16px;">
        <div id="repeatSource" style="font-size:3rem;cursor:pointer;animation:pulse 1s infinite;" onclick="Assessment.repeatClick()">🍜</div>
        <span style="font-size:2rem;">➡️</span>
        <div style="position:relative;">
          <span style="font-size:3rem;">📦</span>
          <div id="repeatCount" style="position:absolute;top:-8px;right:-8px;background:var(--primary);color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;">0</div>
        </div>
      </div>
      <div style="font-size:1rem;color:var(--text-secondary);">点击面饼放入袋中，需要放 5 个</div>
    </div>`;
  },

  repeatClickCount: 0,
  repeatClick() {
    this.repeatClickCount++;
    document.getElementById('repeatCount').textContent = this.repeatClickCount;
    App.playSound('success');

    if (this.repeatClickCount >= 5) {
      // 自动得分
      const score = 6;
      this.sectionScores.focus = (this.sectionScores.focus || 0) + score;
      App.toast('太棒了！全部完成！+6分', 'success');
      this.speak('太棒了！全部完成！');
      setTimeout(() => this.nextQuestion(), 1500);
    }
  },

  // 注意力维持题（盯着图片10秒）
  renderAttentionTask() {
    return `<div id="attentionArea" style="text-align:center;padding:16px;">
      <div style="font-size:4rem;margin-bottom:12px;">👁️</div>
      <div style="font-size:1.1rem;font-weight:600;margin-bottom:8px;">请盯着这个图片</div>
      <div style="position:relative;width:160px;height:160px;margin:0 auto;border-radius:16px;overflow:hidden;box-shadow:var(--shadow-lg);">
        <div style="width:100%;height:100%;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;">
          <span style="font-size:4rem;">🏭</span>
        </div>
        <div id="attentionTimer" style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.6);color:white;padding:4px 14px;border-radius:10px;font-size:0.9rem;">10秒</div>
      </div>
      <div style="font-size:0.9rem;color:var(--text-secondary);margin-top:8px;">倒计时结束后自动得分</div>
    </div>`;
  },

  startAttentionTimer() {
    let seconds = 10;
    const timer = setInterval(() => {
      seconds--;
      const el = document.getElementById('attentionTimer');
      if (el) el.textContent = seconds + '秒';
      if (seconds <= 0) {
        clearInterval(timer);
        this.sectionScores.focus = (this.sectionScores.focus || 0) + 5;
        App.toast('注意力测试完成！+5分', 'success');
        this.speak('做得好！');
        setTimeout(() => this.nextQuestion(), 1200);
      }
    }, 1000);
    // 存储以便清理
    this._attentionTimer = timer;
  },

  // 配对题
  renderMatchTask(color, label) {
    const colors = ['#FF4D4F', '#4A90D9', '#52C41A', '#FAAD14'];
    const shuffled = colors.sort(() => Math.random() - 0.5);
    return `<div id="matchArea" style="text-align:center;padding:16px;">
      <div style="font-size:1rem;color:var(--text-secondary);margin-bottom:12px;">左边是这个，请在右边选出一样的</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:32px;">
        <div style="text-align:center;">
          <div style="width:70px;height:70px;background:${color};border-radius:14px;margin:0 auto;box-shadow:var(--shadow-md);"></div>
          <div style="font-size:0.85rem;margin-top:4px;">这个</div>
        </div>
        <span style="font-size:1.5rem;">= ?</span>
        <div style="display:flex;gap:10px;">
          ${shuffled.map((c, i) => `
            <div onclick="Assessment.matchClick('${c}','${color}',this)" style="width:60px;height:60px;background:${c};border-radius:12px;cursor:pointer;box-shadow:var(--shadow-sm);transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"></div>
          `).join('')}
        </div>
      </div>
    </div>`;
  },

  matchClick(clicked, target, el) {
    if (clicked === target) {
      el.style.border = '4px solid var(--success)';
      this.sectionScores.focus = (this.sectionScores.focus || 0) + 5;
      App.playSound('success');
      App.toast('配对正确！+5分', 'success');
      this.speak('配对正确！');
      setTimeout(() => this.nextQuestion(), 1200);
    } else {
      el.style.border = '4px solid var(--danger)';
      el.style.opacity = '0.4';
      App.playSound('error');
      this.speak('不对，再试试');
    }
  },

  // 排序题
  renderSortTask() {
    const nums = [3, 1, 2];
    return `<div id="sortArea" style="text-align:center;padding:16px;">
      <div style="font-size:1rem;color:var(--text-secondary);margin-bottom:16px;">请按从小到大的顺序点击</div>
      <div id="sortSlots" style="display:flex;gap:12px;justify-content:center;margin-bottom:20px;">
        <div class="sort-slot" data-expected="1" style="width:64px;height:64px;border:3px dashed #CCC;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;color:var(--text-light);">?</div>
        <div class="sort-slot" data-expected="2" style="width:64px;height:64px;border:3px dashed #CCC;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;color:var(--text-light);">?</div>
        <div class="sort-slot" data-expected="3" style="width:64px;height:64px;border:3px dashed #CCC;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;color:var(--text-light);">?</div>
      </div>
      <div id="sortButtons" style="display:flex;gap:12px;justify-content:center;">
        ${nums.map(n => `
          <button onclick="Assessment.sortClick(${n},this)" style="width:64px;height:64px;border-radius:14px;border:3px solid var(--primary);background:white;font-size:1.8rem;font-weight:700;cursor:pointer;transition:all 0.2s;">${n}</button>
        `).join('')}
      </div>
    </div>`;
  },

  sortNextExpected: 1,
  sortClick(num, el) {
    if (num === this.sortNextExpected) {
      // 正确
      el.style.display = 'none';
      const slots = document.querySelectorAll('.sort-slot');
      const slot = slots[this.sortNextExpected - 1];
      slot.textContent = num;
      slot.style.border = '3px solid var(--success)';
      slot.style.background = '#F6FFED';
      slot.style.color = 'var(--success)';
      this.sortNextExpected++;
      App.playSound('success');

      if (this.sortNextExpected > 3) {
        this.sectionScores.focus = (this.sectionScores.focus || 0) + 4;
        App.toast('排序正确！+4分', 'success');
        this.speak('排序正确！');
        setTimeout(() => this.nextQuestion(), 1200);
      }
    } else {
      el.style.animation = 'shake 0.4s ease';
      App.playSound('error');
      this.speak('不对，再想想');
    }
  },

  // ======== 语音 ========
  speak(text) {
    if (!this.speechSynth) return;
    this.speechSynth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.85;
    this.speechSynth.speak(u);
  },

  speakAndStore(text) {
    this.currentSpeakText = text;
    this.speak(text);
  },

  repeatSpeak() {
    if (this.currentSpeakText) this.speak(this.currentSpeakText);
  },

  // ======== 核心流程 ========

  init() {
    // 清理旧数据格式兼容
    this.currentSectionIndex = 0;
    this.currentQuestionIndex = 0;
    this.sectionScores = {};
    this.repeatClickCount = 0;
    this.sortNextExpected = 1;
  },

  getCurrentSection() {
    return this.sections[this.currentSectionIndex];
  },

  getCurrentQuestions() {
    const sec = this.getCurrentSection();
    return this.getQuestions()[sec.id];
  },

  // 开始某个板块
  startSection(sectionId) {
    const idx = this.sections.findIndex(s => s.id === sectionId);
    if (idx === -1) return;

    // 检查顺序
    if (idx > this.currentSectionIndex) {
      App.toast('请先完成前面的板块', 'warning');
      return;
    }

    this.currentSectionIndex = idx;
    this.currentQuestionIndex = 0;
    this.sectionScores[sectionId] = 0;

    document.getElementById('assessmentIntro').classList.add('hidden');
    document.getElementById('assessmentResult').classList.add('hidden');
    document.getElementById('assessmentTest').classList.remove('hidden');

    const sec = this.getCurrentSection();
    document.getElementById('testTitle').textContent = `${sec.icon} ${sec.name}`;

    this.showQuestion();
    App.playSound('click');
  },

  showQuestion() {
    const sec = this.getCurrentSection();
    const questions = this.getCurrentQuestions();
    const q = questions[this.currentQuestionIndex];
    const total = questions.length;
    const progress = (this.currentQuestionIndex / total) * 100;

    document.getElementById('testProgress').style.width = progress + '%';

    const content = document.getElementById('testContent');

    if (q.options) {
      // 选择题
      content.innerHTML = `
        <div style="font-size:0.95rem;color:var(--text-secondary);margin-bottom:4px;">
          ${sec.icon} ${sec.name} · 第 ${this.currentQuestionIndex + 1}/${total} 题 · ${q.score}分
        </div>
        ${q.render()}
        <div class="answer-options" style="grid-template-columns: repeat(${q.options.length <= 2 ? 2 : 2}, 1fr); max-width:${q.options.length <= 2 ? '350px' : '500px'};">
          ${q.options.map((opt, i) => `
            <div class="answer-option" onclick="Assessment.selectOption(${i})" id="ans-${i}" style="font-size:1.05rem;">
              ${opt.text}
            </div>
          `).join('')}
        </div>
        <button class="btn btn-warning" onclick="Assessment.repeatSpeak()" style="margin-top:12px;font-size:0.95rem;padding:8px 20px;">🔊 再听一遍</button>
      `;
      this.speakAndStore(q.speak);
    } else {
      // 交互题
      content.innerHTML = `
        <div style="font-size:0.95rem;color:var(--text-secondary);margin-bottom:4px;">
          ${sec.icon} ${sec.name} · 第 ${this.currentQuestionIndex + 1}/${total} 题 · ${q.score}分
        </div>
        ${q.render()}
        <button class="btn btn-warning" onclick="Assessment.repeatSpeak()" style="margin-top:12px;font-size:0.95rem;padding:8px 20px;">🔊 再听一遍</button>
      `;
      this.speakAndStore(q.speak);

      // 启动交互题逻辑
      if (q.type === 'attention') {
        setTimeout(() => this.startAttentionTimer(), 500);
      }
      if (q.type === 'repeat') {
        this.repeatClickCount = 0;
      }
      if (q.type === 'sort') {
        this.sortNextExpected = 1;
      }
    }
  },

  _currentOptions: null,

  selectOption(index) {
    // 防重复
    if (document.querySelector('.answer-option.correct') || document.querySelector('.answer-option.wrong')) return;

    const questions = this.getCurrentQuestions();
    const q = questions[this.currentQuestionIndex];
    const opt = q.options[index];
    const sec = this.getCurrentSection();

    document.getElementById(`ans-${index}`).classList.add(opt.score > 0 ? 'correct' : 'wrong');
    if (opt.score === 0) {
      // 标出正确答案
      q.options.forEach((o, i) => {
        if (o.score > 0) document.getElementById(`ans-${i}`).classList.add('correct');
      });
    }

    this.sectionScores[sec.id] = (this.sectionScores[sec.id] || 0) + opt.score;

    if (opt.score > 0) {
      this.speak(`回答正确！得${opt.score}分`);
      App.playSound('success');
    } else {
      this.speak('不对哦，正确答案已标出');
      App.playSound('error');
    }

    setTimeout(() => this.nextQuestion(), 1500);
  },

  nextQuestion() {
    const questions = this.getCurrentQuestions();
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex >= questions.length) {
      this.finishSection();
    } else {
      this.showQuestion();
    }
  },

  finishSection() {
    if (this._attentionTimer) { clearInterval(this._attentionTimer); this._attentionTimer = null; }
    if (this.speechSynth) this.speechSynth.cancel();

    const sec = this.getCurrentSection();
    const score = this.sectionScores[sec.id] || 0;

    this.currentSectionIndex++;

    if (this.currentSectionIndex >= this.sections.length) {
      // 全部完成
      this.speak('所有评估都完成了，来看看结果吧！');
      setTimeout(() => this.showFinalResult(), 1500);
    } else {
      const nextSec = this.getCurrentSection();
      this.speak(`${sec.name}完成！得分${score}分。接下来是${nextSec.name}。`);

      document.getElementById('assessmentTest').classList.add('hidden');

      App.showModal({
        icon: score >= sec.maxScore * 0.7 ? '🌟' : score >= sec.maxScore * 0.4 ? '⭐' : '💪',
        title: `${sec.icon} ${sec.name} 完成！`,
        content: `
          <div style="text-align:center;padding:16px;">
            <div style="font-size:2.5rem;margin-bottom:8px;">${score >= sec.maxScore * 0.7 ? '🌟' : score >= sec.maxScore * 0.4 ? '⭐' : '💪'}</div>
            <p style="font-size:1.3rem;margin-bottom:4px;">得分：<strong>${score}</strong> / ${sec.maxScore} 分</p>
            <div style="margin-top:12px;padding:10px;background:var(--bg-cool);border-radius:10px;">
              <p style="font-size:0.95rem;color:var(--primary);">已完成 ${this.currentSectionIndex}/5 个板块</p>
              <p style="font-size:0.9rem;color:var(--text-secondary);margin-top:4px;">下一个：${nextSec.icon} ${nextSec.name}</p>
            </div>
          </div>
        `,
        buttons: [
          { text: `开始 ${nextSec.name}`, type: 'primary', onClick: () => {
            this.startSection(nextSec.id);
          }}
        ],
        closeOnBackdrop: false
      });
    }
  },

  showFinalResult() {
    document.getElementById('assessmentIntro').classList.add('hidden');
    document.getElementById('assessmentTest').classList.add('hidden');
    document.getElementById('assessmentResult').classList.remove('hidden');

    const totalScore = Object.values(this.sectionScores).reduce((a, b) => a + b, 0);
    const level = App.calculateLevel(totalScore);

    // 保存
    App.setUserLevel(level.id);
    App.store.set('assessment_total', totalScore);
    App.store.set('assessment_sections', this.sectionScores);

    // 历史
    const history = App.store.get('history', []);
    history.unshift({
      name: '员工',
      action: '完成状态评估',
      detail: `总分${totalScore}分 | 基础认知${this.sectionScores.cognition||0}分 | 指令理解${this.sectionScores.instruction||0}分 | 专注操作${this.sectionScores.focus||0}分 | 环境适应${this.sectionScores.adaptation||0}分 | 情绪表达${this.sectionScores.emotion||0}分 | 等级：${level.name}`,
      time: new Date().toLocaleString('zh-CN')
    });
    App.store.set('history', history.slice(0, 50));

    // 渲染结果
    const levelEmojis = { low: '🌱', medium: '⭐', high: '🏆' };
    const levelClasses = { low: 'level-low', medium: 'level-mid', high: 'level-high' };

    document.getElementById('resultEmoji').textContent = levelEmojis[level.id];
    document.getElementById('resultTitle').textContent = level.name;
    document.getElementById('resultText').textContent = level.description;

    document.getElementById('resultScores').innerHTML = this.sections.map(sec => `
      <div class="result-score-item">
        <div class="score-num" style="color:${(this.sectionScores[sec.id]||0) >= sec.maxScore*0.7 ? 'var(--success)' : (this.sectionScores[sec.id]||0) >= sec.maxScore*0.4 ? 'var(--warning)' : 'var(--danger)'};">${this.sectionScores[sec.id]||0}</div>
        <div class="score-name">${sec.icon} ${sec.name}</div>
      </div>
    `).join('');

    document.getElementById('resultLevel').innerHTML = `
      <div style="margin-bottom:8px;">
        <span class="level-badge ${levelClasses[level.id]}">${levelEmojis[level.id]} ${level.name} · 总分 ${totalScore}/100</span>
      </div>
      <div style="font-size:0.95rem;color:var(--text-secondary);margin-top:8px;">适配岗位：${level.jobs}</div>
    `;

    if (typeof updateLevelBadge === 'function') updateLevelBadge();
    this.speak(`评估完成！总分${totalScore}分，${level.name}。${level.description}`);
    App.playSound('complete');
  },

  resetAssessment() {
    if (this.speechSynth) this.speechSynth.cancel();
    if (this._attentionTimer) { clearInterval(this._attentionTimer); this._attentionTimer = null; }
    this.currentSectionIndex = 0;
    this.currentQuestionIndex = 0;
    this.sectionScores = {};
    this.repeatClickCount = 0;
    this.sortNextExpected = 1;

    document.getElementById('assessmentResult').classList.add('hidden');
    document.getElementById('assessmentTest').classList.add('hidden');
    document.getElementById('assessmentIntro').classList.remove('hidden');
    this.updateIntroUI();
  },

  updateIntroUI() {
    const grid = document.querySelector('.test-type-grid');
    if (!grid) return;

    grid.innerHTML = this.sections.map((sec, i) => {
      const isNext = i === this.currentSectionIndex;
      const locked = i > this.currentSectionIndex;
      const done = i < this.currentSectionIndex;

      return `
        <div class="test-type-card" onclick="${locked ? '' : `startSection('${sec.id}')`}"
             style="${done ? 'border-color:var(--success);background:#F6FFED;opacity:0.7;' :
                     isNext ? 'border-color:var(--primary);animation:pulse 2s infinite;' :
                     'opacity:0.4;cursor:not-allowed;'}">
          <div class="test-icon" style="font-size:2rem;">${done ? '✅' : locked ? '🔒' : sec.icon}</div>
          <div class="test-name">${sec.name}</div>
          <div style="font-size:0.8rem;color:var(--text-secondary);">${sec.maxScore}分</div>
          ${done ? `<div style="font-size:0.85rem;color:var(--success);">${this.sectionScores[sec.id]||0}分</div>` : ''}
          ${locked ? '<div style="font-size:0.75rem;color:var(--text-light);">请先完成前面的板块</div>' : ''}
        </div>
      `;
    }).join('');
  }
};

// 全局函数
function startSection(id) { Assessment.startSection(id); }
function resetAssessment() { Assessment.resetAssessment(); }
