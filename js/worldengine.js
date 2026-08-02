/* ====== 凡人修仙传MUD · 世界系统引擎 ====== */

const WorldSystem = {
  // ===== 初始化世界状态 =====
  initWorldState(state) {
    if (!state.npcList) state.npcList = [];
    if (!state.npcFriends) state.npcFriends = [];
    if (!state.npcKills) state.npcKills = 0;
    if (!state.npcSteals) state.npcSteals = 0;
    if (!state.visitedTowns) state.visitedTowns = [];
    if (!state.activeQuests) state.activeQuests = [];
    if (!state.completedQuests) state.completedQuests = [];
    if (!state.foundCaves) state.foundCaves = [];
    if (!state.npcInteractions) state.npcInteractions = 0;
    // 初始化扩展系统状态
    if (typeof this.initExpandState === 'function') this.initExpandState(state);
    // 初始化扩展2系统状态
    if (typeof this.initExpand2State === 'function') this.initExpand2State(state);
    // 初始化永久主线状态
    if (!state.pmainProgress) state.pmainProgress = 0;
    if (!state.pmainCompleted) state.pmainCompleted = [];
    // 记录已生成NPC的区域
    if (!state.generatedNPCAreas) state.generatedNPCAreas = [];
  },

  // ===== 主线任务地点与剧情节点映射 =====
  MAIN_QUEST_LOCATIONS: {
    "main_start": {areas: ["七玄门集镇"], storyNode: "seven_profound_explore", label: "七玄门修行"},
    "main_tiannan": {areas: ["天南坊市城", "黄枫谷", "长安城", "太南谷"], storyNode: "tiannan_explore", label: "天南历练"},
    "main_luanxing": {areas: ["乱星海", "乱星海海域"], storyNode: "luanxing_explore", label: "乱星海之行"},
    "main_core": {areas: ["虚天殿", "坠魔谷"], storyNode: "cultivate_meditate", label: "结丹修炼"},
    "main_infant": {areas: ["坠魔谷", "虚天殿"], storyNode: "cultivate_meditate", label: "凝婴修炼"},
    "main_ascension": {areas: ["灵界", "仙界"], storyNode: "cultivate_meditate", label: "飞升之路"},
  },

  // ===== 永久主线: 始终存在，不随地点改变 =====
  PERMANENT_MAIN_STORY: [
    {id:"pmain_qixuan", name:"七玄门修行", stage:"七玄门集镇", node:"pmain_qixuan_start", minCult:0, desc:"在七玄门集镇修行，积累修为"},
    {id:"pmain_tiannan", name:"天南历练", stage:"天南", node:"pmain_tiannan_start", minCult:2, desc:"前往天南，在黄枫谷历练"},
    {id:"pmain_luanxing", name:"乱星海探险", stage:"乱星海", node:"pmain_luanxing_start", minCult:6, desc:"远赴乱星海，探索海域"},
    {id:"pmain_xutiandian", name:"虚天殿之行", stage:"虚天殿", node:"pmain_xutiandian_start", minCult:10, desc:"前往虚天殿，寻找机缘"},
    {id:"pmain_mulan", name:"慕兰大战", stage:"慕兰草原", node:"pmain_mulan_start", minCult:14, desc:"慕兰草原之战，抵御外敌"},
    {id:"pmain_zhuimogu", name:"坠魔谷探秘", stage:"坠魔谷", node:"pmain_zhuimogu_start", minCult:18, desc:"深入坠魔谷，寻找上古遗宝"},
    {id:"pmain_lingjie", name:"飞升灵界", stage:"灵界", node:"pmain_lingjie_start", minCult:22, desc:"突破桎梏，飞升灵界"},
  ],

  // 获取永久主线选项（始终可用）
  getPermanentMainChoice() {
    const s = Game.state;
    this.initWorldState(s);
    if (!s.pmainProgress) s.pmainProgress = 0; // 当前进度索引
    
    const story = this.PERMANENT_MAIN_STORY;
    let current = s.pmainProgress;
    
    // 找到当前可进行的阶段
    while (current < story.length - 1) {
      const stage = story[current];
      const cultStage = CULT_LEVELS[s.cultLevel].stage;
      // 检查是否满足当前阶段要求，若已超出则推进
      if (cultStage >= stage.minCult) {
        // 检查当前阶段是否已完成
        if (s.pmainCompleted && s.pmainCompleted.includes(stage.id)) {
          current++;
          s.pmainProgress = current;
          continue;
        }
      }
      break;
    }
    
    // 返回当前阶段的选项
    const currentStage = story[current];
    if (!currentStage) return null;
    
    // 如果当前阶段已完成，且还有下一阶段
    if (s.pmainCompleted && s.pmainCompleted.includes(currentStage.id) && current < story.length - 1) {
      const nextStage = story[current + 1];
      const cultStage = CULT_LEVELS[s.cultLevel].stage;
      if (cultStage >= nextStage.minCult) {
        return {
          text: "⚜️ [主线] " + nextStage.name + "（" + nextStage.desc + "）",
          next: nextStage.node,
          effect: {},
        };
      }
      // 还没达到下一阶段修为要求
      return null;
    }
    
    // 如果当前阶段已完成且是最后一阶段
    if (s.pmainCompleted && s.pmainCompleted.includes(currentStage.id) && current >= story.length - 1) {
      return null;
    }
    
    return {
      text: "⚜️ [主线] " + currentStage.name + "（" + currentStage.desc + "，前往" + currentStage.stage + "推进）",
      next: currentStage.node,
      effect: {},
    };
  },

  // ===== 检查主线推进（在当前地点满足条件时显示推进选项） =====
  getMainQuestProgressionChoice(locKey) {
    if (typeof this.checkMainQuestProgression !== 'function') return null;
    return this.checkMainQuestProgression(locKey);
  },

  // ===== 获取当前地点可用的主线任务选项 =====
  getMainQuestChoices(locKey) {
    const s = Game.state;
    this.initWorldState(s);
    const choices = [];
    
    // 当前地点名
    const locName = WORLD_MAP[locKey] ? WORLD_MAP[locKey].name : locKey;
    
    Object.keys(this.MAIN_QUEST_LOCATIONS).forEach(questId => {
      // 跳过已完成的任务
      if (s.completedQuests.includes(questId)) return;
      // 只检查活跃的任务
      if (!s.activeQuests.includes(questId)) return;
      
      const questLoc = this.MAIN_QUEST_LOCATIONS[questId];
      // 检查当前地点是否匹配
      const isMatch = questLoc.areas.some(area => 
        locKey === area || locName === area || locName.includes(area) || area.includes(locName)
      );
      
      if (isMatch) {
        const quest = QUESTS[questId];
        if (quest) {
          choices.push({
            text: "⚜️ " + quest.name + "（继续主线）",
            next: questLoc.storyNode,
            effect: {},
          });
        }
      }
    });
    
    return choices;
  },

  // ===== 检查当前地点的NPC列表 =====
  getAreaNPCs(state, areaKey) {
    if (!state.npcList) return [];
    return state.npcList.filter(n => n.isAlive && (n.area === areaKey || n.area === WORLD_MAP[areaKey]?.name));
  },

  // ===== 确保区域有足够的NPC =====
  ensureAreaNPCs(state, areaKey) {
    const loc = WORLD_MAP[areaKey];
    if (!loc) return;
    
    const existing = this.getAreaNPCs(state, areaKey);
    
    // 城镇需要50-80个NPC（含凡人和孩童）
    if (Object.keys(TOWNS).some(t => TOWNS[t].region === areaKey)) {
      if (existing.length < 50) {
        if (typeof this.generateMassNPCs === 'function') {
          this.generateMassNPCs(state, areaKey, 60);
        }
      }
    } else {
      // 野外区域需要100-200个NPC
      if (existing.length < 80) {
        if (typeof this.generateMassNPCs === 'function') {
          this.generateMassNPCs(state, areaKey, 150);
        }
      }
    }
  },

  // ===== 生成NPC修士 =====
  generateNPC(playerLevel, area) {
    const surname = NPC_SURNAMES[Math.floor(Math.random() * NPC_SURNAMES.length)];
    const isFemale = Math.random() < 0.4;
    const givenName = isFemale
      ? NPC_GIVEN_NAMES_F[Math.floor(Math.random() * NPC_GIVEN_NAMES_F.length)]
      : NPC_GIVEN_NAMES_M[Math.floor(Math.random() * NPC_GIVEN_NAMES_M.length)];
    const title = NPC_TITLES[Math.floor(Math.random() * NPC_TITLES.length)];
    const name = surname + givenName;

    // NPC修为在玩家修为上下浮动
    const levelVariance = Math.floor((Math.random() - 0.3) * 4);
    let npcLevel = Math.max(0, playerLevel + levelVariance);
    if (npcLevel >= CULT_LEVELS.length - 1) npcLevel = CULT_LEVELS.length - 2;
    const cult = CULT_LEVELS[npcLevel];

    const personality = NPC_PERSONALITIES[Math.floor(Math.random() * NPC_PERSONALITIES.length)];
    const action = NPC_ACTIONS[Math.floor(Math.random() * NPC_ACTIONS.length)];

    // NPC身上物品
    const stage = cult.stage;
    const lootPool = NPC_LOOT_POOLS[stage] || NPC_LOOT_POOLS[0];
    const itemCount = Math.floor(Math.random() * 3);
    const items = [];
    for (let i = 0; i < itemCount; i++) {
      items.push(lootPool[Math.floor(Math.random() * lootPool.length)]);
    }

    // NPC灵石
    const stones = Math.floor(50 * (npcLevel + 1) * (0.5 + Math.random()));

    // NPC属性（基于修为）
    const hp = cult.hpBonus + Math.floor(Math.random() * cult.hpBonus * 0.2);
    const atk = cult.atkBonus + Math.floor(Math.random() * cult.atkBonus * 0.2);
    const def = cult.defBonus + Math.floor(Math.random() * cult.defBonus * 0.2);

    const npcId = "npc_" + Date.now() + "_" + Math.floor(Math.random() * 9999);

    const npc = {
      id: npcId,
      name: name,
      title: title,
      isFemale: isFemale,
      cultLevel: npcLevel,
      cultName: cult.name,
      personality: personality,
      action: action,
      hp: hp,
      maxHp: hp,
      atk: atk,
      def: def,
      items: items,
      stones: stones,
      area: area,
      isAlive: true,
      isFriend: false,
      relationType: null,
      mood: 0, // 初始好感度为0，由calculateInitialAffinity计算
    };

    // 初始化NPC社交网络（道侣/亲友/宿敌/宗门）
    if (typeof this.setupNPCSocialNetwork === 'function') {
      this.setupNPCSocialNetwork(npc, Game.state);
    }

    // 计算初始好感度（基于玩家声望/道德/NPC性格）
    if (typeof this.calculateInitialAffinity === 'function') {
      npc.mood = this.calculateInitialAffinity(npc, Game.state);
    }

    return npc;
  },

  // ===== 在野外生成NPC列表 =====
  generateAreaNPCs(state, areaKey, count) {
    if (!state.npcList) state.npcList = [];
    // 清理已死亡或已离开的NPC
    state.npcList = state.npcList.filter(n => n.isAlive && n.area === areaKey);
    // 补充NPC
    const existing = state.npcList.length;
    const toGen = Math.max(0, count - existing);
    for (let i = 0; i < toGen; i++) {
      const npc = this.generateNPC(state.cultLevel, areaKey);
      state.npcList.push(npc);
    }
    return state.npcList.filter(n => n.area === areaKey && n.isAlive);
  },

  // ===== 获取NPC对话 =====
  getNPCDialogue(npc) {
    let category;
    if (npc.isFriend) {
      category = "warm";
    } else {
      const pType = npc.personality.type;
      if (pType === "友善" || pType === "温和") category = "friendly";
      else if (pType === "冷漠" || pType === "谨慎") category = "cold";
      else if (pType === "狂傲") category = "arrogant";
      else if (pType === "阴险" || pType === "狡诈") category = "cunning";
      else if (pType === "热情" || pType === "豪爽") category = "warm";
      else category = "friendly";
    }
    const dialogues = NPC_DIALOGUES[category] || NPC_DIALOGUES.friendly;
    return dialogues[Math.floor(Math.random() * dialogues.length)];
  },

  // ===== 与NPC交谈 =====
  talkToNPC(npcId) {
    const s = Game.state;
    this.initWorldState(s);
    if (typeof this.initExpand4State === 'function') this.initExpand4State(s);
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) { UI.toast("此人已不在此处。", "danger"); return; }

    // 记录当前交谈的NPC ID（用于离开后继续探索）
    Game._lastNpcId = npcId;

    // 检查是否是支线NPC
    if (npc.isSideQuestNPC && typeof this.talkToSideQuestNPC === 'function') {
      if (this.talkToSideQuestNPC(npcId)) return;
    }

    s.npcInteractions = (s.npcInteractions || 0) + 1;
    if (s.npcInteractions === 1) Game.giveAchievement("npc_first_meet");

    const dialogue = this.getNPCDialogue(npc);
    const genderStr = npc.isFemale ? "女修" : "男修";

    let texts = [
      {type:"narration",content:"你在" + (npc.area || "此地") + "遇到了一位" + genderStr + "——" + npc.title + npc.name + "。"},
      {type:"narration",content:"对方" + npc.action + "，修为似乎在" + npc.cultName + "左右，性格" + npc.personality.type + "。"},
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

    // 检查是否可以结交
    const canBefriend = npc.mood >= 50 && !npc.isFriend;
    // 检查是否在野外/副本中
    var inWildDungeon = s.currentWilderness || (s.location && typeof WORLD_MAP !== 'undefined' && WORLD_MAP[s.location] && !s.currentPlace);
    // 异性且非儿童
    var isOppositeSex = !npc.isChild && !npc.isFemale !== !s.isFemale;
    // 野外/副本中遇到异性NPC(非儿童)，放宽所有敌对选项条件
    var wildInteract = inWildDungeon && isOppositeSex;
    // 检查是否可以提亲（好感度>=80，异性，未结婚）
    // 或者有特殊羁绊可无视好感度（孽缘羁绊/哄骗/秘密双修）
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
      } else if ((npc.loyalty !== undefined) && npc.loyalty <= 0) {
        canMarry = true; canMarrySpecial = true; marrySpecialLabel = "💍 [忠贞尽失]提亲";
      }
    }
    // 检查是否可以双修（已婚道侣，异性）
    const canDualCult = (s.spouses || []).includes(npcId);

    // 初始化NPC社交网络
    if (typeof this.setupNPCSocialNetwork === 'function' && !npc.socialNetwork) {
      this.setupNPCSocialNetwork(npc, s);
    }

    // 哄骗（野外只需异性+有道侣；非野外需好感100+道侣）
    var canDeceive = isOppositeSex && npc.hasSpouse && !npc.isChild && (wildInteract || npc.mood >= 100);
    // 降低忠贞度（野外只需异性非儿童；非野外需道侣或忠贞<100+好感>=40）
    var canLowerLoyalty = isOppositeSex && !npc.isChild && (wildInteract || ((npc.hasSpouse || (npc.loyalty !== undefined && npc.loyalty < 100)) && npc.mood >= 40));
    // 秘密双修（野外只需异性+有道侣或忠贞<100；非野外需道侣或忠贞<100+忠贞<=30+好感>=60）
    var canSecretDual = isOppositeSex && !npc.isChild && (npc.hasSpouse || (npc.loyalty !== undefined && npc.loyalty < 100)) && (wildInteract || (((npc.loyalty !== undefined ? npc.loyalty : 100)) <= 30 && npc.mood >= 60));

    UI.closeModal();
    UI.renderNarrative(texts);
    
    const choices = [];

    // 叛徒NPC只有击杀选项
    if (npc.isTraitorQuest) {
      const traitorDialogue = TRAITOR_DIALOGUE[Math.floor(Math.random() * TRAITOR_DIALOGUE.length)];
      UI.renderNarrative([{type:"dialogue", content: traitorDialogue}]);
      choices.push({text:"⚔️ 击杀" + npc.name, next:"_npc_attack_" + npcId, effect:{}});
      choices.push({text:"离开", next:"_npc_leave", effect:{}});
      UI.renderChoices(choices);
      return;
    }

    // 交互类按钮(紧凑网格)
    choices.push({text:"📋 详情", next:"_npc_detail_" + npcId, effect:{}, compact:true});
    choices.push({text:"🎁 送礼", next:"_gift_npc_" + npcId, effect:{}, compact:true});
    choices.push({text:"💊 给丹药", next:"_give_pill_" + npcId, effect:{}, compact:true});
    choices.push({text:"👥 关系", next:"_npc_social_" + npcId, effect:{}, compact:true});
    
    if (canBefriend) {
      choices.push({text:"结交", next:"_npc_befriend_" + npcId, effect:{}, compact:true});
    }
    if (canMarry && typeof this.proposeMarriage === 'function') {
      choices.push({text: canMarrySpecial ? marrySpecialLabel : "💍 提亲", next:"_npc_marry_" + npcId, effect:{}, compact:true});
    }
    if (canDualCult && typeof this.dualCultivate === 'function') {
      choices.push({text:"💕 双修", next:"_npc_dual_" + npcId, effect:{}, compact:true});
    }
    if (canDeceive && typeof this.deceiveNPC === 'function') {
      choices.push({text:"💔 哄骗断绝", next:"_deceive_npc_" + npcId, effect:{}, compact:true});
    }
    if (canLowerLoyalty && typeof this.showLowerLoyaltyPanel === 'function') {
      var loyDisp = (npc.loyalty !== undefined ? npc.loyalty : 100);
      var loyLabel = loyDisp <= 0 ? loyDisp + "⚠️" : loyDisp;
      choices.push({text:"🔓 降忠贞(" + loyLabel + ")", next:"_lower_loyalty_" + npcId, effect:{}, compact:true});
    }
    if (canSecretDual && typeof this.secretDualCultivate === 'function') {
      choices.push({text:"🔥 秘密双修", next:"_secret_dual_" + npcId, effect:{}, compact:true});
    }
    if (npc.sectId && s.ownSect && typeof this.showPoachPanel === 'function') {
      choices.push({text:"🎣 挖角", next:"_poach_npc_" + npcId, effect:{}, compact:true});
    }
    if (!npc.sectId && s.ownSect && npc.mood >= 80 && typeof this.inviteNPCToSect === 'function') {
      choices.push({text:"🏯 邀请加入", next:"_own_sect_invite_" + npcId, effect:{}, compact:true});
    }
    // 强迫双修（野外无限制只需异性非儿童；非野外需自身修为高于异性NPC一个大阶段）
    if (isOppositeSex && (wildInteract || (typeof this.canForceDualCult === 'function' && this.canForceDualCult(npc, s)))) {
      choices.push({text:"💢 强迫双修", next:"_force_dual_npc_" + npcId, effect:{}, compact:true});
    }
    // 拜为义父/义母（年龄大于主角20岁且好感度100）
    if (typeof this.adoptAsGodparent === 'function' && npc.age && npc.age >= (s.age || 16) + 20 && npc.mood >= 100 && !npc.isChild) {
      const godparentLabel = npc.isFemale ? "🙏 拜义母" : "🙏 拜义父";
      choices.push({text:godparentLabel, next:"_adopt_npc_" + npcId, effect:{}, compact:true});
    }
    
    // 操作类按钮(普通)
    choices.push({text:"继续交谈", next:"_npc_talk_" + npcId, effect:{}});
    choices.push({text:"尝试偷窃" + npc.name + "的物品", next:"_npc_steal_" + npcId, effect:{}});
    choices.push({text:"袭击" + npc.name, next:"_npc_attack_" + npcId, effect:{}});
    choices.push({text:"告辞离开", next:"_npc_leave", effect:{}});
    UI.renderChoices(choices);
  },

  // ===== 与NPC结交 =====
  befriendNPC(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) { UI.toast("此人已不在此处。", "danger"); return; }

    const chance = npc.personality.befriendChance + (npc.mood - 50) * 0.005;
    if (Math.random() < chance) {
      npc.isFriend = true;
      npc.relationType = NPC_RELATION_TYPES[Math.floor(Math.random() * 5)];
      s.npcFriends.push(npcId);
      if (s.npcFriends.length === 1) Game.giveAchievement("npc_first_friend");
      if (s.npcFriends.length >= 10) Game.giveAchievement("npc_friend_10");

      // 生成NPC关系网信息
      const relationInfo = this.generateNPCRelationInfo(npc);

      UI.renderNarrative([
        {type:"narration",content:npc.name + "欣然接受了你的结交请求！"},
        {type:"dialogue",content:"「道友果然是爽快人！今后你我便是" + npc.relationType + "了！」"},
        {type:"reward",content:"🎉 结交成功！获得好友：" + npc.title + npc.name},
        {type:"narration",content:relationInfo},
      ]);
    } else {
      npc.mood = Math.max(0, npc.mood - 15);
      UI.renderNarrative([
        {type:"narration",content:npc.name + "摇了摇头，似乎对结交还不太感兴趣。"},
        {type:"dialogue",content:"「道友还是先熟悉熟悉再说吧。」"},
        {type:"danger",content:"好感度-15（当前：" + npc.mood + "/100）"},
      ]);
    }

    UI.renderChoices([
      {text:"📋 查看详情", next:"_npc_detail_" + npcId, effect:{}},
      {text:"🎁 送礼", next:"_gift_npc_" + npcId, effect:{}},
      {text:"继续交谈", next:"_npc_talk_" + npcId, effect:{}},
      {text:"告辞离开", next:"_npc_leave", effect:{}},
    ]);
  },

  // ===== 生成NPC关系网信息 =====
  generateNPCRelationInfo(npc) {
    const info = [];
    const relCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < relCount; i++) {
      const surname = NPC_SURNAMES[Math.floor(Math.random() * NPC_SURNAMES.length)];
      const givenName = npc.isFemale
        ? NPC_GIVEN_NAMES_M[Math.floor(Math.random() * NPC_GIVEN_NAMES_M.length)]
        : NPC_GIVEN_NAMES_F[Math.floor(Math.random() * NPC_GIVEN_NAMES_F.length)];
      const relName = surname + givenName;
      const relType = NPC_RELATION_TYPES[Math.floor(Math.random() * NPC_RELATION_TYPES.length)];
      info.push(relType + "：" + relName);
    }
    return npc.name + "的圈子：" + info.join("，") + "。";
  },

  // ===== 偷窃NPC =====
  stealFromNPC(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) { UI.toast("此人已不在此处。", "danger"); return; }

    if (npc.items.length === 0 && npc.stones === 0) {
      UI.renderNarrative([
        {type:"narration",content:"你悄悄观察了一下，" + npc.name + "似乎身无长物。"},
      ]);
      UI.renderChoices([
        {text:"继续交谈", next:"_npc_talk_" + npcId, effect:{}},
        {text:"袭击" + npc.name, next:"_npc_attack_" + npcId, effect:{}},
        {text:"告辞离开", next:"_npc_leave", effect:{}},
      ]);
      return;
    }

    // 偷窃成功率：基于性格难度 + 好感度反加成
    const baseChance = 1 - npc.personality.stealDifficulty;
    const moodPenalty = npc.mood * 0.002; // 好感越高越容易
    const successChance = baseChance + moodPenalty * 0.5;
    const roll = Math.random();

    if (roll < successChance) {
      // 偷窃成功
      s.npcSteals = (s.npcSteals || 0) + 1;
      if (s.npcSteals === 1) Game.giveAchievement("npc_first_steal");

      let stolen = [];
      if (npc.items.length > 0) {
        const idx = Math.floor(Math.random() * npc.items.length);
        const itemId = npc.items.splice(idx, 1)[0];
        Game.addItem(itemId, 1);
        stolen.push(ITEMS[itemId].name);
      }
      if (npc.stones > 0 && Math.random() < 0.5) {
        const stolenStones = Math.floor(npc.stones * (0.3 + Math.random() * 0.3));
        npc.stones -= stolenStones;
        s.spiritStones += stolenStones;
        stolen.push(stolenStones + "灵石");
      }

      UI.renderNarrative([
        {type:"narration",content:"你趁" + npc.name + "不注意，悄悄伸手……"},
        {type:"reward",content:"🎉 偷窃成功！获得：" + stolen.join("，")},
        {type:"narration",content:"对方似乎并未察觉。"},
      ]);
    } else {
      // 偷窃失败
      npc.mood = Math.max(0, npc.mood - 40);
      const retaliate = Math.random() < npc.personality.attackRetaliate;
      if (retaliate) {
        UI.renderNarrative([
          {type:"danger",content:"你伸手之际，" + npc.name + "猛然回头，目光如电！"},
          {type:"dialogue",content:"「大胆！竟敢对" + npc.title + "动手动脚！」"},
          {type:"danger",content:npc.name + "怒火中烧，向你发起了攻击！好感度骤降至" + npc.mood},
        ]);
        // 触发战斗
        const enemy = {
          name: npc.name + "（" + npc.cultName + "）",
          hp: npc.hp, atk: npc.atk, def: npc.def,
          exp: Math.floor(CULT_LEVELS[npc.cultLevel].maxExp * 0.1),
          stone: npc.stones, drop: npc.items[0] || null, dropRate: 0.5,
        };
        Game.combatState = {
          enemy: enemy, enemyHp: enemy.hp, enemyMaxHp: enemy.hp,
          onWin: "_npc_victory_" + npcId, onLose: "_npc_defeat_" + npcId,
          turn: 0, log: [], isNpc: true, npcId: npcId,
        };
        UI.showCombat(Game.combatState);
        Game.combatLog("遭遇" + enemy.name + "！战斗开始！", "system");
        return;
      } else {
        UI.renderNarrative([
          {type:"danger",content:"你的动作被发现了！"},
          {type:"dialogue",content:"「道友这是做什么？」" + npc.name + "不满地看着你。"},
          {type:"danger",content:"好感度-40（当前：" + npc.mood + "/100）"},
          {type:"narration",content:"" + npc.name + "转身离去，不再理你。"},
        ]);
        npc.mood = Math.max(0, npc.mood - 20);
      }
    }

    UI.renderChoices([
      {text:"📋 查看详情", next:"_npc_detail_" + npcId, effect:{}},
      {text:"告辞离开", next:"_npc_leave", effect:{}},
    ]);
  },

  // ===== 袭击NPC =====
  attackNPC(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) { UI.toast("此人已不在此处。", "danger"); return; }

    if (npc.isFriend) {
      UI.showModal("背叛道义",
        "<p style='text-align:center;color:var(--crimson-bright);'>⚠️ " + npc.name + "是你的好友！</p><p>你确定要袭击自己的朋友吗？这将导致严重的因果反噬。</p>",
        '<button class="btn-combat" onclick="UI.closeModal()">罢手</button>' +
        '<button class="btn-combat" style="border-color:var(--crimson);color:var(--crimson-bright)" onclick="UI.closeModal();WorldSystem.doAttackNPC(\'' + npcId + '\')">痛下杀手</button>'
      );
      return;
    }

    this.doAttackNPC(npcId);
  },

  doAttackNPC(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) return;

    UI.closeModal();
    UI.renderNarrative([
      {type:"danger",content:"你向" + npc.name + "发起了突袭！"},
      {type:"dialogue",content:"「你——！」" + npc.name + "猝不及防，仓促应战。"},
    ]);

    const enemy = {
      name: npc.name + "（" + npc.cultName + "）",
      hp: npc.hp, atk: npc.atk, def: npc.def,
      exp: Math.floor(CULT_LEVELS[npc.cultLevel].maxExp * 0.15),
      stone: npc.stones, drop: npc.items[0] || null, dropRate: 0.8,
    };
    Game.combatState = {
      enemy: enemy, enemyHp: enemy.hp, enemyMaxHp: enemy.hp,
      onWin: "_npc_victory_" + npcId, onLose: "_npc_defeat_" + npcId,
      turn: 0, log: [], isNpc: true, npcId: npcId,
    };
    UI.showCombat(Game.combatState);
    Game.combatLog("突袭" + enemy.name + "！", "system");
  },

  // ===== NPC战斗胜利 =====
  npcVictory(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc) { Game.wildVictory(); return; }

    // 使用扩展6的战败处理（逃跑/击杀/释放/俘虏）
    if (typeof WorldSystem.handleNPCDefeat === 'function') {
      WorldSystem.handleNPCDefeat(npcId);
      return;
    }

    // 兼容旧逻辑（如果没有扩展6）
    npc.isAlive = false;
    s.npcKills = (s.npcKills || 0) + 1;
    if (s.npcKills === 1) Game.giveAchievement("npc_first_kill");
    if (s.npcKills >= 5) Game.giveAchievement("npc_kill_5");

    // 获得NPC身上所有物品和灵石
    let texts = [
      {type:"narration",content:"你击败了" + npc.name + "！"},
    ];

    // 劫取物品
    npc.items.forEach(itemId => {
      Game.addItem(itemId, 1);
      texts.push({type:"reward",content:"📦 获得：" + ITEMS[itemId].name});
    });
    if (npc.stones > 0) {
      s.spiritStones += npc.stones;
      texts.push({type:"reward",content:"💎 获得" + npc.stones + "灵石"});
    }

    // 因果值增加
    s.karma = (s.karma || 0) + 2;
    if (npc.isFriend) {
      s.karma += 5;
      s.heartDemon = (s.heartDemon || 0) + 1;
      texts.push({type:"danger",content:"你杀害了自己的好友！因果值+7，心魔值+1"});
    } else {
      texts.push({type:"danger",content:"因果值+2"});
    }

    // 从好友列表中移除
    const fIdx = s.npcFriends.indexOf(npcId);
    if (fIdx >= 0) s.npcFriends.splice(fIdx, 1);

    texts.push({type:"narration",content:"你环顾四周，确认无人发现，整理战利品后继续前行。"});
    texts.push({type:"system_msg",content:"你可以继续探索或返回。"});

    // 更新支线进度
    if (typeof this.updateSideQuestProgress === 'function') {
      this.updateSideQuestProgress(s, "wild_victory");
    }

    // 检查地点任务：击败叛徒
    if (npc.isTraitorQuest && npc.questLocKey !== undefined && npc.questIdx !== undefined) {
      if (typeof this.completeLocationQuest === 'function') {
        this.completeLocationQuest(npc.questLocKey, npc.questIdx);
      }
    }

    UI.hideCombat();
    Game.combatState = null;
    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== NPC战斗失败 =====
  npcDefeat(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc) { Game.wildDefeat(); return; }

    // NPC掠夺玩家部分灵石
    const lostStones = Math.floor(s.spiritStones * 0.3);
    s.spiritStones -= lostStones;

    UI.hideCombat();
    Game.combatState = null;
    UI.renderNarrative([
      {type:"danger",content:"你被" + npc.name + "击败了！"},
      {type:"narration",content:"对方搜走了你" + lostStones + "灵石，扬长而去。"},
      {type:"danger",content:"损失" + lostStones + "灵石"},
      {type:"narration",content:"你需要恢复后才能继续行动。"},
    ]);
    UI.renderChoices([
      {text:"返回城镇", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 进入城镇 =====
  enterTown(townKey) {
    const s = Game.state;
    this.initWorldState(s);
    const town = TOWNS[townKey];
    if (!town) { UI.toast("未知的城镇。", "danger"); return; }

    // 检查修为
    if (CULT_LEVELS[s.cultLevel].stage < town.reqStage) {
      UI.toast("修为不足，无法进入" + town.name + "！", "danger");
      return;
    }

    // 记录访问
    if (!s.visitedTowns.includes(townKey)) {
      s.visitedTowns.push(townKey);
      if (s.visitedTowns.length >= 5) Game.giveAchievement("town_visitor");
    }
    s.location = town.name;
    // 清除场所上下文
    if (s.currentPlace) s.currentPlace = null;

    // 确保城镇有足够的NPC（含凡人、孩童）
    const regionKey = town.region || townKey;
    Game._lastMapRegion = regionKey;
    this.ensureAreaNPCs(s, regionKey);
    if (typeof this.initExpand5State === 'function') this.initExpand5State(s);
    if (typeof this.assignAreaPlaces === 'function') this.assignAreaPlaces(s, regionKey);
    // 检查到达地点的任务完成
    if (typeof this.checkLocationQuestOnArrive === 'function') this.checkLocationQuestOnArrive(regionKey);
    
    // 获取城镇中的NPC
    const townNPCs = this.getAreaNPCs(s, regionKey);

    let texts = [
      {type:"chapter_title",content:town.name},
      {type:"narration",content:town.desc},
    ];
    
    if (townNPCs.length > 0) {
      texts.push({type:"system_msg",content:"城中约有" + townNPCs.length + "人活动，其中修士、凡人、孩童皆有。"});
    }

    UI.closeModal();
    UI.renderNarrative(texts);

    // 生成选择
    const choices = [];
    
    // 主线推进选项（在正确地点满足条件时显示）
    if (typeof this.getMainQuestProgressionChoice === 'function') {
      const progChoice = this.getMainQuestProgressionChoice(regionKey);
      if (progChoice) choices.push(progChoice);
    }
    
    // 永久主线选项（始终可用）
    const pmainChoice = this.getPermanentMainChoice();
    if (pmainChoice) choices.push(pmainChoice);
    
    // 主线任务选项
    const mainQuestChoices = this.getMainQuestChoices(regionKey);
    mainQuestChoices.forEach(mc => choices.push(mc));
    
    // 商店
    town.shops.forEach(shopKey => {
      const shop = SHOPS[shopKey];
      if (shop) {
        choices.push({text:"前往" + shop.name + "（" + shopKey + "）", next:"_town_shop_" + shopKey, effect:{}});
      } else if (shopKey === "拍卖行") {
        choices.push({text:"前往拍卖行（参加拍卖会）", next:"_town_shop_拍卖行", effect:{}});
      }
    });

    // 前往各处（场所系统）
    if (typeof this.getLocationPlaces === 'function' && this.getLocationPlaces(regionKey).length > 0) {
      choices.push({text:"🏛️ 前往各处（民居/衙门/书院...）", next:"_place_panel_" + regionKey, effect:{}});
    }

    // 前往副本
    if (typeof LOCATION_DUNGEON_DEFS !== 'undefined' && LOCATION_DUNGEON_DEFS[regionKey]) {
      const dungeon = LOCATION_DUNGEON_DEFS[regionKey];
      const cultStage = CULT_LEVELS[s.cultLevel].stage;
      if (cultStage >= dungeon.reqStage) {
        choices.push({text:"🎪 前往副本：" + dungeon.name, next:"_loc_dungeon_enter_" + regionKey, effect:{}});
      }
    }

    // 任务面板
    if (typeof this.getLocationQuests === 'function') {
      const quests = this.getLocationQuests(regionKey);
      const activeQuests = (s.activeLocQuests || []).filter(q => q.locKey === regionKey);
      if (quests.length > 0 || activeQuests.length > 0) {
        choices.push({text:"📋 查看任务（可接" + quests.length + "/进行中" + activeQuests.length + "）", next:"_loc_quest_panel_" + regionKey, effect:{}});
      }
    }

    // NPC定位器
    if (typeof this.showNPCLocator === 'function') {
      choices.push({text:"🔍 寻找NPC（按地点查找）", next:"_npc_locator_", effect:{}});
    }

    // 客栈休息
    choices.push({text:"💤 在客栈休息", next:"_inn_panel", effect:{}});
    
    // 家园（如果在此城有家）
    if (typeof this.showHomePanel === 'function' && s.homes) {
      const hasHomeHere = Object.keys(s.homes).some(hk => s.homes[hk].townKey === townKey);
      if (hasHomeHere) {
        choices.push({text:"🏠 回到家园", next:"_home_panel", effect:{}});
      } else {
        // 购买土地
        choices.push({text:"🏠 购买土地建家", next:"_buy_home_" + townKey, effect:{}});
      }
    }

    // NPC交谈（显示前3个）
    const availableNPCs = townNPCs.slice(0, 3);
    availableNPCs.forEach(npc => {
      const genderStr = npc.isFemale ? "女" : "男";
      const cultStr = npc.cultLevel !== undefined ? npc.cultName : "凡人";
      const childStr = npc.isChild ? "孩童·" : "";
      choices.push({text:"与" + childStr + npc.name + "交谈（" + genderStr + "·" + cultStr + "）", next:"_npc_talk_" + npc.id, effect:{}});
    });
    if (townNPCs.length > 3) {
      choices.push({text:"查看更多城中居民（共" + townNPCs.length + "人）", next:"_npc_list_" + regionKey, effect:{}});
    }

    // 永久主线选项
    const pmainChoice2 = this.getPermanentMainChoice();
    if (pmainChoice2) choices.push(pmainChoice2);

    // 驿站快速移动
    choices.push({text:"🚂 前往驿站（快速移动）", next:"_carriage_panel", effect:{}});
    // 宗门排名
    if (typeof this.showSectRankingPanel === 'function') {
      choices.push({text:"🏯 宗门/家族排名", next:"_sect_ranking_panel", effect:{}});
    }

    // 城镇间快速移动：基于WORLD_MAP的connections，显示连通的城镇
    if (WORLD_MAP[regionKey] && WORLD_MAP[regionKey].connections) {
      const connectedTowns = [];
      WORLD_MAP[regionKey].connections.forEach(connKey => {
        // 检查连接地点是否对应一个城镇
        const connTownKey = Object.keys(TOWNS).find(t => TOWNS[t].region === connKey || t === connKey);
        if (connTownKey && TOWNS[connTownKey]) {
          const connTown = TOWNS[connTownKey];
          const connReqStage = connTown.reqStage;
          if (CULT_LEVELS[s.cultLevel].stage >= connReqStage) {
            connectedTowns.push({townKey: connTownKey, name: connTown.name, region: connTown.region});
          }
        }
      });
      if (connectedTowns.length > 0) {
        connectedTowns.forEach(ct => {
          choices.push({text:"🚶 前往" + ct.name, next:"_town_travel_" + ct.townKey, effect:{}});
        });
      }
    }

    choices.push({text:"离开城镇", next:"_town_leave", effect:{}});
    UI.renderChoices(choices);
    UI.updateAll();
  },

  // ===== 进入商店 =====
  enterShop(shopKey) {
    const shop = SHOPS[shopKey];
    if (!shop) return;

    const s = Game.state;

    if (shop.services) {
      // 服务型商店（客栈/茶馆）
      let html = '<div class="modal-section"><div class="modal-section-title">' + shop.name + '</div>';
      shop.services.forEach((svc, i) => {
        const canAfford = s.spiritStones >= svc.price;
        html += '<div class="modal-item-row" style="flex-direction:column;align-items:flex-start;">';
        html += '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;">';
        html += '<div><div style="color:var(--gold-bright);">' + svc.name + '</div>';
        html += '<div class="modal-item-desc">💎' + svc.price + '</div></div>';
        if (canAfford) {
          html += '<button class="btn-combat" style="font-size:0.75em;" onclick="WorldSystem.useService(\'' + shopKey + '\',' + i + ')">消费</button>';
        } else {
          html += '<span style="color:var(--crimson);font-size:0.8em;">灵石不足</span>';
        }
        html += '</div></div>';
      });
      html += '</div>';
      UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">离开</button>');
      s._currentShop = shopKey;
    } else {
      // 物品型商店
      let html = '<div class="modal-section"><div class="modal-section-title">' + shop.name + '</div>';
      shop.items.forEach((shopItem, i) => {
        const item = ITEMS[shopItem.id];
        if (!item) return;
        const canAfford = s.spiritStones >= shopItem.price;
        const gradeNames = ["","凡品","灵品","宝品","仙品","至宝"];
        html += '<div class="modal-item-row" style="flex-direction:column;align-items:flex-start;">';
        html += '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;">';
        html += '<div><div style="color:var(--gold-bright);">' + item.name + ' <span style="font-size:0.8em;color:var(--text-dim);">[' + (gradeNames[item.grade]||'') + ']</span></div>';
        html += '<div class="modal-item-desc">' + item.desc + '</div>';
        html += '<div class="modal-item-stats">';
        if (item.atk) html += '攻击+' + item.atk + ' ';
        if (item.def) html += '防御+' + item.def + ' ';
        if (item.spd) html += '速度+' + item.spd + ' ';
        if (item.maxMp) html += '灵力上限+' + item.maxMp + ' ';
        if (item.effect) {
          if (item.effect.hp) html += '恢复' + item.effect.hp + 'HP ';
          if (item.effect.mp) html += '恢复' + item.effect.mp + 'MP ';
        }
        html += '</div></div>';
        html += '<div style="text-align:right;">';
        html += '<div style="color:' + (canAfford ? 'var(--gold-bright)' : 'var(--crimson)') + ';">💎' + shopItem.price + '</div>';
        if (canAfford) {
          html += '<button class="btn-combat" style="font-size:0.75em;margin-top:4px;" onclick="WorldSystem.buyItem(' + i + ',\'' + shopKey + '\')">购买</button>';
        } else {
          html += '<span style="color:var(--text-dim);font-size:0.8em;">灵石不足</span>';
        }
        html += '</div></div></div>';
      });
      html += '</div>';
      UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">离开</button>');
      s._currentShop = shopKey;
    }
  },

  // ===== 购买商店物品 =====
  buyItem(index, shopKey) {
    const s = Game.state;
    const shop = SHOPS[shopKey];
    if (!shop || !shop.items || !shop.items[index]) return;
    const shopItem = shop.items[index];
    if (s.spiritStones < shopItem.price) { UI.toast("灵石不足！", "danger"); return; }
    s.spiritStones -= shopItem.price;
    Game.addItem(shopItem.id, 1);
    UI.toast("购买" + ITEMS[shopItem.id].name + "成功！", "success");
    UI.closeModal();
    setTimeout(()=>this.enterShop(shopKey), 100);
  },

  // ===== 使用商店服务 =====
  useService(shopKey, svcIndex) {
    const s = Game.state;
    const shop = SHOPS[shopKey];
    if (!shop || !shop.services || !shop.services[svcIndex]) return;
    const svc = shop.services[svcIndex];
    if (s.spiritStones < svc.price) { UI.toast("灵石不足！", "danger"); return; }
    s.spiritStones -= svc.price;

    if (svc.effect.hp === "full") s.hp = s.maxHp;
    if (svc.effect.mp === "full") s.mp = s.maxMp;
    if (svc.effect.exp) Game.gainExp(svc.effect.exp);
    if (svc.effect.comp) s.comp += svc.effect.comp;
    if (svc.effect.luck) s.luck += svc.effect.luck;
    if (svc.effect.info) {
      // 随机情报
      const infos = [
        "听说最近乱星海出现了蛟龙出没，不少修士前去猎杀。",
        "天南坊市城的拍卖会下个月就要开了，据说有上古法器。",
        "虚天殿外围最近不太平，有散修在那里失踪了。",
        "慕兰草原的战事吃紧，不少散修趁乱捡漏。",
        "坠魔谷深处传来了异动，可能有大机缘。",
        "最近有个邪修在附近活动，出门要小心。",
        "灵界的物价涨了不少，据说是因为仙劫将至。",
        "天界仙城来了个神秘老者，在出售仙丹。",
      ];
      UI.toast("📋 " + infos[Math.floor(Math.random() * infos.length)], "gold");
    }

    UI.toast(svc.name + "完毕！", "success");
    UI.updateAll();
    UI.closeModal();
    setTimeout(()=>this.enterShop(shopKey), 100);
  },

  // ===== 发现洞天福地 =====
  findCaveDwelling(areaKey) {
    const s = Game.state;
    this.initWorldState(s);

    const caveType = CAVE_DWELLING_TYPES[Math.floor(Math.random() * CAVE_DWELLING_TYPES.length)];
    const caveId = "cave_" + Date.now();
    const cave = {
      id: caveId,
      type: caveType.name,
      desc: caveType.desc,
      area: areaKey,
      expBonus: caveType.expBonus,
      stoneBonus: caveType.stoneBonus,
      itemChance: caveType.itemChance,
      itemPool: caveType.itemPool || null,
      hpRestore: caveType.hpRestore || false,
      explored: false,
    };

    s.foundCaves.push(cave);
    if (s.foundCaves.length === 1) Game.giveAchievement("cave_finder");

    let texts = [
      {type:"chapter_title",content:"🗺️ 发现" + caveType.name},
      {type:"narration",content:"你在" + areaKey + "探索时，意外发现了一处" + caveType.name + "！"},
      {type:"narration",content:caveType.desc},
    ];

    if (caveType.expBonus > 0) {
      Game.gainExp(caveType.expBonus);
      texts.push({type:"reward",content:"✨ 在此修炼获得" + caveType.expBonus + "经验"});
    }
    if (caveType.stoneBonus > 0) {
      s.spiritStones += caveType.stoneBonus;
      texts.push({type:"reward",content:"💎 获得" + caveType.stoneBonus + "灵石"});
    }
    if (caveType.hpRestore) {
      s.hp = s.maxHp;
      s.mp = s.maxMp;
      texts.push({type:"reward",content:"💚 饮用灵泉，气血灵力完全恢复"});
    }
    if (caveType.itemChance > 0 && Math.random() < caveType.itemChance) {
      const pool = caveType.itemPool || Object.keys(ITEMS).filter(k => ITEMS[k].type === "material" || ITEMS[k].type === "consumable");
      const itemId = pool[Math.floor(Math.random() * pool.length)];
      if (ITEMS[itemId]) {
        Game.addItem(itemId, 1);
        texts.push({type:"reward",content:"📦 获得：" + ITEMS[itemId].name});
      }
    }

    texts.push({type:"narration",content:"探索完毕，你可以继续探索或返回。"});
    cave.explored = true;

    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 显示NPC列表面板 =====
  showNPCListPanel(areaKey) {
    const s = Game.state;
    this.initWorldState(s);
    const loc = WORLD_MAP[areaKey];
    const areaName = loc ? loc.name : areaKey;
    const npcs = this.getAreaNPCs(s, areaKey);
    
    let html = '<div class="modal-section"><div class="modal-section-title">👥 ' + areaName + '的居民（' + npcs.length + '人）</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-bottom:12px;">点击NPC可上前交谈</p>';
    
    if (npcs.length === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;">此地暂无NPC</div>';
    } else {
      npcs.forEach(npc => {
        const genderStr = npc.isFemale ? "女" : "男";
        const cultStr = npc.cultLevel !== undefined ? npc.cultName : "凡人";
        const childStr = npc.isChild ? "👶 " : "";
        const friendStr = npc.isFriend ? "💚 " : "";
        const moodColor = npc.mood >= 80 ? "var(--jade-bright)" : npc.mood >= 50 ? "var(--gold-bright)" : "var(--text-dim)";
        
        html += '<div class="modal-item-row" onclick="UI.closeModal();Game.gotoNode(\'_npc_talk_' + npc.id + '\')" style="cursor:pointer;">';
        html += '<div><div style="color:' + moodColor + ';">' + friendStr + childStr + npc.title + npc.name;
        html += ' <span style="font-size:0.8em;color:var(--text-dim);">[' + genderStr + '·' + cultStr + '·好感' + (npc.mood >= 0 ? npc.mood : 50) + ']</span>';
        html += '</div>';
        html += '<div class="modal-item-desc">性格' + (npc.personality && npc.personality.type ? npc.personality.type : '普通') + '，' + (npc.action || "正在活动") + '</div>';
        html += '</div></div>';
      });
    }
    html += '</div>';
    
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },

  // ===== 任务系统：更新任务状态 =====
  updateQuests() {
    const s = Game.state;
    if (!s.activeQuests) s.activeQuests = [];
    if (!s.completedQuests) s.completedQuests = [];

    // 添加初始任务
    if (s.activeQuests.length === 0) {
      s.activeQuests.push("main_start");
    }

    // 自动检测可接取的任务
    Object.keys(QUESTS).forEach(questId => {
      const quest = QUESTS[questId];
      if (s.completedQuests.includes(questId)) return;
      if (s.activeQuests.includes(questId)) return;
      // 主线任务自动推进
      if (quest.type === "main" && quest.reqStage !== undefined) {
        if (CULT_LEVELS[s.cultLevel].stage >= quest.reqStage) {
          s.activeQuests.push(questId);
        }
      }
    });

    // 检查扩展系统任务
    if (typeof this.checkExpandQuests === 'function') {
      this.checkExpandQuests();
    }

    // 检查任务完成
    s.activeQuests.forEach(questId => {
      if (s.completedQuests.includes(questId)) return;
      const quest = QUESTS[questId];
      if (!quest) return;
      if (this.checkQuestComplete(questId, quest)) {
        s.completedQuests.push(questId);
        s.activeQuests = s.activeQuests.filter(q => q !== questId);
        // 奖励
        const reward = Math.floor(100 * (CULT_LEVELS[s.cultLevel].stage + 1));
        s.spiritStones += reward;
        Game.gainExp(reward * 2);
        UI.toast("📋 任务完成：" + quest.name + "！获得" + reward + "灵石和" + (reward*2) + "经验。", "gold");
      }
    });
  },

  checkQuestComplete(questId, quest) {
    const s = Game.state;
    switch(questId) {
      case "main_start": return s.flags.joined_seven_profound || s.cultLevel >= 1;
      case "main_foundation": return CULT_LEVELS[s.cultLevel].stage >= 1;
      case "main_tiannan": return s.visitedTowns && s.visitedTowns.length >= 1;
      case "main_core": return CULT_LEVELS[s.cultLevel].stage >= 2;
      case "main_luanxing": return s.location && s.location.includes("乱星海");
      case "main_infant": return CULT_LEVELS[s.cultLevel].stage >= 3;
      case "main_ascension": return CULT_LEVELS[s.cultLevel].stage >= 4;
      case "side_first_kill": return (s.wildBattlesWon || 0) >= 1;
      case "side_explorer": return (s.wildExploreCount || 0) >= 10;
      case "side_farmer": return (s.farmHarvestCount || 0) >= 1;
      case "side_npc_friend": return (s.npcFriends || []).length >= 3;
      case "side_npc_kill": return (s.npcKills || 0) >= 1;
      case "side_steal": return (s.npcSteals || 0) >= 1;
      case "side_rich": return s.spiritStones >= 5000;
      case "side_town_visit": return (s.visitedTowns || []).length >= 5;
      case "side_gu_collect": return (s.guWorms || []).length >= 3;
      case "side_companion_2": return (s.companions || []).length >= 2;
      default: return false;
    }
  },

  // ===== 显示任务面板 =====
  showQuestPanel() {
    // 使用增强版任务面板（包含地点任务）
    if (typeof this.showEnhancedQuestPanel === 'function') {
      this.showEnhancedQuestPanel();
      return;
    }
    const s = Game.state;
    this.initWorldState(s);
    this.updateQuests();

    let html = '<div class="modal-section"><div class="modal-section-title">📋 当前任务（' + s.activeQuests.length + '）</div>';
    if (s.activeQuests.length === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;">暂无进行中的任务</div>';
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

  // ===== 显示世界地图（可视化） =====
  showWorldMap() {
    const s = Game.state;
    let html = '<div class="modal-section"><div class="modal-section-title">🗺️ 天下地图</div>';
    html += '<div class="world-map-container">';

    // 生成SVG地图
    html += '<svg viewBox="0 0 100 90" class="world-map-svg" preserveAspectRatio="xMidYMid meet">';
    
    // 绘制连接线
    Object.keys(WORLD_MAP).forEach(key => {
      const loc = WORLD_MAP[key];
      if (!loc.connections) return;
      loc.connections.forEach(connKey => {
        const conn = WORLD_MAP[connKey];
        if (!conn) return;
        const isAccessible = CULT_LEVELS[s.cultLevel].stage >= loc.reqStage;
        html += '<line x1="' + loc.x + '" y1="' + loc.y + '" x2="' + conn.x + '" y2="' + conn.y + '" stroke="' + (isAccessible ? 'rgba(240,199,94,0.4)' : 'rgba(100,100,100,0.2)') + '" stroke-width="0.5" stroke-dasharray="1.5,1"/>';
      });
    });

    // 绘制地点
    Object.keys(WORLD_MAP).forEach(key => {
      const loc = WORLD_MAP[key];
      const isHere = s.location === loc.name || s.location === key;
      const canGo = CULT_LEVELS[s.cultLevel].stage >= loc.reqStage;
      const isTown = Object.keys(TOWNS).some(t => TOWNS[t].region === key);
      const locType = loc.type;
      let icon = "📍";
      let color = "#f0c75e";
      if (locType === "sect") { icon = "🏯"; color = "#7dd4a0"; }
      else if (locType === "city") { icon = "🏘️"; color = "#5b9bd5"; }
      else if (locType === "wild") { icon = "🌲"; color = "#8B7355"; }
      else if (locType === "sea") { icon = "🌊"; color = "#4a90d9"; }
      else if (locType === "ruins") { icon = "🏛️"; color = "#9b6dd4"; }
      else if (locType === "warzone") { icon = "⚔️"; color = "#d4574a"; }
      else if (locType === "danger") { icon = "🌋"; color = "#c0392b"; }
      else if (locType === "portal") { icon = "🌀"; color = "#9b6dd4"; }
      else if (locType === "realm") { icon = "🌟"; color = "#f0c75e"; }

      const opacity = canGo ? 1 : 0.3;
      const fillOpacity = isHere ? 0.6 : 0.15;

      // 地点圆圈
      html += '<circle cx="' + loc.x + '" cy="' + loc.y + '" r="' + (isHere ? 3.5 : 2.5) + '" fill="' + color + '" fill-opacity="' + fillOpacity + '" stroke="' + color + '" stroke-width="0.6" opacity="' + opacity + '" style="cursor:' + (canGo ? 'pointer' : 'not-allowed') + '" onclick="WorldSystem.travelTo(\'' + key + '\')"/>';

      // 地点名
      html += '<text x="' + loc.x + '" y="' + (loc.y - 4) + '" text-anchor="middle" font-size="2.8" fill="' + (canGo ? '#e8d8b8' : '#666') + '" opacity="' + opacity + '">' + loc.name + '</text>';

      // 当前位置标记
      if (isHere) {
        html += '<circle cx="' + loc.x + '" cy="' + loc.y + '" r="5" fill="none" stroke="#f0c75e" stroke-width="0.4" opacity="0.6"><animate attributeName="r" values="3.5;6;3.5" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/></circle>';
      }
    });

    html += '</svg>';
    html += '</div>';

    // 地点列表
    html += '<div class="modal-section" style="margin-top:12px;"><div class="modal-section-title">可前往地点</div>';
    Object.keys(WORLD_MAP).forEach(key => {
      const loc = WORLD_MAP[key];
      const canGo = CULT_LEVELS[s.cultLevel].stage >= loc.reqStage;
      const isHere = s.location === loc.name || s.location === key;
      const hasTown = Object.keys(TOWNS).some(t => TOWNS[t].region === key);
      html += '<div class="modal-item-row" style="opacity:' + (canGo ? '1' : '0.4') + '" ' + (canGo && !isHere ? 'onclick="WorldSystem.travelTo(\'' + key + '\')"' : '') + '><div>';
      html += '<div style="color:' + (isHere ? 'var(--jade)' : (canGo ? 'var(--gold-bright)' : 'var(--text-dim)')) + '">';
      html += (isHere ? '📍 ' : '') + loc.name;
      if (!canGo) html += '（需' + STAGE_NAMES[loc.reqStage] + '）';
      if (hasTown && canGo) html += ' 🏘️';
      html += '</div>';
      html += '<div class="modal-item-desc">' + loc.desc + '</div>';
      // 子区域
      if (canGo && loc.subAreas) {
        html += '<div class="modal-item-stats">子区域：' + loc.subAreas.join('、') + '</div>';
      }
      html += '</div></div>';
    });
    html += '</div>';

    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal();WorldSystem.showNPCTrackerPanel()">👥 道侣定位</button> <button class="btn-combat" onclick="UI.closeModal();WorldSystem.showCarriagePanel()">🚂 驿站</button> <button class="btn-combat" onclick="UI.closeModal();WorldSystem.showSectRankingPanel()">🏯 宗门排名</button> <button class="btn-combat" onclick="UI.closeModal();WorldSystem.showNewStoryNPCPanel()">📜 剧情NPC</button> <button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },

  // ===== 旅行到地点 =====
  travelTo(locKey) {
    // 使用带时间消耗的旅行系统
    if (typeof this.travelToWithTime === 'function') {
      this.travelToWithTime(locKey);
    } else {
      this._travelToLegacy(locKey);
    }
  },

  _travelToLegacy(locKey) {
    const s = Game.state;
    const loc = WORLD_MAP[locKey];
    if (!loc) return;
    if (CULT_LEVELS[s.cultLevel].stage < loc.reqStage) {
      UI.toast("修为不足，无法前往" + loc.name + "！", "danger");
      return;
    }

    s.location = loc.name;
    UI.closeModal();
    UI.toast("前往" + loc.name, "success");
    
    // 初始化世界状态和扩展系统
    this.initWorldState(s);
    
    // 确保该区域有足够的NPC
    this.ensureAreaNPCs(s, locKey);

    // 判断是否有城镇
    const townKey = Object.keys(TOWNS).find(t => TOWNS[t].region === locKey);
    
    let texts = [
      {type:"narration",content:"你来到了" + loc.name + "。"},
      {type:"narration",content:loc.desc},
    ];

    // 有概率发现洞天福地
    if (loc.type === "wild" || loc.type === "sea" || loc.type === "ruins" || loc.type === "danger") {
      if (Math.random() < 0.2) {
        // 40%概率发现增强洞天（有强敌）
        if (Math.random() < 0.4 && typeof this.findEnhancedCave === 'function') {
          this.findEnhancedCave(loc.name);
        } else {
          this.findCaveDwelling(loc.name);
        }
        return;
      }
    }

    // 显示当前区域的NPC数量
    const areaNPCs = this.getAreaNPCs(s, locKey);
    if (areaNPCs.length > 0) {
      texts.push({type:"system_msg",content:"此地约有" + areaNPCs.length + "人活动。"});
    }

    UI.renderNarrative(texts);
    
    const choices = [];
    
    // 永久主线选项（始终可用）
    const pmainChoice = this.getPermanentMainChoice();
    if (pmainChoice) choices.push(pmainChoice);
    
    // 主线任务选项（始终可用，防止换地图后主线消失）
    const mainQuestChoices = this.getMainQuestChoices(locKey);
    mainQuestChoices.forEach(mc => choices.push(mc));
    
    if (townKey) {
      choices.push({text:"进入" + TOWNS[townKey].name, next:"_town_enter_" + townKey, effect:{}});
    }

    // 前往各处（场所系统）
    if (typeof this.getLocationPlaces === 'function' && this.getLocationPlaces(locKey).length > 0) {
      choices.push({text:"🏛️ 前往各处", next:"_place_panel_" + locKey, effect:{}});
    }

    // 前往副本
    if (typeof LOCATION_DUNGEON_DEFS !== 'undefined' && LOCATION_DUNGEON_DEFS[locKey]) {
      const dungeon = LOCATION_DUNGEON_DEFS[locKey];
      const cultStage = CULT_LEVELS[s.cultLevel].stage;
      if (cultStage >= dungeon.reqStage) {
        choices.push({text:"🎪 前往副本：" + dungeon.name, next:"_loc_dungeon_enter_" + locKey, effect:{}});
      }
    }

    // 任务面板
    if (typeof this.getLocationQuests === 'function') {
      const quests = this.getLocationQuests(locKey);
      const activeQuests = (s.activeLocQuests || []).filter(q => q.locKey === locKey);
      if (quests.length > 0 || activeQuests.length > 0) {
        choices.push({text:"📋 查看任务", next:"_loc_quest_panel_" + locKey, effect:{}});
      }
    }

    // NPC定位器
    if (typeof this.showNPCLocator === 'function') {
      choices.push({text:"🔍 寻找NPC", next:"_npc_locator_", effect:{}});
    }
    
    // 野外探索选项
    if (loc.type === "wild" || loc.type === "sea" || loc.type === "ruins" || loc.type === "danger" || loc.type === "warzone") {
      choices.push({text:"探索" + loc.name, next:"_wild_explore_" + locKey, effect:{}});
    }
    
    // 与NPC交谈选项（显示前3个NPC）
    const availableNPCs = areaNPCs.slice(0, 3);
    availableNPCs.forEach(npc => {
      const genderStr = npc.isFemale ? "女" : "男";
      const cultStr = npc.cultLevel !== undefined ? npc.cultName : "凡人";
      choices.push({text:"与" + npc.name + "交谈（" + genderStr + "·" + cultStr + "）", next:"_npc_talk_" + npc.id, effect:{}});
    });
    if (areaNPCs.length > 3) {
      choices.push({text:"查看更多NPC（共" + areaNPCs.length + "人）", next:"_npc_list_" + locKey, effect:{}});
    }
    
    choices.push({text:"打开地图", next:"_open_map", effect:{}});
    choices.push({text:"返回", next:"_wild_return", effect:{}});
    UI.renderChoices(choices);
    UI.updateAll();
  },

  // ===== 野外探索（整合NPC系统） =====
  exploreArea(areaKey) {
    const s = Game.state;
    const loc = WORLD_MAP[areaKey];
    if (!loc) { Game.exploreWilderness(areaKey); return; }

    this.initWorldState(s);
    if (typeof this.initExpand4State === 'function') this.initExpand4State(s);
    
    // 设置当前野外区域（探索连续性）
    if (typeof this.setCurrentWilderness === 'function') {
      this.setCurrentWilderness(areaKey);
    }
    
    s.wildExploreCount = (s.wildExploreCount || 0) + 1;
    if (s.wildExploreCount === 1) Game.giveAchievement("explorer");
    if (s.wildExploreCount >= 10) Game.giveAchievement("explorer");

    s.location = loc.name;
    this.advanceDays(1);

    // 初始化扩展2状态
    if (typeof this.initExpand2State === 'function') this.initExpand2State(s);

    // 检查伏击者袭击
    if (typeof this.checkAmbush === 'function' && this.checkAmbush()) return;

    // 确保有NPC（大批量）
    this.ensureAreaNPCs(s, areaKey);
    
    // 生成支线NPC（扩展4）
    if (typeof this.ensureSideQuestNPCs === 'function') {
      this.ensureSideQuestNPCs(s, areaKey);
    }

    const roll = Math.random();

    // 机缘/悟性事件检查（扩展7）
    if (typeof this.checkLuckCompEvent === 'function' && this.checkLuckCompEvent()) return;

    // 友好度事件检查（扩展7：8%概率遇到宗门/家族成员求助）
    if (roll >= 0.05 && roll < 0.13 && typeof this.triggerFriendlyEncounter === 'function') {
      if (this.triggerFriendlyEncounter(loc.name)) return;
    }

    // 5%概率发现灵山
    if (roll < 0.05 && typeof this.discoverWildSpiritMountain === 'function') {
      this.discoverWildSpiritMountain();
      return;
    }

    // 15%概率遇到新增剧情NPC（提升剧情NPC出现权重）
    if (roll >= 0.05 && roll < 0.20 && typeof NEW_STORY_NPCS !== 'undefined' && typeof this.getNewStoryNPCLocation === 'function') {
      const cultStage = CULT_LEVELS[s.cultLevel].stage;
      const availableNewNPCs = Object.keys(NEW_STORY_NPCS).filter(npcId => {
        const locInfo = this.getNewStoryNPCLocation(npcId, s);
        return locInfo && (locInfo.area === loc.name || locInfo.area === areaKey);
      });
      if (availableNewNPCs.length > 0) {
        const npcId = availableNewNPCs[Math.floor(Math.random() * availableNewNPCs.length)];
        const snpc = NEW_STORY_NPCS[npcId];
        const locInfo = this.getNewStoryNPCLocation(npcId, s);
        UI.renderNarrative([
          {type:"narration", content:"你在" + (locInfo.subArea || loc.name) + "探索时，遇到了一位" + (snpc.isFemale ? "女修" : "男修") + "——" + snpc.name + "。"},
          {type:"narration", content: snpc.desc + "，" + (locInfo.desc || "")},
        ]);
        UI.renderChoices([
          {text:"上前交谈", next:"_interact_new_story_" + npcId, effect:{}},
          {text:"绕道而行", next:"_wild_continue", effect:{}},
        ]);
        return;
      }
    }

    // 10%概率发现新副本
    if (roll >= 0.13 && roll < 0.18 && typeof this.exploreNewDungeon === 'function') {
      this.exploreNewDungeon(areaKey);
      return;
    }

    if (roll < 0.30) {
      // 遇到NPC（从已有的NPC中随机选一个）
      const areaNPCs = this.getAreaNPCs(s, areaKey);
      if (areaNPCs.length > 0) {
        const npc = areaNPCs[Math.floor(Math.random() * Math.min(areaNPCs.length, 20))];
        const genderStr = npc.isFemale ? "女修" : "男修";
        const cultStr = npc.cultLevel !== undefined ? npc.cultName : "凡人";
        const childStr = npc.isChild ? "（孩童）" : "";
        
        UI.renderNarrative([
          {type:"narration",content:"你在" + loc.name + "探索时，遇到了一位" + genderStr + childStr + "。"},
          {type:"narration",content:"对方" + (npc.action || "正在活动") + "，" + (npc.cultLevel !== undefined ? "修为似乎在" + cultStr + "左右，" : "看起来是普通凡人，") + "性格" + npc.personality.type + "。"},
          {type:"dialogue",content:"「" + npc.title + npc.name + "。」对方自我介绍道。"},
        ]);
        UI.renderChoices([
          {text:"上前交谈", next:"_npc_talk_" + npc.id, effect:{}},
          {text:"尝试偷窃", next:"_npc_steal_" + npc.id, effect:{}},
          {text:"袭击" + npc.name, next:"_npc_attack_" + npc.id, effect:{}},
          {text:"绕道而行", next:"_wild_continue", effect:{}},
        ]);
      } else {
        // 没有NPC，触发敌人或事件
        Game.exploreWilderness(areaKey);
      }
    } else if (roll < 0.50) {
      // 遇到敌人
      Game.exploreWilderness(areaKey);
    } else if (roll < 0.58) {
      // 发现普通洞天福地
      this.findCaveDwelling(loc.name);
    } else if (roll < 0.65) {
      // 发现增强洞天福地（有强敌）
      if (typeof this.findEnhancedCave === 'function') {
        this.findEnhancedCave(loc.name);
      } else {
        this.findCaveDwelling(loc.name);
      }
    } else {
      // 随机事件
      const event = Game.rollRandomEvent();
      Game.processRandomEvent(event, areaKey);
    }
  },

  // 推进天数（代理方法）
  advanceDays(days) {
    Game.advanceDays(days);
    // 剧情NPC随时间成长
    if (typeof this.ageStoryNPCs === 'function') {
      this.ageStoryNPCs(Game.state, days);
    }
  },

  // ===== 城镇面板 =====
  showTownPanel() {
    const s = Game.state;
    this.initWorldState(s);
    let html = '<div class="modal-section"><div class="modal-section-title">🏘️ 城镇列表</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-bottom:12px;">前往城镇可购买物品、休息、打听消息、遇到NPC修士</p>';
    Object.keys(TOWNS).forEach(key => {
      const town = TOWNS[key];
      const canGo = CULT_LEVELS[s.cultLevel].stage >= town.reqStage;
      const visited = s.visitedTowns.includes(key);
      html += '<div class="modal-item-row" style="opacity:' + (canGo ? '1' : '0.4') + '" ' + (canGo ? 'onclick="WorldSystem.enterTown(\'' + key + '\')"' : '') + '><div>';
      html += '<div style="color:' + (canGo ? 'var(--gold-bright)' : 'var(--text-dim)') + '">🏘️ ' + town.name;
      if (!canGo) html += '（需' + STAGE_NAMES[town.reqStage] + '）';
      if (visited) html += ' ✓';
      html += '</div>';
      html += '<div class="modal-item-desc">' + town.desc + '</div>';
      html += '<div class="modal-item-stats">商铺：' + town.shops.map(sk => {
        if (sk === "拍卖行") return "拍卖行";
        return SHOPS[sk] ? SHOPS[sk].name : sk;
      }).join('、') + '</div>';
      html += '</div></div>';
    });
    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },
};
