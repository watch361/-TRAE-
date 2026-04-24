/* ============================================
   评估模块 - 时钟/图形/颜色/计数测试
   图形化界面，尽量少文字
   ============================================ */

const Assessment = {
  currentTest: null,
  currentQuestion: 0,
  scores: {},
  totalQuestions: 0,
  correctCount: 0,

  // ---- 开始测试 ----
  startTest(type) {
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
    const questions = App.getAssessmentQuestions()[this.currentTest];
    const q = questions.questions[this.currentQuestion];
    const total = questions.questions.length;

    // 更新进度
    const progress = ((this.currentQuestion) / total) * 100;
    document.getElementById('testProgress').style.width = progress + '%';

    const content = document.getElementById('testContent');

    switch (this.currentTest) {
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

  // ---- 时钟题目 ----
  renderClockQuestion(q, num, total) {
    const content = document.getElementById('testContent');
    const hourDeg = (q.hour % 12) * 30 + q.minute * 0.5;
    const minuteDeg = q.minute * 6;

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
    `;
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

  // ---- 图形题目 ----
  renderShapeQuestion(q, num, total) {
    const content = document.getElementById('testContent');
    const shapeSVGs = {
      circle: '<svg viewBox="0 0 60 60" width="60" height="60"><circle cx="30" cy="30" r="25" fill="#4A90D9"/></svg>',
      square: '<svg viewBox="0 0 60 60" width="60" height="60"><rect x="5" y="5" width="50" height="50" fill="#FF4D4F"/></svg>',
      triangle: '<svg viewBox="0 0 60 60" width="60" height="60"><polygon points="30,5 55,55 5,55" fill="#52C41A"/></svg>',
      star: '<svg viewBox="0 0 60 60" width="60" height="60"><polygon points="30,5 36,22 55,22 40,34 46,52 30,42 14,52 20,34 5,22 24,22" fill="#FAAD14"/></svg>'
    };

    const shapeNames = { circle: '圆形', square: '正方形', triangle: '三角形', star: '星形' };

    content.innerHTML = `
      <div style="font-size:1.1rem; color:var(--text-secondary); margin-bottom:8px;">
        ${num} / ${total}
      </div>
      <div style="font-size:1.3rem; font-weight:700; margin-bottom:16px;">🔷 这个是什么形状？</div>
      <div style="display:flex; justify-content:center; margin:24px 0;">
        <div style="width:120px; height:120px; display:flex; align-items:center; justify-content:center; background:white; border-radius:16px; box-shadow:var(--shadow-md);">
          ${shapeSVGs[q.target]}
        </div>
      </div>
      <div class="answer-options">
        ${q.options.map((opt, i) => `
          <div class="answer-option" onclick="Assessment.selectAnswer(${i}, ${q.correct})" id="ans-${i}">
            ${shapeSVGs[opt]}
            <div style="margin-top:8px; font-size:1.1rem;">${shapeNames[opt]}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // ---- 颜色题目 ----
  renderColorQuestion(q, num, total) {
    const content = document.getElementById('testContent');
    const colorNames = {
      '#FF4D4F': '红色',
      '#52C41A': '绿色',
      '#4A90D9': '蓝色',
      '#FAAD14': '黄色'
    };

    content.innerHTML = `
      <div style="font-size:1.1rem; color:var(--text-secondary); margin-bottom:8px;">
        ${num} / ${total}
      </div>
      <div style="font-size:1.3rem; font-weight:700; margin-bottom:16px;">🎨 这个是什么颜色？</div>
      <div style="display:flex; justify-content:center; margin:24px 0;">
        <div style="width:120px; height:120px; background:${q.target}; border-radius:24px; box-shadow:var(--shadow-lg);"></div>
      </div>
      <div class="color-grid" style="grid-template-columns: repeat(2, 1fr); max-width:300px;">
        ${q.options.map((color, i) => `
          <div class="answer-option" onclick="Assessment.selectAnswer(${i}, ${q.correct})" id="ans-${i}"
               style="display:flex; align-items:center; gap:12px; padding:16px;">
            <div style="width:50px; height:50px; background:${color}; border-radius:12px; flex-shrink:0;"></div>
            <span style="font-size:1.1rem;">${colorNames[color]}</span>
          </div>
        `).join('')}
      </div>
    `;
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
    `;
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

    if (isCorrect) {
      this.scores[this.currentTest].correct++;
      App.playSound('success');
    } else {
      App.playSound('error');
    }

    // 延迟后进入下一题
    setTimeout(() => {
      this.nextQuestion();
    }, 1200);
  },

  // ---- 下一题 ----
  nextQuestion() {
    const questions = App.getAssessmentQuestions()[this.currentTest];
    this.currentQuestion++;

    if (this.currentQuestion >= questions.questions.length) {
      this.finishTest();
    } else {
      this.showQuestion();
    }
  },

  // ---- 完成单个测试 ----
  finishTest() {
    const score = this.scores[this.currentTest];
    const percent = Math.round((score.correct / score.total) * 100);

    // 保存分数
    App.store.set(`score_${this.currentTest}`, { correct: score.correct, total: score.total, percent });

    // 检查是否所有测试都完成
    const allTests = ['clock', 'shape', 'color', 'count'];
    const completedTests = allTests.filter(t => App.store.get(`score_${t}`));

    if (completedTests.length >= 2) {
      this.showFinalResult();
    } else {
      // 返回测试选择
      document.getElementById('assessmentTest').classList.add('hidden');
      document.getElementById('assessmentIntro').classList.remove('hidden');

      App.showModal({
        icon: '🎉',
        title: '测试完成！',
        content: `
          <div style="text-align:center;">
            <div style="font-size:3rem; margin-bottom:12px;">${percent >= 80 ? '🌟' : percent >= 50 ? '⭐' : '💪'}</div>
            <p style="font-size:1.2rem; margin-bottom:8px;">得分：${percent}分</p>
            <p style="color:var(--text-secondary);">答对 ${score.correct}/${score.total} 题</p>
            <p style="color:var(--text-secondary); margin-top:12px;">已完成 ${completedTests.length}/4 项测试</p>
          </div>
        `,
        buttons: [
          { text: '继续测试', type: 'primary', onClick: () => {
            document.getElementById('assessmentIntro').classList.remove('hidden');
          }},
          { text: '查看结果', type: 'outline', onClick: () => {
            this.showFinalResult();
          }}
        ]
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

    App.playSound('complete');
  },

  // ---- 重置评估 ----
  resetAssessment() {
    ['clock', 'shape', 'color', 'count'].forEach(t => {
      App.store.remove(`score_${t}`);
    });
    this.currentTest = null;
    this.currentQuestion = 0;
    this.scores = {};

    document.getElementById('assessmentResult').classList.add('hidden');
    document.getElementById('assessmentTest').classList.add('hidden');
    document.getElementById('assessmentIntro').classList.remove('hidden');
  }
};

// 全局函数
function startTest(type) {
  Assessment.startTest(type);
}

function resetAssessment() {
  Assessment.resetAssessment();
}
