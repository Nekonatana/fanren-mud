// ===== 扩展8：灵根/宗门联姻/同行/飞书传信 引擎 =====
// Object.assign 扩展 WorldSystem

Object.assign(WorldSystem, {

  // ===== 初始化扩展8状态 =====
  initExpand8State(s) {
    // 兼容旧版字符串灵根，转换为对象格式
    if (typeof s.spiritRoot === 'string') {
      var oldRoot = s.spiritRoot;
      var elements = [];
      if (oldRoot.indexOf('金') >= 0) elements.push('金');
      if (oldRoot.indexOf('木') >= 0) elements.push('木');
      if (oldRoot.indexOf('水') >= 0) elements.push('水');
      if (oldRoot.indexOf('火') >= 0) elements.push('火');
      if (oldRoot.indexOf('土') >= 0) elements.push('土');
      if (elements.length === 0) elements = ['金','木','水','火','土'];
      var tier = elements.length === 5 ? 0 : elements.length === 4 ? 1 : elements.length === 3 ? 2 : elements.length === 2 ? 3 : 4;
      s.spiritRoot = { tier: tier, elements: elements };
    } else if (!s.spiritRoot) {
      s.spiritRoot = { tier: 0, elements: ['金','木','水','火','土'] };
    }
    if (!s.travelCompanion) s.travelCompanion = null;
    if (!s.sectAIEvents) s.sectAIEvents = [];
    if (!s.sectRelations) s.sectRelations = {};
    if (!s.summonedNPCs) s.summonedNPCs = [];
    if (!s.butianPills) s.butianPills = 0;
    if (!s.strippedNPCs) s.strippedNPCs = [];
  },

  // ===== 灵根系统 =====

  // 获取灵根名称
  getSpiritRootName(tier) {
    if (tier < 0 || tier >= SPIRIT_ROOT_TIERS.length) return '未知';
    return SPIRIT_ROOT_TIERS[tier].name;
  },

  // 生成灵根属性
  generateSpiritRoot(isGenius) {
    var weights = isGenius ? WILD_GENIUS_ROOT_WEIGHTS : NPC_ROOT_WEIGHTS;
    var roll = Math.random();
    var cumulative = 0;
    var tier = 0;
    for (var i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (roll < cumulative) { tier = i; break; }
    }
    // 根据等阶选择元素
    var allElements = SPIRIT_ELEMENTS.slice();
    var elements = [];
    var elemCount;
    if (tier === 0) elemCount = 5;
    else if (tier === 1) elemCount = 4;
    else if (tier === 2) elemCount = 3;
    else if (tier === 3) elemCount = 2;
    else elemCount = 1; // 单灵根和天灵根都是1个元素

    // 随机选择元素
    for (var j = 0; j < elemCount; j++) {
      var idx = Math.floor(Math.random() * allElements.length);
      elements.push(allElements[idx]);
      allElements.splice(idx, 1);
    }
    return { tier: tier, elements: elements };
  },

  // 确保NPC有灵根属性
  ensureNPCSpiritRoot(npc) {
    if (!npc) return;
    if (npc.spiritRoot) return;
    var isGenius = false;
    var computedTier = null;
    // 宗门天骄/高层有更好的灵根
    if (npc.sectPosition && (npc.sectPosition.includes('天骄') || npc.sectPosition.includes('圣女') || npc.sectPosition.includes('少主'))) {
      var weights = SECT_GENIUS_ROOT_WEIGHTS;
      var roll = Math.random();
      var cumulative = 0;
      var tier = 0;
      for (var i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (roll < cumulative) { tier = i; break; }
      }
      computedTier = tier;
      isGenius = true;
    }
    if (computedTier !== null) {
      var allElements = (typeof SPIRIT_ELEMENTS !== 'undefined') ? SPIRIT_ELEMENTS.slice() : ['金','木','水','火','土'];
      var elements = [];
      var elemCount;
      if (computedTier === 0) elemCount = 5;
      else if (computedTier === 1) elemCount = 4;
      else if (computedTier === 2) elemCount = 3;
      else if (computedTier === 3) elemCount = 2;
      else elemCount = 1;
      for (var j = 0; j < elemCount; j++) {
        var idx = Math.floor(Math.random() * allElements.length);
        elements.push(allElements[idx]);
        allElements.splice(idx, 1);
      }
      npc.spiritRoot = { tier: computedTier, elements: elements };
    } else {
      npc.spiritRoot = this.generateSpiritRoot(false);
    }

    // 灵根影响初始修为（天骄灵根高但修为可能低）
    if (isGenius && npc.spiritRoot.tier >= 3 && Math.random() < 0.3) {
      // 天才灵根高但修为偏低
      npc.cultLevel = Math.max(0, npc.cultLevel - 2);
      npc.cultName = CULT_LEVELS[npc.cultLevel].name;
      var cult = CULT_LEVELS[npc.cultLevel];
      npc.hp = cult.hpBonus + Math.floor(Math.random() * cult.hpBonus * 0.2);
      npc.maxHp = npc.hp;
      npc.atk = cult.atkBonus + Math.floor(Math.random() * cult.atkBonus * 0.2);
      npc.def = cult.defBonus + Math.floor(Math.random() * cult.defBonus * 0.2);
    }
  },

  // 批量确保NPC灵根
  ensureAllNPCSpiritRoots(s) {
    if (!s.npcList) return;
    for (var i = 0; i < s.npcList.length; i++) {
      if (s.npcList[i].isAlive) {
        this.ensureNPCSpiritRoot(s.npcList[i]);
      }
    }
  },

  // 服用补天丹
  useButianPill() {
    var s = Game.state;
    if (s.butianPills <= 0) {
      UI.toast('你没有补天丹！', 'danger');
      return;
    }
    if (s.spiritRoot.tier >= SPIRIT_ROOT_TIERS.length - 1) {
      UI.toast('你的灵根已达天灵根，无法再提升！', 'warning');
      return;
    }
    s.butianPills--;
    var oldTier = s.spiritRoot.tier;
    s.spiritRoot.tier++;
    // 减少元素数量
    var newCount = s.spiritRoot.tier === 1 ? 4 : s.spiritRoot.tier === 2 ? 3 : s.spiritRoot.tier === 3 ? 2 : 1;
    while (s.spiritRoot.elements.length > newCount) {
      // 随机移除一个非主元素
      s.spiritRoot.elements.splice(Math.floor(Math.random() * s.spiritRoot.elements.length), 1);
    }
    var oldName = SPIRIT_ROOT_TIERS[oldTier].name;
    var newName = SPIRIT_ROOT_TIERS[s.spiritRoot.tier].name;
    UI.showModal(
      '<div style="text-align:center;padding:20px;">' +
      '<div style="font-size:1.4em;color:var(--gold-bright);margin-bottom:10px;">💊 补天丹</div>' +
      '<div style="margin:15px 0;">灵根资质提升！</div>' +
      '<div style="font-size:1.2em;color:var(--jade);">' + oldName + ' → ' + newName + '</div>' +
      '<div style="margin-top:10px;color:var(--text-dim);font-size:0.9em;">' + SPIRIT_ROOT_TIERS[s.spiritRoot.tier].desc + '</div>' +
      '<div style="margin-top:8px;color:var(--text-dim);">剩余补天丹: ' + s.butianPills + '</div>' +
      '<button class="btn-combat" style="margin-top:15px;" onclick="UI.closeModal()">确定</button>' +
      '</div>'
    );
    UI.updateAll();
  },

  // 获取修炼速率倍率
  getCultivateRate(s) {
    if (!s.spiritRoot) return 1.0;
    return SPIRIT_ROOT_TIERS[s.spiritRoot.tier].cultivateRate;
  },

  // 获取法术伤害倍率
  getSpellDamageMult(s) {
    if (!s.spiritRoot) return 1.0;
    return SPIRIT_ROOT_TIERS[s.spiritRoot.tier].spellMult;
  },

  // 计算技能伤害加成（修为+灵根+技能等级）
  computeTechniqueDamage(baseDmg, tech, s) {
    var mult = 1.0;
    // 灵根影响
    mult *= this.getSpellDamageMult(s);
    // 修为影响（每级+4%）
    mult *= (1 + s.cultLevel * 0.04);
    // 技能等级影响（reqStage越高倍率越高）
    var stageBonus = TECH_STAGE_BONUS[tech.reqStage] || 0;
    mult *= (1 + stageBonus);
    // 攻击力贡献（高阶技能更多依赖攻击力）
    var atkContribution = s.atk * (0.15 + tech.reqStage * 0.08);
    return Math.floor((baseDmg + atkContribution) * mult);
  },

  // ===== 剥夺灵根 =====

  showStripRootPanel(npcId) {
    var s = Game.state;
    var npc = s.npcList.find(function(n) { return n.id === npcId && n.isAlive; });
    if (!npc) { UI.toast('未找到该NPC', 'danger'); return; }
    this.ensureNPCSpiritRoot(npc);

    var levelDiff = s.cultLevel - npc.cultLevel;
    var canStrip = levelDiff >= STRIP_ROOT_REQ_LEVEL_DIFF;
    var npcRootName = this.getSpiritRootName(npc.spiritRoot.tier);
    var myRootName = this.getSpiritRootName(s.spiritRoot ? s.spiritRoot.tier : 0);

    var html = '<div class="modal-section">' +
      '<div class="modal-section-title">🔮 剥夺灵根</div>' +
      '<div style="padding:10px;">' +
      '<div style="margin-bottom:8px;">对方灵根: <span style="color:var(--gold-bright);">' + npcRootName + '</span></div>' +
      '<div style="margin-bottom:8px;">你的灵根: <span style="color:var(--jade);">' + myRootName + '</span></div>';

    if (s.spiritRoot && s.spiritRoot.tier >= SPIRIT_ROOT_TIERS.length - 1) {
      html += '<div style="color:var(--text-dim);">你已达天灵根，无法再提升。</div>';
    } else if (!canStrip) {
      html += '<div style="color:var(--crimson-bright);">修为不足！需要高于对方至少' + STRIP_ROOT_REQ_LEVEL_DIFF + '个小境界。</div>';
      html += '<div style="color:var(--text-dim);font-size:0.85em;">当前差距: ' + levelDiff + '级</div>';
    } else if (npc.spiritRoot.tier <= 0) {
      html += '<div style="color:var(--text-dim);">对方已是杂灵根，无可剥夺。</div>';
    } else {
      html += '<div style="color:var(--warning);margin:10px 0;">⚠ 剥夺灵根将引发死战：</div>';
      html += '<div style="color:var(--text-dim);font-size:0.85em;">· 点击后将进入战斗，需击败对方</div>';
      html += '<div style="color:var(--text-dim);font-size:0.85em;">· 胜利后可选择：击杀 / 俘虏 / 释放</div>';
      html += '<div style="color:var(--gold-bright);font-size:0.85em;">· 击杀：你的灵根提升一阶，对方死亡消失</div>';
      html += '<div style="color:var(--crimson-bright);font-size:0.85em;">· 击杀后对方好友/父母将追杀你</div>';
      html += '<div style="color:var(--text-dim);font-size:0.85em;">· 俘虏/释放：对方重伤，灵根变差，修为降低</div>';
      html += '<button class="btn-combat" style="margin-top:12px;border-color:var(--crimson);color:var(--crimson-bright);" onclick="WorldSystem.doStripRoot(\'' + npcId + '\')">发起剥夺之战！</button>';
    }
    html += '<button class="btn-combat" style="margin-top:8px;" onclick="WorldSystem.talkToNPCPanel(\'' + npcId + '\')">返回</button>';
    html += '</div></div>';
    UI.showModal(html);
  },

  doStripRoot(npcId) {
    var s = Game.state;
    var npc = s.npcList.find(function(n) { return n.id === npcId && n.isAlive; });
    if (!npc) return;
    this.ensureNPCSpiritRoot(npc);

    var levelDiff = s.cultLevel - npc.cultLevel;
    if (levelDiff < STRIP_ROOT_REQ_LEVEL_DIFF) {
      UI.toast('修为不足！', 'danger');
      return;
    }
    if (npc.spiritRoot.tier <= 0) {
      UI.toast('对方灵根太低，无可剥夺！', 'warning');
      return;
    }
    if (s.spiritRoot.tier >= SPIRIT_ROOT_TIERS.length - 1) {
      UI.toast('你已达天灵根！', 'warning');
      return;
    }

    // 发起剥夺之战（类似doAttackNPC，但走strip root的胜负节点）
    UI.closeModal();
    UI.renderNarrative([
      {type:"danger",content:"你向" + npc.name + "发起剥夺灵根之战！"},
      {type:"dialogue",content:"「你要夺我灵根？！休想！」" + npc.name + "怒目圆睁，全力迎战。"},
    ]);

    var enemy = {
      name: npc.name + "（" + npc.cultName + "）[死战]",
      hp: npc.hp, atk: npc.atk, def: npc.def,
      exp: Math.floor(CULT_LEVELS[npc.cultLevel].maxExp * 0.15),
      stone: npc.stones, drop: npc.items[0] || null, dropRate: 0.8,
    };
    Game.combatState = {
      enemy: enemy, enemyHp: enemy.hp, enemyMaxHp: enemy.hp,
      onWin: "_strip_root_win_" + npcId, onLose: "_strip_root_lose_" + npcId,
      turn: 0, log: [], isNpc: true, npcId: npcId,
    };
    UI.showCombat(Game.combatState);
    Game.combatLog("剥夺灵根之战：" + enemy.name + "！", "danger");
  },

  // ===== 剥夺灵根战斗胜利 =====
  stripRootVictory(npcId) {
    var s = Game.state;
    var npc = s.npcList.find(function(n) { return n.id === npcId; });
    if (!npc) { Game.wildVictory(); return; }

    this.ensureNPCSpiritRoot(npc);
    if (typeof this.initExpand6State === 'function') this.initExpand6State(s);

    // NPC濒死
    npc.isAlive = true;
    npc.hp = 1;

    // 劫取物品
    var itemTexts = [];
    npc.items.forEach(function(itemId) {
      if (ITEMS[itemId]) {
        Game.addItem(itemId, 1);
        itemTexts.push({type:"reward", content:"\u{1F4E6} \u83B7\u5F97\uFF1A" + ITEMS[itemId].name});
      }
    });
    if (npc.stones > 0) {
      s.spiritStones += npc.stones;
      itemTexts.push({type:"reward", content:"\u{1F48E} \u83B7\u5F97" + npc.stones + "\u7075\u77F3"});
    }
    npc.items = [];
    npc.stones = 0;

    var npcRootName = this.getSpiritRootName(npc.spiritRoot.tier);

    UI.hideCombat();
    Game.combatState = null;

    var texts = [
      {type:"narration", content:npc.name + "\u88AB\u4F60\u51FB\u8D25\uFF0C\u8DEA\u5012\u5728\u5730\uFF0C\u6DF1\u6DF1\u62B5\u62A5\u5230\u4F60\u7684\u51B7\u6F20\u3002"},
      {type:"dialogue", content:"\u300C\u4F60\u2026\u2026\u8981\u593A\u6211\u7075\u6839\uFF1F\uFF01\u300D" + npc.name + "\u9762\u5982\u6B7B\u7070\u3002"},
    ];
    texts = texts.concat(itemTexts);
    texts.push({type:"system_msg", content:"\u5BF9\u65B9\u7075\u6839\uFF1A" + npcRootName + " | \u4F60\u53EF\u9009\u62E9\u5BF9\u5176\u7684\u547D\u8FD0\u3002"});

    UI.renderNarrative(texts);

    // 检查地牢
    var hasDungeon = s.spiritMountain && s.spiritMountain.buildings && s.spiritMountain.buildings["dungeon_cell"];

    var choices = [];
    choices.push({text:"\u{1F5E1}\uFE0F \u51FB\u6740" + npc.name + "\uFF08\u5265\u593A\u7075\u6839+\u6B7B\u4EA1\uFF09", next:"_strip_root_kill_" + npcId, effect:{}});
    choices.push({text:"\u{1F6E1}\uFE0F \u91CD\u4F24" + npc.name + "\uFF08\u5265\u593A\u7075\u6839+\u4F4E\u4FEE\u4E3A\uFF09", next:"_strip_root_release_" + npcId, effect:{}});
    if (hasDungeon) {
      choices.push({text:"\u26D4\uFE0F \u4FD8\u8650" + npc.name + "\uFF08\u5265\u593A\u7075\u6839+\u56DA\u7981\uFF09", next:"_strip_root_capture_" + npcId, effect:{}});
    }
    choices.push({text:"\u653E\u5F03\u5265\u593A\uFF0C\u79BB\u53BB", next:"_wild_return", effect:{}});
    UI.renderChoices(choices);
    UI.updateAll();
  },

  // ===== 剥夺灵根战斗失败 =====
  stripRootDefeat(npcId) {
    var s = Game.state;
    var npc = s.npcList.find(function(n) { return n.id === npcId; });
    if (!npc) { Game.wildDefeat(); return; }

    UI.hideCombat();
    Game.combatState = null;

    npc.mood = -1000;
    npc.hostileToPlayer = true;
    npc.hp = Math.floor(npc.maxHp * 0.5);

    UI.renderNarrative([
      {type:"danger", content:"\u4F60\u88AB" + npc.name + "\u51FB\u8D25\u4E86\uFF01"},
      {type:"dialogue", content:"\u300C\u8774\u8782\u6B32\u52A8\uFF01\u7ADF\u6562\u89C0\u89B0\u6211\u7684\u7075\u6839\uFF01\u300D" + npc.name + "\u6012\u4E0D\u53EF\u9038\u3002"},
      {type:"narration", content:npc.name + "\u5FD2\u5FD2\u79BB\u53BB\uFF0C\u4F60\u672A\u80FD\u5265\u593A\u5176\u7075\u6839\uFF0C\u53CD\u800C\u7ED3\u4E0B\u4E86\u6DF1\u4EC7\u3002"},
      {type:"danger", content:npc.name + "\u5BF9\u4F60\u6068\u4E4B\u5165\u9AA8\uFF0C\u5C06\u6765\u5FC5\u4F1A\u62A5\u590D\uFF01"},
    ]);
    UI.renderChoices([
      {text:"\u7EE7\u7EED\u63A2\u7D22", next:"_wild_continue", effect:{}},
      {text:"\u8FD4\u56DE", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 剥夺灵根：击杀（剥夺+死亡+删除NPC+关系网追杀） =====
  stripRootKill(npcId) {
    var s = Game.state;
    var npc = s.npcList.find(function(n) { return n.id === npcId; });
    if (!npc) return;

    this.ensureNPCSpiritRoot(npc);
    if (typeof this.initExpand6State === 'function') this.initExpand6State(s);

    var oldNPCRoot = this.getSpiritRootName(npc.spiritRoot.tier);

    // 剥夺灵根：玩家灵根提升
    npc.spiritRoot = { tier: 0, elements: ['\u91D1','\u6728','\u6C34','\u706B','\u571F'] };
    if (s.spiritRoot.tier < SPIRIT_ROOT_TIERS.length - 1) {
      s.spiritRoot.tier++;
      var newCount = s.spiritRoot.tier === 1 ? 4 : s.spiritRoot.tier === 2 ? 3 : s.spiritRoot.tier === 3 ? 2 : 1;
      while (s.spiritRoot.elements.length > newCount) {
        s.spiritRoot.elements.splice(Math.floor(Math.random() * s.spiritRoot.elements.length), 1);
      }
    }
    var newMyRoot = this.getSpiritRootName(s.spiritRoot.tier);

    // 击杀NPC
    npc.isAlive = false;
    s.npcKills = (s.npcKills || 0) + 1;
    if (s.npcKills === 1) Game.giveAchievement("npc_first_kill");
    if (s.npcKills >= 5) Game.giveAchievement("npc_kill_5");

    // 永久移除（不再生成）
    if (!s.killedNPCs) s.killedNPCs = [];
    if (!s.killedNPCs.includes(npcId)) s.killedNPCs.push(npcId);

    // 从npcList中删除
    var idx = s.npcList.findIndex(function(n) { return n.id === npcId; });
    if (idx >= 0) s.npcList.splice(idx, 1);

    // 因果值
    s.karma = (s.karma || 0) + 5;
    if (npc.isFriend) {
      s.karma += 5;
      s.heartDemon = (s.heartDemon || 0) + 1;
    }

    // 从好友列表移除
    var fIdx = s.npcFriends.indexOf(npcId);
    if (fIdx >= 0) s.npcFriends.splice(fIdx, 1);

    // 关系网追杀：好友/父母/道侣成为伏击者
    var huntCount = 0;
    if (npc.socialNetwork) {
      var friends = (npc.socialNetwork.friends || []).concat(npc.socialNetwork.familyMembers || []);
      if (npc.socialNetwork.spouse) friends.push({name: npc.socialNetwork.spouse.name});

      friends.forEach(function(f) {
        var targetNPC = s.npcList.find(function(n) { return n.isAlive && n.name === f.name; });
        if (targetNPC) {
          targetNPC.mood = -1000;
          targetNPC.isHostile = true;
          targetNPC.hostileToPlayer = true;
          if (!s.ambushers) s.ambushers = [];
          s.ambushers.push({
            npcId: targetNPC.id,
            name: targetNPC.name,
            reason: "\u5265\u6839\u6740\u4EBA\u4E4B\u4EC7",
            cultLevel: targetNPC.cultLevel,
            hp: targetNPC.hp, atk: targetNPC.atk, def: targetNPC.def,
            ambushChance: 0.35,
          });
          huntCount++;
        }
      });
    }

    // 记录剥夺
    if (!s.strippedNPCs) s.strippedNPCs = [];
    s.strippedNPCs.push({ id: npcId, name: npc.name, time: s.gameDay || 1, fate: 'killed' });

    UI.renderNarrative([
      {type:"danger", content:"\u4F60\u5265\u593A\u4E86" + npc.name + "\u7684" + oldNPCRoot + "\uFF0C\u968F\u540E\u4E00\u51FB\u5C06\u5176\u51FB\u6740\uFF01"},
      {type:"narration", content:npc.name + "\u5DF2\u6B7B\u4EA1\uFF0C\u4ECE\u6B64\u4E16\u95F4\u518D\u65E0\u6B64\u4EBA\u3002"},
      {type:"reward", content:"\u4F60\u7684\u7075\u6839\u63D0\u5347\u81F3\uFF1A" + newMyRoot},
      {type:"danger", content:"\u56E0\u679C\u503C+" + (npc.isFriend ? 10 : 5) + (npc.isFriend ? "\uFF08\u6740\u5BB3\u597D\u53CB\uFF01\u5FC3\u9B54\u503C+1\uFF09" : "")},
    ]);

    if (huntCount > 0) {
      UI.renderNarrative([
        {type:"danger", content:"\u26A0\uFE0F " + npc.name + "\u7684" + huntCount + "\u540D\u81F3\u4EA4\u597D\u53CB/\u7236\u6BCD\u5DF2\u5F97\u77E5\u6B64\u4E8B\uFF0C\u8A93\u8981\u8FFD\u6740\u4F60\uFF01"},
        {type:"system_msg", content:"\u4ED6\u4EEC\u5C06\u5728\u91CE\u5916\u4F0F\u51FB\u4F60\uFF0C\u8BF7\u5C0F\u5FC3\u63A2\u7D22\u3002"},
      ]);
    }

    UI.renderChoices([
      {text:"\u7EE7\u7EED\u63A2\u7D22", next:"_wild_continue", effect:{}},
      {text:"\u8FD4\u56DE", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 剥夺灵根：重伤释放（剥夺+灵根变差+修为降低+敌视） =====
  stripRootRelease(npcId) {
    var s = Game.state;
    var npc = s.npcList.find(function(n) { return n.id === npcId; });
    if (!npc) return;

    this.ensureNPCSpiritRoot(npc);

    var oldNPCRoot = this.getSpiritRootName(npc.spiritRoot.tier);
    var oldCultLevel = npc.cultLevel;
    var oldCultName = npc.cultName;

    // 剥夺灵根：降为杂灵根
    npc.spiritRoot = { tier: 0, elements: ['\u91D1','\u6728','\u6C34','\u706B','\u571F'] };

    // 玩家灵根提升
    if (s.spiritRoot.tier < SPIRIT_ROOT_TIERS.length - 1) {
      s.spiritRoot.tier++;
      var newCount = s.spiritRoot.tier === 1 ? 4 : s.spiritRoot.tier === 2 ? 3 : s.spiritRoot.tier === 3 ? 2 : 1;
      while (s.spiritRoot.elements.length > newCount) {
        s.spiritRoot.elements.splice(Math.floor(Math.random() * s.spiritRoot.elements.length), 1);
      }
    }
    var newMyRoot = this.getSpiritRootName(s.spiritRoot.tier);

    // 重伤：修为降低1-3级
    var levelDrop = 1 + Math.floor(Math.random() * 3);
    npc.cultLevel = Math.max(0, npc.cultLevel - levelDrop);
    npc.cultName = CULT_LEVELS[npc.cultLevel].name;
    npc.hp = Math.floor((CULT_LEVELS[npc.cultLevel].hpBonus + 100) * 0.3);
    npc.maxHp = CULT_LEVELS[npc.cultLevel].hpBonus + 100;
    npc.atk = Math.floor(npc.atk * 0.6);
    npc.def = Math.floor(npc.def * 0.6);

    // NPC敌视
    npc.mood = -1000;
    npc.hostileToPlayer = true;
    npc.isHostile = true;

    // 记录剥夺
    if (!s.strippedNPCs) s.strippedNPCs = [];
    s.strippedNPCs.push({ id: npcId, name: npc.name, time: s.gameDay || 1, fate: 'released' });

    // 因果值
    s.karma = (s.karma || 0) + 3;

    UI.renderNarrative([
      {type:"danger", content:"\u4F60\u5265\u593A\u4E86" + npc.name + "\u7684" + oldNPCRoot + "\uFF0C\u5C06\u5176\u91CD\u4F24\u540E\u91CA\u653E\u3002"},
      {type:"narration", content:npc.name + "\u7075\u6839\u88AB\u593A\uFF0C\u4FEE\u4E3A\u4ECE" + oldCultName + "\u8DD1\u843D\u81F3" + npc.cultName + "\uFF0C\u5DF2\u6210\u5E9F\u4EBA\u3002"},
      {type:"reward", content:"\u4F60\u7684\u7075\u6839\u63D0\u5347\u81F3\uFF1A" + newMyRoot},
      {type:"dialogue", content:"\u300C\u4F60\u2026\u2026\u5265\u6211\u7075\u6839\u2026\u2026\u6B64\u4EC7\u4E0D\u5171\u6234\u5929\u2026\u2026\u300D" + npc.name + "\u8E94\u8DB4\u7740\u9003\u79BB\u3002"},
      {type:"danger", content:npc.name + "\u5BF9\u4F60\u6068\u4E4B\u5165\u9AA8\uFF0C\u4FEE\u4E3A\u5927\u964D\u540E\u53EF\u80FD\u4ECD\u4F1A\u62A5\u590D\u3002"},
      {type:"danger", content:"\u56E0\u679C\u503C+3"},
    ]);

    UI.renderChoices([
      {text:"\u7EE7\u7EED\u63A2\u7D22", next:"_wild_continue", effect:{}},
      {text:"\u8FD4\u56DE", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== 剥夺灵根：俘虏（剥夺+灵根变差+修为降低+囚禁） =====
  stripRootCapture(npcId) {
    var s = Game.state;
    var npc = s.npcList.find(function(n) { return n.id === npcId; });
    if (!npc) return;

    this.ensureNPCSpiritRoot(npc);
    if (typeof this.initExpand6State === 'function') this.initExpand6State(s);

    var oldNPCRoot = this.getSpiritRootName(npc.spiritRoot.tier);
    var oldCultName = npc.cultName;

    // 剥夺灵根
    npc.spiritRoot = { tier: 0, elements: ['\u91D1','\u6728','\u6C34','\u706B','\u571F'] };

    // 玩家灵根提升
    if (s.spiritRoot.tier < SPIRIT_ROOT_TIERS.length - 1) {
      s.spiritRoot.tier++;
      var newCount = s.spiritRoot.tier === 1 ? 4 : s.spiritRoot.tier === 2 ? 3 : s.spiritRoot.tier === 3 ? 2 : 1;
      while (s.spiritRoot.elements.length > newCount) {
        s.spiritRoot.elements.splice(Math.floor(Math.random() * s.spiritRoot.elements.length), 1);
      }
    }
    var newMyRoot = this.getSpiritRootName(s.spiritRoot.tier);

    // 重伤：修为降低2-4级
    var levelDrop = 2 + Math.floor(Math.random() * 3);
    npc.cultLevel = Math.max(0, npc.cultLevel - levelDrop);
    npc.cultName = CULT_LEVELS[npc.cultLevel].name;
    npc.hp = Math.floor((CULT_LEVELS[npc.cultLevel].hpBonus + 100) * 0.2);
    npc.maxHp = CULT_LEVELS[npc.cultLevel].hpBonus + 100;
    npc.atk = Math.floor(npc.atk * 0.5);
    npc.def = Math.floor(npc.def * 0.5);

    // 加入俘虏列表
    s.captives.push({
      npcId: npcId,
      name: npc.name,
      cultLevel: npc.cultLevel,
      cultName: npc.cultName,
      capturedDay: s.gameDay || 1,
    });
    npc.isCaptive = true;
    npc.isAlive = false; // 不再出现在野外

    // NPC敌视
    npc.mood = -1000;
    npc.hostileToPlayer = true;

    // 记录剥夺
    if (!s.strippedNPCs) s.strippedNPCs = [];
    s.strippedNPCs.push({ id: npcId, name: npc.name, time: s.gameDay || 1, fate: 'captured' });

    // 因果值
    s.karma = (s.karma || 0) + 4;

    UI.renderNarrative([
      {type:"danger", content:"\u4F60\u5265\u593A\u4E86" + npc.name + "\u7684" + oldNPCRoot + "\uFF0C\u5C06\u5176\u56DA\u7981\u4E8E\u5730\u7262\u4E4B\u4E2D\u3002"},
      {type:"narration", content:npc.name + "\u7075\u6839\u88AB\u593A\uFF0C\u4FEE\u4E3A\u4ECE" + oldCultName + "\u8DD1\u843D\u81F3" + npc.cultName + "\uFF0C\u5DF2\u88AB\u56DA\u7981\u3002"},
      {type:"reward", content:"\u4F60\u7684\u7075\u6839\u63D0\u5347\u81F3\uFF1A" + newMyRoot},
      {type:"dialogue", content:"\u300C\u4F60\u2026\u2026\u5265\u6211\u7075\u6839\u2026\u2026\u53C8\u5C06\u6211\u56DA\u7981\u2026\u2026\u300D" + npc.name + "\u7EDD\u671B\u5730\u88AB\u62BD\u5165\u5730\u7262\u3002"},
      {type:"danger", content:"\u56E0\u679C\u503C+4"},
    ]);

    // 标记好友可能来救人
    if (typeof this.markFriendsForRescue === 'function') {
      this.markFriendsForRescue(npc, s);
    }

    UI.renderChoices([
      {text:"\u7EE7\u7EED\u63A2\u7D22", next:"_wild_continue", effect:{}},
      {text:"\u8FD4\u56DE", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },

  // ===== NPC面板灵根显示 =====

  // 在NPC详情面板添加灵根信息
  getNPCSpiritRootInfo(npc) {
    this.ensureNPCSpiritRoot(npc);
    var rootName = this.getSpiritRootName(npc.spiritRoot.tier);
    var elems = npc.spiritRoot.elements.join('');
    return rootName + '(' + elems + ')';
  },

  // ===== 同行系统 =====

  // 显示同行面板
  showTravelCompanionPanel() {
    var s = Game.state;
    this.ensureAllNPCSpiritRoots(s);

    var html = '<div class="modal-section">' +
      '<div class="modal-section-title">🚶 同行伙伴</div>';

    if (s.travelCompanion) {
      var comp = s.npcList.find(function(n) { return n.id === s.travelCompanion; });
      if (comp) {
        html += '<div style="padding:10px;">';
        html += '<div style="margin-bottom:8px;">当前同行: <span style="color:var(--gold-bright);">' + comp.name + '</span></div>';
        html += '<div class="modal-item-desc">好感度: ' + (comp.mood || 0) + ' | ' + (comp.cultName || '凡人') + '</div>';
        html += '<button class="btn-combat" style="margin-top:8px;border-color:var(--crimson);color:var(--crimson-bright);" onclick="WorldSystem.dismissTravelCompanion()">解除同行</button>';
        html += '</div>';
      }
    } else {
      // 列出可同行的NPC
      var candidates = s.npcList.filter(function(n) {
        return n.isAlive && n.mood >= TRAVEL_TOGETHER_AFFINITY && !n.isChild && n.area === s.location;
      });

      // 也检查道侣
      if (s.companions && s.companions.length > 0) {
        html += '<div style="padding:8px 10px;color:var(--text-dim);">道侣可随时同行：</div>';
        s.companions.forEach(function(c) {
          var comp = COMPANIONS[c];
          if (comp) {
            html += '<div class="modal-item-row" onclick="WorldSystem.setTravelCompanionByComp(\'' + c + '\')"><div>';
            html += '<div style="color:var(--gold-bright);">' + comp.name + '</div>';
            html += '<div class="modal-item-desc">道侣</div>';
            html += '</div></div>';
          }
        });
      }

      if (candidates.length > 0) {
        html += '<div style="padding:8px 10px;color:var(--text-dim);">可同行NPC（好感≥' + TRAVEL_TOGETHER_AFFINITY + '）：</div>';
        var self = this;
        candidates.forEach(function(npc) {
          self.ensureNPCSpiritRoot(npc);
          html += '<div class="modal-item-row" onclick="WorldSystem.setTravelCompanion(\'' + npc.id + '\')"><div>';
          html += '<div style="color:var(--gold-bright);">' + npc.name + ' <span style="font-size:0.8em;color:var(--text-dim);">' + npc.cultName + '</span></div>';
          html += '<div class="modal-item-desc">好感: ' + npc.mood + ' | ' + self.getSpiritRootName(npc.spiritRoot.tier) + '</div>';
          html += '</div></div>';
        });
      } else {
        if (!s.companions || s.companions.length === 0) {
          html += '<div style="padding:15px;color:var(--text-dim);text-align:center;">暂无可同行的伙伴</div>';
          html += '<div style="padding:0 15px 10px;color:var(--text-dim);font-size:0.85em;text-align:center;">需要好感度≥' + TRAVEL_TOGETHER_AFFINITY + '的NPC或道侣</div>';
        }
      }
    }

    html += '<button class="btn-combat" style="margin:10px;" onclick="UI.closeModal()">关闭</button>';
    html += '</div>';
    UI.showModal(html);
  },

  setTravelCompanion(npcId) {
    var s = Game.state;
    var npc = s.npcList.find(function(n) { return n.id === npcId; });
    if (!npc) return;
    s.travelCompanion = npcId;
    UI.closeModal();
    UI.toast(npc.name + '加入同行！', 'success');
    UI.updateAll();
  },

  setTravelCompanionByComp(compId) {
    var s = Game.state;
    // 道侣同行 - 存储为特殊标记
    s.travelCompanion = 'comp_' + compId;
    UI.closeModal();
    var comp = COMPANIONS[compId];
    if (comp) UI.toast(comp.name + '与你同行！', 'success');
    UI.updateAll();
  },

  dismissTravelCompanion() {
    var s = Game.state;
    s.travelCompanion = null;
    UI.closeModal();
    UI.toast('已解除同行', 'info');
    UI.updateAll();
  },

  // 获取同行NPC的战斗属性
  getTravelCompanionCombat(s) {
    if (!s.travelCompanion) return null;
    if (s.travelCompanion.startsWith('comp_')) {
      var compId = s.travelCompanion.replace('comp_', '');
      var comp = COMPANIONS[compId];
      if (!comp) return null;
      var cData = s.companionData[compId] || { level: 1, affinity: 0 };
      var levelMult = 1 + (cData.level - 1) * COMPANION_LEVEL_DATA.atkGrowth;
      return {
        name: comp.name,
        atk: Math.floor(comp.atkBonus * levelMult),
        def: Math.floor((comp.defBonus || 0) * levelMult),
      };
    }
    var npc = s.npcList.find(function(n) { return n.id === s.travelCompanion; });
    if (!npc) return null;
    return {
      name: npc.name,
      atk: npc.atk || 0,
      def: npc.def || 0,
      isNPC: true,
      npc: npc,
    };
  },

  // ===== 飞书传信 =====

  showSummonPanel() {
    var s = Game.state;
    var html = '<div class="modal-section">' +
      '<div class="modal-section-title">📜 飞书传信</div>' +
      '<div style="padding:10px;color:var(--text-dim);">消耗' + SUMMON_COSTS.stones + '灵石+传音符，将关系密切之人召唤至身边</div>';

    if ((s.spiritStones || 0) < SUMMON_COSTS.stones) {
      html += '<div style="padding:10px;color:var(--crimson-bright);">灵石不足！</div>';
    } else {
      var hasTarget = false;

      // 道侣
      if (s.companions && s.companions.length > 0) {
        html += '<div class="modal-section-title" style="margin-top:8px;">💑 道侣</div>';
        s.companions.forEach(function(c) {
          var comp = COMPANIONS[c];
          if (comp) {
            hasTarget = true;
            html += '<div class="modal-item-row" onclick="WorldSystem.doSummonNPC(\'comp|' + c + '\')"><div>';
            html += '<div style="color:var(--gold-bright);">' + comp.name + '</div>';
            html += '<div class="modal-item-desc">道侣</div></div></div>';
          }
        });
      }

      // NPC好友/结义/义父母
      if (s.npcList) {
        var friends = s.npcList.filter(function(n) { return n.isAlive && n.mood >= 60; });
        if (friends.length > 0) {
          html += '<div class="modal-section-title" style="margin-top:8px;">👤 好友/结义/义父母</div>';
          friends.forEach(function(npc) {
            hasTarget = true;
            var relationStr = '';
            if (npc.socialNetwork) {
              if (npc.socialNetwork.spouse && npc.socialNetwork.spouse.npcId === 'player') relationStr = '道侣';
              else if (npc.isSwornSibling) relationStr = '结义';
              else if (npc.isGodparent) relationStr = '义父母';
              else relationStr = '好友';
            } else {
              relationStr = '好友';
            }
            html += '<div class="modal-item-row" onclick="WorldSystem.doSummonNPC(\'npc|' + npc.id + '\')"><div>';
            html += '<div style="color:var(--gold-bright);">' + npc.name + ' <span style="font-size:0.8em;color:var(--text-dim);">[' + relationStr + ']</span></div>';
            html += '<div class="modal-item-desc">' + (npc.cultName || '凡人') + ' | 当前: ' + (npc.area || '未知') + '</div>';
            html += '</div></div>';
          });
        }
      }

      if (!hasTarget) {
        html += '<div style="padding:15px;color:var(--text-dim);text-align:center;">暂无可召唤之人</div>';
      }
    }

    html += '<button class="btn-combat" style="margin:10px;" onclick="UI.closeModal()">关闭</button>';
    html += '</div>';
    UI.showModal(html);
  },

  doSummonNPC(target) {
    var s = Game.state;
    var parts = target.split('|');
    var type = parts[0];
    var id = parts[1];

    if ((s.spiritStones || 0) < SUMMON_COSTS.stones) {
      UI.toast('灵石不足！', 'danger');
      return;
    }

    s.spiritStones = (s.spiritStones || 0) - SUMMON_COSTS.stones;

    if (type === 'comp') {
      // 道侣召唤 - 道侣是随行系统，直接召唤到身边
      var comp = COMPANIONS[id];
      if (comp) {
        // 如果道侣有npcId关联，也移动NPC
        s.companions = s.companions || [];
        UI.closeModal();
        UI.showModal(
          '<div style="text-align:center;padding:20px;">' +
          '<div style="font-size:1.3em;color:var(--gold-bright);margin-bottom:10px;">📜 飞书传信</div>' +
          '<div>传音符化作流光，' + comp.name + '已收到你的传信！</div>' +
          '<div style="margin-top:8px;color:var(--jade);">' + comp.name + '已来到你身边！</div>' +
          '<button class="btn-combat" style="margin-top:15px;" onclick="UI.closeModal()">确定</button>' +
          '</div>'
        );
      }
    } else if (type === 'npc') {
      var npc = s.npcList.find(function(n) { return n.id === id; });
      if (npc) {
        var oldArea = npc.area;
        npc.area = s.location;
        if (!s.summonedNPCs) s.summonedNPCs = [];
        s.summonedNPCs.push({ id: npc.id, fromArea: oldArea, time: s.gameDay || 1 });
        UI.closeModal();
        UI.showModal(
          '<div style="text-align:center;padding:20px;">' +
          '<div style="font-size:1.3em;color:var(--gold-bright);margin-bottom:10px;">📜 飞书传信</div>' +
          '<div>传音符化作流光飞向' + oldArea + '……</div>' +
          '<div style="margin-top:8px;color:var(--jade);">' + npc.name + '收到传信，已赶到' + s.location + '！</div>' +
          '<button class="btn-combat" style="margin-top:15px;" onclick="UI.closeModal()">确定</button>' +
          '</div>'
        );
      }
    }
    UI.updateAll();
  },

  // ===== 宗门AI事件 =====

  // 每日宗门AI事件
  dailySectAIEvents(s) {
    if (!SECT_RANKINGS || Object.keys(SECT_RANKINGS).length < 2) return;

    // 15%概率触发
    if (Math.random() > 0.15) return;

    // 随机选两个宗门
    var allSects = Object.values(SECT_RANKINGS);
    var idx1 = Math.floor(Math.random() * allSects.length);
    var idx2 = Math.floor(Math.random() * allSects.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * allSects.length);
    }
    var sect1 = allSects[idx1];
    var sect2 = allSects[idx2];

    // 随机事件类型
    var roll = Math.random();
    var cumulative = 0;
    var eventType = SECT_AI_EVENTS[0];
    for (var i = 0; i < SECT_AI_EVENTS.length; i++) {
      cumulative += SECT_AI_EVENTS[i].weight;
      if (roll < cumulative) { eventType = SECT_AI_EVENTS[i]; break; }
    }

    // 记录事件
    var event = {
      type: eventType.type,
      desc: eventType.desc.replace('{sect1}', sect1.name).replace('{sect2}', sect2.name),
      sect1: sect1.name,
      sect2: sect2.name,
      day: s.gameDay || 1,
    };

    if (!s.sectAIEvents) s.sectAIEvents = [];
    s.sectAIEvents.unshift(event);
    if (s.sectAIEvents.length > 20) s.sectAIEvents.pop();

    // 更新宗门实力
    this.changeSectStrength(sect1.name, eventType.strengthChange1);
    this.changeSectStrength(sect2.name, eventType.strengthChange2);

    // 联姻/同盟时更新关系
    if (eventType.type === 'alliance') {
      if (!s.sectRelations) s.sectRelations = {};
      var key = sect1.name + '|' + sect2.name;
      s.sectRelations[key] = { type: 'alliance', day: s.gameDay || 1 };
    }
  },

  // 修改宗门实力
  changeSectStrength(sectName, delta) {
    if (!SECT_RANKINGS) return;
    for (var key in SECT_RANKINGS) {
      if (SECT_RANKINGS[key].name === sectName) {
        if (!SECT_RANKINGS[key].strength) SECT_RANKINGS[key].strength = 1.0;
        SECT_RANKINGS[key].strength = Math.max(0.1, SECT_RANKINGS[key].strength + delta);
        break;
      }
    }
  },

  // 显示宗门动态面板
  showSectEventsPanel() {
    var s = Game.state;
    if (!s.sectAIEvents || s.sectAIEvents.length === 0) {
      UI.toast('暂无宗门动态', 'info');
      return;
    }
    var html = '<div class="modal-section">' +
      '<div class="modal-section-title">📋 宗门动态</div>';
    s.sectAIEvents.forEach(function(e) {
      html += '<div class="modal-item-row" style="flex-direction:column;align-items:flex-start;">';
      html += '<div style="color:var(--gold-bright);font-size:0.9em;">第' + e.day + '天 ' + e.desc + '</div>';
      html += '</div>';
    });
    html += '<button class="btn-combat" style="margin:10px;" onclick="UI.closeModal()">关闭</button>';
    html += '</div>';
    UI.showModal(html);
  },

  // ===== 玩家宗门联姻 =====

  showSectMarriagePanel() {
    var s = Game.state;
    if (!s.ownSect) {
      UI.toast('你还没有自立宗门！', 'warning');
      return;
    }

    var html = '<div class="modal-section">' +
      '<div class="modal-section-title">💍 宗门联姻</div>' +
      '<div style="padding:10px;color:var(--text-dim);">通过联姻结盟，提升宗门实力</div>';

    // 选项：为弟子联姻 / 自己联姻
    html += '<div class="modal-item-row" onclick="WorldSystem.showSectMarriageForMember()"><div>';
    html += '<div style="color:var(--gold-bright);">为弟子/高层联姻</div>';
    html += '<div class="modal-item-desc">安排宗门成员与其他宗门联姻</div>';
    html += '</div></div>';

    html += '<div class="modal-item-row" onclick="WorldSystem.showSectMarriageForSelf()"><div>';
    html += '<div style="color:var(--gold-bright);">自己联姻</div>';
    html += '<div class="modal-item-desc">与目标宗门NPC结为道侣，缔结同盟</div>';
    html += '</div></div>';

    html += '<button class="btn-combat" style="margin:10px;" onclick="UI.closeModal()">关闭</button>';
    html += '</div>';
    UI.showModal(html);
  },

  showSectMarriageForMember() {
    var s = Game.state;
    var myMembers = (s.ownSectMembers && s.ownSectMembers.length > 0) ? s.ownSectMembers : ((s.ownSect && s.ownSect.members) ? s.ownSect.members : []);
    if (myMembers.length === 0) {
      UI.toast('宗门暂无成员', 'info');
      return;
    }

    var html = '<div class="modal-section">' +
      '<div class="modal-section-title">选择联姻成员</div>';

    myMembers.forEach(function(member) {
      var isObj = typeof member === 'object' && member !== null;
      var npcId = isObj ? member.npcId : member;
      var npc = s.npcList.find(function(n) { return n.id === npcId && n.isAlive; });
      if (npc && !npc.isChild) {
        html += '<div class="modal-item-row" onclick="WorldSystem.showMarriageTargetSects(\'' + npcId + '\')"><div>';
        html += '<div style="color:var(--gold-bright);">' + npc.name + ' <span style="font-size:0.8em;color:var(--text-dim);">' + (npc.isFemale ? '女' : '男') + '</span></div>';
        html += '<div class="modal-item-desc">' + (npc.cultName || '凡人') + '</div>';
        html += '</div></div>';
      }
    });

    html += '<button class="btn-combat" style="margin:10px;" onclick="WorldSystem.showSectMarriagePanel()">返回</button>';
    html += '</div>';
    UI.showModal(html);
  },

  showMarriageTargetSects(npcId) {
    var s = Game.state;
    var npc = s.npcList.find(function(n) { return n.id === npcId; });
    if (!npc) return;

    var html = '<div class="modal-section">' +
      '<div class="modal-section-title">选择联姻目标宗门</div>' +
      '<div style="padding:8px 10px;color:var(--text-dim);">为' + npc.name + '选择联姻宗门</div>';

    var mySectId = s.ownSectId || (s.ownSect && s.ownSect.name) || '';
    if (SECT_RANKINGS) {
      Object.values(SECT_RANKINGS).forEach(function(sect) {
        if (!mySectId || sect.name === SECTS_AND_FAMILIES[mySectId]?.name) return;
        var strength = sect.strength || 1.0;
        var myStrength = s.ownSectStrength || 1.0;
        var canForce = myStrength > strength * FORCE_MARRIAGE_MULT;
        html += '<div class="modal-item-row" onclick="WorldSystem.showMarriageTargetNPCs(\'' + npcId + '|' + sect.name + '\')"><div>';
        html += '<div style="color:var(--gold-bright);">' + sect.name + '</div>';
        html += '<div class="modal-item-desc">实力: ' + (strength * 100).toFixed(0) + (canForce ? ' | 可强制联姻' : '') + '</div>';
        html += '</div></div>';
      });
    }

    html += '<button class="btn-combat" style="margin:10px;" onclick="WorldSystem.showSectMarriageForMember()">返回</button>';
    html += '</div>';
    UI.showModal(html);
  },

  showMarriageTargetNPCs(params) {
    var s = Game.state;
    var parts = params.split('|');
    var npcId = parts[0];
    var sectName = parts[1];
    var npc = s.npcList.find(function(n) { return n.id === npcId; });
    if (!npc) return;

    // 找到目标宗门的异性NPC
    var targets = s.npcList.filter(function(n) {
      return n.isAlive && n.sectName === sectName && n.isFemale !== npc.isFemale && !n.isChild && n.mood > -50;
    });

    if (targets.length === 0) {
      UI.toast(sectName + '中暂无合适的联姻对象', 'info');
      return;
    }

    var html = '<div class="modal-section">' +
      '<div class="modal-section-title">选择联姻对象</div>';

    var myStrength = s.ownSectStrength || 1.0;
    var targetSect = Object.values(SECT_RANKINGS).find(function(r) { return r.name === sectName; });
    var targetStrength = (targetSect && targetSect.strength) || 1.0;
    var canForce = myStrength > targetStrength * FORCE_MARRIAGE_MULT;

    targets.forEach(function(target) {
      var targetMood = target.mood || 0;
      var npcMood = npc.mood || 0;
      var successRate = 0.5 + (npcMood - 50) * 0.005 + (targetMood - 50) * 0.003 + (myStrength - targetStrength) * 0.2;
      successRate = Math.min(0.95, Math.max(0.1, successRate));
      html += '<div class="modal-item-row" onclick="WorldSystem.doSectMarriage(\'' + npcId + '|' + target.id + '|' + sectName + '\')"><div>';
      html += '<div style="color:var(--gold-bright);">' + target.name + ' <span style="font-size:0.8em;color:var(--text-dim);">' + (target.cultName || '凡人') + '</span></div>';
      html += '<div class="modal-item-desc">双方好感综合（己方' + npcMood + '/对方' + targetMood + '）| 成功率: ' + (successRate * 100).toFixed(0) + '%</div>';
      html += '</div></div>';
    });

    if (canForce) {
      html += '<div style="padding:8px 10px;color:var(--crimson-bright);font-size:0.85em;">⚠ 你宗门实力远超对方，可强制联姻（100%成功，但对方宗门可能不满）</div>';
    }

    html += '<button class="btn-combat" style="margin:10px;" onclick="WorldSystem.showMarriageTargetSects(\'' + npcId + '\')">返回</button>';
    html += '</div>';
    UI.showModal(html);
  },

  doSectMarriage(params) {
    var s = Game.state;
    var parts = params.split('|');
    var npcId = parts[0];
    var targetId = parts[1];
    var sectName = parts[2];

    var npc = s.npcList.find(function(n) { return n.id === npcId; });
    var target = s.npcList.find(function(n) { return n.id === targetId; });
    if (!npc || !target) return;

    var myStrength = s.ownSectStrength || 1.0;
    var targetSect = Object.values(SECT_RANKINGS).find(function(r) { return r.name === sectName; });
    var targetStrength = (targetSect && targetSect.strength) || 1.0;
    var canForce = myStrength > targetStrength * FORCE_MARRIAGE_MULT;

    var targetMood = target.mood || 0;
    var npcMood = npc.mood || 0;
    var successRate = 0.5 + (npcMood - 50) * 0.005 + (targetMood - 50) * 0.003 + (myStrength - targetStrength) * 0.2;
    successRate = Math.min(0.95, Math.max(0.1, successRate));

    var success = canForce || Math.random() < successRate;
    var mySectId = s.ownSectId || (s.ownSect && s.ownSect.name) || '';
    var mySectDisplay = s.ownSectId || (s.ownSect && s.ownSect.name) || '你的宗门';

    if (success) {
      // 联姻成功
      npc.socialNetwork = npc.socialNetwork || { spouse: null, familyMembers: [], friends: [], rivals: [], relatives: [], godparents: [] };
      npc.socialNetwork.spouse = { npcId: target.id, name: target.name, isFemale: target.isFemale };
      target.socialNetwork = target.socialNetwork || { spouse: null, familyMembers: [], friends: [], rivals: [], relatives: [], godparents: [] };
      target.socialNetwork.spouse = { npcId: npc.id, name: npc.name, isFemale: npc.isFemale };
      target.mood = (target.mood || 0) + 20;
      npc.mood = (npc.mood || 0) + 20;

      // 宗门结盟
      if (!s.sectRelations) s.sectRelations = {};
      s.sectRelations[(mySectId || '') + '|' + sectName] = { type: 'marriage', day: s.gameDay || 1 };
      // 实力提升
      s.ownSectStrength = (s.ownSectStrength || 1.0) + 0.08;
      this.changeSectStrength(sectName, 0.08);

      UI.closeModal();
      UI.showModal(
        '<div style="text-align:center;padding:20px;">' +
        '<div style="font-size:1.3em;color:var(--gold-bright);margin-bottom:10px;">💍 联姻成功！</div>' +
        '<div>' + npc.name + '与' + target.name + '喜结连理！</div>' +
        '<div style="margin-top:8px;color:var(--jade);">' + mySectDisplay + '与' + sectName + '结为同盟！</div>' +
        '<div style="margin-top:5px;color:var(--text-dim);">双方宗门实力提升！</div>' +
        (canForce ? '<div style="margin-top:5px;color:var(--crimson-bright);">（强制联姻，对方宗门心存不满）</div>' : '') +
        '<button class="btn-combat" style="margin-top:15px;" onclick="UI.closeModal()">确定</button>' +
        '</div>'
      );
    } else {
      // 联姻失败
      target.mood = (target.mood || 0) - 10;
      UI.closeModal();
      UI.showModal(
        '<div style="text-align:center;padding:20px;">' +
        '<div style="font-size:1.3em;color:var(--crimson-bright);margin-bottom:10px;">联姻失败</div>' +
        '<div>' + sectName + '拒绝了联姻提议。</div>' +
        '<div style="margin-top:5px;color:var(--text-dim);">对方认为' + target.name + '不宜联姻。</div>' +
        '<button class="btn-combat" style="margin-top:15px;" onclick="UI.closeModal()">确定</button>' +
        '</div>'
      );
    }
    UI.updateAll();
  },

  showSectMarriageForSelf() {
    var s = Game.state;
    var mySectId = s.ownSectId || (s.ownSect && s.ownSect.name) || '';
    var html = '<div class="modal-section">' +
      '<div class="modal-section-title">选择联姻宗门</div>' +
      '<div style="padding:8px 10px;color:var(--text-dim);">你将与目标宗门NPC结为道侣</div>';

    if (SECT_RANKINGS) {
      Object.values(SECT_RANKINGS).forEach(function(sect) {
        if (!mySectId || sect.name === SECTS_AND_FAMILIES[mySectId]?.name) return;
        var strength = sect.strength || 1.0;
        var myStrength = s.ownSectStrength || 1.0;
        var canForce = myStrength > strength * FORCE_MARRIAGE_MULT;
        html += '<div class="modal-item-row" onclick="WorldSystem.showSelfMarriageTargets(\'' + sect.name + '\')"><div>';
        html += '<div style="color:var(--gold-bright);">' + sect.name + '</div>';
        html += '<div class="modal-item-desc">实力: ' + (strength * 100).toFixed(0) + (canForce ? ' | 可强制' : '') + '</div>';
        html += '</div></div>';
      });
    }

    html += '<button class="btn-combat" style="margin:10px;" onclick="WorldSystem.showSectMarriagePanel()">返回</button>';
    html += '</div>';
    UI.showModal(html);
  },

  showSelfMarriageTargets(sectName) {
    var s = Game.state;
    var isFemale = s.gender === '女';
    var targets = s.npcList.filter(function(n) {
      return n.isAlive && n.sectName === sectName && n.isFemale !== isFemale && !n.isChild;
    });

    if (targets.length === 0) {
      UI.toast(sectName + '中暂无合适的联姻对象', 'info');
      return;
    }

    var html = '<div class="modal-section">' +
      '<div class="modal-section-title">选择联姻对象</div>';

    var myStrength = s.ownSectStrength || 1.0;
    var targetSect = Object.values(SECT_RANKINGS).find(function(r) { return r.name === sectName; });
    var targetStrength = (targetSect && targetSect.strength) || 1.0;
    var canForce = myStrength > targetStrength * FORCE_MARRIAGE_MULT;

    targets.forEach(function(target) {
      var targetMood = target.mood || 0;
      var playerMood = 100;
      var successRate = 0.5 + (playerMood - 50) * 0.005 + (targetMood - 50) * 0.003 + (myStrength - targetStrength) * 0.2;
      successRate = Math.min(0.95, Math.max(0.1, successRate));
      html += '<div class="modal-item-row" onclick="WorldSystem.doSelfMarriage(\'' + target.id + '|' + sectName + '\')"><div>';
      html += '<div style="color:var(--gold-bright);">' + target.name + ' <span style="font-size:0.8em;color:var(--text-dim);">' + (target.cultName || '凡人') + '</span></div>';
      html += '<div class="modal-item-desc">双方好感综合（己方' + playerMood + '/对方' + targetMood + '）| 成功率: ' + (successRate * 100).toFixed(0) + '%</div>';
      html += '</div></div>';
    });

    if (canForce) {
      html += '<div style="padding:8px 10px;color:var(--crimson-bright);font-size:0.85em;">⚠ 你宗门实力远超对方，可强制联姻</div>';
    }

    html += '<button class="btn-combat" style="margin:10px;" onclick="WorldSystem.showSectMarriageForSelf()">返回</button>';
    html += '</div>';
    UI.showModal(html);
  },

  doSelfMarriage(params) {
    var s = Game.state;
    var parts = params.split('|');
    var targetId = parts[0];
    var sectName = parts[1];
    var target = s.npcList.find(function(n) { return n.id === targetId; });
    if (!target) return;

    var myStrength = s.ownSectStrength || 1.0;
    var targetSect = Object.values(SECT_RANKINGS).find(function(r) { return r.name === sectName; });
    var targetStrength = (targetSect && targetSect.strength) || 1.0;
    var canForce = myStrength > targetStrength * FORCE_MARRIAGE_MULT;

    var targetMood = target.mood || 0;
    var playerMood = 100;
    var successRate = 0.5 + (playerMood - 50) * 0.005 + (targetMood - 50) * 0.003 + (myStrength - targetStrength) * 0.2;
    successRate = Math.min(0.95, Math.max(0.1, successRate));
    var success = canForce || Math.random() < successRate;
    var mySectId = s.ownSectId || (s.ownSect && s.ownSect.name) || '';
    var mySectDisplay = s.ownSectId || (s.ownSect && s.ownSect.name) || '你的宗门';

    if (success) {
      // 结为道侣
      target.socialNetwork = target.socialNetwork || { spouse: null, familyMembers: [], friends: [], rivals: [], relatives: [], godparents: [] };
      target.socialNetwork.spouse = { npcId: 'player', name: s.name, isFemale: s.gender === '女' };
      target.mood = (target.mood || 0) + 50;

      // 宗门结盟
      if (!s.sectRelations) s.sectRelations = {};
      s.sectRelations[(mySectId || '') + '|' + sectName] = { type: 'marriage', day: s.gameDay || 1 };
      s.ownSectStrength = (s.ownSectStrength || 1.0) + 0.1;
      this.changeSectStrength(sectName, 0.08);

      UI.closeModal();
      UI.showModal(
        '<div style="text-align:center;padding:20px;">' +
        '<div style="font-size:1.3em;color:var(--gold-bright);margin-bottom:10px;">💍 联姻成功！</div>' +
        '<div>你与' + target.name + '喜结连理，结为道侣！</div>' +
        '<div style="margin-top:8px;color:var(--jade);">' + mySectDisplay + '与' + sectName + '结为同盟！</div>' +
        '<div style="margin-top:5px;color:var(--text-dim);">双方宗门实力提升！</div>' +
        (canForce ? '<div style="margin-top:5px;color:var(--crimson-bright);">（强制联姻，对方宗门心存不满）</div>' : '') +
        '<button class="btn-combat" style="margin-top:15px;" onclick="UI.closeModal()">确定</button>' +
        '</div>'
      );
    } else {
      target.mood = (target.mood || 0) - 10;
      UI.closeModal();
      UI.showModal(
        '<div style="text-align:center;padding:20px;">' +
        '<div style="font-size:1.3em;color:var(--crimson-bright);margin-bottom:10px;">联姻失败</div>' +
        '<div>' + target.name + '拒绝了你的联姻之意。</div>' +
        '<button class="btn-combat" style="margin-top:15px;" onclick="UI.closeModal()">确定</button>' +
        '</div>'
      );
    }
    UI.updateAll();
  },

  // ===== 修炼速率加成（在doMeditate中调用） =====
  applySpiritRootCultivateBonus(expGain) {
    var s = Game.state;
    var rate = this.getCultivateRate(s);
    return Math.floor(expGain * rate);
  },

  // ===== 玩家面板灵根显示 =====
  getPlayerSpiritRootDisplay() {
    var s = Game.state;
    if (!s.spiritRoot) return '杂灵根';
    var tier = SPIRIT_ROOT_TIERS[s.spiritRoot.tier];
    var elems = s.spiritRoot.elements.join('');
    return tier.name + '(' + elems + ')';
  },

  // ===== 玩家面板扩展8入口 =====
  showExpand8Panel() {
    var s = Game.state;
    this.initExpand8State(s);
    this.ensureAllNPCSpiritRoots(s);

    var html = '<div class="modal-section">' +
      '<div class="modal-section-title">🔮 灵根·同行·传信</div>';

    // 灵根信息
    var rootName = this.getPlayerSpiritRootDisplay();
    html += '<div style="padding:10px;border-bottom:1px solid var(--border);">' +
      '<div style="color:var(--gold-bright);font-size:1.1em;">灵根: ' + rootName + '</div>' +
      '<div class="modal-item-desc">' + SPIRIT_ROOT_TIERS[s.spiritRoot.tier].desc + '</div>' +
      '<div class="modal-item-desc">修炼倍率: ' + SPIRIT_ROOT_TIERS[s.spiritRoot.tier].cultivateRate + 'x | 法术倍率: ' + SPIRIT_ROOT_TIERS[s.spiritRoot.tier].spellMult + 'x</div>';
    if (s.butianPills > 0) {
      html += '<button class="btn-combat" style="margin-top:8px;font-size:0.8em;" onclick="WorldSystem.useButianPill()">服用补天丹(' + s.butianPills + ')</button>';
    }
    html += '</div>';

    // 同行
    html += '<div class="modal-item-row" onclick="WorldSystem.showTravelCompanionPanel()"><div>' +
      '<div style="color:var(--gold-bright);">🚶 同行伙伴</div>' +
      '<div class="modal-item-desc">' + (s.travelCompanion ? '已有同行伙伴' : '选择伙伴一同行动') + '</div>' +
      '</div></div>';

    // 飞书传信
    html += '<div class="modal-item-row" onclick="WorldSystem.showSummonPanel()"><div>' +
      '<div style="color:var(--gold-bright);">📜 飞书传信</div>' +
      '<div class="modal-item-desc">召唤关系密切之人至身边</div>' +
      '</div></div>';

    // 宗门动态
    html += '<div class="modal-item-row" onclick="WorldSystem.showSectEventsPanel()"><div>' +
      '<div style="color:var(--gold-bright);">📋 宗门动态</div>' +
      '<div class="modal-item-desc">查看天下宗门动态</div>' +
      '</div></div>';

    // 宗门联姻（如有自建宗门）
    if (s.ownSect) {
      html += '<div class="modal-item-row" onclick="WorldSystem.showSectMarriagePanel()"><div>' +
        '<div style="color:var(--gold-bright);">💍 宗门联姻</div>' +
        '<div class="modal-item-desc">安排联姻结盟</div>' +
        '</div></div>';
    }

    html += '<button class="btn-combat" style="margin:10px;" onclick="UI.closeModal()">关闭</button>';
    html += '</div>';
    UI.showModal(html);
  },

});
