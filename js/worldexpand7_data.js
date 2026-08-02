/* ====== 凡人修仙传MUD · 扩展7数据（宗门建筑/亲戚/忠贞度菜单/友好度事件/凡人对话/机缘悟性） ====== */

// ===== 宗门/家族建筑定义 =====
const SECT_BUILDINGS = {
  scripture_lib: {
    name: "藏书阁", icon: "📚", desc: "藏有历代功法典籍，可用贡献度兑换。",
    maxLevel: 5, baseCost: 2000, costMult: 1.5,
    unlocks: ["cultivation_techs"],
  },
  treasure_pav: {
    name: "藏宝阁", icon: "💎", desc: "存放宗门珍藏宝物，可用贡献度兑换。",
    maxLevel: 5, baseCost: 3000, costMult: 1.5,
    unlocks: ["treasures"],
  },
  alchemy_room: {
    name: "炼丹阁", icon: "⚗️", desc: "丹炉日夜不息，可兑换丹药或自行炼丹。",
    maxLevel: 5, baseCost: 2500, costMult: 1.5,
    unlocks: ["pills", "alchemy_craft"],
  },
  artifact_room: {
    name: "炼器阁", icon: "🔨", desc: "锻造法器之地，可兑换武器或自行炼器。",
    maxLevel: 5, baseCost: 2500, costMult: 1.5,
    unlocks: ["weapons", "artifact_craft"],
  },
  training_ground: {
    name: "练武场", icon: "⚔️", desc: "弟子日常修炼切磋之地，可获得修为经验。",
    maxLevel: 5, baseCost: 1500, costMult: 1.3,
    unlocks: ["spar", "train_bonus"],
  },
  mission_hall: {
    name: "任务殿", icon: "📋", desc: "领取宗门日常任务，获取贡献度。",
    maxLevel: 3, baseCost: 1000, costMult: 1.3,
    unlocks: ["sect_quests"],
  },
};

// ===== 藏书阁功法（按境界分阶） =====
// 每阶数量: 练气10 筑基9 结丹8 元婴7 化神6 合体5 大乘4 渡劫3
const SECT_TECHS_BY_STAGE = {
  0: [ // 练气期功法
    {id:"st_qixuan_basic", name:"七玄入门功", type:"cultivation", reqStage:0, atkBonus:3, expBonus:0.05, contribCost:50, posReq:"outer_disciple"},
    {id:"st_spirit_gather", name:"聚灵术", type:"cultivation", reqStage:0, maxMpBonus:50, expBonus:0.08, contribCost:80, posReq:"outer_disciple"},
    {id:"st_basic_sword", name:"基础剑诀", type:"cultivation", reqStage:0, atkBonus:5, expBonus:0.03, contribCost:60, posReq:"outer_disciple"},
    {id:"st_wind_step", name:"御风步", type:"cultivation", reqStage:0, spdBonus:10, expBonus:0.05, contribCost:70, posReq:"outer_disciple"},
    {id:"st_flame_palm", name:"烈焰掌", type:"attack", reqStage:0, damage:25, mpCost:8, contribCost:90, posReq:"outer_disciple"},
    {id:"st_ice_shield", name:"寒冰盾", type:"defense", reqStage:0, defBonus:15, mpCost:10, contribCost:80, posReq:"outer_disciple"},
    {id:"st_spirit_eye", name:"灵目术", type:"utility", reqStage:0, desc:"可看穿低阶幻术。", contribCost:40, posReq:"outer_disciple"},
    {id:"st_heal_breath", name:"回春吐纳", type:"cultivation", reqStage:0, expBonus:0.06, contribCost:60, posReq:"outer_disciple"},
    {id:"st_purify", name:"净心诀", type:"cultivation", reqStage:0, expBonus:0.04, contribCost:50, posReq:"outer_disciple"},
    {id:"st_iron_body", name:"铁布衫", type:"defense", reqStage:0, defBonus:10, hpBonus:100, contribCost:70, posReq:"outer_disciple"},
  ],
  1: [ // 筑基期功法
    {id:"st_jade_purity", name:"玉清功", type:"cultivation", reqStage:1, atkBonus:15, expBonus:0.1, contribCost:200, posReq:"inner_disciple"},
    {id:"st_blue_sea_art", name:"碧海潮生", type:"cultivation", reqStage:1, maxMpBonus:200, expBonus:0.12, contribCost:250, posReq:"inner_disciple"},
    {id:"st_sword_qi_art", name:"剑气术", type:"attack", reqStage:1, damage:80, mpCost:20, contribCost:200, posReq:"inner_disciple"},
    {id:"st_golden_bell", name:"金钟罩", type:"defense", reqStage:1, defBonus:40, mpCost:15, contribCost:180, posReq:"inner_disciple"},
    {id:"st_thunder_strike", name:"雷霆术", type:"attack", reqStage:1, damage:100, mpCost:30, contribCost:280, posReq:"inner_disciple"},
    {id:"st_wind_blade", name:"风刃术", type:"attack", reqStage:1, damage:80, mpCost:20, contribCost:220, posReq:"inner_disciple"},
    {id:"st_spirit_shield", name:"灵力护盾", type:"defense", reqStage:1, shield:200, mpCost:30, contribCost:200, posReq:"inner_disciple"},
    {id:"st_ice_seal", name:"冰封术", type:"attack", reqStage:1, damage:120, mpCost:40, contribCost:300, posReq:"inner_disciple"},
    {id:"st_heaven_escape", name:"天遁术", type:"utility", reqStage:1, mpCost:50, contribCost:250, posReq:"inner_disciple"},
  ],
  2: [ // 结丹期功法
    {id:"st_void_heaven", name:"虚天诀", type:"cultivation", reqStage:2, atkBonus:60, defBonus:60, maxMpBonus:400, expBonus:0.15, contribCost:500, posReq:"inner_deacon"},
    {id:"st_heaven_demon", name:"天魔功", type:"cultivation", reqStage:2, atkBonus:80, defBonus:40, expBonus:0.1, contribCost:600, posReq:"inner_deacon"},
    {id:"st_sword_rain", name:"万剑归宗", type:"attack", reqStage:2, damage:250, mpCost:60, contribCost:550, posReq:"inner_deacon"},
    {id:"st_demon_seal", name:"封魔印", type:"attack", reqStage:2, damage:400, mpCost:80, contribCost:700, posReq:"inner_deacon"},
    {id:"st_nine_trans", name:"九转玄功", type:"utility", reqStage:2, hpBonus:500, atkBonus:30, defBonus:30, contribCost:600, posReq:"inner_deacon"},
    {id:"st_big_day", name:"大衍决", type:"special", reqStage:2, compBonus:3, luckBonus:3, contribCost:800, posReq:"inner_deacon"},
    {id:"st_sword_intent", name:"剑道真意", type:"special", reqStage:2, swordMult:0.5, contribCost:700, posReq:"inner_deacon"},
    {id:"st_ice_seal_great", name:"冰封万里", type:"attack", reqStage:2, damage:200, mpCost:50, effect:"freeze", contribCost:550, posReq:"inner_deacon"},
  ],
  3: [ // 元婴期功法
    {id:"st_soul_escape", name:"元婴出窍", type:"utility", reqStage:3, desc:"元婴离体遁走。", contribCost:1500, posReq:"elder"},
    {id:"st_void_slash", name:"虚空斩", type:"attack", reqStage:3, damage:800, mpCost:150, ignoreDef:true, contribCost:1800, posReq:"elder"},
    {id:"st_soul_seal", name:"封魂印", type:"attack", reqStage:3, damage:500, mpCost:100, effect:"seal", contribCost:1600, posReq:"elder"},
    {id:"st_great_shield", name:"天罡护体", type:"defense", reqStage:3, defBonus:200, shield:1000, mpCost:100, contribCost:1500, posReq:"elder"},
    {id:"st_heaven_palm", name:"翻天掌", type:"attack", reqStage:3, damage:600, mpCost:120, contribCost:1700, posReq:"elder"},
    {id:"st_star_power", name:"星辰诀", type:"cultivation", reqStage:3, atkBonus:150, expBonus:0.2, contribCost:2000, posReq:"elder"},
    {id:"st_demon_refine", name:"炼魔功", type:"cultivation", reqStage:3, atkBonus:120, defBonus:80, expBonus:0.15, contribCost:1800, posReq:"elder"},
  ],
  4: [ // 化神期功法
    {id:"st_great_purity", name:"太清仙诀", type:"cultivation", reqStage:4, allBonus:0.3, expBonus:0.25, contribCost:5000, posReq:"grand_elder"},
    {id:"st_heaven_tribulation", name:"天劫之引", type:"attack", reqStage:4, damage:2000, mpCost:300, contribCost:5500, posReq:"grand_elder"},
    {id:"st_void_body", name:"虚空之体", type:"utility", reqStage:4, hpBonus:5000, atkBonus:200, defBonus:200, contribCost:6000, posReq:"grand_elder"},
    {id:"st_star_domain", name:"星域", type:"attack", reqStage:4, damage:3000, mpCost:400, contribCost:6500, posReq:"grand_elder"},
    {id:"st_immortal_shield", name:"仙盾术", type:"defense", reqStage:4, shield:5000, mpCost:200, contribCost:5500, posReq:"grand_elder"},
    {id:"st_void_escape", name:"虚空遁", type:"utility", reqStage:4, desc:"可穿越空间壁垒。", contribCost:5000, posReq:"grand_elder"},
  ],
  5: [ // 合体期功法
    {id:"st_unity_art", name:"合一大法", type:"cultivation", reqStage:5, allBonus:0.5, expBonus:0.3, contribCost:15000, posReq:"sect_leader"},
    {id:"st_void_realm", name:"虚空领域", type:"attack", reqStage:5, damage:8000, mpCost:600, contribCost:18000, posReq:"sect_leader"},
    {id:"st_immortal_gu_refine", name:"炼蛊术", type:"special", reqStage:5, desc:"掌握炼制仙蛊的方法。", contribCost:20000, posReq:"sect_leader"},
    {id:"st_heaven_seal", name:"天封印", type:"attack", reqStage:5, damage:10000, mpCost:800, effect:"seal", contribCost:22000, posReq:"sect_leader"},
    {id:"st_dao_heart", name:"道心通明", type:"cultivation", reqStage:5, expBonus:0.4, compBonus:5, luckBonus:5, contribCost:20000, posReq:"sect_leader"},
  ],
  6: [ // 大乘期功法
    {id:"st_immortal_strike", name:"仙道天击", type:"attack", reqStage:6, damage:50000, mpCost:1000, contribCost:50000, posReq:"grand_elder"},
    {id:"st_immortal_body", name:"仙人之体", type:"utility", reqStage:6, hpBonus:50000, atkBonus:1000, defBonus:1000, contribCost:60000, posReq:"grand_elder"},
    {id:"st_dao_unity", name:"天人合一", type:"cultivation", reqStage:6, allBonus:1.0, expBonus:0.5, contribCost:80000, posReq:"grand_elder"},
    {id:"st_void_annihilation", name:"虚空湮灭", type:"attack", reqStage:6, damage:100000, mpCost:2000, contribCost:100000, posReq:"grand_elder"},
  ],
  7: [ // 渡劫期功法
    {id:"st_heaven_defying", name:"逆天诀", type:"cultivation", reqStage:7, allBonus:2.0, expBonus:0.8, contribCost:200000, posReq:"sect_leader"},
    {id:"st_immortal_tribulation", name:"万劫不灭", type:"defense", reqStage:7, defBonus:5000, shield:50000, mpCost:5000, contribCost:250000, posReq:"sect_leader"},
    {id:"st_chaos_seal", name:"混沌封印", type:"attack", reqStage:7, damage:500000, mpCost:5000, effect:"seal", contribCost:300000, posReq:"sect_leader"},
  ],
};

// ===== 藏宝阁宝物（按宗门实力等级） =====
const SECT_TREASURES_BY_STRENGTH = {
  2: [ // 实力2的宗门
    {id:"st_gift_jade", itemId:"gift_jade_pendant", name:"玉佩", contribCost:100, posReq:"outer_disciple"},
    {id:"st_qi_pill", itemId:"qi_pill", name:"灵气丹", contribCost:80, posReq:"outer_disciple"},
    {id:"st_healing_pill", itemId:"healing_pill", name:"疗伤丹", contribCost:80, posReq:"outer_disciple"},
  ],
  5: [
    {id:"st_breakthrough_pill", itemId:"breakthrough_pill", name:"破境丹", contribCost:500, posReq:"inner_disciple"},
    {id:"st_gift_scroll", itemId:"gift_ancient_scroll", name:"古籍残卷", contribCost:400, posReq:"inner_disciple"},
    {id:"st_power_pill", itemId:"power_pill", name:"增力丹", contribCost:300, posReq:"inner_disciple"},
  ],
  8: [
    {id:"st_foundation_pill", itemId:"foundation_pill", name:"筑基丹", contribCost:1000, posReq:"inner_disciple"},
    {id:"st_gift_treasure", itemId:"gift_heaven_treasure", name:"天地灵珍", contribCost:800, posReq:"inner_deacon"},
    {id:"st_dual_pill", itemId:"dual_cultivation_pill", name:"双修丹", contribCost:1200, posReq:"inner_deacon"},
  ],
  12: [
    {id:"st_core_pill", itemId:"core_formation_pill", name:"结丹丹", contribCost:3000, posReq:"inner_deacon"},
    {id:"st_longevity_pill", itemId:"longevity_pill", name:"延寿丹", contribCost:2500, posReq:"elder"},
    {id:"st_breakthrough_supreme", itemId:"breakthrough_pill_supreme", name:"极品破境丹", contribCost:5000, posReq:"elder"},
  ],
};

// ===== 炼丹阁丹药 =====
const SECT_PILLS_BY_STAGE = {
  0: [
    {id:"sp_healing", itemId:"healing_pill", name:"疗伤丹", contribCost:60, posReq:"outer_disciple"},
    {id:"sp_qi", itemId:"qi_pill", name:"灵气丹", contribCost:50, posReq:"outer_disciple"},
    {id:"sp_power", itemId:"power_pill", name:"增力丹", contribCost:100, posReq:"outer_disciple"},
  ],
  1: [
    {id:"sp_foundation", itemId:"foundation_pill", name:"筑基丹", contribCost:500, posReq:"inner_disciple"},
    {id:"sp_breakthrough", itemId:"breakthrough_pill", name:"破境丹", contribCost:400, posReq:"inner_disciple"},
  ],
  2: [
    {id:"sp_core", itemId:"core_formation_pill", name:"结丹丹", contribCost:2000, posReq:"inner_deacon"},
    {id:"sp_longevity", itemId:"longevity_pill", name:"延寿丹", contribCost:1500, posReq:"inner_deacon"},
  ],
  3: [
    {id:"sp_infant", itemId:"infant_formation_pill", name:"凝婴丹", contribCost:8000, posReq:"elder"},
    {id:"sp_great_longevity", itemId:"great_longevity_pill", name:"大延寿丹", contribCost:5000, posReq:"elder"},
  ],
};

// 炼丹配方（需要材料）
const ALCHEMY_RECIPES = {
  healing_pill: {name:"疗伤丹", materials:{spirit_grass:2}, result:"healing_pill", reqStage:0},
  qi_pill: {name:"灵气丹", materials:{spirit_grass:1, qi_herb:1}, result:"qi_pill", reqStage:0},
  foundation_pill: {name:"筑基丹", materials:{foundation_herb:3, spirit_grass:5}, result:"foundation_pill", reqStage:1},
  breakthrough_pill: {name:"破境丹", materials:{breakthrough_herb:2, qi_herb:3}, result:"breakthrough_pill", reqStage:1},
  longevity_pill: {name:"延寿丹", materials:{pine_heart_grass:2, blood_ginseng:1}, result:"longevity_pill", reqStage:2},
};

// ===== 炼器阁武器 =====
const SECT_WEAPONS_BY_STAGE = {
  0: [
    {id:"sw_iron_sword", itemId:"iron_sword", name:"铁剑", contribCost:80, posReq:"outer_disciple"},
    {id:"sw_cloth_robe", itemId:"cloth_robe", name:"布袍", contribCost:50, posReq:"outer_disciple"},
  ],
  1: [
    {id:"sw_qingshuang", itemId:"qingshuang_sword", name:"青霜剑", contribCost:400, posReq:"inner_disciple"},
    {id:"sw_blue_robe", itemId:"blue_robe", name:"蓝灵袍", contribCost:300, posReq:"inner_disciple"},
  ],
  2: [
    {id:"sw_zisha", itemId:"zisha_sword", name:"紫砂剑", contribCost:1000, posReq:"inner_deacon"},
    {id:"sw_purple", itemId:"purple_armor", name:"紫甲", contribCost:800, posReq:"inner_deacon"},
  ],
  3: [
    {id:"sw_blue_silk", itemId:"blue_silk_sword", name:"青丝剑", contribCost:2500, posReq:"elder"},
    {id:"sw_dragon", itemId:"dragon_scale_armor", name:"龙鳞甲", contribCost:3000, posReq:"elder"},
  ],
};

// 炼器配方
const ARTIFACT_RECIPES = {
  iron_sword: {name:"铁剑", materials:{iron_ore:3}, result:"iron_sword", reqStage:0},
  qingshuang_sword: {name:"青霜剑", materials:{spirit_iron:2, iron_ore:5}, result:"qingshuang_sword", reqStage:1},
  zisha_sword: {name:"紫砂剑", materials:{purple_iron:2, spirit_iron:3}, result:"zisha_sword", reqStage:2},
};

// ===== 宗门职位定义（用于建筑兑换要求） =====
const SECT_POSITIONS_RANK = {
  outer_disciple: {name:"外门弟子", rank:1},
  inner_disciple: {name:"内门弟子", rank:2},
  inner_deacon: {name:"内门执事", rank:3},
  elder: {name:"护法长老", rank:4},
  grand_elder: {name:"太上长老", rank:5},
  sect_leader: {name:"宗主/族长", rank:6},
};

// ===== "更多"菜单选项（基于忠贞度等级） =====
const MORE_ACTIONS = [
  {
    id:"chat_date", name:"邀约散步", desc:"与对方一起散步，增进感情。",
    reqLoyalty: 100, reqMood: 60, affinityGain: 5,
    effect: "mood", desc_text:"你和{name}在{area}漫步，聊着修仙路上的趣事。",
  },
  {
    id:"chat_drink", name:"共饮灵酿", desc:"一起品饮灵酒，畅谈心事。",
    reqLoyalty: 90, reqMood: 65, affinityGain: 8,
    needItem: "gift_spirit_wine",
    effect: "mood", desc_text:"你与{name}举杯共饮，气氛渐渐热络。",
  },
  {
    id:"chat_gift", name:"赠送信物", desc:"赠送贴身信物，暗示心意。",
    reqLoyalty: 80, reqMood: 70, affinityGain: 10,
    needItem: "gift_jade_pendant",
    effect: "mood", desc_text:"你将一块玉佩赠予{name}，对方脸上泛起红晕。",
  },
  {
    id:"chat_cultivate", name:"一起修炼", desc:"一起打坐修炼，交流心得。",
    reqLoyalty: 70, reqMood: 60, expGain: 200,
    effect: "exp", desc_text:"你与{name}一起修炼，灵力交融，感悟良多。",
  },
  {
    id:"chat_intimate", name:"亲近举止", desc:"做出更亲密的举动。",
    reqLoyalty: 60, reqMood: 70, affinityGain: 15,
    effect: "mood", desc_text:"你握住{name}的手，对方没有挣脱，反而微微靠近。",
  },
  {
    id:"chat_dual_hint", name:"暗示双修", desc:"暗示希望双修之意。",
    reqLoyalty: 50, reqMood: 75, affinityGain: 20,
    effect: "mood", desc_text:"你婉转地暗示双修之事，{name}眼中闪过一丝羞意。",
  },
  {
    id:"chat_secret_meet", name:"密约暗会", desc:"秘密约会，避开道侣。",
    reqLoyalty: 40, reqMood: 70,
    effect: "discover", discoverChance: 0.15, affinityGain: 15,
    desc_text:"你与{name}在偏僻处密约，心中既有甜蜜又有紧张。",
  },
  {
    id:"chat_intimate_touch", name:"肌肤之亲", desc:"更亲密的接触。",
    reqLoyalty: 30, reqMood: 70, affinityGain: 25,
    effect: "discover", discoverChance: 0.2,
    desc_text:"你与{name}的举止越来越亲密……",
  },
  {
    id:"chat_secret_dual", name:"秘密双修", desc:"趁道侣不在进行秘密双修。",
    reqLoyalty: 25, reqMood: 60,
    effect: "secret_dual", discoverChance: 0.25,
    desc_text:"趁无人时，你与{name}秘密双修……",
  },
  {
    id:"chat_extreme", name:"极端之举", desc:"做出格之事。",
    reqLoyalty: 10, reqMood: 50,
    effect: "discover", discoverChance: 0.35, affinityGain: 30,
    desc_text:"你做出了出格之举，{name}既羞又怒，却无力反抗。",
  },
  // ===== 忠贞度≤0 以下新增选项（忠贞尽失，彻底沦陷） =====
  {
    id:"chat_total_submit", name:"彻底占有", desc:"忠贞已失，彻底占有对方。",
    reqLoyalty: 0, reqMood: 40,
    effect: "discover", discoverChance: 0.2, affinityGain: 35, expGain: 300,
    desc_text:"{name}的忠贞已荡然无存，你将其彻底占有，对方再无反抗之力……",
  },
  {
    id:"chat_mind_control", name:"精神控制", desc:"以秘术控制对方心智，令其言听计从。",
    reqLoyalty: -20, reqMood: 30,
    effect: "secret_dual", discoverChance: 0.15, expGain: 500,
    desc_text:"你施展秘术，{name}的眼神变得空洞，对你的指令言听计从……",
  },
  {
    id:"chat_enslave", name:"奴役身心", desc:"令对方完全沦为你的奴仆。",
    reqLoyalty: -50, reqMood: 20,
    effect: "secret_dual", discoverChance: 0.1, expGain: 800, affinityGain: 20,
    desc_text:"{name}已彻底沦陷，身心皆受你掌控，如奴仆般侍奉左右……",
  },
  {
    id:"chat_absolute_dom", name:"绝对支配", desc:"对方的意志已完全被你取代。",
    reqLoyalty: -80, reqMood: 0,
    effect: "secret_dual", discoverChance: 0.05, expGain: 1200, affinityGain: 30,
    desc_text:"{name}的意志已完全消融，如同你的影子，对你绝对服从……",
  },
];

// ===== 亲戚关系模板 =====
const RELATIVE_TYPES = [
  {type:"uncle_f", name:"伯父", isFemale:false, ageDiff:[15,35]},
  {type:"uncle_m", name:"叔父", isFemale:false, ageDiff:[15,30]},
  {type:"aunt_f", name:"姑母", isFemale:true, ageDiff:[15,30]},
  {type:"aunt_m", name:"姨母", isFemale:true, ageDiff:[12,28]},
  {type:"uncle_inlaw", name:"姨夫", isFemale:false, ageDiff:[15,35]},
  {type:"aunt_inlaw", name:"舅母", isFemale:true, ageDiff:[15,30]},
  {type:"cousin_m", name:"堂兄", isFemale:false, ageDiff:[-5,10]},
  {type:"cousin_f", name:"堂姐", isFemale:true, ageDiff:[-5,10]},
  {type:"cousin_m2", name:"表弟", isFemale:false, ageDiff:[-8,5]},
  {type:"cousin_f2", name:"表妹", isFemale:true, ageDiff:[-8,5]},
];

// ===== 凡人对话库 =====
const MORTAL_DIALOGUES = [
  "「今年收成不太好，听说隔壁村闹了妖兽，日子不好过啊。」",
  "「修仙的大人？小人家中还有些粗茶淡饭，大人若不嫌弃……」",
  "「我家那小子整天做梦想修仙，可哪有那个命啊。」",
  "「大人可是去城里的？帮忙带个口信可好？」",
  "「最近天气反常，老汉活了六十年，头一回见这样的天象。」",
  "「听说城东的张屠户发财了，也不知是走了什么运。」",
  "「大人慢走，路上小心，听说山里不太平。」",
  "「哎，这年头，修仙的越来越多了，我们凡人越来越难活了。」",
  "「大人可知道哪里有灵泉水？我家老母病了，想求些来。」",
  "「前些日子村口来了个道人，说是能算命，也不知准不准。」",
  "「大人有所不知，我家祖上也曾出过修士的，可惜到我这一辈就断了。」",
  "「大人若是路过集市，帮我捎两斤盐可好？我这里有几十文铜钱。」",
  "「今年的赋税又涨了，百姓们苦啊……」",
  "「大人看起来面善，不如到寒舍喝杯粗茶？」",
  "「小女年方二八，虽非修仙之才，却也能持家……大人可有婚配？」",
  "「听说山那边有仙人斗法，惊天动地的，我们凡人哪敢去看。」",
  "「大人修为高深，可否帮小人看看这祖传的玉佩？」",
  "「地里庄稼总是长不好，也不知是不是风水的问题。」",
];

// ===== 修士闲聊对话库 =====
const CULTIVATOR_DIALOGUES = [
  "「道友修为精进神速，不知修的是什么功法？」",
  "「近日灵气稀薄，修炼越发艰难了。」",
  "「道友可曾去过{area}？听说那里有上古遗宝出世。」",
  "「我观道友气息沉稳，莫非是要突破了？」",
  "「如今世道纷乱，正魔之争愈演愈烈，我等散修行走不易啊。」",
  "「道友可知道哪家丹药铺的筑基丹成色好些？」",
  "「听说{sect}在招新弟子，道友可有兴趣？」",
  "「前日在{area}遇到一头上古妖兽，差点丢了性命。」",
  "「修仙修仙，修的到底是仙还是心魔……」",
  "「道友的机缘看来不错，我观你周身灵气隐隐有异象。」",
  "「近来坊市灵石价格飞涨，修士的日子也不好过了。」",
  "「我那老友去了坠魔谷至今未归，也不知是死是活。」",
  "「道友可有兴趣一起去探索{area}？人多也好照应。」",
  "「我炼制的丹药总是差了火候，也不知哪里出了问题。」",
  "「最近总觉心神不宁，莫非是要走火入魔了？」",
];

// ===== 野外友好度事件（提升宗门/家族好感） =====
const FRIENDLY_ENCOUNTERS = [
  {
    id:"injured_member", type:"injured", name:"受伤的同门",
    desc:"你在{area}探索时，发现一位{sectName}的弟子身受重伤，倒在路边。",
    needItem:"healing_pill", reward:{relation:15, exp:500, stones:200},
    choiceText:"给以丹药救治", failText:"你没有疗伤丹药，只能眼睁睁看着对方离去。",
  },
  {
    id:"sieged_member", type:"combat", name:"被围攻的同门",
    desc:"你在{area}发现一位{sectName}弟子正被数名敌人围攻，情况危急！",
    enemyMult:0.8, reward:{relation:25, exp:1000, stones:300},
    choiceText:"上前助战", winText:"你与{sectName}弟子联手击败了敌人！",
  },
  {
    id:"captured_member", type:"combat", name:"被抓的同门",
    desc:"你在{area}发现一位{sectName}弟子被邪修挟持，正被带往不知名处。",
    enemyMult:1.0, reward:{relation:30, exp:1500, stones:500},
    choiceText:"营救同门", winText:"你击败了邪修，救出了{sectName}弟子！",
  },
  {
    id:"losing_battle", type:"combat", name:"处于下风的同门",
    desc:"你在{area}遇到一位{sectName}弟子正在与强敌交战，明显处于下风。",
    enemyMult:1.2, reward:{relation:35, exp:2000, stones:800},
    choiceText:"助阵战斗", winText:"你及时出手，与{sectName}弟子联手反败为胜！",
  },
];

// ===== 副本事件模板（按地点类型） =====
const DUNGEON_EVENTS_BY_TYPE = {
  wild: [
    {type:"enemy", weight:35, desc:"你在荒野中遇到了凶兽！"},
    {type:"treasure", weight:20, desc:"你发现了一个遗落的储物袋。"},
    {type:"npc", weight:25, desc:"你在荒野中遇到了一位修士。"},
    {type:"cave", weight:10, desc:"你发现了一处隐蔽的洞府。"},
    {type:"empty", weight:10, desc:"你仔细搜索了一番，没有发现什么。"},
  ],
  sea: [
    {type:"enemy", weight:40, desc:"海中突然涌出一只海兽！"},
    {type:"treasure", weight:25, desc:"你在海底发现了一个宝箱。"},
    {type:"npc", weight:15, desc:"你遇到了一位海上修士。"},
    {type:"storm", weight:15, desc:"突然遭遇海上风暴！"},
    {type:"empty", weight:5, desc:"海面上风平浪静，无事发生。"},
  ],
  ruins: [
    {type:"enemy", weight:30, desc:"遗迹中的守护傀儡苏醒了！"},
    {type:"treasure", weight:25, desc:"你在遗迹深处发现了一件上古宝物。"},
    {type:"trap", weight:20, desc:"你触发了一个上古禁制！"},
    {type:"npc", weight:15, desc:"你在遗迹中遇到了一位寻宝修士。"},
    {type:"inheritance", weight:10, desc:"你发现了一处上古传承之地！"},
  ],
  danger: [
    {type:"enemy", weight:40, desc:"魔气中涌出一头魔物！"},
    {type:"treasure", weight:20, desc:"你在魔气弥漫中发现了一件魔宝。"},
    {type:"trap", weight:20, desc:"你踩中了一个魔气陷阱！"},
    {type:"npc", weight:10, desc:"你遇到了一位魔道修士。"},
    {type:"empty", weight:10, desc:"魔气翻涌，但暂时没有危险。"},
  ],
  warzone: [
    {type:"enemy", weight:35, desc:"战场上冲出一队敌兵！"},
    {type:"treasure", weight:15, desc:"你在战场废墟中发现了一批军需。"},
    {type:"npc", weight:25, desc:"你遇到了一位同阵营的修士。"},
    {type:"rescue", weight:15, desc:"你发现了一群被困的百姓。"},
    {type:"empty", weight:10, desc:"战场暂时安静，你没有遇到什么。"},
  ],
  sect: [
    {type:"enemy", weight:30, desc:"宗门弟子发现了你的闯入！"},
    {type:"treasure", weight:25, desc:"你在宗门藏宝处发现了一件宝物。"},
    {type:"npc", weight:25, desc:"你遇到了一位宗门弟子。"},
    {type:"scripture", weight:12, desc:"你发现了一间藏经阁！"},
    {type:"empty", weight:8, desc:"你潜行了一圈，没有被发现。"},
  ],
};

// ===== 野外机缘/悟性提升事件 =====
const LUCK_COMP_EVENTS = [
  {id:"lc_spring", name:"灵泉", weight:3, luckGain:1, exp:500, text:"你发现了一处灵泉，沐浴其中，机缘大增！"},
  {id:"lc_insight", name:"顿悟", weight:2, compGain:1, exp:1000, text:"你在一处灵气汇聚之地打坐，突然顿悟，悟性提升！"},
  {id:"lc_ancient", name:"上古传承", weight:1, luckGain:1, compGain:1, exp:5000, text:"你触发了上古修士的传承，机缘与悟性双双提升！"},
  {id:"lc_spirit_fruit", name:"灵果", weight:4, luckGain:1, exp:300, text:"你吃下了一颗天地灵果，感觉灵台清明。"},
  {id:"lc_star_stone", name:"星辰石", weight:2, compGain:1, exp:800, text:"你捡到一块星辰石，悟性有所提升。"},
  {id:"lc_dao_mark", name:"道纹", weight:1, luckGain:2, compGain:1, exp:3000, text:"你在一面石壁上看到了上古道纹，感悟颇深！"},
];

// ===== NPC探索行为日志模板 =====
const NPC_EXPLORE_LOGS = [
  "{name}在{area}探索，获得了一些灵石。",
  "{name}在{area}历练，修为有所精进。",
  "{name}在{area}击败了一只妖兽，获得{item}。",
  "{name}在{area}发现了一处灵脉，修炼获益。",
  "{name}在{area}偶遇前辈指点，修为提升。",
  "{name}在{area}探索时遇到危险，受了些轻伤。",
  "{name}在{area}发现了一株灵草，收入囊中。",
  "{name}在{area}历练归来，收获颇丰。",
];

// ===== 自立宗门区域定义 =====
const OWN_SECT_AREA = {
  defaultName: "灵山福地",
  mapKey: "own_sect_area",
  type: "sect",
  desc: "你自立的宗门领地，灵气充沛，前途无量。",
  reqStage: 3,
  buildings: {}, // 动态填充，从s.ownSectBuildings读取
  connections: ["天南坊市城", "黄枫谷"],
};

// 添加自立宗门区域到WORLD_MAP（运行时）
if (typeof WORLD_MAP !== 'undefined') {
  // 不直接修改，由引擎在运行时添加
}
