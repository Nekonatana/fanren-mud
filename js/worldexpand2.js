/* ====== 凡人修仙传MUD · 世界扩展2引擎（社交/忠贞/称号/宗门/洞天） ====== */

Object.assign(WorldSystem, {
  // ===== 初始化扩展2状态 =====
  initExpand2State(state) {
    if (!state.titles) state.titles = [];
    if (!state.activeTitle) state.activeTitle = null;
    if (!state.sectMembership) state.sectMembership = null; // {sectId, position, contribution, joinedDays}
    if (!state.ownSect) state.ownSect = null; // {name, members:[{npcId,role}], contribution, reputation}
    if (!state.reputation) state.reputation = 0;
    if (!state.poachedNPCs) state.poachedNPCs = 0;
    if (!state.deceivedCount) state.deceivedCount = 0;
    if (!state.secretDualCount) state.secretDualCount = 0;
    if (!state.enhancedCavesFound) state.enhancedCavesFound = 0;
    if (!state.ambushers) state.ambushers = []; // 被断绝关系的NPC列表，会袭击玩家
    if (!state.wildSpiritMountainsFound) state.wildSpiritMountainsFound = 0;
    if (!state.npcLoyaltyData) state.npcLoyaltyData = {}; // npcId -> {loyalty, lastAction, discovered}
  },

  // ===== 为NPC设置社交网络 =====
  setupNPCSocialNetwork(npc, state) {
    if (!npc.socialNetwork) {
      npc.socialNetwork = {
        spouse: null,        // {npcId, name, isFemale}
        familyMembers: [],   // [{npcId, name, relation}]
        relatives: [],       // [{name, relation, isFemale, age, cultLevel, isAlive}] (扩展7: 亲戚)
        friends: [],         // [{npcId, name}]
        rivals: [],          // [{npcId, name}]
      };

      // 30%概率有道侣
      if (Math.random() < 0.30 && !npc.isChild) {
        const spouseSurname = NPC_SURNAMES[Math.floor(Math.random() * NPC_SURNAMES.length)];
        const spouseGiven = npc.isFemale
          ? NPC_GIVEN_NAMES_M[Math.floor(Math.random() * NPC_GIVEN_NAMES_M.length)]
          : NPC_GIVEN_NAMES_F[Math.floor(Math.random() * NPC_GIVEN_NAMES_F.length)];
        const spouseTitle = NPC_TITLES[Math.floor(Math.random() * NPC_TITLES.length)];
        npc.socialNetwork.spouse = {
          npcId: null,
          name: spouseSurname + spouseGiven,
          title: spouseTitle,
          isFemale: !npc.isFemale,
          cultLevel: npc.cultLevel,
          personality: NPC_PERSONALITIES[Math.floor(Math.random() * NPC_PERSONALITIES.length)],
        };
        // 有道侣的NPC设置忠贞度
        npc.loyalty = 60 + Math.floor(Math.random() * 40); // 60-100
        npc.hasSpouse = true;
      } else {
        npc.loyalty = 100;
        npc.hasSpouse = false;
      }

      // 50%概率有亲友
      if (Math.random() < 0.50) {
        const relCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < relCount; i++) {
          const surname = NPC_SURNAMES[Math.floor(Math.random() * NPC_SURNAMES.length)];
          const isFemaleRel = Math.random() < 0.5;
          const given = isFemaleRel
            ? NPC_GIVEN_NAMES_F[Math.floor(Math.random() * NPC_GIVEN_NAMES_F.length)]
            : NPC_GIVEN_NAMES_M[Math.floor(Math.random() * NPC_GIVEN_NAMES_M.length)];
          const relType = Object.keys(NPC_SOCIAL_RELATIONS)[Math.floor(Math.random() * Object.keys(NPC_SOCIAL_RELATIONS).length)];
          npc.socialNetwork.familyMembers.push({
            name: surname + given,
            relation: NPC_SOCIAL_RELATIONS[relType].name,
            isFemale: isFemaleRel,
          });
        }
      }

      // 生成父母（每个NPC都有父母）
      var npcAge = npc.age || (Math.floor(Math.random() * 80) + 16);
      var parentAgeDiff = 20 + Math.floor(Math.random() * 6); // 20-25岁
      var npcStage = npc.cultLevel >= 0 ? CULT_LEVELS[npc.cultLevel].stage : 0;
      // 父亲
      var fatherSurname = NPC_SURNAMES[Math.floor(Math.random() * NPC_SURNAMES.length)];
      var fatherGiven = NPC_GIVEN_NAMES_M[Math.floor(Math.random() * NPC_GIVEN_NAMES_M.length)];
      var fatherCultLevel = npcStage;
      if (npcStage > 0) {
        // 修士父母境界较高：60%与NPC同级或高一级，40%低一级
        if (Math.random() < 0.6) fatherCultLevel = Math.min(npcStage + 1, CULT_LEVELS.length - 1);
        else fatherCultLevel = Math.max(0, npcStage - 1);
      } else {
        // 普通人父母有可能很低境界或不修炼
        fatherCultLevel = Math.random() < 0.3 ? 0 : -1;
      }
      var fatherAlive = Math.random() < 0.7; // 70%概率在世
      npc.socialNetwork.parents = npc.socialNetwork.parents || [];
      npc.socialNetwork.parents.push({
        name: fatherSurname + fatherGiven,
        relation: "父亲",
        isFemale: false,
        age: npcAge + parentAgeDiff,
        cultLevel: fatherCultLevel,
        isAlive: fatherAlive,
      });
      // 母亲
      var motherGiven = NPC_GIVEN_NAMES_F[Math.floor(Math.random() * NPC_GIVEN_NAMES_F.length)];
      var motherCultLevel = npcStage;
      if (npcStage > 0) {
        if (Math.random() < 0.6) motherCultLevel = Math.min(npcStage + 1, CULT_LEVELS.length - 1);
        else motherCultLevel = Math.max(0, npcStage - 1);
      } else {
        motherCultLevel = Math.random() < 0.3 ? 0 : -1;
      }
      var motherAlive = Math.random() < 0.7;
      npc.socialNetwork.parents.push({
        name: (npc.isFemale ? fatherSurname : NPC_SURNAMES[Math.floor(Math.random() * NPC_SURNAMES.length)]) + motherGiven,
        relation: "母亲",
        isFemale: true,
        age: npcAge + parentAgeDiff,
        cultLevel: motherCultLevel,
        isAlive: motherAlive,
      });

      // 义父母列表
      npc.socialNetwork.godparents = npc.socialNetwork.godparents || [];

      // 40%概率有朋友
      if (Math.random() < 0.40) {
        const friendCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < friendCount; i++) {
          const surname = NPC_SURNAMES[Math.floor(Math.random() * NPC_SURNAMES.length)];
          const isFemaleF = Math.random() < 0.5;
          const given = isFemaleF
            ? NPC_GIVEN_NAMES_F[Math.floor(Math.random() * NPC_GIVEN_NAMES_F.length)]
            : NPC_GIVEN_NAMES_M[Math.floor(Math.random() * NPC_GIVEN_NAMES_M.length)];
          npc.socialNetwork.friends.push({name: surname + given});
        }
      }

      // 15%概率有宿敌
      if (Math.random() < 0.15) {
        const surname = NPC_SURNAMES[Math.floor(Math.random() * NPC_SURNAMES.length)];
        const isFemaleR = Math.random() < 0.5;
        const given = isFemaleR
          ? NPC_GIVEN_NAMES_F[Math.floor(Math.random() * NPC_GIVEN_NAMES_F.length)]
          : NPC_GIVEN_NAMES_M[Math.floor(Math.random() * NPC_GIVEN_NAMES_M.length)];
        npc.socialNetwork.rivals.push({name: surname + given});
      }

      // 设置NPC所属宗门
      if (Math.random() < 0.40) {
        const sectKeys = Object.keys(SECTS_AND_FAMILIES);
        const sect = SECTS_AND_FAMILIES[sectKeys[Math.floor(Math.random() * sectKeys.length)]];
        if (CULT_LEVELS[npc.cultLevel].stage >= sect.reqStage) {
          npc.sectId = sectKeys[Math.floor(Math.random() * sectKeys.length)];
          npc.sectName = sect.name;
          // 根据修为决定职位
          if (CULT_LEVELS[npc.cultLevel].stage >= 5) npc.sectRole = "太上长老";
          else if (CULT_LEVELS[npc.cultLevel].stage >= 4) npc.sectRole = "护法长老";
          else if (CULT_LEVELS[npc.cultLevel].stage >= 3) npc.sectRole = "内门执事";
          else if (CULT_LEVELS[npc.cultLevel].stage >= 2) npc.sectRole = "内门弟子";
          else if (CULT_LEVELS[npc.cultLevel].stage >= 1) npc.sectRole = "外门执事";
          else npc.sectRole = "外门弟子";
        }
      }
    }
    return npc;
  },

  // ===== 检查并授予称号 =====
  checkTitles() {
    const s = Game.state;
    this.initExpand2State(s);
    let newTitles = [];

    Object.keys(TITLES).forEach(titleId => {
      if (s.titles.includes(titleId)) return;
      const title = TITLES[titleId];
      let earned = false;
      const cond = title.condition;

      if (cond.startsWith("cultLevel>=")) {
        earned = s.cultLevel >= parseInt(cond.split(">=")[1]);
      } else if (cond === "npcKills>=10") {
        earned = (s.npcKills || 0) >= 10;
      } else if (cond === "spiritStones>=10000") {
        earned = s.spiritStones >= 10000;
      } else if (cond === "spouses>=1") {
        earned = (s.spouses || []).length >= 1;
      } else if (cond === "offspring>=1") {
        earned = (s.offspring || []).length >= 1;
      } else if (cond === "spiritMountain") {
        earned = !!s.spiritMountain;
      } else if (cond === "ownSect") {
        earned = !!s.ownSect;
      } else if (cond === "deceived") {
        earned = (s.deceivedCount || 0) >= 1;
      } else if (cond === "secretDual") {
        earned = (s.secretDualCount || 0) >= 1;
      } else if (cond === "sectLeader") {
        earned = (s.sectMembership && s.sectMembership.position >= 6) || (s.ownSect != null);
      } else if (cond === "cavesFound>=10") {
        earned = (s.foundCaves || []).length >= 10;
      } else if (cond === "pets>=3") {
        earned = (s.spiritPets || []).length >= 3;
      } else if (cond === "reputation>=1000") {
        earned = (s.reputation || 0) >= 1000;
      } else if (cond === "poached>=3") {
        earned = (s.poachedNPCs || 0) >= 3;
      }

      if (earned) {
        s.titles.push(titleId);
        newTitles.push(title);
      }
    });

    if (newTitles.length > 0) {
      newTitles.forEach(t => {
        UI.toast(t.icon + " 获得称号：「" + t.name + "」", "gold");
      });
    }
  },

  // ===== 显示称号面板 =====
  showTitlePanel() {
    const s = Game.state;
    this.initExpand2State(s);
    this.checkTitles();

    let html = '<div class="modal-section"><div class="modal-section-title">🏅 称号系统</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-bottom:12px;">获得称号后可在角色面板展示</p>';

    if (s.titles.length === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;">暂无称号，继续修炼以获得更多称号。</div>';
    } else {
      s.titles.forEach(titleId => {
        const title = TITLES[titleId];
        if (!title) return;
        const isActive = s.activeTitle === titleId;
        html += '<div class="modal-item-row" style="cursor:pointer;" onclick="WorldSystem.setActiveTitle(\'' + titleId + '\')">';
        html += '<div><div style="color:' + (isActive ? 'var(--gold-bright)' : 'var(--text-main)') + ';">';
        html += title.icon + ' ' + title.name;
        if (isActive) html += ' <span style="color:var(--jade-bright);font-size:0.8em;">[当前展示]</span>';
        html += '</div>';
        html += '<div class="modal-item-desc">' + title.desc + '</div>';
        html += '</div></div>';
      });
    }
    html += '</div>';

    // 未获得称号
    const unearned = Object.keys(TITLES).filter(t => !s.titles.includes(t));
    if (unearned.length > 0) {
      html += '<div class="modal-section"><div class="modal-section-title">🔒 未获得称号（' + unearned.length + '）</div>';
      unearned.forEach(titleId => {
        const title = TITLES[titleId];
        html += '<div class="modal-item-row" style="opacity:0.5;"><div>';
        html += '<div style="color:var(--text-dim);">' + title.icon + ' ???</div>';
        html += '<div class="modal-item-desc">条件未满足</div>';
        html += '</div></div>';
      });
      html += '</div>';
    }

    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },

  // ===== 设置当前展示称号 =====
  setActiveTitle(titleId) {
    const s = Game.state;
    if (s.titles.includes(titleId)) {
      s.activeTitle = s.activeTitle === titleId ? null : titleId;
      const title = TITLES[titleId];
      UI.toast(title.icon + " 称号已" + (s.activeTitle ? "展示" : "隐藏"), "success");
      this.showTitlePanel();
    }
  },

  // ===== 哄骗NPC断绝道侣关系 =====
  deceiveNPC(npcId) {
    const s = Game.state;
    this.initExpand2State(s);
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) { UI.toast("此人已不在此处。", "danger"); return; }

    // 检查条件
    if (npc.mood < 100) {
      UI.renderNarrative([
        {type:"danger",content:"好感度不足100，无法哄骗" + npc.name + "。当前好感度：" + npc.mood + "/100"},
      ]);
      UI.renderChoices([
        {text:"继续交谈", next:"_npc_talk_" + npcId, effect:{}},
        {text:"告辞离开", next:"_npc_leave", effect:{}},
      ]);
      return;
    }

    if (!npc.hasSpouse) {
      UI.renderNarrative([
        {type:"narration",content:npc.name + "并没有道侣，无需哄骗。"},
      ]);
      UI.renderChoices([
        {text:"提出结为道侣", next:"_npc_marry_" + npcId, effect:{}},
        {text:"继续交谈", next:"_npc_talk_" + npcId, effect:{}},
        {text:"告辞离开", next:"_npc_leave", effect:{}},
      ]);
      return;
    }

    // 检查性别
    if (!npc.isFemale !== !s.isFemale) {
      UI.renderNarrative([
        {type:"danger",content:"只能对异性NPC使用此手段。"},
      ]);
      UI.renderChoices([
        {text:"继续交谈", next:"_npc_talk_" + npcId, effect:{}},
        {text:"告辞离开", next:"_npc_leave", effect:{}},
      ]);
      return;
    }

    const spouseInfo = npc.socialNetwork.spouse;
    const successChance = 0.7 + (npc.mood - 100) * 0.01 + (npc.loyalty < 50 ? 0.2 : 0);
    const success = Math.random() < successChance;

    if (success) {
      // 成功哄骗
      npc.hasSpouse = false;
      npc.socialNetwork.spouse = null;
      npc.loyalty = Math.max(-100, npc.loyalty - 30);
      s.deceivedCount = (s.deceivedCount || 0) + 1;

      // 创建被断绝关系的NPC（成为仇敌/伏击者）
      const enemyId = "enemy_npc_" + Date.now();
      const enemyNPC = {
        id: enemyId,
        name: spouseInfo.name,
        title: spouseInfo.title || "",
        isFemale: spouseInfo.isFemale,
        cultLevel: spouseInfo.cultLevel || npc.cultLevel,
        cultName: spouseInfo.cultLevel !== undefined ? CULT_LEVELS[spouseInfo.cultLevel].name : npc.cultName,
        personality: spouseInfo.personality || NPC_PERSONALITIES[0],
        hp: npc.hp * 1.5,
        maxHp: npc.hp * 1.5,
        atk: npc.atk * 1.3,
        def: npc.def * 1.2,
        mood: -1000,
        isAlive: true,
        isFriend: false,
        area: npc.area,
        isAmbusher: true,
        targetPlayer: true,
        ambushChance: 0.3,
      };
      s.npcList.push(enemyNPC);
      s.ambushers.push(enemyId);

      // 与原道侣断绝关系后，该NPC可以与玩家结为道侣
      npc.mood = Math.max(80, npc.mood); // 确保好感度足够提亲
      npc.deceived = true; // 标记为哄骗过，后续可无视好感度结为道侣

      UI.renderNarrative([
        {type:"chapter_title",content:"💔 哄骗成功"},
        {type:"narration",content:"你用甜言蜜语和承诺打动了" + npc.name + "，对方终于决定与道侣" + spouseInfo.name + "断绝关系！"},
        {type:"dialogue",content:"「你说的对……或许我们才是命中注定的人。」" + npc.name + "眼中闪过一丝决然。"},
        {type:"danger",content:"⚠️ " + spouseInfo.name + "得知此事后，对你恨之入骨！好感度-1000！"},
        {type:"danger",content:"⚠️ " + spouseInfo.name + "将会在你探索时伺机袭击你！"},
        {type:"system_msg",content:npc.name + "已与道侣断绝关系，现在可以提出结为道侣。"},
      ]);
      this.checkTitles();
      UI.renderChoices([
        {text:"💍 提出结为道侣", next:"_npc_marry_" + npcId, effect:{}},
        {text:"继续交谈", next:"_npc_talk_" + npcId, effect:{}},
        {text:"告辞离开", next:"_npc_leave", effect:{}},
      ]);
    } else {
      // 哄骗失败
      npc.mood = Math.max(0, npc.mood - 30);
      npc.loyalty = Math.max(-100, npc.loyalty - 10);
      UI.renderNarrative([
        {type:"danger",content:"你的哄骗失败了！"},
        {type:"dialogue",content:"「你这是何意？！我与道侣情深意重，岂会受你蛊惑！」" + npc.name + "怒斥道。"},
        {type:"danger",content:"好感度-30（当前：" + npc.mood + "/100），忠贞度-10"},
      ]);
      UI.renderChoices([
        {text:"继续交谈", next:"_npc_talk_" + npcId, effect:{}},
        {text:"告辞离开", next:"_npc_leave", effect:{}},
      ]);
    }
    UI.updateAll();
  },

  // ===== 降低NPC忠贞度 =====
  showLowerLoyaltyPanel(npcId) {
    const s = Game.state;
    this.initExpand2State(s);
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) { UI.toast("此人已不在此处。", "danger"); return; }

    if (!npc.hasSpouse && (npc.loyalty === undefined || npc.loyalty >= 100)) {
      UI.toast(npc.name + "没有道侣，无需降低忠贞度。", "info");
      return;
    }

    var loyaltyVal = (npc.loyalty !== undefined ? npc.loyalty : 100);
    var loyaltyColor = loyaltyVal <= 0 ? 'var(--crimson-bright)' : (loyaltyVal <= 50 ? 'var(--crimson)' : 'var(--jade-bright)');
    let html = '<div class="modal-section"><div class="modal-section-title">🔓 降低忠贞度</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;">当前忠贞度：<span style="color:' + loyaltyColor + ';font-weight:bold;">' + loyaltyVal + '</span> <span style="font-size:0.8em;">（范围 -100 ~ 100）</span></p>';
    if (loyaltyVal <= 0) {
      html += '<p style="text-align:center;color:var(--crimson-bright);font-size:0.8em;">⚠️ 忠贞已尽失！</p>';
    }

    Object.keys(LOYALTY_ACTIONS).forEach(actionId => {
      const action = LOYALTY_ACTIONS[actionId];
      let canDo = true;
      let reason = "";
      if (action.reqMood && npc.mood < action.reqMood) { canDo = false; reason = "好感度不足"; }
      if (action.needItem) {
        const hasItem = (s.inventory || []).some(inv => inv.id === action.needItem);
        if (!hasItem) { canDo = false; reason = "缺少" + (ITEMS[action.needItem] ? ITEMS[action.needItem].name : "物品"); }
      }
      if (action.reqCultGap && s.cultLevel - npc.cultLevel < action.reqCultGap) { canDo = false; reason = "修为差距不足"; }

      html += '<div class="modal-item-row" style="' + (canDo ? '' : 'opacity:0.5;') + '">';
      html += '<div><div style="color:var(--gold-bright);">' + action.name + ' <span style="font-size:0.8em;color:var(--crimson-bright);">忠贞-' + action.loyaltyReduction + '</span></div>';
      html += '<div class="modal-item-desc">' + action.desc + '</div>';
      html += '</div>';
      if (canDo) {
        html += '<button class="btn-combat" style="font-size:0.75em;" onclick="WorldSystem.lowerLoyalty(\'' + npcId + '\',\'' + actionId + '\')">执行</button>';
      } else {
        html += '<span style="color:var(--text-dim);font-size:0.8em;">' + reason + '</span>';
      }
      html += '</div>';
    });
    html += '</div>';

    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal();Game.gotoNode(\'_npc_talk_' + npcId + '\')">返回</button>');
  },

  // ===== 执行降低忠贞度行为 =====
  lowerLoyalty(npcId, actionId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) return;

    const action = LOYALTY_ACTIONS[actionId];
    if (!action) return;

    // 检查条件
    if (action.reqMood && npc.mood < action.reqMood) { UI.toast("好感度不足。", "danger"); return; }
    if (action.needItem) {
      const invIdx = (s.inventory || []).findIndex(inv => inv.id === action.needItem);
      if (invIdx < 0) { UI.toast("缺少所需物品。", "danger"); return; }
      // 消耗物品
      const inv = s.inventory[invIdx];
      inv.count--;
      if (inv.count <= 0) s.inventory.splice(invIdx, 1);
    }

    // 检查是否被发现
    const discoverChance = action.needItem === "charm_pill" ? 0.3 : (action.needItem === "loyalty_pill" ? 0.15 : 0.05);
    const discovered = Math.random() < discoverChance;

    // 降低忠贞度
    npc.loyalty = Math.max(-100, (npc.loyalty !== undefined ? npc.loyalty : 100) - action.loyaltyReduction);

    UI.closeModal();
    var loyaltyDisplay = npc.loyalty <= 0 ? npc.loyalty + " ⚠️" : npc.loyalty;
    let texts = [
      {type:"narration",content:"你对" + npc.name + "使用了「" + action.name + "」手段。"},
      {type:"system_msg",content:"忠贞度-" + action.loyaltyReduction + "（当前：" + loyaltyDisplay + "）"},
    ];

    if (discovered) {
      // 被发现
      s.karma = (s.karma || 0) + 3;
      s.heartDemon = (s.heartDemon || 0) + 1;
      texts.push({type:"danger",content:"⚠️ 你的行为被" + npc.name + "的道侣发现了！"});
      texts.push({type:"danger",content:"道德降低，因果值+3，心魔值+1"});

      // 道侣敌视
      const spouse = npc.socialNetwork.spouse;
      if (spouse) {
        texts.push({type:"danger",content:spouse.name + "对你怒目而视，誓要找你算账！"});
        // 有概率导致两人断绝关系
        if (npc.loyalty <= 0 && Math.random() < 0.4) {
          npc.hasSpouse = false;
          npc.socialNetwork.spouse = null;
          texts.push({type:"chapter_title",content:"💔 道侣反目"});
          texts.push({type:"narration",content:"由于忠贞度过低，" + npc.name + "与道侣" + spouse.name + "彻底反目，断绝了关系！"});
          texts.push({type:"system_msg",content:npc.name + "已与道侣断绝关系。"});
        } else {
          // 道侣成为伏击者
          const enemyId = "enemy_npc_" + Date.now() + "_" + Math.floor(Math.random() * 999);
          s.npcList.push({
            id: enemyId,
            name: spouse.name,
            title: spouse.title || "",
            isFemale: spouse.isFemale,
            cultLevel: spouse.cultLevel || npc.cultLevel,
            cultName: spouse.cultLevel !== undefined ? CULT_LEVELS[spouse.cultLevel].name : npc.cultName,
            personality: NPC_PERSONALITIES[0],
            hp: npc.hp * 1.2, maxHp: npc.hp * 1.2,
            atk: npc.atk * 1.1, def: npc.def,
            mood: -500, isAlive: true, isFriend: false,
            area: npc.area, isAmbusher: true, targetPlayer: true, ambushChance: 0.2,
          });
          s.ambushers.push(enemyId);
          texts.push({type:"danger",content:spouse.name + "将会在探索时袭击你！"});
        }
      }
    } else {
      texts.push({type:"system_msg",content:"幸好这次没有被发现。"});
    }

    // 忠贞度过低时提示
    if (npc.loyalty <= 0) {
      texts.push({type:"system_msg",content:"⚠️ " + npc.name + "的忠贞已彻底丧失！可无条件结为道侣。"});
    } else if (npc.loyalty <= 30) {
      texts.push({type:"system_msg",content:npc.name + "的忠贞度已极低，或许可以尝试秘密双修……"});
    }

    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"继续交谈", next:"_npc_talk_" + npcId, effect:{}},
      {text:"告辞离开", next:"_npc_leave", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 秘密双修 =====
  secretDualCultivate(npcId) {
    const s = Game.state;
    this.initExpand2State(s);
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) { UI.toast("此人已不在此处。", "danger"); return; }

    // 检查条件
    if (!npc.hasSpouse && (npc.loyalty === undefined || npc.loyalty >= 100)) { UI.toast(npc.name + "没有道侣，无法秘密双修。", "danger"); return; }
    if (npc.loyalty > 50) { UI.toast(npc.name + "忠贞度过高，无法秘密双修。", "danger"); return; }
    if (!npc.isFemale !== !s.isFemale) { UI.toast("只能与异性双修。", "danger"); return; }
    if (npc.mood < 60) { UI.toast("好感度不足60。", "danger"); return; }

    // 执行秘密双修
    s.secretDualCount = (s.secretDualCount || 0) + 1;
    const baseExp = 500;
    var loyaltyForDual = (npc.loyalty !== undefined ? npc.loyalty : 100);
    const bonusExp = Math.floor(baseExp * (1 + (100 - loyaltyForDual) / 50)); // 忠贞越低经验越多（负数时更多）
    Game.gainExp(bonusExp);
    npc.mood = Math.min(100, npc.mood + 10);
    npc.loyalty = Math.max(-100, (npc.loyalty !== undefined ? npc.loyalty : 100) - 5);
    npc.secretDual = true; // 标记为秘密双修过，后续可无视好感度结为道侣

    // 大幅提高怀孕概率（秘密双修怀孕率远高于正常双修，负数忠贞更高）
    const pregnancyChance = Math.min(0.98, 0.6 + (100 - loyaltyForDual) * 0.003);

    let texts = [
      {type:"chapter_title",content:"🔥 秘密双修"},
      {type:"narration",content:"趁" + npc.name + "的道侣不在，你与" + npc.name + "进行了秘密双修……"},
      {type:"reward",content:"✨ 获得修为" + bonusExp + "经验"},
      {type:"system_msg",content:"好感度+10（当前：" + npc.mood + "/100）"},
    ];

    // 检查是否被发现
    const discoverChance = 0.25;
    const discovered = Math.random() < discoverChance;

    if (discovered) {
      s.karma = (s.karma || 0) + 5;
      s.heartDemon = (s.heartDemon || 0) + 2;
      texts.push({type:"danger",content:"⚠️ 你与" + npc.name + "的秘密被发现了！"});
      texts.push({type:"danger",content:"道德降低，因果值+5，心魔值+2"});

      const spouse = npc.socialNetwork.spouse;
      if (spouse) {
        texts.push({type:"danger",content:spouse.name + "得知此事后暴怒，对你产生了强烈敌意！"});
        // 有概率断绝关系
        if (Math.random() < 0.5) {
          npc.hasSpouse = false;
          npc.socialNetwork.spouse = null;
          texts.push({type:"chapter_title",content:"💔 彻底决裂"});
          texts.push({type:"narration",content:npc.name + "的道侣" + spouse.name + "愤然离去，两人正式断绝关系！"});
          texts.push({type:"system_msg",content:npc.name + "已与道侣断绝关系。"});
        } else {
          // 道侣成为伏击者
          const enemyId = "enemy_npc_" + Date.now() + "_" + Math.floor(Math.random() * 999);
          s.npcList.push({
            id: enemyId,
            name: spouse.name,
            title: spouse.title || "",
            isFemale: spouse.isFemale,
            cultLevel: spouse.cultLevel || npc.cultLevel,
            cultName: spouse.cultLevel !== undefined ? CULT_LEVELS[spouse.cultLevel].name : npc.cultName,
            personality: NPC_PERSONALITIES[0],
            hp: npc.hp * 1.3, maxHp: npc.hp * 1.3,
            atk: npc.atk * 1.2, def: npc.def * 1.1,
            mood: -800, isAlive: true, isFriend: false,
            area: npc.area, isAmbusher: true, targetPlayer: true, ambushChance: 0.35,
          });
          s.ambushers.push(enemyId);
          texts.push({type:"danger",content:spouse.name + "将会在探索时频繁袭击你！"});
        }
      }
    } else {
      texts.push({type:"system_msg",content:"这次没有被发现。"});
    }

    // 怀孕判定
    if (Math.random() < pregnancyChance) {
      texts.push({type:"reward",content:"💕 秘密双修引发了异象，" + npc.name + "似乎有了身孕的迹象……"});
      if (typeof this.startPregnancy === 'function') {
        this.startPregnancy(npcId, true);
      }
    }

    this.checkTitles();
    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"继续交谈", next:"_npc_talk_" + npcId, effect:{}},
      {text:"告辞离开", next:"_npc_leave", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 检查伏击者袭击 =====
  checkAmbush() {
    const s = Game.state;
    this.initExpand2State(s);
    if (!s.ambushers || s.ambushers.length === 0) return false;

    // 随机选择一个伏击者（兼容字符串ID和对象格式）
    const aliveAmbushers = s.ambushers.filter(a => {
      // 支持字符串ID和对象两种格式
      const ambId = typeof a === 'string' ? a : (a && a.npcId);
      if (!ambId) return false;
      const amb = s.npcList.find(n => n.id === ambId && n.isAlive);
      return amb;
    });
    if (aliveAmbushers.length === 0) return false;

    const selected = aliveAmbushers[Math.floor(Math.random() * aliveAmbushers.length)];
    // 兼容两种格式
    const ambusherId = typeof selected === 'string' ? selected : selected.npcId;
    const ambusherData = typeof selected === 'object' ? selected : null;

    // 优先从npcList找NPC，否则用对象数据
    let ambusher = s.npcList.find(n => n.id === ambusherId);
    if (!ambusher && ambusherData) {
      // 创建临时NPC对象
      ambusher = {
        id: ambusherId,
        name: ambusherData.name || '仇家',
        title: '',
        cultLevel: ambusherData.cultLevel || s.cultLevel,
        cultName: ambusherData.cultLevel ? CULT_LEVELS[ambusherData.cultLevel].name : s.cultName,
        hp: ambusherData.hp || s.maxHp,
        atk: ambusherData.atk || s.atk,
        def: ambusherData.def || s.def,
      };
    }
    if (!ambusher) return false;

    // 检查是否触发袭击
    const ambushChance = ambusher.ambushChance || (ambusherData && ambusherData.ambushChance) || 0.2;
    if (Math.random() > ambushChance) return false;

    // 触发袭击
    UI.renderNarrative([
      {type:"danger",content:"⚠️ 突然一道身影挡在你面前！"},
      {type:"danger",content:"是" + (ambusher.title || '') + ambusher.name + "！对方怒目圆睁：「你这卑鄙小人！今日我要你付出代价！」"},
      {type:"system_msg",content:"你哄骗/勾引了对方的道侣，此人前来寻仇！"},
    ]);

    const enemy = {
      name: ambusher.name + "（" + ambusher.cultName + "）[寻仇]",
      hp: ambusher.hp, atk: ambusher.atk, def: ambusher.def,
      exp: Math.floor(CULT_LEVELS[ambusher.cultLevel || 0].maxExp * 0.2),
      stone: Math.floor(ambusher.atk * 2),
      drop: ambusher.items && ambusher.items[0] ? ambusher.items[0] : null,
      dropRate: 0.6,
    };

    Game.combatState = {
      enemy: enemy, enemyHp: enemy.hp, enemyMaxHp: enemy.hp,
      onWin: "_ambusher_victory_" + ambusherId,
      onLose: "_ambusher_defeat_" + ambusherId,
      turn: 0, log: [], isNpc: true, npcId: ambusherId,
    };
    UI.showCombat(Game.combatState);
    Game.combatLog("遭遇寻仇者" + enemy.name + "！", "danger");
    return true;
  },

  // ===== 伏击者战斗胜利 =====
  ambusherVictory(ambusherId) {
    const s = Game.state;
    const amb = s.npcList.find(n => n.id === ambusherId);
    if (amb) amb.isAlive = false;

    // 从ambushers中移除（兼容两种格式）
    const idx = s.ambushers.findIndex(a => {
      const aId = typeof a === 'string' ? a : (a && a.npcId);
      return aId === ambusherId;
    });
    if (idx >= 0) s.ambushers.splice(idx, 1);

    UI.hideCombat();
    Game.combatState = null;

    let texts = [
      {type:"narration",content:"你击败了寻仇的" + amb.name + "！"},
      {type:"danger",content:"因果值+2"},
    ];
    s.karma = (s.karma || 0) + 2;
    s.spiritStones += 200;
    texts.push({type:"reward",content:"💎 获得200灵石"});

    if (s.ambushers.length > 0) {
      texts.push({type:"system_msg",content:"仍有" + s.ambushers.length + "名仇家在暗中窥视你……"});
    } else {
      texts.push({type:"system_msg",content:"所有仇家都已被你解决。"});
    }

    texts.push({type:"narration",content:"你可以继续探索或返回。"});
    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 伏击者战斗失败 =====
  ambusherDefeat(ambusherId) {
    const s = Game.state;
    UI.hideCombat();
    Game.combatState = null;

    const lostStones = Math.floor(s.spiritStones * 0.2);
    s.spiritStones -= lostStones;
    s.hp = Math.max(1, Math.floor(s.maxHp * 0.1));

    UI.renderNarrative([
      {type:"danger",content:"你被寻仇者击败了！"},
      {type:"narration",content:"对方搜走了你" + lostStones + "灵石后扬长而去。"},
      {type:"danger",content:"损失" + lostStones + "灵石"},
      {type:"narration",content:"你需要恢复后才能继续行动。"},
    ]);
    UI.renderChoices([
      {text:"返回城镇", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 野外发现灵山 =====
  discoverWildSpiritMountain() {
    const s = Game.state;
    this.initExpand2State(s);
    s.wildSpiritMountainsFound = (s.wildSpiritMountainsFound || 0) + 1;

    UI.renderNarrative([
      {type:"chapter_title",content:"🏔️ 发现灵山！"},
      {type:"narration",content:"你在野外探索时，忽然感应到前方灵气浓郁异常。穿过一片密林后，眼前豁然开朗——"},
      {type:"narration",content:"一座灵气环绕的灵山矗立在眼前！灵脉涌动，灵草遍地，简直是一处修炼圣地！"},
      {type:"system_msg",content:"然而，你隐约感觉到山上传来了强大的气息……似乎有守护灵兽在此盘踞。"},
    ]);

    UI.renderChoices([
      {text:"⚔️ 挑战守山灵兽", next:"_wild_mountain_fight", effect:{}},
      {text:"🏃 放弃离去", next:"_wild_continue", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 守山灵兽战斗 =====
  startMountainGuardianFight() {
    const s = Game.state;
    const playerStage = CULT_LEVELS[s.cultLevel].stage;

    // 根据玩家修为生成守山灵兽
    let guardian;
    if (playerStage <= 1) {
      guardian = {name:"灵山守护灵蛇",hp:2000,atk:80,def:50,exp:1500,stone:500,drop:"spirit_wolf",dropRate:0.3};
    } else if (playerStage <= 2) {
      guardian = {name:"灵山守护灵熊",hp:5000,atk:200,def:150,exp:3000,stone:1000,drop:"spirit_bear",dropRate:0.3};
    } else if (playerStage <= 3) {
      guardian = {name:"灵山守护火灵狮",hp:15000,atk:600,def:400,exp:8000,stone:3000,drop:"fire_lion",dropRate:0.3};
    } else if (playerStage <= 4) {
      guardian = {name:"灵山守护冰凤",hp:50000,atk:2000,def:1500,exp:30000,stone:10000,drop:"ice_phoenix",dropRate:0.3};
    } else {
      guardian = {name:"灵山守护雷蛟",hp:200000,atk:8000,def:5000,exp:150000,stone:50000,drop:"thunder_dragon",dropRate:0.3};
    }

    Game.combatState = {
      enemy: guardian, enemyHp: guardian.hp, enemyMaxHp: guardian.hp,
      onWin: "_mountain_guardian_win", onLose: "_mountain_guardian_lose",
      turn: 0, log: [],
    };
    UI.showCombat(Game.combatState);
    Game.combatLog("灵山守护灵兽出现：「" + guardian.name + "」！", "danger");
  },

  // ===== 守山灵兽胜利 =====
  mountainGuardianVictory() {
    const s = Game.state;
    UI.hideCombat();
    Game.combatState = null;

    // 获得灵山
    if (s.spiritMountain) {
      // 已有灵山，改为获得奖励
      const rewardStones = 5000 * (CULT_LEVELS[s.cultLevel].stage + 1);
      s.spiritStones += rewardStones;
      UI.renderNarrative([
        {type:"reward",content:"🎉 你击败了守护灵兽！"},
        {type:"narration",content:"由于你已拥有一座灵山，这次你获得了大量灵石奖励。"},
        {type:"reward",content:"💎 获得" + rewardStones + "灵石"},
      ]);
    } else {
      // 获得灵山
      if (typeof this.discoverSpiritMountain === 'function') {
        this.discoverSpiritMountain();
      } else {
        s.spiritMountain = {
          name: "野外灵山",
          buildings: {},
          herbs: {},
          beasts: {},
          livestock: {},
          disciples: [],
          level: 1,
        };
        UI.renderNarrative([
          {type:"chapter_title",content:"🏔️ 获得灵山！"},
          {type:"reward",content:"🎉 你击败了守护灵兽，成功获得了这座灵山的所有权！"},
          {type:"narration",content:"从此你拥有了一座灵山，可以在上面建造宗门、种植灵草、饲养灵兽、招收弟子。"},
        ]);
      }
    }

    this.checkTitles();
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 守山灵兽失败 =====
  mountainGuardianDefeat() {
    const s = Game.state;
    UI.hideCombat();
    Game.combatState = null;
    s.hp = Math.max(1, Math.floor(s.maxHp * 0.1));

    UI.renderNarrative([
      {type:"danger",content:"你被灵山守护灵兽击败了！"},
      {type:"narration",content:"灵兽并未追击，但你也不得不暂时放弃占据灵山的念头。"},
      {type:"system_msg",content:"等你实力足够时，可以再来挑战。"},
    ]);
    UI.renderChoices([
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 发现增强洞天福地 =====
  findEnhancedCave(areaKey) {
    const s = Game.state;
    this.initExpand2State(s);
    s.enhancedCavesFound = (s.enhancedCavesFound || 0) + 1;

    const caveType = ENHANCED_CAVE_TYPES[Math.floor(Math.random() * ENHANCED_CAVE_TYPES.length)];
    const caveId = "ecave_" + Date.now();
    s.foundCaves.push({id: caveId, type: caveType.name, area: areaKey, enhanced: true, explored: false});

    let texts = [
      {type:"chapter_title",content:"🗺️ 发现" + caveType.name},
      {type:"narration",content:"你在" + areaKey + "深入探索时，意外发现了一处" + caveType.name + "！"},
      {type:"narration",content:caveType.desc},
    ];

    // 检查是否有强敌
    if (caveType.enemyChance > 0 && Math.random() < caveType.enemyChance) {
      const enemyType = caveType.enemyTypes[Math.floor(Math.random() * caveType.enemyTypes.length)];
      const enemyData = CAVE_STRONG_ENEMIES[enemyType];

      texts.push({type:"danger",content:"⚠️ 洞府深处传来阵阵异动——一头「" + enemyData.name + "」挡在了你的面前！"});
      texts.push({type:"danger",content:"这头怪物的实力远超普通妖兽，你需要全力以赴！"});

      UI.renderNarrative(texts);

      // 启动战斗
      Game.combatState = {
        enemy: {
          name: enemyData.name,
          hp: enemyData.hp, atk: enemyData.atk, def: enemyData.def,
          exp: enemyData.exp, stone: enemyData.stone,
          drop: enemyData.drop, dropRate: enemyData.dropRate,
        },
        enemyHp: enemyData.hp, enemyMaxHp: enemyData.hp,
        onWin: "_enhanced_cave_win_" + caveId,
        onLose: "_enhanced_cave_lose",
        turn: 0, log: [],
        caveData: {caveType, caveId},
      };
      UI.showCombat(Game.combatState);
      Game.combatLog("遭遇「" + enemyData.name + "」！", "danger");
      return;
    }

    // 没有敌人，直接获取奖励
    this.completeEnhancedCave(caveType, caveId, texts);
  },

  // ===== 完成增强洞天探索 =====
  completeEnhancedCave(caveType, caveId, texts) {
    const s = Game.state;

    if (caveType.expBonus > 0) {
      Game.gainExp(caveType.expBonus);
      texts.push({type:"reward",content:"✨ 获得" + caveType.expBonus + "经验"});
    }
    if (caveType.stoneBonus > 0) {
      s.spiritStones += caveType.stoneBonus;
      texts.push({type:"reward",content:"💎 获得" + caveType.stoneBonus + "灵石"});
    }
    if (caveType.itemChance > 0 && Math.random() < caveType.itemChance) {
      const pool = caveType.itemPool;
      const itemId = pool[Math.floor(Math.random() * pool.length)];
      if (ITEMS[itemId]) {
        Game.addItem(itemId, 1);
        texts.push({type:"reward",content:"📦 获得：" + ITEMS[itemId].name + "！"});
      }
    }

    texts.push({type:"narration",content:"探索完毕，你可以继续探索或返回。"});
    this.checkTitles();
    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 增强洞天战斗胜利 =====
  enhancedCaveVictory(caveId) {
    const s = Game.state;
    const cave = s.foundCaves.find(c => c.id === caveId);
    if (!cave) { Game.wildVictory(); return; }
    const caveType = ENHANCED_CAVE_TYPES.find(ct => ct.name === cave.type);
    if (!caveType) { Game.wildVictory(); return; }

    UI.hideCombat();
    Game.combatState = null;

    let texts = [
      {type:"reward",content:"🎉 你击败了洞府中的守护者！"},
    ];
    this.completeEnhancedCave(caveType, caveId, texts);
  },

  // ===== 增强洞天战斗失败 =====
  enhancedCaveDefeat() {
    const s = Game.state;
    UI.hideCombat();
    Game.combatState = null;
    s.hp = Math.max(1, Math.floor(s.maxHp * 0.1));

    UI.renderNarrative([
      {type:"danger",content:"你被洞府中的守护者击败了！"},
      {type:"narration",content:"你狼狈逃出洞府，身上的灵石也丢了不少。"},
      {type:"system_msg",content:"等你实力足够时，可以再来挑战。"},
    ]);
    UI.renderChoices([
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 显示宗门加入面板 =====
  showSectJoinPanel() {
    const s = Game.state;
    this.initExpand2State(s);

    let html = '<div class="modal-section"><div class="modal-section-title">🏯 宗门系统</div>';

    if (s.ownSect) {
      // 自建宗门
      html += '<div style="text-align:center;color:var(--gold-bright);margin-bottom:12px;">👑 你是「' + s.ownSect.name + '」的宗主</div>';
      html += '<div class="modal-item-row"><div>';
      html += '<div style="color:var(--gold-bright);">宗门成员：' + (s.ownSect.members || []).length + '人</div>';
      html += '<div class="modal-item-desc">外门弟子：' + (s.ownSect.outerDisciples || 0) + '，内门弟子：' + (s.ownSect.innerDisciples || 0) + '，高层：' + (s.ownSect.highRank || 0) + '</div>';
      html += '<div class="modal-item-stats">宗门声望：' + (s.ownSect.reputation || 0) + '</div>';
      html += '</div></div>';
      html += '<div class="modal-item-row" onclick="UI.closeModal();WorldSystem.showOwnSectPanel()" style="cursor:pointer;"><div>';
      html += '<div style="color:var(--jade-bright);">管理宗门</div>';
      html += '<div class="modal-item-desc">查看宗门成员、邀请NPC加入、管理宗门事务</div>';
      html += '</div></div>';
    } else if (s.sectMembership) {
      // 已加入宗门
      const sect = SECTS_AND_FAMILIES[s.sectMembership.sectId];
      const position = SECT_POSITIONS[s.sectMembership.position];
      html += '<div style="text-align:center;color:var(--gold-bright);margin-bottom:12px;">你当前是「' + (sect ? sect.name : '未知') + '」的' + (position ? position.name : '弟子') + '</div>';
      html += '<div class="modal-item-row"><div>';
      html += '<div style="color:var(--gold-bright);">贡献度：' + s.sectMembership.contribution + '</div>';
      html += '<div class="modal-item-desc">下一职位：' + (SECT_POSITIONS[s.sectMembership.position + 1] ? SECT_POSITIONS[s.sectMembership.position + 1].name + '（需' + SECT_POSITIONS[s.sectMembership.position + 1].reqContribution + '贡献）' : '已达最高职位') + '</div>';
      html += '</div></div>';

      // 宗门任务
      html += '<div class="modal-section-title" style="margin-top:12px;">📋 宗门任务</div>';
      SECT_TASKS.forEach(task => {
        html += '<div class="modal-item-row" style="cursor:pointer;" onclick="UI.closeModal();WorldSystem.doSectTask(\'' + task.id + '\')"><div>';
        html += '<div style="color:var(--gold-bright);">' + task.name + ' <span style="font-size:0.8em;color:var(--jade-bright);">+' + task.contribution + '贡献</span></div>';
        html += '<div class="modal-item-desc">' + task.desc + '</div>';
        html += '<div class="modal-item-stats">难度' + task.difficulty + '·💎' + task.stones + '·✨' + task.exp + '经验</div>';
        html += '</div></div>';
      });

      // 晋升
      if (SECT_POSITIONS[s.sectMembership.position + 1] && s.sectMembership.contribution >= SECT_POSITIONS[s.sectMembership.position + 1].reqContribution) {
        html += '<div class="modal-item-row" onclick="UI.closeModal();WorldSystem.advanceSectPosition()" style="cursor:pointer;"><div>';
        html += '<div style="color:var(--gold-bright);">⬆️ 晋升为' + SECT_POSITIONS[s.sectMembership.position + 1].name + '</div>';
        html += '<div class="modal-item-desc">你的贡献度已达标，可以晋升！</div>';
        html += '</div></div>';
      }

      // 离开宗门
      html += '<div class="modal-item-row" onclick="UI.closeModal();WorldSystem.leaveSect()" style="cursor:pointer;"><div>';
      html += '<div style="color:var(--crimson-bright);">离开宗门</div>';
      html += '<div class="modal-item-desc">离开后将失去所有贡献度和职位</div>';
      html += '</div></div>';
    } else {
      // 未加入任何宗门
      html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-bottom:12px;">选择一个宗门加入，通过做任务、击败叛逃NPC获得贡献度来晋升</p>';

      Object.keys(SECTS_AND_FAMILIES).forEach(sectId => {
        const sect = SECTS_AND_FAMILIES[sectId];
        const canJoin = CULT_LEVELS[s.cultLevel].stage >= sect.reqStage;
        html += '<div class="modal-item-row" style="opacity:' + (canJoin ? '1' : '0.4') + '" ' + (canJoin ? 'onclick="UI.closeModal();WorldSystem.joinSect(\'' + sectId + '\')"' : '') + '><div>';
        html += '<div style="color:' + (canJoin ? 'var(--gold-bright)' : 'var(--text-dim)') + '">🏯 ' + sect.name;
        if (!canJoin) html += ' <span style="font-size:0.8em;">（需' + STAGE_NAMES[sect.reqStage] + '）</span>';
        html += '</div>';
        html += '<div class="modal-item-desc">' + sect.desc + '</div>';
        html += '<div class="modal-item-stats">实力：' + sect.strength + '/10·掌门：' + sect.leader + '·专长：' + sect.specialty + '</div>';
        html += '</div></div>';
      });

      // 自建宗门
      html += '<div class="modal-item-row" onclick="UI.closeModal();WorldSystem.establishOwnSect()" style="cursor:pointer;"><div>';
      html += '<div style="color:var(--gold-bright);">🏗️ 自立宗门</div>';
      html += '<div class="modal-item-desc">创建属于自己的宗门，邀请好感度≥80的NPC加入</div>';
      html += '<div class="modal-item-stats">需要：5000灵石 + 一座灵山</div>';
      html += '</div></div>';
    }

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },

  // ===== 加入宗门 =====
  joinSect(sectId) {
    const s = Game.state;
    this.initExpand2State(s);
    const sect = SECTS_AND_FAMILIES[sectId];
    if (!sect) return;
    if (CULT_LEVELS[s.cultLevel].stage < sect.reqStage) { UI.toast("修为不足！", "danger"); return; }

    s.sectMembership = {
      sectId: sectId,
      position: 0,
      contribution: 0,
      joinedDays: 0,
    };

    s.reputation = (s.reputation || 0) + 10;

    UI.renderNarrative([
      {type:"chapter_title",content:"🏯 加入" + sect.name},
      {type:"narration",content:"你正式加入了" + sect.name + "，成为了一名外门弟子。"},
      {type:"dialogue",content:"「欢迎加入我' + sect.name + '！好好修炼，为宗门效力。」" + sect.leader + "说道。"},
      {type:"system_msg",content:"你可以通过做宗门任务来获得贡献度，贡献度达到一定数值后可以晋升职位。"},
      {type:"reward",content:"声望+10"},
    ]);

    this.checkTitles();
    UI.renderChoices([
      {text:"打开宗门面板", next:"_sect_join_panel", effect:{}},
      {text:"继续", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 离开宗门 =====
  leaveSect() {
    const s = Game.state;
    if (!s.sectMembership) return;

    UI.showModal("离开宗门",
      "<p style='text-align:center;color:var(--crimson-bright);'>确定要离开吗？</p><p>离开后将失去所有贡献度和职位。</p>",
      '<button class="btn-combat" onclick="UI.closeModal()">取消</button>' +
      '<button class="btn-combat" style="border-color:var(--crimson);color:var(--crimson-bright)" onclick="UI.closeModal();WorldSystem.doLeaveSect()">确定离开</button>'
    );
  },

  doLeaveSect() {
    const s = Game.state;
    const sect = SECTS_AND_FAMILIES[s.sectMembership.sectId];
    s.sectMembership = null;
    UI.toast("已离开" + (sect ? sect.name : "宗门"), "info");
    setTimeout(() => this.showSectJoinPanel(), 100);
  },

  // ===== 执行宗门任务 =====
  doSectTask(taskId) {
    const s = Game.state;
    if (!s.sectMembership) { UI.toast("你尚未加入任何宗门。", "danger"); return; }

    const task = SECT_TASKS.find(t => t.id === taskId);
    if (!task) return;

    // 检查是否是追杀叛徒任务
    if (taskId === "subdue_renegade") {
      // 生成叛逃NPC并战斗
      const playerLevel = s.cultLevel;
      const enemyLevel = Math.max(0, playerLevel + Math.floor(Math.random() * 3 - 1));
      const cult = CULT_LEVELS[enemyLevel];

      const renegade = {
        name: "叛逃弟子·" + NPC_SURNAMES[Math.floor(Math.random()*NPC_SURNAMES.length)] + NPC_GIVEN_NAMES_M[Math.floor(Math.random()*NPC_GIVEN_NAMES_M.length)],
        hp: cult.hpBonus * 1.5,
        atk: cult.atkBonus * 1.3,
        def: cult.defBonus * 1.2,
        exp: task.exp,
        stone: task.stones,
        drop: "spirit_stone",
        dropRate: 0.8,
      };

      UI.renderNarrative([
        {type:"danger",content:"你奉命追杀叛逃弟子！"},
        {type:"danger",content:"「" + renegade.name + "」出现在你面前，对方修为在" + cult.name + "左右。"},
      ]);

      Game.combatState = {
        enemy: renegade, enemyHp: renegade.hp, enemyMaxHp: renegade.hp,
        onWin: "_sect_task_win_" + taskId,
        onLose: "_sect_task_lose",
        turn: 0, log: [],
        taskData: task,
      };
      UI.showCombat(Game.combatState);
      Game.combatLog("追杀叛逃弟子：" + renegade.name + "！", "danger");
      return;
    }

    // 其他任务直接完成（带随机难度）
    const successChance = 0.9 - task.difficulty * 0.1;
    const success = Math.random() < successChance;

    if (success) {
      s.sectMembership.contribution += task.contribution;
      s.spiritStones += task.stones;
      Game.gainExp(task.exp);
      s.sectMembership.joinedDays = (s.sectMembership.joinedDays || 0) + 1;
      s.reputation = (s.reputation || 0) + Math.floor(task.contribution / 5);

      UI.renderNarrative([
        {type:"narration",content:"你完成了「" + task.name + "」。"},
        {type:"reward",content:"✨ 经验+" + task.exp + "，💎 灵石+" + task.stones + "，贡献度+" + task.contribution},
      ]);
      this.checkSectPromotion();
    } else {
      UI.renderNarrative([
        {type:"danger",content:"「" + task.name + "」失败了！"},
        {type:"narration",content:"不过宗门并未因此责怪你，下次再接再厉。"},
      ]);
    }

    this.checkTitles();
    UI.renderChoices([
      {text:"打开宗门面板", next:"_sect_join_panel", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 宗门任务战斗胜利 =====
  sectTaskVictory(taskId) {
    const s = Game.state;
    const task = SECT_TASKS.find(t => t.id === taskId);
    if (!task) { Game.wildVictory(); return; }

    UI.hideCombat();
    Game.combatState = null;

    s.sectMembership.contribution += task.contribution;
    s.spiritStones += task.stones;
    Game.gainExp(task.exp);
    s.reputation = (s.reputation || 0) + Math.floor(task.contribution / 3);

    UI.renderNarrative([
      {type:"reward",content:"🎉 你击败了叛逃弟子！"},
      {type:"reward",content:"✨ 经验+" + task.exp + "，💎 灵石+" + task.stones + "，贡献度+" + task.contribution},
      {type:"system_msg",content:"声望+" + Math.floor(task.contribution / 3)},
    ]);
    this.checkSectPromotion();
    this.checkTitles();
    UI.renderChoices([
      {text:"打开宗门面板", next:"_sect_join_panel", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 宗门任务战斗失败 =====
  sectTaskDefeat() {
    const s = Game.state;
    UI.hideCombat();
    Game.combatState = null;
    s.hp = Math.max(1, Math.floor(s.maxHp * 0.2));

    UI.renderNarrative([
      {type:"danger",content:"你被叛逃弟子击败了！"},
      {type:"narration",content:"你未能完成宗门任务，不过宗门长老并未责怪你。"},
      {type:"system_msg",content:"下次实力足够时再试。"},
    ]);
    UI.renderChoices([
      {text:"打开宗门面板", next:"_sect_join_panel", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 检查宗门晋升 =====
  checkSectPromotion() {
    const s = Game.state;
    if (!s.sectMembership) return;

    const nextPos = SECT_POSITIONS[s.sectMembership.position + 1];
    if (nextPos && s.sectMembership.contribution >= nextPos.reqContribution) {
      UI.toast("贡献度已达标，可以晋升为「" + nextPos.name + "」！", "gold");
    }
  },

  // ===== 晋升宗门职位 =====
  advanceSectPosition() {
    const s = Game.state;
    if (!s.sectMembership) return;

    const nextPos = SECT_POSITIONS[s.sectMembership.position + 1];
    if (!nextPos || s.sectMembership.contribution < nextPos.reqContribution) {
      UI.toast("贡献度不足，无法晋升。", "danger");
      return;
    }

    s.sectMembership.position++;
    const sect = SECTS_AND_FAMILIES[s.sectMembership.sectId];

    UI.renderNarrative([
      {type:"chapter_title",content:"👑 职位晋升"},
      {type:"narration",content:"恭喜！你在" + (sect ? sect.name : "宗门") + "中的贡献度达到了要求，晋升为「" + nextPos.name + "」！"},
      {type:"dialogue",content:"「你的贡献宗门上下有目共睹，从今日起你就是我宗" + nextPos.name + "了！」"},
      {type:"reward",content:"每日灵石俸禄：" + nextPos.dailyStones + "灵石"},
    ]);

    this.checkTitles();
    UI.renderChoices([
      {text:"打开宗门面板", next:"_sect_join_panel", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 自建宗门 =====
  establishOwnSect() {
    const s = Game.state;
    this.initExpand2State(s);

    if (s.ownSect) { UI.toast("你已有自己的宗门。", "info"); return; }
    if (s.spiritStones < 5000) { UI.toast("需要5000灵石才能建立宗门。", "danger"); return; }
    if (!s.spiritMountain) { UI.toast("需要拥有一座灵山才能建立宗门！", "danger"); return; }

    // 输入宗门名
    UI.showModal("创建宗门",
      "<p style='text-align:center;margin-bottom:12px;'>请输入你的宗门名称：</p>" +
      "<input id='sect_name_input' type='text' placeholder='如：青云宗' style='width:100%;padding:8px;background:var(--bg-darker);border:1px solid var(--gold);color:var(--text-main);border-radius:4px;' maxlength='10'/>",
      '<button class="btn-combat" onclick="UI.closeModal()">取消</button>' +
      '<button class="btn-combat" onclick="WorldSystem.confirmEstablishSect()">创建</button>'
    );
  },

  confirmEstablishSect() {
    const s = Game.state;
    const input = document.getElementById('sect_name_input');
    const sectName = input ? input.value.trim() : "";
    if (!sectName) { UI.toast("请输入宗门名称。", "danger"); return; }

    s.spiritStones -= 5000;
    s.ownSect = {
      name: sectName,
      members: [],
      outerDisciples: OWN_SECT_CONFIG.outerDisciplesBase,
      innerDisciples: OWN_SECT_CONFIG.innerDisciplesBase,
      highRank: OWN_SECT_CONFIG.highRankBase,
      reputation: 100,
      level: 1,
    };

    UI.closeModal();
    UI.renderNarrative([
      {type:"chapter_title",content:"🏯 开宗立派"},
      {type:"narration",content:"你在灵山上创建了「" + sectName + "」！从此，你就是一宗之主！"},
      {type:"reward",content:"💎 消耗5000灵石"},
      {type:"system_msg",content:"你可以邀请好感度≥80的NPC加入你的宗门，也可以通过挖角其他宗门来壮大实力。"},
      {type:"narration",content:"宗门已有外门弟子" + s.ownSect.outerDisciples + "人，内门弟子" + s.ownSect.innerDisciples + "人，高层" + s.ownSect.highRank + "人。"},
    ]);

    this.checkTitles();
    UI.renderChoices([
      {text:"管理宗门", next:"_own_sect_panel", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 显示自建宗门面板 =====
  showOwnSectPanel() {
    const s = Game.state;
    if (!s.ownSect) { UI.toast("你还没有自己的宗门。", "danger"); return; }

    let html = '<div class="modal-section"><div class="modal-section-title">🏯 ' + s.ownSect.name + '</div>';
    html += '<div style="text-align:center;margin-bottom:12px;">';
    html += '<span style="color:var(--gold-bright);">👑 宗主：' + s.name + '</span>　';
    html += '<span style="color:var(--jade-bright);">声望：' + s.ownSect.reputation + '</span>　';
    html += '<span style="color:var(--text-dim);">等级：' + s.ownSect.level + '</span>';
    html += '</div>';

    // 成员信息
    html += '<div class="modal-item-row"><div>';
    html += '<div style="color:var(--gold-bright);">宗门成员</div>';
    html += '<div class="modal-item-desc">外门弟子：' + s.ownSect.outerDisciples + '人</div>';
    html += '<div class="modal-item-desc">内门弟子：' + s.ownSect.innerDisciples + '人</div>';
    html += '<div class="modal-item-desc">高层：' + s.ownSect.highRank + '人</div>';
    html += '<div class="modal-item-desc">邀请加入：' + (s.ownSect.members || []).length + '人</div>';
    html += '</div></div>';

    // 邀请NPC
    const invitedIds = (s.ownSect.members || []).map(m => m.npcId);
    const candidates = (s.npcList || []).filter(n => n.isAlive && n.mood >= 80 && !invitedIds.includes(n.id));

    if (candidates.length > 0) {
      html += '<div class="modal-section-title" style="margin-top:12px;">📋 可邀请NPC（好感度≥80）</div>';
      candidates.slice(0, 10).forEach(npc => {
        const genderStr = npc.isFemale ? "女" : "男";
        const cultStr = npc.cultName || "凡人";
        html += '<div class="modal-item-row" style="cursor:pointer;" onclick="UI.closeModal();WorldSystem.inviteNPCToSect(\'' + npc.id + '\')"><div>';
        html += '<div style="color:var(--gold-bright);">' + npc.title + npc.name + ' <span style="font-size:0.8em;color:var(--text-dim);">[' + genderStr + '·' + cultStr + '·好感' + npc.mood + ']</span></div>';
        html += '<div class="modal-item-desc">' + (npc.sectName ? '原属：' + npc.sectName : '散修') + '</div>';
        html += '</div></div>';
      });
    } else {
      html += '<div style="color:var(--text-dim);text-align:center;margin:8px 0;">暂无可邀请的NPC，提升好感度后再来邀请。</div>';
    }

    // 已邀请成员
    if ((s.ownSect.members || []).length > 0) {
      html += '<div class="modal-section-title" style="margin-top:12px;">👥 已加入成员</div>';
      s.ownSect.members.forEach(m => {
        const npc = s.npcList.find(n => n.id === m.npcId);
        if (npc) {
          html += '<div class="modal-item-row"><div>';
          html += '<div style="color:var(--gold-bright);">' + npc.title + npc.name + ' <span style="font-size:0.8em;color:var(--jade-bright);">[' + m.role + ']</span></div>';
          html += '<div class="modal-item-desc">' + npc.cultName + '·好感' + npc.mood + '</div>';
          html += '</div></div>';
        }
      });
    }

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },

  // ===== 邀请NPC加入自建宗门 =====
  inviteNPCToSect(npcId) {
    const s = Game.state;
    if (!s.ownSect) { UI.toast("你还没有自己的宗门。", "danger"); return; }
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) { UI.toast("此人已不在此处。", "danger"); return; }

    if (npc.mood < 80) { UI.toast("好感度不足80，无法邀请。", "danger"); return; }

    // 成功率基于好感度
    const successChance = 0.5 + (npc.mood - 80) * 0.02;
    const success = Math.random() < successChance;

    if (success) {
      // 如果NPC原本属于其他宗门，需要先挖角
      if (npc.sectId) {
        const oldSect = SECTS_AND_FAMILIES[npc.sectId];
        UI.renderNarrative([
          {type:"narration",content:npc.name + "原本属于" + (oldSect ? oldSect.name : "其他宗门") + "。"},
          {type:"dialogue",content:"「承蒙宗主厚爱，我愿意加入你的宗门！」"},
          {type:"danger",content:"⚠️ " + (oldSect ? oldSect.name : "原宗门") + "对此颇为不满，你的声望略有下降。"},
        ]);
        s.reputation = Math.max(0, (s.reputation || 0) - 5);
        s.poachedNPCs = (s.poachedNPCs || 0) + 1;
      }

      npc.sectId = null;
      npc.sectName = s.ownSect.name;

      // 分配职位
      let role = "外门弟子";
      const stage = CULT_LEVELS[npc.cultLevel].stage;
      if (stage >= 5) role = "太上长老";
      else if (stage >= 4) role = "护法长老";
      else if (stage >= 3) role = "内门执事";
      else if (stage >= 2) role = "内门弟子";

      s.ownSect.members.push({npcId: npcId, role: role});
      s.ownSect.reputation += 20;
      npc.mood = Math.min(100, npc.mood + 5);

      UI.renderNarrative([
        {type:"reward",content:"🎉 " + npc.name + "加入了你的宗门！担任" + role + "。"},
        {type:"system_msg",content:"宗门声望+20"},
      ]);
    } else {
      npc.mood = Math.max(0, npc.mood - 10);
      UI.renderNarrative([
        {type:"narration",content:npc.name + "婉言谢绝了你的邀请。"},
        {type:"dialogue",content:"「多谢厚爱，但我暂时还不想加入任何宗门。」"},
        {type:"danger",content:"好感度-10（当前：" + npc.mood + "/100）"},
      ]);
    }

    this.checkTitles();
    UI.renderChoices([
      {text:"管理宗门", next:"_own_sect_panel", effect:{}},
      {text:"继续", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 显示挖角面板 =====
  showPoachPanel(npcId) {
    const s = Game.state;
    if (!s.ownSect) { UI.toast("你需要先自建宗门才能挖角。", "danger"); return; }
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) { UI.toast("此人已不在此处。", "danger"); return; }
    if (!npc.sectId) { UI.toast(npc.name + "是散修，可以直接邀请加入。", "info"); return; }

    const sect = SECTS_AND_FAMILIES[npc.sectId];
    let html = '<div class="modal-section"><div class="modal-section-title">🎣 挖角 - ' + npc.name + '</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-bottom:12px;">';
    html += '目标：' + npc.title + npc.name + '（' + (sect ? sect.name : '未知') + npc.sectRole + '）<br>';
    html += '性格：' + npc.personality.type + '·好感度：' + npc.mood + '/100';
    html += '</p>';

    Object.keys(POACH_METHODS).forEach(methodId => {
      const method = POACH_METHODS[methodId];
      let canDo = true;
      let reason = "";
      let extraInfo = "";

      if (methodId === "force") {
        // 武力：需要玩家修为高于NPC
        if (s.cultLevel <= npc.cultLevel) { canDo = false; reason = "修为不足"; }
        extraInfo = "道德越低成功率越高";
      } else if (methodId === "bribery") {
        // 利诱：需要灵石
        const cost = 5000 * (CULT_LEVELS[npc.cultLevel].stage + 1);
        if (s.spiritStones < cost) { canDo = false; reason = "灵石不足（需" + cost + "）"; }
        extraInfo = "消耗" + cost + "灵石·性格贪婪者易成功";
      } else if (methodId === "persuasion") {
        // 好感度裹挟
        if (npc.mood < 80) { canDo = false; reason = "好感度不足80"; }
        extraInfo = "好感度越高成功率越大";
      }

      html += '<div class="modal-item-row" style="' + (canDo ? 'cursor:pointer;' : 'opacity:0.5;') + '" ' + (canDo ? 'onclick="UI.closeModal();WorldSystem.poachNPCFromSect(\'' + npcId + '\',\'' + methodId + '\')"' : '') + '><div>';
      html += '<div style="color:var(--gold-bright);">' + method.name + '</div>';
      html += '<div class="modal-item-desc">' + method.desc + '</div>';
      html += '<div class="modal-item-stats">' + extraInfo + '</div>';
      if (!canDo) html += '<div style="color:var(--crimson);font-size:0.8em;">' + reason + '</div>';
      html += '</div></div>';
    });

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal();Game.gotoNode(\'_npc_talk_' + npcId + '\')">返回</button>');
  },

  // ===== 挖角NPC =====
  poachNPCFromSect(npcId, method) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) return;

    let successChance = 0;
    let cost = 0;
    let texts = [];

    if (method === "force") {
      const cultGap = s.cultLevel - npc.cultLevel;
      successChance = 0.3 + cultGap * 0.1;
      // 道德影响（用personality模拟，没有直接道德属性）
      if (npc.personality.type === "阴险" || npc.personality.type === "狡诈") successChance += 0.15;
      if (npc.personality.type === "狂傲") successChance += 0.1;
      texts.push({type:"narration",content:"你以武力胁迫" + npc.name + "加入你的宗门……"});
      texts.push({type:"danger",content:"武力胁迫成功会增加因果值。"});
    } else if (method === "bribery") {
      cost = 5000 * (CULT_LEVELS[npc.cultLevel].stage + 1);
      if (s.spiritStones < cost) { UI.toast("灵石不足！", "danger"); return; }
      successChance = 0.4;
      if (npc.personality.type === "贪婪" || npc.personality.type === "狡诈") successChance += 0.2;
      if (npc.personality.type === "正直" || npc.personality.type === "温和") successChance -= 0.15;
      s.spiritStones -= cost;
      texts.push({type:"narration",content:"你拿出" + cost + "灵石利诱" + npc.name + "……"});
      texts.push({type:"danger",content:"消耗" + cost + "灵石"});
    } else if (method === "persuasion") {
      successChance = 0.3 + (npc.mood - 80) * 0.015;
      if (npc.isFriend) successChance += 0.2;
      texts.push({type:"narration",content:"你以情动人，劝说" + npc.name + "加入你的宗门……"});
    }

    const success = Math.random() < successChance;

    if (success) {
      const oldSect = SECTS_AND_FAMILIES[npc.sectId];
      npc.sectId = null;
      npc.sectName = s.ownSect.name;

      let role = "外门弟子";
      const stage = CULT_LEVELS[npc.cultLevel].stage;
      if (stage >= 5) role = "太上长老";
      else if (stage >= 4) role = "护法长老";
      else if (stage >= 3) role = "内门执事";
      else if (stage >= 2) role = "内门弟子";

      s.ownSect.members.push({npcId: npcId, role: role});
      s.ownSect.reputation += 30;
      s.poachedNPCs = (s.poachedNPCs || 0) + 1;
      s.reputation = (s.reputation || 0) + 10;

      texts.push({type:"reward",content:"🎉 挖角成功！" + npc.name + "加入了你的宗门，担任" + role + "！"});
      texts.push({type:"system_msg",content:"宗门声望+30，个人声望+10"});

      if (method === "force") {
        s.karma = (s.karma || 0) + 3;
        texts.push({type:"danger",content:"因果值+3（武力胁迫的代价）"});
      }

      if (oldSect) {
        texts.push({type:"danger",content:"⚠️ " + oldSect.name + "对此十分不满，你与该宗门关系恶化。"});
      }
    } else {
      npc.mood = Math.max(0, npc.mood - 20);
      texts.push({type:"danger",content:"挖角失败！" + npc.name + "拒绝了你的要求。"});
      texts.push({type:"danger",content:"好感度-20（当前：" + npc.mood + "/100）"});

      if (method === "force") {
        s.karma = (s.karma || 0) + 2;
        texts.push({type:"danger",content:"因果值+2"});
        // 有概率触发战斗
        if (Math.random() < 0.3) {
          texts.push({type:"danger",content:npc.name + "对你的胁迫大为恼怒，向你发起了攻击！"});
          const enemy = {
            name: npc.name + "（" + npc.cultName + "）[愤怒]",
            hp: npc.hp, atk: npc.atk * 1.2, def: npc.def,
            exp: Math.floor(CULT_LEVELS[npc.cultLevel].maxExp * 0.15),
            stone: npc.stones, drop: npc.items[0] || null, dropRate: 0.5,
          };
          Game.combatState = {
            enemy: enemy, enemyHp: enemy.hp, enemyMaxHp: enemy.hp,
            onWin: "_npc_victory_" + npcId, onLose: "_npc_defeat_" + npcId,
            turn: 0, log: [], isNpc: true, npcId: npcId,
          };
          UI.showCombat(Game.combatState);
          Game.combatLog("挖角失败，" + enemy.name + "暴怒攻击！", "danger");
          UI.renderNarrative(texts);
          return;
        }
      }
    }

    this.checkTitles();
    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"继续交谈", next:"_npc_talk_" + npcId, effect:{}},
      {text:"告辞离开", next:"_npc_leave", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 显示NPC社交网络 =====
  showNPCSocialPanel(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId && n.isAlive);
    if (!npc) { UI.toast("此人已不在此处。", "danger"); return; }

    // 确保社交网络已初始化
    this.setupNPCSocialNetwork(npc, s);
    // 确保亲戚关系已生成（扩展7）
    if (!npc.socialNetwork.relatives && typeof this.generateRelatives === 'function') {
      this.generateRelatives(npc, s);
    }
    const sn = npc.socialNetwork;

    let html = '<div class="modal-section"><div class="modal-section-title">👥 ' + npc.name + '的社交关系</div>';

    // 道侣
    if (sn.spouse) {
      html += '<div class="modal-item-row"><div>';
      html += '<div style="color:var(--pink,#e8a0b0);">💑 道侣：' + sn.spouse.title + sn.spouse.name + '</div>';
      html += '<div class="modal-item-desc">修为：' + (sn.spouse.cultLevel !== undefined ? CULT_LEVELS[sn.spouse.cultLevel].name : '未知') + '</div>';
      html += '</div></div>';
    } else if (npc.hasSpouse === false && !npc.isChild) {
      html += '<div style="color:var(--text-dim);text-align:center;margin:8px 0;">暂无道侣</div>';
    }

    // 父母
    if (sn.parents && sn.parents.length > 0) {
      html += '<div class="modal-section-title" style="margin-top:8px;">👨‍👩 父母</div>';
      sn.parents.forEach(p => {
        const aliveStr = p.isAlive ? "" : " <span style='color:var(--text-dim);font-size:0.8em;'>(已故)</span>";
        const cultStr = p.cultLevel >= 0 ? CULT_LEVELS[p.cultLevel].name : "凡人";
        html += '<div class="modal-item-row"><div>';
        html += '<div style="color:' + (p.isAlive ? 'var(--gold-bright)' : 'var(--text-dim)') + ';">' + p.name + aliveStr + '</div>';
        html += '<div class="modal-item-desc">' + p.relation + ' | ' + p.age + '岁 | ' + cultStr + '</div>';
        html += '</div></div>';
      });
    }

    // 义父母
    if (sn.godparents && sn.godparents.length > 0) {
      html += '<div class="modal-section-title" style="margin-top:8px;">🙏 义父母</div>';
      sn.godparents.forEach(gp => {
        html += '<div class="modal-item-row"><div>';
        html += '<div style="color:var(--purple-spirit);">' + gp.name + ' <span style="font-size:0.8em;color:var(--text-dim);">[' + gp.relation + ']</span></div>';
        html += '</div></div>';
      });
    }

    // 亲友
    if (sn.familyMembers.length > 0) {
      html += '<div class="modal-section-title" style="margin-top:8px;">👨‍👩‍👧‍👦 亲友</div>';
      sn.familyMembers.forEach(rel => {
        const genderStr = rel.isFemale ? "女" : "男";
        html += '<div class="modal-item-row"><div>';
        html += '<div style="color:var(--text-main);">' + rel.name + ' <span style="font-size:0.8em;color:var(--text-dim);">[' + rel.relation + '·' + genderStr + ']</span></div>';
        html += '</div></div>';
      });
    }

    // 亲戚
    if (sn.relatives && sn.relatives.length > 0) {
      html += '<div class="modal-section-title" style="margin-top:8px;">🏠 亲戚</div>';
      sn.relatives.forEach(rel => {
        var aliveStr = rel.isAlive ? "" : " <span style='color:var(--text-dim);font-size:0.8em;'>(已故)</span>";
        var cultStr = rel.cultLevel >= 0 ? CULT_LEVELS[rel.cultLevel].name : "凡人";
        var genderStr = rel.isFemale ? "女" : "男";
        html += '<div class="modal-item-row"><div>';
        html += '<div style="color:' + (rel.isAlive ? 'var(--text-main)' : 'var(--text-dim)') + ';">' + rel.name + aliveStr + ' <span style="font-size:0.8em;color:var(--text-dim);">[' + rel.relation + '·' + genderStr + ']</span></div>';
        html += '<div class="modal-item-desc">' + rel.age + '岁 | ' + cultStr + '</div>';
        html += '</div></div>';
      });
    }

    // 朋友
    if (sn.friends.length > 0) {
      html += '<div class="modal-section-title" style="margin-top:8px;">🤝 好友</div>';
      sn.friends.forEach(friend => {
        html += '<div class="modal-item-row"><div>';
        html += '<div style="color:var(--text-main);">' + friend.name + '</div>';
        html += '</div></div>';
      });
    }

    // 宿敌
    if (sn.rivals.length > 0) {
      html += '<div class="modal-section-title" style="margin-top:8px;">⚔️ 宿敌</div>';
      sn.rivals.forEach(rival => {
        html += '<div class="modal-item-row"><div>';
        html += '<div style="color:var(--crimson-bright);">' + rival.name + '</div>';
        html += '</div></div>';
      });
    }

    // 宗门信息
    if (npc.sectName) {
      html += '<div class="modal-section-title" style="margin-top:8px;">🏯 宗门</div>';
      html += '<div class="modal-item-row"><div>';
      html += '<div style="color:var(--gold-bright);">' + npc.sectName + '·' + (npc.sectRole || '弟子') + '</div>';
      html += '</div></div>';
    }

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal();Game.gotoNode(\'_npc_detail_' + npcId + '\')">返回</button>');
  },
});
