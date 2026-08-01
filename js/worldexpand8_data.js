// ===== 扩展8：灵根/宗门联姻/同行/飞书传信 数据 =====

// 灵根等阶
var SPIRIT_ROOT_TIERS = [
  { id: 0, name: '杂灵根', cultivateRate: 0.5, spellMult: 0.7, desc: '五行俱全，杂质过多，修炼极慢' },
  { id: 1, name: '四灵根', cultivateRate: 0.7, spellMult: 0.85, desc: '四行齐聚，尚可修炼' },
  { id: 2, name: '三灵根', cultivateRate: 0.9, spellMult: 1.0, desc: '三行归一，中上之资' },
  { id: 3, name: '双灵根', cultivateRate: 1.2, spellMult: 1.2, desc: '双行相辅，上佳之资' },
  { id: 4, name: '单灵根', cultivateRate: 1.5, spellMult: 1.4, desc: '纯一不杂，天纵之资' },
  { id: 5, name: '天灵根', cultivateRate: 2.0, spellMult: 1.7, desc: '天赋异禀，万中无一' },
];

// 五行
var SPIRIT_ELEMENTS = ['金', '木', '水', '火', '土'];

// 补天丹
var BUTIAN_PILL = {
  name: '补天丹',
  desc: '上古丹药，服用后可提升灵根资质一阶',
  tierUp: 1, // 提升1阶
};

// 补天丹炼制配方
var BUTIAN_RECIPE = {
  name: '补天丹',
  materials: [
    { id: 'spirit_grass', name: '灵草', count: 5 },
    { id: 'five_elem_essence', name: '五行精华', count: 1 },
    { id: 'heaven_spirit_stone', name: '天灵石', count: 3 },
  ],
  cost: 2000,
  result: 'butian_pill',
};

// 普通NPC灵根随机权重（杂/四/三/双/单/天）
var NPC_ROOT_WEIGHTS = [0.55, 0.22, 0.13, 0.07, 0.025, 0.005];

// 宗门天骄NPC灵根权重
var SECT_GENIUS_ROOT_WEIGHTS = [0.10, 0.20, 0.30, 0.25, 0.12, 0.03];

// 野生天才灵根权重
var WILD_GENIUS_ROOT_WEIGHTS = [0.05, 0.10, 0.25, 0.30, 0.20, 0.10];

// 技能reqStage对应的伤害倍率加成（每级reqStage额外加成）
var TECH_STAGE_BONUS = [0, 0.1, 0.25, 0.5, 0.8, 1.2, 2.0];

// 宗门AI事件类型
var SECT_AI_EVENTS = [
  {
    type: 'alliance',
    name: '联姻结盟',
    desc: '{sect1}与{sect2}通过联姻结成同盟，双方实力大增！',
    strengthChange1: 0.08,
    strengthChange2: 0.08,
    weight: 0.35,
  },
  {
    type: 'war_win',
    name: '宗门攻伐',
    desc: '{sect1}攻伐{sect2}大获全胜，掠夺大量资源！',
    strengthChange1: 0.12,
    strengthChange2: -0.15,
    weight: 0.30,
  },
  {
    type: 'war_lose',
    name: '宗门败北',
    desc: '{sect1}进攻{sect2}惨遭失败，损失惨重！',
    strengthChange1: -0.10,
    strengthChange2: 0.05,
    weight: 0.20,
  },
  {
    type: 'trade',
    name: '资源交易',
    desc: '{sect1}与{sect2}进行资源交易，互利共赢。',
    strengthChange1: 0.04,
    strengthChange2: 0.04,
    weight: 0.15,
  },
];

// 联姻成功率基础值
var MARRIAGE_BASE_SUCCESS = 0.3;

// 强制联姻实力倍率
var FORCE_MARRIAGE_MULT = 1.5;

// 同行要求好感度
var TRAVEL_TOGETHER_AFFINITY = 60;

// 飞书传信消耗
var SUMMON_COSTS = {
  stones: 200,
  desc: '消耗200灵石与一张传音符',
};

// 飞书传信可召唤的关系类型
var SUMMON_RELATIONS = [
  { type: 'spouse', name: '道侣', icon: '💑' },
  { type: 'sworn', name: '结义', icon: '🤝' },
  { type: 'friend', name: '好友', icon: '👤' },
  { type: 'godparent', name: '义父母', icon: '👪' },
];

// 灵根相关对话
var SPIRIT_ROOT_DIALOGUES = {
  mixed: [
    '我这杂灵根资质平庸，修炼多年仍无寸进……',
    '五行俱全反受其累，若能提纯灵根就好了。',
  ],
  heaven: [
    '天灵根！万中无一的天赋，假以时日必成大器！',
    '此人天灵根资质，前途不可限量！',
  ],
  stripped: '你竟夺我灵根！此仇不共戴天！',
};

// 剥夺灵根要求：玩家修为需高于目标至少2个小境界
var STRIP_ROOT_REQ_LEVEL_DIFF = 2;

// 补天丹野外掉落概率
var BUTIAN_DROP_RATE = 0.02;

// 补天丹在副本中的掉落概率
var BUTIAN_DUNGEON_DROP_RATE = 0.05;
