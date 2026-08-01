/* ====== 凡人修仙传MUD · 扩展4引擎（主线推进/宗门排名/支线/强迫双修/副本/探索连续性） ====== */

Object.assign(WorldSystem, {
  // ===== 初始化扩展4状态 =====
  initExpand4State(state) {
    if (!state.activeSideQuests) state.activeSideQuests = [];
    if (!state.completedSideQuests) state.completedSideQuests = [];
    if (!state.sideQuestProgress) state.sideQuestProgress = {};
    if (!state.currentWilderness) state.currentWilderness = null; // 当前野外区域key
    if (!state.currentWildernessParent) state.currentWildernessParent = null; // 野外所属城池
    if (!state.forcedDualCount) state.forcedDualCount = 0;
    if (!state.discoveredEvents) state.discoveredEvents = 0;
    if (!state.npcExtremeBuff) state.npcExtremeBuff = {}; // npcId -> buff信息
    if (!state.sectDungeonExplored) state.sectDungeonExplored = [];
    if (!state.sideQuestNPCs) state.sideQuestNPCs = {}; // area -> npcId列表
    if (!state.storyNPCLevels) state.storyNPCLevels = {}; // npcId -> cultLevel (随时间成长)
  },

  // ===== 主线阶段推进系统 =====
  // 检查当前阶段是否满足条件，满足则可推进
  checkMainQuestProgression(locKey) {
    const s = Game.state;
    if (!s.pmainProgress) s.pmainProgress = 0;
    if (!s.pmainCompleted) s.pmainCompleted = [];

    const story = this.PERMANENT_MAIN_STORY;
    const currentIdx = s.pmainProgress;
    if (currentIdx >= story.length) return null;

    const currentStage = story[currentIdx];
    const cultStage = CULT_LEVELS[s.cultLevel].stage;

    // 检查是否满足当前阶段的条件
    // 条件1: 修为达到要求
    const meetsCult = cultStage >= currentStage.minCult;
    // 条件2: 当前地点匹配主线所在地
    const locName = WORLD_MAP[locKey] ? WORLD_MAP[locKey].name : locKey;
    const stageArea = currentStage.stage;
    const isAtRightLocation = locKey === stageArea || locName === stageArea ||
      locName.includes(stageArea) || stageArea.includes(locName) ||
      (WORLD_MAP[locKey] && WORLD_MAP[locKey].connections && WORLD_MAP[locKey].connections.includes(stageArea));

    if (meetsCult && isAtRightLocation) {
      // 检查是否已完成当前阶段
      const isCompleted = s.pmainCompleted.includes(currentStage.id);
      if (!isCompleted) {
        // 可以推进
        return {
          stage: currentStage,
          canAdvance: true,
          text: "⚜️ [主线] " + currentStage.name + "（满足条件，点击推进！）",
          next: "_advance_pmain_" + currentIdx,
          effect: {},
        };
      }
    }

    // 如果当前阶段已完成，检查下一阶段
    if (s.pmainCompleted.includes(currentStage.id) && currentIdx < story.length - 1) {
      const nextStage = story[currentIdx + 1];
      if (cultStage >= nextStage.minCult) {
        return {
          stage: nextStage,
          canAdvance: true,
          text: "⚜️ [主线] " + nextStage.name + "（" + nextStage.desc + "）",
          next: nextStage.node,
          effect: {},
        };
      }
    }

    return null;
  },

  // 推进主线到下一阶段
  advanceMainQuest(stageIdx) {
    const s = Game.state;
    const story = this.PERMANENT_MAIN_STORY;
    const stage = story[stageIdx];
    if (!stage) return;

    // 标记当前阶段完成
    if (!s.pmainCompleted) s.pmainCompleted = [];
    if (!s.pmainCompleted.includes(stage.id)) {
      s.pmainCompleted.push(stage.id);
    }
    s.pmainProgress = stageIdx + 1;

    // 奖励
    const reward = 500 * (stageIdx + 1);
    s.spiritStones += reward;
    Game.gainExp(reward * 3);

    UI.renderNarrative([
      {type:"chapter_title", content:"⚜️ 主线推进"},
      {type:"narration", content:"你完成了「" + stage.name + "」阶段的任务！"},
      {type:"reward", content:"💎 获得" + reward + "灵石，✨ 获得" + (reward * 3) + "经验"},
      {type:"system_msg", content:"主线已推进至下一阶段，上一阶段任务已消失。"},
    ]);

    // 显示下一阶段信息
    if (s.pmainProgress < story.length) {
      const nextStage = story[s.pmainProgress];
      UI.renderNarrative([
        {type:"narration", content:"下一阶段：" + nextStage.name + " —— " + nextStage.desc},
        {type:"system_msg", content:"需达到" + STAGE_NAMES[nextStage.minCult] + "，前往" + nextStage.stage + "推进。"},
      ]);
    } else {
      UI.renderNarrative([
        {type:"narration", content:"你已完成所有主线阶段！修仙之路漫漫，但前方的路还很长……"},
      ]);
    }

    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 探索连续性系统 =====
  // 设置当前野外区域（探索时调用）
  setCurrentWilderness(areaKey, parentCity) {
    const s = Game.state;
    s.currentWilderness = areaKey;
    s.currentWildernessParent = parentCity || this.findParentCity(areaKey);
  },

  // 查找野外区域所属的城池/宗门
  findParentCity(areaKey) {
    const loc = WORLD_MAP[areaKey];
    if (!loc) return "七玄门集镇";

    // 查找连接的城镇
    if (loc.connections) {
      for (const conn of loc.connections) {
        const connLoc = WORLD_MAP[conn];
        if (connLoc && (connLoc.type === "city" || connLoc.type === "sect")) {
          return conn;
        }
      }
    }

    // 根据修为阶段返回默认城市
    const stage = CULT_LEVELS[Game.state.cultLevel].stage;
    if (stage >= 8) return "仙界";
    if (stage >= 4) return "灵界";
    if (stage >= 2) return "虚天殿";
    if (stage >= 1) return "乱星海渡口";
    return "七玄门集镇";
  },

  // 返回野外/副本所属城池
  returnToParent() {
    const s = Game.state;

    // 扩展7：优先返回主线任务触发时所在的地点
    if (s.mainQuestReturnLoc && WORLD_MAP[s.mainQuestReturnLoc]) {
      const retKey = s.mainQuestReturnLoc;
      const retLoc = WORLD_MAP[retKey];
      s.mainQuestReturnLoc = null; // 用完即清
      if (retLoc.type === "wild" || retLoc.type === "sea" || retLoc.type === "ruins" || retLoc.type === "danger" || retLoc.type === "warzone") {
        s.currentWilderness = retKey;
        s.currentWildernessParent = this.findParentCity(retKey);
        this.travelToWithTime(retKey);
      } else {
        s.currentWilderness = null;
        s.currentWildernessParent = null;
        this.travelToWithTime(retKey);
      }
      return;
    }

    const parent = s.currentWildernessParent || this.findParentCity(s.currentWilderness || s.location);
    const parentLoc = WORLD_MAP[parent];
    
    // 如果返回目标是荒野区域（主线基地模式），保持荒野上下文不丢失
    if (parentLoc && (parentLoc.type === "wild" || parentLoc.type === "sea" || parentLoc.type === "ruins" || parentLoc.type === "danger" || parentLoc.type === "warzone")) {
      this.travelToWithTime(parent);
      // travelToWithTime不会清除wild类型的上下文，但returnToParent需要重新设置
      s.currentWilderness = parent;
      s.currentWildernessParent = this.findParentCity(parent);
    } else {
      s.currentWilderness = null;
      s.currentWildernessParent = null;
      this.travelToWithTime(parent);
    }
  },

  // NPC交谈离开后继续探索（不返回城镇）
  continueExploringAfterNPC() {
    const s = Game.state;
    const wildKey = s.currentWilderness;
    if (wildKey && WORLD_MAP[wildKey]) {
      // 继续在当前野外/副本探索
      this.exploreArea(wildKey);
    } else if (s.location && WORLD_MAP[s.location]) {
      // 没有野外记录但当前位置在世界地图中，继续探索当前位置
      this.exploreArea(s.location);
    } else {
      // 都没有，返回上级
      this.returnToParent();
    }
  },

  // ===== 宗门排名面板 =====
  showSectRankingPanel() {
    const s = Game.state;
    this.initExpand4State(s);

    let html = '<div class="modal-section"><div class="modal-section-title">🏯 宗门/家族排名</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-bottom:12px;">排名越高，整体实力越强，门主修为越高</p>';

    // 按排名排序
    const sorted = Object.keys(SECT_RANKINGS).sort((a, b) => SECT_RANKINGS[a].rank - SECT_RANKINGS[b].rank);

    sorted.forEach(sectId => {
      const rank = SECT_RANKINGS[sectId];
      const sect = SECTS_AND_FAMILIES[sectId];
      if (!sect) return;
      const canGo = CULT_LEVELS[s.cultLevel].stage >= sect.reqStage;
      const isMember = s.sectMembership && s.sectMembership.sectId === sectId;

      let medal = "🥇";
      if (rank.rank === 2) medal = "🥈";
      else if (rank.rank === 3) medal = "🥉";
      else if (rank.rank > 10) medal = "🔸";
      else medal = "🔹";

      html += '<div class="modal-item-row" style="opacity:' + (canGo ? '1' : '0.5') + '" onclick="' + (canGo ? 'WorldSystem.showSectDetail(\'' + sectId + '\')' : '') + '">';
      html += '<div><div style="color:' + (isMember ? 'var(--jade-bright)' : 'var(--gold-bright)') + ';">';
      html += medal + ' #' + rank.rank + ' ' + sect.name;
      if (sect.type === "family") html += ' <span style="font-size:0.8em;">[家族]</span>';
      else html += ' <span style="font-size:0.8em;">[宗门]</span>';
      if (isMember) html += ' ✅';
      html += '</div>';
      html += '<div class="modal-item-desc">' + sect.desc + '</div>';
      html += '<div class="modal-item-stats">实力：' + rank.overallStrength + ' | 门主修为：' + STAGE_NAMES[Math.min(8, Math.floor(rank.masterCultLevel / 3))] + ' | 领袖：' + sect.leader + '</div>';
      html += '<div class="modal-item-stats">特长：' + sect.specialty + ' | 区域：' + sect.region + '</div>';
      html += '</div></div>';
    });

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },

  // ===== 宗门详情（含副本入口） =====
  showSectDetail(sectId) {
    const s = Game.state;
    const sect = SECTS_AND_FAMILIES[sectId];
    const rank = SECT_RANKINGS[sectId];
    const dungeon = SECT_DUNGEONS[sectId];
    const mapLoc = SECT_MAP_LOCATIONS[sectId];
    if (!sect) return;

    let html = '<div class="modal-section"><div class="modal-section-title">🏯 ' + sect.name + '</div>';
    html += '<div class="modal-item-row"><div>';
    html += '<div style="color:var(--gold-bright);">排名：#' + (rank ? rank.rank : '?') + '</div>';
    html += '<div class="modal-item-desc">' + sect.desc + '</div>';
    html += '<div class="modal-item-stats">门主：' + sect.leader + ' | 长老实力：' + STAGE_NAMES[Math.min(8, Math.floor((rank ? rank.elderCultLevel : 8) / 3))] + '</div>';
    html += '<div class="modal-item-stats">太上长老实力：' + STAGE_NAMES[Math.min(8, Math.floor((rank ? rank.grandElderCultLevel : 8) / 3))] + '</div>';
    html += '<div class="modal-item-stats">特长：' + sect.specialty + ' | 区域：' + sect.region + '</div>';
    if (mapLoc) {
      html += '<div class="modal-item-stats">📍 位置：' + mapLoc.mapKey + ' · ' + mapLoc.subArea + '</div>';
    }
    html += '</div></div>';

    // 副本入口
    if (dungeon) {
      const canEnter = CULT_LEVELS[s.cultLevel].stage >= dungeon.reqStage;
      const explored = s.sectDungeonExplored && s.sectDungeonExplored.includes(sectId + "_" + Date.now().toString().slice(0, 4));
      html += '<div class="modal-item-row" style="opacity:' + (canEnter ? '1' : '0.5') + '"><div>';
      html += '<div style="color:' + (canEnter ? 'var(--crimson-bright)' : 'var(--text-dim)') + ';">🏔️ ' + dungeon.name + '</div>';
      html += '<div class="modal-item-desc">' + dungeon.desc + '</div>';
      if (!canEnter) html += '<div class="modal-item-stats">需要修为：' + STAGE_NAMES[dungeon.reqStage] + '</div>';
      html += '</div>';
      if (canEnter) {
        html += '<button class="btn-combat" style="font-size:0.75em;margin-left:8px;" onclick="UI.closeModal();WorldSystem.enterSectDungeon(\'' + sectId + '\')">进入副本</button>';
      }
      html += '</div>';
    }

    html += '</div>';

    // 外交/加入选项
    if (s.sectMembership && s.sectMembership.sectId === sectId) {
      html += '<div class="modal-item-row"><div><div style="color:var(--jade-bright);">✅ 你是本宗门成员</div>';
      html += '<div class="modal-item-stats">职位：' + SECT_POSITIONS[s.sectMembership.position || 0].name + ' | 贡献：' + (s.sectMembership.contribution || 0) + '</div>';
      html += '</div></div>';
    } else {
      html += '<button class="btn-combat" style="width:100%;margin-top:8px;" onclick="UI.closeModal();Game.gotoNode(\'_sect_diplomacy_' + sectId + '\')">外交互动</button>';
    }

    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal();WorldSystem.showSectRankingPanel()">返回排名</button> <button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },

  // ===== 进入宗门副本 =====
  enterSectDungeon(sectId) {
    const s = Game.state;
    const dungeon = SECT_DUNGEONS[sectId];
    const sect = SECTS_AND_FAMILIES[sectId];
    if (!dungeon || !sect) return;

    // 设置当前野外区域
    const mapLoc = SECT_MAP_LOCATIONS[sectId];
    if (mapLoc) {
      this.setCurrentWilderness(mapLoc.mapKey, mapLoc.mapKey);
    }

    const roll = Math.random();
    const texts = [
      {type:"chapter_title", content:"🏔️ " + dungeon.name},
      {type:"narration", content:"你潜入了" + sect.name + "的" + dungeon.name + "。"},
      {type:"narration", content:dungeon.desc},
    ];

    if (roll < 0.5) {
      // 遇到敌人
      const enemyTypes = dungeon.enemyTypes || ["ancient_puppet", "ancient_beast"];
      const enemyId = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      const enemyData = CAVE_STRONG_ENEMIES[enemyId] || {
        name: sect.name + "守卫", hp: 2000 + dungeon.enemyLv * 2000,
        atk: 100 + dungeon.enemyLv * 100, def: 80 + dungeon.enemyLv * 80,
        exp: 1000 + dungeon.enemyLv * 1000, stone: 200 + dungeon.enemyLv * 200,
        drop: dungeon.rewards ? dungeon.rewards[0] : null, dropRate: 0.5,
      };

      texts.push({type:"danger", content:"⚠️ 你遇到了" + enemyData.name + "！"});
      UI.renderNarrative(texts);

      const enemy = {
        name: enemyData.name + "（" + sect.name + "）",
        hp: enemyData.hp, atk: enemyData.atk, def: enemyData.def,
        exp: enemyData.exp, stone: enemyData.stone,
        drop: enemyData.drop, dropRate: enemyData.dropRate,
      };
      Game.combatState = {
        enemy: enemy, enemyHp: enemy.hp, enemyMaxHp: enemy.hp,
        onWin: "_sect_dungeon_win_" + sectId, onLose: "_sect_dungeon_lose",
        turn: 0, log: [], isNpc: false, npcId: null,
      };
      UI.showCombat(Game.combatState);
      Game.combatLog("遭遇" + enemy.name + "！", "system");
      return;
    } else if (roll < 0.8) {
      // 获得宝物
      const rewards = dungeon.rewards || ["healing_pill", "qi_pill"];
      const itemId = rewards[Math.floor(Math.random() * rewards.length)];
      const item = ITEMS[itemId];
      if (item) {
        Game.addItem(itemId, 1);
        texts.push({type:"reward", content:"📦 获得：" + item.name});
      }
      // 灵石
      const stones = 100 + dungeon.enemyLv * 200;
      s.spiritStones += stones;
      texts.push({type:"reward", content:"💎 获得" + stones + "灵石"});
      // 经验
      const exp = 300 + dungeon.enemyLv * 500;
      Game.gainExp(exp);
      texts.push({type:"reward", content:"✨ 获得" + exp + "经验"});
    } else {
      // 空手而归
      texts.push({type:"narration", content:"你仔细搜索了一番，但没有发现什么有价值的东西。"});
      const exp = 100 + dungeon.enemyLv * 200;
      Game.gainExp(exp);
      texts.push({type:"reward", content:"✨ 探索获得" + exp + "经验"});
    }

    texts.push({type:"narration", content:"探索完毕，你可以继续探索或返回。"});
    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"继续探索副本", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // 宗门副本战斗胜利
  sectDungeonVictory(sectId) {
    const s = Game.state;
    const dungeon = SECT_DUNGEONS[sectId];
    const sect = SECTS_AND_FAMILIES[sectId];
    if (!dungeon || !sect) { this.enhancedCaveVictory(""); return; }

    const rewards = dungeon.rewards || ["healing_pill"];
    const itemId = rewards[Math.floor(Math.random() * rewards.length)];
    const stones = 200 + dungeon.enemyLv * 300;
    const exp = 1500 + dungeon.enemyLv * 1500;

    s.spiritStones += stones;
    Game.gainExp(exp);
    if (ITEMS[itemId]) Game.addItem(itemId, 1);

    let texts = [
      {type:"narration", content:"你击败了" + sect.name + "副本中的守卫！"},
      {type:"reward", content:"💎 获得" + stones + "灵石"},
      {type:"reward", content:"✨ 获得" + exp + "经验"},
    ];
    if (ITEMS[itemId]) texts.push({type:"reward", content:"📦 获得：" + ITEMS[itemId].name});
    texts.push({type:"narration", content:"你可以继续探索或返回。"});

    UI.hideCombat();
    Game.combatState = null;
    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"继续探索副本", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== NPC初始好感度计算 =====
  calculateInitialAffinity(npc, state) {
    let affinity = 0;
    const reputation = state.reputation || 0;
    const karma = state.karma || 0;
    // 声望影响正面性格NPC的好感
    const repBonus = Math.min(30, reputation / 50);
    // 因果(道德)影响 - 低因果=高道德
    const morality = Math.max(-100, 100 - karma * 2);
    const moralBonus = Math.min(20, morality / 10);

    const pType = npc.personality ? npc.personality.type : "友善";
    const positiveTypes = ["友善", "热情", "豪爽", "温和", "侠义"];
    const negativeTypes = ["阴险", "狡诈", "狂傲"];
    const isPositive = positiveTypes.includes(pType);
    const isNegative = negativeTypes.includes(pType);

    if (isPositive) {
      affinity = Math.floor(repBonus + moralBonus);
    } else if (isNegative) {
      // 负面性格NPC，声望道德越低好感越高
      const lowRepBonus = Math.min(30, (500 - reputation) / 50);
      const lowMoralBonus = Math.min(20, (100 - morality) / 10);
      affinity = Math.max(0, Math.floor(lowRepBonus + lowMoralBonus - repBonus - moralBonus));
    }

    return Math.max(0, Math.min(40, affinity));
  },

  // ===== 加入宗门时提升好感度 =====
  boostSectAffinity(sectId, state) {
    if (!state.npcList) return;
    const sect = SECTS_AND_FAMILIES[sectId];
    if (!sect) return;
    const sectName = sect.name;
    let boosted = 0;
    state.npcList.forEach(npc => {
      if (npc.isAlive && npc.sectId === sectId) {
        const boost = 20 + Math.floor(Math.random() * 10);
        npc.mood = Math.min(100, (npc.mood || 0) + boost);
        boosted++;
      }
    });
    if (boosted > 0) {
      UI.toast("加入" + sectName + "，宗门内" + boosted + "名NPC好感度提升！", "success");
    }
  },

  // ===== 支线任务系统 =====
  // 在区域生成支线NPC
  ensureSideQuestNPCs(state, areaKey) {
    if (!state.sideQuestNPCs) state.sideQuestNPCs = {};
    if (!state.activeSideQuests) state.activeSideQuests = [];
    if (!state.completedSideQuests) state.completedSideQuests = [];

    // 如果该区域已有支线NPC，不再生成
    if (state.sideQuestNPCs[areaKey] && state.sideQuestNPCs[areaKey].length > 0) return;

    // 30%概率在该区域生成一个支线NPC
    if (Math.random() > 0.3) return;

    // 随机选择一个适合当前修为的支线
    const availableQuests = Object.keys(SIDE_QUESTS).filter(qId => {
      const q = SIDE_QUESTS[qId];
      if (state.completedSideQuests.includes(qId)) return false;
      if (state.activeSideQuests.includes(qId)) return false;
      return CULT_LEVELS[state.cultLevel].stage >= q.minCult;
    });

    if (availableQuests.length === 0) return;

    const questId = availableQuests[Math.floor(Math.random() * availableQuests.length)];
    const quest = SIDE_QUESTS[questId];

    // 生成支线NPC
    const surname = NPC_SURNAMES[Math.floor(Math.random() * NPC_SURNAMES.length)];
    const isFemale = Math.random() < 0.4;
    const givenName = isFemale
      ? NPC_GIVEN_NAMES_F[Math.floor(Math.random() * NPC_GIVEN_NAMES_F.length)]
      : NPC_GIVEN_NAMES_M[Math.floor(Math.random() * NPC_GIVEN_NAMES_M.length)];
    const npcId = "sq_npc_" + Date.now() + "_" + Math.floor(Math.random() * 9999);

    const npcLevel = Math.max(0, state.cultLevel + Math.floor((Math.random() - 0.3) * 3));
    const cult = CULT_LEVELS[Math.min(npcLevel, CULT_LEVELS.length - 2)];
    const personality = NPC_PERSONALITIES[Math.floor(Math.random() * NPC_PERSONALITIES.length)];

    const sqNpc = {
      id: npcId,
      name: surname + givenName,
      title: "焦急的修士",
      isFemale: isFemale,
      cultLevel: npcLevel,
      cultName: cult.name,
      personality: personality,
      action: "面带焦急",
      hp: cult.hpBonus,
      maxHp: cult.hpBonus,
      atk: cult.atkBonus,
      def: cult.defBonus,
      items: [],
      stones: Math.floor(50 * (npcLevel + 1)),
      area: areaKey,
      isAlive: true,
      isFriend: false,
      relationType: null,
      mood: 30,
      isSideQuestNPC: true,
      sideQuestId: questId,
    };

    if (!state.npcList) state.npcList = [];
    state.npcList.push(sqNpc);
    if (!state.sideQuestNPCs[areaKey]) state.sideQuestNPCs[areaKey] = [];
    state.sideQuestNPCs[areaKey].push(npcId);
  },

  // 与支线NPC交谈
  talkToSideQuestNPC(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc || !npc.isSideQuestNPC) return false;

    const quest = SIDE_QUESTS[npc.sideQuestId];
    if (!quest) return false;

    const isActive = s.activeSideQuests.includes(quest.id);
    const isCompleted = s.completedSideQuests.includes(quest.id);

    if (isCompleted) {
      UI.renderNarrative([
        {type:"narration", content: npc.name + "已经完成了你的委托，向你道谢。"},
        {type:"dialogue", content:"「多谢道友相助，此恩铭记于心。」"},
      ]);
      UI.renderChoices([{text:"告辞", next:"_npc_leave", effect:{}}]);
      return true;
    }

    if (!isActive) {
      // 接取任务
      s.activeSideQuests.push(quest.id);
      if (!s.sideQuestProgress[quest.id]) s.sideQuestProgress[quest.id] = 0;

      UI.renderNarrative([
        {type:"narration", content: npc.name + "看到你走近，连忙迎上来。"},
        {type:"dialogue", content:"「道友请留步！在下有一事相求——" + quest.desc + "」"},
        {type:"system_msg", content:"📌 接取支线任务：「" + quest.name + "」"},
        {type:"system_msg", content:"目标：" + quest.target},
        {type:"system_msg", content:"奖励：💎" + quest.reward.stones + "灵石 ✨" + quest.reward.exp + "经验 📦" + (ITEMS[quest.reward.item] ? ITEMS[quest.reward.item].name : "未知") + ""},
      ]);

      UI.renderChoices([
        {text:"我愿意帮忙", next:"_accept_sq_" + npcId, effect:{}},
        {text:"抱歉，我还有事", next:"_npc_leave", effect:{}},
      ]);
    } else {
      // 检查是否完成
      const completed = this.checkSideQuestComplete(quest.id, s);
      if (completed) {
        // 交付任务
        s.completedSideQuests.push(quest.id);
        s.activeSideQuests = s.activeSideQuests.filter(q => q !== quest.id);
        s.spiritStones += quest.reward.stones;
        Game.gainExp(quest.reward.exp);
        if (quest.reward.item) Game.addItem(quest.reward.item, 1);

        UI.renderNarrative([
          {type:"narration", content:"你完成了" + npc.name + "的委托！"},
          {type:"dialogue", content:"「多谢道友相助！这些是答谢之物，请收下！」"},
          {type:"reward", content:"💎 获得" + quest.reward.stones + "灵石"},
          {type:"reward", content:"✨ 获得" + quest.reward.exp + "经验"},
          {type:"reward", content:"📦 获得：" + (ITEMS[quest.reward.item] ? ITEMS[quest.reward.item].name : "")},
        ]);
        UI.renderChoices([{text:"告辞", next:"_npc_leave", effect:{}}, {text:"继续探索", next:"_wild_continue", effect:{}}]);
      } else {
        // 任务未完成
        const progress = s.sideQuestProgress[quest.id] || 0;
        UI.renderNarrative([
          {type:"narration", content: npc.name + "看到你，连忙询问进度。"},
          {type:"dialogue", content:"「道友，事情进展如何了？还请多多费心。」"},
          {type:"system_msg", content:"📌 " + quest.name + " —— " + quest.target + "（进度：" + progress + "）"},
        ]);
        UI.renderChoices([{text:"告辞", next:"_npc_leave", effect:{}}, {text:"继续探索", next:"_wild_continue", effect:{}}]);
      }
    }
    return true;
  },

  // 接受支线
  acceptSideQuest(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc) return;
    UI.renderNarrative([
      {type:"narration", content:"你答应了" + npc.name + "的请求。"},
      {type:"dialogue", content:"「多谢道友！在下感激不尽！」"},
      {type:"system_msg", content:"已接取支线任务，探索野外时自动推进进度。"},
    ]);
    UI.renderChoices([{text:"告辞", next:"_npc_leave", effect:{}}, {text:"继续探索", next:"_wild_continue", effect:{}}]);
  },

  // 检查支线任务完成
  checkSideQuestComplete(questId, state) {
    const progress = state.sideQuestProgress[questId] || 0;
    switch(questId) {
      case "sq_lost_disciple": return progress >= 1;
      case "sq_stolen_treasure": return progress >= 1;
      case "sq_alchemy_request": return progress >= 3;
      case "sq_beast_subdue": return progress >= 3;
      case "sq_escort_merchant": return progress >= 1;
      case "sq_rival_duel": return progress >= 1;
      case "sq_ancient_map": return progress >= 1;
      case "sq_missing_alchemist": return progress >= 1;
      case "sq_demon_removal": return progress >= 1;
      case "sq_spirit_vein_dispute": return progress >= 1;
      case "sq_cursed_blade": return progress >= 2;
      case "sq_heavenly_herb": return progress >= 1;
      default: return false;
    }
  },

  // 更新支线进度（在探索/战斗后调用）
  updateSideQuestProgress(state, type) {
    if (!state.activeSideQuests || state.activeSideQuests.length === 0) return;
    state.activeSideQuests.forEach(questId => {
      if (!state.sideQuestProgress[questId]) state.sideQuestProgress[questId] = 0;
      const quest = SIDE_QUESTS[questId];
      if (!quest) return;

      switch(questId) {
        case "sq_lost_disciple":
        case "sq_stolen_treasure":
        case "sq_escort_merchant":
        case "sq_rival_duel":
        case "sq_ancient_map":
        case "sq_missing_alchemist":
        case "sq_demon_removal":
        case "sq_spirit_vein_dispute":
        case "sq_heavenly_herb":
          if (type === "wild_victory" || type === "cave_found") {
            if (Math.random() < 0.3) state.sideQuestProgress[questId]++;
          }
          break;
        case "sq_alchemy_request":
          if (type === "item_obtained") state.sideQuestProgress[questId]++;
          break;
        case "sq_beast_subdue":
          if (type === "wild_victory") state.sideQuestProgress[questId]++;
          break;
        case "sq_cursed_blade":
          if (type === "item_obtained") state.sideQuestProgress[questId]++;
          break;
      }
    });
  },

  // ===== 强迫双修系统 =====
  // 检查是否可以强迫双修
  canForceDualCult(npc, state) {
    if (!npc || !npc.isAlive) return false;
    if (npc.isFemale === state.isFemale) return false; // 仅异性
    if (npc.isChild) return false;
    // 检查修为差距：自身需高于NPC一个大阶段
    const playerStage = CULT_LEVELS[state.cultLevel].stage;
    const npcStage = CULT_LEVELS[npc.cultLevel].stage;
    return playerStage >= npcStage + 1;
  },

  // 执行强迫双修
  forceDualCult(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) { UI.toast("此人已不在。", "danger"); return; }
    if (!this.canForceDualCult(npc, s)) {
      UI.toast("条件不满足，无法强迫双修。", "danger");
      return;
    }

    this.initExpand4State(s);
    s.forcedDualCount = (s.forcedDualCount || 0) + 1;

    // 大幅降低道德
    const moralLoss = 15 + Math.floor(Math.random() * 10);
    s.karma = (s.karma || 0) + moralLoss;

    // 提高怀孕几率（如果有道侣系统）
    let texts = [
      {type:"danger", content:"你以强大的修为压制住" + npc.name + "，强行双修……"},
      {type:"danger", content: npc.name + "无力反抗，眼中满是屈辱与愤怒。"},
      {type:"danger", content:"道德-" + moralLoss + "（因果值+" + moralLoss + "）"},
    ];

    // 判定事件结果
    // 忠贞度≤0时，大幅提高孽缘羁绊BUFF的触发概率
    var npcLoyaltyVal = (npc.loyalty !== undefined ? npc.loyalty : 100);
    var buffBoost = npcLoyaltyVal <= 0;
    var eventRoll = Math.random();
    // 忠贞度极低时的概率分布：发现10% / 道侣断绝+BUFF 40% / 联手追杀10% / 永久BUFF 30% / 极端化 10%
    var p_discover = buffBoost ? 0.10 : 0.25;
    var p_spouse_break = buffBoost ? 0.40 : 0.25;  // 事件2: 孽缘羁绊
    var p_chase = buffBoost ? 0.10 : 0.20;          // 事件3: 联手追杀
    var p_perm_buff = buffBoost ? 0.30 : 0.15;     // 事件4: 永久BUFF

    if (buffBoost) {
      texts.push({type:"system_msg", content:"⚠️ " + npc.name + "的忠贞度已尽失（" + npcLoyaltyVal + "），孽缘羁绊极易触发！"});
    }

    if (eventRoll < p_discover) {
      // 事件1: 被人发现
      texts.push({type:"danger", content:"⚠️ 就在此时，一道身影从暗处闪出，显然目睹了一切！"});
      const witnessName = NPC_SURNAMES[Math.floor(Math.random() * NPC_SURNAMES.length)] +
        (Math.random() < 0.5 ? NPC_GIVEN_NAMES_M[Math.floor(Math.random() * NPC_GIVEN_NAMES_M.length)] : NPC_GIVEN_NAMES_F[Math.floor(Math.random() * NPC_GIVEN_NAMES_F.length)]);
      texts.push({type:"dialogue", content:"「住手！你这畜生！」" + witnessName + "怒不可遏。"});
      texts.push({type:"system_msg", content:"你可以选择贿赂或击杀目击者。"});

      UI.renderNarrative(texts);
      UI.renderChoices([
        {text:"💰 贿赂目击者（-500灵石，道德-5）", next:"_bribe_witness_" + npcId, effect:{}},
        {text:"⚔️ 击杀目击者（道德-15）", next:"_kill_witness_" + npcId, effect:{}},
      ]);
      UI.updateAll();
      return;
    } else if (eventRoll < p_discover + p_spouse_break) {
      // 事件2: NPC的道侣断绝关系并追杀 + 孽缘羁绊BUFF
      if (npc.hasSpouse) {
        texts.push({type:"danger", content:"⚠️ " + npc.name + "的道侣得知此事后，与" + npc.name + "断绝了道侣关系！"});
        texts.push({type:"danger", content: npc.name + "对你的恨意已达极点，誓言追杀你！"});
        npc.mood = -1000;
        npc.isHostile = true;
        npc.hasSpouse = false;
        if (npc.socialNetwork) npc.socialNetwork.spouse = null;

        // 设置伏击
        if (!s.ambushers) s.ambushers = [];
        s.ambushers.push({
          npcId: npcId,
          name: npc.name,
          reason: "强迫双修之仇",
          cultLevel: npc.cultLevel,
          hp: npc.hp, atk: npc.atk, def: npc.def,
        });

        // 给被强迫的NPC添加孽缘羁绊BUFF（厌恶主角但无法离开，可无视好感结为道侣）
        s.npcExtremeBuff[npcId] = {
          type: "bond_curse",
          name: "孽缘羁绊",
          desc: "因强迫双修而与道侣断绝，对主角恨之入骨但命运纠缠，可无视好感度结为道侣",
        };
        npc.isExtremeNPC = true;

        texts.push({type:"system_msg", content:"孽缘羁绊已形成——" + npc.name + "虽恨你入骨，但命运将你们纠缠在一起，可无视好感度结为道侣。"});
        texts.push({type:"danger", content:"道德-" + moralLoss});

        UI.renderNarrative(texts);
        UI.renderChoices([
          {text:"💍 [孽缘]结为道侣", next:"_npc_marry_" + npcId, effect:{}},
          {text:"继续探索", next:"_wild_continue", effect:{}},
          {text:"返回", next:"_wild_return", effect:{}},
        ]);
        UI.updateAll();
        return;
      }
    } else if (eventRoll < p_discover + p_spouse_break + p_chase) {
      // 事件3: NPC和道侣一起追杀
      if (npc.hasSpouse) {
        texts.push({type:"danger", content:"⚠️ " + npc.name + "和其道侣联手追杀你！"});
        npc.mood = -1000;
        npc.isHostile = true;

        if (!s.ambushers) s.ambushers = [];
        s.ambushers.push({
          npcId: npcId,
          name: npc.name + "及其道侣",
          reason: "强迫双修之仇",
          cultLevel: npc.cultLevel + 2,
          hp: npc.hp * 2, atk: npc.atk * 1.5, def: npc.def * 1.5,
        });

        UI.renderNarrative(texts);
        UI.renderChoices([
          {text:"继续探索", next:"_wild_continue", effect:{}},
          {text:"返回", next:"_wild_return", effect:{}},
        ]);
        UI.updateAll();
        return;
      }
    } else if (eventRoll < p_discover + p_spouse_break + p_chase + p_perm_buff) {
      // 事件4: 永久BUFF - NPC厌恶但无法离开
      texts.push({type:"danger", content:"⚠️ 异变突生！" + npc.name + "的体内产生了一种诡异的羁绊……"});
      texts.push({type:"narration", content: npc.name + "的眼神变得复杂，她厌恶你，却无法离开你。"});
      texts.push({type:"system_msg", content: npc.name + "获得了永久BUFF：[孽缘羁绊] —— 厌恶主角但无法离开，好感度无法通过常规方式提升（仅极特殊事件可提升），可结为道侣但好感不变。"});
      texts.push({type:"danger", content:"道德-" + moralLoss});

      // 设置永久BUFF
      s.npcExtremeBuff[npcId] = {
        type: "bond_curse",
        name: "孽缘羁绊",
        desc: "厌恶主角但无法离开，好感度极难提升",
      };
      npc.mood = 1;
      npc.isExtremeNPC = true;

      UI.renderNarrative(texts);
      UI.renderChoices([
        {text:"结为道侣", next:"_npc_marry_" + npcId, effect:{}},
        {text:"继续探索", next:"_wild_continue", effect:{}},
        {text:"返回", next:"_wild_return", effect:{}},
      ]);
      UI.updateAll();
      return;
    } else {
      // 事件5: NPC变得极端
      texts.push({type:"danger", content:"⚠️ " + npc.name + "的精神似乎出了问题，变得极端而不可理喻……"});
      texts.push({type:"narration", content: npc.name + "时而对你怒目而视，时而又低声下气，行为极端不定。"});
      npc.isExtremeNPC = true;
      npc.mood = Math.max(0, npc.mood - 50);

      UI.renderNarrative(texts);
      UI.renderChoices([
        {text:"继续探索", next:"_wild_continue", effect:{}},
        {text:"返回", next:"_wild_return", effect:{}},
      ]);
      UI.updateAll();
      return;
    }

    // 默认结果：双修完成
    const expGain = 200 + npc.cultLevel * 50;
    Game.gainExp(expGain);
    texts.push({type:"reward", content:"✨ 双修获得" + expGain + "经验"});
    npc.mood = Math.max(0, npc.mood - 30);

    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // 贿赂目击者
  bribeWitness(npcId) {
    const s = Game.state;
    if (s.spiritStones < 500) {
      UI.toast("灵石不足！", "danger");
      return;
    }
    s.spiritStones -= 500;
    s.karma = (s.karma || 0) + 5;
    UI.renderNarrative([
      {type:"narration", content:"你拿出500灵石塞给目击者。"},
      {type:"dialogue", content:"「哼……算你识相。」目击者收下灵石，转身离去。"},
      {type:"danger", content:"道德-5（因果值+5）"},
    ]);
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // 击杀目击者
  killWitness(npcId) {
    const s = Game.state;
    s.karma = (s.karma || 0) + 15;
    UI.renderNarrative([
      {type:"danger", content:"你毫不留情，一击将目击者灭口！"},
      {type:"danger", content:"道德-15（因果值+15）"},
      {type:"narration", content:"四周恢复了寂静……但因果缠身，终有报应。"},
    ]);
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 新增剧情NPC交互 =====
  interactNewStoryNPC(npcId) {
    const s = Game.state;
    const snpc = NEW_STORY_NPCS[npcId];
    if (!snpc) return;

    // 获取或初始化NPC修为
    if (!s.storyNPCLevels) s.storyNPCLevels = {};
    if (!s.storyNPCLevels[npcId]) {
      s.storyNPCLevels[npcId] = snpc.cultStage * 3; // 初始修为等级
    }

    const npcLevel = s.storyNPCLevels[npcId];
    const cultName = npcLevel < CULT_LEVELS.length ? CULT_LEVELS[npcLevel].name : "大乘期";

    // 获取当前位置
    const locInfo = this.getNewStoryNPCLocation(npcId, s);
    if (!locInfo) {
      UI.toast("此人尚未在此修为阶段出现。", "danger");
      return;
    }

    // 获取亲密度
    if (!s.companionData) s.companionData = {};
    if (!s.companionData[npcId]) s.companionData[npcId] = {level:1, exp:0, affinity:0};
    const cData = s.companionData[npcId];

    const affLevel = cData.affinity >= 80 ? "亲密" : cData.affinity >= 50 ? "友善" : cData.affinity >= 30 ? "客气" : "冷淡";
    const dialogue = (snpc.dialogues && snpc.dialogues[affLevel]) || "「道友好。」";

    let texts = [
      {type:"narration", content:"你在" + (locInfo.subArea || locInfo.area) + "遇到了" + snpc.name + "。"},
      {type:"narration", content:"对方修为在" + cultName + "左右，" + snpc.desc + "。"},
      {type:"dialogue", content: dialogue},
    ];

    // 增加亲密度
    if (cData.affinity < 100) {
      cData.affinity = Math.min(100, cData.affinity + 5);
      texts.push({type:"system_msg", content:"与" + snpc.name + "见面，亲密度+5（当前：" + cData.affinity + "/100）"});
    }

    UI.renderNarrative(texts);

    const choices = [];
    choices.push({text:"🎁 送礼（+亲密度）", next:"_gift_new_story_" + npcId, effect:{}, compact:true});
    choices.push({text:"⚔️ 切磋武艺", next:"_spar_new_story_" + npcId, effect:{}, compact:true});

    // 检查是否可以强迫双修
    const playerStage = CULT_LEVELS[s.cultLevel].stage;
    const npcStage = Math.floor(npcLevel / 3);
    if (playerStage >= npcStage + 1 && snpc.isFemale !== s.isFemale) {
      choices.push({text:"💢 强迫双修（道德大降）", next:"_force_dual_new_" + npcId, effect:{}, compact:true});
    }

    // 如果亲密度足够，可以结为道侣
    if (cData.affinity >= 50 && !s.companions.includes(npcId)) {
      choices.push({text:"邀" + snpc.name + "同行（结为道侣）", next:"_recruit_new_story_" + npcId, effect:{}});
    }

    // 如果已经是道侣
    if (s.companions.includes(npcId)) {
      choices.push({text:"💕 双修", next:"_dual_new_story_" + npcId, effect:{}});
    }

    choices.push({text:"🥷 尝试偷窃", next:"_steal_new_story_" + npcId, effect:{}});
    choices.push({text:"告辞离开", next:"_npc_leave", effect:{}});

    UI.renderChoices(choices);
    UI.updateAll();
  },

  // 获取新增剧情NPC位置
  getNewStoryNPCLocation(npcId, state) {
    const snpc = NEW_STORY_NPCS[npcId];
    if (!snpc) return null;
    const cultStage = CULT_LEVELS[state.cultLevel].stage;
    for (let i = snpc.locations.length - 1; i >= 0; i--) {
      if (snpc.locations[i].minCult <= cultStage) {
        return snpc.locations[i];
      }
    }
    return null;
  },

  // 新增剧情NPC送礼
  giftNewStoryNPC(npcId) {
    const s = Game.state;
    const snpc = NEW_STORY_NPCS[npcId];
    if (!snpc) return;
    const cData = s.companionData[npcId] || {level:1, exp:0, affinity:0};

    const cost = 50 + Math.floor(Math.random() * 100);
    if (s.spiritStones < cost) {
      UI.renderNarrative([{type:"narration", content:"你的灵石不够买一份像样的礼物……"}]);
      UI.renderChoices([{text:"返回", next:"_interact_new_story_" + npcId, effect:{}}]);
      return;
    }
    s.spiritStones -= cost;
    const gain = 5 + Math.floor(Math.random() * 8);
    cData.affinity = Math.min(100, cData.affinity + gain);
    s.companionData[npcId] = cData;

    UI.renderNarrative([
      {type:"narration", content:"你花了" + cost + "灵石为" + snpc.name + "买了一份礼物。"},
      {type:"dialogue", content:"「多谢道友美意！」" + snpc.name + "露出笑意。"},
      {type:"system_msg", content:"亲密度+" + gain + "（当前：" + cData.affinity + "/100）"},
    ]);
    UI.renderChoices([
      {text:"再送一份", next:"_gift_new_story_" + npcId, effect:{}},
      {text:"告辞", next:"_npc_leave", effect:{}},
    ]);
  },

  // 新增剧情NPC切磋
  sparNewStoryNPC(npcId) {
    const s = Game.state;
    const snpc = NEW_STORY_NPCS[npcId];
    if (!snpc) return;
    const expGain = 50 + Math.floor(Math.random() * 100);
    Game.gainExp(expGain);
    UI.renderNarrative([
      {type:"narration", content:"你与" + snpc.name + "切磋了一番武艺。"},
      {type:"dialogue", content:"「道友身手不凡！」" + snpc.name + "赞叹道。"},
      {type:"reward", content:"获得经验+" + expGain},
    ]);
    UI.renderChoices([
      {text:"再切磋一次", next:"_spar_new_story_" + npcId, effect:{}},
      {text:"告辞", next:"_npc_leave", effect:{}},
    ]);
  },

  // 新增剧情NPC偷窃
  stealNewStoryNPC(npcId) {
    const s = Game.state;
    const snpc = NEW_STORY_NPCS[npcId];
    if (!snpc) return;
    const cData = s.companionData[npcId] || {level:1, exp:0, affinity:0};

    const successChance = 0.3 + cData.affinity * 0.003;
    if (Math.random() < successChance) {
      const stolen = 30 + Math.floor(Math.random() * 70);
      s.spiritStones += stolen;
      s.npcSteals = (s.npcSteals || 0) + 1;
      if (s.npcSteals === 1) Game.giveAchievement("npc_first_steal");
      UI.renderNarrative([
        {type:"narration", content:"你趁" + snpc.name + "不注意，悄悄拿走了一些灵石。"},
        {type:"reward", content:"🎉 偷窃成功！获得" + stolen + "灵石"},
      ]);
    } else {
      cData.affinity = Math.max(0, cData.affinity - 20);
      s.companionData[npcId] = cData;
      UI.renderNarrative([
        {type:"danger", content:"你的动作被" + snpc.name + "发现了！"},
        {type:"dialogue", content:"「你……竟敢偷我东西！」" + snpc.name + "十分生气。"},
        {type:"danger", content:"亲密度-20"},
      ]);
    }
    UI.renderChoices([
      {text:"告辞", next:"_npc_leave", effect:{}},
      {text:"继续探索", next:"_wild_continue", effect:{}},
    ]);
  },

  // 招募新增剧情NPC
  recruitNewStoryNPC(npcId) {
    const s = Game.state;
    const snpc = NEW_STORY_NPCS[npcId];
    if (!snpc) return;
    const cData = s.companionData[npcId] || {level:1, exp:0, affinity:0};

    if (!s.companions.includes(npcId)) {
      s.companions.push(npcId);
      cData.affinity = Math.max(cData.affinity, 60);
      s.companionData[npcId] = cData;
      if (s.companions.length === 1) Game.giveAchievement("first_companion");

      UI.renderNarrative([
        {type:"narration", content: snpc.name + "欣然同意与你同行！"},
        {type:"dialogue", content:"「好！从今以后，你我便是道侣了！」"},
        {type:"reward", content:"🎉 获得道侣：" + snpc.name},
      ]);
    } else {
      UI.renderNarrative([{type:"narration", content: snpc.name + "已经与你同行了。"}]);
    }
    UI.renderChoices([{text:"继续", next:"_npc_leave", effect:{}}, {text:"继续探索", next:"_wild_continue", effect:{}}]);
  },

  // 新增剧情NPC双修
  dualNewStoryNPC(npcId) {
    const s = Game.state;
    const snpc = NEW_STORY_NPCS[npcId];
    if (!snpc) return;
    const expGain = 200 + Math.floor(Math.random() * 200);
    Game.gainExp(expGain);
    const cData = s.companionData[npcId] || {level:1, exp:0, affinity:0};
    cData.affinity = Math.min(100, cData.affinity + 3);
    s.companionData[npcId] = cData;
    UI.renderNarrative([
      {type:"narration", content:"你与" + snpc.name + "进行了双修……"},
      {type:"reward", content:"✨ 双修获得" + expGain + "经验，亲密度+3"},
    ]);
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
  },

  // ===== 新增剧情NPC强迫双修 =====
  forceDualNewStoryNPC(npcId) {
    const s = Game.state;
    const snpc = NEW_STORY_NPCS[npcId];
    if (!snpc) return;

    // 剧情NPC不可强迫双修
    UI.renderNarrative([
      {type:"danger", content:"你试图对" + snpc.name + "施展强迫之术……"},
      {type:"narration", content:"然而" + snpc.name + "身上闪烁着神秘的护体光芒，你的手段完全无效！"},
      {type:"dialogue", content:"「你以为你能对我做什么？天真！」" + snpc.name + "冷笑道。"},
      {type:"system_msg", content:"剧情NPC拥有特殊护佑，无法被强迫双修。"},
    ]);
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
  },

  // ===== 剧情NPC随时间成长 =====
  ageStoryNPCs(state, daysPassed) {
    if (!state.storyNPCLevels) state.storyNPCLevels = {};
    const totalDays = daysPassed || 1;

    Object.keys(NEW_STORY_NPCS).forEach(npcId => {
      const current = state.storyNPCLevels[npcId] || 0;
      // 每30天有概率提升修为
      const growthChance = totalDays / 30 * 0.3;
      if (Math.random() < growthChance) {
        state.storyNPCLevels[npcId] = Math.min(CULT_LEVELS.length - 2, current + 1);
      }
    });

    // 旧剧情NPC也成长
    Object.keys(STORY_NPC_LOCATIONS).forEach(npcId => {
      if (!state.storyNPCLevels[npcId]) {
        state.storyNPCLevels[npcId] = 1;
      }
      const current = state.storyNPCLevels[npcId];
      const growthChance = totalDays / 30 * 0.2;
      if (Math.random() < growthChance) {
        state.storyNPCLevels[npcId] = Math.min(CULT_LEVELS.length - 2, current + 1);
      }
    });
  },

  // ===== 新增副本探索 =====
  exploreNewDungeon(areaKey) {
    const s = Game.state;
    this.initExpand4State(s);

    const dungeonType = NEW_DUNGEON_TYPES[Math.floor(Math.random() * NEW_DUNGEON_TYPES.length)];

    // 设置当前野外区域
    this.setCurrentWilderness(areaKey, this.findParentCity(areaKey));

    const texts = [
      {type:"chapter_title", content:"🏔️ " + dungeonType.name},
      {type:"narration", content:"你在" + (WORLD_MAP[areaKey] ? WORLD_MAP[areaKey].name : areaKey) + "探索时，发现了一处" + dungeonType.name + "！"},
      {type:"narration", content:dungeonType.desc},
    ];

    const roll = Math.random();
    if (roll < dungeonType.enemyChance) {
      // 遇到敌人
      const enemyId = dungeonType.enemyTypes[Math.floor(Math.random() * dungeonType.enemyTypes.length)];
      const enemyData = NEW_DUNGEON_ENEMIES[enemyId] || CAVE_STRONG_ENEMIES[enemyId];
      if (enemyData) {
        texts.push({type:"danger", content:"⚠️ 你遇到了" + enemyData.name + "！"});
        UI.renderNarrative(texts);

        const enemy = {
          name: enemyData.name,
          hp: enemyData.hp, atk: enemyData.atk, def: enemyData.def,
          exp: enemyData.exp, stone: enemyData.stone,
          drop: enemyData.drop, dropRate: enemyData.dropRate,
        };
        Game.combatState = {
          enemy: enemy, enemyHp: enemy.hp, enemyMaxHp: enemy.hp,
          onWin: "_new_dungeon_win_" + areaKey, onLose: "_new_dungeon_lose",
          turn: 0, log: [],
        };
        UI.showCombat(Game.combatState);
        Game.combatLog("遭遇" + enemy.name + "！", "system");
        return;
      }
    }

    // 探索奖励
    if (dungeonType.expBonus > 0) {
      Game.gainExp(dungeonType.expBonus);
      texts.push({type:"reward", content:"✨ 获得" + dungeonType.expBonus + "经验"});
    }
    if (dungeonType.stoneBonus > 0) {
      s.spiritStones += dungeonType.stoneBonus;
      texts.push({type:"reward", content:"💎 获得" + dungeonType.stoneBonus + "灵石"});
    }
    if (Math.random() < dungeonType.itemChance) {
      const itemId = dungeonType.itemPool[Math.floor(Math.random() * dungeonType.itemPool.length)];
      if (ITEMS[itemId]) {
        Game.addItem(itemId, 1);
        texts.push({type:"reward", content:"📦 获得：" + ITEMS[itemId].name});
      }
    }

    texts.push({type:"narration", content:"探索完毕，你可以继续探索或返回。"});
    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // 新副本战斗胜利
  newDungeonVictory(areaKey) {
    const s = Game.state;
    const stones = 200 + Math.floor(Math.random() * 500);
    const exp = 1000 + Math.floor(Math.random() * 2000);
    s.spiritStones += stones;
    Game.gainExp(exp);

    // 更新支线进度
    this.updateSideQuestProgress(s, "wild_victory");

    UI.hideCombat();
    Game.combatState = null;
    UI.renderNarrative([
      {type:"narration", content:"你击败了副本中的敌人！"},
      {type:"reward", content:"💎 获得" + stones + "灵石"},
      {type:"reward", content:"✨ 获得" + exp + "经验"},
      {type:"narration", content:"你可以继续探索或返回。"},
    ]);
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 显示新增剧情NPC位置面板 =====
  showNewStoryNPCPanel() {
    const s = Game.state;
    let html = '<div class="modal-section"><div class="modal-section-title">📖 剧情人物行踪</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-bottom:12px;">剧情人物会在固定地点出现，随修为提升而移动</p>';

    // 旧剧情NPC
    Object.keys(STORY_NPC_LOCATIONS).forEach(npcId => {
      const snpc = STORY_NPC_LOCATIONS[npcId];
      const has = s.companions.includes(npcId);
      const locInfo = this.getStoryNPCLocation(npcId, s);
      const cultStage = CULT_LEVELS[s.cultLevel].stage;
      const canFind = snpc.locations.some(l => l.minCult <= cultStage);

      html += '<div class="modal-item-row" style="opacity:' + (canFind ? '1' : '0.4') + '"><div>';
      html += '<div style="color:' + (has ? 'var(--pink)' : (canFind ? 'var(--gold-bright)' : 'var(--text-dim)')) + '">';
      html += (has ? '💕 ' : (canFind ? '📍 ' : '🔒 ')) + snpc.name;
      if (has) html += ' (已结为道侣)';
      html += '</div>';
      html += '<div class="modal-item-desc">' + snpc.desc + '</div>';
      if (canFind && locInfo) {
        html += '<div class="modal-item-stats" style="color:var(--jade);">当前位置：' + locInfo.area + ' · ' + locInfo.subArea + '</div>';
        if (s.location === locInfo.area) {
          html += '<button class="btn-combat" style="margin-top:4px;font-size:0.7em;padding:3px 8px;" onclick="UI.closeModal();Game.gotoNode(\'_interact_story_' + npcId + '\')">前往相见</button>';
        }
      } else if (!canFind) {
        const nextLoc = snpc.locations.find(l => l.minCult > cultStage);
        if (nextLoc) {
          html += '<div class="modal-item-stats" style="color:var(--text-dim);">需' + STAGE_NAMES[nextLoc.minCult] + '后出现于' + nextLoc.area + '</div>';
        }
      }
      html += '</div></div>';
    });

    // 新增剧情NPC
    Object.keys(NEW_STORY_NPCS).forEach(npcId => {
      const snpc = NEW_STORY_NPCS[npcId];
      const has = s.companions.includes(npcId);
      const locInfo = this.getNewStoryNPCLocation(npcId, s);
      const cultStage = CULT_LEVELS[s.cultLevel].stage;
      const canFind = snpc.locations.some(l => l.minCult <= cultStage);

      html += '<div class="modal-item-row" style="opacity:' + (canFind ? '1' : '0.4') + '"><div>';
      html += '<div style="color:' + (has ? 'var(--pink)' : (canFind ? 'var(--gold-bright)' : 'var(--text-dim)')) + '">';
      html += (has ? '💕 ' : (canFind ? '📍 ' : '🔒 ')) + snpc.name;
      if (has) html += ' (已结为道侣)';
      if (snpc.isFemale) html += ' <span style="font-size:0.8em;color:var(--pink);">♀</span>';
      html += '</div>';
      html += '<div class="modal-item-desc">' + snpc.desc + '</div>';
      if (canFind && locInfo) {
        html += '<div class="modal-item-stats" style="color:var(--jade);">当前位置：' + locInfo.area + ' · ' + locInfo.subArea + '</div>';
        html += '<div class="modal-item-stats">' + locInfo.desc + '</div>';
        if (s.location === locInfo.area) {
          html += '<button class="btn-combat" style="margin-top:4px;font-size:0.7em;padding:3px 8px;" onclick="UI.closeModal();Game.gotoNode(\'_interact_new_story_' + npcId + '\')">前往相见</button>';
        }
      } else if (!canFind) {
        const nextLoc = snpc.locations.find(l => l.minCult > cultStage);
        if (nextLoc) {
          html += '<div class="modal-item-stats" style="color:var(--text-dim);">需' + STAGE_NAMES[nextLoc.minCult] + '后出现于' + nextLoc.area + '</div>';
        }
      }
      html += '</div></div>';
    });

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },
});
