/* ====== 凡人修仙传MUD · 扩展7引擎（宗门建筑/对话面板/忠贞度菜单/友好度/NPC行为/机缘悟性/副本优化/自立宗门） ====== */
/* Object.assign扩展WorldSystem，不修改原文件 */

Object.assign(WorldSystem, {

  // ===== 扩展7状态初始化 =====
  initExpand7State(s) {
    if (!s.sectBuildings) s.sectBuildings = {}; // {sectId: {scripture_lib: level, ...}}
    if (!s.ownSectBuildings) s.ownSectBuildings = {}; // 自立宗门建筑
    if (!s.sectContribution) s.sectContribution = {}; // {sectId: contribution}
    if (!s.ownSectMembers) s.ownSectMembers = []; // 自立宗门成员列表 [{npcId, role, location}]
    if (!s.npcExploreLog) s.npcExploreLog = []; // NPC探索日志
    if (s.ownSectFounded === undefined) s.ownSectFounded = false;
    if (!s.mainQuestReturnLoc) s.mainQuestReturnLoc = null; // 主线返回地点追踪
    if (!s.conqueredSectBuildings) s.conqueredSectBuildings = {}; // 征服的宗门建筑使用记录
  },

  // ============================================================
  // 1. 主线任务系统优化
  // ============================================================

  // 获取当前主线任务阶段（优化版）
  getCurrentMainQuest() {
    const s = Game.state;
    if (!s.pmainProgress) s.pmainProgress = 0;
    if (!s.pmainCompleted) s.pmainCompleted = [];
    const story = this.PERMANENT_MAIN_STORY;
    let currentIdx = s.pmainProgress;
    // 跳过已完成的阶段
    while (currentIdx < story.length && s.pmainCompleted.includes(story[currentIdx].id)) {
      currentIdx++;
    }
    if (currentIdx >= story.length) return null; // 全部完成
    return { stage: story[currentIdx], idx: currentIdx };
  },

  // 主线任务点击跳转（优化版 - 记录返回地点）
  goToMainQuest(idx) {
    const s = Game.state;
    this.initExpand7State(s);
    const story = this.PERMANENT_MAIN_STORY;
    const stage = story[idx];
    if (!stage) return;

    // 记录当前所在地点（用于返回）
    s.mainQuestReturnLoc = s.currentWilderness || s.location || null;

    // 前往主线所在地
    const stageArea = stage.stage;
    // 查找匹配的WORLD_MAP key
    let targetKey = null;
    for (const key in WORLD_MAP) {
      const loc = WORLD_MAP[key];
      if (key === stageArea || loc.name === stageArea ||
          loc.name.includes(stageArea) || stageArea.includes(loc.name)) {
        targetKey = key;
        break;
      }
    }
    if (targetKey) {
      this.travelToWithTime(targetKey);
    } else {
      // 如果找不到精确匹配，前往storyNode
      Game.gotoNode(stage.node);
    }
  },

  // ============================================================
  // 2. NPC对话面板重构（统一面板）
  // ============================================================

  // 重构后的NPC交谈面板
  talkToNPCPanel(npcId) {
    const s = Game.state;
    this.initWorldState(s);
    this.initExpand7State(s);
    if (typeof this.initExpand4State === 'function') this.initExpand4State(s);
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) { UI.toast("此人已不在此处。", "danger"); return; }

    Game._lastNpcId = npcId;

    // 支线NPC优先
    if (npc.isSideQuestNPC && typeof this.talkToSideQuestNPC === 'function') {
      if (this.talkToSideQuestNPC(npcId)) return;
    }

    s.npcInteractions = (s.npcInteractions || 0) + 1;
    if (s.npcInteractions === 1) Game.giveAchievement("npc_first_meet");

    // 初始化社交网络
    if (typeof this.setupNPCSocialNetwork === 'function' && !npc.socialNetwork) {
      this.setupNPCSocialNetwork(npc, s);
    }
    // 生成亲戚关系
    if (!npc.socialNetwork.relatives && typeof this.generateRelatives === 'function') {
      this.generateRelatives(npc, s);
    }

    // 获取对话内容
    const dialogue = this.getNPCDialogue(npc);
    const isMortal = npc.cultLevel < 0;
    const genderStr = npc.isFemale ? "女修" : (isMortal ? (npc.isChild ? "孩童" : "女子") : "男修");

    let texts = [
      {type:"narration",content:"你在" + (npc.area || "此地") + "遇到了一位" + genderStr + "——" + npc.title + npc.name + "。"},
      {type:"narration",content:"对方" + (npc.action || "正在活动") + (npc.cultLevel !== undefined && npc.cultLevel >= 0 ? "，修为似乎在" + npc.cultName + "左右" : "") + "，性格" + npc.personality.type + "。"},
      {type:"dialogue",content:dialogue},
    ];

    // 每日好感度上限20
    if (!s.npcDailyAffinity) s.npcDailyAffinity = {};
    if (!s.npcDailyAffinity[npcId]) s.npcDailyAffinity[npcId] = {day: s.gameDay || 1, amount: 0};
    // 检查是否新的一天，如果是则重置
    if (s.npcDailyAffinity[npcId].day !== (s.gameDay || 1)) {
      s.npcDailyAffinity[npcId] = {day: s.gameDay || 1, amount: 0};
    }
    const todayAff = s.npcDailyAffinity[npcId].amount || 0;
    const talkGain = Math.floor(npc.personality.talkBias * 10);
    if (todayAff < 20) {
      const actualGain = Math.min(talkGain, 20 - todayAff);
      npc.mood = Math.min(100, npc.mood + actualGain);
      s.npcDailyAffinity[npcId].amount = todayAff + actualGain;
      texts.push({type:"system_msg",content:"好感度+" + actualGain + "（当前：" + npc.mood + "/100，今日剩余：" + (20 - s.npcDailyAffinity[npcId].amount) + "）"});
    } else {
      texts.push({type:"system_msg",content:"今日与" + npc.name + "的好感度提升已达上限（20/20）。"});
    }

    UI.closeModal();
    UI.renderNarrative(texts);

    // 叛徒NPC只有击杀选项
    if (npc.isTraitorQuest) {
      const traitorDialogue = TRAITOR_DIALOGUE[Math.floor(Math.random() * TRAITOR_DIALOGUE.length)];
      UI.renderNarrative([{type:"dialogue", content: traitorDialogue}]);
      UI.renderChoices([
        {text:"⚔️ 击杀" + npc.name, next:"_npc_attack_" + npcId, effect:{}},
        {text:"离开", next:"_npc_leave", effect:{}},
      ]);
      return;
    }

    // 构建统一选项面板
    this.buildNPCInteractionChoices(npc, npcId, s);
  },

  // 构建NPC交互选项面板
  buildNPCInteractionChoices(npc, npcId, s) {
    const choices = [];

    // 基础选项（所有人都有）
    choices.push({text:"💬 闲聊", next:"_npc_chat_" + npcId, effect:{}, compact:true});
    choices.push({text:"📋 详情", next:"_npc_detail_" + npcId, effect:{}, compact:true});
    choices.push({text:"🎁 送礼", next:"_gift_npc_" + npcId, effect:{}, compact:true});
    choices.push({text:"💊 给丹药", next:"_give_pill_" + npcId, effect:{}, compact:true});
    choices.push({text:"👥 关系网", next:"_npc_social_" + npcId, effect:{}, compact:true});

    // 结交（好感≥50）
    if (npc.mood >= 50 && !npc.isFriend) {
      choices.push({text:"🤝 结交", next:"_npc_befriend_" + npcId, effect:{}, compact:true});
    }

    // 道侣相关
    const isOppositeSex = !npc.isChild && !npc.isFemale !== !s.isFemale;
    var canMarry = false;
    var canMarrySpecial = false;
    var marrySpecialLabel = "";
    if (isOppositeSex && !(s.spouses || []).includes(npcId)) {
      if (npc.mood >= 80) {
        canMarry = true;
      } else if (s.npcExtremeBuff && s.npcExtremeBuff[npcId]) {
        canMarry = true; canMarrySpecial = true; marrySpecialLabel = "💍 [孽缘]提亲";
      } else if (npc.deceived) {
        canMarry = true; canMarrySpecial = true; marrySpecialLabel = "💍 [哄骗]提亲";
      } else if (npc.secretDual) {
        canMarry = true; canMarrySpecial = true; marrySpecialLabel = "💍 [密缘]提亲";
      }
    }
    const canDualCult = (s.spouses || []).includes(npcId);

    if (canMarry && typeof this.proposeMarriage === 'function') {
      choices.push({text: canMarrySpecial ? marrySpecialLabel : "💍 提亲", next:"_npc_marry_" + npcId, effect:{}, compact:true});
    }
    if (canDualCult && typeof this.dualCultivate === 'function') {
      choices.push({text:"💕 双修", next:"_npc_dual_" + npcId, effect:{}, compact:true});
    }

    // "更多"选项（异性+好感≥80+有道侣）
    var inWildDungeon = s.currentWilderness || (s.location && typeof WORLD_MAP !== 'undefined' && WORLD_MAP[s.location] && !s.currentPlace);
    var wildInteract = inWildDungeon && isOppositeSex;

    // "更多"选项（条件：异性+好感≥80+有道侣；或忠贞度已被降低过<100；野外也放宽）
    var loyaltyVal = (npc.loyalty !== undefined ? npc.loyalty : 100);
    var canShowMore = isOppositeSex && !npc.isChild && npc.mood >= 80 && (npc.hasSpouse || loyaltyVal < 100);
    if (wildInteract && isOppositeSex && !npc.isChild && (npc.hasSpouse || loyaltyVal < 100)) canShowMore = true;
    if (canShowMore) {
      var loyaltyDisplay = loyaltyVal <= 0 ? loyaltyVal + "⚠️" : loyaltyVal;
      choices.push({text:"🌹 更多(" + loyaltyDisplay + ")", next:"_npc_more_" + npcId, effect:{}, compact:true});
    }

    // 哄骗（野外只需异性+有道侣；非野外需好感100+道侣）
    var canDeceive = isOppositeSex && npc.hasSpouse && !npc.isChild && (wildInteract || npc.mood >= 100);
    if (canDeceive && typeof this.deceiveNPC === 'function') {
      choices.push({text:"💔 哄骗断绝", next:"_deceive_npc_" + npcId, effect:{}, compact:true});
    }

    // 降低忠贞度（条件：异性+好感≥80+有道侣；或忠贞度已被降低过；野外放宽）
    var canLowerLoyalty = isOppositeSex && !npc.isChild && npc.mood >= 80 && (npc.hasSpouse || loyaltyVal < 100);
    if (wildInteract && isOppositeSex && !npc.isChild && (npc.hasSpouse || loyaltyVal < 100)) canLowerLoyalty = true;
    if (canLowerLoyalty && typeof this.showLowerLoyaltyPanel === 'function') {
      choices.push({text:"🔓 降忠贞(" + loyaltyVal + ")", next:"_lower_loyalty_" + npcId, effect:{}, compact:true});
    }

    // 秘密双修（野外只需异性+有道侣或忠贞<100；非野外需道侣或忠贞<100+忠贞<=30+好感>=60）
    var canSecretDual = isOppositeSex && !npc.isChild && (npc.hasSpouse || loyaltyVal < 100) && (wildInteract || (loyaltyVal <= 30 && npc.mood >= 60));
    if (canSecretDual && typeof this.secretDualCultivate === 'function') {
      choices.push({text:"🔥 秘密双修", next:"_secret_dual_" + npcId, effect:{}, compact:true});
    }

    // 挖角
    if (npc.sectId && s.ownSect && typeof this.showPoachPanel === 'function') {
      choices.push({text:"🎣 挖角", next:"_poach_npc_" + npcId, effect:{}, compact:true});
    }

    // 邀请加入自立宗门
    if (!npc.sectId && s.ownSect && npc.mood >= 80 && typeof this.inviteNPCToSect === 'function') {
      choices.push({text:"🏯 邀请加入", next:"_own_sect_invite_" + npcId, effect:{}, compact:true});
    }

    // 强迫双修（野外无限制；非野外需高一个境界阶段）
    if (isOppositeSex && (wildInteract || (typeof this.canForceDualCult === 'function' && this.canForceDualCult(npc, s)))) {
      choices.push({text:"💢 强迫双修", next:"_force_dual_npc_" + npcId, effect:{}, compact:true});
    }

    // 拜义父义母
    if (typeof this.adoptAsGodparent === 'function' && npc.age && npc.age >= (s.age || 16) + 20 && npc.mood >= 100 && !npc.isChild) {
      const godparentLabel = npc.isFemale ? "🙏 拜义母" : "🙏 拜义父";
      choices.push({text:godparentLabel, next:"_adopt_npc_" + npcId, effect:{}, compact:true});
    }

    // 剥夺灵根（扩展8：修为高于对方2级以上）
    if (!npc.isChild && typeof WorldSystem.showStripRootPanel === 'function') {
      if (typeof WorldSystem.ensureNPCSpiritRoot === 'function') WorldSystem.ensureNPCSpiritRoot(npc);
      if (npc.spiritRoot && npc.spiritRoot.tier > 0) {
        choices.push({text:"🔮 剥夺灵根", next:"_strip_root_" + npcId, effect:{}, compact:true});
      }
    }

    // 同行（扩展8：好感≥60）
    if (!npc.isChild && npc.mood >= 60 && typeof WorldSystem.showTravelCompanionPanel === 'function') {
      if (!s.travelCompanion) {
        choices.push({text:"🚶 同行", next:"_travel_with_" + npcId, effect:{}, compact:true});
      }
    }

    // 袭击（非儿童才有）
    if (!npc.isChild) {
      choices.push({text:"⚔️ 袭击", next:"_npc_attack_" + npcId, effect:{}, compact:true});
    }

    // 偷窃
    choices.push({text:"🤏 偷窃", next:"_npc_steal_" + npcId, effect:{}, compact:true});

    // 离开
    choices.push({text:"🚪 告辞", next:"_npc_leave", effect:{}});

    UI.renderChoices(choices);
  },

  // 闲聊功能
  npcChat(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) return;

    const isMortal = npc.cultLevel < 0 || npc.cultLevel === undefined;
    let dialogue;
    if (isMortal) {
      dialogue = MORTAL_DIALOGUES[Math.floor(Math.random() * MORTAL_DIALOGUES.length)];
    } else {
      dialogue = CULTIVATOR_DIALOGUES[Math.floor(Math.random() * CULTIVATOR_DIALOGUES.length)];
      dialogue = dialogue.replace("{area}", npc.area || "天南");
      dialogue = dialogue.replace("{sect}", npc.sectName || "某宗门");
    }

    let texts = [
      {type:"dialogue", content: dialogue},
    ];

    // 小概率好感度提升
    if (Math.random() < 0.3) {
      if (!s.npcDailyAffinity) s.npcDailyAffinity = {};
      const todayAff = s.npcDailyAffinity[npcId] || 0;
      if (todayAff < 20) {
        const gain = 1;
        npc.mood = Math.min(100, npc.mood + gain);
        s.npcDailyAffinity[npcId] = todayAff + gain;
        texts.push({type:"system_msg", content:"好感度+1（当前：" + npc.mood + "/100）"});
      }
    }

    // 有概率获得情报
    if (Math.random() < 0.15) {
      const rumors = [
        "「听说{area}附近最近出现了不少灵兽。」",
        "「坊市上的灵石价格又涨了。」",
        "「最近有修士在附近失踪，大家都在传是魔道所为。」",
        "「据说明日有大宗门来此招弟子。」",
      ];
      let rumor = rumors[Math.floor(Math.random() * rumors.length)];
      rumor = rumor.replace("{area}", npc.area || "天南");
      texts.push({type:"narration", content: npc.name + "又低声补充道："});
      texts.push({type:"dialogue", content: rumor});
    }

    texts.push({type:"system_msg", content:"你可以继续与" + npc.name + "交流。"});

    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"继续交谈", next:"_npc_talk_" + npcId, effect:{}},
      {text:"告辞离开", next:"_npc_leave", effect:{}},
    ]);
    UI.updateAll();
  },

  // ============================================================
  // 3. "更多"菜单（基于忠贞度等级）
  // ============================================================

  showMorePanel(npcId) {
    const s = Game.state;
    this.initExpand7State(s);
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) return;

    let html = '<div class="modal-section"><div class="modal-section-title">🌹 更多互动</div>';
    var loyaltyVal2 = (npc.loyalty !== undefined ? npc.loyalty : 100);
    var loyaltyColor = loyaltyVal2 <= 0 ? 'var(--crimson-bright)' : (loyaltyVal2 <= 30 ? 'var(--crimson)' : 'var(--jade-bright)');
    html += '<p style="text-align:center;">当前忠贞度：<span style="color:' + loyaltyColor + ';font-weight:bold;">' + loyaltyVal2 + '</span><span style="color:var(--text-dim);font-size:0.8em;">（范围 -100 ~ 100）</span></p>';
    if (loyaltyVal2 <= 0) {
      html += '<p style="text-align:center;color:var(--crimson-bright);font-size:0.85em;">⚠️ 忠贞尽失！可无条件结为道侣，强迫双修更易触发孽缘羁绊。</p>';
    } else {
      html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;">忠贞度越低，可做的事情越过分。每次行动都可能被发现。</p>';
    }

    MORE_ACTIONS.forEach(action => {
      const canDo = ((npc.loyalty !== undefined ? npc.loyalty : 100)) <= action.reqLoyalty && npc.mood >= (action.reqMood || 0);
      const meetsItem = !action.needItem || (s.inventory || []).some(inv => inv.id === action.needItem);
      const desc = action.desc_text.replace(/{name}/g, npc.name).replace(/{area}/g, npc.area || "此地");

      html += '<div class="modal-item-row" style="opacity:' + (canDo ? '1' : '0.4') + '"><div>';
      html += '<div style="color:' + (canDo ? 'var(--gold-bright)' : 'var(--text-dim)') + ';">';
      if (action.needItem && !meetsItem) html += '🔒 ';
      if (!canDo && ((npc.loyalty !== undefined ? npc.loyalty : 100)) > action.reqLoyalty) html += '🔒 ';
      html += action.name;
      html += ' <span style="font-size:0.75em;color:var(--text-dim);">[忠贞≤' + action.reqLoyalty + ']</span>';
      if (action.needItem) {
        const item = ITEMS[action.needItem];
        html += ' <span style="font-size:0.7em;color:var(--jade);">需' + (item ? item.name : action.needItem) + '</span>';
      }
      html += '</div>';
      html += '<div class="modal-item-desc">' + action.desc + '</div>';
      html += '<div class="modal-item-stats">' + desc + '</div>';
      if (canDo && meetsItem) {
        html += '<button class="btn-combat" style="margin-top:4px;font-size:0.65em;padding:3px 8px;" onclick="UI.closeModal();WorldSystem.doMoreAction(\'' + npcId + '\',\'' + action.id + '\')">执行</button>';
      }
      html += '</div></div>';
    });

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal();WorldSystem.talkToNPCPanel(\'' + npcId + '\')">返回</button>');
  },

  doMoreAction(npcId, actionId) {
    const s = Game.state;
    this.initExpand7State(s);
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) return;

    const action = MORE_ACTIONS.find(a => a.id === actionId);
    if (!action) return;

    // 检查条件
    if (((npc.loyalty !== undefined ? npc.loyalty : 100)) > action.reqLoyalty) {
      UI.toast("忠贞度不足，无法进行此操作。", "danger"); return;
    }
    if (npc.mood < (action.reqMood || 0)) {
      UI.toast("好感度不足。", "danger"); return;
    }
    if (action.needItem) {
      const invIdx = (s.inventory || []).findIndex(inv => inv.id === action.needItem);
      if (invIdx < 0) { UI.toast("缺少所需物品。", "danger"); return; }
      const inv = s.inventory[invIdx];
      inv.count--;
      if (inv.count <= 0) s.inventory.splice(invIdx, 1);
    }

    const descText = action.desc_text.replace(/{name}/g, npc.name).replace(/{area}/g, npc.area || "此地");
    let texts = [
      {type:"narration", content: descText},
    ];

    // 效果处理
    if (action.affinityGain) {
      if (!s.npcDailyAffinity) s.npcDailyAffinity = {};
      const todayAff = s.npcDailyAffinity[npcId] || 0;
      const actualGain = Math.min(action.affinityGain, 20 - todayAff);
      npc.mood = Math.min(100, npc.mood + actualGain);
      s.npcDailyAffinity[npcId] = todayAff + actualGain;
      texts.push({type:"system_msg", content:"好感度+" + actualGain + "（当前：" + npc.mood + "/100）"});
    }
    if (action.expGain) {
      Game.gainExp(action.expGain);
      texts.push({type:"reward", content:"✨ 获得" + action.expGain + "经验"});
    }

    // 降低忠贞度（性格影响）
    const personalityMult = npc.personality.talkBias > 0.5 ? 0.7 : (npc.personality.talkBias > 0.3 ? 1.0 : 1.3);
    const loyaltyReduction = Math.ceil(5 * personalityMult + Math.random() * 3);
    npc.loyalty = Math.max(-100, (npc.loyalty !== undefined ? npc.loyalty : 100) - loyaltyReduction);
    var loyaltyDisplay3 = npc.loyalty <= 0 ? npc.loyalty + " ⚠️" : npc.loyalty;
    texts.push({type:"system_msg", content:"忠贞度-" + loyaltyReduction + "（当前：" + loyaltyDisplay3 + "）"});

    // 被发现检查
    if (action.effect === "discover" || action.effect === "secret_dual") {
      // 降低次数越多越容易被发现
      const lowerCount = s.lowerLoyaltyCount = (s.lowerLoyaltyCount || 0) + 1;
      const baseDiscoverChance = action.discoverChance || 0.15;
      const bonusChance = Math.min(0.3, lowerCount * 0.03); // 每次多3%
      const finalChance = baseDiscoverChance + bonusChance;
      const discovered = Math.random() < finalChance;

      if (discovered) {
        s.karma = (s.karma || 0) + 3;
        s.heartDemon = (s.heartDemon || 0) + 1;
        texts.push({type:"danger", content:"⚠️ 你的行为被" + npc.name + "的道侣发现了！"});
        texts.push({type:"danger", content:"道德降低，因果值+3，心魔值+1"});

        const spouse = npc.socialNetwork && npc.socialNetwork.spouse;
        if (spouse && npc.loyalty <= 0 && Math.random() < 0.4) {
          npc.hasSpouse = false;
          npc.socialNetwork.spouse = null;
          texts.push({type:"chapter_title", content:"💔 道侣反目"});
          texts.push({type:"narration", content:"由于忠贞度过低，" + npc.name + "与道侣彻底反目！"});
        } else if (spouse) {
          const enemyId = "enemy_npc_" + Date.now();
          s.npcList.push({
            id: enemyId, name: spouse.name, title: spouse.title || "",
            isFemale: spouse.isFemale, cultLevel: spouse.cultLevel || npc.cultLevel,
            cultName: spouse.cultLevel !== undefined ? CULT_LEVELS[spouse.cultLevel].name : npc.cultName,
            personality: NPC_PERSONALITIES[0],
            hp: npc.hp * 1.3, maxHp: npc.hp * 1.3, atk: npc.atk * 1.2, def: npc.def,
            mood: -500, isAlive: true, isFriend: false,
            area: npc.area, isAmbusher: true, targetPlayer: true, ambushChance: 0.2,
          });
          s.ambushers.push(enemyId);
          texts.push({type:"danger", content: spouse.name + "将会在探索时袭击你！"});
        }
      } else {
        texts.push({type:"system_msg", content:"这次没有被发现。"});
      }
    }

    // 秘密双修效果
    if (action.effect === "secret_dual") {
      npc.secretDual = true;
      const baseExp = 500;
      var loyaltyForCalc = (npc.loyalty !== undefined ? npc.loyalty : 100);
      const bonusExp = Math.floor(baseExp * (1 + (100 - loyaltyForCalc) / 50));
      Game.gainExp(bonusExp);
      texts.push({type:"reward", content:"✨ 秘密双修获得" + bonusExp + "经验"});
      npc.mood = Math.min(100, npc.mood + 10);
      // 怀孕判定（忠贞度越低怀孕率越高，负数时更高）
      const pregnancyChance = Math.min(0.98, 0.6 + (100 - loyaltyForCalc) * 0.003);
      if (Math.random() < pregnancyChance && typeof this.startPregnancy === 'function') {
        texts.push({type:"reward", content:"💕 " + npc.name + "似乎有了身孕的迹象……"});
        this.startPregnancy(npcId, true);
      }
    }

    // 忠贞度过低提示
    var loyaltyFinal = (npc.loyalty !== undefined ? npc.loyalty : 100);
    if (loyaltyFinal <= 0) {
      texts.push({type:"system_msg", content:"⚠️ " + npc.name + "的忠贞已彻底丧失！可无条件结为道侣，强迫双修更易触发孽缘羁绊。"});
    } else if (loyaltyFinal <= 30 && npc.hasSpouse) {
      texts.push({type:"system_msg", content: npc.name + "的忠贞度已极低，可以尝试更多……"});
    }

    this.checkTitles();
    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"继续交谈", next:"_npc_talk_" + npcId, effect:{}},
      {text:"更多选项", next:"_npc_more_" + npcId, effect:{}},
      {text:"告辞离开", next:"_npc_leave", effect:{}},
    ]);
    UI.updateAll();
  },

  // ============================================================
  // 4. 宗门/家族专属区域地图与建筑系统
  // ============================================================

  // 进入宗门/家族区域
  enterSectArea(sectId) {
    const s = Game.state;
    this.initExpand7State(s);
    const sect = SECTS_AND_FAMILIES[sectId];
    if (!sect) { UI.toast("未知宗门。", "danger"); return; }

    const cultStage = CULT_LEVELS[s.cultLevel].stage;
    if (cultStage < sect.reqStage) {
      UI.toast("修为不足，无法进入" + sect.name + "。", "danger"); return;
    }

    // 设置当前地点
    s.location = sect.name;
    s.currentSectArea = sectId; // 记录宗门ID用于返回
    UI.closeModal();

    // 消耗旅行时间（1天）
    this.advanceTime(24);

    const relation = s.sectRelations[sectId] || 0;
    const isOwnSect = s.ownSectId === sectId;
    const isConquered = s.conqueredSects.includes(sectId);
    const isVassal = s.vassals.includes(sectId);

    let texts = [
      {type:"chapter_title", content: sect.type === "sect" ? "🏯 " + sect.name : "🏛️ " + sect.name},
      {type:"narration", content: "你来到了" + sect.name + "。"},
      {type:"narration", content: sect.desc},
    ];

    if (isOwnSect) {
      texts.push({type:"system_msg", content:"这是你的宗门，你可以自由出入所有建筑。"});
    } else if (isConquered) {
      texts.push({type:"system_msg", content:"此宗门已被你征服，所有建筑可无条件使用。"});
    } else if (isVassal) {
      texts.push({type:"system_msg", content:"此宗门是你的附庸，关系融洽。"});
    } else {
      texts.push({type:"system_msg", content:"关系：" + (relation >= 50 ? "盟友" : relation >= 30 ? "友好" : relation >= 0 ? "中立" : "不和") + "（" + relation + "）"});
    }

    UI.renderNarrative(texts);

    // 确保有NPC
    this.ensureAreaNPCs(s, sect.region);

    const choices = [];
    // 宗门建筑选项
    const buildings = Object.keys(SECT_BUILDINGS);
    buildings.forEach(bldKey => {
      const bld = SECT_BUILDINGS[bldKey];
      const bldLevel = this.getSectBuildingLevel(s, sectId, bldKey);
      const canAccess = isOwnSect || isConquered || relation >= 20;
      if (canAccess || bldLevel > 0) {
        choices.push({
          text: bld.icon + " " + bld.name + (bldLevel > 0 ? "（Lv." + bldLevel + "）" : ""),
          next: "_sect_building_" + sectId + "|" + bldKey,
          effect: {},
        });
      }
    });

    // 宗门管理（仅自立宗门）
    if (isOwnSect) {
      choices.push({text:"🏛️ 宗门管理", next:"_own_sect_manage", effect:{}});
      choices.push({text:"🏗️ 建造建筑", next:"_own_sect_build", effect:{}});
    }

    // NPC交互
    const areaNPCs = this.getAreaNPCs(s, sect.region);
    const sectNPCs = areaNPCs.filter(n => n.isAlive).slice(0, 3);
    sectNPCs.forEach(npc => {
      const genderStr = npc.isFemale ? "女" : "男";
      choices.push({text:"与" + npc.name + "交谈（" + genderStr + "·" + npc.cultName + "）", next:"_npc_talk_" + npc.id, effect:{}});
    });

    choices.push({text:"打开地图", next:"_open_map", effect:{}});
    choices.push({text:"返回", next:"_wild_return", effect:{}});
    UI.renderChoices(choices);
    UI.updateAll();
  },

  // 获取宗门建筑等级
  getSectBuildingLevel(s, sectId, bldKey) {
    if (s.ownSectId === sectId) {
      return (s.ownSectBuildings && s.ownSectBuildings[bldKey]) || 0;
    }
    // 其他宗门建筑等级根据宗门实力决定
    const sect = SECTS_AND_FAMILIES[sectId];
    if (!sect) return 0;
    return Math.min(SECT_BUILDINGS[bldKey].maxLevel, Math.ceil(sect.strength / 2));
  },

  // 进入宗门建筑
  enterSectBuilding(sectId, bldKey) {
    const s = Game.state;
    this.initExpand7State(s);
    const sect = SECTS_AND_FAMILIES[sectId];
    const bld = SECT_BUILDINGS[bldKey];
    if (!sect || !bld) return;

    const bldLevel = this.getSectBuildingLevel(s, sectId, bldKey);
    const isOwnSect = s.ownSectId === sectId;
    const isConquered = s.conqueredSects.includes(sectId);
    const relation = s.sectRelations[sectId] || 0;
    const canFree = isOwnSect || isConquered;

    // 设置场所状态
    s.currentPlace = {locKey: sect.region, placeType: bldKey};

    let texts = [
      {type:"narration", content:"你进入了" + sect.name + "的" + bld.name + "。"},
      {type:"narration", content:bld.desc},
    ];

    if (bldLevel > 0) {
      texts.push({type:"system_msg", content:"建筑等级：Lv." + bldLevel});
    }

    UI.closeModal();
    UI.renderNarrative(texts);

    const choices = [];

    if (bldKey === "scripture_lib") {
      choices.push({text:"📚 兑换功法", next:"_sect_library_" + sectId, effect:{}});
      choices.push({text:"📖 阅读典籍（获得修为经验）", next:"_sect_read_" + sectId, effect:{}});
    } else if (bldKey === "treasure_pav") {
      choices.push({text:"💎 兑换宝物", next:"_sect_treasure_" + sectId, effect:{}});
    } else if (bldKey === "alchemy_room") {
      choices.push({text:"⚗️ 兑换丹药", next:"_sect_pills_" + sectId, effect:{}});
      choices.push({text:"🔥 自行炼丹", next:"_sect_alchemy_craft_" + sectId, effect:{}});
    } else if (bldKey === "artifact_room") {
      choices.push({text:"⚔️ 兑换武器", next:"_sect_weapons_" + sectId, effect:{}});
      choices.push({text:"🔨 自行炼器", next:"_sect_artifact_craft_" + sectId, effect:{}});
    } else if (bldKey === "training_ground") {
      choices.push({text:"💪 修炼练功（消耗1天，获得经验）", next:"_sect_train_" + sectId, effect:{}});
      choices.push({text:"⚔️ 切磋（与NPC战斗）", next:"_sect_spar_" + sectId, effect:{}});
    } else if (bldKey === "mission_hall") {
      choices.push({text:"📋 查看任务", next:"_loc_quest_panel_" + sect.region, effect:{}});
    }

    // 强行使用（征服后）
    if (isConquered && !isOwnSect) {
      const areaNPCs = this.getAreaNPCs(s, sect.region);
      const oppositeNPCs = areaNPCs.filter(n => n.isAlive && !n.isChild && !n.isFemale !== !s.isFemale);
      if (oppositeNPCs.length > 0) {
        texts.push({type:"danger", content:"⚠️ 此宗门已被你征服，你可以强行与异性弟子双修，但这会导致宗门反叛！"});
        oppositeNPCs.slice(0, 3).forEach(npc => {
          choices.push({text:"💢 强行与" + npc.name + "双修", next:"_conquered_force_dual_" + sectId + "|" + npc.id, effect:{}});
        });
      }
    }

    // NPC交互
    const placeNPCs = typeof this.getPlaceNPCs === 'function' ? this.getPlaceNPCs(s, sect.region, bldKey) : [];
    placeNPCs.slice(0, 3).forEach(npc => {
      choices.push({text:"与" + npc.name + "交谈", next:"_npc_talk_" + npc.id, effect:{}});
    });

    choices.push({text:"返回" + sect.name, next:"_sect_area_" + sectId, effect:{}});
    UI.renderChoices(choices);
    UI.updateAll();
  },

  // 藏书阁 - 兑换功法
  showSectLibrary(sectId) {
    const s = Game.state;
    this.initExpand7State(s);
    const sect = SECTS_AND_FAMILIES[sectId];
    if (!sect) return;

    const sectStrength = sect.strength;
    const maxStage = Math.min(Math.floor(sectStrength / 2), 7);
    const playerPos = this.getPlayerSectPosition(s, sectId);
    const playerPosRank = SECT_POSITIONS_RANK[playerPos] ? SECT_POSITIONS_RANK[playerPos].rank : 0;

    let html = '<div class="modal-section"><div class="modal-section-title">📚 ' + sect.name + ' · 藏书阁</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;">你的贡献度：' + (s.sectContribution[sectId] || 0) + ' | 职务：' + (SECT_POSITIONS_RANK[playerPos] ? SECT_POSITIONS_RANK[playerPos].name : '无') + '</p>';

    for (let stage = 0; stage <= maxStage; stage++) {
      const techs = SECT_TECHS_BY_STAGE[stage] || [];
      if (techs.length === 0) continue;
      const stageName = STAGE_NAMES[stage] || ("阶段" + stage);

      html += '<div class="modal-section-title" style="margin-top:8px;font-size:0.9em;">' + stageName + '功法（' + techs.length + '部）</div>';

      techs.forEach(tech => {
        const has = s.techniques.includes(tech.id);
        const posRank = SECT_POSITIONS_RANK[tech.posReq] ? SECT_POSITIONS_RANK[tech.posReq].rank : 0;
        const meetsPos = playerPosRank >= posRank;
        const meetsCult = CULT_LEVELS[s.cultLevel].stage >= tech.reqStage;
        const canExchange = !has && meetsPos && meetsCult && (s.sectContribution[sectId] || 0) >= tech.contribCost;
        const isFree = s.ownSectId === sectId || s.conqueredSects.includes(sectId);

        html += '<div class="modal-item-row" style="opacity:' + (has ? '0.4' : '1') + '"><div>';
        html += '<div style="color:' + (has ? 'var(--text-dim)' : 'var(--gold-bright)') + ';">';
        html += has ? '✅ ' : (canExchange || isFree ? '📜 ' : '🔒 ');
        html += tech.name;
        if (!has) {
          html += ' <span style="font-size:0.75em;color:var(--text-dim);">[需' + SECT_POSITIONS_RANK[tech.posReq].name + ']</span>';
          html += ' <span style="font-size:0.75em;color:var(--jade);">' + (isFree ? '免费' : tech.contribCost + '贡献') + '</span>';
        }
        html += '</div>';
        html += '<div class="modal-item-desc">' + (tech.desc || '') + '</div>';
        html += '<div class="modal-item-stats">';
        if (tech.atkBonus) html += '攻+' + tech.atkBonus + ' ';
        if (tech.defBonus) html += '防+' + tech.defBonus + ' ';
        if (tech.maxMpBonus) html += '灵力+' + tech.maxMpBonus + ' ';
        if (tech.expBonus) html += '经验+' + (tech.expBonus * 100) + '% ';
        if (tech.compBonus) html += '悟性+' + tech.compBonus + ' ';
        if (tech.luckBonus) html += '机缘+' + tech.luckBonus + ' ';
        html += '</div>';

        if (canExchange || (isFree && !has && meetsPos && meetsCult)) {
          html += '<button class="btn-combat" style="margin-top:4px;font-size:0.65em;padding:3px 8px;" onclick="UI.closeModal();WorldSystem.exchangeSectTech(\'' + sectId + '\',\'' + tech.id + '\')">兑换</button>';
        }
        html += '</div></div>';
      });
    }

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal();WorldSystem.enterSectBuilding(\'' + sectId + '\',\'scripture_lib\')">返回</button>');
  },

  exchangeSectTech(sectId, techId) {
    const s = Game.state;
    this.initExpand7State(s);
    const isFree = s.ownSect === sectId || s.conqueredSects.includes(sectId);

    // 找到功法
    let tech = null;
    for (const stage in SECT_TECHS_BY_STAGE) {
      const found = SECT_TECHS_BY_STAGE[stage].find(t => t.id === techId);
      if (found) { tech = found; break; }
    }
    if (!tech) { UI.toast("未知功法。", "danger"); return; }
    if (s.techniques.includes(techId)) { UI.toast("已拥有此功法。", "info"); return; }

    if (!isFree) {
      const contrib = s.sectContribution[sectId] || 0;
      if (contrib < tech.contribCost) { UI.toast("贡献度不足。", "danger"); return; }
      s.sectContribution[sectId] = contrib - tech.contribCost;
    }

    s.techniques.push(techId);
    if (tech.compBonus) s.comp += tech.compBonus;
    if (tech.luckBonus) s.luck += tech.luckBonus;

    // 应用属性
    if (tech.atkBonus) s.atk += tech.atkBonus;
    if (tech.defBonus) s.def += tech.defBonus;
    if (tech.maxMpBonus) { s.maxMp += tech.maxMpBonus; s.mp += tech.maxMpBonus; }
    if (tech.hpBonus) { s.maxHp += tech.hpBonus; s.hp += tech.hpBonus; }

    UI.toast("成功兑换功法：" + tech.name + "！", "success");
    Game.giveAchievement("first_technique");
    UI.updateAll();
    this.showSectLibrary(sectId);
  },

  // 获取玩家在宗门中的职位
  getPlayerSectPosition(s, sectId) {
    if (s.ownSectId === sectId) return "sect_leader";
    const cultStage = CULT_LEVELS[s.cultLevel].stage;
    if (cultStage >= 5) return "grand_elder";
    if (cultStage >= 4) return "elder";
    if (cultStage >= 3) return "inner_deacon";
    if (cultStage >= 2) return "inner_disciple";
    return "outer_disciple";
  },

  // 藏宝阁 - 兑换宝物
  showSectTreasure(sectId) {
    const s = Game.state;
    this.initExpand7State(s);
    const sect = SECTS_AND_FAMILIES[sectId];
    const playerPos = this.getPlayerSectPosition(s, sectId);
    const playerPosRank = SECT_POSITIONS_RANK[playerPos] ? SECT_POSITIONS_RANK[playerPos].rank : 0;
    const isFree = s.ownSect === sectId || s.conqueredSects.includes(sectId);

    // 根据宗门实力获取宝物列表
    let treasures = [];
    for (const key in SECT_TREASURES_BY_STRENGTH) {
      if (parseInt(key) <= sect.strength) {
        treasures = treasures.concat(SECT_TREASURES_BY_STRENGTH[key]);
      }
    }

    let html = '<div class="modal-section"><div class="modal-section-title">💎 ' + sect.name + ' · 藏宝阁</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;">贡献度：' + (s.sectContribution[sectId] || 0) + '</p>';

    treasures.forEach(t => {
      const item = ITEMS[t.itemId];
      if (!item) return;
      const posRank = SECT_POSITIONS_RANK[t.posReq] ? SECT_POSITIONS_RANK[t.posReq].rank : 0;
      const meetsPos = playerPosRank >= posRank;
      const canExchange = meetsPos && (isFree || (s.sectContribution[sectId] || 0) >= t.contribCost);

      html += '<div class="modal-item-row" style="opacity:' + (canExchange ? '1' : '0.5') + '"><div>';
      html += '<div style="color:' + (canExchange ? 'var(--gold-bright)' : 'var(--text-dim)') + ';">💎 ' + t.name;
      html += ' <span style="font-size:0.75em;color:var(--text-dim);">[需' + SECT_POSITIONS_RANK[t.posReq].name + ']</span>';
      html += ' <span style="font-size:0.75em;color:var(--jade);">' + (isFree ? '免费' : t.contribCost + '贡献') + '</span>';
      html += '</div>';
      html += '<div class="modal-item-desc">' + (item.desc || '') + '</div>';
      if (canExchange) {
        html += '<button class="btn-combat" style="margin-top:4px;font-size:0.65em;padding:3px 8px;" onclick="UI.closeModal();WorldSystem.exchangeSectItem(\'' + sectId + '\',\'' + t.itemId + '\',' + t.contribCost + ',\'treasure\')">兑换</button>';
      }
      html += '</div></div>';
    });

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal();WorldSystem.enterSectBuilding(\'' + sectId + '\',\'treasure_pav\')">返回</button>');
  },

  // 炼丹阁 - 兑换丹药
  showSectPills(sectId) {
    const s = Game.state;
    this.initExpand7State(s);
    const sect = SECTS_AND_FAMILIES[sectId];
    const playerPos = this.getPlayerSectPosition(s, sectId);
    const playerPosRank = SECT_POSITIONS_RANK[playerPos] ? SECT_POSITIONS_RANK[playerPos].rank : 0;
    const isFree = s.ownSect === sectId || s.conqueredSects.includes(sectId);

    let pills = [];
    for (const key in SECT_PILLS_BY_STAGE) {
      if (parseInt(key) <= Math.floor(sect.strength / 2)) {
        pills = pills.concat(SECT_PILLS_BY_STAGE[key]);
      }
    }

    let html = '<div class="modal-section"><div class="modal-section-title">⚗️ ' + sect.name + ' · 炼丹阁</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;">贡献度：' + (s.sectContribution[sectId] || 0) + '</p>';

    pills.forEach(p => {
      const item = ITEMS[p.itemId];
      if (!item) return;
      const posRank = SECT_POSITIONS_RANK[p.posReq] ? SECT_POSITIONS_RANK[p.posReq].rank : 0;
      const meetsPos = playerPosRank >= posRank;
      const canExchange = meetsPos && (isFree || (s.sectContribution[sectId] || 0) >= p.contribCost);

      html += '<div class="modal-item-row" style="opacity:' + (canExchange ? '1' : '0.5') + '"><div>';
      html += '<div style="color:' + (canExchange ? 'var(--gold-bright)' : 'var(--text-dim)') + ';">⚗️ ' + p.name;
      html += ' <span style="font-size:0.75em;color:var(--text-dim);">[需' + SECT_POSITIONS_RANK[p.posReq].name + ']</span>';
      html += ' <span style="font-size:0.75em;color:var(--jade);">' + (isFree ? '免费' : p.contribCost + '贡献') + '</span>';
      html += '</div>';
      html += '<div class="modal-item-desc">' + (item.desc || '') + '</div>';
      if (canExchange) {
        html += '<button class="btn-combat" style="margin-top:4px;font-size:0.65em;padding:3px 8px;" onclick="UI.closeModal();WorldSystem.exchangeSectItem(\'' + sectId + '\',\'' + p.itemId + '\',' + p.contribCost + ',\'pill\')">兑换</button>';
      }
      html += '</div></div>';
    });

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal();WorldSystem.enterSectBuilding(\'' + sectId + '\',\'alchemy_room\')">返回</button>');
  },

  // 炼器阁 - 兑换武器
  showSectWeapons(sectId) {
    const s = Game.state;
    this.initExpand7State(s);
    const sect = SECTS_AND_FAMILIES[sectId];
    const playerPos = this.getPlayerSectPosition(s, sectId);
    const playerPosRank = SECT_POSITIONS_RANK[playerPos] ? SECT_POSITIONS_RANK[playerPos].rank : 0;
    const isFree = s.ownSect === sectId || s.conqueredSects.includes(sectId);

    let weapons = [];
    for (const key in SECT_WEAPONS_BY_STAGE) {
      if (parseInt(key) <= Math.floor(sect.strength / 2)) {
        weapons = weapons.concat(SECT_WEAPONS_BY_STAGE[key]);
      }
    }

    let html = '<div class="modal-section"><div class="modal-section-title">⚔️ ' + sect.name + ' · 炼器阁</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;">贡献度：' + (s.sectContribution[sectId] || 0) + '</p>';

    weapons.forEach(w => {
      const item = ITEMS[w.itemId];
      if (!item) return;
      const posRank = SECT_POSITIONS_RANK[w.posReq] ? SECT_POSITIONS_RANK[w.posReq].rank : 0;
      const meetsPos = playerPosRank >= posRank;
      const canExchange = meetsPos && (isFree || (s.sectContribution[sectId] || 0) >= w.contribCost);

      html += '<div class="modal-item-row" style="opacity:' + (canExchange ? '1' : '0.5') + '"><div>';
      html += '<div style="color:' + (canExchange ? 'var(--gold-bright)' : 'var(--text-dim)') + ';">⚔️ ' + w.name;
      html += ' <span style="font-size:0.75em;color:var(--text-dim);">[需' + SECT_POSITIONS_RANK[w.posReq].name + ']</span>';
      html += ' <span style="font-size:0.75em;color:var(--jade);">' + (isFree ? '免费' : w.contribCost + '贡献') + '</span>';
      html += '</div>';
      html += '<div class="modal-item-desc">' + (item.desc || '') + '</div>';
      if (canExchange) {
        html += '<button class="btn-combat" style="margin-top:4px;font-size:0.65em;padding:3px 8px;" onclick="UI.closeModal();WorldSystem.exchangeSectItem(\'' + sectId + '\',\'' + w.itemId + '\',' + w.contribCost + ',\'weapon\')">兑换</button>';
      }
      html += '</div></div>';
    });

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal();WorldSystem.enterSectBuilding(\'' + sectId + '\',\'artifact_room\')">返回</button>');
  },

  // 通用兑换
  exchangeSectItem(sectId, itemId, cost, type) {
    const s = Game.state;
    this.initExpand7State(s);
    const isFree = s.ownSect === sectId || s.conqueredSects.includes(sectId);

    if (!isFree) {
      const contrib = s.sectContribution[sectId] || 0;
      if (contrib < cost) { UI.toast("贡献度不足。", "danger"); return; }
      s.sectContribution[sectId] = contrib - cost;
    }

    Game.addItem(itemId, 1);
    const item = ITEMS[itemId];
    UI.toast("成功兑换：" + (item ? item.name : itemId) + "！", "success");
    UI.updateAll();

    // 返回对应面板
    if (type === 'treasure') this.showSectTreasure(sectId);
    else if (type === 'pill') this.showSectPills(sectId);
    else if (type === 'weapon') this.showSectWeapons(sectId);
  },

  // 自行炼丹
  showAlchemyCraft(sectId) {
    const s = Game.state;
    this.initExpand7State(s);

    let html = '<div class="modal-section"><div class="modal-section-title">🔥 自行炼丹</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;">需要携带相应材料</p>';

    Object.keys(ALCHEMY_RECIPES).forEach(recipeId => {
      const recipe = ALCHEMY_RECIPES[recipeId];
      const cultStage = CULT_LEVELS[s.cultLevel].stage;
      if (cultStage < recipe.reqStage) return;

      let hasAllMaterials = true;
      let matText = '';
      Object.keys(recipe.materials).forEach(matId => {
        const need = recipe.materials[matId];
        const has = (s.items && s.items[matId]) || 0;
        const matItem = ITEMS[matId];
        matText += (matItem ? matItem.name : matId) + ' (' + has + '/' + need + ') ';
        if (has < need) hasAllMaterials = false;
      });

      html += '<div class="modal-item-row"><div>';
      html += '<div style="color:var(--gold-bright);">' + recipe.name + '</div>';
      html += '<div class="modal-item-desc">材料：' + matText + '</div>';
      if (hasAllMaterials) {
        html += '<button class="btn-combat" style="margin-top:4px;font-size:0.65em;padding:3px 8px;" onclick="UI.closeModal();WorldSystem.doAlchemy(\'' + recipeId + '\')">炼制</button>';
      }
      html += '</div></div>';
    });

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal();WorldSystem.enterSectBuilding(\'' + sectId + '\',\'alchemy_room\')">返回</button>');
  },

  doAlchemy(recipeId) {
    const s = Game.state;
    const recipe = ALCHEMY_RECIPES[recipeId];
    if (!recipe) return;

    // 消耗材料
    Object.keys(recipe.materials).forEach(matId => {
      const need = recipe.materials[matId];
      Game.removeItem(matId, need);
    });

    // 成功率（90%）
    if (Math.random() < 0.9) {
      Game.addItem(recipe.result, 1);
      const item = ITEMS[recipe.result];
      UI.toast("炼丹成功！获得" + (item ? item.name : recipe.result) + "！", "success");
    } else {
      UI.toast("炼丹失败，材料损耗。", "danger");
    }

    // 消耗1天
    this.advanceTime(24);
    UI.updateAll();
    this.showAlchemyCraft(s.currentSectArea || sectId);
  },

  // 自行炼器
  showArtifactCraft(sectId) {
    const s = Game.state;
    this.initExpand7State(s);

    let html = '<div class="modal-section"><div class="modal-section-title">🔨 自行炼器</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;">需要携带相应材料</p>';

    Object.keys(ARTIFACT_RECIPES).forEach(recipeId => {
      const recipe = ARTIFACT_RECIPES[recipeId];
      const cultStage = CULT_LEVELS[s.cultLevel].stage;
      if (cultStage < recipe.reqStage) return;

      let hasAllMaterials = true;
      let matText = '';
      Object.keys(recipe.materials).forEach(matId => {
        const need = recipe.materials[matId];
        const has = (s.items && s.items[matId]) || 0;
        const matItem = ITEMS[matId];
        matText += (matItem ? matItem.name : matId) + ' (' + has + '/' + need + ') ';
        if (has < need) hasAllMaterials = false;
      });

      html += '<div class="modal-item-row"><div>';
      html += '<div style="color:var(--gold-bright);">' + recipe.name + '</div>';
      html += '<div class="modal-item-desc">材料：' + matText + '</div>';
      if (hasAllMaterials) {
        html += '<button class="btn-combat" style="margin-top:4px;font-size:0.65em;padding:3px 8px;" onclick="UI.closeModal();WorldSystem.doArtifactCraft(\'' + recipeId + '\')">炼制</button>';
      }
      html += '</div></div>';
    });

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal();WorldSystem.enterSectBuilding(\'' + sectId + '\',\'artifact_room\')">返回</button>');
  },

  doArtifactCraft(recipeId) {
    const s = Game.state;
    const recipe = ARTIFACT_RECIPES[recipeId];
    if (!recipe) return;

    Object.keys(recipe.materials).forEach(matId => {
      const need = recipe.materials[matId];
      Game.removeItem(matId, need);
    });

    if (Math.random() < 0.85) {
      Game.addItem(recipe.result, 1);
      const item = ITEMS[recipe.result];
      UI.toast("炼器成功！获得" + (item ? item.name : recipe.result) + "！", "success");
    } else {
      UI.toast("炼器失败，材料损耗。", "danger");
    }

    this.advanceTime(24);
    UI.updateAll();
    this.showArtifactCraft(s.currentSectArea || sectId);
  },

  // 练武场修炼
  sectTrain(sectId) {
    const s = Game.state;
    const sect = SECTS_AND_FAMILIES[sectId];
    const bldLevel = this.getSectBuildingLevel(s, sectId, "training_ground");
    const expMult = 1 + bldLevel * 0.2;

    let expGain = Math.floor((50 + s.cultLevel * 15) * expMult);
    // 悟性加成
    expGain = Math.floor(expGain * (1 + s.comp * 0.05));

    // 功法加成
    s.techniques.forEach(t => {
      if (TECHNIQUES[t] && TECHNIQUES[t].expBonus) expGain = Math.floor(expGain * (1 + TECHNIQUES[t].expBonus));
    });

    Game.gainExp(expGain);
    this.advanceTime(24);

    // 获得贡献度
    s.sectContribution[sectId] = (s.sectContribution[sectId] || 0) + 20;

    UI.renderNarrative([
      {type:"narration", content:"你在" + sect.name + "的练武场修炼了1天。"},
      {type:"reward", content:"✨ 获得" + expGain + "经验"},
      {type:"system_msg", content:"贡献度+20（当前：" + (s.sectContribution[sectId] || 0) + "）"},
    ]);
    UI.renderChoices([
      {text:"继续修炼", next:"_sect_train_" + sectId, effect:{}},
      {text:"返回" + sect.name, next:"_sect_area_" + sectId, effect:{}},
    ]);
    UI.updateAll();
  },

  // 阅读典籍
  sectRead(sectId) {
    const s = Game.state;
    const sect = SECTS_AND_FAMILIES[sectId];
    const bldLevel = this.getSectBuildingLevel(s, sectId, "scripture_lib");
    const expMult = 1 + bldLevel * 0.15;

    let expGain = Math.floor((30 + s.cultLevel * 8) * expMult);
    // 悟性加成 - 阅读典籍获得更多悟性效果
    expGain = Math.floor(expGain * (1 + s.comp * 0.08));

    // 小概率提升悟性
    let compGain = 0;
    if (Math.random() < 0.05 + s.comp * 0.005) {
      compGain = 1;
      s.comp += 1;
    }

    Game.gainExp(expGain);
    this.advanceTime(24);
    s.sectContribution[sectId] = (s.sectContribution[sectId] || 0) + 10;

    let texts = [
      {type:"narration", content:"你在" + sect.name + "的藏书阁阅读典籍，感悟颇多。"},
      {type:"reward", content:"✨ 获得" + expGain + "经验"},
    ];
    if (compGain > 0) {
      texts.push({type:"reward", content:"🧠 悟性+" + compGain + "（当前：" + s.comp + "）"});
    }
    texts.push({type:"system_msg", content:"贡献度+10"});

    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"继续阅读", next:"_sect_read_" + sectId, effect:{}},
      {text:"返回" + sect.name, next:"_sect_area_" + sectId, effect:{}},
    ]);
    UI.updateAll();
  },

  // ============================================================
  // 5. 野外友好度事件
  // ============================================================

  triggerFriendlyEncounter(areaKey) {
    const s = Game.state;
    this.initExpand7State(s);

    // 随机选择一个宗门/家族
    const sectKeys = Object.keys(SECTS_AND_FAMILIES);
    const sectId = sectKeys[Math.floor(Math.random() * sectKeys.length)];
    const sect = SECTS_AND_FAMILIES[sectId];
    if (!sect) return false;

    // 随机选择事件类型
    const encounter = FRIENDLY_ENCOUNTERS[Math.floor(Math.random() * FRIENDLY_ENCOUNTERS.length)];
    const desc = encounter.desc.replace("{area}", areaKey).replace("{sectName}", sect.name);

    let texts = [
      {type:"chapter_title", content:"🎲 意外遭遇"},
      {type:"narration", content: desc},
    ];

    UI.renderNarrative(texts);

    if (encounter.type === "injured") {
      const hasItem = (s.inventory || []).some(inv => inv.id === encounter.needItem);
      if (hasItem) {
        UI.renderChoices([
          {text: encounter.choiceText, next:"_help_injured_" + sectId + "|" + encounter.id, effect:{}},
          {text:"不管闲事", next:"_wild_continue", effect:{}},
        ]);
      } else {
        UI.renderNarrative([{type:"system_msg", content: encounter.failText}]);
        UI.renderChoices([
          {text:"继续探索", next:"_wild_continue", effect:{}},
        ]);
      }
    } else if (encounter.type === "combat") {
      UI.renderChoices([
        {text: encounter.choiceText, next:"_help_combat_" + sectId + "|" + encounter.id, effect:{}},
        {text:"袖手旁观", next:"_wild_continue", effect:{}},
      ]);
    }

    return true;
  },

  helpInjuredMember(sectId, encounterId) {
    const s = Game.state;
    const sect = SECTS_AND_FAMILIES[sectId];
    const encounter = FRIENDLY_ENCOUNTERS.find(e => e.id === encounterId);
    if (!encounter) return;

    // 消耗丹药
    const invIdx = (s.inventory || []).findIndex(inv => inv.id === encounter.needItem);
    if (invIdx >= 0) {
      const inv = s.inventory[invIdx];
      inv.count--;
      if (inv.count <= 0) s.inventory.splice(invIdx, 1);
    }

    // 提升友好度
    const oldRelation = s.sectRelations[sectId] || 0;
    s.sectRelations[sectId] = Math.min(100, oldRelation + encounter.reward.relation);
    Game.gainExp(encounter.reward.exp);
    s.spiritStones += encounter.reward.stones;

    UI.renderNarrative([
      {type:"narration", content:"你取出丹药为" + sect.name + "的弟子疗伤，对方感激不尽。"},
      {type:"reward", content:"💎 获得" + encounter.reward.stones + "灵石"},
      {type:"reward", content:"✨ 获得" + encounter.reward.exp + "经验"},
      {type:"system_msg", content: sect.name + "友好度+" + encounter.reward.relation + "（当前：" + s.sectRelations[sectId] + "）"},
    ]);
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  helpCombatMember(sectId, encounterId) {
    const s = Game.state;
    const sect = SECTS_AND_FAMILIES[sectId];
    const encounter = FRIENDLY_ENCOUNTERS.find(e => e.id === encounterId);
    if (!encounter) return;

    // 生成战斗 - 主角和NPC一起战斗
    const cultStage = CULT_LEVELS[s.cultLevel].stage;
    const enemyHp = Math.floor((1000 + cultStage * 800) * encounter.enemyMult);
    const enemyAtk = Math.floor((50 + cultStage * 40) * encounter.enemyMult);
    const enemyDef = Math.floor((30 + cultStage * 25) * encounter.enemyMult);

    const enemy = {
      name: "邪修匪类",
      hp: enemyHp, atk: enemyAtk, def: enemyDef,
      exp: Math.floor(encounter.reward.exp * 0.5),
      stone: Math.floor(encounter.reward.stones * 0.3),
    };

    UI.renderNarrative([
      {type:"danger", content:"你与" + sect.name + "的弟子联手迎战敌人！"},
    ]);

    Game.combatState = {
      enemy: enemy, enemyHp: enemy.hp, enemyMaxHp: enemy.hp,
      onWin: "_friendly_combat_win_" + sectId + "|" + encounterId,
      onLose: "_wild_defeat",
      turn: 0, log: [], isWild: true, areaKey: s.location,
      allyNPC: true, // 标记有友军
    };
    UI.showCombat(Game.combatState);
    Game.combatLog("你与" + sect.name + "弟子联手迎战" + enemy.name + "！", "system");
  },

  friendlyCombatWin(sectId, encounterId) {
    const s = Game.state;
    const sect = SECTS_AND_FAMILIES[sectId];
    const encounter = FRIENDLY_ENCOUNTERS.find(e => e.id === encounterId);
    if (!encounter) return;

    const winText = encounter.winText.replace("{sectName}", sect.name);
    const oldRelation = s.sectRelations[sectId] || 0;
    s.sectRelations[sectId] = Math.min(100, oldRelation + encounter.reward.relation);
    Game.gainExp(encounter.reward.exp);
    s.spiritStones += encounter.reward.stones;

    UI.hideCombat();
    Game.combatState = null;
    UI.renderNarrative([
      {type:"chapter_title", content:"⚔️ 联手胜利！"},
      {type:"narration", content: winText},
      {type:"reward", content:"💎 获得" + encounter.reward.stones + "灵石"},
      {type:"reward", content:"✨ 获得" + encounter.reward.exp + "经验"},
      {type:"system_msg", content: sect.name + "友好度+" + encounter.reward.relation + "（当前：" + s.sectRelations[sectId] + "）"},
    ]);
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ============================================================
  // 6. 征服宗门后强行双修
  // ============================================================

  conqueredForceDual(sectId, npcId) {
    const s = Game.state;
    const sect = SECTS_AND_FAMILIES[sectId];
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) return;

    // 大幅降低道德
    const moralLoss = 20 + Math.floor(Math.random() * 10);
    s.karma = (s.karma || 0) + moralLoss;
    npc.mood = Math.max(-500, (npc.mood || 0) - 100);

    const expGain = 300 + npc.cultLevel * 80;
    Game.gainExp(expGain);

    // 怀孕判定
    const pregnancyChance = 0.5;
    let pregnant = false;
    if (Math.random() < pregnancyChance && typeof this.startPregnancy === 'function') {
      pregnant = true;
      this.startPregnancy(npcId, true);
    }

    // 宗门反叛 - 好感度大幅下降，可能反叛
    const oldRelation = s.sectRelations[sectId] || 0;
    s.sectRelations[sectId] = oldRelation - 50;

    let texts = [
      {type:"danger", content:"你强行与" + sect.name + "的弟子" + npc.name + "双修……"},
      {type:"danger", content:"道德-" + moralLoss + "（因果值+" + moralLoss + "）"},
      {type:"reward", content:"✨ 双修获得" + expGain + "经验"},
    ];

    if (pregnant) {
      texts.push({type:"reward", content:"💕 " + npc.name + "似乎有了身孕……"});
    }

    // 宗门反叛
    texts.push({type:"danger", content:"⚠️ " + sect.name + "对你的行为极为愤怒！"});
    texts.push({type:"danger", content: sect.name + "友好度-50（当前：" + s.sectRelations[sectId] + "）"});

    if (s.sectRelations[sectId] < -50) {
      // 宗门反叛
      s.conqueredSects = s.conqueredSects.filter(id => id !== sectId);
      texts.push({type:"chapter_title", content:"⚔️ " + sect.name + "反叛！"});
      texts.push({type:"danger", content: sect.name + "宣布脱离你的控制，重新独立！"});
      texts.push({type:"danger", content: sect.name + "的修士将会在探索时袭击你！"});

      // 添加伏击者
      const ambusherId = "sect_ambush_" + Date.now();
      s.ambushers = s.ambushers || [];
      s.ambushers.push({
        npcId: ambusherId, name: sect.name + "弟子",
        reason: "强行双修之仇", cultLevel: s.cultLevel + 1,
        hp: s.maxHp * 0.8, atk: s.atk * 0.8, def: s.def * 0.8,
      });
    }

    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ============================================================
  // 7. 自立宗门管理
  // ============================================================

  showOwnSectManage() {
    const s = Game.state;
    this.initExpand7State(s);
    if (!s.ownSect) { UI.toast("你还没有自立宗门。", "danger"); return; }
    const sect = SECTS_AND_FAMILIES[s.ownSectId || (s.ownSect && s.ownSect.name)];

    let html = '<div class="modal-section"><div class="modal-section-title">🏛️ 宗门管理</div>';
    html += '<p style="text-align:center;color:var(--gold-bright);font-size:1.1em;">' + sect.name + '</p>';

    // 建筑列表
    html += '<div class="modal-section-title" style="margin-top:8px;">建筑（' + Object.keys(s.ownSectBuildings).filter(k => s.ownSectBuildings[k] > 0).length + '/' + Object.keys(SECT_BUILDINGS).length + '）</div>';
    Object.keys(SECT_BUILDINGS).forEach(bldKey => {
      const bld = SECT_BUILDINGS[bldKey];
      const level = s.ownSectBuildings[bldKey] || 0;
      html += '<div class="modal-item-row"><div>';
      html += '<div>' + bld.icon + ' ' + bld.name + (level > 0 ? ' Lv.' + level : ' (未建造)') + '</div>';
      html += '<div class="modal-item-desc">' + bld.desc + '</div>';
      if (level === 0) {
        const cost = bld.baseCost;
        const canBuild = s.spiritStones >= cost;
        html += '<button class="btn-combat" style="margin-top:4px;font-size:0.65em;padding:3px 8px;' + (canBuild ? '' : 'opacity:0.5;') + '" onclick="UI.closeModal();WorldSystem.buildOwnSectBuilding(\'' + bldKey + '\')">建造（' + cost + '💎）</button>';
      } else if (level < bld.maxLevel) {
        const cost = Math.floor(bld.baseCost * Math.pow(bld.costMult, level));
        const canUpgrade = s.spiritStones >= cost;
        html += '<button class="btn-combat" style="margin-top:4px;font-size:0.65em;padding:3px 8px;' + (canUpgrade ? '' : 'opacity:0.5;') + '" onclick="UI.closeModal();WorldSystem.upgradeOwnSectBuilding(\'' + bldKey + '\')">升级→Lv.' + (level + 1) + '（' + cost + '💎）</button>';
      }
      html += '</div></div>';
    });

    // 成员列表
    const myMembers = (s.ownSectMembers && s.ownSectMembers.length) ? s.ownSectMembers : ((s.ownSect && s.ownSect.members) ? s.ownSect.members : []);
    html += '<div class="modal-section-title" style="margin-top:8px;">成员（' + myMembers.length + '）</div>';
    myMembers.forEach(member => {
      const isObj = typeof member === 'object' && member !== null;
      const npcId = isObj ? member.npcId : member;
      const npc = s.npcList.find(n => n.id === npcId);
      if (!npc) return;
      const genderStr = npc.isFemale ? "女" : "男";
      const role = isObj ? member.role : "弟子";
      const location = isObj ? member.location : "宗门";
      html += '<div class="modal-item-row"><div>';
      html += '<div style="color:var(--gold-bright);">' + npc.name + '（' + genderStr + '·' + npc.cultName + '）';
      html += ' <span style="font-size:0.75em;color:var(--jade);">[' + role + ']</span></div>';
      html += '<div class="modal-item-stats">所在地：' + (location || "宗门") + ' | 好感：' + npc.mood + '/100</div>';
      // 提升职介
      html += '<button class="btn-combat" style="margin-top:4px;font-size:0.6em;padding:2px 6px;" onclick="UI.closeModal();WorldSystem.promoteMember(\'' + npcId + '\')">提升职介</button>';
      html += '<button class="btn-combat" style="margin-top:4px;font-size:0.6em;padding:2px 6px;margin-left:4px;" onclick="UI.closeModal();WorldSystem.rewardMember(\'' + npcId + '\')">赏赐</button>';
      html += '</div></div>';
    });

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },

  buildOwnSectBuilding(bldKey) {
    const s = Game.state;
    this.initExpand7State(s);
    const bld = SECT_BUILDINGS[bldKey];
    if (!bld) return;

    const cost = bld.baseCost;
    if (s.spiritStones < cost) { UI.toast("灵石不足。", "danger"); return; }

    s.spiritStones -= cost;
    s.ownSectBuildings[bldKey] = 1;

    UI.toast("成功建造" + bld.name + "！（Lv.1）", "success");
    UI.updateAll();
    this.showOwnSectManage();
  },

  upgradeOwnSectBuilding(bldKey) {
    const s = Game.state;
    this.initExpand7State(s);
    const bld = SECT_BUILDINGS[bldKey];
    if (!bld) return;

    const level = s.ownSectBuildings[bldKey] || 0;
    if (level >= bld.maxLevel) { UI.toast("已达最高等级。", "info"); return; }

    const cost = Math.floor(bld.baseCost * Math.pow(bld.costMult, level));
    if (s.spiritStones < cost) { UI.toast("灵石不足。", "danger"); return; }

    s.spiritStones -= cost;
    s.ownSectBuildings[bldKey] = level + 1;

    UI.toast(bld.name + "升级至Lv." + (level + 1) + "！", "success");
    UI.updateAll();
    this.showOwnSectManage();
  },

  promoteMember(npcId) {
    const s = Game.state;
    if (!s.ownSectMembers) s.ownSectMembers = [];
    let memberObj = s.ownSectMembers.find(m => typeof m === 'object' && m !== null && m.npcId === npcId);
    if (!memberObj) {
      const fallback = (s.ownSect && s.ownSect.members) ? s.ownSect.members : [];
      const hasMatch = fallback.some(m => (typeof m === 'object' && m !== null) ? m.npcId === npcId : m === npcId);
      if (!hasMatch) return;
      memberObj = { npcId: npcId, role: "外门弟子", location: "宗门" };
      s.ownSectMembers.push(memberObj);
    }
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) return;

    const ranks = ["外门弟子", "内门弟子", "内门执事", "护法长老", "太上长老", "副宗主"];
    const currentRank = ranks.indexOf(memberObj.role || "外门弟子");
    if (currentRank < 0 || currentRank >= ranks.length - 1) {
      UI.toast("已达最高职介。", "info"); return;
    }

    const cost = (currentRank + 1) * 1000;
    if (s.spiritStones < cost) { UI.toast("需要" + cost + "灵石。", "danger"); return; }

    s.spiritStones -= cost;
    memberObj.role = ranks[currentRank + 1];
    npc.mood = Math.min(100, npc.mood + 10);

    UI.toast(npc.name + "晋升为" + memberObj.role + "！", "success");
    UI.updateAll();
    this.showOwnSectManage();
  },

  rewardMember(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) return;

    const cost = 500;
    if (s.spiritStones < cost) { UI.toast("灵石不足。", "danger"); return; }

    s.spiritStones -= cost;
    npc.mood = Math.min(100, npc.mood + 15);

    UI.toast("赏赐了" + npc.name + "500灵石，好感度+15！", "success");
    UI.updateAll();
    this.showOwnSectManage();
  },

  // 进入自立宗门区域
  enterOwnSectArea() {
    const s = Game.state;
    this.initExpand7State(s);
    if (!(s.ownSectFounded === true && s.ownSect)) {
      UI.toast("你还没有自立宗门。", "danger"); return;
    }
    const sect = SECTS_AND_FAMILIES[s.ownSectId || (s.ownSect && s.ownSect.name)];
    this.enterSectArea(s.ownSectId || (s.ownSect && s.ownSect.name));
  },

  // ============================================================
  // 8. 副本内容优化
  // ============================================================

  exploreDungeonOptimized(locKey) {
    const s = Game.state;
    this.initExpand7State(s);
    const loc = WORLD_MAP[locKey];
    if (!loc) { Game.exploreWilderness(locKey); return; }

    this.advanceTime(24); // 消耗1天

    const locType = loc.type || "wild";
    const events = DUNGEON_EVENTS_BY_TYPE[locType] || DUNGEON_EVENTS_BY_TYPE.wild;

    // 机缘影响稀有事件概率
    const luckBonus = (s.luck || 5) * 0.005;

    // 加权随机选择事件
    const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * totalWeight;
    let selectedEvent = events[0];
    for (const e of events) {
      roll -= e.weight;
      if (roll <= 0) { selectedEvent = e; break; }
    }

    // 机缘修正：有概率遇到更好的事件
    if (Math.random() < luckBonus) {
      // 优先选择treasure/inheritance类型
      const goodEvents = events.filter(e => e.type === "treasure" || e.type === "inheritance" || e.type === "scripture");
      if (goodEvents.length > 0) {
        selectedEvent = goodEvents[Math.floor(Math.random() * goodEvents.length)];
      }
    }

    const eventDesc = selectedEvent.desc.replace("{area}", loc.name);

    switch (selectedEvent.type) {
      case "enemy": {
        // 敌人
        const wildArea = WILDERNESS[loc.name];
        if (wildArea && wildArea.enemies) {
          const enemyKey = wildArea.enemies[Math.floor(Math.random() * wildArea.enemies.length)];
          const enemy = ENEMIES[enemyKey];
          if (enemy) {
            const scale = 1 + s.cultLevel * 0.15;
            const scaledEnemy = {...enemy};
            scaledEnemy.hp = Math.floor(enemy.hp * scale);
            scaledEnemy.atk = Math.floor(enemy.atk * scale);
            scaledEnemy.def = Math.floor(enemy.def * scale);
            scaledEnemy.exp = Math.floor(enemy.exp * (1 + (wildArea.expBonus || 0) / 100));
            scaledEnemy.stone = Math.floor(enemy.stone * (1 + (wildArea.stoneBonus || 0) / 100));

            UI.renderNarrative([
              {type:"narration", content: eventDesc},
              {type:"danger", content:"⚠️ 遭遇" + scaledEnemy.name + "！"},
            ]);
            Game.combatState = {
              enemy: scaledEnemy, enemyHp: scaledEnemy.hp, enemyMaxHp: scaledEnemy.hp,
              onWin: "_wild_victory", onLose: "_wild_defeat",
              turn: 0, log: [], isWild: true, areaKey: locKey,
            };
            UI.showCombat(Game.combatState);
            return;
          }
        }
        // 回退到普通野外
        Game.exploreWilderness(locKey);
        return;
      }
      case "treasure": {
        const itemId = Math.random() < 0.5 ? "healing_pill" : (Math.random() < 0.3 ? "qi_pill" : "gift_spirit_grass");
        Game.addItem(itemId, 1);
        const stones = 50 + s.cultLevel * 30;
        s.spiritStones += stones;
        const exp = 100 + s.cultLevel * 50;
        Game.gainExp(exp);
        const item = ITEMS[itemId];
        UI.renderNarrative([
          {type:"narration", content: eventDesc},
          {type:"reward", content:"📦 获得：" + (item ? item.name : itemId)},
          {type:"reward", content:"💎 获得" + stones + "灵石"},
          {type:"reward", content:"✨ 获得" + exp + "经验"},
        ]);
        break;
      }
      case "npc": {
        this.ensureAreaNPCs(s, locKey);
        const areaNPCs = this.getAreaNPCs(s, locKey);
        if (areaNPCs.length > 0) {
          const npc = areaNPCs[Math.floor(Math.random() * areaNPCs.length)];
          UI.renderNarrative([
            {type:"narration", content: eventDesc},
            {type:"narration", content:"对方" + (npc.action || "正在活动") + "，性格" + npc.personality.type + "。"},
          ]);
          UI.renderChoices([
            {text:"上前交谈", next:"_npc_talk_" + npc.id, effect:{}},
            {text:"绕道而行", next:"_wild_continue", effect:{}},
          ]);
          return;
        }
        // 没有NPC则触发事件
        const event = Game.rollRandomEvent();
        Game.processRandomEvent(event, locKey);
        return;
      }
      case "cave": {
        if (typeof this.findEnhancedCave === 'function') {
          this.findEnhancedCave(loc.name);
        } else {
          this.findCaveDwelling(loc.name);
        }
        return;
      }
      case "trap": {
        const damage = 30 + s.cultLevel * 20;
        s.hp = Math.max(1, s.hp - damage);
        UI.renderNarrative([
          {type:"narration", content: eventDesc},
          {type:"danger", content:"受到" + damage + "点伤害！"},
        ]);
        break;
      }
      case "inheritance":
      case "scripture": {
        // 机缘/悟性提升
        const luckEvent = LUCK_COMP_EVENTS[Math.floor(Math.random() * LUCK_COMP_EVENTS.length)];
        if (luckEvent.luckGain) s.luck += luckEvent.luckGain;
        if (luckEvent.compGain) s.comp += luckEvent.compGain;
        Game.gainExp(luckEvent.exp);
        UI.renderNarrative([
          {type:"narration", content: eventDesc},
          {type:"reward", content: luckEvent.text},
        ]);
        break;
      }
      case "storm": {
        const damage = 50 + s.cultLevel * 30;
        s.hp = Math.max(1, s.hp - damage);
        s.mp = Math.max(0, s.mp - Math.floor(s.maxMp * 0.2));
        UI.renderNarrative([
          {type:"narration", content: eventDesc},
          {type:"danger", content:"受到" + damage + "点伤害，灵力大量消耗！"},
        ]);
        break;
      }
      case "rescue": {
        const reward = 200 + s.cultLevel * 50;
        s.spiritStones += reward;
        s.karma = Math.max(-100, (s.karma || 0) - 5);
        Game.gainExp(reward);
        UI.renderNarrative([
          {type:"narration", content: eventDesc},
          {type:"reward", content:"你救出了百姓，获得" + reward + "灵石和" + reward + "经验。"},
          {type:"system_msg", content:"道德提升（因果值-5）"},
        ]);
        break;
      }
      case "empty":
      default: {
        const exp = 50 + s.cultLevel * 20;
        Game.gainExp(exp);
        UI.renderNarrative([
          {type:"narration", content: eventDesc},
          {type:"reward", content:"✨ 探索获得" + exp + "经验"},
        ]);
        break;
      }
    }

    // 检查伏击
    if (typeof this.checkAmbush === 'function' && this.checkAmbush()) return;

    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ============================================================
  // 10 & 11. NPC实力提升 + NPC探索行为
  // ============================================================

  // NPC每日修炼（在ageNPCs中调用）
  npcDailyCultivate(s) {
    if (!s.npcList) return;
    s.npcList.forEach(npc => {
      if (!npc.isAlive) return;
      if (npc.isChild) return;

      // 修士有概率修炼（每天10%概率）
      if (npc.cultLevel >= 0 && Math.random() < 0.10) {
        // 修炼获得经验
        const expGain = 20 + npc.cultLevel * 8;
        npc.npcExp = (npc.npcExp || 0) + expGain;

        // 检查是否升级
        const expNeeded = 100 + npc.cultLevel * 50;
        if (npc.npcExp >= expNeeded && npc.cultLevel < CULT_LEVELS.length - 1) {
          npc.npcExp -= expNeeded;
          npc.cultLevel++;
          npc.cultName = CULT_LEVELS[npc.cultLevel].name;
          // 属性提升
          const stageMult = 1 + CULT_LEVELS[npc.cultLevel].stage * 0.3;
          npc.maxHp = Math.floor(npc.maxHp * 1.15);
          npc.hp = npc.maxHp;
          npc.atk = Math.floor(npc.atk * 1.1);
          npc.def = Math.floor(npc.def * 1.1);
        }
      }

      // NPC有概率去探索（每天5%概率）
      if (Math.random() < 0.05) {
        const log = NPC_EXPLORE_LOGS[Math.floor(Math.random() * NPC_EXPLORE_LOGS.length)];
        const areaName = npc.area || "天南";
        const logText = log.replace("{name}", npc.name).replace("{area}", areaName).replace("{item}", "灵石");
        s.npcExploreLog.unshift({text: logText, time: s.gameDay || 1});
        if (s.npcExploreLog.length > 20) s.npcExploreLog.pop();

        // NPC探索获得灵石
        const stonesGain = Math.floor(Math.random() * 50) + 10;
        npc.stones = (npc.stones || 0) + stonesGain;

        // 小概率获得物品
        if (Math.random() < 0.3 && npc.items) {
          const itemId = Math.random() < 0.5 ? "healing_pill" : "qi_pill";
          if (!npc.items.includes(itemId)) npc.items.push(itemId);
        }
      }
    });
  },

  // ============================================================
  // 12. NPC亲戚关系网
  // ============================================================

  generateRelatives(npc, s) {
    if (!npc.socialNetwork) return;
    if (npc.socialNetwork.relatives) return; // 已生成

    npc.socialNetwork.relatives = [];
    const relativeCount = Math.floor(Math.random() * 4) + 1; // 1-4个亲戚

    for (let i = 0; i < relativeCount; i++) {
      const relType = RELATIVE_TYPES[Math.floor(Math.random() * RELATIVE_TYPES.length)];
      const surname = npc.isFemale
        ? NPC_SURNAMES[Math.floor(Math.random() * NPC_SURNAMES.length)]
        : (npc.socialNetwork.parents && npc.socialNetwork.parents[0]
           ? npc.socialNetwork.parents[0].name.charAt(0)
           : NPC_SURNAMES[Math.floor(Math.random() * NPC_SURNAMES.length)]);

      const given = relType.isFemale
        ? NPC_GIVEN_NAMES_F[Math.floor(Math.random() * NPC_GIVEN_NAMES_F.length)]
        : NPC_GIVEN_NAMES_M[Math.floor(Math.random() * NPC_GIVEN_NAMES_M.length)];

      const ageDiff = relType.ageDiff[0] + Math.floor(Math.random() * (relType.ageDiff[1] - relType.ageDiff[0] + 1));
      const relAge = Math.max(1, (npc.age || 30) + ageDiff);
      const isAlive = Math.random() < 0.75;

      // 修为参考NPC
      const npcStage = npc.cultLevel >= 0 ? CULT_LEVELS[npc.cultLevel].stage : 0;
      let relCultLevel = npcStage;
      if (npcStage > 0 && Math.random() < 0.5) {
        relCultLevel = Math.max(0, npcStage - 1);
      } else if (Math.random() < 0.3) {
        relCultLevel = Math.min(npcStage + 1, CULT_LEVELS.length - 1);
      }

      npc.socialNetwork.relatives.push({
        name: surname + given,
        relation: relType.name,
        isFemale: relType.isFemale,
        age: relAge,
        cultLevel: isAlive ? relCultLevel : -1,
        isAlive: isAlive,
      });
    }
  },

  // ============================================================
  // 13. 机缘/悟性效果优化
  // ============================================================

  // 在修炼时应用悟性加成
  applyCompBonusToMeditate(expGain) {
    const s = Game.state;
    // 悟性每点增加5%修炼经验
    const compMult = 1 + (s.comp || 3) * 0.05;
    return Math.floor(expGain * compMult);
  },

  // 在探索时应用机缘加成
  applyLuckBonusToExplore() {
    const s = Game.state;
    const luck = s.luck || 5;
    // 机缘每点增加0.5%稀有事件概率
    return luck * 0.005;
  },

  // 检查野外机缘/悟性事件
  checkLuckCompEvent() {
    const s = Game.state;
    const luck = s.luck || 5;
    // 机缘越高，越容易触发
    const chance = 0.03 + luck * 0.002;
    if (Math.random() > chance) return false;

    const event = LUCK_COMP_EVENTS[Math.floor(Math.random() * LUCK_COMP_EVENTS.length)];
    if (event.luckGain) s.luck += event.luckGain;
    if (event.compGain) s.comp += event.compGain;
    if (event.exp) Game.gainExp(event.exp);

    UI.renderNarrative([
      {type:"chapter_title", content:"✨ 机缘降临"},
      {type:"narration", content: event.text},
      {type:"reward", content:"✨ 获得" + event.exp + "经验" + (event.luckGain ? "，机缘+" + event.luckGain : "") + (event.compGain ? "，悟性+" + event.compGain : "")},
    ]);
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
    ]);
    UI.updateAll();
    return true;
  },

}); // End Object.assign
