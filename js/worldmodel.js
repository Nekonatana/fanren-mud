/* ============================================================
 * 凡人修仙传MUD · 世界模型与核心数据层 (worldmodel.js)
 *
 * 核心命题：所有道路都能通向大道，但捷径不会免除代价，
 * 只会改变代价的时间、形式与承担方式。
 *
 * 本模块实现设计文档中的 P0 基础设施：
 *   1. 世界真相 / 公开叙事 / 个人认知 三层分离
 *   2. NPC 独立记忆与关系网络
 *   3. 修炼锚定值（境界≠战力，9个独立维度）
 *   4. 修行债务系统（速成路线的延迟代价）
 *   5. 证据链与嫌疑系统
 * ============================================================ */

// ===== 世界真相层：不可被公开叙事覆盖的真实事件 =====
const WorldFactManager = {
  // 初始化玩家state中的世界事实字段
  initState(state) {
    if (!state.worldFacts) state.worldFacts = {};       // {factId: {type, time, description, actors[], evidence[], knowers[], deleted:false}}
    if (!state.publicNarrative) state.publicNarrative = {}; // {eventId: {description, credibility, spreadTime}}
    if (!state.npcCognition) state.npcCognition = {};   // {npcId: {factId: {known, believed, suspicion}}}
    if (!state.evidenceChain) state.evidenceChain = {};  // {factId: [evidenceItem]}
    if (!state.suspicionLog) state.suspicionLog = {};    // {npcId: {factId: suspicionLevel}}
    if (!state.secretPressure) state.secretPressure = 0; // 维持谎言的长期成本
  },

  // 记录一条世界真相（永不删除，只标记）
  recordFact(state, factId, fact) {
    this.initState(state);
    state.worldFacts[factId] = {
      type: fact.type || 'event',        // event/death/inheritance/betrayal/secret/crime
      time: fact.time || state.gameDay || 1,
      description: fact.description || '',
      actors: fact.actors || [],          // 涉及的NPC ID或玩家
      victims: fact.victims || [],
      beneficiaries: fact.beneficiaries || [],
      realCause: fact.realCause || '',
      knowers: fact.knowers || [],        // 知道全部真相的人
      partialKnowers: fact.partialKnowers || [], // 知道部分的人
      deleted: false,                     // 软删除标记（真相不删除）
      createdAt: Date.now(),
    };
  },

  // 设置公开叙事（外界相信的版本）
  setPublicNarrative(state, eventId, narrative) {
    this.initState(state);
    state.publicNarrative[eventId] = {
      description: narrative.description || '',
      credibility: narrative.credibility || 50, // 0-100，解释可信度
      spreadTime: narrative.spreadTime || (state.gameDay || 1),
      source: narrative.source || 'unknown',    // 谁散布的
    };
  },

  // 记录NPC对某事件的认知（每个NPC独立计算）
  setNPCCognition(state, npcId, factId, cognition) {
    this.initState(state);
    if (!state.npcCognition[npcId]) state.npcCognition[npcId] = {};
    state.npcCognition[npcId][factId] = {
      known: cognition.known || false,        // 是否知道此事
      believed: cognition.believed || null,    // 相信什么版本 (true=真相, false=公开叙事, null=不确定)
      suspicion: cognition.suspicion || 0,     // 0-100，对公开叙事的怀疑度
      lastUpdate: state.gameDay || 1,
    };
  },

  // 添加证据
  addEvidence(state, factId, evidence) {
    this.initState(state);
    if (!state.evidenceChain[factId]) state.evidenceChain[factId] = [];
    state.evidenceChain[factId].push({
      type: evidence.type || 'clue',  // clue/testimony/letter/trace/witness/confession
      description: evidence.description || '',
      holder: evidence.holder || null,  // 谁持有此证据
      discovered: false,
      time: evidence.time || (state.gameDay || 1),
    });
  },

  // 增加某NPC对某事件的怀疑
  addSuspicion(state, npcId, factId, amount) {
    this.initState(state);
    if (!state.suspicionLog[npcId]) state.suspicionLog[npcId] = {};
    var cur = state.suspicionLog[npcId][factId] || 0;
    state.suspicionLog[npcId][factId] = Math.max(0, Math.min(100, cur + amount));
    // 同步到认知层
    if (state.npcCognition[npcId] && state.npcCognition[npcId][factId]) {
      state.npcCognition[npcId][factId].suspicion = state.suspicionLog[npcId][factId];
    }
  },

  // 获取某NPC对某事件的怀疑度
  getSuspicion(state, npcId, factId) {
    this.initState(state);
    if (!state.suspicionLog[npcId]) return 0;
    return state.suspicionLog[npcId][factId] || 0;
  },

  // 获取某事件的知情者名单
  getKnowers(state, factId) {
    this.initState(state);
    var fact = state.worldFacts[factId];
    if (!fact) return [];
    return (fact.knowers || []).concat(fact.partialKnowers || []);
  },

  // 秘密压力增加（维持谎言的成本）
  addSecretPressure(state, amount) {
    this.initState(state);
    state.secretPressure = Math.max(0, (state.secretPressure || 0) + amount);
  },

  // 秘密压力降低（通过合法化、清除证据等）
  reduceSecretPressure(state, amount) {
    this.initState(state);
    state.secretPressure = Math.max(0, (state.secretPressure || 0) - amount);
  },

  // 检查秘密是否暴露（基于怀疑度和证据）
  checkExposure(state, factId) {
    this.initState(state);
    var maxSusp = 0;
    var suspectCount = 0;
    var npcs = state.npcList || [];
    for (var i = 0; i < npcs.length; i++) {
      var npcId = npcs[i].id;
      var susp = this.getSuspicion(state, npcId, factId);
      if (susp > 50) suspectCount++;
      if (susp > maxSusp) maxSusp = susp;
    }
    // 如果多人高度怀疑或有人达到90+怀疑，秘密可能暴露
    return { suspectCount: suspectCount, maxSuspicion: maxSusp, atRisk: (suspectCount >= 3 || maxSusp >= 90) };
  },
};

// ===== NPC 记忆系统：每个NPC独立记录与玩家的交互历史 =====
const NPCMemory = {
  // 为NPC初始化记忆字段
  initMemory(npc) {
    if (!npc.memory) {
      npc.memory = {
        events: [],           // [{type, time, description, impact, evidence}]
        impressions: {},      // {category: value} 玩家在NPC心中的印象分类
        promises: [],         // [{description, fulfilled, time}]
        obligations: [],      // [{to: npcId, description, resolved}]
        secrets: [],          // NPC知道的关于玩家的秘密
        lastInteraction: null,
        interactionCount: 0,
      };
    }
    if (!npc.worldview) {
      npc.worldview = {
        knownFacts: [],       // NPC知道的世界事实ID
        believedNarratives: [], // NPC相信的公开叙事
        distrustOf: [],       // NPC不信任的对象
        affiliations: [],     // NPC的派系归属
      };
    }
    if (!npc.goals) {
      npc.goals = {
        primary: null,        // 主要目标 {type, description, progress}
        secondary: [],        // 次要目标
      };
    }
    if (typeof npc.will !== 'number') npc.will = 50; // 独立意志 0-100，越高越难被操控
    if (typeof npc.mood !== 'number') npc.mood = 50; // 好感度默认50
    if (typeof npc.cultLevel !== 'number') npc.cultLevel = 0; // 修为默认0（凡人）
  },

  // 记录NPC对玩家的交互记忆
  recordInteraction(npc, event) {
    this.initMemory(npc);
    npc.memory.events.push({
      type: event.type || 'interaction', // talk/gift/steal/deceive/attack/help/spare/betray/befriend/sworn/master/spouse
      time: event.time || 1,
      description: event.description || '',
      impact: event.impact || 0,        // 对好感的影响 -100~+100
      evidence: event.evidence || null,  // 是否留下证据
      playerAction: event.playerAction || null,
    });
    npc.memory.lastInteraction = event.time || 1;
    npc.memory.interactionCount++;

    // 更新印象分类
    if (event.impression) {
      var cat = event.impression;
      npc.memory.impressions[cat] = (npc.memory.impressions[cat] || 0) + (event.impact || 0);
    }

    // 限制记忆条数（保留最近100条+所有重大事件）
    if (npc.memory.events.length > 200) {
      var major = npc.memory.events.filter(function(e) {
        return Math.abs(e.impact) >= 30 || e.evidence;
      });
      var minor = npc.memory.events.filter(function(e) {
        return Math.abs(e.impact) < 30 && !e.evidence;
      }).slice(-50);
      npc.memory.events = major.concat(minor);
    }
  },

  // 获取NPC对玩家的总体印象
  getOverallImpression(npc) {
    this.initMemory(npc);
    var total = 0;
    var events = npc.memory.events;
    // 最近的交互权重更高
    for (var i = 0; i < events.length; i++) {
      var weight = 1 + (i / events.length); // 越近权重越高
      total += events[i].impact * weight;
    }
    return Math.max(-100, Math.min(100, total / Math.max(1, events.length)));
  },

  // NPC是否记得某类事件
  remembersEvent(npc, type) {
    this.initMemory(npc);
    return npc.memory.events.some(function(e) { return e.type === type; });
  },

  // NPC添加对玩家的承诺记录
  recordPromise(npc, promise) {
    this.initMemory(npc);
    npc.memory.promises.push({
      description: promise.description || '',
      fulfilled: false,
      time: promise.time || 1,
      toPlayer: promise.toPlayer !== false,
    });
  },

  // NPC判断是否应该信任玩家（基于记忆）
  shouldTrust(npc, action) {
    this.initMemory(npc);
    var impression = this.getOverallImpression(npc);
    var betrayCount = npc.memory.events.filter(function(e) { return e.type === 'betray'; }).length;
    var helpCount = npc.memory.events.filter(function(e) { return e.type === 'help'; }).length;
    // 被背叛过则大幅降低信任
    if (betrayCount > 0) return false;
    // 好感高且有帮助历史则信任
    if (impression > 30 && helpCount > 0) return true;
    // 高意志NPC需要更高好感
    if (npc.will > 70 && impression < 50) return false;
    return impression > 10;
  },

  // NPC独立决策（可以拒绝玩家的请求）
  makeDecision(npc, request, state) {
    this.initMemory(npc);
    var trust = this.shouldTrust(npc, request.type);
    var impression = this.getOverallImpression(npc);
    // 基于性格调整
    var personalityMod = 0;
    if (npc.personality) {
      var pType = npc.personality.type || 'neutral';
      if (pType === '友善' || pType === '侠义') personalityMod += 15;
      if (pType === '阴险' || pType === '狂傲') personalityMod -= 15;
      if (pType === '冷漠') personalityMod -= 10;
    }
    // 基于利益判断
    var benefitMod = request.benefitToNPC ? 20 : 0;
    var riskMod = request.riskToNPC ? -25 : 0;
    // 独立意志影响：高意志NPC更倾向自主判断
    var willMod = (npc.will - 50) * 0.2;

    var score = impression + personalityMod + benefitMod + riskMod + willMod;
    // 随机性（让结果不完全可预测）
    score += (Math.random() - 0.5) * 20;

    return {
      accept: score > 0,
      score: score,
      reason: !trust ? '不信任' : (score < -20 ? '风险过大' : (score > 30 ? '愿意帮忙' : '勉强同意')),
    };
  },
};

// ===== 修炼锚定值系统：9个独立维度，境界≠战力 =====
const CultivationAnchors = {
  // 锚定值定义
  DEFINITIONS: {
    foundation:      { name: '根基完整度', desc: '当前境界有多少真正属于自己且结构完整。过低时经脉承载不足、法力驳杂、突破风险高。', min: 0, max: 100, default: 100 },
    combatConversion:{ name: '战力转化率', desc: '修为转化为有效战斗能力的比例。过低时境界高但实战弱、消耗大、输出低。', min: 0, max: 100, default: 70 },
    daoMastery:      { name: '道法掌控度', desc: '对力量、术法和境界规律的理解与运用。过低时技能不稳、无法隐藏修为、难以临战变化。', min: 0, max: 100, default: 50 },
    bodyCapacity:    { name: '肉身承载度', desc: '身体承受法力、法宝、血脉和邪功的能力。过低时反噬、伤势、寿元透支、肉身崩坏。', min: 0, max: 100, default: 80 },
    soulStability:   { name: '神魂稳定度', desc: '意识、自我、记忆和外来残魂的稳定程度。过低时心魔、失控、人格混杂、被夺舍风险。', min: 0, max: 100, default: 80 },
    daoCompleteness: { name: '大道完整度', desc: '功法体系与个人道路是否自洽。过低时后期无法继续推演，依赖外来模板。', min: 0, max: 100, default: 30 },
    powerAutonomy:   { name: '力量自主性', desc: '力量是否真正受玩家控制、是否含外来后门。过低时灌顶者控制、契约束缚、功法依赖。', min: 0, max: 100, default: 100 },
    karmaLoad:       { name: '因果负荷', desc: '行为与力量积累带来的社会和超凡追索。过高时仇敌、追杀、天劫异常、推演暴露。', min: 0, max: 100, default: 0 },
    identityRisk:    { name: '公开身份风险', desc: '外界对真实路线和行为的猜疑程度。过高时宗门调查、交易受限、被勒索或驱逐。', min: 0, max: 100, default: 0 },
  },

  // 初始化玩家锚定值
  initState(state) {
    if (!state.anchors) {
      state.anchors = {};
      for (var key in this.DEFINITIONS) {
        state.anchors[key] = this.DEFINITIONS[key].default;
      }
    }
    // 补全缺失的锚定值（迁移用）
    for (var k in this.DEFINITIONS) {
      if (typeof state.anchors[k] !== 'number') {
        state.anchors[k] = this.DEFINITIONS[k].default;
      }
    }
  },

  // 获取锚定值
  get(state, key) {
    this.initState(state);
    return state.anchors[key];
  },

  // 修改锚定值（自动钳制到合法范围）
  modify(state, key, delta) {
    this.initState(state);
    var def = this.DEFINITIONS[key];
    if (!def) return;
    state.anchors[key] = Math.max(def.min, Math.min(def.max, (state.anchors[key] || def.default) + delta));
  },

  // 获取战力转化系数（用于战斗伤害计算）
  // 默认值≈1.0，满级≤1.8，下限0.3
  getCombatMultiplier(state) {
    this.initState(state);
    var conv = 0.7 + state.anchors.combatConversion / 233;
    var mastery = 0.6 + state.anchors.daoMastery / 125;
    var found = 0.7 + state.anchors.foundation / 333;
    var body = 0.7 + state.anchors.bodyCapacity / 267;
    var soul = 0.7 + state.anchors.soulStability / 267;
    return Math.max(0.3, Math.min(1.8, conv * mastery * found * body * soul));
  },

  // 获取防御转化系数
  getDefenseMultiplier(state) {
    this.initState(state);
    var found = 0.7 + state.anchors.foundation / 333;
    var body = 0.7 + state.anchors.bodyCapacity / 267;
    var mastery = 0.6 + state.anchors.daoMastery / 125;
    return Math.max(0.3, Math.min(1.8, found * body * mastery));
  },

  // 检查突破风险（根基不足时突破有风险）
  getBreakthroughRisk(state) {
    this.initState(state);
    var foundation = state.anchors.foundation;
    var body = state.anchors.bodyCapacity;
    var soul = state.anchors.soulStability;
    // 根基<50、肉身<40、神魂<40时风险显著增加
    var risk = 0;
    if (foundation < 50) risk += (50 - foundation) * 0.8;
    if (body < 40) risk += (40 - body) * 0.6;
    if (soul < 40) risk += (40 - soul) * 0.5;
    // 高因果负荷增加天劫风险
    if (state.anchors.karmaLoad > 60) risk += (state.anchors.karmaLoad - 60) * 0.3;
    return Math.max(0, Math.min(100, risk));
  },

  // 获取锚定值状态描述
  getAnchorStatus(key, value) {
    var def = this.DEFINITIONS[key];
    if (!def) return '';
    if (key === 'karmaLoad' || key === 'identityRisk') {
      // 这些值越低越好
      if (value < 20) return '良好';
      if (value < 50) return '一般';
      if (value < 75) return '危险';
      return '极度危险';
    } else {
      // 这些值越高越好
      if (value >= 90) return '圆满';
      if (value >= 70) return '良好';
      if (value >= 50) return '一般';
      if (value >= 30) return '薄弱';
      return '严重不足';
    }
  },
};

// ===== 修行债务系统：速成路线的延迟代价 =====
const CultivationDebt = {
  // 债务类型定义
  DEBT_TYPES: {
    body: {
      name: '肉身债务', desc: '灌顶、丹药、强行突破、邪功导致经脉破损、寿元透支',
      consequences: ['经脉破损', '寿元透支', '法力反噬', '肉身崩坏'],
      resolutions: ['炼体术', '重塑肉身', '天材地宝', '换体'],
    },
    soul: {
      name: '神魂债务', desc: '吞魂、夺舍、外来传承导致人格混杂、心魔、控制风险',
      consequences: ['人格混杂', '心魔入侵', '控制风险', '记忆冲突'],
      resolutions: ['炼魂术', '分念法', '斩执念', '融合转化'],
    },
    power: {
      name: '法力债务', desc: '采补、吞噬、丹药堆积导致法力驳杂、转化率低',
      consequences: ['法力驳杂', '转化率低', '突破瓶颈', '法力冲突'],
      resolutions: ['洗炼法力', '压缩重修', '功法融合', '建立统一核心'],
    },
    comprehension: {
      name: '理解债务', desc: '灌顶、直接继承高阶修为导致会用力量但不懂原理',
      consequences: ['技能不稳', '无法隐藏修为', '临战变化困难', '推演受阻'],
      resolutions: ['实战磨练', '闭关感悟', '师承指点', '重演境界过程'],
    },
    karma: {
      name: '因果债务', desc: '掠夺、背叛、夺产、杀戮导致仇敌、追杀、天劫异常',
      consequences: ['仇敌追杀', '天劫异常', '推演暴露', '因果纠缠'],
      resolutions: ['偿还因果', '转移因果', '掩盖行踪', '承担并炼化'],
    },
    identity: {
      name: '身份债务', desc: '伪装、冒名、继承他人身份导致破绽、勒索、旧关系冲突',
      consequences: ['身份破绽', '被勒索', '旧关系冲突', '信任崩塌'],
      resolutions: ['合法化身份', '清除证据', '培养代理人', '公开转型'],
    },
    dependency: {
      name: '资源依赖', desc: '邪功、香火、特定体质采补导致断供后停滞或反噬',
      consequences: ['断供停滞', '功法反噬', '战力下降', '修炼封锁'],
      resolutions: ['改良功法', '建立稳定来源', '摆脱依赖', '转化路线'],
    },
    autonomy: {
      name: '自主权债务', desc: '契约、灌顶、寄生法宝导致被控制、被召回、无法背叛',
      consequences: ['被控制', '被召回', '无法背叛', '力量受限'],
      resolutions: ['解除契约', '反制印记', '夺取控制权', '斩断联系'],
    },
  },

  // 初始化债务状态
  initState(state) {
    if (!state.cultivationDebts) {
      state.cultivationDebts = {}; // {debtType: {amount, history: [], lastTrigger}}
    }
  },

  // 增加债务
  addDebt(state, type, amount, source) {
    this.initState(state);
    if (!this.DEBT_TYPES[type]) return;
    if (!state.cultivationDebts[type]) {
      state.cultivationDebts[type] = { amount: 0, history: [], lastTrigger: null };
    }
    state.cultivationDebts[type].amount += amount;
    state.cultivationDebts[type].history.push({
      amount: amount,
      source: source || 'unknown',
      time: state.gameDay || 1,
    });
    state.cultivationDebts[type].lastTrigger = state.gameDay || 1;

    // 债务影响锚定值
    switch (type) {
      case 'body':
        CultivationAnchors.modify(state, 'bodyCapacity', -amount * 0.5);
        CultivationAnchors.modify(state, 'foundation', -amount * 0.3);
        break;
      case 'soul':
        CultivationAnchors.modify(state, 'soulStability', -amount * 0.6);
        break;
      case 'power':
        CultivationAnchors.modify(state, 'combatConversion', -amount * 0.4);
        CultivationAnchors.modify(state, 'foundation', -amount * 0.3);
        break;
      case 'comprehension':
        CultivationAnchors.modify(state, 'daoMastery', -amount * 0.5);
        break;
      case 'karma':
        CultivationAnchors.modify(state, 'karmaLoad', amount * 0.6);
        break;
      case 'identity':
        CultivationAnchors.modify(state, 'identityRisk', amount * 0.5);
        break;
      case 'dependency':
        CultivationAnchors.modify(state, 'powerAutonomy', -amount * 0.5);
        break;
      case 'autonomy':
        CultivationAnchors.modify(state, 'powerAutonomy', -amount * 0.7);
        break;
    }
  },

  // 偿还债务
  repayDebt(state, type, amount, method) {
    this.initState(state);
    if (!state.cultivationDebts[type]) return;
    var debt = state.cultivationDebts[type];
    debt.amount = Math.max(0, debt.amount - amount);
    debt.history.push({
      amount: -amount,
      source: 'repay:' + (method || 'unknown'),
      time: state.gameDay || 1,
    });

    // 偿还恢复锚定值
    switch (type) {
      case 'body':
        CultivationAnchors.modify(state, 'bodyCapacity', amount * 0.4);
        CultivationAnchors.modify(state, 'foundation', amount * 0.2);
        break;
      case 'soul':
        CultivationAnchors.modify(state, 'soulStability', amount * 0.5);
        break;
      case 'power':
        CultivationAnchors.modify(state, 'combatConversion', amount * 0.3);
        CultivationAnchors.modify(state, 'foundation', amount * 0.2);
        break;
      case 'comprehension':
        CultivationAnchors.modify(state, 'daoMastery', amount * 0.4);
        break;
      case 'karma':
        CultivationAnchors.modify(state, 'karmaLoad', -amount * 0.5);
        break;
      case 'identity':
        CultivationAnchors.modify(state, 'identityRisk', -amount * 0.4);
        WorldFactManager.reduceSecretPressure(state, amount * 0.3);
        break;
      case 'dependency':
        CultivationAnchors.modify(state, 'powerAutonomy', amount * 0.4);
        break;
      case 'autonomy':
        CultivationAnchors.modify(state, 'powerAutonomy', amount * 0.6);
        break;
    }
  },

  // 获取总债务量
  getTotalDebt(state) {
    this.initState(state);
    var total = 0;
    for (var type in state.cultivationDebts) {
      total += state.cultivationDebts[type].amount;
    }
    return total;
  },

  // 获取债务严重度
  getDebtSeverity(state) {
    var total = this.getTotalDebt(state);
    if (total === 0) return { level: 'none', label: '无债务', color: 'green' };
    if (total < 30) return { level: 'low', label: '轻微', color: 'green' };
    if (total < 80) return { level: 'medium', label: '中等', color: 'yellow' };
    if (total < 150) return { level: 'high', label: '严重', color: 'orange' };
    return { level: 'critical', label: '危险', color: 'red' };
  },

  // 检查债务是否触发后果
  checkDebtConsequences(state) {
    this.initState(state);
    var consequences = [];
    for (var type in state.cultivationDebts) {
      var debt = state.cultivationDebts[type];
      if (debt.amount >= 50) {
        var def = this.DEBT_TYPES[type];
        // 根据债务类型产生不同后果
        if (type === 'body' && debt.amount >= 60) {
          consequences.push({ type: 'body_strain', msg: '肉身债务发作：经脉隐隐作痛，气血流失', effect: { hp: -50 } });
        }
        if (type === 'soul' && debt.amount >= 60) {
          consequences.push({ type: 'soul_disturbance', msg: '神魂债务发作：心魔窥伺，神识不稳', effect: { heartDemon: 1 } });
        }
        if (type === 'power' && debt.amount >= 70) {
          consequences.push({ type: 'power_chaos', msg: '法力债务发作：法力驳杂，战力下降', effect: {} });
        }
        if (type === 'karma' && debt.amount >= 80) {
          consequences.push({ type: 'karma_retribution', msg: '因果债务发作：天劫异常，仇敌追踪', effect: {} });
        }
        if (type === 'identity' && debt.amount >= 70) {
          consequences.push({ type: 'identity_suspicion', msg: '身份债务发作：外界开始怀疑你的真实身份', effect: {} });
        }
      }
    }
    return consequences;
  },

  // 获取所有债务列表（用于UI显示）
  getDebtList(state) {
    this.initState(state);
    var list = [];
    for (var type in state.cultivationDebts) {
      var debt = state.cultivationDebts[type];
      if (debt.amount > 0) {
        var def = this.DEBT_TYPES[type];
        list.push({
          type: type,
          name: def.name,
          desc: def.desc,
          amount: debt.amount,
          consequences: def.consequences,
          resolutions: def.resolutions,
          lastTrigger: debt.lastTrigger,
        });
      }
    }
    return list;
  },
};

// ===== 修炼道路系统：多路线抵达大道 =====
const CultivationPaths = {
  // 修炼道路定义
  PATHS: {
    bitter_cultivation: {
      name: '正常苦修', desc: '根基稳、兼容性高、社会接受度高，但慢、容易卡瓶颈',
      advantages: ['根基稳定', '兼容性高', '社会接受度高'],
      costs: ['进展慢', '易卡瓶颈', '消耗时间'],
      anchorEffects: { foundation: 0, combatConversion: 5, daoMastery: 3 },
      debtTypes: [],
    },
    sect_inheritance: {
      name: '宗门传承', desc: '功法完整、资源稳定、有人指导，但有身份义务和派系限制',
      advantages: ['功法完整', '资源稳定', '有人指导'],
      costs: ['身份义务', '派系限制', '贡献要求'],
      anchorEffects: { foundation: 5, daoMastery: 5, daoCompleteness: 3 },
      debtTypes: [],
    },
    dual_cultivation: {
      name: '合意双修', desc: '双方互补、风险较低、关系收益，但依赖契合度与长期关系',
      advantages: ['双方互补', '风险较低', '关系收益'],
      costs: ['依赖契合度', '需长期关系', '感情维护'],
      anchorEffects: { foundation: 3, soulStability: 5, daoCompleteness: 3 },
      debtTypes: [],
    },
    plunder_cultivation: {
      name: '掠夺式采补', desc: '修为获取快，可绕过部分积累，但有异种法力、因果、暴露风险',
      advantages: ['修为获取快', '可绕过积累'],
      costs: ['异种法力', '因果追查', '暴露风险'],
      anchorEffects: { foundation: -15, combatConversion: -10, karmaLoad: 20, powerAutonomy: -5 },
      debtTypes: ['power', 'karma'],
      debtAmount: 15,
    },
    evil_cultivation: {
      name: '邪功（血道/魂道/尸道）', desc: '资源利用率高、杀招强、前中期爆发快，但偏科、痕迹明显、后期结构缺失',
      advantages: ['资源利用率高', '杀招强', '前中期爆发快'],
      costs: ['偏科', '痕迹明显', '后期结构缺失'],
      anchorEffects: { combatConversion: 10, daoMastery: -5, bodyCapacity: -10, soulStability: -10, karmaLoad: 15, identityRisk: 20 },
      debtTypes: ['body', 'soul', 'karma', 'identity'],
      debtAmount: 12,
    },
    devour_cultivation: {
      name: '吞噬修为', desc: '快速积累法力和部分能力，但法力驳杂、残留意志、被追索',
      advantages: ['快速积累法力'],
      costs: ['法力驳杂', '残留意志', '被追索'],
      anchorEffects: { foundation: -20, combatConversion: -15, soulStability: -15, karmaLoad: 10, powerAutonomy: -10 },
      debtTypes: ['power', 'soul', 'karma'],
      debtAmount: 20,
    },
    body_seizing: {
      name: '夺舍/换体', desc: '获得身体、身份、血脉或寿元，但有排异、身份破绽、记忆冲突、旧仇继承',
      advantages: ['获得身体', '获得身份', '获得血脉'],
      costs: ['排异反应', '身份破绽', '记忆冲突', '旧仇继承'],
      anchorEffects: { foundation: -25, soulStability: -30, daoCompleteness: -10, powerAutonomy: -20, identityRisk: 30 },
      debtTypes: ['soul', 'identity', 'autonomy'],
      debtAmount: 25,
    },
    immortal_empowerment: {
      name: '仙人灌顶', desc: '短时间跨境界，危机中迅速获力，但掌控不足、外来印记、依赖与后门',
      advantages: ['短时间跨境界', '危机中迅速获力'],
      costs: ['掌控不足', '外来印记', '依赖与后门'],
      anchorEffects: { foundation: -15, daoMastery: -20, daoCompleteness: -15, powerAutonomy: -30 },
      debtTypes: ['comprehension', 'autonomy'],
      debtAmount: 18,
    },
    pill_stacking: {
      name: '丹药堆积', desc: '稳定、可计划、适合资源型玩家，但有丹毒、耐药、药力虚浮、资源成本',
      advantages: ['稳定', '可计划', '适合资源型'],
      costs: ['丹毒', '耐药', '药力虚浮', '资源成本'],
      anchorEffects: { foundation: -10, bodyCapacity: -10, combatConversion: -5 },
      debtTypes: ['body', 'dependency'],
      debtAmount: 10,
    },
    bloodline_awakening: {
      name: '血脉觉醒', desc: '阶段爆发强、获得独特天赋，但受血脉上限和祖源影响',
      advantages: ['阶段爆发强', '独特天赋'],
      costs: ['受血脉上限影响', '受祖源影响'],
      anchorEffects: { bodyCapacity: 5, combatConversion: 5, daoCompleteness: -5 },
      debtTypes: [],
    },
    faith_incense: {
      name: '信仰/香火', desc: '可借众生之力快速扩张，但依赖信众、身份暴露、愿力污染',
      advantages: ['借众生之力', '快速扩张'],
      costs: ['依赖信众', '身份暴露', '愿力污染'],
      anchorEffects: { soulStability: -15, karmaLoad: 10, identityRisk: 25, powerAutonomy: -15 },
      debtTypes: ['soul', 'dependency', 'identity'],
      debtAmount: 15,
    },
    inheritance: {
      name: '机缘传承', desc: '获得完整高阶体系或遗产，但继承旧敌、契约、因果和前任缺陷',
      advantages: ['完整高阶体系', '获得遗产'],
      costs: ['继承旧敌', '契约约束', '因果和前任缺陷'],
      anchorEffects: { daoCompleteness: 10, foundation: -5, karmaLoad: 10, powerAutonomy: -10 },
      debtTypes: ['karma', 'autonomy'],
      debtAmount: 12,
    },
    self_created: {
      name: '自创功法', desc: '高度自主、适配个人、终局潜力高，但试错风险大、成长慢、需要知识积累',
      advantages: ['高度自主', '适配个人', '终局潜力高'],
      costs: ['试错风险大', '成长慢', '需知识积累'],
      anchorEffects: { daoCompleteness: 15, daoMastery: 10, foundation: 5, powerAutonomy: 10 },
      debtTypes: [],
    },
  },

  // 初始化修炼道路状态
  initState(state) {
    if (!state.cultivationPath) state.cultivationPath = 'bitter_cultivation';
    if (!state.pathHistory) state.pathHistory = []; // 记录路线变更历史
    if (!state.pathMilestones) state.pathMilestones = {}; // {pathId: [milestone]}
  },

  // 切换修炼道路
  switchPath(state, newPathId, reason) {
    this.initState(state);
    if (!this.PATHS[newPathId]) return; // 验证pathId合法性
    var oldPath = state.cultivationPath;
    if (oldPath === newPathId) return;
    state.pathHistory.push({
      from: oldPath,
      to: newPathId,
      reason: reason || 'unknown',
      time: state.gameDay || 1,
    });
    state.cultivationPath = newPathId;
    // 应用新道路的锚定值效果（一次性）
    var pathDef = this.PATHS[newPathId];
    if (pathDef && pathDef.anchorEffects) {
      for (var key in pathDef.anchorEffects) {
        CultivationAnchors.modify(state, key, pathDef.anchorEffects[key]);
      }
    }
    // 如果新道路产生债务，添加债务
    if (pathDef && pathDef.debtTypes && pathDef.debtTypes.length > 0) {
      for (var i = 0; i < pathDef.debtTypes.length; i++) {
        CultivationDebt.addDebt(state, pathDef.debtTypes[i], pathDef.debtAmount || 10, '路线:' + pathDef.name);
      }
    }
  },

  // 获取当前修炼道路信息
  getCurrentPath(state) {
    this.initState(state);
    return this.PATHS[state.cultivationPath] || this.PATHS.bitter_cultivation;
  },
};

// ===== 统一初始化函数（在engine加载存档时调用） =====
function initWorldModel(state) {
  WorldFactManager.initState(state);
  CultivationAnchors.initState(state);
  CultivationDebt.initState(state);
  CultivationPaths.initState(state);
  // 为所有已存在NPC初始化记忆
  if (state.npcList) {
    for (var i = 0; i < state.npcList.length; i++) {
      NPCMemory.initMemory(state.npcList[i]);
    }
  }
}

// ===== 导出到全局 =====
if (typeof window !== 'undefined') {
  window.WorldFactManager = WorldFactManager;
  window.NPCMemory = NPCMemory;
  window.CultivationAnchors = CultivationAnchors;
  window.CultivationDebt = CultivationDebt;
  window.CultivationPaths = CultivationPaths;
  window.initWorldModel = initWorldModel;
}
