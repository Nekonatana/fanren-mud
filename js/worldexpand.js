/* ====== 凡人修仙传MUD · 世界扩展引擎 ====== */

// 扩展WorldSystem对象
Object.assign(WorldSystem, {

  // ===== 初始化扩展状态 =====
  initExpandState(state) {
    // 寿命系统
    if (state.lifespan === undefined) {
      const stage = CULT_LEVELS[state.cultLevel].stage;
      state.lifespan = LIFESPAN_TABLE[stage].baseLifespan;
      state.age = 16;
      state.lifespanBonus = 0;
    }
    if (state.age === undefined) state.age = 16;
    if (state.lifespanBonus === undefined) state.lifespanBonus = 0;
    if (state.gameTime === undefined) state.gameTime = 0; // 游戏内小时数
    if (state.gameDay === undefined) state.gameDay = 1; // 游戏内天数
    if (state.npcDailyAffinity === undefined) state.npcDailyAffinity = {}; // {npcId: {day: x, amount: y}}
    
    // NPC详情相关
    if (state.npcDetails === undefined) state.npcDetails = {}; // 存储NPC详情
    
    // 道侣/婚姻
    if (state.spouses === undefined) state.spouses = []; // 道侣NPC ID列表
    if (state.pregnancies === undefined) state.pregnancies = []; // 怀孕列表
    if (state.offspring === undefined) state.offspring = []; // 后代列表
    if (state.dualCultCooldown === undefined) state.dualCultCooldown = 0; // 双修冷却天数
    
    // 灵山系统
    if (state.hasSpiritMountain === undefined) state.hasSpiritMountain = false;
    if (state.spiritMountain === undefined) state.spiritMountain = null;
    
    // 家园系统
    if (state.homes === undefined) state.homes = {}; // {townKey: {level, ...}}
    
    // 灵宠系统
    if (state.spiritPets === undefined) state.spiritPets = [];
    
    // 宗门家族关系
    if (state.sectRelations === undefined) state.sectRelations = {}; // {sectId: relation}
    if (state.vassals === undefined) state.vassals = []; // 附庸列表
    if (state.conqueredSects === undefined) state.conqueredSects = []; // 已征服的势力
  },

  // ===== 推进时间 =====
  advanceTime(hours) {
    const s = Game.state;
    this.initExpandState(s);
    s.gameTime += hours;
    const daysAdvanced = Math.floor(s.gameTime / 24);
    if (daysAdvanced > 0) {
      s.gameTime = s.gameTime % 24;
      s.gameDay = (s.gameDay || 1) + daysAdvanced;
      s.age = (s.age || 16) + (daysAdvanced / 365);
      // 推进NPC年龄和成长
      this.ageNPCs(daysAdvanced);
      // NPC每日修炼和探索（扩展7）
      if (typeof this.npcDailyCultivate === 'function') {
        for (let i = 0; i < daysAdvanced; i++) {
          this.npcDailyCultivate(s);
        }
      }
      // 宗门AI事件（扩展8）
      if (typeof this.dailySectAIEvents === 'function') {
        for (let i = 0; i < daysAdvanced; i++) {
          this.dailySectAIEvents(s);
        }
      }
      // 确保NPC灵根属性（扩展8）
      if (typeof this.ensureAllNPCSpiritRoots === 'function') {
        this.ensureAllNPCSpiritRoots(s);
      }
      // 初始化扩展8状态
      if (typeof this.initExpand8State === 'function') {
        this.initExpand8State(s);
      }
      // 推进怀孕
      this.advancePregnancies(daysAdvanced);
      // 双修冷却
      if (s.dualCultCooldown > 0) s.dualCultCooldown = Math.max(0, s.dualCultCooldown - daysAdvanced);
      // 重置每日好感度上限
      this.resetDailyAffinity(daysAdvanced);
      // 检查俘虏救援事件
      if (typeof this.checkCaptiveRescue === 'function' && daysAdvanced > 0) {
        for (let i = 0; i < daysAdvanced; i++) {
          this.checkCaptiveRescue();
        }
      }
    }
  },

  // ===== 重置每日好感度 =====
  resetDailyAffinity(daysAdvanced) {
    const s = Game.state;
    if (!s.npcDailyAffinity) return;
    // 简化处理：每天重置
    Object.keys(s.npcDailyAffinity).forEach(npcId => {
      if (s.npcDailyAffinity[npcId]) {
        s.npcDailyAffinity[npcId].amount = 0;
      }
    });
  },

  // ===== NPC详情面板 =====
  showNPCDetail(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc) { UI.toast("找不到此人。", "danger"); return; }
    
    this.initExpandState(s);
    
    // 确保NPC有详情
    if (!npc.age) npc.age = Math.floor(Math.random() * 80) + 16;
    if (!npc.lifespan) {
      const stage = npc.cultLevel >= 0 ? CULT_LEVELS[npc.cultLevel].stage : 0;
      npc.lifespan = LIFESPAN_TABLE[stage].baseLifespan;
    }
    if (!npc.gender) npc.gender = npc.isFemale ? "女" : "男";
    if (!npc.equipment) npc.equipment = {};
    if (!npc.relations) npc.relations = [];
    
    // 确保社交网络已初始化
    if (typeof this.setupNPCSocialNetwork === 'function' && !npc.socialNetwork) {
      this.setupNPCSocialNetwork(npc, s);
    }
    if (typeof this.initExpand2State === 'function') this.initExpand2State(s);

    const genderStr = npc.isFemale ? "♀ 女" : "♂ 男";
    const personalityDesc = npc.personality.desc || npc.personality.type;
    const moodStr = this.getNPCMoodStr(npc.mood);
    const relationStr = npc.isFriend ? "好友" : (s.spouses && s.spouses.includes(npcId) ? "道侣" : "路人");
    
    let html = '<div class="modal-section"><div class="modal-section-title">';
    html += npc.title + npc.name + ' [' + genderStr + ']</div>';
    
    html += '<div class="npc-detail-grid">';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">称谓</span><span>' + npc.title + '</span></div>';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">性别</span><span>' + genderStr + '</span></div>';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">年龄</span><span>' + npc.age + '岁</span></div>';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">寿命</span><span>' + npc.age + '/' + npc.lifespan + '年</span></div>';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">修为</span><span style="color:var(--gold-bright)">' + npc.cultName + '</span></div>';
    // 灵根信息（扩展8）
    if (typeof this.ensureNPCSpiritRoot === 'function') {
      this.ensureNPCSpiritRoot(npc);
      var rootName = this.getNPCSpiritRootInfo(npc);
      var rootColor = npc.spiritRoot.tier >= 4 ? 'var(--crimson-bright)' : npc.spiritRoot.tier >= 3 ? 'var(--gold-bright)' : npc.spiritRoot.tier >= 2 ? 'var(--jade-bright)' : 'var(--text-dim)';
      html += '<div class="npc-detail-row"><span class="npc-detail-label">灵根</span><span style="color:' + rootColor + '">' + rootName + '</span></div>';
    }
    html += '<div class="npc-detail-row"><span class="npc-detail-label">性格</span><span>' + personalityDesc + '</span></div>';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">好感度</span><span style="color:' + (npc.mood >= 80 ? 'var(--jade-bright)' : npc.mood >= 50 ? 'var(--gold-bright)' : 'var(--text-dim)') + '">' + npc.mood + '/100 ' + moodStr + '</span></div>';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">与你的关系</span><span style="color:var(--pink)">' + relationStr + '</span></div>';
    // 道侣信息
    if (npc.hasSpouse && npc.socialNetwork && npc.socialNetwork.spouse) {
      html += '<div class="npc-detail-row"><span class="npc-detail-label">道侣</span><span style="color:var(--pink)">' + npc.socialNetwork.spouse.name + '</span></div>';
    }
    // 忠贞度（有道侣或曾被降低过都显示）
    if (npc.hasSpouse || (npc.loyalty !== undefined && npc.loyalty < 100)) {
      var loyaltyValDetail = (npc.loyalty !== undefined ? npc.loyalty : 100);
      var loyaltyColorDetail = loyaltyValDetail <= 0 ? 'var(--crimson-bright)' : (loyaltyValDetail <= 50 ? 'var(--crimson)' : 'var(--jade-bright)');
      var loyaltyLabel = loyaltyValDetail <= 0 ? '忠贞尽失' : '忠贞度';
      html += '<div class="npc-detail-row"><span class="npc-detail-label">' + loyaltyLabel + '</span><span style="color:' + loyaltyColorDetail + ';">' + loyaltyValDetail + '</span></div>';
    }
    // 宗门信息
    if (npc.sectName) {
      html += '<div class="npc-detail-row"><span class="npc-detail-label">宗门</span><span style="color:var(--gold-bright)">' + npc.sectName + (npc.sectRole ? ' · ' + npc.sectRole : '') + '</span></div>';
    }
    html += '<div class="npc-detail-row"><span class="npc-detail-label">当前行为</span><span>' + npc.action + '</span></div>';
    html += '</div>';
    
    // 属性
    html += '<div class="modal-section-title" style="margin-top:8px;">战斗属性</div>';
    html += '<div class="npc-detail-grid">';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">气血</span><span>' + npc.hp + '/' + npc.maxHp + '</span></div>';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">攻击</span><span>' + npc.atk + '</span></div>';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">防御</span><span>' + npc.def + '</span></div>';
    html += '</div>';
    
    // 装备
    html += '<div class="modal-section-title" style="margin-top:8px;">装备</div>';
    const eqSlots = {weapon:"武器", armor:"防具", accessory:"饰品"};
    let hasEquip = false;
    Object.keys(eqSlots).forEach(slot => {
      if (npc.equipment[slot]) {
        hasEquip = true;
        const item = ITEMS[npc.equipment[slot]];
        html += '<div class="npc-detail-row"><span class="npc-detail-label">' + eqSlots[slot] + '</span><span>' + (item ? item.name : npc.equipment[slot]) + '</span></div>';
      }
    });
    if (!hasEquip) {
      html += '<div style="color:var(--text-dim);font-size:0.8em;text-align:center;">此人未装备任何法器</div>';
    }
    
    // 背包物品
    html += '<div class="modal-section-title" style="margin-top:8px;">随身物品</div>';
    if (npc.items && npc.items.length > 0) {
      html += '<div class="npc-inventory-list">';
      npc.items.forEach(itemId => {
        const item = ITEMS[itemId];
        if (item) {
          html += '<div class="npc-inv-item">' + item.name;
          if (item.atk) html += ' <span style="color:var(--crimson)">攻+' + item.atk + '</span>';
          if (item.def) html += ' <span style="color:var(--jade)">防+' + item.def + '</span>';
          html += '</div>';
        } else {
          html += '<div class="npc-inv-item">' + itemId + '</div>';
        }
      });
      html += '</div>';
    } else {
      html += '<div style="color:var(--text-dim);font-size:0.8em;text-align:center;">此人随身空空如也</div>';
    }
    html += '<div class="npc-detail-row" style="margin-top:4px;"><span class="npc-detail-label">灵石</span><span style="color:var(--gold-bright)">💎 ' + npc.stones + '</span></div>';
    
    // 关系网
    if (npc.relations && npc.relations.length > 0) {
      html += '<div class="modal-section-title" style="margin-top:8px;">关系网</div>';
      html += '<div class="npc-inventory-list">';
      npc.relations.forEach(rel => {
        html += '<div class="npc-inv-item">' + rel.type + '：' + rel.name + '</div>';
      });
      html += '</div>';
    }
    
    html += '</div>';
    
    // 交互按钮
    const interactBtns = [];
    interactBtns.push('<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
    interactBtns.push('<button class="btn-combat" onclick="WorldSystem.talkToNPC(\'' + npcId + '\')">交谈</button>');
    interactBtns.push('<button class="btn-combat" style="border-color:var(--pink);color:var(--pink)" onclick="WorldSystem.showGiftPanel(\'' + npcId + '\')">送礼</button>');
    if (typeof this.showNPCSocialPanel === 'function') {
      interactBtns.push('<button class="btn-combat" onclick="WorldSystem.showNPCSocialPanel(\'' + npcId + '\')">👥 查看关系</button>');
    }
    
    // 异性判断+好感度>=80+未已婚判断
    if (npc.mood >= 80 && !s.spouses.includes(npcId) && s.spouses.length < 3) {
      const playerFemale = s.isFemale || false;
      if (npc.isFemale !== playerFemale) {
        interactBtns.push('<button class="btn-combat" style="border-color:var(--pink);color:var(--pink)" onclick="WorldSystem.proposeMarriage(\'' + npcId + '\')">求婚</button>');
      }
    }
    
    // 给丹药
    if (npc.isFriend || s.spouses.includes(npcId)) {
      interactBtns.push('<button class="btn-combat" onclick="WorldSystem.showGivePillPanel(\'' + npcId + '\')">给丹药</button>');
    }
    
    // 双修（道侣）
    if (s.spouses.includes(npcId) && s.dualCultCooldown <= 0) {
      interactBtns.push('<button class="btn-combat" style="border-color:var(--purple-spirit);color:var(--purple-spirit)" onclick="WorldSystem.dualCultivate(\'' + npcId + '\')">双修</button>');
    }
    
    interactBtns.push('<button class="btn-combat" onclick="WorldSystem.stealFromNPC(\'' + npcId + '\')">偷窃</button>');
    interactBtns.push('<button class="btn-combat" style="border-color:var(--crimson);color:var(--crimson-bright)" onclick="WorldSystem.attackNPC(\'' + npcId + '\')">袭击</button>');
    interactBtns.push('<button class="btn-combat" onclick="UI.closeModal();WorldSystem.exploreArea(s_currentArea||\'\')">离开</button>');
    
    UI.showModalBody(html, interactBtns.join(''));
  },

  // 获取NPC心情描述
  getNPCMoodStr(mood) {
    if (mood >= 90) return "❤️ 亲密无间";
    if (mood >= 70) return "😊 友善";
    if (mood >= 50) return "😐 认识";
    if (mood >= 30) return "冷淡";
    return "😤 厌恶";
  },

  // ===== 送礼面板 =====
  showGiftPanel(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc) return;
    
    let html = '<div class="modal-section"><div class="modal-section-title">送礼给' + npc.name + '</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-bottom:8px;">选择物品送礼，可提升好感度</p>';
    
    // 礼物类物品
    const giftItems = s.inventory.filter(inv => {
      const item = ITEMS[inv.id];
      return item && (item.giftValue || item.type === "consumable" || item.type === "material");
    });
    
    if (giftItems.length === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;">背包中无可赠送物品</div>';
    } else {
      giftItems.forEach(inv => {
        const item = ITEMS[inv.id];
        const giftVal = item.giftValue || Math.floor((item.grade || 1) * 5);
        const affinityGain = Math.floor(giftVal * (1 + npc.personality.talkBias * 0.3));
        html += '<div class="modal-item-row" style="cursor:pointer;" onclick="WorldSystem.giveGift(\'' + npcId + '\',\'' + inv.id + '\')"><div>';
        html += '<div style="color:var(--gold-bright)">' + item.name + (inv.count > 1 ? ' ×' + inv.count : '') + '</div>';
        html += '<div class="modal-item-desc">' + item.desc + '</div>';
        html += '<div class="modal-item-stats">预计好感度+' + affinityGain + '</div>';
        html += '</div></div>';
      });
    }
    
    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="WorldSystem.showNPCDetail(\'' + npcId + '\')">返回</button>');
  },

  // ===== 送礼 =====
  giveGift(npcId, itemId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc) return;
    
    const invItem = s.inventory.find(i => i.id === itemId);
    if (!invItem || invItem.count <= 0) { UI.toast("物品不存在！", "danger"); return; }
    
    const item = ITEMS[itemId];
    const giftVal = item.giftValue || Math.floor((item.grade || 1) * 5);
    
    // 检查每日好感度上限
    this.initExpandState(s);
    if (!s.npcDailyAffinity[npcId]) s.npcDailyAffinity[npcId] = {day: s.gameDay || 1, amount: 0};
    // 检查是否新的一天，如果是则重置
    if (s.npcDailyAffinity[npcId].day !== (s.gameDay || 1)) {
      s.npcDailyAffinity[npcId] = {day: s.gameDay || 1, amount: 0};
    }
    const dailyRemaining = 20 - (s.npcDailyAffinity[npcId].amount || 0);
    
    if (dailyRemaining <= 0) {
      UI.toast(npc.name + "今日好感度已达上限，明天再来送礼吧。", "danger");
      return;
    }
    
    let affinityGain = Math.floor(giftVal * (1 + npc.personality.talkBias * 0.3));
    affinityGain = Math.min(affinityGain, dailyRemaining);
    
    // 消耗物品
    invItem.count--;
    if (invItem.count <= 0) s.inventory = s.inventory.filter(i => i.id !== itemId);
    
    // 提升好感度
    npc.mood = Math.min(100, npc.mood + affinityGain);
    s.npcDailyAffinity[npcId].amount = (s.npcDailyAffinity[npcId].amount || 0) + affinityGain;
    
    UI.toast("🎁 送出" + item.name + "，好感度+" + affinityGain + "（当前：" + npc.mood + "/100）", "pink");
    
    // 检查是否可以结交
    if (npc.mood >= 50 && !npc.isFriend) {
      UI.toast(npc.name + "对你产生了好感，可以尝试结交！", "gold");
    }
    
    UI.closeModal();
    setTimeout(() => this.showNPCDetail(npcId), 100);
    UI.updateAll();
  },

  // ===== 寿命系统 =====
  useLifespanItem(itemId) {
    const s = Game.state;
    this.initExpandState(s);
    
    const item = ITEMS[itemId];
    if (!item || !item.effect || !item.effect.lifespan) return;
    
    const invItem = s.inventory.find(i => i.id === itemId);
    if (!invItem || invItem.count <= 0) return;
    
    const bonus = item.effect.lifespan;
    s.lifespan += bonus;
    s.lifespanBonus = (s.lifespanBonus || 0) + bonus;
    
    invItem.count--;
    if (invItem.count <= 0) s.inventory = s.inventory.filter(i => i.id !== itemId);
    
    UI.toast("⏳ 服用" + item.name + "，延寿" + bonus + "年！（当前寿命：" + s.lifespan + "年）", "gold");
    
    if (s.lifespanBonus >= 500) Game.giveAchievement("longevity_master");
    WorldSystem.updateQuests();
    UI.updateAll();
  },

  // 检查寿命
  checkLifespan() {
    const s = Game.state;
    this.initExpandState(s);
    const stage = CULT_LEVELS[s.cultLevel].stage;
    const maxLifespan = LIFESPAN_TABLE[stage].baseLifespan + (s.lifespanBonus || 0);
    if (s.age >= maxLifespan) {
      // 寿元已尽
      UI.showModal("寿元已尽", 
        "<p style='text-align:center;color:var(--crimson-bright);'>你的寿元已尽……</p><p style='text-align:center;'>享年" + Math.floor(s.age) + "岁。</p><p style='text-align:center;color:var(--text-dim);'>若修为足以突破，可延长寿命。</p>",
        '<button class="btn-combat" onclick="location.reload()">再入轮回</button>'
      );
      return true;
    }
    return false;
  },

  // 突破时增加寿命
  onCultUp() {
    const s = Game.state;
    this.initExpandState(s);
    const newStage = CULT_LEVELS[s.cultLevel].stage;
    const oldStage = newStage > 0 ? newStage - 1 : 0;
    const lifespanDiff = LIFESPAN_TABLE[newStage].baseLifespan - LIFESPAN_TABLE[oldStage].baseLifespan;
    if (lifespanDiff > 0) {
      s.lifespan += lifespanDiff;
      UI.toast("⏳ 突破至" + LIFESPAN_TABLE[newStage].name + "，寿命增加" + lifespanDiff + "年！", "gold");
    }
  },

  // ===== 客栈休息系统 =====
  restAtInn(restIndex) {
    const s = Game.state;
    const opt = INN_REST_OPTIONS[restIndex];
    if (!opt) return;
    if (s.spiritStones < opt.price) { UI.toast("灵石不足！", "danger"); return; }
    
    s.spiritStones -= opt.price;
    
    // 恢复气血灵力
    if (opt.hpPct >= 1) s.hp = s.maxHp;
    else s.hp = Math.min(s.maxHp, s.hp + Math.floor(s.maxHp * opt.hpPct));
    if (opt.mpPct >= 1) s.mp = s.maxMp;
    else s.mp = Math.min(s.maxMp, s.mp + Math.floor(s.maxMp * opt.mpPct));
    
    // 推进时间
    this.advanceTime(opt.hours);
    
    UI.toast("💤 " + opt.name + "完毕，恢复气血灵力，推进" + opt.hours + "小时。", "success");
    UI.closeModal();
    UI.updateAll();
    
    // 检查寿命
    this.checkLifespan();
  },

  // 显示客栈休息面板
  showInnRestPanel() {
    let html = '<div class="modal-section"><div class="modal-section-title">客栈休息</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-bottom:12px;">选择休息时间，恢复气血灵力</p>';
    
    INN_REST_OPTIONS.forEach((opt, i) => {
      const s = Game.state;
      const canAfford = s.spiritStones >= opt.price;
      html += '<div class="modal-item-row" style="cursor:' + (canAfford ? 'pointer' : 'not-allowed') + ';opacity:' + (canAfford ? '1' : '0.5') + '" ' + (canAfford ? 'onclick="WorldSystem.restAtInn(' + i + ')"' : '') + '>';
      html += '<div><div style="color:var(--gold-bright)">' + opt.name + '</div>';
      html += '<div class="modal-item-desc">' + opt.desc + '</div>';
      html += '<div class="modal-item-stats">恢复HP ' + (opt.hpPct * 100) + '% | 恢复MP ' + (opt.mpPct * 100) + '%</div></div>';
      html += '<div style="color:' + (canAfford ? 'var(--gold-bright)' : 'var(--crimson)') + '">💎' + opt.price + '</div>';
      html += '</div>';
    });
    
    html += '</div>';
    
    // 当前时间显示
    const s = Game.state;
    this.initExpandState(s);
    const dayStr = "第" + (s.gameDay || 1) + "天 " + Math.floor((s.gameTime || 0) % 24) + "时";
    html += '<div style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-top:8px;">当前时间：' + dayStr + ' | 年龄：' + Math.floor(s.age || 16) + '岁 | 寿命：' + (s.lifespan || 120) + '年</div>';
    
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },

  // ===== 道侣求婚/结婚 =====
  proposeMarriage(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc) return;
    if (!s.spouses) s.spouses = [];
    if (s.spouses.includes(npcId)) { UI.toast("你们已是道侣", "info"); return; }
    
    // 检查是否可以无视好感度结为道侣
    // 1. 强迫双修导致孽缘羁绊（极端BUFF）
    // 2. 哄骗断绝关系后
    // 3. 秘密双修后
    // 4. 忠贞度≤0（忠贞尽失，无条件结为道侣）
    var bypassAffinity = false;
    var bypassReason = "";
    if (s.npcExtremeBuff && s.npcExtremeBuff[npcId]) {
      bypassAffinity = true;
      bypassReason = s.npcExtremeBuff[npcId].name || "孽缘羁绊";
    } else if (npc.deceived) {
      bypassAffinity = true;
      bypassReason = "哄骗之缘";
    } else if (npc.secretDual) {
      bypassAffinity = true;
      bypassReason = "秘密之缘";
    } else if ((npc.loyalty !== undefined) && npc.loyalty <= 0) {
      bypassAffinity = true;
      bypassReason = "忠贞尽失";
    }
    
    if (!bypassAffinity && npc.mood < 80) {
      UI.toast(npc.name + "对你的好感度不够，至少需要80。", "danger");
      return;
    }
    
    const playerFemale = s.isFemale || false;
    if (npc.isFemale === playerFemale) {
      UI.toast("只能与异性结为道侣。", "danger");
      return;
    }
    
    if (s.spouses.length >= 3) {
      UI.toast("你已有3位道侣，不可再娶。", "danger");
      return;
    }
    
    // 消耗灵石
    const cost = bypassAffinity ? 0 : 2000;
    if (cost > 0 && s.spiritStones < cost) {
      UI.toast("需要" + cost + "灵石作为聘礼！", "danger");
      return;
    }
    
    // 好感度越高成功率越高；但有特殊羁绊时必定成功
    var successChance;
    if (bypassAffinity) {
      successChance = 1.0; // 特殊羁绊必定成功
    } else {
      successChance = 0.5 + (npc.mood - 80) * 0.02 + npc.personality.befriendChance * 0.2;
    }
    
    if (Math.random() < successChance) {
      if (cost > 0) s.spiritStones -= cost;
      s.spouses.push(npcId);
      npc.isFriend = true;
      npc.relationType = "道侣";
      if (!bypassAffinity) npc.mood = 100;
      
      Game.giveAchievement("first_marriage");
      WorldSystem.updateQuests();
      
      var marriageDesc = "";
      if (bypassAffinity) {
        marriageDesc = "<p style='text-align:center;color:var(--crimson-bright);'>[" + bypassReason + "] " + npc.name + "虽然厌恶你，但命运的羁绊让你们无法分离……</p>";
      }
      
      UI.showModal("道侣之约",
        "<p style='text-align:center;font-size:1.1em;color:var(--pink);'>💕 " + npc.name + "答应与你结为道侣！</p>" +
        marriageDesc +
        "<p style='text-align:center;'>你们正式结为道侣，从此同修大道，共证长生。</p>" +
        "<p style='text-align:center;color:var(--text-dim);'>道侣加成：攻击+10%，防御+10%，修炼效率+15%</p>",
        '<button class="btn-combat" onclick="UI.closeModal()">喜悦</button>'
      );
      
      // 应用道侣加成（记录每个道侣给的加成，避免重复乘算）
      if (!s.spouseAtkBonus) s.spouseAtkBonus = 0;
      if (!s.spouseDefBonus) s.spouseDefBonus = 0;
      const atkAdd = Math.floor(s.atk * 0.1);
      const defAdd = Math.floor(s.def * 0.1);
      s.atk += atkAdd;
      s.def += defAdd;
      s.spouseAtkBonus += atkAdd;
      s.spouseDefBonus += defAdd;
    } else {
      npc.mood = Math.max(50, npc.mood - 10);
      UI.toast(npc.name + "犹豫了一下，似乎觉得还需要更多时间。好感度-10", "danger");
    }
  },

  // ===== 双修系统 =====
  dualCultivate(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc) return;
    if (!s.spouses.includes(npcId)) { UI.toast("只能与道侣双修。", "danger"); return; }
    if (s.dualCultCooldown > 0) { UI.toast("双修需等待" + s.dualCultCooldown + "天冷却。", "danger"); return; }
    
    let expGain = DUAL_CULTIVATION_EFFECTS.baseExp * (1 + s.cultLevel * 0.3);
    
    // 检查双修丹
    const dualPill = s.inventory.find(i => i.id === "dual_cultivation_pill");
    if (dualPill && dualPill.count > 0) {
      expGain *= DUAL_CULTIVATION_EFFECTS.dualCultBonus;
      dualPill.count--;
      if (dualPill.count <= 0) s.inventory = s.inventory.filter(i => i.id !== "dual_cultivation_pill");
      UI.toast("服用双修丹，修为翻倍！", "gold");
    }
    
    // 道侣亲密度加成
    const affMult = 1 + (npc.mood / 200);
    expGain = Math.floor(expGain * affMult);
    
    Game.gainExp(expGain);
    npc.mood = Math.min(100, npc.mood + DUAL_CULTIVATION_EFFECTS.affinityBonus);
    
    // 推进时间
    this.advanceTime(12);
    
    s.dualCultCooldown = DUAL_CULTIVATION_EFFECTS.cooldownDays;
    
    Game.giveAchievement("dual_cultivator");
    WorldSystem.updateQuests();
    
    // 检查怀孕
    const playerFemale = s.isFemale || false;
    if (!playerFemale && npc.isFemale) {
      let pregChance = DUAL_CULTIVATION_EFFECTS.pregnancyChance;
      const pregPill = s.inventory.find(i => i.id === "pregnancy_pill");
      if (pregPill && pregPill.count > 0) {
        pregChance = DUAL_CULTIVATION_EFFECTS.pregnancyChanceWithPill;
      }
      if (Math.random() < pregChance) {
        this.startPregnancy(npcId, pregPill && pregPill.count > 0);
      }
    }
    
    UI.toast("☯️ 与" + npc.name + "双修，获得" + expGain + "经验，好感度+" + DUAL_CULTIVATION_EFFECTS.affinityBonus, "purple-spirit");
    UI.updateAll();
  },

  // ===== 怀孕系统 =====
  startPregnancy(npcId, safePregnancy) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc) return;
    
    // 保存NPC原始属性，怀孕期间属性下降
    if (!npc.originalStats) {
      npc.originalStats = {
        atk: npc.atk,
        def: npc.def,
        hp: npc.hp,
        maxHp: npc.maxHp,
      };
    }
    // 怀孕期间属性下降20%
    npc.atk = Math.floor(npc.atk * 0.8);
    npc.def = Math.floor(npc.def * 0.8);
    npc.hp = Math.floor(npc.hp * 0.8);
    npc.maxHp = Math.floor(npc.maxHp * 0.8);
    npc.isPregnant = true;
    
    s.pregnancies.push({
      npcId: npcId,
      daysLeft: 270, // 9个月
      safePregnancy: safePregnancy,
      npcName: npc.name,
    });
    
    if (safePregnancy) {
      const pregPill = s.inventory.find(i => i.id === "pregnancy_pill");
      if (pregPill) {
        pregPill.count--;
        if (pregPill.count <= 0) s.inventory = s.inventory.filter(i => i.id !== "pregnancy_pill");
      }
    }
    
    UI.showModal("喜讯",
      "<p style='text-align:center;font-size:1.1em;color:var(--pink);'>👶 " + npc.name + "怀孕了！</p>" +
      "<p style='text-align:center;'>预计" + 270 + "天后降生。</p>" +
      (safePregnancy ? "<p style='text-align:center;color:var(--jade);'>已服用安胎丹，母子平安。</p>" : ""),
      '<button class="btn-combat" onclick="UI.closeModal()">欣喜</button>'
    );
  },

  // 推进怀孕
  advancePregnancies(days) {
    const s = Game.state;
    if (!s.pregnancies || s.pregnancies.length === 0) return;
    
    s.pregnancies.forEach((preg, idx) => {
      preg.daysLeft -= days;
      if (preg.daysLeft <= 0) {
        this.giveBirth(preg);
        s.pregnancies.splice(idx, 1);
      }
    });
  },

  // 分娩
  giveBirth(preg) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === preg.npcId);
    
    // 恢复NPC原始属性
    if (npc && npc.originalStats) {
      npc.atk = npc.originalStats.atk;
      npc.def = npc.originalStats.def;
      npc.hp = npc.originalStats.hp;
      npc.maxHp = npc.originalStats.maxHp;
      npc.originalStats = null;
      npc.isPregnant = false;
    }
    
    // 安全检查
    if (!preg.safePregnancy && Math.random() < 0.1) {
      UI.toast("💔 " + preg.npcName + "的胎儿未能保全……", "danger");
      return;
    }
    
    // 生成后代
    const isMale = Math.random() < 0.5;
    const surname = NPC_SURNAMES[Math.floor(Math.random() * NPC_SURNAMES.length)];
    const givenName = isMale
      ? NPC_GIVEN_NAMES_M[Math.floor(Math.random() * NPC_GIVEN_NAMES_M.length)]
      : NPC_GIVEN_NAMES_F[Math.floor(Math.random() * NPC_GIVEN_NAMES_F.length)];
    
    // 天赋受父母修为影响
    let talentIdx = 0;
    if (s.cultLevel >= 8) talentIdx = 4;
    else if (s.cultLevel >= 5) talentIdx = 3;
    else if (s.cultLevel >= 3) talentIdx = 2;
    else if (s.cultLevel >= 1) talentIdx = 1;
    
    // 启灵丹提升天赋
    const talentPill = s.inventory.find(i => i.id === "talent_pill");
    if (talentPill && talentPill.count > 0) {
      talentIdx = Math.min(5, talentIdx + 1);
      talentPill.count--;
      if (talentPill.count <= 0) s.inventory = s.inventory.filter(i => i.id !== "talent_pill");
    }
    
    const talent = OFFSPRING_DATA.talentLevels[talentIdx];
    
    const offspring = {
      id: "child_" + Date.now(),
      name: givenName,
      surname: surname,
      fullName: surname + givenName,
      isMale: isMale,
      age: 0,
      ageStage: 0,
      talent: talent,
      cultLevel: 0,
      exp: 0,
      fatherName: s.name,
      motherName: preg.npcName,
      motherNpcId: preg.npcId,
      traits: [],
      isTraining: false,
    };
    
    s.offspring.push(offspring);
    
    if (s.offspring.length === 1) Game.giveAchievement("first_offspring");
    if (s.offspring.length >= 5) Game.giveAchievement("great_family");
    WorldSystem.updateQuests();
    
    UI.showModal("新生儿",
      "<p style='text-align:center;font-size:1.2em;color:var(--pink);'>👶 恭喜！</p>" +
      "<p style='text-align:center;'>你获得了一个" + (isMale ? "男孩" : "女孩") + "——" + surname + givenName + "！</p>" +
      "<p style='text-align:center;color:var(--gold-bright);'>天赋：[" + talent.name + "] " + talent.desc + "</p>",
      '<button class="btn-combat" onclick="UI.closeModal()">欢喜</button>'
    );
  },

  // ===== 后代面板 =====
  showOffspringPanel() {
    const s = Game.state;
    this.initExpandState(s);
    
    let html = '<div class="modal-section"><div class="modal-section-title">👶 后代（' + s.offspring.length + '）</div>';
    
    if (s.offspring.length === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;">尚无后代<br><span style="font-size:0.8em;">与道侣双修有机会诞下后代</span></div>';
    } else {
      s.offspring.forEach(child => {
        const stageInfo = OFFSPRING_DATA.growStages[child.ageStage] || OFFSPRING_DATA.growStages[0];
        html += '<div class="modal-item-row" style="flex-direction:column;align-items:flex-start;">';
        html += '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;">';
        html += '<div><div style="color:var(--pink);">' + (child.isMale ? "👦 " : "👧 ") + child.fullName + '</div>';
        html += '<div class="modal-item-desc">年龄：' + Math.floor(child.age) + '岁 | 阶段：' + stageInfo.name + '</div>';
        html += '<div class="modal-item-stats">天赋：[' + child.talent.name + '] | ' + (child.cultLevel > 0 ? '修为：' + CULT_LEVELS[child.cultLevel].name : '尚未修炼') + '</div>';
        html += '</div></div>';
        
        // 培养按钮
        if (stageInfo.effect === "can_train" || stageInfo.effect === "can_cultivate") {
          html += '<div style="display:flex;gap:4px;margin-top:4px;">';
          if (stageInfo.effect === "can_cultivate") {
            html += '<button class="btn-combat" style="font-size:0.7em;padding:4px 8px;" onclick="WorldSystem.trainOffspring(\'' + child.id + '\')">指点修炼(💎200)</button>';
          }
          html += '<button class="btn-combat" style="font-size:0.7em;padding:4px 8px;" onclick="WorldSystem.showChildDetail(\'' + child.id + '\')">详情</button>';
          html += '</div>';
        } else {
          html += '<div style="color:var(--text-dim);font-size:0.8em;">' + stageInfo.desc + '</div>';
        }
        html += '</div>';
      });
    }
    
    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },

  // 后代详情
  showChildDetail(childId) {
    const s = Game.state;
    const child = s.offspring.find(c => c.id === childId);
    if (!child) return;
    
    let html = '<div class="modal-section"><div class="modal-section-title">' + child.fullName + ' 详情</div>';
    html += '<div class="npc-detail-grid">';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">性别</span><span>' + (child.isMale ? "♂ 男" : "♀ 女") + '</span></div>';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">年龄</span><span>' + Math.floor(child.age) + '岁</span></div>';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">天赋</span><span style="color:var(--gold-bright)">' + child.talent.name + '</span></div>';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">父亲</span><span>' + child.fatherName + '</span></div>';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">母亲</span><span>' + child.motherName + '</span></div>';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">修为</span><span>' + (child.cultLevel > 0 ? CULT_LEVELS[child.cultLevel].name : '凡人') + '</span></div>';
    if (child.exp > 0) {
      const cult = CULT_LEVELS[child.cultLevel];
      html += '<div class="npc-detail-row"><span class="npc-detail-label">进度</span><span>' + child.exp + '/' + cult.maxExp + '</span></div>';
    }
    html += '</div>';
    
    // 培养按钮
    const stageInfo = OFFSPRING_DATA.growStages[child.ageStage] || OFFSPRING_DATA.growStages[0];
    if (stageInfo.effect === "can_cultivate" || stageInfo.effect === "can_adventure") {
      html += '<div style="margin-top:12px;display:flex;flex-direction:column;gap:4px;">';
      html += '<button class="btn-combat" onclick="WorldSystem.trainOffspring(\'' + childId + '\')">指点修炼(💎200)</button>';
      html += '<button class="btn-combat" onclick="WorldSystem.giveChildTalentPill(\'' + childId + '\')">喂启灵丹</button>';
      html += '<button class="btn-combat" onclick="WorldSystem.showToyPanel(\'' + childId + '\')">🧸 给玩具</button>';
      html += '</div>';
    }
    
    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="WorldSystem.showOffspringPanel()">返回</button>');
  },

  // 培养后代
  trainOffspring(childId) {
    const s = Game.state;
    const child = s.offspring.find(c => c.id === childId);
    if (!child) return;
    if (s.spiritStones < 200) { UI.toast("灵石不足！", "danger"); return; }
    
    s.spiritStones -= 200;
    
    // 获得经验
    const expGain = Math.floor(100 * child.talent.mult);
    child.exp = (child.exp || 0) + expGain;
    
    // 检查升级
    const cult = CULT_LEVELS[child.cultLevel];
    while (child.exp >= cult.maxExp && child.cultLevel < CULT_LEVELS.length - 1) {
      child.exp -= cult.maxExp;
      child.cultLevel++;
    }
    
    // 推进时间
    this.advanceTime(24);
    
    UI.toast("📚 指点" + child.fullName + "修炼，获得" + expGain + "经验", "gold");
    UI.closeModal();
    setTimeout(() => this.showChildDetail(childId), 100);
    UI.updateAll();
  },

  // 给后代启灵丹
  giveChildTalentPill(childId) {
    const s = Game.state;
    const child = s.offspring.find(c => c.id === childId);
    if (!child) return;
    
    const pill = s.inventory.find(i => i.id === "talent_pill");
    if (!pill || pill.count <= 0) { UI.toast("背包中没有启灵丹！", "danger"); return; }
    
    const currentIdx = OFFSPRING_DATA.talentLevels.indexOf(child.talent);
    if (currentIdx >= OFFSPRING_DATA.talentLevels.length - 1) {
      UI.toast(child.fullName + "天赋已达最高！", "danger");
      return;
    }
    
    pill.count--;
    if (pill.count <= 0) s.inventory = s.inventory.filter(i => i.id !== "talent_pill");
    
    child.talent = OFFSPRING_DATA.talentLevels[currentIdx + 1];
    UI.toast("✨ " + child.fullName + "服用启灵丹，天赋提升至[" + child.talent.name + "]！", "gold");
    UI.closeModal();
    setTimeout(() => this.showChildDetail(childId), 100);
    UI.updateAll();
  },

  // ===== 婴儿玩具系统 =====
  showToyPanel(childId) {
    const s = Game.state;
    const child = s.offspring.find(c => c.id === childId);
    if (!child) return;

    var TOYS = {
      "wooden_sword": {name:"木剑", icon:"🗡️", desc:"木制小剑，培养武道兴趣", expBonus:50, moodBonus:5, ageReq:0},
      "spirit_rattle": {name:"灵摇铃", icon:"🔔", desc:"蕴含微弱灵气的摇铃", expBonus:30, moodBonus:8, ageReq:0},
      "jade_pendant_toy": {name:"玉佩挂件", icon:"🟢", desc:"温润玉石磨制，安神定气", expBonus:40, moodBonus:6, ageReq:0},
      "story_book": {name:"修行故事书", icon:"📖", desc:"讲述修士冒险故事", expBonus:80, moodBonus:10, ageReq:3},
      "puzzle_cube": {name:"灵阵魔方", icon:"🧩", desc:"训练灵识的小法阵", expBonus:100, moodBonus:7, ageReq:5},
      "spirit_kite": {name:"灵鸢风筝", icon:"🪁", desc:"御风飞行的风筝", expBonus:60, moodBonus:12, ageReq:3},
    };

    var html = '<div class="modal-section"><div class="modal-section-title">🧸 给' + child.fullName + '玩具</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-bottom:12px;">年龄：' + Math.floor(child.age) + '岁</p>';

    var hasAnyToy = false;
    Object.keys(TOYS).forEach(toyId => {
      var toy = TOYS[toyId];
      var inv = (s.inventory || []).find(i => i.id === toyId);
      var count = inv ? inv.count : 0;
      var canUse = count > 0 && child.age >= toy.ageReq;
      var alreadyUsed = child.usedToys && child.usedToys.includes(toyId);

      html += '<div class="modal-item-row" style="opacity:' + (count > 0 ? '1' : '0.4') + '"><div>';
      html += '<div style="color:' + (alreadyUsed ? 'var(--text-dim)' : 'var(--gold-bright)') + ';">' + toy.icon + ' ' + toy.name;
      html += ' <span style="font-size:0.8em;color:var(--text-dim);">x' + count + '</span>';
      if (alreadyUsed) html += ' <span style="font-size:0.8em;color:var(--jade);">[已用过]</span>';
      html += '</div>';
      html += '<div class="modal-item-desc">' + toy.desc + '</div>';
      html += '<div class="modal-item-stats">经验+' + toy.expBonus + ' 好感+' + toy.moodBonus;
      if (toy.ageReq > 0) html += ' 需' + toy.ageReq + '岁';
      html += '</div>';
      html += '</div>';
      if (canUse && !alreadyUsed) {
        html += '<button class="btn-combat" style="font-size:0.75em;" onclick="WorldSystem.giveChildToy(\'' + childId + '\',\'' + toyId + '\')">使用</button>';
        hasAnyToy = true;
      } else if (count > 0 && child.age < toy.ageReq) {
        html += '<span style="color:var(--text-dim);font-size:0.8em;">年龄不足</span>';
      }
      html += '</div>';
    });

    if (!hasAnyToy) {
      html += '<div style="color:var(--text-dim);text-align:center;margin:8px 0;">背包中没有可用的玩具<br><span style="font-size:0.85em;">可在城镇商店购买玩具</span></div>';
    }

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="WorldSystem.showChildDetail(\'' + childId + '\')">返回</button>');
  },

  // 给后代使用玩具
  giveChildToy(childId, toyId) {
    const s = Game.state;
    const child = s.offspring.find(c => c.id === childId);
    if (!child) return;

    var TOYS = {
      "wooden_sword": {name:"木剑", icon:"🗡️", desc:"木制小剑", expBonus:50, moodBonus:5, ageReq:0},
      "spirit_rattle": {name:"灵摇铃", icon:"🔔", desc:"灵气摇铃", expBonus:30, moodBonus:8, ageReq:0},
      "jade_pendant_toy": {name:"玉佩挂件", icon:"🟢", desc:"安神定气", expBonus:40, moodBonus:6, ageReq:0},
      "story_book": {name:"修行故事书", icon:"📖", desc:"冒险故事", expBonus:80, moodBonus:10, ageReq:3},
      "puzzle_cube": {name:"灵阵魔方", icon:"🧩", desc:"训练灵识", expBonus:100, moodBonus:7, ageReq:5},
      "spirit_kite": {name:"灵鸢风筝", icon:"🪁", desc:"御风飞行", expBonus:60, moodBonus:12, ageReq:3},
    };

    var toy = TOYS[toyId];
    if (!toy) return;

    var inv = (s.inventory || []).find(i => i.id === toyId);
    if (!inv || inv.count <= 0) { UI.toast("背包中没有此玩具！", "danger"); return; }
    if (child.age < toy.ageReq) { UI.toast(child.fullName + "年龄不足，无法使用此玩具。", "danger"); return; }

    // 检查是否已用过
    if (!child.usedToys) child.usedToys = [];
    if (child.usedToys.includes(toyId)) { UI.toast(child.fullName + "已经用过这个玩具了，不再有新鲜感。", "info"); return; }

    // 消耗玩具
    inv.count--;
    if (inv.count <= 0) s.inventory = s.inventory.filter(i => i.id !== toyId);
    child.usedToys.push(toyId);

    // 给予经验
    var expGain = Math.floor(toy.expBonus * (child.talent.mult || 1));
    child.exp = (child.exp || 0) + expGain;
    // 检查升级
    var cult = CULT_LEVELS[child.cultLevel];
    while (child.exp >= cult.maxExp && child.cultLevel < CULT_LEVELS.length - 1) {
      child.exp -= cult.maxExp;
      child.cultLevel++;
    }

    // 好感度（如果孩子有道侣/母亲NPC）
    if (child.motherNpcId) {
      var mother = s.npcList.find(n => n.id === child.motherNpcId);
      if (mother) mother.mood = Math.min(100, mother.mood + 3);
    }

    UI.toast(toy.icon + " " + child.fullName + "玩得很开心！经验+" + expGain, "gold");
    UI.closeModal();
    setTimeout(() => this.showToyPanel(childId), 100);
    UI.updateAll();
  },

  // ===== 灵山系统 =====
  showSpiritMountainPanel() {
    const s = Game.state;
    this.initExpandState(s);
    
    if (!s.hasSpiritMountain) {
      // 显示获取灵山支线
      let html = '<div class="modal-section"><div class="modal-section-title">🏔️ 灵山</div>';
      html += '<div style="color:var(--text-dim);text-align:center;padding:20px;">';
      html += '<p>你尚未拥有灵山。</p>';
      html += '<p style="font-size:0.85em;">在野外探索时有概率发现无人占灵的山头。</p>';
      html += '<p style="font-size:0.85em;">或完成「灵山机缘」支线任务。</p>';
      html += '</div></div>';
      UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
      return;
    }
    
    const mt = s.spiritMountain;
    let html = '<div class="modal-section"><div class="modal-section-title">🏔️ ' + mt.name + '</div>';
    html += '<div class="npc-detail-grid">';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">位置</span><span>' + mt.region + '</span></div>';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">灵气浓度</span><span style="color:var(--gold-bright)">' + mt.spiritDensity + '级</span></div>';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">弟子数</span><span>' + (mt.disciples || 0) + '人</span></div>';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">灵兽数</span><span>' + (mt.beasts || 0) + '只</span></div>';
    html += '</div>';
    
    // 建筑
    html += '<div class="modal-section-title" style="margin-top:12px;">建筑</div>';
    if (mt.buildings && Object.keys(mt.buildings).length > 0) {
      Object.keys(mt.buildings).forEach(bId => {
        const building = SPIRIT_MOUNTAIN_BUILDINGS[bId];
        const level = mt.buildings[bId];
        html += '<div class="modal-item-row"><div>';
        html += '<div style="color:var(--gold-bright)">' + building.name + ' Lv.' + level + '</div>';
        html += '<div class="modal-item-desc">' + building.desc + '</div>';
        if (level < building.maxLevel) {
          const upgradeCost = building.cost * (level + 1);
          html += '<div class="modal-item-stats">升级：💎' + upgradeCost + '</div>';
          html += '</div><button class="btn-combat" style="font-size:0.7em;" onclick="WorldSystem.buildOnMountain(\'' + bId + '\')">升级</button></div>';
        } else {
          html += '<div class="modal-item-stats" style="color:var(--jade)">已满级</div>';
          html += '</div></div>';
        }
      });
    } else {
      html += '<div style="color:var(--text-dim);text-align:center;">尚未建造任何建筑</div>';
    }
    
    // 可建造
    html += '<div class="modal-section-title" style="margin-top:8px;">可建造</div>';
    Object.keys(SPIRIT_MOUNTAIN_BUILDINGS).forEach(bId => {
      if (mt.buildings && mt.buildings[bId]) return;
      const building = SPIRIT_MOUNTAIN_BUILDINGS[bId];
      const canBuild = CULT_LEVELS[s.cultLevel].stage >= building.reqStage;
      const canAfford = s.spiritStones >= building.cost;
      html += '<div class="modal-item-row" style="opacity:' + (canBuild && canAfford ? '1' : '0.5') + '" ' + (canBuild && canAfford ? 'onclick="WorldSystem.buildOnMountain(\'' + bId + '\')"' : '') + '><div>';
      html += '<div style="color:' + (canBuild ? 'var(--gold-bright)' : 'var(--text-dim)') + '">' + building.name + '</div>';
      html += '<div class="modal-item-desc">' + building.desc + '</div>';
      html += '<div class="modal-item-stats">建造费用：💎' + building.cost;
      if (!canBuild) html += '（需' + STAGE_NAMES[building.reqStage] + '）';
      html += '</div></div></div>';
    });
    
    // 招收弟子
    if (mt.buildings && mt.buildings["main_hall"]) {
      html += '<div style="margin-top:12px;">';
      html += '<button class="btn-combat" onclick="WorldSystem.recruitDisciple()">招收弟子(💎100/人)</button>';
      html += '</div>';
    }
    
    // 灵药种植
    if (mt.buildings && mt.buildings["herb_garden"]) {
      html += '<div style="margin-top:8px;">';
      html += '<button class="btn-combat" onclick="WorldSystem.showMountainHerbPanel()">灵药园种植</button>';
      html += '</div>';
    }
    
    // 灵兽饲养
    if (mt.buildings && mt.buildings["beast_pen"]) {
      html += '<div style="margin-top:8px;">';
      html += '<button class="btn-combat" onclick="WorldSystem.showMountainBeastPanel()">灵兽圈饲养</button>';
      html += '</div>';
    }
    
    // 地牢（俘虏管理）
    if (mt.buildings && mt.buildings["dungeon_cell"]) {
      const captiveCount = (s.captives || []).length;
      html += '<div style="margin-top:8px;">';
      html += '<button class="btn-combat" style="border-color:var(--crimson);color:var(--crimson-bright);" onclick="WorldSystem.showCaptivePanel()">⛓️ 地牢(' + captiveCount + ')</button>';
      html += '</div>';
    }
    
    html += '</div>';
    
    // 当前时间
    html += '<div style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-top:8px;">第' + (s.gameDay || 1) + '天 | 年龄：' + Math.floor(s.age || 16) + '岁 | 寿命：' + (s.lifespan || 120) + '年</div>';
    
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },

  // 建造灵山建筑
  buildOnMountain(buildingId) {
    const s = Game.state;
    if (!s.spiritMountain) return;
    const mt = s.spiritMountain;
    if (!mt.buildings) mt.buildings = {};
    
    const building = SPIRIT_MOUNTAIN_BUILDINGS[buildingId];
    const currentLevel = mt.buildings[buildingId] || 0;
    const cost = building.cost * (currentLevel + 1);
    
    if (s.spiritStones < cost) { UI.toast("灵石不足！", "danger"); return; }
    if (CULT_LEVELS[s.cultLevel].stage < building.reqStage) { UI.toast("修为不足！", "danger"); return; }
    
    s.spiritStones -= cost;
    mt.buildings[buildingId] = currentLevel + 1;
    
    if (currentLevel === 0) {
      UI.toast("🏗️ 建造" + building.name + "成功！", "gold");
      if (buildingId === "main_hall") Game.giveAchievement("sect_founder");
    } else {
      UI.toast("🏗️ " + building.name + "升级至" + (currentLevel + 1) + "级！", "gold");
    }
    
    WorldSystem.updateQuests();
    UI.closeModal();
    setTimeout(() => this.showSpiritMountainPanel(), 100);
    UI.updateAll();
  },

  // 招收弟子
  recruitDisciple() {
    const s = Game.state;
    if (!s.spiritMountain) return;
    const mt = s.spiritMountain;
    const maxDisciples = (mt.buildings["main_hall"] || 0) * 5;
    
    if ((mt.disciples || 0) >= maxDisciples) {
      UI.toast("弟子已满！升级宗门大殿可招收更多。", "danger");
      return;
    }
    if (s.spiritStones < 100) { UI.toast("灵石不足！", "danger"); return; }
    
    s.spiritStones -= 100;
    mt.disciples = (mt.disciples || 0) + 1;
    
    const isMale = Math.random() < 0.6;
    const surname = NPC_SURNAMES[Math.floor(Math.random() * NPC_SURNAMES.length)];
    const givenName = isMale
      ? NPC_GIVEN_NAMES_M[Math.floor(Math.random() * NPC_GIVEN_NAMES_M.length)]
      : NPC_GIVEN_NAMES_F[Math.floor(Math.random() * NPC_GIVEN_NAMES_F.length)];
    
    UI.toast("👤 招收新弟子：" + surname + givenName + "（" + (isMale ? "男" : "女") + "）", "gold");
    
    if (mt.disciples >= 10) WorldSystem.updateQuests();
    
    UI.closeModal();
    setTimeout(() => this.showSpiritMountainPanel(), 100);
    UI.updateAll();
  },

  // 灵药园种植面板
  showMountainHerbPanel() {
    const s = Game.state;
    if (!s.spiritMountain) return;
    const mt = s.spiritMountain;
    if (!mt.herbSlots) mt.herbSlots = [null, null, null, null];
    const maxSlots = (mt.buildings["herb_garden"] || 0) * 2;
    
    let html = '<div class="modal-section"><div class="modal-section-title">灵药园（' + mt.herbSlots.length + '/' + maxSlots + '槽位）</div>';
    
    for (let i = 0; i < Math.max(4, maxSlots); i++) {
      const slot = mt.herbSlots[i];
      html += '<div class="modal-item-row">';
      if (slot) {
        const herb = MOUNTAIN_HERBS[slot.seed];
        const isReady = slot.growDays >= herb.growDays;
        html += '<div><div style="color:var(--jade)">' + herb.name + '（' + slot.growDays + '/' + herb.growDays + '天）</div>';
        if (isReady) {
          html += '<button class="btn-combat" style="font-size:0.7em;" onclick="WorldSystem.harvestMountainHerb(' + i + ')">收获</button>';
        } else {
          html += '<span style="color:var(--text-dim);font-size:0.8em;">生长中</span>';
        }
        html += '</div>';
      } else {
        html += '<div style="color:var(--text-dim)">空槽位' + (i+1) + '</div>';
        html += '<select id="herb-select-' + i + '" style="font-size:0.8em;background:var(--bg-darker);color:var(--text-main);border:1px solid var(--border-gold);padding:2px;">';
        Object.keys(MOUNTAIN_HERBS).forEach(hId => {
          const h = MOUNTAIN_HERBS[hId];
          html += '<option value="' + hId + '">' + h.name + '(💎' + h.cost + '/' + h.growDays + '天)</option>';
        });
        html += '</select>';
        html += '<button class="btn-combat" style="font-size:0.7em;" onclick="WorldSystem.plantMountainHerb(' + i + ')">种植</button>';
      }
      html += '</div>';
    }
    
    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="WorldSystem.showSpiritMountainPanel()">返回</button>');
  },

  plantMountainHerb(slotIndex) {
    const s = Game.state;
    const mt = s.spiritMountain;
    if (!mt.herbSlots) mt.herbSlots = [null, null, null, null];
    if (mt.herbSlots[slotIndex]) { UI.toast("此槽位已种植！", "danger"); return; }
    
    const select = document.getElementById('herb-select-' + slotIndex);
    if (!select) return;
    const herbId = select.value;
    const herb = MOUNTAIN_HERBS[herbId];
    if (s.spiritStones < herb.cost) { UI.toast("灵石不足！", "danger"); return; }
    
    s.spiritStones -= herb.cost;
    mt.herbSlots[slotIndex] = {seed: herbId, growDays: 0, growTime: herb.growDays};
    
    UI.toast("🌱 种植" + herb.name, "success");
    UI.closeModal();
    setTimeout(() => this.showMountainHerbPanel(), 100);
    UI.updateAll();
  },

  harvestMountainHerb(slotIndex) {
    const s = Game.state;
    const mt = s.spiritMountain;
    const slot = mt.herbSlots[slotIndex];
    if (!slot) return;
    const herb = MOUNTAIN_HERBS[slot.seed];
    if (slot.growDays < herb.growDays) { UI.toast("尚未成熟！", "danger"); return; }
    
    Game.addItem(herb.harvest.item, herb.harvest.count);
    mt.herbSlots[slotIndex] = null;
    
    UI.toast("🌾 收获" + ITEMS[herb.harvest.item].name + "×" + herb.harvest.count + "！", "gold");
    UI.closeModal();
    setTimeout(() => this.showMountainHerbPanel(), 100);
    UI.updateAll();
  },

  // 灵兽圈饲养面板
  showMountainBeastPanel() {
    const s = Game.state;
    if (!s.spiritMountain) return;
    const mt = s.spiritMountain;
    if (!mt.beastSlots) mt.beastSlots = [null, null, null];
    const maxSlots = (mt.buildings["beast_pen"] || 0) * 2;
    
    let html = '<div class="modal-section"><div class="modal-section-title">灵兽圈（' + mt.beastSlots.length + '/' + maxSlots + '槽位）</div>';
    
    for (let i = 0; i < Math.max(3, maxSlots); i++) {
      const slot = mt.beastSlots[i];
      html += '<div class="modal-item-row">';
      if (slot) {
        const beast = MOUNTAIN_BEASTS[slot.seed];
        const isReady = slot.growDays >= beast.growDays;
        html += '<div><div style="color:var(--jade)">' + beast.name + '（' + slot.growDays + '/' + beast.growDays + '天）</div>';
        if (isReady) {
          html += '<button class="btn-combat" style="font-size:0.7em;" onclick="WorldSystem.harvestMountainBeast(' + i + ')">收获</button>';
        } else {
          html += '<span style="color:var(--text-dim);font-size:0.8em;">饲养中</span>';
        }
        html += '</div>';
      } else {
        html += '<div style="color:var(--text-dim)">空槽位' + (i+1) + '</div>';
        html += '<select id="beast-select-' + i + '" style="font-size:0.8em;background:var(--bg-darker);color:var(--text-main);border:1px solid var(--border-gold);padding:2px;">';
        Object.keys(MOUNTAIN_BEASTS).forEach(bId => {
          const b = MOUNTAIN_BEASTS[bId];
          html += '<option value="' + bId + '">' + b.name + '(💎' + b.cost + '/' + b.growDays + '天)</option>';
        });
        html += '</select>';
        html += '<button class="btn-combat" style="font-size:0.7em;" onclick="WorldSystem.raiseMountainBeast(' + i + ')">饲养</button>';
      }
      html += '</div>';
    }
    
    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="WorldSystem.showSpiritMountainPanel()">返回</button>');
  },

  raiseMountainBeast(slotIndex) {
    const s = Game.state;
    const mt = s.spiritMountain;
    if (!mt.beastSlots) mt.beastSlots = [null, null, null];
    if (mt.beastSlots[slotIndex]) { UI.toast("此槽位已使用！", "danger"); return; }
    
    const select = document.getElementById('beast-select-' + slotIndex);
    if (!select) return;
    const beastId = select.value;
    const beast = MOUNTAIN_BEASTS[beastId];
    if (s.spiritStones < beast.cost) { UI.toast("灵石不足！", "danger"); return; }
    
    s.spiritStones -= beast.cost;
    mt.beastSlots[slotIndex] = {seed: beastId, growDays: 0, growTime: beast.growDays};
    mt.beasts = (mt.beasts || 0) + 1;
    
    UI.toast("🐄 饲养" + beast.name, "success");
    UI.closeModal();
    setTimeout(() => this.showMountainBeastPanel(), 100);
    UI.updateAll();
  },

  harvestMountainBeast(slotIndex) {
    const s = Game.state;
    const mt = s.spiritMountain;
    const slot = mt.beastSlots[slotIndex];
    if (!slot) return;
    const beast = MOUNTAIN_BEASTS[slot.seed];
    if (slot.growDays < beast.growDays) { UI.toast("尚未成熟！", "danger"); return; }
    
    Game.addItem(beast.harvest.item, beast.harvest.count);
    mt.beastSlots[slotIndex] = null;
    
    UI.toast("📦 收获" + ITEMS[beast.harvest.item].name + "×" + beast.harvest.count + "！", "gold");
    UI.closeModal();
    setTimeout(() => this.showMountainBeastPanel(), 100);
    UI.updateAll();
  },

  // 推进灵山生长
  advanceMountainGrowth(days) {
    const s = Game.state;
    if (!s.spiritMountain) return;
    const mt = s.spiritMountain;
    
    if (mt.herbSlots) {
      mt.herbSlots.forEach(slot => {
        if (slot && slot.growDays < slot.growTime) slot.growDays += days;
      });
    }
    if (mt.beastSlots) {
      mt.beastSlots.forEach(slot => {
        if (slot && slot.growDays < slot.growTime) slot.growDays += days;
      });
    }
  },

  // 发现灵山（野外探索触发）
  discoverSpiritMountain(areaKey) {
    const s = Game.state;
    this.initExpandState(s);
    
    if (s.hasSpiritMountain) {
      UI.toast("你已拥有灵山。", "danger");
      return false;
    }
    
    s.hasSpiritMountain = true;
    s.spiritMountain = {
      name: "翠微灵山",
      region: areaKey,
      spiritDensity: 3,
      buildings: {},
      herbSlots: [null, null, null, null],
      beastSlots: [null, null, null],
      disciples: 0,
      beasts: 0,
    };
    
    Game.giveAchievement("spirit_mountain_owner");
    WorldSystem.updateQuests();
    
    return true;
  },

  // ===== 家园系统 =====
  buyHome(townKey) {
    const s = Game.state;
    this.initExpandState(s);
    if (!s.homes) s.homes = {};
    
    if (s.homes[townKey]) {
      UI.toast("你在此地已有住所。", "danger");
      return;
    }
    
    const cost = 3000;
    if (s.spiritStones < cost) { UI.toast("需要" + cost + "灵石购买住所！", "danger"); return; }
    
    s.spiritStones -= cost;
    s.homes[townKey] = {level: 1, built: true};
    
    UI.toast("🏠 在" + TOWNS[townKey].name + "购买了住所！", "gold");
    UI.closeModal();
    setTimeout(() => this.showTownPanel(), 100);
    UI.updateAll();
  },

  showHomePanel() {
    const s = Game.state;
    this.initExpandState(s);
    
    let html = '<div class="modal-section"><div class="modal-section-title">🏠 家园</div>';
    
    const homeCount = Object.keys(s.homes || {}).length;
    if (homeCount === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;padding:12px;">你尚未拥有任何住所<br><span style="font-size:0.85em;">在城镇中可购买土地建造住所</span></div>';
    } else {
      Object.keys(s.homes).forEach(townKey => {
        const home = s.homes[townKey];
        const town = TOWNS[townKey];
        html += '<div class="modal-item-row"><div>';
        html += '<div style="color:var(--gold-bright)">🏠 ' + (town ? town.name : townKey) + ' 住所 Lv.' + home.level + '</div>';
        html += '<div class="modal-item-desc">在此休息可恢复全部气血灵力，修炼效率+20%</div>';
        html += '</div>';
        html += '<button class="btn-combat" style="font-size:0.7em;" onclick="WorldSystem.restAtHome(\'' + townKey + '\')">休息</button>';
        html += '</div>';
      });
    }
    
    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },

  restAtHome(townKey) {
    const s = Game.state;
    s.hp = s.maxHp;
    s.mp = s.maxMp;
    this.advanceTime(8);
    
    // 在家修炼效率加成
    const expGain = Math.floor(50 * (1 + s.cultLevel * 0.2));
    Game.gainExp(expGain);
    
    UI.toast("💤 在家中休息，完全恢复！修炼获得" + expGain + "经验。", "gold");
    UI.closeModal();
    UI.updateAll();
  },

  // ===== 灵宠系统 =====
  showSpiritPetPanel() {
    const s = Game.state;
    this.initExpandState(s);
    
    let html = '<div class="modal-section"><div class="modal-section-title">🐾 灵宠（' + (s.spiritPets || []).length + '）</div>';
    
    if (!s.spiritPets || s.spiritPets.length === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;padding:12px;">你尚未拥有灵宠<br><span style="font-size:0.85em;">在野外探索时有概率遇到可收服的灵兽</span></div>';
      
      // 野外捕捉灵兽
      html += '<div class="modal-section-title" style="margin-top:12px;">灵兽捕捉</div>';
      Object.keys(SPIRIT_PETS).forEach(petId => {
        const pet = SPIRIT_PETS[petId];
        const canCatch = CULT_LEVELS[s.cultLevel].stage >= pet.reqStage;
        const canAfford = s.spiritStones >= pet.cost;
        html += '<div class="modal-item-row" style="opacity:' + (canCatch && canAfford ? '1' : '0.5') + '" ' + (canCatch && canAfford ? 'onclick="WorldSystem.catchSpiritPet(\'' + petId + '\')"' : '') + '><div>';
        html += '<div style="color:' + (canCatch ? 'var(--gold-bright)' : 'var(--text-dim)') + '">' + pet.name + '</div>';
        html += '<div class="modal-item-desc">' + pet.desc + '</div>';
        html += '<div class="modal-item-stats">';
        if (pet.atkBonus) html += '攻+' + pet.atkBonus + ' ';
        if (pet.defBonus) html += '防+' + pet.defBonus + ' ';
        if (pet.spdBonus) html += '速+' + pet.spdBonus + ' ';
        html += '| 技能：' + pet.skill;
        if (!canCatch) html += '（需' + STAGE_NAMES[pet.reqStage] + '）';
        html += '</div></div>';
        html += '<div style="color:' + (canAfford ? 'var(--gold-bright)' : 'var(--crimson)') + '">💎' + pet.cost + '</div>';
        html += '</div>';
      });
    } else {
      s.spiritPets.forEach((petSlot, i) => {
        const petData = SPIRIT_PETS[petSlot.id];
        const level = petSlot.level || 1;
        const growthMult = 1 + (level - 1) * 0.1;
        
        html += '<div class="modal-item-row" style="flex-direction:column;align-items:flex-start;">';
        html += '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;">';
        html += '<div><div style="color:var(--gold-bright)">🐾 ' + petData.name + ' Lv.' + level + '/' + petData.maxLevel + '</div>';
        html += '<div class="modal-item-desc">' + petData.desc + '</div>';
        html += '<div class="modal-item-stats">';
        if (petData.atkBonus) html += '攻击+' + Math.floor(petData.atkBonus * growthMult) + ' ';
        if (petData.defBonus) html += '防御+' + Math.floor(petData.defBonus * growthMult) + ' ';
        if (petData.spdBonus) html += '速度+' + Math.floor(petData.spdBonus * growthMult) + ' ';
        html += '| 技能：' + petData.skill;
        html += '</div></div></div>';
        
        // 亲密度进度条
        const affinity = petSlot.affinity || 0;
        html += '<div class="exp-bar-wrap" style="margin:4px 0;"><div class="exp-bar-fill" style="width:' + affinity + '%"></div><span>亲密度 ' + affinity + '/100</span></div>';
        
        // 互动按钮
        html += '<div style="display:flex;gap:4px;">';
        html += '<button class="btn-combat" style="font-size:0.7em;padding:4px 8px;" onclick="WorldSystem.feedSpiritPet(' + i + ')">喂养(💎50)</button>';
        if (level < petData.maxLevel) {
          const upCost = 100 * level;
          html += '<button class="btn-combat" style="font-size:0.7em;padding:4px 8px;" onclick="WorldSystem.spiritPetLevelUp(' + i + ')">升级(💎' + upCost + ')</button>';
        }
        html += '<button class="btn-combat" style="font-size:0.7em;padding:4px 8px;" onclick="WorldSystem.petAdventure(' + i + ')">外出历练(💎100)</button>';
        html += '</div>';
        
        html += '</div>';
      });
      
      // 捕捉更多
      html += '<div class="modal-section-title" style="margin-top:8px;">捕捉灵兽</div>';
      Object.keys(SPIRIT_PETS).forEach(petId => {
        const pet = SPIRIT_PETS[petId];
        const canCatch = CULT_LEVELS[s.cultLevel].stage >= pet.reqStage;
        const canAfford = s.spiritStones >= pet.cost;
        html += '<div class="modal-item-row" style="opacity:' + (canCatch && canAfford ? '1' : '0.5') + '" ' + (canCatch && canAfford ? 'onclick="WorldSystem.catchSpiritPet(\'' + petId + '\')"' : '') + '><div>';
        html += '<div style="color:' + (canCatch ? 'var(--gold-bright)' : 'var(--text-dim)') + '">' + pet.name + '</div>';
        html += '<div class="modal-item-desc">' + pet.desc + '</div>';
        html += '</div><div style="color:' + (canAfford ? 'var(--gold-bright)' : 'var(--crimson)') + '">💎' + pet.cost + '</div>';
        html += '</div>';
      });
    }
    
    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },

  catchSpiritPet(petId) {
    const s = Game.state;
    const petData = SPIRIT_PETS[petId];
    if (!petData) return;
    if (CULT_LEVELS[s.cultLevel].stage < petData.reqStage) { UI.toast("修为不足！", "danger"); return; }
    if (s.spiritStones < petData.cost) { UI.toast("灵石不足！", "danger"); return; }
    
    // 捕捉成功率
    const catchChance = 0.6 + (CULT_LEVELS[s.cultLevel].stage - petData.reqStage) * 0.1;
    
    if (Math.random() < catchChance) {
      s.spiritStones -= petData.cost;
      s.spiritPets.push({id: petId, level: 1, affinity: 30, exp: 0});
      
      // 应用属性加成
      if (petData.atkBonus) s.atk += petData.atkBonus;
      if (petData.defBonus) s.def += petData.defBonus;
      if (petData.spdBonus) s.spd += petData.spdBonus;
      
      Game.giveAchievement("first_spirit_pet");
      WorldSystem.updateQuests();
      
      UI.toast("🐾 成功收服" + petData.name + "！", "gold");
    } else {
      s.spiritStones -= Math.floor(petData.cost * 0.3);
      UI.toast("灵兽逃脱了！损失" + Math.floor(petData.cost * 0.3) + "灵石。", "danger");
    }
    
    UI.closeModal();
    setTimeout(() => this.showSpiritPetPanel(), 100);
    UI.updateAll();
  },

  feedSpiritPet(index) {
    const s = Game.state;
    const petSlot = s.spiritPets[index];
    if (!petSlot) return;
    if (s.spiritStones < 50) { UI.toast("灵石不足！", "danger"); return; }
    
    s.spiritStones -= 50;
    petSlot.affinity = Math.min(100, (petSlot.affinity || 0) + 10);
    petSlot.exp = (petSlot.exp || 0) + 50;
    
    UI.toast("🐾 喂养成功，亲密度+10", "success");
    UI.closeModal();
    setTimeout(() => this.showSpiritPetPanel(), 100);
    UI.updateAll();
  },

  spiritPetLevelUp(index) {
    const s = Game.state;
    const petSlot = s.spiritPets[index];
    if (!petSlot) return;
    const petData = SPIRIT_PETS[petSlot.id];
    if (petSlot.level >= petData.maxLevel) { UI.toast("已达满级！", "danger"); return; }
    
    const cost = 100 * petSlot.level;
    if (s.spiritStones < cost) { UI.toast("灵石不足！", "danger"); return; }
    
    s.spiritStones -= cost;
    petSlot.level++;
    petSlot.exp = 0;
    
    // 更新属性加成
    const growthMult = 1 + (petSlot.level - 1) * 0.1;
    const prevGrowth = 1 + (petSlot.level - 2) * 0.1;
    if (petData.atkBonus) s.atk += Math.floor(petData.atkBonus * (growthMult - prevGrowth));
    if (petData.defBonus) s.def += Math.floor(petData.defBonus * (growthMult - prevGrowth));
    if (petData.spdBonus) s.spd += Math.floor(petData.spdBonus * (growthMult - prevGrowth));
    
    UI.toast("🐾 " + petData.name + "升级至" + petSlot.level + "级！", "gold");
    UI.closeModal();
    setTimeout(() => this.showSpiritPetPanel(), 100);
    UI.updateAll();
  },

  petAdventure(index) {
    const s = Game.state;
    const petSlot = s.spiritPets[index];
    if (!petSlot) return;
    if (s.spiritStones < 100) { UI.toast("灵石不足！", "danger"); return; }
    
    s.spiritStones -= 100;
    this.advanceTime(12);
    
    const petData = SPIRIT_PETS[petSlot.id];
    const expGain = 50 + petSlot.level * 20;
    petSlot.exp = (petSlot.exp || 0) + expGain;
    petSlot.affinity = Math.min(100, (petSlot.affinity || 0) + 5);
    
    // 随机获得物品
    const rewards = ["spirit_grass", "spirit_stone", "healing_pill"];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    Game.addItem(reward, 1 + Math.floor(Math.random() * 3));
    
    UI.toast("🐾 " + petData.name + "外出历练归来！获得经验+" + expGain + "，" + ITEMS[reward].name + "！", "gold");
    UI.closeModal();
    setTimeout(() => this.showSpiritPetPanel(), 100);
    UI.updateAll();
  },

  // ===== 宗门家族面板 =====
  showSectPanel() {
    const s = Game.state;
    this.initExpandState(s);
    
    let html = '<div class="modal-section"><div class="modal-section-title">🏯 宗门家族</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-bottom:12px;">与各宗门家族进行外交：交易、结盟、联姻、征服</p>';
    
    Object.keys(SECTS_AND_FAMILIES).forEach(sectId => {
      const sect = SECTS_AND_FAMILIES[sectId];
      const canAccess = CULT_LEVELS[s.cultLevel].stage >= sect.reqStage;
      const relation = s.sectRelations[sectId] || 0;
      const relationStr = relation >= 50 ? "盟友" : relation >= 30 ? "友好" : relation >= 0 ? "中立" : relation >= -50 ? "不和" : "敌对";
      const relationColor = relation >= 50 ? "var(--jade-bright)" : relation >= 30 ? "var(--gold-bright)" : relation >= 0 ? "var(--text-main)" : "var(--crimson-bright)";
      const isVassal = s.vassals.includes(sectId);
      const isConquered = s.conqueredSects.includes(sectId);
      
      html += '<div class="modal-item-row" style="opacity:' + (canAccess ? '1' : '0.4') + '"><div>';
      html += '<div style="color:' + (canAccess ? 'var(--gold-bright)' : 'var(--text-dim)') + '">';
      html += (sect.type === "sect" ? "🏯 " : "🏛️ ") + sect.name;
      if (isVassal) html += ' <span style="color:var(--jade);font-size:0.8em;">[附庸]</span>';
      if (isConquered) html += ' <span style="color:var(--crimson);font-size:0.8em;">[已征服]</span>';
      if (!canAccess) html += '（需' + STAGE_NAMES[sect.reqStage] + '）';
      html += '</div>';
      html += '<div class="modal-item-desc">' + sect.desc + '</div>';
      html += '<div class="modal-item-stats">实力：' + sect.strength + ' | 特长：' + sect.specialty + ' | 关系：<span style="color:' + relationColor + '">' + relationStr + '(' + relation + ')</span></div>';
      html += '</div>';
      
      if (canAccess && !isConquered) {
        html += '<button class="btn-combat" style="font-size:0.65em;padding:3px 6px;" onclick="WorldSystem.sectDiplomacyMenu(\'' + sectId + '\')">外交</button>';
      }
      html += '</div>';
    });
    
    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },

  // 宗门外交菜单
  sectDiplomacyMenu(sectId) {
    const s = Game.state;
    this.initExpandState(s);
    const sect = SECTS_AND_FAMILIES[sectId];
    const relation = s.sectRelations[sectId] || 0;
    const isVassal = s.vassals.includes(sectId);
    
    let html = '<div class="modal-section"><div class="modal-section-title">' + sect.name + ' 外交</div>';
    html += '<div style="text-align:center;margin-bottom:8px;">当前关系：' + relation + '</div>';
    
    SECT_DIPLOMACY_OPTIONS.forEach(opt => {
      const canDo = relation >= opt.reqRelation || opt.id === "attack";
      const canAfford = s.spiritStones >= opt.cost;
      const canStrength = !opt.reqStrength || CULT_LEVELS[s.cultLevel].stage >= sect.strength;
      const canVassal = !opt.reqVassal || isVassal;
      
      const enabled = canDo && canAfford && canStrength && canVassal;
      
      html += '<div class="modal-item-row" style="opacity:' + (enabled ? '1' : '0.5') + '" ' + (enabled ? 'onclick="WorldSystem.doSectDiplomacy(\'' + sectId + '\',\'' + opt.id + '\')"' : '') + '><div>';
      html += '<div style="color:' + (enabled ? 'var(--gold-bright)' : 'var(--text-dim)') + '">' + opt.name + '</div>';
      html += '<div class="modal-item-desc">' + opt.desc + '</div>';
      if (opt.cost > 0) html += '<div class="modal-item-stats">费用：💎' + opt.cost + '</div>';
      html += '</div></div>';
    });
    
    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="WorldSystem.showSectPanel()">返回</button>');
  },

  // 执行宗门外交
  doSectDiplomacy(sectId, actionId) {
    const s = Game.state;
    this.initExpandState(s);
    const sect = SECTS_AND_FAMILIES[sectId];
    const opt = SECT_DIPLOMACY_OPTIONS.find(o => o.id === actionId);
    if (!opt) return;
    
    if (s.spiritStones < opt.cost) { UI.toast("灵石不足！", "danger"); return; }
    
    const currentRel = s.sectRelations[sectId] || 0;
    
    switch(actionId) {
      case "trade": {
        s.spiritStones -= opt.cost;
        // 随机获得功法或物品
        const tradeRewards = ["healing_pill", "foundation_pill", "core_formation_pill", "spirit_grass", "thousand_year_ginseng"];
        const reward = tradeRewards[Math.floor(Math.random() * tradeRewards.length)];
        Game.addItem(reward, 1);
        s.sectRelations[sectId] = Math.min(100, currentRel + 5);
        UI.toast("📦 与" + sect.name + "交易，获得" + ITEMS[reward].name + "！关系+5", "gold");
        break;
      }
      case "alliance": {
        s.spiritStones -= opt.cost;
        if (currentRel >= 30) {
          s.sectRelations[sectId] = Math.min(100, currentRel + 20);
          UI.toast("🤝 与" + sect.name + "结为盟友！关系+20", "gold");
        } else {
          UI.toast(sect.name + "拒绝了结盟请求，关系不够。", "danger");
        }
        break;
      }
      case "marriage": {
        s.spiritStones -= opt.cost;
        if (currentRel >= 20) {
          s.sectRelations[sectId] = Math.min(100, currentRel + 15);
          UI.toast("💕 与" + sect.name + "联姻成功！关系+15", "pink");
        } else {
          UI.toast(sect.name + "拒绝了联姻请求。", "danger");
        }
        break;
      }
      case "vassalize": {
        s.spiritStones -= opt.cost;
        if (CULT_LEVELS[s.cultLevel].stage >= sect.strength && currentRel >= 50) {
          s.vassals.push(sectId);
          s.sectRelations[sectId] = Math.min(100, currentRel + 10);
          UI.toast("👑 " + sect.name + "成为你的附庸！", "gold");
          WorldSystem.updateQuests();
        } else {
          UI.toast(sect.name + "拒绝了附庸要求。需实力压制且关系良好。", "danger");
        }
        break;
      }
      case "attack": {
        // 战斗
        const enemyStrength = sect.strength;
        const playerStrength = CULT_LEVELS[s.cultLevel].stage + 1;
        if (playerStrength >= enemyStrength) {
          s.conqueredSects.push(sectId);
          // 获得战利品
          const loot = Math.floor(sect.strength * 500);
          s.spiritStones += loot;
          UI.toast("⚔️ 成功征服" + sect.name + "！获得" + loot + "灵石！", "gold");
          Game.giveAchievement("sect_conqueror");
          WorldSystem.updateQuests();
        } else {
          s.hp = Math.floor(s.maxHp * 0.3);
          UI.toast("⚔️ 攻打" + sect.name + "失败！损失大量气血。", "danger");
        }
        break;
      }
      case "tribute": {
        if (s.vassals.includes(sectId)) {
          const tribute = Math.floor(sect.strength * 100);
          s.spiritStones += tribute;
          s.sectRelations[sectId] = Math.max(-100, currentRel - 5);
          UI.toast("💎 从" + sect.name + "征收" + tribute + "灵石！关系-5", "gold");
        }
        break;
      }
    }
    
    UI.closeModal();
    setTimeout(() => this.showSectPanel(), 100);
    UI.updateAll();
  },

  // ===== 给NPC丹药 =====
  showGivePillPanel(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc) return;
    
    let html = '<div class="modal-section"><div class="modal-section-title">给' + npc.name + '丹药</div>';
    
    const pills = s.inventory.filter(inv => {
      const item = ITEMS[inv.id];
      return item && item.type === "consumable";
    });
    
    if (pills.length === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;">背包中无丹药</div>';
    } else {
      pills.forEach(inv => {
        const item = ITEMS[inv.id];
        html += '<div class="modal-item-row" style="cursor:pointer;" onclick="WorldSystem.givePillToNPC(\'' + npcId + '\',\'' + inv.id + '\')"><div>';
        html += '<div style="color:var(--gold-bright)">' + item.name + (inv.count > 1 ? ' ×' + inv.count : '') + '</div>';
        html += '<div class="modal-item-desc">' + item.desc + '</div>';
        html += '</div></div>';
      });
    }
    
    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="WorldSystem.showNPCDetail(\'' + npcId + '\')">返回</button>');
  },

  givePillToNPC(npcId, itemId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc) return;
    
    const invItem = s.inventory.find(i => i.id === itemId);
    if (!invItem || invItem.count <= 0) return;
    
    const item = ITEMS[itemId];
    
    // 突破丹效果
    if (item.effect && item.effect.npcBreakthrough) {
      if (npc.cultLevel < CULT_LEVELS.length - 1) {
        npc.cultLevel++;
        npc.cultName = CULT_LEVELS[npc.cultLevel].name;
        const cult = CULT_LEVELS[npc.cultLevel];
        npc.hp = cult.hpBonus;
        npc.maxHp = cult.hpBonus;
        npc.atk = cult.atkBonus;
        npc.def = cult.defBonus;
        npc.mood = Math.min(100, npc.mood + 20);
        
        invItem.count--;
        if (invItem.count <= 0) s.inventory = s.inventory.filter(i => i.id !== itemId);
        
        UI.toast("💊 " + npc.name + "突破至" + npc.cultName + "！好感度+20", "gold");
        WorldSystem.updateQuests();
      } else {
        UI.toast(npc.name + "修为已达巅峰。", "danger");
        return;
      }
    } else if (item.effect && item.effect.hp) {
      npc.hp = Math.min(npc.maxHp, npc.hp + item.effect.hp);
      npc.mood = Math.min(100, npc.mood + 5);
      invItem.count--;
      if (invItem.count <= 0) s.inventory = s.inventory.filter(i => i.id !== itemId);
      UI.toast("💊 " + npc.name + "服用" + item.name + "，恢复气血。好感度+5", "success");
    } else if (item.effect && item.effect.lifespan) {
      if (!npc.lifespan) {
        const stage = CULT_LEVELS[npc.cultLevel].stage;
        npc.lifespan = LIFESPAN_TABLE[stage].baseLifespan;
      }
      npc.lifespan += item.effect.lifespan;
      npc.mood = Math.min(100, npc.mood + 15);
      invItem.count--;
      if (invItem.count <= 0) s.inventory = s.inventory.filter(i => i.id !== itemId);
      UI.toast("💊 " + npc.name + "服用" + item.name + "，延寿" + item.effect.lifespan + "年！好感度+15", "gold");
    } else {
      npc.mood = Math.min(100, npc.mood + 3);
      invItem.count--;
      if (invItem.count <= 0) s.inventory = s.inventory.filter(i => i.id !== itemId);
      UI.toast("💊 " + npc.name + "收下" + item.name + "。好感度+3", "success");
    }
    
    UI.closeModal();
    setTimeout(() => this.showNPCDetail(npcId), 100);
    UI.updateAll();
  },

  // ===== NPC年龄推进 =====
  ageNPCs(days) {
    const s = Game.state;
    if (!s.npcList) return;
    const yearsAdvanced = days / 365;
    
    s.npcList.forEach(npc => {
      if (!npc.isAlive) return;
      // 年龄增长
      npc.age = (npc.age || 30) + yearsAdvanced;

      // 安全获取修为阶段
      var npcCultIdx = (typeof npc.cultLevel === 'number' && npc.cultLevel >= 0 && npc.cultLevel < CULT_LEVELS.length) ? npc.cultLevel : 0;

      // 检查寿命
      if (!npc.lifespan) {
        var stage = CULT_LEVELS[npcCultIdx] ? CULT_LEVELS[npcCultIdx].stage : 0;
        npc.lifespan = (LIFESPAN_TABLE && LIFESPAN_TABLE[stage]) ? LIFESPAN_TABLE[stage].baseLifespan : 100;
      }
      if (npc.age >= npc.lifespan) {
        npc.isAlive = false;
        // 从好友列表移除
        const fIdx = s.npcFriends.indexOf(npc.id);
        if (fIdx >= 0) s.npcFriends.splice(fIdx, 1);
        const spIdx = s.spouses.indexOf(npc.id);
        if (spIdx >= 0) s.spouses.splice(spIdx, 1);
      }

      // 修为随时间增长（小概率）
      if (Math.random() < 0.01 * days && npcCultIdx < CULT_LEVELS.length - 1) {
        npcCultIdx++;
        npc.cultLevel = npcCultIdx;
        npc.cultName = CULT_LEVELS[npcCultIdx].name;
      }

      // 随机移动到其他区域
      if (Math.random() < 0.005 * days) {
        const loc = Object.keys(WORLD_MAP);
        const newArea = loc[Math.floor(Math.random() * loc.length)];
        var npcStage = CULT_LEVELS[npcCultIdx] ? CULT_LEVELS[npcCultIdx].stage : 0;
        if (WORLD_MAP[newArea] && npcStage >= WORLD_MAP[newArea].reqStage) {
          npc.area = newArea;
        }
      }
    });
    
    // 推进后代年龄
    if (s.offspring) {
      s.offspring.forEach(child => {
        child.age = (child.age || 0) + yearsAdvanced;
        // 更新成长阶段
        for (let i = OFFSPRING_DATA.growStages.length - 1; i >= 0; i--) {
          if (child.age >= OFFSPRING_DATA.growStages[i].age) {
            child.ageStage = i;
            break;
          }
        }
      });
    }
    
    // 推进灵山生长
    this.advanceMountainGrowth(days);
  },

  // ===== 生成大量NPC（200-300每地图） =====
  generateMassNPCs(state, areaKey, count) {
    if (!state.npcList) state.npcList = [];
    const existing = state.npcList.filter(n => n.area === areaKey && n.isAlive).length;
    const toGen = Math.max(0, count - existing);
    
    for (let i = 0; i < toGen; i++) {
      // 70%修士，20%普通人，10%孩童
      const typeRoll = Math.random();
      let npc;
      
      if (typeRoll < 0.2) {
        // 普通人NPC
        npc = this.generateCommonerNPC(areaKey);
      } else if (typeRoll < 0.3) {
        // 孩童NPC
        npc = this.generateChildNPC(areaKey);
      } else {
        // 修士NPC
        npc = this.generateNPC(state.cultLevel, areaKey);
        npc.age = Math.floor(Math.random() * 80) + 16;
        const stage = CULT_LEVELS[npc.cultLevel].stage;
        npc.lifespan = LIFESPAN_TABLE[stage].baseLifespan;
        npc.gender = npc.isFemale ? "女" : "男";
      }
      
      state.npcList.push(npc);
    }

    // 为新NPC初始化社交网络
    if (typeof this.setupNPCSocialNetwork === 'function') {
      state.npcList.filter(n => n.area === areaKey && n.isAlive && !n.socialNetwork && !n.isChild).forEach(npc => {
        this.setupNPCSocialNetwork(npc, state);
      });
    }

    return state.npcList.filter(n => n.area === areaKey && n.isAlive);
  },

  // 生成普通人NPC
  generateCommonerNPC(area) {
    const surname = COMMONER_SURNAMES[Math.floor(Math.random() * COMMONER_SURNAMES.length)];
    const isFemale = Math.random() < 0.5;
    const givenName = isFemale
      ? COMMONER_FEMALE_NAMES[Math.floor(Math.random() * COMMONER_FEMALE_NAMES.length)]
      : COMMONER_MALE_NAMES[Math.floor(Math.random() * COMMONER_MALE_NAMES.length)];
    
    return {
      id: "npc_" + Date.now() + "_" + Math.floor(Math.random() * 99999),
      name: surname + givenName,
      title: "凡人",
      isFemale: isFemale,
      gender: isFemale ? "女" : "男",
      cultLevel: -1,
      cultName: "凡人",
      personality: NPC_PERSONALITIES[Math.floor(Math.random() * NPC_PERSONALITIES.length)],
      action: ["正在赶集", "正在闲逛", "正在叫卖", "正在干活", "正在聊天"][Math.floor(Math.random() * 5)],
      hp: 20, maxHp: 20, atk: 2, def: 1,
      items: [],
      stones: Math.floor(Math.random() * 20),
      area: area,
      isAlive: true,
      isFriend: false,
      isCommoner: true,
      mood: Math.floor(Math.random() * 30) + 20,
      age: Math.floor(Math.random() * 60) + 15,
      lifespan: 100,
      equipment: {},
      relations: [],
    };
  },

  // 生成孩童NPC
  generateChildNPC(area) {
    const surname = COMMONER_SURNAMES[Math.floor(Math.random() * COMMONER_SURNAMES.length)];
    const isFemale = Math.random() < 0.5;
    const givenName = isFemale
      ? COMMONER_FEMALE_NAMES[Math.floor(Math.random() * COMMONER_FEMALE_NAMES.length)]
      : COMMONER_MALE_NAMES[Math.floor(Math.random() * COMMONER_MALE_NAMES.length)];
    const childName = CHILD_NAMES[Math.floor(Math.random() * CHILD_NAMES.length)];
    
    return {
      id: "npc_" + Date.now() + "_" + Math.floor(Math.random() * 99999),
      name: surname + (childName || givenName),
      title: "孩童",
      isFemale: isFemale,
      gender: isFemale ? "女" : "男",
      cultLevel: -1,
      cultName: "孩童",
      personality: NPC_PERSONALITIES[0],
      action: ["正在玩耍", "正在跑来跑去", "正在哭闹", "正在吃东西"][Math.floor(Math.random() * 4)],
      hp: 10, maxHp: 10, atk: 1, def: 0,
      items: [],
      stones: 0,
      area: area,
      isAlive: true,
      isFriend: false,
      isChild: true,
      mood: Math.floor(Math.random() * 50) + 30,
      age: Math.floor(Math.random() * 10) + 1,
      lifespan: 100,
      equipment: {},
      relations: [],
    };
  },

  // ===== 扩展任务检查 =====
  checkExpandQuests() {
    const s = Game.state;
    if (!s.activeQuests) s.activeQuests = [];
    if (!s.completedQuests) s.completedQuests = [];
    
    // 添加扩展支线任务
    if (CULT_LEVELS[s.cultLevel].stage >= 1 && !s.activeQuests.includes("side_spirit_mountain") && !s.completedQuests.includes("side_spirit_mountain")) {
      s.activeQuests.push("side_spirit_mountain");
    }
    if (CULT_LEVELS[s.cultLevel].stage >= 0 && !s.activeQuests.includes("side_spirit_pet") && !s.completedQuests.includes("side_spirit_pet")) {
      s.activeQuests.push("side_spirit_pet");
    }
    if (CULT_LEVELS[s.cultLevel].stage >= 2 && !s.activeQuests.includes("side_sect_conquer") && !s.completedQuests.includes("side_sect_conquer")) {
      s.activeQuests.push("side_sect_conquer");
    }
    
    // 检查扩展任务完成
    s.activeQuests.forEach(questId => {
      if (s.completedQuests.includes(questId)) return;
      if (!EXPAND_QUESTS[questId]) return;
      let complete = false;
      switch(questId) {
        case "side_spirit_mountain": complete = s.hasSpiritMountain === true; break;
        case "side_marriage": complete = (s.spouses || []).length >= 1; break;
        case "side_offspring": complete = (s.offspring || []).length >= 1; break;
        case "side_spirit_pet": complete = (s.spiritPets || []).length >= 1; break;
        case "side_sect_build": complete = s.spiritMountain && s.spiritMountain.buildings && s.spiritMountain.buildings["main_hall"] > 0; break;
        case "side_sect_conquer": complete = (s.conqueredSects || []).length >= 1 || (s.vassals || []).length >= 1; break;
        case "side_longevity": complete = (s.lifespanBonus || 0) >= 500; break;
        case "side_npc_breakthrough": complete = (s.helpedNpcBreakthrough || 0) >= 1; break;
        case "side_dual_cultivation": complete = (s.dualCultCount || 0) >= 1; break;
        case "side_disciple_10": complete = s.spiritMountain && (s.spiritMountain.disciples || 0) >= 10; break;
      }
      if (complete) {
        s.completedQuests.push(questId);
        s.activeQuests = s.activeQuests.filter(q => q !== questId);
        const reward = Math.floor(200 * (CULT_LEVELS[s.cultLevel].stage + 1));
        s.spiritStones += reward;
        Game.gainExp(reward * 2);
        UI.toast("📋 任务完成：" + EXPAND_QUESTS[questId].name + "！获得" + reward + "灵石和" + (reward*2) + "经验。", "gold");
      }
    });
  },
});

// 全局变量存储当前区域
var s_currentArea = "";
