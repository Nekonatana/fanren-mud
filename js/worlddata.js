/* ====== 凡人修仙传MUD · 世界系统数据 ====== */

// ===== 世界地图区域（含坐标用于可视化地图） =====
const WORLD_MAP = {
  "七玄门集镇": {name:"七玄门集镇", x:15, y:75, type:"city", desc:"七玄门山脚下的集镇，修仙之路起点。", reqStage:0,
    subAreas:["七玄门主殿","后山密林","七玄门药圃","丹药铺","兵器铺","杂货铺","客栈"],
    connections:["黄枫谷","天南坊市城"]},
  "黄枫谷": {name:"黄枫谷", x:30, y:70, type:"city", desc:"天南七派之一驻地，灵木之术闻名。", reqStage:0,
    subAreas:["黄枫谷主殿","黄枫谷坊市","灵木林","丹药铺","兵器铺","防具铺","杂货铺","客栈"],
    connections:["七玄门集镇","天南坊市城"]},
  "天南坊市城": {name:"天南坊市城", x:45, y:65, type:"city", desc:"天南最大的修仙城市，商贾云集。", reqStage:0,
    subAreas:["丹药铺","兵器铺","防具铺","饰品铺","法宝铺","杂货铺","拍卖行","客栈","茶馆","散修聚集地","铁剑门山门","灵兽山","雷山派山门","鬼灵门驻地","血焰教驻地","荒野小径","灵石矿脉","古修士洞府","毒蛇谷"],
    connections:["黄枫谷","七玄门集镇","乱星海渡口","长安城","太南谷"]},
  "长安城": {name:"长安城", x:20, y:50, type:"city", desc:"中原腹地的修仙大城，历史悠久，商贾如云。", reqStage:0,
    subAreas:["丹药铺","兵器铺","防具铺","饰品铺","杂货铺","拍卖行","客栈","茶馆","万宝楼","青云观","慈恩寺","古墓群","落雁峰"],
    connections:["天南坊市城","太南谷"]},
  "太南谷": {name:"太南谷", x:60, y:75, type:"city", desc:"天南东部的幽静谷地城镇，灵气清幽。", reqStage:0,
    subAreas:["丹药铺","兵器铺","杂货铺","客栈","灵草园","清风剑阁","百毒谷","幽冥涧","灵泉瀑布"],
    connections:["天南坊市城","长安城","乱星海渡口"]},
  "乱星海渡口": {name:"乱星海渡口", x:60, y:55, type:"city", desc:"通往乱星海的港口城市。", reqStage:1,
    subAreas:["海港商铺","船坞","海鲜酒楼","散修客栈","丹药铺","兵器铺","防具铺","杂货铺","客栈"],
    connections:["天南坊市城","太南谷","乱星海"]},
  "乱星海": {name:"乱星海", x:75, y:45, type:"sea", desc:"无边海域，海兽横行，盛产星辰砂。", reqStage:1,
    subAreas:["星宫","海底遗迹","风暴海域","星砂矿岛"],
    connections:["乱星海渡口","虚天殿"]},
  "虚天殿": {name:"虚天殿", x:55, y:35, type:"ruins", desc:"上古遗迹，藏宝无数也凶险万分。", reqStage:2,
    subAreas:["虚天殿外围","虚天殿内殿","虚天秘境"],
    connections:["乱星海","慕兰草原"]},
  "慕兰草原": {name:"慕兰草原", x:70, y:25, type:"warzone", desc:"天南与中原交界，战火纷飞。", reqStage:2,
    subAreas:["慕兰战场","战场营地","草原集市"],
    connections:["虚天殿","坠魔谷"]},
  "坠魔谷": {name:"坠魔谷", x:40, y:20, type:"danger", desc:"古时大能陨落之地，魔气冲天。", reqStage:3,
    subAreas:["坠魔谷入口","坠魔谷深处","古魔封印地"],
    connections:["慕兰草原","灵界入口"]},
  "灵界入口": {name:"灵界入口", x:55, y:10, type:"portal", desc:"飞升灵界的通道。", reqStage:4,
    subAreas:["飞升台","灵界坊市"],
    connections:["坠魔谷","灵界"]},
  "灵界": {name:"灵界", x:80, y:15, type:"realm", desc:"高于人间的修仙界。", reqStage:4,
    subAreas:["灵界仙城","灵界荒原","万灵秘境","灵界集市"],
    connections:["灵界入口","天界"]},
  "仙界": {name:"天界", x:90, y:5, type:"realm", desc:"传说中的至高界面。", reqStage:8,
    subAreas:["仙城","天界仙野","混沌之地","仙界集市"],
    connections:["灵界"]},
};

// ===== 城镇商店定义 =====
const SHOPS = {
  "丹药铺": {
    name:"百草堂",
    items: [
      {id:"healing_pill", price:50},
      {id:"qi_pill", price:40},
      {id:"foundation_pill", price:500},
      {id:"core_formation_pill", price:2000},
      {id:"infant_formation_pill", price:8000},
      {id:"breakthrough_pill", price:3000},
      {id:"power_pill", price:800},
    ],
  },
  "兵器铺": {
    name:"千锤阁",
    items: [
      {id:"iron_sword", price:50},
      {id:"qingshuang_sword", price:300},
      {id:"zisha_sword", price:800},
      {id:"blue_silk_sword", price:2000},
      {id:"wind_lei_sword", price:3000},
      {id:"dragon_pattern_blade", price:8000},
    ],
  },
  "防具铺": {
    name:"铁壁坊",
    items: [
      {id:"cloth_robe", price:30},
      {id:"blue_robe", price:200},
      {id:"purple_armor", price:800},
      {id:"dragon_scale_armor", price:3000},
      {id:"nine_heaven_robe", price:8000},
    ],
  },
  "饰品铺": {
    name:"灵宝斋",
    items: [
      {id:"spirit_gather_ring", price:300},
      {id:"wind_chase_boots", price:600},
      {id:"five_element_ring", price:2000},
      {id:"space_ring", price:8000},
    ],
  },
  "法宝铺": {
    name:"通天阁",
    items: [
      {id:"giant_silk", price:500},
      {id:"thunder_seal", price:2000},
      {id:"heaven_void_cauldron", price:15000},
    ],
  },
  "杂货铺": {
    name:"万象杂货",
    items: [
      {id:"spirit_grass", price:10},
      {id:"spirit_stone", price:50},
      {id:"thousand_year_ginseng", price:300},
      {id:"dragon_blood", price:1500},
      {id:"star_sand", price:200},
      {id:"golden_lotus", price:4000},
      {id:"wooden_sword", price:50},
      {id:"spirit_rattle", price:80},
      {id:"jade_pendant_toy", price:120},
      {id:"story_book", price:200},
      {id:"puzzle_cube", price:300},
      {id:"spirit_kite", price:150},
    ],
  },
  "客栈": {
    name:"仙来客栈",
    services: [
      {id:"rest", name:"休息（恢复全部HP/MP）", price:20, effect:{hp:"full", mp:"full"}},
      {id:"meditate", name:"闭关修炼（+经验）", price:50, effect:{exp:200}},
      {id:"gossip", name:"打听消息", price:10, effect:{info:true}},
    ],
  },
  "茶馆": {
    name:"望月茶馆",
    services: [
      {id:"tea", name:"品茶论道（+悟性）", price:30, effect:{comp:1}},
      {id:"listen", name:"听书（+机缘）", price:20, effect:{luck:1}},
      {id:"chat", name:"闲聊打听（获取情报）", price:5, effect:{info:true}},
    ],
  },
};

// ===== 城镇定义 =====
const TOWNS = {
  "七玄门集镇": {
    name:"七玄门集镇", region:"七玄门集镇", desc:"七玄门山脚下的小集镇，有些基础商铺。", reqStage:0,
    shops:["丹药铺","兵器铺","杂货铺","客栈"],
  },
  "黄枫谷坊市": {
    name:"黄枫谷坊市", region:"黄枫谷", desc:"黄枫谷内部的坊市，比七玄门集镇大一些。", reqStage:0,
    shops:["丹药铺","兵器铺","防具铺","杂货铺","客栈"],
  },
  "天南坊市城": {
    name:"天南坊市城", region:"天南坊市城", desc:"天南最大的修仙城市，商铺林立，修士众多。", reqStage:0,
    shops:["丹药铺","兵器铺","防具铺","饰品铺","法宝铺","杂货铺","拍卖行","客栈","茶馆"],
  },
  "长安城": {
    name:"长安城", region:"长安城", desc:"中原腹地的修仙大城，历史悠久。", reqStage:0,
    shops:["丹药铺","兵器铺","防具铺","饰品铺","杂货铺","拍卖行","客栈","茶馆"],
  },
  "太南谷": {
    name:"太南谷", region:"太南谷", desc:"天南东部的幽静谷地城镇。", reqStage:0,
    shops:["丹药铺","兵器铺","杂货铺","客栈"],
  },
  "乱星海渡口": {
    name:"乱星海渡口", region:"乱星海渡口", desc:"通往乱星海的港口城市。", reqStage:1,
    shops:["丹药铺","兵器铺","防具铺","杂货铺","客栈"],
  },
  "虚天殿营地": {
    name:"虚天殿营地", region:"虚天殿", desc:"虚天殿外围的散修营地。", reqStage:2,
    shops:["丹药铺","杂货铺","客栈"],
  },
  "慕兰营地": {
    name:"慕兰营地", region:"慕兰草原", desc:"慕兰草原上的战场营地。", reqStage:2,
    shops:["丹药铺","兵器铺","杂货铺"],
  },
  "灵界仙城": {
    name:"灵界仙城", region:"灵界", desc:"灵界最大的仙城，商铺应有尽有。", reqStage:4,
    shops:["丹药铺","兵器铺","防具铺","饰品铺","法宝铺","杂货铺","拍卖行","客栈","茶馆"],
  },
  "仙城": {
    name:"天界仙城", region:"仙界", desc:"天界仙城，至高商铺。", reqStage:8,
    shops:["丹药铺","兵器铺","防具铺","饰品铺","法宝铺","杂货铺","拍卖行","客栈","茶馆"],
  },
};

// ===== NPC修士名字池 =====
const NPC_SURNAMES = ["李","王","张","刘","陈","杨","赵","黄","周","吴","徐","孙","胡","朱","高","林","何","郭","马","罗","梁","宋","郑","谢","韩","唐","冯","于","董","萧","程","曹","袁","邓","许","傅","沈","曾","彭","吕","苏","蒋","贾","丁","魏","薛","叶","阎","余","潘","杜","戴","夏","钟","汪","田","任","姜","范","方","石","姚","谭","廖","邹","熊","金","陆","郝","孔","白","崔","康","毛","邱","秦","江","史","顾","侯","邵","孟","龙","万","段","雷","钱","汤","尹","黎","易","常","武","乔","贺","赖","龚","文"];
const NPC_GIVEN_NAMES_M = ["逸","轩","宇","浩","然","明","睿","杰","恒","谦","风","云","雷","霆","渊","岳","峰","岩","松","柏","清","玄","真","虚","灵","空","明","远","博","文","武","英","雄","豪","俊","彦","卓","超","越","恒","毅","坚","诚","信","义","仁","德","道","法","术","剑","锋","刃","寒","冰","炎","阳","阴","星","月","辰","旭","皓","晗","暄","曜","晨","曦","光","辉","耀","煌","焱","燚","淼","泽","润","霖","霏","露","霜","雪","霁","澜","波","涛","潮","瀚","渺","茫","阔","辽","远","遥","渺","凌","翔","腾","跃","驰","骋","骋","迅","疾","迅","捷","敏","锐","锋","利","刚","强","毅","勇","猛","壮","伟","宏","硕","博","渊","深","厚","重","沉","稳","安","平","和","宁","静","寂","默","默"];
const NPC_GIVEN_NAMES_F = ["雪","冰","月","霜","露","雯","娟","妍","婷","媛","媚","娇","婉","柔","雅","馨","瑶","琴","萱","蕊","蕾","菡","萱","芷","兰","菊","梅","竹","荷","莲","蓉","薇","菱","蕊","馨","馨","悦","欣","怡","宁","静","婉","淑","慧","颖","灵","巧","妙","仙","子","颜","玉","珠","翠","霞","彩","虹","霓","翩","跹","舞","吟","歌","韵","律","诗","书","画","绣","锦","绣","绮","绫","缎","绸","绢","纱","裳","裙","钗","钿","钏","镯","环","佩","珰","瑛","琰","琮","琚","琪","琳","瑶","璇","瑾","瑜","璎","珞","珩","琎","珂","珉","玮","瑛","璟","璨","璨"];
const NPC_TITLES = ["散修","道友","真人","散人","居士","道长","前辈","阁主","谷主","门主","长老","执事","弟子","记名弟子","外门弟子","内门弟子","核心弟子","真传弟子","护法","护院","管事","掌柜","少主","公子","仙子","仙姑","姑奶奶","老祖","老怪","老妖","妖修","魔修","剑修","体修","丹师","炼器师","符师","阵法师","驯兽师"];

// ===== NPC性格类型 =====
const NPC_PERSONALITIES = [
  {type:"友善", desc:"性格随和，乐于助人。", talkBias:0.7, befriendChance:0.6, stealDifficulty:0.3, attackRetaliate:0.5},
  {type:"冷漠", desc:"不苟言笑，难以接近。", talkBias:0.3, befriendChance:0.2, stealDifficulty:0.5, attackRetaliate:0.7},
  {type:"热情", desc:"热情洋溢，喜欢交友。", talkBias:0.9, befriendChance:0.7, stealDifficulty:0.4, attackRetaliate:0.4},
  {type:"阴险", desc:"表里不一，心怀鬼胎。", talkBias:0.4, befriendChance:0.15, stealDifficulty:0.6, attackRetaliate:0.9},
  {type:"豪爽", desc:"豪爽大方，不拘小节。", talkBias:0.8, befriendChance:0.65, stealDifficulty:0.35, attackRetaliate:0.3},
  {type:"谨慎", desc:"小心谨慎，步步为营。", talkBias:0.3, befriendChance:0.25, stealDifficulty:0.7, attackRetaliate:0.6},
  {type:"狂傲", desc:"目中无人，狂傲不羁。", talkBias:0.2, befriendChance:0.1, stealDifficulty:0.5, attackRetaliate:0.95},
  {type:"温和", desc:"温文尔雅，与世无争。", talkBias:0.6, befriendChance:0.55, stealDifficulty:0.3, attackRetaliate:0.2},
  {type:"狡诈", desc:"狡兔三窟，诡计多端。", talkBias:0.3, befriendChance:0.1, stealDifficulty:0.65, attackRetaliate:0.8},
  {type:"侠义", desc:"侠肝义胆，嫉恶如仇。", talkBias:0.7, befriendChance:0.5, stealDifficulty:0.5, attackRetaliate:0.7},
];

// ===== NPC关系类型 =====
const NPC_RELATION_TYPES = ["同门","道侣","师徒","好友","结义兄弟","仇敌","竞争者","旧识","故交","盟友"];

// ===== NPC行为状态 =====
const NPC_ACTIONS = [
  "正在打坐修炼", "正在炼丹", "正在喂灵兽", "正在整理储物袋", "正在查看地图",
  "正在闲逛", "正在与人交谈", "正在摆摊卖物", "正在擦拭法器", "正在闭目养神",
  "正在翻看典籍", "正在练习法术", "正在品茗", "正在饮酒", "正在打瞌睡",
  "正在巡逻", "正在采集灵草", "正在猎杀妖兽", "正在布置阵法", "正在占卜",
];

// ===== NPC对话库 =====
const NPC_DIALOGUES = {
  friendly: [
    "「道友可有空？不如坐下饮杯茶。」",
    "「此处灵气尚可，道友若要修炼，不妨在此。」",
    "「在下初来乍到，不知附近可有什么好去处？」",
    "「道友修为精进，令人佩服。」",
    "「最近坊市来了批新货，道友可去瞧瞧。」",
  ],
  cold: [
    "「……」他看了你一眼，便转过头去。",
    "「道友何事？」语气平淡，似乎不太想多言。",
    "「与你无关。」",
    "「道友自便。」",
    "「嗯。」",
  ],
  arrogant: [
    "「哼，不过是个练气期的小辈。」",
    "「你也配跟我说话？」",
    "「区区凡人，也敢踏入修仙界？」",
    "「别挡我的路。」",
    "「你不配知道我的名号。」",
  ],
  warm: [
    "「道友快来！今日我在此发现了一处灵脉！」",
    "「哈哈，又见面了！上次说的那件事可有进展？」",
    "「道友若是需要帮忙，尽管开口！」",
    "「最近我炼了炉好丹，分你几颗！」",
    "「走，我请你喝茶去！」",
  ],
  cunning: [
    "「道友身上这件法器倒是不错……」他眼中闪过一丝异色。",
    "「在下有个发财的路子，道友可有兴趣？」",
    "「此处人多眼杂，不如换个地方说话？」",
    "「道友可知这附近有不少肥羊？」",
    "「嘿嘿，在下最近得了个消息，保准道友感兴趣。」",
  ],
};

// ===== NPC掉落物品池（按修为等级） =====
const NPC_LOOT_POOLS = {
  0: ["healing_pill","qi_pill","spirit_grass","iron_sword","cloth_robe"],
  1: ["healing_pill","qi_pill","foundation_pill","qingshuang_sword","blue_robe","spirit_gather_ring"],
  2: ["foundation_pill","core_formation_pill","zisha_sword","purple_armor","wind_chase_boots"],
  3: ["core_formation_pill","infant_formation_pill","blue_silk_sword","dragon_scale_armor","five_element_ring"],
  4: ["infant_formation_pill","dragon_pattern_blade","nine_heaven_robe","space_ring","thunder_seal"],
  5: ["dragon_pattern_blade","void_heaven_blade","nine_heaven_robe","space_ring"],
};

// ===== 随机洞天福地生成 =====
const CAVE_DWELLING_TYPES = [
  {name:"古修士洞府", desc:"一座荒废的古修士洞府，里面似乎还残留着一些灵气。", expBonus:500, stoneBonus:200, itemChance:0.6},
  {name:"天然灵穴", desc:"天然形成的灵穴，灵气比外界浓郁数倍。", expBonus:800, stoneBonus:100, itemChance:0.3},
  {name:"万年灵泉", desc:"万年灵泉所在之处，饮用泉水可恢复伤势。", expBonus:300, stoneBonus:0, itemChance:0.2, hpRestore:true},
  {name:"上古遗迹", desc:"上古修士留下的遗迹，可能藏有功法或法器。", expBonus:1000, stoneBonus:500, itemChance:0.8},
  {name:"灵石矿脉", desc:"一处未被发现的灵石矿脉，灵石储量丰富。", expBonus:0, stoneBonus:2000, itemChance:0.2},
  {name:"灵药园", desc:"古时修士留下的灵药园，虽已荒废但仍有灵药生长。", expBonus:200, stoneBonus:100, itemChance:0.9, itemPool:["spirit_grass","thousand_year_ginseng","flame_grass","golden_lotus"]},
  {name:"蛟龙巢穴", desc:"一处蛟龙曾经栖息的洞穴，散发着淡淡龙威。", expBonus:1500, stoneBonus:800, itemChance:0.5, itemPool:["dragon_blood","dragon_scale_armor"]},
  {name:"星辰陨落之地", desc:"一颗星辰陨落之处，残留着星辰之力。", expBonus:2000, stoneBonus:1500, itemChance:0.4, itemPool:["star_sand","star_gu"]},
];

// ===== 任务系统 =====
const QUESTS = {
  // 主线任务
  "main_start": {name:"初入仙途", desc:"加入七玄门，开始你的修仙之路。", type:"main", target:"加入七玄门", checkFn:"checkSevenProfound"},
  "main_foundation": {name:"筑基之志", desc:"提升修为至筑基期。", type:"main", target:"修为达到筑基期", reqStage:1},
  "main_tiannan": {name:"天南历练", desc:"前往天南坊市城探索，结交修士。", type:"main", target:"到达天南坊市城", areas:["天南坊市城","黄枫谷","长安城","太南谷"]},
  "main_core": {name:"结丹之路", desc:"提升修为至结丹期。", type:"main", target:"修为达到结丹期", reqStage:2},
  "main_luanxing": {name:"星海之行", desc:"前往乱星海探索。", type:"main", target:"到达乱星海"},
  "main_infant": {name:"元婴出窍", desc:"提升修为至元婴期。", type:"main", target:"修为达到元婴期", reqStage:3},
  "main_ascension": {name:"飞升灵界", desc:"突破化神期，准备飞升灵界。", type:"main", target:"修为达到化神期", reqStage:4},

  // 支线任务
  "side_first_kill": {name:"初试锋芒", desc:"在野外击败一个敌人。", type:"side", target:"野外击杀1个敌人", checkFn:"checkWildKill1"},
  "side_explorer": {name:"探索者", desc:"探索野外10次。", type:"side", target:"探索10次", checkFn:"checkExplore10"},
  "side_farmer": {name:"灵农初成", desc:"种植并收获一株灵草。", type:"side", target:"收获1次灵草", checkFn:"checkFarm1"},
  "side_npc_friend": {name:"广结善缘", desc:"与3名NPC修士结为好友。", type:"side", target:"结交3名NPC", checkFn:"checkNpcFriend3"},
  "side_npc_kill": {name:"杀伐果决", desc:"击败1名NPC修士。", type:"side", target:"击败1名NPC", checkFn:"checkNpcKill1"},
  "side_steal": {name:"妙手空空", desc:"成功偷窃1名NPC修士。", type:"side", target:"偷窃成功1次", checkFn:"checkSteal1"},
  "side_rich": {name:"富甲一方", desc:"拥有5000灵石。", type:"side", target:"拥有5000灵石", checkFn:"checkRich5k"},
  "side_town_visit": {name:"行万里路", desc:"访问5个不同的城镇。", type:"side", target:"访问5个城镇", checkFn:"checkTownVisit5"},
  "side_gu_collect": {name:"蛊道初成", desc:"收集3只不同的仙蛊。", type:"side", target:"拥有3只仙蛊", checkFn:"checkGuCollect3"},
  "side_companion_2": {name:"红颜知己", desc:"结交2位道侣。", type:"side", target:"拥有2位道侣", checkFn:"checkCompanion2"},
};

// ===== NPC成就 =====
const NPC_ACHIEVEMENTS = {
  "npc_first_meet": {name:"萍水相逢", desc:"第一次与NPC修士交谈。", icon:"🤝"},
  "npc_first_friend": {name:"修仙有友", desc:"第一次与NPC修士结为好友。", icon:"👫"},
  "npc_first_steal": {name:"梁上君子", desc:"第一次成功偷窃NPC修士。", icon:"🥷"},
  "npc_first_kill": {name:"修仙界杀伐", desc:"第一次击杀NPC修士。", icon:"💀"},
  "npc_friend_10": {name:"广交天下", desc:"结交10名NPC修士好友。", icon:"🌍"},
  "npc_kill_5": {name:"杀神之名", desc:"击杀5名NPC修士。", icon:"☠️"},
  "cave_finder": {name:"洞天发现者", desc:"发现一处洞天福地。", icon:"🏔️"},
  "town_visitor": {name:"行万里路", desc:"访问5个不同的城镇。", icon:"🚶"},
};
Object.assign(ACHIEVEMENTS, NPC_ACHIEVEMENTS);
