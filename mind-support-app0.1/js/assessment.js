/* ============================================
   评估模块 - 时钟/图形/颜色/计数测试
   - 4个测试必须按顺序逐个完成
   - 图形/颜色后两题去掉图形提示（增加难度）
   - AI语音朗读题目 + 重复朗读按钮
   - 完成后记录员工状态到历史
   ============================================ */

const Assessment = {
  // 测试顺序：必须按此顺序完成
  testOrder: ['clock', 'shape', 'color', 'count'],
  currentTestIndex: 0,
  currentTest: null,
  currentQuestion: 0,
  scores: {},
  speechSynth: window.speechSynthesis || null,

  // ---- 初始化：根据已完成测试同步 currentTestIndex ----
  init() {
    let completedCount = 0;
    for (let i = 0; i < this.testOrder.length; i++) {
      if (App.store.get(`score_${this.testOrder[i]}`)) {
        completedCount++;
      } else {
        break;
      }
    }
    this.currentTestIndex = Math.min(completedCount, this.testOrder.length - 1);
  },

  // ---- 获取当前应做的测试类型 ----
  getCurrentTestType() {
    return this.testOrder[this.currentTestIndex];
  },

  // ---- 获取已完成的测试 ----
  getCompletedTests() {
    return this.testOrder.filter(t => App.store.get(`score_${t}`));
  },

  // ---- 开始测试（强制顺序） ----
  startTest(type) {
    const expectedType = this.getCurrentTestType();

    // 如果请求的类型不是当前应做的，提示
    if (type !== expectedType) {
      const completedCount = this.getCompletedTests().length;
      const completedNames = {
        clock: '🕐 看钟表',
        shape: '🔷 认图形',
        color: '🎨 辨颜色',
        count: '🔢 数一数'
      };

      if (completedCount >= 4) {
        App.toast('你已经完成了所有评估！', 'info');
        return;
      }

      App.showModal({
        icon: '📋',
        title: '请按顺序完成',
        content: `
          <div style="text-align:center; padding:16px;">
            <p style="font-size:1.1rem; margin-bottom:16px;">请先完成当前测试</p>
            <div style="display:flex; flex-direction:column; gap:8px; align-items:center;">
              ${this.testOrder.map((t, i) => {
                const done = App.store.get(`score_${t}`);
                const isCurrent = t === expectedType;
                return `<div style="padding:10px 20px; border-radius:10px; font-size:1.1rem; font-weight:600;
                  ${done ? 'background:#F6FFED; color:#389E0D;' : isCurrent ? 'background:#E6F7FF; color:#1890FF; animation:pulse 2s infinite;' : 'background:#F5F5F5; color:#999;'}">
                  ${done ? '✅' : isCurrent ? '👉' : '⬜'} ${completedNames[t]}
                </div>`;
              }).join('')}
            </div>
          </div>
        `,
        buttons: [
          { text: '好的', type: 'primary', onClick: () => {
            if (!App.store.get(`score_${expectedType}`)) {
              this.doStartTest(expectedType);
            }
          }}
        ]
      });
      return;
    }

    this.doStartTest(type);
  },

  // ---- 实际开始测试 ----
  doStartTest(type) {
    const questions = App.getAssessmentQuestions()[type];
    if (!questions) return;

    this.currentTest = type;
    this.currentQuestion = 0;
    this.scores[type] = { correct: 0, total: questions.questions.length };

    document.getElementById('assessmentIntro').classList.add('hidden');
    document.getElementById('assessmentResult').classList.add('hidden');
    document.getElementById('assessmentTest').classList.remove('hidden');

    document.getElementById('testTitle').textContent = `${questions.icon} ${questions.title}`;

    this.showQuestion();
    App.playSound('click');
  },

  // ---- 显示题目 ----
  showQuestion() {
    const type = this.getCurrentTestType();
    const questions = App.getAssessmentQuestions()[type];
    const q = questions.questions[this.currentQuestion];
    const total = questions.questions.length;

    // 更新进度
    const progress = ((this.currentQuestion) / total) * 100;
    document.getElementById('testProgress').style.width = progress + '%';

    switch (type) {
      case 'clock':
        this.renderClockQuestion(q, this.currentQuestion + 1, total);
        break;
      case 'shape':
        this.renderShapeQuestion(q, this.currentQuestion + 1, total);
        break;
      case 'color':
        this.renderColorQuestion(q, this.currentQuestion + 1, total);
        break;
      case 'count':
        this.renderCountQuestion(q, this.currentQuestion + 1, total);
        break;
    }
  },

  // ---- AI语音朗读 ----
  speak(text) {
    if (!this.speechSynth) return;
    // 先停止之前的朗读
    this.speechSynth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85; // 稍慢一点，方便理解
    utterance.pitch = 1.0;
    this.speechSynth.speak(utterance);
  },

  // ---- 重复朗读按钮HTML ----
  repeatButtonHTML() {
    if (!this.speechSynth) return '';
    return `
      <button class="btn btn-warning" onclick="Assessment.repeatSpeak()" style="margin-top:16px; font-size:1rem; padding:10px 24px;">
        🔊 再听一遍
      </button>
    `;
  },

  // ---- 保存当前朗读文本并朗读 ----
  currentSpeakText: '',
  speakAndStore(text) {
    this.currentSpeakText = text;
    this.speak(text);
  },

  // ---- 重复朗读 ----
  repeatSpeak() {
    if (this.currentSpeakText) {
      this.speak(this.currentSpeakText);
    }
  },

  // ---- 时钟题目 ----
  renderClockQuestion(q, num, total) {
    const content = document.getElementById('testContent');
    const hourDeg = (q.hour % 12) * 30 + q.minute * 0.5;
    const minuteDeg = q.minute * 6;

    const speakText = `第${num}题，这个钟表显示几点？请选择正确答案。`;

    content.innerHTML = `
      <div style="font-size:1.1rem; color:var(--text-secondary); margin-bottom:8px;">
        ${num} / ${total}
      </div>
      <div style="font-size:1.3rem; font-weight:700; margin-bottom:16px;">🕐 这个钟表显示几点？</div>
      <div class="clock-container">
        ${this.generateClockNumbers()}
        <div class="clock-hand clock-hand-hour" style="transform: rotate(${hourDeg}deg)"></div>
        <div class="clock-hand clock-hand-minute" style="transform: rotate(${minuteDeg}deg)"></div>
        <div class="clock-center"></div>
      </div>
      <div class="answer-options">
        ${q.options.map((opt, i) => `
          <div class="answer-option" onclick="Assessment.selectAnswer(${i}, ${q.correct})" id="ans-${i}">
            🕐 ${opt}
          </div>
        `).join('')}
      </div>
      ${this.repeatButtonHTML()}
    `;

    this.speakAndStore(speakText);
  },

  generateClockNumbers() {
    let html = '';
    const radius = 110;
    const centerX = 140;
    const centerY = 140;

    for (let i = 1; i <= 12; i++) {
      const angle = (i * 30 - 90) * Math.PI / 180;
      const x = centerX + radius * Math.cos(angle) - 18;
      const y = centerY + radius * Math.sin(angle) - 18;
      html += `<div class="clock-number" style="left:${x}px; top:${y}px;">${i}</div>`;
    }
    return html;
  },

  // ---- 图形题目（后两题去掉图形提示） ----
  renderShapeQuestion(q, num, total) {
    const content = document.getElementById('testContent');
    const shapeNames = { circle: '圆形', square: '正方形', triangle: '三角形', star: '星形' };

    // 前两题显示图形，后两题不显示
    const showShape = num <= 2;
    const shapeSVGs = {
      circle: '<svg viewBox="0 0 60 60" width="60" height="60"><circle cx="30" cy="30" r="25" fill="#4A90D9"/></svg>',
      square: '<svg viewBox="0 0 60 60" width="60" height="60"><rect x="5" y="5" width="50" height="50" fill="#FF4D4F"/></svg>',
      triangle: '<svg viewBox="0 0 60 60" width="60" height="60"><polygon points="30,5 55,55 5,55" fill="#52C41A"/></svg>',
      star: '<svg viewBox="0 0 60 60" width="60" height="60"><polygon points="30,5 36,22 55,22 40,34 46,52 30,42 14,52 20,34 5,22 24,22" fill="#FAAD14"/></svg>'
    };

    const speakText = `第${num}题，这是什么形状？请选择正确答案。`;

    let shapeDisplay = '';
    if (showShape) {
      shapeDisplay = `
        <div style="display:flex; justify-content:center; margin:24px 0;">
          <div style="width:120px; height:120px; display:flex; align-items:center; justify-content:center; background:white; border-radius:16px; box-shadow:var(--shadow-md);">
            ${shapeSVGs[q.target]}
          </div>
        </div>
      `;
    } else {
      shapeDisplay = `
        <div style="display:flex; justify-content:center; margin:24px 0;">
          <div style="width:120px; height:120px; display:flex; align-items:center; justify-content:center; background:var(--bg-main); border-radius:16px; border:3px dashed #CCC;">
            <span style="font-size:2rem; color:var(--text-light);">❓</span>
          </div>
        </div>
      `;
    }

    content.innerHTML = `
      <div style="font-size:1.1rem; color:var(--text-secondary); margin-bottom:8px;">
        ${num} / ${total}
      </div>
      <div style="font-size:1.3rem; font-weight:700; margin-bottom:16px;">🔷 这个是什么形状？</div>
      ${shapeDisplay}
      <div class="answer-options">
        ${q.options.map((opt, i) => `
          <div class="answer-option" onclick="Assessment.selectAnswer(${i}, ${q.correct})" id="ans-${i}">
            ${shapeSVGs[opt]}
            <div style="margin-top:8px; font-size:1.1rem;">${shapeNames[opt]}</div>
          </div>
        `).join('')}
      </div>
      ${this.repeatButtonHTML()}
    `;

    this.speakAndStore(speakText);
  },

  // ---- 颜色题目（后两题去掉颜色提示） ----
  renderColorQuestion(q, num, total) {
    const content = document.getElementById('testContent');
    const colorNames = {
      '#FF4D4F': '红色',
      '#52C41A': '绿色',
      '#4A90D9': '蓝色',
      '#FAAD14': '黄色'
    };

    // 前两题显示颜色，后两题不显示
    const showColor = num <= 2;

    const speakText = `第${num}题，这是什么颜色？请选择正确答案。`;

    let colorDisplay = '';
    if (showColor) {
      colorDisplay = `
        <div style="display:flex; justify-content:center; margin:24px 0;">
          <div style="width:120px; height:120px; background:${q.target}; border-radius:24px; box-shadow:var(--shadow-lg);"></div>
        </div>
      `;
    } else {
      colorDisplay = `
        <div style="display:flex; justify-content:center; margin:24px 0;">
          <div style="width:120px; height:120px; background:var(--bg-main); border-radius:24px; border:3px dashed #CCC; display:flex; align-items:center; justify-content:center;">
            <span style="font-size:2rem; color:var(--text-light);">❓</span>
          </div>
        </div>
      `;
    }

    content.innerHTML = `
      <div style="font-size:1.1rem; color:var(--text-secondary); margin-bottom:8px;">
        ${num} / ${total}
      </div>
      <div style="font-size:1.3rem; font-weight:700; margin-bottom:16px;">🎨 这个是什么颜色？</div>
      ${colorDisplay}
      <div class="color-grid" style="grid-template-columns: repeat(2, 1fr); max-width:300px;">
        ${q.options.map((color, i) => `
          <div class="answer-option" onclick="Assessment.selectAnswer(${i}, ${q.correct})" id="ans-${i}"
               style="display:flex; align-items:center; gap:12px; padding:16px;">
            <div style="width:50px; height:50px; background:${color}; border-radius:12px; flex-shrink:0;"></div>
            <span style="font-size:1.1rem;">${colorNames[color]}</span>
          </div>
        `).join('')}
      </div>
      ${this.repeatButtonHTML()}
    `;

    this.speakAndStore(speakText);
  },

  // ---- 计数题目 ----
  renderCountQuestion(q, num, total) {
    const content = document.getElementById('testContent');
    const emojis = ['🍎', '🌟', '🎈', '🧸', '🍪', '🌺', '🐟', '🦋', '🍎', '🌟'];

    let items = '';
    const emoji = emojis[App.random(0, emojis.length - 1)];
    for (let i = 0; i < q.count; i++) {
      items += `<span class="count-item">${emoji}</span>`;
    }

    const speakText = `第${num}题，数一数，这里有几个？请选择正确答案。`;

    content.innerHTML = `
      <div style="font-size:1.1rem; color:var(--text-secondary); margin-bottom:8px;">
        ${num} / ${total}
      </div>
      <div style="font-size:1.3rem; font-weight:700; margin-bottom:16px;">🔢 数一数有几个？</div>
      <div class="count-display">
        ${items}
      </div>
      <div class="answer-options" style="grid-template-columns: repeat(2, 1fr); max-width:350px;">
        ${q.options.map((opt, i) => `
          <div class="answer-option" onclick="Assessment.selectAnswer(${i}, ${q.correct})" id="ans-${i}" style="font-size:1.5rem;">
            ${opt}
          </div>
        `).join('')}
      </div>
      ${this.repeatButtonHTML()}
    `;

    this.speakAndStore(speakText);
  },

  // ---- 选择答案 ----
  selectAnswer(selected, correct) {
    // 防止重复点击
    const options = document.querySelectorAll('.answer-option');
    let alreadyAnswered = false;
    options.forEach(opt => {
      if (opt.classList.contains('correct') || opt.classList.contains('wrong')) {
        alreadyAnswered = true;
      }
    });
    if (alreadyAnswered) return;

    const isCorrect = selected === correct;

    // 显示正确/错误
    document.getElementById(`ans-${selected}`).classList.add(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) {
      document.getElementById(`ans-${correct}`).classList.add('correct');
    }

    // 语音反馈
    if (isCorrect) {
      this.scores[this.currentTest].correct++;
      this.speak('回答正确，真棒！');
      App.playSound('success');
    } else {
      this.speak('不对哦，正确答案已标出。');
      App.playSound('error');
    }

    // 延迟后进入下一题
    setTimeout(() => {
      this.nextQuestion();
    }, 1800);
  },

  // ---- 下一题 ----
  nextQuestion() {
    const type = this.getCurrentTestType();
    const questions = App.getAssessmentQuestions()[type];
    this.currentQuestion++;

    if (this.currentQuestion >= questions.questions.length) {
      this.finishCurrentTest();
    } else {
      this.showQuestion();
    }
  },

  // ---- 完成当前测试 ----
  finishCurrentTest() {
    const type = this.getCurrentTestType();
    const score = this.scores[type];
    const percent = Math.round((score.correct / score.total) * 100);

    // 保存分数
    App.store.set(`score_${type}`, { correct: score.correct, total: score.total, percent });

    // 停止语音
    if (this.speechSynth) this.speechSynth.cancel();

    const testNames = {
      clock: '🕐 看钟表',
      shape: '🔷 认图形',
      color: '🎨 辨颜色',
      count: '🔢 数一数'
    };

    const completedCount = this.getCompletedTests().length;

    if (completedCount >= 4) {
      // 全部4个完成，显示最终结果
      this.speak('太棒了！所有评估都完成了，让我们看看结果。');
      setTimeout(() => {
        this.showFinalResult();
      }, 2000);
    } else {
      // 还有测试要做，自动进入下一个
      this.currentTestIndex++;
      const nextType = this.getCurrentTestType();

      this.speak(`${testNames[type]}测试完成！得分${percent}分。接下来请做${testNames[nextType]}。`);

      document.getElementById('assessmentTest').classList.add('hidden');

      App.showModal({
        icon: percent >= 80 ? '🌟' : percent >= 50 ? '⭐' : '💪',
        title: `${testNames[type]} 完成！`,
        content: `
          <div style="text-align:center; padding:16px;">
            <div style="font-size:3rem; margin-bottom:12px;">${percent >= 80 ? '🌟' : percent >= 50 ? '⭐' : '💪'}</div>
            <p style="font-size:1.3rem; margin-bottom:8px;">得分：${percent}分</p>
            <p style="color:var(--text-secondary);">答对 ${score.correct}/${score.total} 题</p>
            <div style="margin-top:16px; padding:12px; background:var(--bg-cool); border-radius:12px;">
              <p style="font-size:1rem; color:var(--primary);">已完成 ${completedCount}/4 项测试</p>
              <p style="font-size:0.9rem; color:var(--text-secondary); margin-top:4px;">下一项：${testNames[nextType]}</p>
            </div>
          </div>
        `,
        buttons: [
          { text: `开始 ${testNames[nextType]}`, type: 'primary', onClick: () => {
            this.doStartTest(nextType);
          }}
        ],
        closeOnBackdrop: false
      });
    }
  },

  // ---- 显示最终结果 ----
  showFinalResult() {
    document.getElementById('assessmentIntro').classList.add('hidden');
    document.getElementById('assessmentTest').classList.add('hidden');
    document.getElementById('assessmentResult').classList.remove('hidden');

    const tests = [
      { key: 'clock', name: '时钟识别', icon: '🕐' },
      { key: 'shape', name: '图形识别', icon: '🔷' },
      { key: 'color', name: '颜色识别', icon: '🎨' },
      { key: 'count', name: '计数能力', icon: '🔢' }
    ];

    const scores = [];
    const scoresContainer = document.getElementById('resultScores');

    scoresContainer.innerHTML = tests.map(test => {
      const result = App.store.get(`score_${test.key}`, { correct: 0, total: 1, percent: 0 });
      scores.push(result.percent);
      return `
        <div class="result-score-item">
          <div class="score-num">${result.percent}</div>
          <div class="score-name">${test.icon} ${test.name}</div>
        </div>
      `;
    }).join('');

    // 计算等级
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const level = App.calculateLevel(scores);

    // 保存等级
    App.setUserLevel(level.id);

    // 记录员工评估状态到历史
    const history = App.store.get('history', []);
    history.unshift({
      name: '员工',
      action: '完成状态评估',
      detail: `时钟${App.store.get('score_clock', {}).percent || 0}分 | 图形${App.store.get('score_shape', {}).percent || 0}分 | 颜色${App.store.get('score_color', {}).percent || 0}分 | 计数${App.store.get('score_count', {}).percent || 0}分 | 综合等级：${level.name}`,
      time: new Date().toLocaleString('zh-CN')
    });
    App.store.set('history', history.slice(0, 50));

    const levelEmojis = { low: '🌱', medium: '⭐', high: '🏆' };
    const resultEmoji = document.getElementById('resultEmoji');
    const resultTitle = document.getElementById('resultTitle');
    const resultText = document.getElementById('resultText');
    const resultLevel = document.getElementById('resultLevel');

    resultEmoji.textContent = levelEmojis[level.id];
    resultTitle.textContent = `${level.name}`;
    resultText.textContent = level.description;

    const levelClasses = { low: 'level-low', medium: 'level-mid', high: 'level-high' };
    resultLevel.innerHTML = `<span class="level-badge ${levelClasses[level.id]}">${levelEmojis[level.id]} ${level.name} - 平均${Math.round(avg)}分</span>`;

    // 更新首页等级显示
    if (typeof updateLevelBadge === 'function') {
      updateLevelBadge();
    }

    // 语音播报结果
    this.speak(`评估完成！你的综合等级是${level.name}，平均${Math.round(avg)}分。${level.description}`);

    App.playSound('complete');
  },

  // ---- 重置评估 ----
  resetAssessment() {
    if (this.speechSynth) this.speechSynth.cancel();

    ['clock', 'shape', 'color', 'count'].forEach(t => {
      App.store.remove(`score_${t}`);
    });
    this.currentTestIndex = 0;
    this.currentQuestion = 0;
    this.scores = {};

    document.getElementById('assessmentResult').classList.add('hidden');
    document.getElementById('assessmentTest').classList.add('hidden');
    document.getElementById('assessmentIntro').classList.remove('hidden');

    this.updateIntroUI();
  },

  // ---- 更新评估介绍页面的UI（显示完成状态） ----
  updateIntroUI() {
    const grid = document.querySelector('.test-type-grid');
    if (!grid) return;

    const testNames = {
      clock: { icon: '🕐', name: '看钟表' },
      shape: { icon: '🔷', name: '认图形' },
      color: { icon: '🎨', name: '辨颜色' },
      count: { icon: '🔢', name: '数一数' }
    };

    grid.innerHTML = this.testOrder.map((type, i) => {
      const info = testNames[type];
      const done = App.store.get(`score_${type}`);
      const isNext = !done && i === this.currentTestIndex;
      const locked = !done && !isNext;

      return `
        <div class="test-type-card" onclick="${locked ? '' : `startTest('${type}')`}"
             style="${done ? 'border-color:var(--success); background:#F6FFED; opacity:0.7;' :
                     isNext ? 'border-color:var(--primary); animation:pulse 2s infinite;' :
                     'opacity:0.4; cursor:not-allowed;'}">
          <div class="test-icon">${done ? '✅' : locked ? '🔒' : info.icon}</div>
          <div class="test-name">${info.name}</div>
          ${done ? `<div style="font-size:0.85rem; color:var(--success); margin-top:4px;">${done.percent}分</div>` : ''}
          ${locked ? '<div style="font-size:0.8rem; color:var(--text-light); margin-top:4px;">请先完成前面的测试</div>' : ''}
        </div>
      `;
    }).join('');
  }
};

// 全局函数
function startTest(type) {
  Assessment.startTest(type);
}

function resetAssessment() {
  Assessment.resetAssessment();
}
