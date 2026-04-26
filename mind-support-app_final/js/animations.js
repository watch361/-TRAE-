/* ============================================
   工作步骤动画生成器
   根据步骤类型生成对应的CSS动画场景
   ============================================ */

const StepAnimation = {

  // ---- 根据步骤标题关键词匹配动画 ----
  getAnimation(stepTitle, stepDesc) {
    const title = stepTitle + stepDesc;

    // 走路/到工位
    if (title.includes('走到') || title.includes('工位')) {
      return this.walkToWork();
    }
    // 洗手
    if (title.includes('洗手') || title.includes('洗干净')) {
      return this.washHands();
    }
    // 戴手套
    if (title.includes('手套') || title.includes('护具')) {
      return this.putOnGloves();
    }
    // 拿/取
    if ((title.includes('拿') || title.includes('取')) && !title.includes('放')) {
      return this.pickUp();
    }
    // 检查/看
    if (title.includes('检查') || title.includes('看') || title.includes('确认') || title.includes('质检')) {
      return this.checkItem();
    }
    // 放入/放好
    if (title.includes('放入') || title.includes('放好') || title.includes('放回') || title.includes('装箱')) {
      return this.putDown();
    }
    // 封口/贴胶带
    if (title.includes('封') || title.includes('胶带') || title.includes('贴')) {
      return this.sealBox();
    }
    // 完成
    if (title.includes('完成') || title.includes('太棒')) {
      return this.celebrate();
    }
    // 安装/按
    if (title.includes('安装') || title.includes('按') || title.includes('对准')) {
      return this.install();
    }
    // 分类
    if (title.includes('分类') || title.includes('识别颜色')) {
      return this.sortItems();
    }

    // 默认：通用工作动画
    return this.genericWork();
  },

  // ---- 场景：走到工位 ----
  walkToWork() {
    return `
      <div class="anim-scene">
        <div class="anim-ground"></div>
        <div class="anim-person anim-walk" style="bottom:62px;">🧑‍🔧</div>
        <div class="anim-arrow" style="left:55%; bottom:100px;">➡️</div>
        <div class="anim-item anim-float" style="right:15%; bottom:62px; font-size:2rem;">📦</div>
        <div class="anim-label">走向工作位置</div>
      </div>
    `;
  },

  // ---- 场景：洗手 ----
  washHands() {
    return `
      <div class="anim-scene">
        <div class="anim-ground"></div>
        <div class="anim-person" style="left:42%; bottom:62px;">🧑‍🔧</div>
        <div class="anim-item" style="left:52%; bottom:90px; font-size:2rem;">🚰</div>
        <div class="anim-water" style="left:55%; bottom:120px; animation-delay:0s;">💧</div>
        <div class="anim-water" style="left:58%; bottom:120px; animation-delay:0.3s;">💧</div>
        <div class="anim-water" style="left:61%; bottom:120px; animation-delay:0.6s;">💧</div>
        <div class="anim-sparkle" style="left:56%; bottom:130px; animation-delay:0.2s;">✨</div>
        <div class="anim-sparkle" style="left:62%; bottom:125px; animation-delay:0.7s;">✨</div>
        <div class="anim-label">认真洗手</div>
      </div>
    `;
  },

  // ---- 场景：戴手套 ----
  putOnGloves() {
    return `
      <div class="anim-scene">
        <div class="anim-ground"></div>
        <div class="anim-person" style="left:35%; bottom:62px;">🧑‍🔧</div>
        <div class="anim-item anim-pulse" style="left:55%; bottom:80px; font-size:2rem;">🧤</div>
        <div class="anim-arrow" style="left:48%; bottom:95px;">👆</div>
        <div class="anim-label">戴上手套</div>
      </div>
    `;
  },

  // ---- 场景：拿取物品 ----
  pickUp() {
    return `
      <div class="anim-scene">
        <div class="anim-ground"></div>
        <div class="anim-table"></div>
        <div class="anim-person" style="left:30%; bottom:74px;">🧑‍🔧</div>
        <div class="anim-item anim-reach" style="left:48%; bottom:74px; font-size:2.5rem;">🤲</div>
        <div class="anim-item anim-float" style="left:60%; bottom:64px; font-size:2rem;">📦</div>
        <div class="anim-arrow" style="left:53%; bottom:100px; font-size:1.2rem;">⬇️</div>
        <div class="anim-label">拿取物品</div>
      </div>
    `;
  },

  // ---- 场景：检查/查看 ----
  checkItem() {
    return `
      <div class="anim-scene">
        <div class="anim-ground"></div>
        <div class="anim-table"></div>
        <div class="anim-person anim-look" style="left:35%; bottom:74px;">🧑‍🔧</div>
        <div class="anim-item anim-shake" style="left:55%; bottom:64px; font-size:2rem;">📦</div>
        <div class="anim-sparkle" style="left:58%; bottom:90px; animation-delay:0s;">👀</div>
        <div class="anim-sparkle" style="left:50%; bottom:95px; animation-delay:0.5s;">✨</div>
        <div class="anim-label">仔细检查</div>
      </div>
    `;
  },

  // ---- 场景：放入物品 ----
  putDown() {
    return `
      <div class="anim-scene">
        <div class="anim-ground"></div>
        <div class="anim-table"></div>
        <div class="anim-person" style="left:30%; bottom:74px;">🧑‍🔧</div>
        <div class="anim-item" style="left:48%; bottom:74px; font-size:2rem;">🤲</div>
        <div class="anim-item anim-place" style="left:58%; bottom:64px; font-size:2rem;">📦</div>
        <div class="anim-arrow" style="left:53%; bottom:100px; font-size:1.2rem;">⬇️</div>
        <div class="anim-sparkle" style="left:62%; bottom:85px; animation-delay:0.8s;">✨</div>
        <div class="anim-label">轻轻放下</div>
      </div>
    `;
  },

  // ---- 场景：封口/贴胶带 ----
  sealBox() {
    return `
      <div class="anim-scene">
        <div class="anim-ground"></div>
        <div class="anim-table"></div>
        <div class="anim-person" style="left:25%; bottom:74px;">🧑‍🔧</div>
        <div class="anim-item" style="left:42%; bottom:64px; font-size:2rem;">📦</div>
        <div class="anim-item anim-press" style="left:55%; bottom:74px; font-size:2rem;">✋</div>
        <div class="anim-item" style="left:65%; bottom:64px; font-size:1.5rem;">📎</div>
        <div class="anim-sparkle" style="left:45%; bottom:88px; animation-delay:0.3s;">✨</div>
        <div class="anim-sparkle" style="left:50%; bottom:92px; animation-delay:0.8s;">✨</div>
        <div class="anim-label">封好盒子</div>
      </div>
    `;
  },

  // ---- 场景：完成/庆祝 ----
  celebrate() {
    return `
      <div class="anim-scene" style="background: linear-gradient(180deg, #FFF9C4 0%, #FFF7E6 50%, #C8E6C9 100%);">
        <div class="anim-ground"></div>
        <div class="anim-person anim-celebrate" style="left:38%; bottom:62px;">🧑‍🔧</div>
        <div class="anim-sparkle" style="left:25%; bottom:120px; animation-delay:0s;">🎉</div>
        <div class="anim-sparkle" style="left:55%; bottom:130px; animation-delay:0.3s;">⭐</div>
        <div class="anim-sparkle" style="left:70%; bottom:110px; animation-delay:0.6s;">✨</div>
        <div class="anim-sparkle" style="left:35%; bottom:140px; animation-delay:0.9s;">🎊</div>
        <div class="anim-sparkle" style="left:60%; bottom:145px; animation-delay:0.4s;">⭐</div>
        <div class="anim-item anim-float" style="left:55%; bottom:62px; font-size:2rem;">✅</div>
        <div class="anim-label" style="color:var(--success);">太棒了！🎉</div>
      </div>
    `;
  },

  // ---- 场景：安装/按压 ----
  install() {
    return `
      <div class="anim-scene">
        <div class="anim-ground"></div>
        <div class="anim-table"></div>
        <div class="anim-person" style="left:25%; bottom:74px;">🧑‍🔧</div>
        <div class="anim-item" style="left:45%; bottom:64px; font-size:2rem;">⚙️</div>
        <div class="anim-item anim-press" style="left:55%; bottom:74px; font-size:2rem;">👆</div>
        <div class="anim-sparkle" style="left:50%; bottom:90px; animation-delay:0.5s;">✨</div>
        <div class="anim-sparkle" style="left:48%; bottom:95px; animation-delay:1s;">✨</div>
        <div class="anim-label">安装零件</div>
      </div>
    `;
  },

  // ---- 场景：分类 ----
  sortItems() {
    return `
      <div class="anim-scene">
        <div class="anim-ground"></div>
        <div class="anim-person" style="left:25%; bottom:62px;">🧑‍🔧</div>
        <div class="anim-item" style="left:42%; bottom:74px; font-size:2rem;">🤲</div>
        <div class="anim-item anim-float" style="left:60%; bottom:62px; font-size:1.8rem; animation-delay:0s;">🔴</div>
        <div class="anim-item anim-float" style="left:72%; bottom:62px; font-size:1.8rem; animation-delay:0.3s;">🟢</div>
        <div class="anim-item anim-float" style="left:84%; bottom:62px; font-size:1.8rem; animation-delay:0.6s;">🔵</div>
        <div class="anim-arrow" style="left:52%; bottom:100px;">➡️</div>
        <div class="anim-label">分类放置</div>
      </div>
    `;
  },

  // ---- 场景：传送带 ----
  conveyorBelt() {
    return `
      <div class="anim-scene">
        <div class="anim-ground"></div>
        <div class="anim-conveyor"></div>
        <div class="anim-item anim-conveyor-item" style="bottom:68px; font-size:1.8rem;">⚙️</div>
        <div class="anim-person" style="left:40%; bottom:68px;">🧑‍🔧</div>
        <div class="anim-item anim-reach" style="left:52%; bottom:68px; font-size:2rem;">🤲</div>
        <div class="anim-label">流水线作业</div>
      </div>
    `;
  },

  // ---- 通用工作场景 ----
  genericWork() {
    return `
      <div class="anim-scene">
        <div class="anim-ground"></div>
        <div class="anim-table"></div>
        <div class="anim-person" style="left:30%; bottom:74px;">🧑‍🔧</div>
        <div class="anim-item anim-pulse" style="left:55%; bottom:64px; font-size:2rem;">📦</div>
        <div class="anim-sparkle" style="left:58%; bottom:90px; animation-delay:0.5s;">✨</div>
        <div class="anim-label">认真工作中</div>
      </div>
    `;
  }
};
