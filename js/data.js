/* ====== 凡人修仙传MUD · 游戏数据 ====== */

// ===== 修为等级 =====
const CULT_LEVELS = [
  {name:"练气一层",stage:0,maxExp:100,hpBonus:20,mpBonus:10,atkBonus:2,defBonus:1},
  {name:"练气三层",stage:0,maxExp:200,hpBonus:40,mpBonus:20,atkBonus:4,defBonus:2},
  {name:"练气六层",stage:0,maxExp:400,hpBonus:80,mpBonus:40,atkBonus:8,defBonus:4},
  {name:"练气九层",stage:0,maxExp:800,hpBonus:160,mpBonus:80,atkBonus:16,defBonus:8},
  {name:"练气十二层",stage:0,maxExp:1600,hpBonus:300,mpBonus:150,atkBonus:30,defBonus:15},
  {name:"筑基初期",stage:1,maxExp:3000,hpBonus:600,mpBonus:300,atkBonus:60,defBonus:30},
  {name:"筑基中期",stage:1,maxExp:5000,hpBonus:1000,mpBonus:500,atkBonus:100,defBonus:50},
  {name:"筑基后期",stage:1,maxExp:8000,hpBonus:1800,mpBonus:900,atkBonus:180,defBonus:90},
  {name:"结丹初期",stage:2,maxExp:15000,hpBonus:3500,mpBonus:1800,atkBonus:350,defBonus:175},
  {name:"结丹中期",stage:2,maxExp:25000,hpBonus:6000,mpBonus:3000,atkBonus:600,defBonus:300},
  {name:"结丹后期",stage:2,maxExp:40000,hpBonus:10000,mpBonus:5000,atkBonus:1000,defBonus:500},
  {name:"元婴初期",stage:3,maxExp:70000,hpBonus:20000,mpBonus:10000,atkBonus:2000,defBonus:1000},
  {name:"元婴中期",stage:3,maxExp:120000,hpBonus:40000,mpBonus:20000,atkBonus:4000,defBonus:2000},
  {name:"元婴后期",stage:3,maxExp:200000,hpBonus:80000,mpBonus:40000,atkBonus:8000,defBonus:4000},
  {name:"化神初期",stage:4,maxExp:350000,hpBonus:150000,mpBonus:75000,atkBonus:15000,defBonus:7500},
  {name:"化神中期",stage:4,maxExp:600000,hpBonus:300000,mpBonus:150000,atkBonus:30000,defBonus:15000},
  {name:"化神后期",stage:4,maxExp:1000000,hpBonus:600000,mpBonus:300000,atkBonus:60000,defBonus:30000},
  {name:"合体初期",stage:5,maxExp:2000000,hpBonus:1200000,mpBonus:600000,atkBonus:120000,defBonus:60000},
  {name:"合体中期",stage:5,maxExp:4000000,hpBonus:2500000,mpBonus:1200000,atkBonus:250000,defBonus:125000},
  {name:"合体后期",stage:5,maxExp:8000000,hpBonus:5000000,mpBonus:2500000,atkBonus:500000,defBonus:250000},
  {name:"大乘初期",stage:6,maxExp:15000000,hpBonus:10000000,mpBonus:5000000,atkBonus:1000000,defBonus:500000},
  {name:"大乘中期",stage:6,maxExp:30000000,hpBonus:20000000,mpBonus:10000000,atkBonus:2000000,defBonus:1000000},
  {name:"大乘后期",stage:6,maxExp:60000000,hpBonus:40000000,mpBonus:20000000,atkBonus:4000000,defBonus:2000000},
  {name:"渡劫期",stage:7,maxExp:100000000,hpBonus:80000000,mpBonus:40000000,atkBonus:8000000,defBonus:4000000},
  {name:"飞升成仙",stage:8,maxExp:999999999,hpBonus:999999999,mpBonus:999999999,atkBonus:999999999,defBonus:999999999},
];

const STAGE_NAMES = ["练气期","筑基期","结丹期","元婴期","化神期","合体期","大乘期","渡劫期","仙界"];

// ===== 装备数据 =====
const ITEMS = {
  // 武器
  "iron_sword":{name:"精铁剑",type:"weapon",grade:1,atk:5,desc:"七玄门弟子标配的精铁长剑，锋利耐用。"},
  "qingshuang_sword":{name:"青霜剑",type:"weapon",grade:2,atk:15,desc:"寒铁所铸，剑身泛着青色寒光，挥动间有霜气弥漫。"},
  "zisha_sword":{name:"紫煞剑",type:"weapon",grade:3,atk:40,desc:"以紫煞铁打造，煞气逼人，非筑基修士不可使用。",mpCost:5},
  "blue_silk_sword":{name:"青丝剑",type:"weapon",grade:4,atk:120,desc:"万年青蚕丝炼制，柔可绕指，刚可断金。结丹期法器。",mpCost:10},
  "wind_lei_sword":{name:"风雷翅剑",type:"weapon",grade:4,atk:150,desc:"蕴含风雷之力的古宝，出鞘时风雷大作。",mpCost:15,skill:"风雷斩"},
  "dragon_pattern_blade":{name:"龙纹刀",type:"weapon",grade:5,atk:400,desc:"上古龙纹战刀，刀身刻有真龙图案，挥舞间龙吟阵阵。元婴期至宝。",mpCost:30,skill:"龙啸斩"},
  "void_heaven_blade":{name:"虚天刃",type:"weapon",grade:5,atk:800,desc:"虚天殿所得古宝，开天辟地之力，斩裂虚空。",mpCost:50,skill:"虚天斩"},
  
  // 防具
  "cloth_robe":{name:"粗布道袍",type:"armor",grade:1,def:3,desc:"七玄门弟子的粗布道袍，聊胜于无。"},
  "blue_robe":{name:"青纹法袍",type:"armor",grade:2,def:10,desc:"绣有灵纹的法袍，能抵挡普通法术攻击。"},
  "purple_armor":{name:"紫云甲",type:"armor",grade:3,def:30,desc:"以紫云晶炼制，筑基期防御法器。",mpCost:5},
  "dragon_scale_armor":{name:"蛟鳞甲",type:"armor",grade:4,def:100,desc:"千年蛟龙鳞片所制，刀枪不入，结丹期宝甲。",mpCost:10},
  "nine_heaven_robe":{name:"九天玄女衣",type:"armor",grade:5,def:400,desc:"九天玄女所传，万法不侵。元婴期极品防御。",mpCost:25},

  // 饰品
  "spirit_gather_ring":{name:"聚灵环",type:"accessory",grade:2,def:2,maxMp:30,desc:"聚集天地灵气的玉环，佩戴可增长灵力上限。"},
  "wind_chase_boots":{name:"追风靴",type:"accessory",grade:3,spd:20,def:5,desc:"以追风兽皮制成，行走如风。"},
  "five_element_ring":{name:"五行环",type:"accessory",grade:4,def:20,maxMp:100,desc:"五行之力凝聚的灵环，可提升灵力与防御。"},
  "space_ring":{name:"乾坤戒",type:"accessory",grade:5,def:50,maxMp:500,desc:"可储物的空间戒指，内含乾坤，珍稀无比。"},

  // 法宝
  "green_bottle":{name:"小绿瓶",type:"artifact",grade:5,desc:"来历神秘的绿色小瓶，能催熟灵草。此物关乎你一生的命运……",special:"bottle"},
  "heaven_void_cauldron":{name:"虚天鼎",type:"artifact",grade:5,atk:200,def:200,desc:"虚天殿至宝，天地初开时诞生的先天灵宝，镇压一方天地。",mpCost:20},
  "thunder_seal":{name:"雷神印",type:"artifact",grade:4,atk:80,def:40,desc:"蕴含雷神之力的古印，祭出时雷霆万钧。",mpCost:15,skill:"雷神怒"},
  "giant_silk":{name:"巨丝网",type:"artifact",grade:3,atk:30,def:20,desc:"以万年巨蚕丝编织的大网，可困敌可防御。",mpCost:8},

  // 消耗品
  "qi_pill":{name:"补气丹",type:"consumable",desc:"恢复50点灵力。",effect:{mp:50}},
  "healing_pill":{name:"疗伤丹",type:"consumable",desc:"恢复100点气血。",effect:{hp:100}},
  "foundation_pill":{name:"筑基丹",type:"consumable",desc:"筑基期突破必备丹药，增加突破成功率30%。",effect:{breakthroughChance:0.3}},
  "core_formation_pill":{name:"结丹丹",type:"consumable",desc:"结丹期突破必备丹药，增加突破成功率20%。",effect:{breakthroughChance:0.2}},
  "infant_formation_pill":{name:"凝婴丹",type:"consumable",desc:"元婴期突破必备丹药，增加突破成功率15%。",effect:{breakthroughChance:0.15}},
  "spirit_stone":{name:"灵石",type:"material",desc:"修仙界的通用货币和修炼资源。"},
  
  // 材料
  "spirit_grass":{name:"灵草",type:"material",desc:"低级灵草，炼丹基础材料。"},
  "thousand_year_ginseng":{name:"千年人参",type:"material",desc:"千年灵药，珍贵炼丹材料。"},
  "dragon_blood":{name:"蛟龙血",type:"material",desc:"蛟龙之血，炼器宝物。"},
  "star_sand":{name:"星辰砂",type:"material",desc:"乱星海特产，炼器稀有材料。"},
};

// ===== 仙蛊系统 =====
const GU_WORMS = {
  "iron_skin_gu":{name:"铁皮蛊",desc:"寄宿于皮肤之下，大幅增强肉身防御。",defBonus:10,grade:1},
  "flame_gu":{name:"赤焰蛊",desc:"吞吐赤色火焰，攻击附带火属性伤害。",atkBonus:15,grade:1},
  "spirit_gu":{name:"聚灵蛊",desc:"自动聚集天地灵气，修炼速度提升。",expBonus:0.2,grade:2},
  "poison_gu":{name:"万毒蛊",desc:"蕴含万种毒素，攻击有概率使敌人中毒。",atkBonus:20,skill:"万毒蚀",grade:2},
  "wind_gu":{name:"追风蛊",desc:"融入经脉之中，身法速度大增。",spdBonus:30,grade:2},
  "iron_will_gu":{name:"铁心蛊",desc:"坚定道心，抵抗幻术与心魔入侵。",defBonus:15,grade:2},
  "blood_spirit_gu":{name:"血灵蛊",desc:"吸收敌人血液化为灵力，战斗中持续恢复。",hpRegen:5,grade:3},
  "star_gu":{name:"星辰蛊",desc:"乱星海深处的星力蛊虫，威力惊人。",atkBonus:50,defBonus:30,grade:3},
  "void_gu":{name:"虚空蛊",desc:"吞噬空间的禁忌蛊虫，能撕裂虚空。",atkBonus:100,skill:"虚空裂",grade:4},
  "heaven_gu":{name:"天命蛊",desc:"传说中天命所归之蛊，拥有改天换命之力。",allBonus:0.1,grade:5},
};

// ===== 空窍系统 =====
const APERTURES = {
  "baihui":{name:"百会窍",pos:"头顶",desc:"百会穴开窍，灵力流转全身，灵力上限+10%。",reqStage:0,effect:{maxMpMult:0.1}},
  "tanzhong":{name:"膻中窍",pos:"胸口",desc:"膻中穴开窍，气血充盈，气血上限+10%。",reqStage:0,effect:{maxHpMult:0.1}},
  "guanyuan":{name:"关元窍",pos:"小腹",desc:"关元穴开窍，丹田根基稳固，修为增长+15%。",reqStage:0,effect:{expMult:0.15}},
  "mingmen":{name:"命门窍",pos:"后腰",desc:"命门穴开窍，阳火旺盛，攻击+10%。",reqStage:1,effect:{atkMult:0.1}},
  "yongquan":{name:"涌泉窍",pos:"足底",desc:"涌泉穴开窍，接地之力，速度+20%。",reqStage:1,effect:{spdMult:0.2}},
  "shenting":{name:"神庭窍",pos:"眉心",desc:"神庭穴开窍，神识大增，悟性+5。",reqStage:1,effect:{compBonus:5}},
  "taiyang":{name:"太阳窍",pos:"太阳穴",desc:"太阳穴开窍，机缘提升。",reqStage:2,effect:{luckBonus:5}},
  "yuji":{name:"玉枕窍",pos:"后脑",desc:"玉枕穴开窍，防御+15%。",reqStage:2,effect:{defMult:0.15}},
  "qihai":{name:"气海窍",pos:"丹田",desc:"气海穴开窍，灵力如海，灵力上限+30%。",reqStage:3,effect:{maxMpMult:0.3}},
  "xuanguan":{name:"玄关窍",pos:"玄关",desc:"玄关一窍，通天彻地，全属性+10%。",reqStage:4,effect:{allMult:0.1}},
  "niwan":{name:"泥丸窍",pos:"脑中",desc:"上丹田泥丸宫开窍，元神凝练，全属性+20%。",reqStage:5,effect:{allMult:0.2}},
  "zijin":{name:"紫金窍",pos:"紫府",desc:"紫府开窍，仙人根基，全属性+30%。",reqStage:6,effect:{allMult:0.3}},
};

// ===== 仙道杀招系统 =====
const TECHNIQUES = {
  // 功法
  "changchun_gong":{name:"长春功",type:"cultivation",desc:"七玄门入门功法，温和中正，适合初学者。",reqStage:0,atkBonus:5,expBonus:0.1},
  "blazing_sun":{name:"烈阳真诀",type:"cultivation",desc:"刚猛霸道的功法，攻击力强但修炼困难。",reqStage:1,atkBonus:20,expBonus:0.05},
  "blue_sea":{name:"碧海潮生诀",type:"cultivation",desc:"乱星海传下的功法，灵力绵绵不绝。",reqStage:1,maxMpBonus:200,expBonus:0.15},
  "heaven_demon":{name:"天魔功",type:"cultivation",desc:"魔道功法，威力惊人但有走火入魔之险。",reqStage:2,atkBonus:50,defBonus:30,expBonus:0.1},
  "void_heaven":{name:"虚天诀",type:"cultivation",desc:"虚天殿残卷所载功法，直指大道本源。",reqStage:3,atkBonus:100,defBonus:100,maxMpBonus:500,expBonus:0.2},
  "great_purity":{name:"太清仙诀",type:"cultivation",desc:"太上仙界至高功法，天人合一。",reqStage:5,allBonus:0.3,expBonus:0.3},
  
  // 杀招
  "sword_qi":{name:"剑气术",type:"attack",desc:"将灵力化为剑气，远程攻击敌人。",reqStage:0,damage:30,mpCost:10},
  "flame_burst":{name:"烈焰爆",type:"attack",desc:"引爆灵力，造成范围火焰伤害。",reqStage:0,damage:50,mpCost:20},
  "thunder_strike":{name:"雷霆万钧",type:"attack",desc:"召唤雷霆之力，造成雷属性伤害。",reqStage:1,damage:100,mpCost:30},
  "wind_blade":{name:"风刃术",type:"attack",desc:"操控风元素形成锋利风刃。",reqStage:1,damage:80,mpCost:20},
  "ice_seal":{name:"冰封万里",type:"attack",desc:"极寒之力冰封一切，有概率冻结敌人。",reqStage:2,damage:150,mpCost:40,effect:"freeze"},
  "sword_rain":{name:"万剑归宗",type:"attack",desc:"操控万柄飞剑，如雨般降下。",reqStage:2,damage:250,mpCost:60},
  "demon_seal":{name:"封魔印",type:"attack",desc:"以正道之力封印妖魔。",reqStage:3,damage:400,mpCost:80},
  "void_slash":{name:"虚空斩",type:"attack",desc:"撕裂虚空，无视防御的终极一击。",reqStage:3,damage:800,mpCost:150,ignoreDef:true},
  "heaven_tribulation":{name:"天劫之引",type:"attack",desc:"引动天劫之力，毁灭性打击。",reqStage:4,damage:2000,mpCost:300},
  "immortal_strike":{name:"仙道天击",type:"attack",desc:"仙人级别的终极杀招，开天辟地。",reqStage:6,damage:50000,mpCost:1000},
  
  // 防御/辅助
  "golden_bell":{name:"金钟罩",type:"defense",desc:"金色钟罩护体，抵挡伤害。",reqStage:0,defBonus:30,mpCost:15,duration:3},
  "spirit_shield":{name:"灵力护盾",type:"defense",desc:"灵力化为护盾，吸收伤害。",reqStage:1,shield:200,mpCost:30},
  "heaven_escape":{name:"天遁术",type:"utility",desc:"瞬间移动，可逃离战斗。",reqStage:1,mpCost:50,effect:"escape"},
  "nine_transformation":{name:"九转玄功",type:"utility",desc:"炼体奇术，大幅增强肉身。",reqStage:2,hpBonus:500,atkBonus:30,defBonus:30},
  
  // 特殊
  "big_day":{name:"大衍决",type:"special",desc:"推演天机之术，提升悟性与机缘。",reqStage:1,compBonus:3,luckBonus:3},
  "sword_intent":{name:"剑道真意",type:"special",desc:"领悟剑道真意，所有剑类武器伤害+50%。",reqStage:2,swordMult:0.5},
  "immortal_gu_refine":{name:"炼蛊术",type:"special",desc:"掌握了炼制仙蛊的方法，可自行炼蛊。",reqStage:1},
};

// ===== 道侣系统 =====
const COMPANIONS = {
  "yan_ying":{name:"晏婴",desc:"天南修仙世家之女，冰肌玉骨，天赋异禀。擅长冰系法术。",atkBonus:30,defBonus:20,reqStage:0,location:"天南",affinity:0,maxAffinity:100,skills:["冰封万里"],special:"冰系伤害加成"},
  "xiao_wu":{name:"萧舞",desc:"乱星海修炼的女子，性格洒脱不羁，擅长水系法术。",atkBonus:50,defBonus:15,reqStage:1,location:"乱星海",affinity:0,maxAffinity:100,skills:["碧海潮生诀"],special:"水系伤害加成"},
  "mu_qing":{name:"慕青",desc:"慕兰草原的神秘女子，精通草木之术，善于炼丹。",atkBonus:20,defBonus:50,reqStage:1,location:"慕兰草原",affinity:0,maxAffinity:100,skills:["万木逢春"],special:"丹药效果加成"},
  "li_ying":{name:"李莹",desc:"坠魔谷中遇到的修士，身世成谜，擅长暗影之术。",atkBonus:80,defBonus:30,reqStage:2,location:"坠魔谷",affinity:0,maxAffinity:100,skills:["暗影刺"],special:"暴击率加成"},
  "zi_yan":{name:"紫烟",desc:"虚天殿中的神秘少女，似乎与虚天鼎有某种联系。",atkBonus:100,defBonus:60,reqStage:3,location:"虚天殿",affinity:0,maxAffinity:100,skills:["虚空斩"],special:"全属性加成"},
  "fairy_qing":{name:"青仙子",desc:"灵界飞升的仙子，境界高深，传说中的人物。",atkBonus:500,defBonus:300,reqStage:5,location:"灵界",affinity:0,maxAffinity:100,skills:["仙道天击"],special:"仙力加成"},
};

// ===== 成就系统 =====
const ACHIEVEMENTS = {
  "first_step":{name:"初入仙途",desc:"开始你的修仙之路。",icon:"🌟"},
  "seven_profound":{name:"七玄门人",desc:"正式加入七玄门。",icon:"🏯"},
  "foundation":{name:"筑基成功",desc:"突破至筑基期。",icon:"⛰️"},
  "core_formation":{name:"结丹成功",desc:"突破至结丹期。",icon:"💎"},
  "infant":{name:"元婴出窍",desc:"突破至元婴期。",icon:"👶"},
  "spirit_transformation":{name:"化神通天",desc:"突破至化神期。",icon:"🔮"},
  "body_merge":{name:"合体归一",desc:"突破至合体期。",icon:"☯️"},
  "great_vehicle":{name:"大乘圆满",desc:"突破至大乘期。",icon:"🌙"},
  "tribulation":{name:"渡劫成仙",desc:"突破至渡劫期。",icon:"⚡"},
  "ascension":{name:"飞升仙界",desc:"成功飞升仙界。",icon:"👑"},
  "bottle_owner":{name:"神秘瓶主",desc:"获得小绿瓶。",icon:"🫙"},
  "first_kill":{name:"初试锋芒",desc:"赢得第一场战斗。",icon:"⚔️"},
  "gu_master":{name:"蛊道入门",desc:"获得第一只仙蛊。",icon:"🐛"},
  "aperture_open":{name:"初开窍穴",desc:"成功开辟第一个空窍。",icon:"✨"},
  "first_companion":{name:"红颜知己",desc:"获得第一位道侣。",icon:"💕"},
  "tiannan_hero":{name:"天南扬名",desc:"完成天南副本。",icon:"🗺️"},
  "sea_conqueror":{name:"星海霸主",desc:"完成乱星海副本。",icon:"🌊"},
  "void_temple":{name:"虚天殿主",desc:"完成虚天殿副本。",icon:"🏛️"},
  "mulan_warrior":{name:"慕兰战神",desc:"完成慕兰大战副本。",icon:"⚔️"},
  "demon_valley":{name:"坠魔谷主",desc:"完成坠魔谷副本。",icon:"🌋"},
  "spirit_world":{name:"灵界飞升",desc:"完成灵界副本。",icon:"🌟"},
  "all_techniques":{name:"万法归宗",desc:"学习所有可获得的功法杀招。",icon:"📖"},
  "gu_collector":{name:"蛊道宗师",desc:"收集所有仙蛊。",icon:"🦋"},
  "all_apertures":{name:"窍穴圆满",desc:"开辟所有空窍。",icon:"🔱"},
  "rich":{name:"富可敌国",desc:"拥有10000灵石。",icon:"💰"},
  "no_mercy":{name:"杀伐果断",desc:"在关键选择中选择冷酷路线。",icon:"💀"},
  "merciful":{name:"慈悲为怀",desc:"在关键选择中选择仁慈路线。",icon:"🕊️"},
  "hidden_truth":{name:"拨云见日",desc:"发现隐藏的真相。",icon:"🔍"},
  "lonely_path":{name:"独行仙路",desc:"以无道侣的方式完成修炼。",icon:"🚶"},
  "all_companions":{name:"佳丽三千",desc:"获得所有道侣。",icon:"❤️"},
};

// ===== 敌人数据 =====
const ENEMIES = {
  "wild_boar":{name:"野猪妖",hp:80,atk:8,def:3,exp:20,stone:5,drop:"spirit_grass",dropRate:0.2},
  "bandit":{name:"山贼",hp:120,atk:12,def:5,exp:30,stone:10,drop:"healing_pill",dropRate:0.3},
  "wolf_demon":{name:"狼妖",hp:200,atk:20,def:8,exp:50,stone:15,drop:"spirit_grass",dropRate:0.3},
  "iron_bone":{name:"铁骨尸",hp:300,atk:30,def:20,exp:80,stone:25,drop:"qi_pill",dropRate:0.2},
  "flame_rat":{name:"火鼠妖",hp:400,atk:40,def:15,exp:100,stone:30,drop:"flame_gu",dropRate:0.05},
  "sea_beast":{name:"深海兽",hp:800,atk:60,def:30,exp:200,stone:50,drop:"star_sand",dropRate:0.3},
  "star_palace_guard":{name:"星宫守卫",hp:1200,atk:80,def:50,exp:300,stone:80,drop:"blue_silk_sword",dropRate:0.05},
  "void_beast":{name:"虚空兽",hp:2000,atk:150,def:80,exp:500,stone:150,drop:"void_gu",dropRate:0.05},
  "mulan_shaman":{name:"慕兰萨满",hp:3000,atk:200,def:120,exp:800,stone:300,drop:"dragon_blood",dropRate:0.2},
  "demon_lord":{name:"坠魔谷魔主",hp:5000,atk:300,def:150,exp:1500,stone:500,drop:"heaven_demon",dropRate:0.1},
  "tribulation_lightning":{name:"天劫雷",hp:99999,atk:500,def:200,exp:3000,stone:0,drop:null,dropRate:0},
  "immortal_tribulation":{name:"仙劫",hp:999999,atk:5000,def:500,exp:50000,stone:0,drop:null,dropRate:0},
};

// ===== 副本/地点数据 =====
const LOCATIONS = {
  "七玄门集镇":{desc:"七玄门山脚下的集镇，你修仙之路的起点。",reqStage:0},
  "天南坊市城":{desc:"天南最大的修仙城市，商贾云集。",reqStage:0},
  "长安城":{desc:"中原腹地的修仙大城，历史悠久。",reqStage:0},
  "太南谷":{desc:"天南东部的幽静谷地城镇。",reqStage:0},
  "黄枫谷":{desc:"天南七派之一，以灵木之术闻名。",reqStage:0},
  "乱星海":{desc:"无边海域，盛产星辰砂和海中灵兽。",reqStage:1},
  "星宫":{desc:"乱星海最大的势力，掌控星海秩序。",reqStage:1},
  "虚天殿":{desc:"上古遗迹，藏有无数宝物和凶险。",reqStage:2},
  "慕兰草原":{desc:"天南与中原的交界，战火纷飞之地。",reqStage:2},
  "坠魔谷":{desc:"古时大能陨落之地，魔气冲天。",reqStage:3},
  "福地·青云山":{desc:"一处灵气充沛的福地，适合修炼。",reqStage:1},
  "福地·万蛇窟":{desc:"毒蛇遍地，却盛产灵药的险地。",reqStage:2},
  "福地·天星洞":{desc:"乱星海深处的洞天福地。",reqStage:2},
  "灵界":{desc:"高于人间的修仙界，飞升之人的归宿。",reqStage:4},
  "仙界":{desc:"传说中的至高界面。",reqStage:8},
};

// ===== 福地产出 =====
const BLESSED_LANDS = {
  "qingyun":{name:"福地·青云山",expGain:200,stoneGain:50,itemDrop:"spirit_grass",desc:"灵气充沛，修炼事半功倍。",reqStage:1},
  "wanshe":{name:"福地·万蛇窟",expGain:500,stoneGain:100,itemDrop:"thousand_year_ginseng",desc:"毒蛇遍地，却盛产灵药。",reqStage:2},
  "tianxing":{name:"福地·天星洞",expGain:1000,stoneGain:200,itemDrop:"star_sand",desc:"乱星海深处的洞天福地。",reqStage:2},
  "void_realm":{name:"福地·虚天境",expGain:5000,stoneGain:500,itemDrop:"dragon_blood",desc:"虚天殿中隐藏的修炼圣地。",reqStage:3},
};

// ===== 结局 =====
const ENDINGS = {
  "ascension_true":{title:"真仙飞升",icon:"👑",text:"历经万劫，你终于渡过天劫，飞升仙界。你站在仙界之上，俯瞰众生，大道已成。你的名字将永远铭刻在修仙界的历史之中。万年后，仍有人传颂你的传奇。",color:"gold"},
  "ascension_demon":{title:"魔道飞升",icon:"😈",text:"你以魔道之身渡过天劫，飞升灵界。虽非正途，却也是一条成仙之路。灵界众生对你又敬又畏，你以魔证道，终成一代魔尊。",color:"crimson"},
  "ascension_battle":{title:"武道飞升",icon:"⚔️",text:"你以武入道，肉身成圣，渡过天劫飞升灵界。你的肉身之力足以撼动天地，灵界中无人敢轻视你这位武道至尊。",color:"jade"},
  "mortal_end":{title:"凡人一生",icon:"🍂",text:"修仙之路太过艰险，你最终选择回归凡人生活。虽然未能长生，但你的一生充实而圆满，儿孙满堂，安享天年。或许，凡人也有凡人的幸福。",color:"dim"},
  "demon_corruption":{title:"走火入魔",icon:"💀",text:"修炼途中，你未能抵御心魔入侵，最终走火入魔，沦为魔物。曾经的天才修士就此陨落，成为修仙界的又一段警示传说。",color:"crimson-dark"},
  "death_in_battle":{title:"战死沙场",icon:"☠️",text:"在一场惨烈的战斗中，你力竭而亡。你的道侣抱着你的遗体痛哭，你的仇敌踏着你的尸体扬长而去。修仙之路，本就九死一生。",color:"crimson-dark"},
  "betrayal_end":{title:"众叛亲离",icon:"💔",text:"你的冷酷手段最终让你失去了所有同伴。当你站在权力的顶峰时，身边空无一人。你拥有了一切，却又仿佛一无所有。高处不胜寒，这就是你选择的路。",color:"purple"},
  "retreat_end":{title:"隐世修行",icon:"🏔️",text:"看透了修仙界的尔虞我诈，你选择隐退山林，与道侣相伴，潜心修炼。虽然没有飞升，但你们拥有了旁人难以理解的宁静与幸福。",color:"jade"},
  "sacrifice_end":{title:"以身殉道",icon:"🌅",text:"为了保护修仙界和你的道侣，你选择燃烧全部修为，与强敌同归于尽。你的牺牲换来了太平，你的道侣将永远铭记你。你的名字被刻在了修仙界的丰碑上。",color:"gold"},
  "true_immortal":{title:"超脱真仙",icon:"✨",text:"你不仅飞升仙界，更是在仙界之上开辟了自己的道。你超脱了天道的束缚，成为了真正的主宰。从此，你不再受任何规则限制，逍遥天地间。这是修仙者的终极梦想，而你，做到了。",color:"rainbow"},
};

// ===== 新增敌人（高难度） =====
const ENEMIES_EXTRA = {
  // 七玄门野外
  "iron_ape":{name:"铁臂猿",hp:150,atk:15,def:10,exp:35,stone:8,drop:"spirit_grass",dropRate:0.3},
  "poison_snake":{name:"毒牙蛇",hp:120,atk:18,def:6,exp:30,stone:6,drop:"healing_pill",dropRate:0.2},
  "stone_golem":{name:"石巨人",hp:500,atk:25,def:30,exp:100,stone:30,drop:"iron_sword",dropRate:0.1},
  // 天南野外
  "blood_wolf":{name:"血目狼妖",hp:400,atk:35,def:15,exp:120,stone:40,drop:"spirit_grass",dropRate:0.4},
  "evil_cultivator":{name:"邪修",hp:350,atk:40,def:20,exp:150,stone:60,drop:"healing_pill",dropRate:0.3},
  "thousand_year_bat":{name:"千年蝠王",hp:800,atk:60,def:30,exp:300,stone:100,drop:"blue_robe",dropRate:0.1},
  // 乱星海野外
  "deep_sea_kraken":{name:"深海章鱼怪",hp:1500,atk:90,def:50,exp:400,stone:120,drop:"star_sand",dropRate:0.4},
  "storm_bird":{name:"风暴雷鸟",hp:1000,atk:120,def:40,exp:350,stone:100,drop:"thunder_seal",dropRate:0.05},
  "sea_dragon":{name:"蛟龙",hp:3000,atk:180,def:100,exp:1000,stone:300,drop:"dragon_blood",dropRate:0.3},
  // 虚天殿新增
  "void_puppet":{name:"虚天傀儡",hp:2500,atk:160,def:120,exp:600,stone:200,drop:"purple_armor",dropRate:0.1},
  "ancient_guardian":{name:"上古守护者",hp:5000,atk:250,def:150,exp:1500,stone:500,drop:"void_heaven_blade",dropRate:0.05},
  // 慕兰草原
  "mulan_beast_rider":{name:"慕兰兽骑兵",hp:2500,atk:200,def:100,exp:600,stone:200,drop:"healing_pill",dropRate:0.3},
  "mulan_war_chief":{name:"慕兰大战将",hp:5000,atk:280,def:150,exp:1200,stone:400,drop:"dragon_pattern_blade",dropRate:0.05},
  // 坠魔谷新增
  "demon_general":{name:"魔将",hp:8000,atk:400,def:200,exp:2500,stone:800,drop:"heaven_demon",dropRate:0.15},
  "demon_bat_swarm":{name:"魔蝠群",hp:3000,atk:200,def:50,exp:800,stone:200,drop:"qi_pill",dropRate:0.5},
  "ancient_demon corpse":{name:"古魔残尸",hp:10000,atk:500,def:300,exp:3000,stone:1000,drop:"void_gu",dropRate:0.05},
  // 灵界新增
  "spirit_beast":{name:"灵界灵兽",hp:50000,atk:2000,def:1000,exp:20000,stone:5000,drop:"great_purity",dropRate:0.1},
  "spirit_realm_bandit":{name:"灵界散修",hp:80000,atk:3000,def:1500,exp:30000,stone:8000,drop:"space_ring",dropRate:0.1},
  "spirit_realm_guardian":{name:"灵界守护者",hp:200000,atk:5000,def:3000,exp:80000,stone:20000,drop:"immortal_strike",dropRate:0.05},
  "celestial_beast":{name:"天界仙兽",hp:500000,atk:10000,def:5000,exp:200000,stone:50000,drop:"heaven_gu",dropRate:0.05},
  "celestial_guardian":{name:"天界守卫",hp:1000000,atk:20000,def:10000,exp:500000,stone:100000,drop:"great_purity",dropRate:0.1},
  "void_ancient_demon":{name:"虚空古魔",hp:2000000,atk:50000,def:20000,exp:1000000,stone:200000,drop:"void_gu",dropRate:0.2},
  // 随机遇敌 - 按修为等级
  "wild_beast_lq":{name:"野兽",hp:100,atk:10,def:5,exp:15,stone:3,drop:"spirit_grass",dropRate:0.2},
  "bandit_lq":{name:"劫修",hp:200,atk:20,def:10,exp:40,stone:20,drop:"healing_pill",dropRate:0.2},
  "demon_cultivator_zj":{name:"魔修",hp:1500,atk:100,def:60,exp:400,stone:100,drop:"qi_pill",dropRate:0.3},
  "rogue_cultivator_yy":{name:"散修",hp:15000,atk:1000,def:500,exp:5000,stone:1000,drop:"healing_pill",dropRate:0.3},
  "spirit_demon_hh":{name:"灵魔",hp:200000,atk:8000,def:4000,exp:50000,stone:10000,drop:"great_purity",dropRate:0.05},
};
// 合并到ENEMIES
Object.assign(ENEMIES, ENEMIES_EXTRA);

// ===== 灵田种子系统 =====
const SEEDS = {
  "spirit_grass_seed":{name:"灵草种子",cost:10,growTime:3,harvest:{item:"spirit_grass",count:3},exp:20,desc:"最基础的灵草种子，3天成熟。"},
  "ginseng_seed":{name:"人参种子",cost:50,growTime:7,harvest:{item:"thousand_year_ginseng",count:1},exp:100,desc:"珍贵人参种子，7天成熟。"},
  "flame_grass_seed":{name:"赤焰草种子",cost:100,growTime:5,harvest:{item:"flame_grass",count:2},exp:150,desc:"蕴含火灵力的灵草，可炼制火系丹药。"},
  "spirit_rice_seed":{name:"灵米种子",cost:20,growTime:4,harvest:{item:"spirit_rice",count:5},exp:50,desc:"修仙者的主食灵米，4天成熟。"},
  "golden_lotus_seed":{name:"金莲种子",cost:500,growTime:10,harvest:{item:"golden_lotus",count:1},exp:500,desc:"传说中金莲的种子，10天成熟，炼丹极品材料。"},
  "immortal_herb_seed":{name:"仙草种子",cost:2000,growTime:15,harvest:{item:"immortal_herb",count:1},exp:2000,desc:"仙界灵草种子，15天成熟，价值连城。"},
};

// ===== 新增炼丹材料/丹药 =====
const ITEMS_EXTRA = {
  "flame_grass":{name:"赤焰草",type:"material",desc:"蕴含火灵力的灵草，炼丹材料。"},
  "spirit_rice":{name:"灵米",type:"consumable",desc:"恢复20气血和10灵力。",effect:{hp:20,mp:10}},
  "golden_lotus":{name:"金莲",type:"material",desc:"炼丹极品材料，价值极高。"},
  "immortal_herb":{name:"仙草",type:"material",desc:"仙界灵草，可炼制仙丹。"},
  "foundation_pill_supreme":{name:"极品筑基丹",type:"consumable",desc:"增加突破成功率50%。",effect:{breakthroughChance:0.5}},
  "core_pill_supreme":{name:"极品结丹丹",type:"consumable",desc:"增加突破成功率40%。",effect:{breakthroughChance:0.4}},
  "infant_pill_supreme":{name:"极品凝婴丹",type:"consumable",desc:"增加突破成功率35%。",effect:{breakthroughChance:0.35}},
  "breakthrough_pill":{name:"破境丹",type:"consumable",desc:"直接获得大量经验，加速修为提升。",effect:{exp:5000}},
  "power_pill":{name:"力王丹",type:"consumable",desc:"战斗中使用，临时提升攻击力100%。",effect:{tempAtk:1}},
  "immortal_pill":{name:"仙丹",type:"consumable",desc:"恢复全部气血和灵力。",effect:{hp:99999,mp:99999}},
  // 新装备
  "immortal_sword":{name:"仙剑·天罡",type:"weapon",grade:5,atk:2000,desc:"仙界锻造的至高仙剑，一剑可斩星辰。",mpCost:100,skill:"天罡剑诀"},
  "celestial_armor":{name:"天衣",type:"armor",grade:5,def:1000,desc:"天界仙人所穿，万法不侵。",mpCost:50},
  "destiny_ring":{name:"命运之环",type:"accessory",grade:5,def:100,maxMp:2000,desc:"掌控命运之力的神环。"},
  "creation_cauldron":{name:"造化鼎",type:"artifact",grade:5,atk:500,def:500,desc:"开天辟地时的造化之鼎，可炼万物。",mpCost:100,skill:"造化吞天"},
};
Object.assign(ITEMS, ITEMS_EXTRA);

// ===== 婴儿玩具 =====
const ITEMS_TOYS = {
  "wooden_sword":{name:"木剑",type:"toy",cost:50,desc:"木制小剑，培养武道兴趣。"},
  "spirit_rattle":{name:"灵摇铃",type:"toy",cost:80,desc:"蕴含微弱灵气的摇铃，适合婴幼儿。"},
  "jade_pendant_toy":{name:"玉佩挂件",type:"toy",cost:120,desc:"温润玉石磨制，安神定气。"},
  "story_book":{name:"修行故事书",type:"toy",cost:200,desc:"讲述修士冒险故事，激发修炼兴趣。"},
  "puzzle_cube":{name:"灵阵魔方",type:"toy",cost:300,desc:"训练灵识的小法阵，适合幼童。"},
  "spirit_kite":{name:"灵鸢风筝",type:"toy",cost:150,desc:"御风飞行的风筝，深受孩子喜爱。"},
};
Object.assign(ITEMS, ITEMS_TOYS);

// ===== 道侣养成数据 =====
const COMPANION_LEVEL_DATA = {
  maxLevel: 10,
  expPerLevel: [100,300,800,2000,5000,12000,30000,80000,200000,500000],
  // 每级提升的属性倍率
  atkGrowth: 0.15, // 每级+15%攻击加成
  defGrowth: 0.12,
  // 亲密度等级
  affinityLevels: [
    {name:"初识",threshold:0,bonus:0},
    {name:"相识",threshold:20,bonus:0.05},
    {name:"熟悉",threshold:40,bonus:0.1},
    {name:"亲密",threshold:60,bonus:0.2},
    {name:"知己",threshold:80,bonus:0.3},
    {name:"心意相通",threshold:100,bonus:0.5},
  ],
  // 互动方式
  interactions: [
    {id:"talk",name:"闲谈",affinityGain:3,desc:"与道侣闲聊，增进感情。"},
    {id:"gift",name:"赠送礼物",affinityGain:8,cost:100,desc:"赠送灵石礼物，大幅提升亲密度。"},
    {id:"practice",name:"双修",affinityGain:5,expGain:200,desc:"与道侣双修，提升修为和亲密度。"},
    {id:"spar",name:"切磋",affinityGain:4,expGain:100,desc:"与道侣切磋武艺。"},
  ],
};

// ===== 仙蛊养成数据 =====
const GU_LEVEL_DATA = {
  maxLevel: 10,
  expPerLevel: [50,200,500,1500,5000,15000,50000,150000,500000,1500000],
  growthPerLevel: 0.2, // 每级属性+20%
  // 融合配方
  fusionRecipes: [
    {input:["iron_skin_gu","flame_gu"],result:"iron_flame_gu",name:"铁焰蛊"},
    {input:["spirit_gu","poison_gu"],result:"spirit_poison_gu",name:"灵毒蛊"},
    {input:["wind_gu","blood_spirit_gu"],result:"wind_blood_gu",name:"风血蛊"},
    {input:["star_gu","void_gu"],result:"star_void_gu",name:"星虚蛊"},
  ],
};
// 融合蛊
const GU_FUSION = {
  "iron_flame_gu":{name:"铁焰蛊",desc:"铁皮与赤焰的融合，攻防兼备。",atkBonus:20,defBonus:15,grade:3},
  "spirit_poison_gu":{name:"灵毒蛊",desc:"聚灵与万毒融合，修炼加速且攻击带毒。",expBonus:0.3,atkBonus:25,skill:"万毒蚀",grade:3},
  "wind_blood_gu":{name:"风血蛊",desc:"追风与血灵融合，高速回血。",spdBonus:40,hpRegen:15,grade:3},
  "star_void_gu":{name:"星虚蛊",desc:"星辰与虚空融合，恐怖的破坏力。",atkBonus:150,defBonus:80,skill:"星虚裂",grade:4},
};
Object.assign(GU_WORMS, GU_FUSION);

// ===== 野外区域 =====
const WILDERNESS = {
  "七玄门后山":{desc:"七玄门后山的密林，偶尔有妖兽出没。",reqStage:0,enemies:["wild_beast_lq","iron_ape","poison_snake","wolf_demon"],eventChance:0.3,expBonus:30,stoneBonus:10},
  "天南坊市城":{desc:"天南坊市城外荒野地带，危险与机遇并存。",reqStage:0,enemies:["blood_wolf","bandit","evil_cultivator","thousand_year_bat","wild_beast_lq"],eventChance:0.35,expBonus:50,stoneBonus:20},
  "长安城":{desc:"长安城外郊野，古墓与灵兽出没。",reqStage:0,enemies:["stone_golem","iron_ape","poison_snake","blood_wolf","bandit"],eventChance:0.33,expBonus:60,stoneBonus:25},
  "太南谷":{desc:"太南谷外幽谷地带，毒虫与灵兽横行。",reqStage:0,enemies:["poison_snake","wild_beast_lq","iron_ape","blood_wolf"],eventChance:0.33,expBonus:45,stoneBonus:15},
  "乱星海海域":{desc:"乱星海的广阔海域，海兽横行。",reqStage:1,enemies:["sea_beast","deep_sea_kraken","storm_bird","sea_dragon"],eventChance:0.4,expBonus:100,stoneBonus:50},
  "虚天殿外围":{desc:"虚天殿外围的虚空地带，上古遗存众多。",reqStage:2,enemies:["void_beast","void_puppet","ancient_guardian"],eventChance:0.45,expBonus:200,stoneBonus:100},
  "慕兰战场":{desc:"慕兰草原的战场，四处都是战火。",reqStage:2,enemies:["mulan_shaman","mulan_beast_rider","mulan_war_chief"],eventChance:0.4,expBonus:300,stoneBonus:150},
  "坠魔谷深处":{desc:"坠魔谷的深处，魔气弥漫。",reqStage:3,enemies:["demon_lord","demon_general","demon_bat_swarm","ancient_demon corpse"],eventChance:0.5,expBonus:500,stoneBonus:300},
  "灵界荒原":{desc:"灵界的荒原地带，灵兽横行。",reqStage:4,enemies:["spirit_beast","spirit_realm_bandit","spirit_realm_guardian"],eventChance:0.5,expBonus:2000,stoneBonus:2000},
  "天界仙野":{desc:"天界的旷野，仙气弥漫。",reqStage:8,enemies:["celestial_beast","celestial_guardian","void_ancient_demon"],eventChance:0.6,expBonus:10000,stoneBonus:10000},
};

// ===== 随机事件 =====
const RANDOM_EVENTS = [
  {id:"find_stone",name:"发现灵石",weight:30,effect:{stone:50},text:"你在野外发现了一处灵石矿脉，收获了不少灵石！"},
  {id:"find_item",name:"发现宝物",weight:15,effect:{item:"spirit_grass"},text:"你在一处隐蔽的角落发现了一株灵草！"},
  {id:"find_pill",name:"发现丹药",weight:10,effect:{item:"healing_pill"},text:"你发现了一个遗落的储物袋，里面有一颗疗伤丹！"},
  {id:"meditate_insight",name:"顿悟",weight:8,effect:{exp:500},text:"你在一处灵气汇聚之地打坐，突然有所感悟，修为大增！"},
  {id:"trap",name:"陷阱",weight:12,effect:{hp:-50},text:"你触发了一个隐藏的禁制，受到了一些伤害！"},
  {id:"meet_npc",name:"偶遇修士",weight:10,effect:{stone:100},text:"你遇到了一位友善的修士，对方赠予你一些灵石。"},
  {id:"find_gu",name:"发现仙蛊",weight:3,effect:{guWorm:"flame_gu"},text:"你在一处阴暗的角落发现了一只仙蛊！"},
  {id:"secret_realm",name:"秘境入口",weight:5,effect:{exp:2000,stone:500},text:"你发现了一处隐秘的洞府，里面有不少宝物！"},
  {id:"ancient_inheritance",name:"上古传承",weight:2,effect:{exp:5000,comp:1},text:"你意外触发了上古修士的传承，悟性大增！"},
  {id:"ambush",name:"被伏击",weight:8,effect:{combat:"wild_beast_lq"},text:"你被一只妖兽伏击了！"},
  {id:"merchant",name:"遇到行商",weight:7,effect:{stone:-30,item:"healing_pill"},text:"你遇到了一个行商，花费30灵石买了一颗疗伤丹。"},
  {id:"spirit_vein",name:"灵脉",weight:4,effect:{exp:1000},text:"你发现了一处隐藏的灵脉，修炼效果极佳！"},
];

// ===== 拍卖会物品池 =====
const AUCTION_ITEMS = [
  {item:"zisha_sword",basePrice:200,desc:"紫煞剑——煞气逼人的筑基法器"},
  {item:"blue_silk_sword",basePrice:800,desc:"青丝剑——万年青蚕丝炼制"},
  {item:"wind_lei_sword",basePrice:1200,desc:"风雷翅剑——蕴含风雷之力"},
  {item:"dragon_pattern_blade",basePrice:3000,desc:"龙纹刀——上古龙纹战刀"},
  {item:"void_heaven_blade",basePrice:8000,desc:"虚天刃——虚天殿古宝"},
  {item:"immortal_sword",basePrice:50000,desc:"仙剑·天罡——仙界至高仙剑"},
  {item:"purple_armor",basePrice:500,desc:"紫云甲——筑基防御法器"},
  {item:"dragon_scale_armor",basePrice:2000,desc:"蛟鳞甲——千年蛟龙鳞片"},
  {item:"nine_heaven_robe",basePrice:6000,desc:"九天玄女衣——万法不侵"},
  {item:"celestial_armor",basePrice:40000,desc:"天衣——仙人之衣"},
  {item:"wind_chase_boots",basePrice:400,desc:"追风靴——行走如风"},
  {item:"five_element_ring",basePrice:1500,desc:"五行环——五行之力"},
  {item:"space_ring",basePrice:5000,desc:"乾坤戒——储物空间"},
  {item:"destiny_ring",basePrice:30000,desc:"命运之环——掌控命运"},
  {item:"thunder_seal",basePrice:1000,desc:"雷神印——雷霆万钧"},
  {item:"creation_cauldron",basePrice:60000,desc:"造化鼎——开天辟地之鼎"},
  {item:"foundation_pill_supreme",basePrice:300,desc:"极品筑基丹"},
  {item:"core_pill_supreme",basePrice:1500,desc:"极品结丹丹"},
  {item:"infant_pill_supreme",basePrice:5000,desc:"极品凝婴丹"},
  {item:"breakthrough_pill",basePrice:2000,desc:"破境丹——加速修为"},
  {item:"immortal_pill",basePrice:20000,desc:"仙丹——全恢复"},
  {item:"thousand_year_ginseng",basePrice:200,desc:"千年人参"},
  {item:"dragon_blood",basePrice:1000,desc:"蛟龙血"},
  {item:"star_sand",basePrice:150,desc:"星辰砂"},
  {item:"golden_lotus",basePrice:3000,desc:"金莲"},
  {item:"immortal_herb",basePrice:10000,desc:"仙草"},
];

// ===== 新增成就 =====
const ACHIEVEMENTS_EXTRA = {
  "farmer":{name:"灵农",desc:"第一次种植灵草。",icon:"🌱"},
  "harvest_master":{name:"丰收大师",desc:"收获10次灵草。",icon:"🌾"},
  "gu_fusion":{name:"蛊道融合",desc:"成功融合仙蛊。",icon:"🔮"},
  "gu_max_level":{name:"蛊中之王",desc:"将仙蛊升到满级。",icon:"👑"},
  "companion_max":{name:"心心相印",desc:"道侣亲密度达到满级。",icon:"💖"},
  "auction_win":{name:"拍卖达人",desc:"在拍卖会中成功竞拍。",icon:"🔨"},
  "explorer":{name:"探索者",desc:"探索野外10次。",icon:"🧭"},
  "wilderness_master":{name:"荒野之王",desc:"在野外击败50个敌人。",icon:"🗺️"},
  "spirit_realm_hero":{name:"灵界英豪",desc:"在灵界完成所有挑战。",icon:"🌟"},
  "celestial_champion":{name:"天界至尊",desc:"击败天界守护者。",icon:"⚡"},
  "alchemist":{name:"炼丹初成",desc:"成功炼制一颗丹药。",icon:"⚗️"},
  "power_up":{name:"强力一击",desc:"单次攻击造成超过10000伤害。",icon:"💥"},
};
Object.assign(ACHIEVEMENTS, ACHIEVEMENTS_EXTRA);
