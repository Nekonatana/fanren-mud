/* ====== 凡人修仙传MUD · 扩展6引擎（俘虏系统/义父母/NPC逃跑/任务面板增强） ====== */

Object.assign(WorldSystem, {

  // ===== 初始化扩展6状态 =====
  initExpand6State(state) {
    if (!state.captives) state.captives = []; // 俘虏列表
    if (!state.killedNPCs) state.killedNPCs = []; // 永久击杀的NPC ID列表（不再生成）
    if (!state.captiveRescueTimer) state.captiveRescueTimer = 0; // 救援事件计时
    if (!state.adoptedNPCs) state.adoptedNPCs = []; // 已拜义父母的NPC ID
  },

  // ===== 判断主角境界与NPC境界关系 =====
  getStageComparison(npcCultLevel, playerCultLevel) {
    const npcStage = npcCultLevel >= 0 ? CULT_LEVELS[npcCultLevel].stage : 0;
    const playerStage = CULT_LEVELS[playerCultLevel].stage;
    if (playerStage > npcStage) return "higher";
    if (playerStage === npcStage) return "equal";
    return "lower";
  },

  // ===== 获取逃跑概率 =====
  getEscapeChance(npcCultLevel, playerCultLevel) {
    const comparison = this.getStageComparison(npcCultLevel, playerCultLevel);
    return NPC_ESCAPE_RATES[comparison] || 0.40;
  },

  // ===== NPC战败后的处理（逃跑/击杀/释放/俘虏） =====
  // 在 npcVictory() 中被调用，替代原有的直接击杀逻辑
  handleNPCDefeat(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc) { this.wildVictory(); return; }

    this.initExpand6State(s);

    // 叛徒任务NPC直接击杀（不逃跑）
    if (npc.isTraitorQuest) {
      this.killDefeatedNPC(npcId, false);
      return;
    }

    // 计算逃跑概率
    const escapeChance = this.getEscapeChance(npc.cultLevel, s.cultLevel);
    const escaped = Math.random() < escapeChance;

    if (escaped) {
      // NPC逃跑成功
      npc.isAlive = true; // 没死
      npc.hp = Math.floor(npc.maxHp * 0.1); // 残血逃跑
      UI.hideCombat();
      Game.combatState = null;

      const comparison = this.getStageComparison(npc.cultLevel, s.cultLevel);
      let escapeText = "";
      if (comparison === "lower") {
        escapeText = npc.name + "修为远高于你，趁你一个不备，施展秘术逃之夭夭！";
      } else if (comparison === "equal") {
        escapeText = npc.name + "与你修为相当，趁战局混乱，突然施展身法逃脱！";
      } else {
        escapeText = npc.name + "虽然修为不及你，但仍拼死施展遁术，侥幸逃脱！";
      }

      UI.renderNarrative([
        {type:"danger", content: escapeText},
        {type:"narration", content: npc.name + "已经逃走，你未能将其截住。"},
      ]);
      UI.renderChoices([
        {text:"继续探索", next:"_wild_continue", effect:{}},
        {text:"返回", next:"_wild_return", effect:{}},
      ]);
      UI.updateAll();
      return;
    }

    // NPC逃跑失败，交出物品求活命
    npc.isAlive = true; // 标记为活着但战败
    npc.hp = 1; // 濒死

    // 获取NPC身上所有物品
    let itemTexts = [];
    npc.items.forEach(itemId => {
      if (ITEMS[itemId]) {
        Game.addItem(itemId, 1);
        itemTexts.push({type:"reward", content:"📦 获得：" + ITEMS[itemId].name});
      }
    });
    if (npc.stones > 0) {
      s.spiritStones += npc.stones;
      itemTexts.push({type:"reward", content:"💎 获得" + npc.stones + "灵石"});
    }
    // 清空NPC物品（已交出）
    npc.items = [];
    npc.stones = 0;

    // 检查是否有地牢
    const hasDungeon = s.spiritMountain && s.spiritMountain.buildings && s.spiritMountain.buildings["dungeon_cell"];

    UI.hideCombat();
    Game.combatState = null;

    let texts = [
      {type:"narration", content:npc.name + "被你击败，跪倒在地，浑身颤抖。"},
      {type:"dialogue", content:"「道友饶命！我愿交出所有随身之物，只求活命！」"},
    ];
    texts = texts.concat(itemTexts);
    texts.push({type:"narration", content:npc.name + "已将身上所有物品交出，瘫倒在地等待你的发落。"});

    // 更新支线进度
    if (typeof this.updateSideQuestProgress === 'function') {
      this.updateSideQuestProgress(s, "wild_victory");
    }

    UI.renderNarrative(texts);

    // 三选一：击杀/释放/俘虏
    const choices = [];
    choices.push({text:"⚔️ 击杀" + npc.name, next:"_kill_npc_" + npcId, effect:{}});
    choices.push({text:"🕊️ 释放" + npc.name, next:"_release_npc_" + npcId, effect:{}});
    if (hasDungeon) {
      choices.push({text:"⛓️ 俘虏" + npc.name, next:"_capture_npc_" + npcId, effect:{}});
    } else {
      choices.push({text:"⛓️ 俘虏（需建造地牢）", next:"_no_dungeon", effect:{}});
    }
    UI.renderChoices(choices);
    UI.updateAll();
  },

  // ===== 击杀战败NPC =====
  killDefeatedNPC(npcId, showNarrative) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc) return;

    this.initExpand6State(s);

    npc.isAlive = false;
    s.npcKills = (s.npcKills || 0) + 1;
    if (s.npcKills === 1) Game.giveAchievement("npc_first_kill");
    if (s.npcKills >= 5) Game.giveAchievement("npc_kill_5");

    // 永久移除（不再生成）
    if (!s.killedNPCs.includes(npcId)) s.killedNPCs.push(npcId);

    // 因果值
    s.karma = (s.karma || 0) + 3;
    if (npc.isFriend) {
      s.karma += 5;
      s.heartDemon = (s.heartDemon || 0) + 1;
    }

    // 从好友列表移除
    const fIdx = s.npcFriends.indexOf(npcId);
    if (fIdx >= 0) s.npcFriends.splice(fIdx, 1);

    // 与其交好的NPC将敌视主角
    this.makeFriendsHostile(npc, s);

    // 检查叛徒任务
    if (npc.isTraitorQuest && npc.questLocKey !== undefined && npc.questIdx !== undefined) {
      if (typeof this.completeLocationQuest === 'function') {
        this.completeLocationQuest(npc.questLocKey, npc.questIdx);
      }
    }

    if (showNarrative !== false) {
      UI.renderNarrative([
        {type:"danger", content:"你一剑了结了" + npc.name + "的性命。"},
        {type:"narration", content:npc.name + "已经身亡，从此世间再无此人。"},
        {type:"danger", content:"因果值+" + (npc.isFriend ? 8 : 3) + (npc.isFriend ? "（杀害好友！心魔值+1）" : "")},
      ]);
      UI.renderChoices([
        {text:"继续探索", next:"_wild_continue", effect:{}},
        {text:"返回", next:"_wild_return", effect:{}},
      ]);
      UI.updateAll();
    }
  },

  // ===== 释放战败NPC =====
  releaseDefeatedNPC(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc) return;

    npc.isAlive = true;
    npc.hp = Math.floor(npc.maxHp * 0.3); // 恢复30%血量
    npc.mood = Math.max(0, npc.mood - 30); // 好感度下降
    npc.isHostile = false; // 不主动攻击

    UI.renderNarrative([
      {type:"narration", content:"你放走了" + npc.name + "。"},
      {type:"dialogue", content:"「多谢道友不杀之恩，此恩必当铭记！」"},
      {type:"narration", content:npc.name + "踉跄离去，你已获得其身上所有物品。"},
    ]);
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 俘虏战败NPC =====
  captureDefeatedNPC(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc) return;

    this.initExpand6State(s);

    // 检查地牢是否已建造
    if (!s.spiritMountain || !s.spiritMountain.buildings || !s.spiritMountain.buildings["dungeon_cell"]) {
      UI.toast("你尚未建造地牢，无法关押俘虏！", "danger");
      return;
    }

    // 地牢容量检查
    const dungeonLevel = s.spiritMountain.buildings["dungeon_cell"];
    const maxCaptives = dungeonLevel * 3; // 每级地牢关3人
    if (s.captives.length >= maxCaptives) {
      UI.toast("地牢已满！升级地牢可关押更多俘虏。", "danger");
      return;
    }

    // 将NPC加入俘虏列表
    npc.isCaptive = true;
    npc.isAlive = true;
    npc.capturedDays = 0;
    npc.hp = Math.floor(npc.maxHp * 0.2);
    s.captives.push({
      npcId: npcId,
      name: npc.name,
      cultLevel: npc.cultLevel,
      isFemale: npc.isFemale,
      capturedDays: 0,
      mood: npc.mood,
      loyalty: (npc.loyalty !== undefined ? npc.loyalty : 100),
      recruitProgress: 0,
      hasSpouse: npc.hasSpouse,
      socialNetwork: npc.socialNetwork,
    });

    // 因果值
    s.karma = (s.karma || 0) + 1;

    // 与其交好的NPC将可能来攻打灵山救人
    this.markFriendsForRescue(npc, s);

    UI.renderNarrative([
      {type:"narration", content:"你将" + npc.name + "押回了灵山地牢，关押在地牢之中。"},
      {type:"danger", content:npc.name + "已被俘虏，关押在地牢中。"},
      {type:"narration", content:"其交好的修士可能会来攻打灵山救人，需加强防御。"},
    ]);
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 使NPC好友敌视主角 =====
  makeFriendsHostile(npc, s) {
    if (!npc.socialNetwork) return;
    const friends = (npc.socialNetwork.friends || []).concat(npc.socialNetwork.familyMembers || []);
    if (npc.socialNetwork.spouse) friends.push({name: npc.socialNetwork.spouse.name});

    friends.forEach(f => {
      // 找到名字匹配的NPC
      const targetNPC = s.npcList.find(n => n.isAlive && n.name === f.name);
      if (targetNPC) {
        targetNPC.mood = Math.max(-1000, targetNPC.mood - 80);
        targetNPC.isHostile = true;
        // 如果有伏击系统，加入伏击列表
        if (!s.ambushers) s.ambushers = [];
        s.ambushers.push({
          npcId: targetNPC.id,
          name: targetNPC.name,
          reason: "杀友之仇",
          cultLevel: targetNPC.cultLevel,
          hp: targetNPC.hp, atk: targetNPC.atk, def: targetNPC.def,
        });
      }
    });
  },

  // ===== 标记好友可能来救人 =====
  markFriendsForRescue(npc, s) {
    if (!npc.socialNetwork) return;
    const friends = (npc.socialNetwork.friends || []).concat(npc.socialNetwork.familyMembers || []);
    if (npc.socialNetwork.spouse) friends.push({name: npc.socialNetwork.spouse.name});

    friends.forEach(f => {
      const targetNPC = s.npcList.find(n => n.isAlive && n.name === f.name);
      if (targetNPC) {
        targetNPC.wantsToRescue = true;
        targetNPC.rescueTarget = npc.id;
      }
    });
  },

  // ===== 检查俘虏救援事件（每天调用） =====
  checkCaptiveRescue() {
    const s = Game.state;
    this.initExpand6State(s);
    if (s.captives.length === 0) return;
    if (!s.spiritMountain) return;

    // 检查防御阵法等级
    const defenseLevel = s.spiritMountain.buildings && s.spiritMountain.buildings["defense_array"] || 0;
    const rescueChance = CAPTURE_RESCUE_CHANCE * (1 - defenseLevel * 0.03); // 防御阵法降低概率
    rescueChance = Math.max(0, rescueChance);

    if (Math.random() < rescueChance) {
      // 随机选一个俘虏
      const captive = s.captives[Math.floor(Math.random() * s.captives.length)];

      // 找到想救人的NPC
      const rescuers = s.npcList.filter(n => n.isAlive && n.wantsToRescue && n.rescueTarget === captive.npcId);
      if (rescuers.length === 0) return;

      // 选最强的来攻打
      const rescuer = rescuers.sort((a, b) => b.cultLevel - a.cultLevel)[0];

      // 触发救援战斗
      UI.renderNarrative([
        {type:"danger", content:"⚠️ " + rescuer.name + "前来攻打你的灵山，意图救走" + captive.name + "！"},
        {type:"dialogue", content:"「放了" + captive.name + "！否则踏平你的灵山！」"},
      ]);

      // 启动战斗
      Game.startCombat({
        name: rescuer.name,
        cultName: CULT_LEVELS[rescuer.cultLevel].name,
        hp: rescuer.maxHp, maxHp: rescuer.maxHp,
        atk: rescuer.atk, def: rescuer.def,
      }, {
        onWin: "_captive_rescue_win_" + rescuer.id + "|" + captive.npcId,
        onLose: "_captive_rescue_lose_" + captive.npcId,
      });
    }
  },

  // ===== 俘虏救援胜利 =====
  captiveRescueVictory(rescuerId, captiveNpcId) {
    const s = Game.state;
    const rescuer = s.npcList.find(n => n.id === rescuerId);
    const captive = s.captives.find(c => c.npcId === captiveNpcId);

    UI.hideCombat();
    Game.combatState = null;

    if (rescuer) {
      rescuer.isAlive = false;
      rescuer.wantsToRescue = false;
    }

    let texts = [
      {type:"narration", content:"你击退了前来救援的修士，保卫了灵山。"},
      {type:"reward", content:"保卫灵山成功！"},
    ];
    if (captive) {
      texts.push({type:"narration", content:captive.name + "仍被关押在地牢中。"});
    }
    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"继续", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 俘虏救援失败（俘虏被救走） =====
  captiveRescueDefeat(captiveNpcId) {
    const s = Game.state;
    const captive = s.captives.find(c => c.npcId === captiveNpcId);
    const npc = s.npcList.find(n => n.id === captiveNpcId);

    UI.hideCombat();
    Game.combatState = null;

    // 从俘虏列表移除
    s.captives = s.captives.filter(c => c.npcId !== captiveNpcId);

    if (npc) {
      npc.isCaptive = false;
      npc.wantsToRescue = false;
    }

    const lostStones = Math.floor(s.spiritStones * 0.1);
    s.spiritStones -= lostStones;

    UI.renderNarrative([
      {type:"danger", content:"你被击败了！" + (captive ? captive.name : "俘虏") + "被人救走！"},
      {type:"danger", content:"损失" + lostStones + "灵石。"},
    ]);
    UI.renderChoices([
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 显示俘虏面板 =====
  showCaptivePanel() {
    const s = Game.state;
    this.initExpand6State(s);

    if (!s.spiritMountain || !s.spiritMountain.buildings || !s.spiritMountain.buildings["dungeon_cell"]) {
      let html = '<div class="modal-section"><div class="modal-section-title">⛓️ 地牢</div>';
      html += '<div style="color:var(--text-dim);text-align:center;padding:20px;">';
      html += '<p>你尚未建造地牢。</p>';
      html += '<p style="font-size:0.85em;">在灵山建造地牢后，可关押战败的修士。</p>';
      html += '</div></div>';
      UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
      return;
    }

    const dungeonLevel = s.spiritMountain.buildings["dungeon_cell"];
    const maxCaptives = dungeonLevel * 3;

    let html = '<div class="modal-section"><div class="modal-section-title">⛓️ 地牢 (Lv.' + dungeonLevel + ')</div>';
    html += '<div class="npc-detail-grid">';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">地牢等级</span><span>' + dungeonLevel + '</span></div>';
    html += '<div class="npc-detail-row"><span class="npc-detail-label">关押上限</span><span>' + s.captives.length + '/' + maxCaptives + '</span></div>';
    html += '</div>';

    if (s.captives.length === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;padding:20px;">地牢空空如也</div>';
    } else {
      s.captives.forEach(cap => {
        const cultName = cap.cultLevel >= 0 ? CULT_LEVELS[cap.cultLevel].name : "凡人";
        html += '<div class="modal-item-row"><div>';
        html += '<div style="color:' + (cap.isFemale ? 'var(--pink)' : 'var(--gold-bright)') + ';">' + (cap.isFemale ? "♀" : "♂") + ' ' + cap.name + '</div>';
        html += '<div class="modal-item-desc">修为：' + cultName + ' | 好感：' + cap.mood + ' | 关押' + cap.capturedDays + '天</div>';
        html += '<div class="modal-item-stats">招降进度：' + Math.floor(cap.recruitProgress * 100) + '%</div>';
        // 操作按钮
        html += '<div style="display:flex;gap:4px;margin-top:4px;">';
        html += '<button class="btn-combat" style="font-size:0.7em;padding:3px 8px;" onclick="WorldSystem.recruitCaptive(\'' + cap.npcId + '\')">🤝 招降</button>';
        if (!cap.isFemale !== !s.isFemale && cap.cultLevel >= 0) {
          html += '<button class="btn-combat" style="font-size:0.7em;padding:3px 8px;border-color:var(--crimson);color:var(--crimson-bright);" onclick="WorldSystem.captiveForceDual(\'' + cap.npcId + '\')">💢 强制双修</button>';
        }
        html += '<button class="btn-combat" style="font-size:0.7em;padding:3px 8px;" onclick="WorldSystem.releaseCaptive(\'' + cap.npcId + '\')">🕊️ 释放</button>';
        html += '</div>';
        html += '</div></div>';
      });
    }

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },

  // ===== 招降俘虏 =====
  recruitCaptive(npcId) {
    const s = Game.state;
    this.initExpand6State(s);
    const cap = s.captives.find(c => c.npcId === npcId);
    if (!cap) return;

    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc) return;

    // 计算招降成功率
    let chance = CAPTURE_RECRUIT_BASE.baseChance;
    chance += cap.mood * CAPTURE_RECRUIT_BASE.moodBonus;
    chance -= cap.loyalty * CAPTURE_RECRUIT_BASE.loyaltyBonus * 0.5; // 忠贞度高降低概率
    const comparison = this.getStageComparison(cap.cultLevel, s.cultLevel);
    if (comparison === "lower") chance += 0.2; // 主角更强更容易招降
    if (comparison === "higher") chance -= CAPTURE_RECRUIT_BASE.stagePenalty;

    // 累积进度
    cap.recruitProgress = Math.min(1, cap.recruitProgress + 0.15 + Math.random() * 0.1);
    cap.capturedDays++;

    if (cap.recruitProgress >= 1 || Math.random() < chance) {
      // 招降成功
      npc.isCaptive = false;
      npc.isFriend = true;
      npc.mood = 50; // 招降后好感度50
      npc.loyalty = 60;
      s.captives = s.captives.filter(c => c.npcId !== npcId);

      UI.toast("🤝 " + npc.name + "已被招降，成为你的手下！", "gold");
      UI.renderNarrative([
        {type:"narration", content:"经过" + cap.capturedDays + "天的关押与劝降，" + npc.name + "终于归降于你。"},
        {type:"dialogue", content:"「既然道友不杀之恩，在下愿归顺效劳。」"},
      ]);

      // 如果有自己的宗门，可加入
      if (s.ownSect && typeof this.inviteNPCToSect === 'function') {
        this.inviteNPCToSect(npc.id);
      }
    } else {
      // 招降失败
      cap.mood = Math.max(-100, cap.mood - 10);
      UI.toast(npc.name + "拒绝归降，好感度-10（招降进度" + Math.floor(cap.recruitProgress * 100) + "%）", "danger");
      if (cap.mood < -50) {
        UI.renderNarrative([
          {type:"danger", content:npc.name + "宁死不屈，对你的敌意越来越深。"},
        ]);
      }
    }

    UI.updateAll();
    this.showCaptivePanel();
  },

  // ===== 俘虏强制双修 =====
  captiveForceDual(npcId) {
    const s = Game.state;
    this.initExpand6State(s);
    const cap = s.captives.find(c => c.npcId === npcId);
    if (!cap) return;

    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc) return;

    // 检查性别
    const playerFemale = s.isFemale || false;
    if (npc.isFemale === playerFemale) {
      UI.toast("只能与异性俘虏双修。", "danger");
      return;
    }

    // 强制双修获得经验
    const baseExp = 800;
    const bonusExp = Math.floor(baseExp * (1 + (100 - (cap.loyalty !== undefined ? cap.loyalty : 50)) / 100));
    Game.gainExp(bonusExp);
    cap.mood = Math.max(-100, cap.mood - 15);
    cap.loyalty = Math.max(-100, cap.loyalty - 10);
    cap.capturedDays++;

    // 极大概率怀孕
    const pregnancyChance = CAPTURE_DUAL_PREGNANCY_CHANCE;
    let texts = [
      {type:"danger", content:"你强行与" + npc.name + "双修，掠夺其修为。"},
      {type:"reward", content:"获得" + bonusExp + "经验"},
      {type:"danger", content:npc.name + "怨恨加深，好感度-15，忠贞度-10"},
    ];

    if (Math.random() < pregnancyChance) {
      // 怀孕
      if (typeof this.startPregnancy === 'function') {
        this.startPregnancy(npcId, false); // 不安全怀孕
        texts.push({type:"danger", content:npc.name + "怀孕了！"});
      }
    }

    // 逃跑检查
    if (cap.loyalty <= 0 && Math.random() < 0.3) {
      // 俘虏暴动逃跑
      s.captives = s.captives.filter(c => c.npcId !== npcId);
      npc.isCaptive = false;
      texts.push({type:"danger", content:"⚠️ " + npc.name + "趁你双修后虚弱之际，挣脱束缚逃走了！"});
    }

    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"关闭", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 释放俘虏 =====
  releaseCaptive(npcId) {
    const s = Game.state;
    this.initExpand6State(s);
    const cap = s.captives.find(c => c.npcId === npcId);
    const npc = s.npcList.find(n => n.id === npcId);

    if (cap) {
      s.captives = s.captives.filter(c => c.npcId !== npcId);
    }
    if (npc) {
      npc.isCaptive = false;
      npc.isAlive = true;
      npc.hp = npc.maxHp;
      npc.wantsToRescue = false;
    }

    UI.toast("🕊️ 你释放了" + (cap ? cap.name : "俘虏"), "success");
    this.showCaptivePanel();
  },

  // ===== 拜为义父/义母 =====
  adoptAsGodparent(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc) { UI.toast("找不到此人。", "danger"); return; }

    this.initExpand6State(s);

    // 检查条件：大于主角20岁
    if (!npc.age || npc.age < (s.age || 16) + 20) {
      UI.toast(npc.name + "的年龄需比你大20岁以上才能拜为义父母。", "danger");
      return;
    }

    // 检查好感度
    if (npc.mood < 100) {
      UI.toast(npc.name + "对你的好感度需达到100才能拜为义父母。", "danger");
      return;
    }

    // 检查是否已拜
    if (s.adoptedNPCs.includes(npcId)) {
      UI.toast("你已经拜" + npc.name + "为义父母了。", "danger");
      return;
    }

    // 执行拜礼
    s.adoptedNPCs.push(npcId);
    if (!npc.socialNetwork) this.setupNPCSocialNetwork(npc, s);
    npc.socialNetwork.godparents = npc.socialNetwork.godparents || [];

    // 义父/义母称号
    const relation = npc.isFemale ? "义母" : "义父";

    // 永久好感度锁定在100
    npc.mood = 100;
    npc.isFriend = true;
    npc.isGodparent = true;

    // 获得义父母指导加成
    s.cultExpBonus = (s.cultExpBonus || 0) + 0.1; // 修炼效率+10%
    s.spiritStones += 500; // 义父母赠予灵石

    UI.renderNarrative([
      {type:"narration", content:"你正式拜" + npc.title + npc.name + "为" + relation + "，行了大礼。"},
      {type:"dialogue", content:"「好孩子，今后你便是我的义子/义女，这500灵石权作见面礼。」"},
      {type:"reward", content:"🎉 拜" + relation + "成功！" + npc.name + "成为你的" + relation},
      {type:"reward", content:"💎 获得500灵石（见面礼）"},
      {type:"system_msg", content:"修炼效率+10%（义父母指导）"},
    ]);
    UI.renderChoices([
      {text:"继续交谈", next:"_npc_talk_" + npcId, effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 显示任务面板（增强版，包含地点任务） =====
  showEnhancedQuestPanel() {
    const s = Game.state;
    this.initWorldState(s);
    this.updateQuests();
    this.initExpand5State(s);
    this.initExpand6State(s);

    let html = '<div class="modal-section"><div class="modal-section-title">📋 当前任务（' + s.activeQuests.length + '）</div>';
    if (s.activeQuests.length === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;">暂无进行中的主线/支线任务</div>';
    } else {
      s.activeQuests.forEach(questId => {
        const quest = QUESTS[questId];
        if (!quest) return;
        const typeIcon = quest.type === "main" ? "⚜️" : "📌";
        const typeColor = quest.type === "main" ? "var(--gold-bright)" : "var(--jade-bright)";
        html += '<div class="modal-item-row"><div>';
        html += '<div style="color:' + typeColor + ';">' + typeIcon + ' ' + quest.name + '</div>';
        html += '<div class="modal-item-desc">' + quest.desc + '</div>';
        html += '<div class="modal-item-stats">目标：' + quest.target + '</div>';
        html += '</div></div>';
      });
    }
    html += '</div>';

    // 地点任务
    if (s.activeLocQuests && s.activeLocQuests.length > 0) {
      html += '<div class="modal-section"><div class="modal-section-title">📍 地点任务（' + s.activeLocQuests.length + '）</div>';
      s.activeLocQuests.forEach(aq => {
        const quest = LOCATION_QUEST_POOL[aq.questIdx];
        if (!quest) return;
        const locName = WORLD_MAP[aq.locKey] ? WORLD_MAP[aq.locKey].name : aq.locKey;
        const typeNames = {defeat_traitor:"击败叛徒", submit_material:"提交材料", check_location:"前往检查"};
        html += '<div class="modal-item-row"><div>';
        html += '<div style="color:var(--jade-bright);">📍 ' + quest.title + '</div>';
        html += '<div class="modal-item-desc">' + quest.desc + '</div>';

        if (quest.type === "defeat_traitor") {
          // 显示叛徒名字和地点
          const traitorNPC = s.npcList.find(n => n.isTraitorQuest && n.questLocKey === aq.locKey && n.questIdx === aq.questIdx);
          const traitorName = traitorNPC ? traitorNPC.name : "叛徒";
          html += '<div class="modal-item-stats" style="color:var(--crimson-bright);">目标：击败 ' + traitorName + '</div>';
          html += '<div class="modal-item-stats">所在地：' + locName + '</div>';
          // 跳转按钮
          if (traitorNPC) {
            html += '<button class="btn-combat" style="margin-top:4px;font-size:0.7em;padding:3px 8px;" onclick="UI.closeModal();WorldSystem.travelTo(\'' + aq.locKey + '\')">前往' + locName + '</button>';
          }
        } else if (quest.type === "submit_material" && quest.requiredItem) {
          const has = (s.inventory.find(i => i.id === quest.requiredItem) || {}).count || 0;
          const itemName = ITEMS[quest.requiredItem] ? ITEMS[quest.requiredItem].name : quest.requiredItem;
          html += '<div class="modal-item-stats">材料：' + itemName + ' (' + has + '/' + quest.requiredCount + ')</div>';
          html += '<div class="modal-item-stats">交付地点：' + locName + '</div>';
          if (has >= quest.requiredCount) {
            html += '<button class="btn-combat" style="margin-top:4px;font-size:0.7em;padding:3px 8px;" onclick="UI.closeModal();Game.gotoNode(\'_submit_material_' + aq.locKey + '|' + aq.questIdx + '\')">📦 提交材料</button>';
          } else {
            html += '<button class="btn-combat" style="margin-top:4px;font-size:0.7em;padding:3px 8px;" onclick="UI.closeModal();WorldSystem.travelTo(\'' + aq.locKey + '\')">前往' + locName + '</button>';
          }
        } else if (quest.type === "check_location" && quest.targetLocation) {
          const targetName = WORLD_MAP[quest.targetLocation] ? WORLD_MAP[quest.targetLocation].name : quest.targetLocation;
          html += '<div class="modal-item-stats">目标地点：' + targetName + '</div>';
          html += '<button class="btn-combat" style="margin-top:4px;font-size:0.7em;padding:3px 8px;" onclick="UI.closeModal();WorldSystem.travelTo(\'' + quest.targetLocation + '\')">前往' + targetName + '</button>';
        }

        html += '<div class="modal-item-stats" style="color:var(--jade);">奖励：' + quest.rewardStones + '灵石、' + quest.rewardExp + '经验';
        if (quest.rewardItem) html += '、' + (ITEMS[quest.rewardItem] ? ITEMS[quest.rewardItem].name : quest.rewardItem);
        html += '</div>';
        html += '</div></div>';
      });
      html += '</div>';
    }

    // 已完成任务
    if (s.completedQuests.length > 0) {
      html += '<div class="modal-section"><div class="modal-section-title">✅ 已完成（' + s.completedQuests.length + '）</div>';
      s.completedQuests.forEach(questId => {
        const quest = QUESTS[questId];
        if (!quest) return;
        html += '<div class="modal-item-row" style="opacity:0.5;"><div>';
        html += '<div style="color:var(--text-dim);">✅ ' + quest.name + '</div>';
        html += '<div class="modal-item-desc">' + quest.desc + '</div>';
        html += '</div></div>';
      });
      html += '</div>';
    }

    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },

});
