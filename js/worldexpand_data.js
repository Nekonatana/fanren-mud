/* ====== 凡人修仙传MUD · 世界扩展数据 ====== */

// ===== 寿命表（按修为阶段） =====
const LIFESPAN_TABLE = [
  {stage:0, name:"练气期", baseLifespan:120, desc:"凡人之躯，寿不过百二。"},
  {stage:1, name:"筑基期", baseLifespan:200, desc:"筑基成功，寿元大增。"},
  {stage:2, name:"结丹期", baseLifespan:500, desc:"结丹成功，可活五百年。"},
  {stage:3, name:"元婴期", baseLifespan:1000, desc:"元婴出窍，千年寿元。"},
  {stage:4, name:"化神期", baseLifespan:2000, desc:"化神通天，寿两千载。"},
  {stage:5, name:"合体期", baseLifespan:5000, desc:"合体大能，五千春秋。"},
  {stage:6, name:"大乘期", baseLifespan:10000, desc:"大乘圆满，万载寿命。"},
  {stage:7, name:"渡劫期", baseLifespan:20000, desc:"渡劫期修士，两万年寿元。"},
  {stage:8, name:"仙界", baseLifespan:999999, desc:"长生不死，与天同寿。"},
];

// ===== 延寿丹药/宝物 =====
const LIFESPAN_ITEMS = {
  "longevity_pill": {name:"延寿丹", type:"consumable", desc:"服用后延寿30年。", lifespanBonus:30, price:2000, grade:3},
  "great_longevity_pill": {name:"大延寿丹", type:"consumable", desc:"服用后延寿100年。", lifespanBonus:100, price:10000, grade:4},
  "immortal_longevity_pill": {name:"仙延寿丹", type:"consumable", desc:"服用后延寿500年。", lifespanBonus:500, price:50000, grade:5},
  "pine_heart_grass": {name:"松心草", type:"material", desc:"千年松下灵草，延寿10年。", lifespanBonus:10, price:500, grade:2},
  "blood_ginseng": {name:"血参", type:"material", desc:"百年血参，延寿20年。", lifespanBonus:20, price:1000, grade:3},
  "heaven_longevity_fruit": {name:"天寿果", type:"consumable", desc:"天界灵果，延寿1000年。", lifespanBonus:1000, price:100000, grade:5},
  "nine_turn_pill": {name:"九转还魂丹", type:"consumable", desc:"传说中的仙丹，延寿3000年。", lifespanBonus:3000, price:500000, grade:5},
};

// 添加延寿物品到ITEMS
Object.assign(ITEMS, {
  "longevity_pill": {name:"延寿丹",type:"consumable",desc:"服用后延寿30年。",effect:{lifespan:30}},
  "great_longevity_pill": {name:"大延寿丹",type:"consumable",desc:"服用后延寿100年。",effect:{lifespan:100}},
  "immortal_longevity_pill": {name:"仙延寿丹",type:"consumable",desc:"服用后延寿500年。",effect:{lifespan:500}},
  "pine_heart_grass": {name:"松心草",type:"material",desc:"千年松下灵草，延寿10年。可炼制延寿丹。"},
  "blood_ginseng": {name:"血参",type:"material",desc:"百年血参，延寿20年。可炼制大延寿丹。"},
  "heaven_longevity_fruit": {name:"天寿果",type:"consumable",desc:"天界灵果，延寿1000年。",effect:{lifespan:1000}},
  "nine_turn_pill": {name:"九转还魂丹",type:"consumable",desc:"传说中的仙丹，延寿3000年。",effect:{lifespan:3000}},
  "gift_spirit_grass": {name:"灵草束",type:"material",desc:"一束灵草，送人略表心意。",giftValue:5},
  "gift_spirit_wine": {name:"灵酿",type:"material",desc:"灵酒一坛，送礼佳品。",giftValue:15},
  "gift_jade_pendant": {name:"玉佩",type:"material",desc:"精美玉佩，送礼上品。",giftValue:30},
  "gift_spirit_stone_box": {name:"灵石匣",type:"material",desc:"一匣灵石，豪爽之礼。",giftValue:50},
  "gift_ancient_scroll": {name:"古籍残卷",type:"material",desc:"上古功法残卷，修士梦寐以求。",giftValue:80},
  "gift_heaven_treasure": {name:"天地灵珍",type:"material",desc:"天地孕育的灵珍异宝。",giftValue:150},
  "breakthrough_pill_supreme": {name:"极品破境丹",type:"consumable",desc:"给NPC服用可助其突破一个境界。",effect:{npcBreakthrough:true}},
  "dual_cultivation_pill": {name:"双修丹",type:"consumable",desc:"双修时服用，双方修为翻倍。",effect:{dualCultBonus:2}},
  "pregnancy_pill": {name:"安胎丹",type:"consumable",desc:"道侣怀孕时服用，确保胎儿平安。",effect:{safePregnancy:true}},
  "talent_pill": {name:"启灵丹",type:"consumable",desc:"给后代服用，提升灵根天赋。",effect:{talentBoost:true}},
});

// ===== 宗门和家族（20+） =====
const SECTS_AND_FAMILIES = {
  "seven_profound": {name:"七玄门", type:"sect", region:"七玄门集镇", leader:"墨大夫", strength:3, desc:"天南小宗门，修仙之路起点。", specialty:"基础功法", attitude:"neutral", reqStage:0},
  "yellow_maple": {name:"黄枫谷", type:"sect", region:"黄枫谷", leader:"令狐老祖", strength:5, desc:"天南七派之一，灵木之术闻名。", specialty:"灵木术", attitude:"friendly", reqStage:0},
  "blue_water": {name:"碧水宗", type:"sect", region:"天南坊市城", leader:"碧水真人", strength:4, desc:"天南七派之一，水系功法见长。", specialty:"水系功法", attitude:"neutral", reqStage:0},
  "clear_sound": {name:"清音门", type:"sect", region:"天南坊市城", leader:"音璇仙子", strength:4, desc:"天南七派之一，音律攻防著称。", specialty:"音律功法", attitude:"friendly", reqStage:0},
  "purple_cloud": {name:"紫云宫", type:"sect", region:"天南坊市城", leader:"紫云真人", strength:5, desc:"天南七派之一，紫云功法独步。", specialty:"紫云功法", attitude:"neutral", reqStage:0},
  "iron_sword": {name:"铁剑门", type:"sect", region:"天南坊市城", leader:"铁剑老人", strength:3, desc:"天南七派之一，剑修门派。", specialty:"剑修", attitude:"neutral", reqStage:0},
  "spirit_beast": {name:"灵兽山", type:"sect", region:"天南坊市城", leader:"驯兽老祖", strength:4, desc:"天南七派之一，擅长驯兽。", specialty:"驯兽术", attitude:"friendly", reqStage:0},
  "thunder_mountain": {name:"雷山派", type:"sect", region:"天南坊市城", leader:"雷山老祖", strength:4, desc:"天南七派之一，雷法著称。", specialty:"雷法", attitude:"neutral", reqStage:0},
  "ghost_spirit": {name:"鬼灵门", type:"sect", region:"天南坊市城", leader:"鬼灵子", strength:5, desc:"天南邪派，鬼道功法阴毒。", specialty:"鬼道功法", attitude:"hostile", reqStage:0},
  "blood_flame": {name:"血焰教", type:"sect", region:"天南坊市城", leader:"血焰老魔", strength:5, desc:"天南魔道，血焰功法凶残。", specialty:"血焰功法", attitude:"hostile", reqStage:0},
  "star_palace": {name:"星宫", type:"sect", region:"乱星海", leader:"星宫之主", strength:7, desc:"乱星海霸主，实力强横。", specialty:"星力功法", attitude:"neutral", reqStage:1},
  "demon_valley": {name:"魔道宗", type:"sect", region:"坠魔谷", leader:"魔道老祖", strength:6, desc:"坠魔谷魔道宗门。", specialty:"魔道功法", attitude:"hostile", reqStage:3},
  "spirit_world_sect": {name:"灵界天宗", type:"sect", region:"灵界", leader:"天宗宗主", strength:8, desc:"灵界大宗门。", specialty:"灵界功法", attitude:"neutral", reqStage:4},
  "immortal_palace": {name:"仙宫", type:"sect", region:"仙界", leader:"仙帝", strength:10, desc:"仙界至高仙宫。", specialty:"仙道功法", attitude:"neutral", reqStage:8},
  // 家族
  "han_family": {name:"韩家", type:"family", region:"天南", leader:"韩家族长", strength:2, desc:"天南修仙世家。", specialty:"炼丹", attitude:"neutral", reqStage:0},
  "wang_family": {name:"王家", type:"family", region:"天南", leader:"王家族长", strength:3, desc:"天南修仙世家。", specialty:"炼器", attitude:"neutral", reqStage:0},
  "mu_family": {name:"慕容家", type:"family", region:"天南", leader:"慕容老太君", strength:4, desc:"天南大族，势力颇大。", specialty:"阵法", attitude:"neutral", reqStage:0},
  "li_family": {name:"李家", type:"family", region:"乱星海", leader:"李家族长", strength:3, desc:"乱星海修仙世家。", specialty:"海战", attitude:"neutral", reqStage:1},
  "yun_family": {name:"云家", type:"family", region:"灵界", leader:"云家老祖", strength:6, desc:"灵界大族。", specialty:"灵界功法", attitude:"neutral", reqStage:4},
  "yao_family": {name:"姚家", type:"family", region:"灵界", leader:"姚家老祖", strength:5, desc:"灵界炼丹世家。", specialty:"炼丹", attitude:"neutral", reqStage:4},
  "zhao_family": {name:"赵家", type:"family", region:"慕兰草原", leader:"赵家族长", strength:4, desc:"慕兰大族，尚武好斗。", specialty:"战阵", attitude:"neutral", reqStage:2},
  "qin_family": {name:"秦家", type:"family", region:"天南", leader:"秦家族长", strength:2, desc:"天南小家族。", specialty:"符箓", attitude:"friendly", reqStage:0},
};

// ===== 灵宠种类 =====
const SPIRIT_PETS = {
  "spirit_fox": {name:"灵狐", desc:"通灵灵狐，能感应灵气。", reqStage:0, cost:500, atkBonus:5, defBonus:3, spdBonus:10, skill:"魅惑", maxLevel:10},
  "spirit_hawk": {name:"灵鹰", desc:"高空灵鹰，目力惊人。", reqStage:0, cost:800, atkBonus:10, defBonus:2, spdBonus:20, skill:"鹰击", maxLevel:10},
  "spirit_wolf": {name:"灵狼", desc:"丛林灵狼，群战之王。", reqStage:1, cost:2000, atkBonus:20, defBonus:10, spdBonus:15, skill:"狼嚎", maxLevel:15},
  "spirit_turtle": {name:"灵龟", desc:"万年灵龟，防御无双。", reqStage:1, cost:1500, atkBonus:5, defBonus:30, spdBonus:-5, skill:"龟甲", maxLevel:15},
  "spirit_snake": {name:"灵蛇", desc:"通灵灵蛇，毒牙锋利。", reqStage:1, cost:1800, atkBonus:15, defBonus:8, spdBonus:18, skill:"毒噬", maxLevel:15},
  "spirit_bear": {name:"灵熊", desc:"山林灵熊，力大无穷。", reqStage:2, cost:5000, atkBonus:40, defBonus:35, spdBonus:5, skill:"熊掌", maxLevel:20},
  "fire_lion": {name:"火灵狮", desc:"火属性灵兽，威风凛凛。", reqStage:2, cost:8000, atkBonus:50, defBonus:30, spdBonus:15, skill:"烈焰", maxLevel:20},
  "ice_phoenix": {name:"冰凤", desc:"冰属性灵鸟，稀世罕见。", reqStage:3, cost:20000, atkBonus:80, defBonus:60, spdBonus:30, skill:"冰封", maxLevel:25},
  "thunder_dragon": {name:"雷蛟", desc:"蛟龙血脉，雷属性灵兽。", reqStage:3, cost:50000, atkBonus:150, defBonus:100, spdBonus:40, skill:"雷劫", maxLevel:30},
  "void_beast": {name:"虚空兽", desc:"来自虚空的神秘灵兽。", reqStage:4, cost:200000, atkBonus:300, defBonus:200, spdBonus:50, skill:"虚空撕裂", maxLevel:50},
};

// ===== 灵山建筑 =====
const SPIRIT_MOUNTAIN_BUILDINGS = {
  "main_hall": {name:"宗门大殿", desc:"宗门核心建筑，招收弟子之所。", cost:5000, reqStage:0, effect:"招弟子", maxLevel:5},
  "herb_garden": {name:"灵药园", desc:"种植灵草灵药之地。", cost:3000, reqStage:0, effect:"种灵药", maxLevel:5},
  "beast_pen": {name:"灵兽圈", desc:"饲养灵兽之所。", cost:3000, reqStage:0, effect:"养灵兽", maxLevel:5},
  "livestock_pen": {name:"凡畜棚", desc:"饲养普通牲畜。", cost:1000, reqStage:0, effect:"养牲畜", maxLevel:3},
  "alchemy_room": {name:"炼丹房", desc:"炼丹专用建筑。", cost:8000, reqStage:1, effect:"炼丹加成", maxLevel:3},
  "forge_room": {name:"炼器房", desc:"炼器专用建筑。", cost:8000, reqStage:1, effect:"炼器加成", maxLevel:3},
  "cultivation_cave": {name:"修炼洞府", desc:"弟子修炼之所。", cost:5000, reqStage:0, effect:"修炼加成", maxLevel:5},
  "spirit_vein": {name:"灵脉阵", desc:"聚灵阵法，加速修炼。", cost:20000, reqStage:2, effect:"灵气加成", maxLevel:3},
  "defense_array": {name:"护山大阵", desc:"防御阵法，抵御外敌。", cost:15000, reqStage:1, effect:"防御", maxLevel:5},
  "treasure_vault": {name:"宝库", desc:"存放宝物之所。", cost:5000, reqStage:0, effect:"储物", maxLevel:3},
  "dungeon_cell": {name:"地牢", desc:"关押俘虏之所，建造后可俘虏战败的修士。", cost:10000, reqStage:1, effect:"关押俘虏", maxLevel:3},
};

// ===== 灵山灵药种植种类 =====
const MOUNTAIN_HERBS = {
  "spirit_grass_m": {name:"灵草", growDays:3, harvest:{item:"spirit_grass", count:3}, cost:50},
  "ginseng_m": {name:"人参", growDays:7, harvest:{item:"thousand_year_ginseng", count:1}, cost:200},
  "pine_heart_m": {name:"松心草", growDays:10, harvest:{item:"pine_heart_grass", count:1}, cost:300},
  "blood_ginseng_m": {name:"血参", growDays:14, harvest:{item:"blood_ginseng", count:1}, cost:500},
  "golden_lotus_m": {name:"金莲", growDays:20, harvest:{item:"golden_lotus", count:1}, cost:1000},
};

// ===== 灵山灵兽饲养种类 =====
const MOUNTAIN_BEASTS = {
  "spirit_chicken": {name:"灵鸡", growDays:5, harvest:{item:"spirit_stone", count:20}, cost:100, desc:"产灵石碎屑的灵鸡。"},
  "spirit_cow": {name:"灵牛", growDays:10, harvest:{item:"spirit_stone", count:50}, cost:300, desc:"产灵乳的灵牛。"},
  "spirit_sheep": {name:"灵羊", growDays:7, harvest:{item:"spirit_grass", count:3}, cost:200, desc:"产灵羊毛的灵羊。"},
  "spirit_fish": {name:"灵鱼", growDays:8, harvest:{item:"spirit_stone", count:35}, cost:250, desc:"灵池中的灵鱼。"},
};

// ===== 后代养成数据 =====
const OFFSPRING_DATA = {
  growStages: [
    {age:0, name:"婴孩", desc:"嗷嗷待哺的婴孩。", effect:"none"},
    {age:3, name:"幼童", desc:"开始学习走路说话。", effect:"none"},
    {age:6, name:"学童", desc:"可以开始启蒙修炼。", effect:"can_train"},
    {age:12, name:"少年", desc:"初入修仙之路。", effect:"can_cultivate"},
    {age:16, name:"青年", desc:"可以独当一面。", effect:"can_adventure"},
    {age:30, name:"成年", desc:"修为有成，可独立修行。", effect:"independent"},
  ],
  talentLevels: [
    {name:"凡品", mult:0.5, desc:"灵根普通，修炼缓慢。"},
    {name:"下品", mult:0.8, desc:"灵根尚可。"},
    {name:"中品", mult:1.0, desc:"灵根中等。"},
    {name:"上品", mult:1.5, desc:"灵根上佳。"},
    {name:"极品", mult:2.0, desc:"天生道体，修炼神速。"},
    {name:"仙品", mult:3.0, desc:"仙灵之体，旷世奇才。"},
  ],
};

// ===== 客栈休息选项 =====
const INN_REST_OPTIONS = [
  {hours:6, name:"小憩（3个时辰/6小时）", desc:"短暂休息，恢复30%气血灵力，推进6小时。", price:10, hpPct:0.3, mpPct:0.3},
  {hours:8, name:"安眠（4个时辰/8小时）", desc:"一夜好眠，恢复50%气血灵力，推进8小时。", price:20, hpPct:0.5, mpPct:0.5},
  {hours:12, name:"深眠（6个时辰/12小时）", desc:"深度休息，恢复80%气血灵力，推进12小时。", price:50, hpPct:0.8, mpPct:0.8},
  {hours:24, name:"大睡（12个时辰/24小时）", desc:"酣睡一整天，完全恢复，推进1天。", price:100, hpPct:1.0, mpPct:1.0},
];

// ===== 普通人NPC名字池 =====
const COMMONER_SURNAMES = ["张","王","李","赵","刘","陈","杨","黄","周","吴","徐","孙","胡","朱","高","林","何","郭","马","罗"];
const COMMONER_MALE_NAMES = ["大壮","铁柱","二牛","三娃","石头","狗剩","铁蛋","旺财","来福","富贵","平安","大柱","小虎","大龙","金宝","有财","福生","德贵","根生","满仓"];
const COMMONER_FEMALE_NAMES = ["翠花","秀兰","春花","小芳","金花","银花","桂花","桃花","巧云","小翠","秀英","春梅","冬梅","兰香","玉珍","凤英","美玲","小莲","香草","腊梅"];
const CHILD_NAMES = ["小宝","小虎","小凤","小莲","小石头","小铁蛋","小翠","小兰","小狗子","小丫","虎头","妞妞","铁头","丫蛋","泥鳅","小福","安安","乖乖"];

// ===== 扩展任务 =====
const EXPAND_QUESTS = {
  "side_spirit_mountain": {name:"灵山机缘", desc:"寻找并获取一座灵山，建立自己的修炼根基。", type:"side", target:"获得一座灵山", checkFn:"checkSpiritMountain"},
  "side_marriage": {name:"道侣之约", desc:"与一位异性NPC结为道侣。", type:"side", target:"结为道侣", checkFn:"checkMarriage"},
  "side_offspring": {name:"血脉传承", desc:"诞下后代，延续血脉。", type:"side", target:"拥有后代", checkFn:"checkOffspring"},
  "side_spirit_pet": {name:"灵兽之主", desc:"收服一只灵宠。", type:"side", target:"拥有灵宠", checkFn:"checkSpiritPet"},
  "side_sect_build": {name:"开宗立派", desc:"在灵山上建造宗门大殿。", type:"side", target:"建造宗门大殿", checkFn:"checkSectBuild"},
  "side_sect_conquer": {name:"征服者", desc:"剿灭或附庸一个宗门/家族。", type:"side", target:"征服一个势力", checkFn:"checkSectConquer"},
  "side_longevity": {name:"长生久视", desc:"通过丹药延寿超过500年。", type:"side", target:"延寿500年以上", checkFn:"checkLongevity"},
  "side_npc_breakthrough": {name:"渡人突破", desc:"帮助一名NPC突破境界。", type:"side", target:"帮助NPC突破", checkFn:"checkNpcBreakthrough"},
  "side_dual_cultivation": {name:"双修之妙", desc:"与道侣双修获得修为。", type:"side", target:"完成一次双修", checkFn:"checkDualCultivation"},
  "side_disciple_10": {name:"桃李满门", desc:"招收10名弟子。", type:"side", target:"拥有10名弟子", checkFn:"checkDisciple10"},
};
Object.assign(QUESTS, EXPAND_QUESTS);

// ===== 扩展成就 =====
const EXPAND_ACHIEVEMENTS = {
  "spirit_mountain_owner": {name:"灵山之主", desc:"获得一座灵山。", icon:"🏔️"},
  "sect_founder": {name:"开宗立派", desc:"建造宗门大殿，开宗立派。", icon:"🏯"},
  "first_marriage": {name:"道侣之约", desc:"第一次与NPC结为道侣。", icon:"💑"},
  "first_offspring": {name:"初为人父", desc:"第一次拥有后代。", icon:"👶"},
  "first_spirit_pet": {name:"灵兽之友", desc:"第一次收服灵宠。", icon:"🐾"},
  "sect_conqueror": {name:"征服者", desc:"征服一个宗门或家族。", icon:"⚔️"},
  "longevity_master": {name:"长生久视", desc:"延寿超过500年。", icon:"⏳"},
  "dual_cultivator": {name:"阴阳交汇", desc:"完成第一次双修。", icon:"☯️"},
  "great_family": {name:"人丁兴旺", desc:"拥有5名以上后代。", icon:"👨‍👩‍👧‍👦"},
};
Object.assign(ACHIEVEMENTS, EXPAND_ACHIEVEMENTS);

// ===== 宗门外交选项 =====
const SECT_DIPLOMACY_OPTIONS = [
  {id:"trade", name:"交易功法/宝物", desc:"与对方交换功法或宝物。", cost:1000, reqRelation:0},
  {id:"alliance", name:"结盟", desc:"与对方结为盟友。", cost:5000, reqRelation:30},
  {id:"marriage", name:"联姻", desc:"通过联姻加深关系。", cost:3000, reqRelation:20},
  {id:"vassalize", name:"要求附庸", desc:"要求对方成为附庸。", cost:10000, reqRelation:50, reqStrength:true},
  {id:"attack", name:"攻打", desc:"发动攻击，剿灭对方。", cost:0, reqRelation:-100},
  {id:"tribute", name:"上供", desc:"向附庸征收资源。", cost:0, reqVassal:true},
];

// ===== 双修效果 =====
const DUAL_CULTIVATION_EFFECTS = {
  baseExp: 200,
  affinityBonus: 5,
  pregnancyChance: 0.15,
  pregnancyChanceWithPill: 0.4,
  cooldownDays: 7,
};

// ===== NPC年龄阶段 =====
const NPC_AGE_STAGES = [
  {min:0, max:6, stage:"幼童", canFight:false},
  {min:7, max:15, stage:"少年", canFight:true, cultChance:0.3},
  {min:16, max:100, stage:"青年", canFight:true, cultChance:0.8},
  {min:101, max:300, stage:"中年", canFight:true, cultChance:0.6},
  {min:301, max:999, stage:"老者", canFight:true, cultChance:0.4},
  {min:1000, max:9999, stage:"古修", canFight:true, cultChance:0.2},
];
