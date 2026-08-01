/* ====== 凡人修仙传MUD · 世界扩展2数据（社交/忠贞/称号/宗门/洞天） ====== */

// ===== 扩展武器 =====
Object.assign(ITEMS, {
  // 武器
  "frost_blade":{name:"寒霜刀",type:"weapon",grade:2,atk:20,desc:"寒铁所铸长刀，挥动间寒气逼人，筑基修士可用。",mpCost:5},
  "flame_whip":{name:"烈焰鞭",type:"weapon",grade:3,atk:50,desc:"以火灵兽筋编织，挥舞时烈焰飞舞。",mpCost:8,skill:"烈焰缚"},
  "thunder_spear":{name:"奔雷枪",type:"weapon",grade:3,atk:70,desc:"蕴含雷霆之力的长枪，一枪刺出，雷光乍现。",mpCost:10,skill:"雷枪刺"},
  "ice_soul_sword":{name:"冰魄剑",type:"weapon",grade:4,atk:130,desc:"万年玄冰所铸，出鞘时寒气凝霜，结丹期法器。",mpCost:12,skill:"冰魄斩"},
  "poison_fang_dagger":{name:"毒牙匕",type:"weapon",grade:3,atk:35,desc:"毒蛟之牙磨制，剧毒无比，暗器首选。",mpCost:3,skill:"毒噬"},
  "ghost_head_blade":{name:"鬼头刀",type:"weapon",grade:4,atk:100,desc:"鬼道修士所铸，刀身有鬼面纹路，煞气森森。",mpCost:10,skill:"鬼斩"},
  "star_moon_wheel":{name:"星月轮",type:"weapon",grade:4,atk:140,def:20,desc:"乱星海出产的飞轮法器，攻守兼备。",mpCost:12,skill:"星月斩"},
  "nine_dragon_whip":{name:"九龙鞭",type:"weapon",grade:5,atk:350,desc:"九条蛟龙筋所制，每挥一鞭，九龙齐啸。元婴期至宝。",mpCost:25,skill:"九龙击"},
  "heaven_seal_seal":{name:"天帝印",type:"weapon",grade:5,atk:600,def:200,desc:"天帝遗宝，印出则天地变色，万法臣服。",mpCost:40,skill:"天帝怒"},
  "chaos_bell":{name:"混沌钟",type:"weapon",grade:5,atk:500,def:300,desc:"先天至宝，钟声一响，混沌重现。",mpCost:35,skill:"混沌音"},
  "nether_flag":{name:"冥旗",type:"weapon",grade:4,atk:110,desc:"冥界之物，展开时阴风怒号，可召唤阴魂。",mpCost:15,skill:"招魂幡"},
  "golden_light_brick":{name:"金光砖",type:"weapon",grade:3,atk:45,def:15,desc:"金光闪闪的砖头，看似粗苯实则威力不凡。",mpCost:5,skill:"金光砸"},
  "spirit_devouring_bone":{name:"噬灵骨",type:"weapon",grade:5,atk:450,desc:"上古凶兽遗骨所制，可吞噬对方灵力。",mpCost:30,skill:"噬灵"},
  "blue_lotus_blade":{name:"碧莲刃",type:"weapon",grade:2,atk:25,desc:"碧莲宗特制法器，莲瓣形状的飞刃。",mpCost:5},

  // 防具
  "spirit_silk_robe":{name:"灵丝法袍",type:"armor",grade:2,def:18,desc:"以灵蚕丝织就，轻若无物却能挡普通法术。"},
  "black_iron_armor":{name:"玄铁甲",type:"armor",grade:3,def:50,desc:"玄铁所铸重甲，防御惊人但行动迟缓。",mpCost:5},
  "ghost_face_shield":{name:"鬼面盾",type:"armor",grade:3,def:40,desc:"鬼道法器，盾面刻有鬼面，可震慑心神。",mpCost:5},
  "phoenix_feather_cloak":{name:"凤羽披风",type:"armor",grade:4,def:120,spd:15,desc:"凤凰羽毛编织，火属性免疫，速度大增。",mpCost:10},
  "star_iron_armor":{name:"星辰铁甲",type:"armor",grade:4,def:150,desc:"星辰砂与玄铁合铸，坚不可摧。",mpCost:12},
  "nine_ghost_bone_armor":{name:"九幽骨甲",type:"armor",grade:5,def:500,desc:"九幽冥骨所制，免疫大部分物理攻击。",mpCost:25},
  "chaos_bell_armor":{name:"太乙云袍",type:"armor",grade:5,def:380,maxMp:200,desc:"太乙神丝织就，灵力流转不息。",mpCost:20},

  // 饰品
  "spirit_conceal_pendant":{name:"隐灵坠",type:"accessory",grade:3,def:8,desc:"可隐藏修为气息的玉坠，低调修士必备。"},
  "blood_jade_bracelet":{name:"血玉手镯",type:"accessory",grade:3,def:10,maxMp:50,desc:"血玉所制，佩戴后气血恢复加快。"},
  "star_pendant":{name:"星辰坠",type:"accessory",grade:4,def:25,maxMp:150,desc:"乱星海星力凝聚，佩戴后灵力大增。"},
  "dragon_soul_bead":{name:"龙魂珠",type:"accessory",grade:5,def:80,maxMp:500,atk:100,desc:"蛟龙之魂所化，攻防灵力全面提升。",mpCost:10},
  "void_ring":{name:"虚空戒",type:"accessory",grade:5,def:60,maxMp:300,desc:"可储物的空间戒指，内含独立空间。"},

  // 法宝
  "small_cauldron":{name:"小鼎",type:"artifact",grade:3,atk:35,def:25,desc:"不知名材质的小鼎，沉重异常，可砸可挡。",mpCost:8},
  "soul_flag":{name:"万魂幡",type:"artifact",grade:4,atk:100,desc:"鬼道至宝，内封万魂，展开时阴魂齐出。",mpCost:20,skill:"万魂噬"},
  "spirit_seal":{name:"封灵印",type:"artifact",grade:4,atk:90,def:40,desc:"封印灵力的法印，可压制对方修为。",mpCost:15,skill:"封灵"},
  "star_palace_mirror":{name:"星宫宝镜",type:"artifact",grade:5,atk:300,def:200,desc:"星宫至宝，镜光照处万物化为齑粉。",mpCost:30,skill:"星照"},
  "chaos_gourd":{name:"混沌葫芦",type:"artifact",grade:5,atk:250,def:250,desc:"先天灵根所结葫芦，内含混沌之力。",mpCost:25,skill:"混沌吞"},

  // 丹药扩展
  "qi_recovery_pill":{name:"回气丹",type:"consumable",desc:"恢复200点灵力。",effect:{mp:200}},
  "great_healing_pill":{name:"大疗伤丹",type:"consumable",desc:"恢复500点气血。",effect:{hp:500}},
  "spirit_wash_pill":{name:"洗髓丹",type:"consumable",desc:"洗髓伐骨，永久提升5点体质。",effect:{permHp:50}},
  "spirit_gathering_pill":{name:"聚灵丹",type:"consumable",desc:"服用后立即获得500修为经验。",effect:{exp:500}},
  "body_refining_pill":{name:"锻体丹",type:"consumable",desc:"永久提升3点攻击力。",effect:{permAtk:3}},
  "spirit_shield_pill":{name:"护体丹",type:"consumable",desc:"永久提升3点防御力。",effect:{permDef:3}},
  "fast_pill":{name:"神行丹",type:"consumable",desc:"永久提升5点速度。",effect:{permSpd:5}},
  "foundation_break_pill":{name:"破基丹",type:"consumable",desc:"战斗中使用，使敌人修为暂时降低一个境界。",effect:{debuffEnemy:true}},
  "spirit_restore_pill":{name:"大补丹",type:"consumable",desc:"恢复1000气血和500灵力。",effect:{hp:1000,mp:500}},
  "heart_demon_pill":{name:"破心丹",type:"consumable",desc:"降低1点心魔值。",effect:{heartDemon:-1}},
  "karma_pill":{name:"净业丹",type:"consumable",desc:"降低5点因果值。",effect:{karma:-5}},
  "loyalty_pill":{name:"迷心丹",type:"consumable",desc:"给NPC服用可降低其忠贞度20点。",effect:{lowerLoyalty:20}},
  "charm_pill":{name:"媚情丹",type:"consumable",desc:"给异性NPC服用可降低忠贞度30点，但有被发现的可能。",effect:{lowerLoyalty:30,charm:true}},
  "faith_pill":{name:"守贞丹",type:"consumable",desc:"给NPC服用可提升忠贞度20点。",effect:{raiseLoyalty:20}},
});

// ===== 称号系统 =====
const TITLES = {
  "novice_cultivator":{name:"初入修途",desc:"踏入修仙之门，开启修途。",condition:"cultLevel>=1",icon:"🌱"},
  "foundation_master":{name:"筑基修士",desc:"成功筑基，踏入修仙正途。",condition:"cultLevel>=5",icon:"⚔️"},
  "core_elder":{name:"结丹长老",desc:"结丹成功，成为一方强者。",condition:"cultLevel>=8",icon:"🔮"},
  "infant_lord":{name:"元婴老祖",desc:"元婴出窍，可称老祖。",condition:"cultLevel>=11",icon:"👁️"},
  "spirit_sect":{name:"化神大能",desc:"化神通天，大能之姿。",condition:"cultLevel>=14",icon:"🌟"},
  "ascended_one":{name:"飞升仙人",desc:"飞升灵界/仙界，成为仙人。",condition:"cultLevel>=22",icon:"✨"},
  "npc_killer":{name:"修士杀手",desc:"击败10名以上NPC修士。",condition:"npcKills>=10",icon:"💀"},
  "wealth_master":{name:"灵石富豪",desc:"拥有万枚灵石。",condition:"spiritStones>=10000",icon:"💰"},
  "dao_companion":{name:"有情道侣",desc:"拥有道侣。",condition:"spouses>=1",icon:"💑"},
  "great_parent":{name:"血脉传承",desc:"拥有后代。",condition:"offspring>=1",icon:"👶"},
  "mountain_lord":{name:"灵山之主",desc:"拥有灵山。",condition:"spiritMountain",icon:"🏔️"},
  "sect_founder":{name:"开宗立派",desc:"建立自己的宗门。",condition:"ownSect",icon:"🏯"},
  "heart_breaker":{name:"夺人道侣",desc:"成功哄骗他人道侣与你结合。",condition:"deceived",icon:"💔"},
  "loyalty_breaker":{name:"破贞之人",desc:"与忠贞度极低的有道侣NPC双修。",condition:"secretDual",icon:"🔥"},
  "sect_leader":{name:"宗门掌门",desc:"成为某宗门的掌门或高层。",condition:"sectLeader",icon:"👑"},
  "explorer_master":{name:"洞天探索者",desc:"探索10处洞天福地。",condition:"cavesFound>=10",icon:"🗺️"},
  "beast_tamer":{name:"灵兽驯者",desc:"拥有3只以上灵宠。",condition:"pets>=3",icon:"🐾"},
  "famous_cultivator":{name:"名震天下",desc:"声望达到极高。",condition:"reputation>=1000",icon:"📜"},
  "poacher_master":{name:"挖角圣手",desc:"成功挖角3名以上其他宗门NPC。",condition:"poached>=3",icon:"🎣"},
};

// ===== 宗门职位体系 =====
const SECT_POSITIONS = [
  {level:0, name:"外门弟子", reqContribution:0, desc:"宗门最基层的弟子，修炼基础功法。", dailyStones:10},
  {level:1, name:"外门执事", reqContribution:100, desc:"管理外门事务，可领取更多资源。", dailyStones:30},
  {level:2, name:"内门弟子", reqContribution:500, desc:"进入内门修炼，可学习核心功法。", dailyStones:50},
  {level:3, name:"内门执事", reqContribution:1500, desc:"管理内门事务，有一定话语权。", dailyStones:100},
  {level:4, name:"护法长老", reqContribution:5000, desc:"宗门高层，护卫宗门安全。", dailyStones:300},
  {level:5, name:"太上长老", reqContribution:15000, desc:"宗门元老，位高权重。", dailyStones:500},
  {level:6, name:"副宗主", reqContribution:50000, desc:"一人之下，万人之上。", dailyStones:1000},
  {level:7, name:"宗主", reqContribution:200000, desc:"宗门之主，执掌一切。", dailyStones:3000},
];

// ===== 宗门任务 =====
const SECT_TASKS = [
  {id:"patrol", name:"巡山任务", desc:"巡视宗门周围，击退入侵妖兽。", difficulty:1, contribution:10, stones:20, exp:100},
  {id:"herb_collect", name:"采药任务", desc:"采集指定灵草交给丹房。", difficulty:1, contribution:15, stones:30, exp:150},
  {id:"escort", name:"护送任务", desc:"护送物资到友好势力。", difficulty:2, contribution:25, stones:50, exp:300},
  {id:"hunt_beast", name:"猎杀妖兽", desc:"击杀为害一方的妖兽。", difficulty:2, contribution:30, stones:60, exp:400},
  {id:"investigate", name:"调查任务", desc:"调查附近异常灵气波动。", difficulty:3, contribution:50, stones:100, exp:600},
  {id:"subdue_renegade", name:"追杀叛徒", desc:"击败叛逃宗门的修士。", difficulty:4, contribution:100, stones:200, exp:1000},
  {id:"mine_guard", name:"矿脉守卫", desc:"守护宗门灵石矿脉。", difficulty:3, contribution:40, stones:80, exp:500},
  {id:"arena_fight", name:"比武切磋", desc:"代表宗门参加比武大会。", difficulty:3, contribution:60, stones:120, exp:800},
];

// ===== 增强洞天福地类型（强度更高） =====
const ENHANCED_CAVE_TYPES = [
  {
    name:"上古遗迹", desc:"你发现了一处上古修士留下的遗迹，石壁上刻满了古老的符文，空气中弥漫着远古的气息。",
    expBonus:500, stoneBonus:200, itemChance:0.7,
    enemyChance:0.6,
    enemyTypes:["ancient_puppet","ancient_beast","ancient_ghost","ancient_guardian"],
    itemPool:["heaven_void_cauldron","thunder_seal","spirit_gather_ring","five_element_ring","dragon_blood","star_sand"],
  },
  {
    name:"秘境入口", desc:"空间裂缝中隐约可见另一片天地，灵气浓郁得几乎凝为实质，显然是某种秘境的入口。",
    expBonus:1000, stoneBonus:500, itemChance:0.8,
    enemyChance:0.7,
    enemyTypes:["spirit_beast_guardian","demon_cultivator","ancient_array_spirit"],
    itemPool:["chaos_bell","nine_dragon_whip","heaven_seal_seal","spirit_devouring_bone","nine_ghost_bone_armor","dragon_soul_bead"],
  },
  {
    name:"魔修洞府", desc:"阴森的洞府中透出阵阵魔气，显然是魔道修士的修炼之所，其中必然有重宝，但也危机四伏。",
    expBonus:800, stoneBonus:300, itemChance:0.6,
    enemyChance:0.8,
    enemyTypes:["demon_cultivator","blood_puppet","demon_beast"],
    itemPool:["ghost_face_shield","nether_flag","soul_flag","poison_fang_dagger","nine_ghost_bone_armor"],
  },
  {
    name:"妖兽巢穴", desc:"巨大的洞穴中传来震耳欲聋的兽吼，这里显然是某头强大妖兽的巢穴。",
    expBonus:600, stoneBonus:150, itemChance:0.5,
    enemyChance:0.9,
    enemyTypes:["ancient_beast","demon_beast","spirit_beast_guardian"],
    itemPool:["dragon_blood","spirit_devouring_bone","phoenix_feather_cloak","thunder_dragon_leather"],
  },
  {
    name:"仙人遗府", desc:"金光闪闪的洞府大门上刻着\u201c仙\u201d字，这分明是一位仙人飞升后留下的洞府！",
    expBonus:2000, stoneBonus:1000, itemChance:0.9,
    enemyChance:0.7,
    enemyTypes:["immortal_puppet","immortal_beast","immortal_guardian"],
    itemPool:["heaven_seal_seal","chaos_bell","chaos_gourd","star_palace_mirror","void_ring","dragon_soul_bead"],
  },
  {
    name:"灵脉宝地", desc:"地底深处灵脉涌动，灵气几乎化为实质的灵液流淌，这里是绝佳的修炼宝地。",
    expBonus:3000, stoneBonus:2000, itemChance:0.3,
    enemyChance:0.5,
    enemyTypes:["earth_spirit","crystal_beast","vein_guardian"],
    itemPool:["spirit_gathering_pill","great_longevity_pill","heaven_longevity_fruit","nine_turn_pill","spirit_vein_stone"],
  },
];

// ===== 洞天福地强敌数据 =====
const CAVE_STRONG_ENEMIES = {
  "ancient_puppet":{name:"上古傀儡",hp:5000,atk:200,def:150,exp:2000,stone:300,drop:"spirit_shield_pill",dropRate:0.5},
  "ancient_beast":{name:"上古凶兽",hp:8000,atk:350,def:200,exp:3000,stone:500,drop:"dragon_blood",dropRate:0.4},
  "ancient_ghost":{name:"远古阴魂",hp:3000,atk:280,def:80,exp:2500,stone:200,drop:"soul_flag",dropRate:0.3},
  "ancient_guardian":{name:"遗迹守护者",hp:10000,atk:400,def:300,exp:5000,stone:800,drop:"star_iron_armor",dropRate:0.4},
  "spirit_beast_guardian":{name:"灵兽守护者",hp:6000,atk:300,def:250,exp:3500,stone:400,drop:"spirit_devouring_bone",dropRate:0.3},
  "demon_cultivator":{name:"魔修",hp:7000,atk:380,def:200,exp:4000,stone:600,drop:"ghost_face_shield",dropRate:0.4},
  "blood_puppet":{name:"血煞傀儡",hp:9000,atk:420,def:180,exp:4500,stone:500,drop:"nether_flag",dropRate:0.3},
  "demon_beast":{name:"魔道妖兽",hp:7500,atk:340,def:220,exp:3800,stone:450,drop:"poison_fang_dagger",dropRate:0.35},
  "ancient_array_spirit":{name:"古阵阵灵",hp:12000,atk:450,def:350,exp:6000,stone:1000,drop:"chaos_bell",dropRate:0.2},
  "immortal_puppet":{name:"仙家傀儡",hp:20000,atk:600,def:400,exp:10000,stone:2000,drop:"heaven_seal_seal",dropRate:0.3},
  "immortal_beast":{name:"仙兽",hp:25000,atk:700,def:500,exp:12000,stone:3000,drop:"chaos_gourd",dropRate:0.25},
  "immortal_guardian":{name:"仙人门卫",hp:15000,atk:550,def:450,exp:8000,stone:1500,drop:"void_ring",dropRate:0.3},
  "earth_spirit":{name:"地灵",hp:15000,atk:400,def:600,exp:7000,stone:2500,drop:"spirit_gathering_pill",dropRate:0.5},
  "crystal_beast":{name:"晶石兽",hp:18000,atk:350,def:700,exp:8000,stone:3000,drop:"spirit_gathering_pill",dropRate:0.5},
  "vein_guardian":{name:"灵脉守护者",hp:30000,atk:800,def:600,exp:20000,stone:5000,drop:"nine_turn_pill",dropRate:0.3},
};

// ===== 忠贞度相关行为 =====
const LOYALTY_ACTIONS = {
  "gift_luxury":{name:"赠送奢华礼物",loyaltyReduction:5,desc:"赠送贵重物品可逐步降低对方忠贞度。"},
  "sweet_words":{name:"甜言蜜语",loyaltyReduction:3,desc:"与对方多交谈，言语暧昧。",reqMood:50},
  "help_cultivate":{name:"助其修炼",loyaltyReduction:4,desc:"以灵力相助对方修炼，暗中影响其心志。",reqMood:60},
  "give_charm_pill":{name:"赠送媚情丹",loyaltyReduction:30,desc:"服用媚情丹可大幅降低忠贞度，但有被发现的风险。",needItem:"charm_pill"},
  "give_loyalty_pill":{name:"赠送迷心丹",loyaltyReduction:20,desc:"服用迷心丹可降低忠贞度。",needItem:"loyalty_pill"},
  "show_strength":{name:"展现实力",loyaltyReduction:6,desc:"在对方面前展示强大修为，以实力动摇其心志。",reqCultGap:2},
};

// ===== NPC社交关系模板 =====
const NPC_SOCIAL_RELATIONS = {
  "spouse":{name:"道侣",desc:"与该NPC结为道侣，关系亲密。"},
  "master":{name:"师父",desc:"该NPC的授业恩师。"},
  "disciple":{name:"弟子",desc:"该NPC的亲传弟子。"},
  "sworn_brother":{name:"结义兄弟",desc:"结义金兰，情同手足。"},
  "sworn_sister":{name:"结义姐妹",desc:"结义金兰，情同手足。"},
  "blood_relative":{name:"血亲",desc:"有血缘关系的亲属。"},
  "close_friend":{name:"挚友",desc:"相交多年的好友。"},
  "rival":{name:"宿敌",desc:"互相竞争的对手。"},
};

// ===== 自建宗门NPC数量配置 =====
const OWN_SECT_CONFIG = {
  outerDisciplesBase:20,
  innerDisciplesBase:5,
  highRankBase:3,
  inviteReqMood:80,
  maxInvitedNPCs:30,
};

// ===== 挖角方式 =====
const POACH_METHODS = {
  "force":{name:"武力胁迫",desc:"以武力逼迫对方加入你的宗门。",successBase:0.3,desc_:"根据对方道德值判断成功率，道德越低越容易。"},
  "bribery":{name:"重金利诱",desc:"以大量灵石和宝物收买对方。",successBase:0.4,desc_:"根据对方性格判断成功率，贪婪者易被收买。"},
  "persuasion":{name:"以情动人",desc:"以高好感度裹挟对方加入。",successBase:0.5,desc_:"好感度越高成功率越大。"},
};
