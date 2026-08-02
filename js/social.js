/* ============================================================
 * 凡人修仙传MUD · 社会动作系统 (social.js)
 *
 * 实现设计文档中的 P1 社会循环：
 *   - 基础交流：交谈、打听、试探、请教、辩论、安慰、威胁
 *   - 资源往来：送礼、索取、借贷、交易
 *   - 关系建立：结交、结义、拜师、收徒
 *   - 隐秘行为：偷窃、欺骗、伪装、窃听、暗杀（五阶段）
 *   - 双重真相：真实真相 vs 公开叙事
 *
 * 每个动词都修改至少一种长期状态（记忆、关系、证据、嫌疑）
 * ============================================================ */

const SocialSystem = {
  // ===== 基础交流 =====

  // 交谈：获取基础信息，提升好感
  talk(npc, state) {
    NPCMemory.initMemory(npc);
    var impression = NPCMemory.getOverallImpression(npc);
    var personalityMod = (npc.personality && npc.personality.talkBias) ? npc.personality.talkBias : 0.5;
    var moodMod = (npc.mood - 50) * 0.01;
    var successChance = 0.5 + personalityMod * 0.3 + moodMod + impression * 0.003;
    successChance = Math.max(0.1, Math.min(0.95, successChance));

    var success = Math.random() < successChance;
    var moodChange = success ? (2 + Math.floor(Math.random() * 4)) : (-1 + Math.floor(Math.random() * 3));
    npc.mood = Math.max(0, Math.min(100, npc.mood + moodChange));

    // 记录交互
    NPCMemory.recordInteraction(npc, {
      type: 'talk',
      time: state.gameDay || 1,
      description: success ? '愉快交谈' : '冷淡应对',
      impact: moodChange,
      impression: 'social',
    });

    // 获取信息（基于NPC世界观和已知事实）
    var info = null;
    if (success && npc.worldview && npc.worldview.knownFacts.length > 0) {
      var factId = npc.worldview.knownFacts[Math.floor(Math.random() * npc.worldview.knownFacts.length)];
      var fact = state.worldFacts ? state.worldFacts[factId] : null;
      if (fact) {
        info = '对方提到了：' + fact.description;
      }
    }

    return {
      success: success,
      moodChange: moodChange,
      message: success ? (info || '交谈愉快，好感度提升' + moodChange) : '对方态度冷淡',
      info: info,
    };
  },

  // 打听：尝试获取特定信息
  inquire(npc, topic, state) {
    NPCMemory.initMemory(npc);
    var trust = NPCMemory.shouldTrust(npc, 'inquire');
    var impression = NPCMemory.getOverallImpression(npc);
    var moodMod = (npc.mood - 40) * 0.008;

    // 高意志NPC更难套话
    var willMod = -(npc.will - 50) * 0.005;
    var successChance = 0.3 + moodMod + (trust ? 0.2 : 0) + (impression > 0 ? 0.15 : 0) + willMod;
    successChance = Math.max(0.05, Math.min(0.85, successChance));

    var success = Math.random() < successChance;
    var moodChange = success ? 1 : -3;
    npc.mood = Math.max(0, Math.min(100, npc.mood + moodChange));

    NPCMemory.recordInteraction(npc, {
      type: 'inquire',
      time: state.gameDay || 1,
      description: '打听关于' + (topic || '某事') + '的消息',
      impact: moodChange,
      impression: 'curious',
    });

    // 如果成功，NPC可能分享信息或暴露知道某个事实
    var revealedFact = null;
    if (success && npc.worldview && npc.worldview.knownFacts.length > 0) {
      // NPC只分享自己知道的信息
      var factId = npc.worldview.knownFacts[Math.floor(Math.random() * npc.worldview.knownFacts.length)];
      revealedFact = factId;
      // 玩家现在也知道NPC知道此事
      if (!npc.worldview.distrustOf) npc.worldview.distrustOf = [];
    }

    return {
      success: success,
      moodChange: moodChange,
      message: success ? '对方透露了一些消息' : '对方不愿透露',
      revealedFact: revealedFact,
    };
  },

  // 试探：探测NPC知道什么/隐瞒什么
  probe(npc, state) {
    NPCMemory.initMemory(npc);
    var playerComp = state.comp || 3;
    var npcWill = npc.will || 50;
    // 悟性vs意志
    var successChance = 0.3 + playerComp * 0.03 - (npcWill - 50) * 0.005;
    successChance = Math.max(0.1, Math.min(0.8, successChance));

    var success = Math.random() < successChance;
    var moodChange = success ? -2 : -5; // 试探会降低好感
    npc.mood = Math.max(0, Math.min(100, npc.mood + moodChange));

    NPCMemory.recordInteraction(npc, {
      type: 'probe',
      time: state.gameDay || 1,
      description: '试探对方',
      impact: moodChange,
      impression: 'suspicious',
    });

    var result = { success: success, moodChange: moodChange, message: '' };
    if (success) {
      // 发现NPC知道的事实数量
      var knownCount = (npc.worldview && npc.worldview.knownFacts) ? npc.worldview.knownFacts.length : 0;
      var hasSecrets = (npc.memory && npc.memory.secrets && npc.memory.secrets.length > 0);
      result.message = '你察觉到对方' + (knownCount > 0 ? '知道一些事情' : '似乎没什么特别的消息') + (hasSecrets ? '，且似乎隐瞒着什么' : '');
      result.detectedSecrets = hasSecrets;
    } else {
      result.message = '对方警觉地回避了你的试探，好感下降';
    }
    return result;
  },

  // 威胁：通过恐吓获取信息或服从
  threaten(npc, state) {
    NPCMemory.initMemory(npc);
    var playerAtk = state.atk || 10;
    var npcAtk = npc.atk || 10;
    var playerCultLevel = state.cultLevel || 0;
    var npcCultLevel = npc.cultLevel || 0;

    // 修为差距是主要因素
    var cultDiff = playerCultLevel - npcCultLevel;
    var successChance = 0.2 + cultDiff * 0.05 + (playerAtk > npcAtk ? 0.15 : -0.1);
    successChance = Math.max(0.05, Math.min(0.75, successChance));

    var success = Math.random() < successChance;
    var moodChange = success ? -5 : -15;
    npc.mood = Math.max(0, Math.min(100, npc.mood + moodChange));

    NPCMemory.recordInteraction(npc, {
      type: 'threaten',
      time: state.gameDay || 1,
      description: '威胁对方',
      impact: moodChange,
      impression: 'threatening',
      evidence: success ? null : { type: 'witness', description: '被玩家威胁' },
    });

    // 威胁失败可能增加敌意
    var becameHostile = !success && npc.mood < 20;

    return {
      success: success,
      moodChange: moodChange,
      message: success ? '对方被你的气势震慑' : '对方不畏威胁，好感大幅下降',
      becameHostile: becameHostile,
    };
  },

  // ===== 资源往来 =====

  // 送礼：提升好感，建立人情
  giveGift(npc, itemId, state) {
    NPCMemory.initMemory(npc);
    var item = ITEMS[itemId];
    if (!item) return { success: false, message: '无效物品' };

    // 礼物价值影响效果
    var value = (item.grade || 1) * 10;
    var moodChange = Math.floor(value * 0.8 + Math.random() * 5);
    npc.mood = Math.max(0, Math.min(100, npc.mood + moodChange));

    NPCMemory.recordInteraction(npc, {
      type: 'gift',
      time: state.gameDay || 1,
      description: '赠送：' + item.name,
      impact: moodChange,
      impression: 'generous',
    });

    // 建立人情债
    if (!npc.memory.obligations) npc.memory.obligations = [];
    npc.memory.obligations.push({
      to: 'player',
      description: '收受了玩家的' + item.name,
      value: value,
      resolved: false,
      time: state.gameDay || 1,
    });

    return {
      success: true,
      moodChange: moodChange,
      message: '赠送' + item.name + '，好感度提升' + moodChange,
    };
  },

  // ===== 隐秘行为（五阶段：准备→实施→掩盖→合法化→长期维护）=====

  // 偷窃
  steal(npc, state) {
    NPCMemory.initMemory(npc);
    var playerSpd = state.spd || 10;
    var playerComp = state.comp || 3;
    var npcSpd = npc.spd || 10;
    var npcWill = npc.will || 50;

    // 偷窃难度
    var stealDifficulty = (npc.personality && npc.personality.stealDifficulty) ? npc.personality.stealDifficulty : 0.4;
    var successChance = 0.4 + (playerSpd - npcSpd) * 0.02 + playerComp * 0.02 - stealDifficulty * 0.3 - (npcWill - 50) * 0.003;
    successChance = Math.max(0.05, Math.min(0.85, successChance));

    var success = Math.random() < successChance;
    var result = { success: success, caught: false, moodChange: 0, message: '', stolenItem: null };

    if (success) {
      // 偷窃成功
      var stolenItem = null;
      if (npc.items && npc.items.length > 0) {
        var itemIdx = Math.floor(Math.random() * npc.items.length);
        stolenItem = npc.items[itemIdx];
        npc.items.splice(itemIdx, 1);
      } else if (npc.stones > 0) {
        var stolenStones = Math.floor(npc.stones * (0.1 + Math.random() * 0.3));
        npc.stones -= stolenStones;
        result.stolenStones = stolenStones;
      }
      result.stolenItem = stolenItem;
      result.message = stolenItem ? '偷窃成功：获得' + (ITEMS[stolenItem] ? ITEMS[stolenItem].name : stolenItem) : (result.stolenStones ? '偷窃成功：获得' + result.stolenStones + '灵石' : '偷窃成功但对方身无长物');

      // 记录真相
      WorldFactManager.recordFact(state, 'steal_' + npc.id + '_' + (state.gameDay || 1), {
        type: 'crime',
        description: '玩家偷窃了' + npc.name + '的物品',
        actors: ['player'],
        victims: [npc.id],
        knowers: ['player'],
      });

      NPCMemory.recordInteraction(npc, {
        type: 'steal',
        time: state.gameDay || 1,
        description: '被偷窃（未察觉）',
        impact: 0, // NPC没发现
        evidence: { type: 'trace', description: '物品丢失的痕迹' },
      });
    } else {
      // 偷窃失败，被发现
      result.caught = true;
      result.moodChange = -30;
      npc.mood = Math.max(0, npc.mood - 30);
      npc.isFriend = false;

      NPCMemory.recordInteraction(npc, {
        type: 'steal',
        time: state.gameDay || 1,
        description: '偷窃被抓',
        impact: -50,
        impression: 'thief',
        evidence: { type: 'witness', description: '亲眼目睹玩家偷窃' },
      });

      // NPC成为知情者
      var factId = 'steal_failed_' + npc.id + '_' + (state.gameDay || 1);
      WorldFactManager.recordFact(state, factId, {
        type: 'crime',
        description: '玩家企图偷窃' + npc.name + '被发现',
        actors: ['player'],
        victims: [npc.id],
        knowers: [npc.id, 'player'],
      });
      WorldFactManager.setNPCCognition(state, npc.id, factId, {
        known: true, believed: true, suspicion: 100,
      });

      // 增加身份风险
      CultivationAnchors.modify(state, 'identityRisk', 5);
      CultivationDebt.addDebt(state, 'karma', 8, '偷窃被发现');

      result.message = '偷窃失败！被' + npc.name + '发现了！';
    }

    return result;
  },

  // 欺骗：骗取信息、物品或信任
  deceive(npc, deception, state) {
    NPCMemory.initMemory(npc);
    var playerComp = state.comp || 3;
    var npcWill = npc.will || 50;
    var npcMood = npc.mood || 50;
    var npcTrust = NPCMemory.shouldTrust(npc, 'deceive');

    // 欺骗成功率
    var successChance = 0.4 + playerComp * 0.03 + (npcMood > 50 ? 0.1 : -0.1) - (npcWill - 50) * 0.004;
    // 被背叛过的NPC更难欺骗
    if (NPCMemory.remembersEvent(npc, 'betray')) successChance -= 0.3;
    successChance = Math.max(0.05, Math.min(0.85, successChance));

    var success = Math.random() < successChance;
    var result = { success: success, exposed: false, moodChange: 0, message: '' };

    if (success) {
      result.message = '欺骗成功：' + (deception || '对方相信了你的话');
      npc.mood = Math.min(100, npc.mood + 3); // 暂时提升好感

      NPCMemory.recordInteraction(npc, {
        type: 'deceive',
        time: state.gameDay || 1,
        description: '被骗：' + (deception || 'unknown'),
        impact: 3, // 表面上是正面的
        evidence: { type: 'testimony', description: '玩家曾说过的话可能与事实不符' },
      });

      // 记录真相
      WorldFactManager.recordFact(state, 'deceive_' + npc.id + '_' + (state.gameDay || 1), {
        type: 'secret',
        description: '玩家欺骗了' + npc.name + '：' + (deception || ''),
        actors: ['player'],
        victims: [npc.id],
        knowers: ['player'],
      });

      // 秘密压力增加
      WorldFactManager.addSecretPressure(state, 3);
      CultivationDebt.addDebt(state, 'identity', 5, '欺骗行为');
    } else {
      // 欺骗被识破
      result.exposed = true;
      result.moodChange = -25;
      npc.mood = Math.max(0, npc.mood - 25);
      npc.isFriend = false;

      NPCMemory.recordInteraction(npc, {
        type: 'deceive',
        time: state.gameDay || 1,
        description: '欺骗被识破',
        impact: -40,
        impression: 'liar',
        evidence: { type: 'witness', description: '识破了玩家的谎言' },
      });

      var factId = 'deceive_exposed_' + npc.id + '_' + (state.gameDay || 1);
      WorldFactManager.recordFact(state, factId, {
        type: 'secret',
        description: '玩家企图欺骗' + npc.name + '被识破',
        actors: ['player'],
        victims: [npc.id],
        knowers: [npc.id, 'player'],
      });
      WorldFactManager.setNPCCognition(state, npc.id, factId, {
        known: true, believed: true, suspicion: 100,
      });

      CultivationAnchors.modify(state, 'identityRisk', 8);
      CultivationDebt.addDebt(state, 'karma', 10, '欺骗被识破');
      CultivationDebt.addDebt(state, 'identity', 10, '欺骗被识破');

      result.message = '欺骗被识破！' + npc.name + '对你失去了信任';
    }

    return result;
  },

  // 暗杀：高风险隐秘行为
  assassinate(npc, state) {
    NPCMemory.initMemory(npc);
    var playerAtk = state.atk || 10;
    var playerSpd = state.spd || 10;
    var playerComp = state.comp || 3;
    var npcHp = npc.hp || 100;
    var npcAtk = npc.atk || 10;
    var npcSpd = npc.spd || 10;
    var npcWill = npc.will || 50;

    // 暗杀成功率：需要修为差距+速度优势+出其不意
    var cultAdvantage = (state.cultLevel - npc.cultLevel) * 0.08;
    var spdAdvantage = (playerSpd - npcSpd) * 0.02;
    var stealthBonus = playerComp * 0.02;
    var successChance = 0.2 + cultAdvantage + spdAdvantage + stealthBonus - (npcWill - 50) * 0.003;
    successChance = Math.max(0.05, Math.min(0.7, successChance));

    var success = Math.random() < successChance;
    var result = { success: success, exposed: false, moodChange: 0, message: '', npcDied: false };

    if (success) {
      // 暗杀成功
      npc.isAlive = false;
      npc.hp = 0;
      result.npcDied = true;
      result.message = '暗杀成功！' + npc.name + '已被除掉';

      // 记录真相
      var factId = 'assassinate_' + npc.id + '_' + (state.gameDay || 1);
      WorldFactManager.recordFact(state, factId, {
        type: 'death',
        description: '玩家暗杀了' + npc.name,
        actors: ['player'],
        victims: [npc.id],
        realCause: '被玩家暗杀',
        knowers: ['player'],
      });

      // 设置公开叙事（无人知晓）
      WorldFactManager.setPublicNarrative(state, factId, {
        description: npc.name + '失踪/意外死亡',
        credibility: 70,
        source: 'player',
      });

      // 添加证据（即使成功也留下痕迹）
      WorldFactManager.addEvidence(state, factId, {
        type: 'trace',
        description: npc.name + '死亡现场的可疑痕迹',
        holder: null,
      });

      // 增加秘密压力和因果债务
      WorldFactManager.addSecretPressure(state, 15);
      CultivationDebt.addDebt(state, 'karma', 25, '暗杀NPC');
      CultivationDebt.addDebt(state, 'identity', 15, '暗杀秘密');
      CultivationAnchors.modify(state, 'karmaLoad', 15);
      CultivationAnchors.modify(state, 'identityRisk', 10);

      // 从好友列表移除
      if (state.npcFriends) {
        var idx = state.npcFriends.indexOf(npc.id);
        if (idx >= 0) state.npcFriends.splice(idx, 1);
      }
      if (state.killedNPCs) {
        state.killedNPCs.push(npc.id);
      } else {
        state.killedNPCs = [npc.id];
      }
    } else {
      // 暗杀失败
      result.exposed = true;
      result.message = '暗杀失败！' + npc.name + '反击了你！';
      npc.mood = 0;
      npc.isFriend = false;

      NPCMemory.recordInteraction(npc, {
        type: 'attack',
        time: state.gameDay || 1,
        description: '玩家企图暗杀',
        impact: -100,
        impression: 'assassin',
        evidence: { type: 'witness', description: '玩家企图暗杀的现场' },
      });

      var factId2 = 'assassinate_failed_' + npc.id + '_' + (state.gameDay || 1);
      WorldFactManager.recordFact(state, factId2, {
        type: 'crime',
        description: '玩家企图暗杀' + npc.name + '失败',
        actors: ['player'],
        victims: [npc.id],
        knowers: [npc.id, 'player'],
      });
      WorldFactManager.setNPCCognition(state, npc.id, factId2, {
        known: true, believed: true, suspicion: 100,
      });

      // NPC会向周围人传播此事
      WorldFactManager.addEvidence(state, factId2, {
        type: 'testimony',
        description: npc.name + '的证词：玩家企图暗杀',
        holder: npc.id,
      });

      CultivationDebt.addDebt(state, 'karma', 30, '暗杀失败');
      CultivationAnchors.modify(state, 'karmaLoad', 20);
      CultivationAnchors.modify(state, 'identityRisk', 25);

      // NPC可能成为仇敌并追杀玩家
      if (!state.ambushers) state.ambushers = [];
      if (state.ambushers.indexOf(npc.id) < 0) state.ambushers.push(npc.id);
    }

    return result;
  },

  // ===== 关系建立 =====

  // 结交：尝试与NPC建立友谊
  befriend(npc, state) {
    NPCMemory.initMemory(npc);
    var impression = NPCMemory.getOverallImpression(npc);
    var mood = npc.mood || 50;
    var personalityMod = (npc.personality && npc.personality.befriendChance) ? npc.personality.befriendChance : 0.3;

    var successChance = personalityMod + mood * 0.004 + (impression > 0 ? 0.15 : -0.1);
    successChance = Math.max(0.05, Math.min(0.8, successChance));

    var success = Math.random() < successChance;

    if (success) {
      npc.isFriend = true;
      npc.mood = Math.min(100, npc.mood + 10);

      NPCMemory.recordInteraction(npc, {
        type: 'befriend',
        time: state.gameDay || 1,
        description: '正式结交为友',
        impact: 20,
        impression: 'friend',
      });

      if (!state.npcFriends) state.npcFriends = [];
      if (state.npcFriends.indexOf(npc.id) < 0) {
        state.npcFriends.push(npc.id);
      }

      return { success: true, moodChange: 10, message: '成功与' + npc.name + '结交为友！' };
    } else {
      npc.mood = Math.max(0, npc.mood - 3);
      NPCMemory.recordInteraction(npc, {
        type: 'befriend',
        time: state.gameDay || 1,
        description: '结交尝试被婉拒',
        impact: -3,
      });
      return { success: false, moodChange: -3, message: npc.name + '婉拒了你的结交之意' };
    }
  },

  // 结义：建立更深的兄弟/姐妹关系
  swornSiblings(npc, state) {
    NPCMemory.initMemory(npc);
    var impression = NPCMemory.getOverallImpression(npc);
    var mood = npc.mood || 50;

    // 结义需要较高好感
    if (mood < 60 || impression < 30) {
      return { success: false, message: '好感不足，无法结义（需好感60+）' };
    }

    // NPC独立决策
    var decision = NPCMemory.makeDecision(npc, {
      type: 'sworn',
      benefitToNPC: true,
      riskToNPC: false,
    }, state);

    if (!decision.accept) {
      npc.mood = Math.max(0, npc.mood - 5);
      return { success: false, moodChange: -5, message: npc.name + '拒绝了结义：' + decision.reason };
    }

    // 结义成功
    npc.relationType = 'sworn';
    npc.mood = Math.min(100, npc.mood + 20);
    npc.will = Math.min(100, npc.will + 10); // 结义提升意志

    NPCMemory.recordInteraction(npc, {
      type: 'sworn',
      time: state.gameDay || 1,
      description: '正式结为义兄弟/姐妹',
      impact: 40,
      impression: 'sworn',
    });

    // 记录世界事实
    WorldFactManager.recordFact(state, 'sworn_' + npc.id + '_' + (state.gameDay || 1), {
      type: 'event',
      description: '玩家与' + npc.name + '结为义兄弟/姐妹',
      actors: ['player', npc.id],
      knowers: ['player', npc.id],
    });

    return { success: true, moodChange: 20, message: '与' + npc.name + '结为义兄弟/姐妹！' };
  },

  // ===== 秘密维护 =====

  // 检查所有秘密的暴露风险
  checkAllSecrets(state) {
    WorldFactManager.initState(state);
    var atRiskFacts = [];
    for (var factId in state.worldFacts) {
      var fact = state.worldFacts[factId];
      if (fact.deleted || fact.type === 'event') continue;
      var exposure = WorldFactManager.checkExposure(state, factId);
      if (exposure.atRisk) {
        atRiskFacts.push({ factId: factId, fact: fact, exposure: exposure });
      }
    }
    return atRiskFacts;
  },

  // 合法化身份：降低身份风险和秘密压力
  legalizeIdentity(state, method) {
    WorldFactManager.initState(state);
    CultivationAnchors.modify(state, 'identityRisk', -20);
    WorldFactManager.reduceSecretPressure(state, 15);
    CultivationDebt.repayDebt(state, 'identity', 15, method || '合法化');

    return { success: true, message: '身份合法化成功，身份风险降低' };
  },

  // 清除证据：降低某事件的证据暴露风险
  destroyEvidence(state, factId) {
    WorldFactManager.initState(state);
    if (!state.evidenceChain[factId]) return { success: false, message: '无证据可清除' };

    var removed = state.evidenceChain[factId].length;
    state.evidenceChain[factId] = [];
    WorldFactManager.reduceSecretPressure(state, removed * 2);
    CultivationDebt.repayDebt(state, 'identity', 5, '清除证据');

    return { success: true, message: '清除了' + removed + '条证据', removed: removed };
  },

  // ===== NPC自主行为（世界演化）=====

  // NPC随时间推移的自主决策
  npcAutoAction(npc, state) {
    NPCMemory.initMemory(npc);
    if (!npc.isAlive) return null;

    // 根据性格和目标决定行为
    var actions = [];
    var personality = npc.personality || {};
    var pType = personality.type || 'neutral';

    // 修炼
    actions.push({ type: 'cultivate', weight: 0.3 });
    // 交友
    if (pType === '友善' || pType === '侠义') actions.push({ type: 'socialize', weight: 0.2 });
    // 寻求突破
    if (npc.goals && npc.goals.primary && npc.goals.primary.type === 'breakthrough') {
      actions.push({ type: 'seek_breakthrough', weight: 0.25 });
    }
    // 复仇（如果有仇敌）
    if (npc.memory && npc.memory.events.some(function(e) { return e.type === 'betray' || e.type === 'attack'; })) {
      actions.push({ type: 'seek_revenge', weight: 0.15 });
    }

    // 加权随机选择
    var totalWeight = 0;
    for (var i = 0; i < actions.length; i++) totalWeight += actions[i].weight;
    var rand = Math.random() * totalWeight;
    var selected = null;
    for (var j = 0; j < actions.length; j++) {
      rand -= actions[j].weight;
      if (rand <= 0) { selected = actions[j]; break; }
    }

    if (!selected) return null;

    switch (selected.type) {
      case 'cultivate':
        // NPC缓慢修为提升
        if (Math.random() < 0.1 && npc.cultLevel < CULT_LEVELS.length - 1) {
          // 修炼有概率提升
          var cult = CULT_LEVELS[npc.cultLevel];
          if (Math.random() < 0.05) {
            npc.cultLevel++;
            npc.cultName = CULT_LEVELS[npc.cultLevel].name;
            return { action: 'breakthrough', message: npc.name + '突破到了' + npc.cultName };
          }
        }
        return { action: 'cultivate', message: npc.name + '在修炼' };

      case 'socialize':
        return { action: 'socialize', message: npc.name + '在社交' };

      case 'seek_revenge':
        // 仇敌可能追杀玩家
        if (npc.mood < 20 && Math.random() < 0.3) {
          if (!state.ambushers) state.ambushers = [];
          if (state.ambushers.indexOf(npc.id) < 0) state.ambushers.push(npc.id);
          return { action: 'seek_revenge', message: npc.name + '正在寻找你复仇' };
        }
        return null;

      default:
        return null;
    }
  },
};

// ===== 导出到全局 =====
if (typeof window !== 'undefined') {
  window.SocialSystem = SocialSystem;
}
