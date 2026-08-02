/* ====== 凡人修仙传MUD · 扩展5数据（场所系统/任务/王朝/蛮夷/NPC分布） ====== */

// ===== 场所类型定义 =====
// 每种场所有: icon, npcRange(最少/最多NPC), actions(可执行动作), descBase
const PLACE_DEFS = {
  // --- 宗门/家族场所 ---
  sect_hall:        {icon:"\u{1F3DB}", npcRange:[3,8], actions:["quest","meet_leader"], descBase:"气势恢宏的主殿，是处理宗门大事之所。"},
  scripture_lib:    {icon:"\u{1F4DA}", npcRange:[2,5], actions:["learn","read"], descBase:"藏书丰富的经阁，藏有无数功法典籍。"},
  training_ground:  {icon:"\u2694\uFE0F", npcRange:[3,8], actions:["spar","train"], descBase:"弟子们日常修炼切磋的场所。"},
  alchemy_room:     {icon:"\u2697\uFE0F", npcRange:[1,4], actions:["alchemy","buy_pill"], descBase:"丹炉日夜不息，药香四溢。"},
  herb_garden:     {icon:"\u{1F33F}", npcRange:[1,3], actions:["gather_herb"], descBase:"种植各种灵药的园圃。"},
  treasure_pav:    {icon:"\u{1F48E}", npcRange:[1,3], actions:["exchange"], descBase:"存放宗门宝物的阁楼。"},
  disciple_quart:  {icon:"\u{1F3E0}", npcRange:[5,10], actions:["meet"], descBase:"弟子们居住的区域。"},
  back_mountain:   {icon:"\u26F0\uFE0F", npcRange:[2,5], actions:["explore","dungeon"], descBase:"宗门后山，隐藏着秘境和妖兽。"},
  ancestor_hall:   {icon:"\u{1F3AB}", npcRange:[1,3], actions:["pray","quest"], descBase:"供奉历代先祖的祠堂。"},
  mission_hall:    {icon:"\u{1F4CB}", npcRange:[2,5], actions:["quest"], descBase:"领取宗门任务的场所。"},

  // --- 城镇场所 ---
  residential:     {icon:"\u{1F3DE}\uFE0F", npcRange:[1,3], actions:["meet"], descBase:"普通百姓居住的民居区。"},
  gov_office:      {icon:"\u2696\uFE0F", npcRange:[2,5], actions:["quest","report"], descBase:"官府办公之地，处理民间纠纷。"},
  academy:         {icon:"\u{1F4D6}", npcRange:[2,5], actions:["learn","exam"], descBase:"书声琅琅的学府，可求学问道。"},
  market:          {icon:"\u{1F3EA}", npcRange:[3,8], actions:["trade","meet"], descBase:"热闹的市集，商贩云集。"},
  inn:             {icon:"\u{1F6CF}\uFE0F", npcRange:[2,5], actions:["rest","rumor"], descBase:"供旅人歇息的客栈。"},
  teahouse:        {icon:"\u{1F375}", npcRange:[3,6], actions:["rumor","meet"], descBase:"茶客云集，消息灵通之地。"},
  temple:          {icon:"\u26E9\uFE0F", npcRange:[1,4], actions:["pray","blessing"], descBase:"香火鼎盛的庙宇。"},
  city_gate:       {icon:"\u{1F310}", npcRange:[2,4], actions:["guard","meet"], descBase:"城门口守卫森严。"},
  dock:             {icon:"\u26F3", npcRange:[2,5], actions:["trade","meet"], descBase:"船只来往的码头。"},
  arena:           {icon:"\u{1F3C5}", npcRange:[3,6], actions:["spar","watch"], descBase:"修士切磋比武的擂台。"},

  // --- 王朝(大唐)场所 ---
  imperial_palace: {icon:"\u{1F3F0}", npcRange:[3,8], actions:["audience","quest"], descBase:"金碧辉煌的皇宫，天子理政之所。"},
  ministry_war:   {icon:"\u{1F5E1}\uFE0F", npcRange:[2,5], actions:["quest","enlist"], descBase:"兵部衙门，掌管天下兵马调度。"},
  ministry_person: {icon:"\u{1F4DC}", npcRange:[2,5], actions:["exam","quest"], descBase:"吏部衙门，掌管官员任免考核。"},
  exam_hall:       {icon:"\u270D\uFE0F", npcRange:[1,3], actions:["exam"], descBase:"科举考场，学子们鱼跃龙门之地。"},
  main_street:     {icon:"\u{1F6E3}\uFE0F", npcRange:[3,8], actions:["trade","meet"], descBase:"宽阔繁华的大街，商铺林立。"},
  barracks:        {icon:"\u{1FA96}", npcRange:[3,8], actions:["quest","spar"], descBase:"军营，兵甲森严。"},
  grand_temple:    {icon:"\u{1F3D8}\uFE0F", npcRange:[2,5], actions:["pray","blessing","quest"], descBase:"皇家大寺，梵音阵阵。"},

  // --- 蛮夷/小国场所 ---
  chief_tent:      {icon:"\u26FA", npcRange:[2,5], actions:["quest","trade"], descBase:"酋长的营帐，部族权力中心。"},
  shaman_altar:   {icon:"\u{1F52E}", npcRange:[1,3], actions:["ritual","blessing"], descBase:"萨满祭祀的神秘祭坛。"},
  pasture:         {icon:"\u{1F40E}", npcRange:[2,5], actions:["meet","trade"], descBase:"辽阔的牧场，牛羊成群。"},
  warrior_pit:    {icon:"\u{1FA94}", npcRange:[3,6], actions:["spar","quest"], descBase:"蛮族战士的训练坑。"},
  trade_post:     {icon:"\u{1F6D5}", npcRange:[2,5], actions:["trade"], descBase:"边贸互市，各色货物汇聚。"},
  shrine:         {icon:"\u26E9\uFE0F", npcRange:[1,3], actions:["pray"], descBase:"蛮荒之地的原始神祠。"},
};

// ===== 各地点拥有的场所配置 =====
// key = WORLD_MAP的key, value = 场所类型列表
const LOCATION_PLACES = {
  // 宗门/集镇
  "七玄门集镇": ["sect_hall","scripture_lib","training_ground","alchemy_room","herb_garden","disciple_quart","back_mountain","mission_hall","residential","market","inn"],
  "黄枫谷": ["sect_hall","scripture_lib","training_ground","alchemy_room","herb_garden","disciple_quart","back_mountain","mission_hall"],
  // 城镇
  "天南坊市城": ["residential","gov_office","academy","market","inn","teahouse","temple","arena","city_gate"],
  "长安城": ["imperial_palace","ministry_war","ministry_person","exam_hall","main_street","barracks","grand_temple","residential","inn","teahouse","market","arena"],
  "太南谷": ["residential","market","inn","teahouse","temple","academy","alchemy_room","herb_garden"],
  "乱星海渡口": ["residential","market","inn","teahouse","dock","temple"],
  // 遗迹
  "虚天殿": ["back_mountain","temple"],
  // 草原/战区
  "慕兰草原": ["chief_tent","shaman_altar","pasture","warrior_pit","trade_post"],
  // 坠魔谷
  "坠魔谷": ["shrine","back_mountain"],
  // 灵界
  "灵界": ["sect_hall","scripture_lib","training_ground","treasure_pav","disciple_quart","market","inn"],
  // 仙界
  "仙界": ["imperial_palace","scripture_lib","treasure_pav","disciple_quart","market","inn","grand_temple"],
};

// ===== 场所名称覆盖（特殊宗门/地点用不同名称） =====
const PLACE_NAME_OVERRIDES = {
  "七玄门集镇": {
    sect_hall:"七玄门主殿", scripture_lib:"藏经阁", training_ground:"演武场",
    alchemy_room:"炼丹房", herb_garden:"七玄药圃", back_mountain:"后山密林",
    mission_hall:"任务堂", residential:"集镇民居", market:"集镇集市", inn:"集镇客栈",
  },
  "黄枫谷": {
    sect_hall:"黄枫谷主殿", scripture_lib:"万木经阁", training_ground:"灵木演武场",
    alchemy_room:"灵药园", herb_garden:"黄枫药圃", back_mountain:"灵木林",
    mission_hall:"任务堂",
  },
  "天南坊市城": {
    residential:"坊市民居", gov_office:"坊市店", academy:"云溪书院",
    market:"坊市广场", inn:"仙踪客栈", teahouse:"听雨茶楼",
    temple:"城隍庙", arena:"斗法场", city_gate:"南城门",
  },
  "长安城": {
    imperial_palace:"大明宫", ministry_war:"兵部衙门", ministry_person:"吏部衙门",
    exam_hall:"科举考场", main_street:"朱雀大街", barracks:"禁军大营",
    grand_temple:"大慈恩寺", residential:"长安民居", inn:"长安客栈",
    teahouse:"聚贤茶楼", market:"东市", arena:"校场",
  },
  "太南谷": {
    residential:"谷民居", market:"谷中集市", inn:"幽谷客栈",
    teahouse:"清心茶舍", temple:"灵泉庙", academy:"太南书院",
    alchemy_room:"太南丹房", herb_garden:"灵草园",
  },
  "乱星海渡口": {
    residential:"渔民街", market:"海港商街", inn:"海风客栈",
    teahouse:"海鲜茶楼", dock:"乱星码头", temple:"海神庙",
  },
  "灵界": {
    sect_hall:"天宗封魔殿", scripture_lib:"万灵藏书阁", training_ground:"灵界演武场",
    treasure_pav:"灵宝阁", market:"灵界集市", inn:"仙云楼",
  },
  "仙界": {
    imperial_palace:"仙宫", scripture_lib:"天书阁", treasure_pav:"天宝阁",
    market:"仙市", inn:"瑶池宫", grand_temple:"天宫",
  },
};

// ===== 城镇/地点副本定义（用于直接进入副本） =====
// 对应WORLD_MAP中每个地点的副本
const LOCATION_DUNGEON_DEFS = {
  "七玄门集镇": {name:"七玄门后山秘境", desc:"七玄门后山隐藏的小型秘境，有低阶妖兽出没。", reqStage:0, enemyLv:0, rewards:["healing_pill","qi_pill","spirit_grass","iron_sword"]},
  "黄枫谷": {name:"灵木林秘境", desc:"黄枫谷灵木林深处的秘境，有木系妖兽。", reqStage:0, enemyLv:1, rewards:["healing_pill","qi_pill","foundation_pill","wood_staff"]},
  "天南坊市城": {name:"地下古墓", desc:"城下发现的上古墓道，藏有古修士遗宝。", reqStage:0, enemyLv:1, rewards:["healing_pill","qi_pill","foundation_pill","spirit_grass","iron_sword"]},
  "长安城": {name:"禁寺地宫", desc:"长安城下的古老地宫遗迹，藏有历代宝物。", reqStage:0, enemyLv:2, rewards:["healing_pill","foundation_pill","spirit_grass","ancient_sword","gold_ingot"]},
  "太南谷": {name:"幽冥涧秘境", desc:"太南谷外幽冥涧，阴气森森，鬼修出没。", reqStage:0, enemyLv:1, rewards:["healing_pill","foundation_pill","spirit_grass","iron_sword","leather_armor"]},
  "乱星海渡口": {name:"海底遗迹", desc:"乱星海海底的古老遗迹，有海兽巡逻。", reqStage:1, enemyLv:2, rewards:["healing_pill","qi_pill","foundation_pill","water_armor","sea_crystal"]},
  "乱星海": {name:"深海密境", desc:"乱星海深处的海底密境，海兽横行。", reqStage:1, enemyLv:3, rewards:["foundation_pill","core_formation_pill","sea_crystal","star_sand","water_armor"]},
  "虚天殿": {name:"虚天秘境", desc:"虚天殿内部的秘境，藏宝无数也凶险万分。", reqStage:2, enemyLv:3, rewards:["core_formation_pill","infant_formation_pill","void_crystal","ancient_sword","star_sand"]},
  "慕兰草原": {name:"慕兰古战场", desc:"古战场遗迹，残留着上古战意。", reqStage:2, enemyLv:3, rewards:["core_formation_pill","breakthrough_pill","ancient_sword","warhorse_soul"]},
  "坠魔谷": {name:"魔气深渊", desc:"坠魔谷最深处的魔气深渊，古魔气息弥漫。", reqStage:3, enemyLv:4, rewards:["infant_formation_pill","breakthrough_pill","demon_crystal","demon_sword","void_crystal"]},
  "灵界": {name:"万灵秘境", desc:"灵界的高阶秘境，灵气充沛。", reqStage:4, enemyLv:5, rewards:["infant_formation_pill","breakthrough_pill","spirit_crystal","void_crystal","ancient_sword"]},
  "仙界": {name:"混沌仙境", desc:"仙界的至高秘境，藏有天材地宝。", reqStage:8, enemyLv:7, rewards:["immortal_pill","void_crystal","ancient_sword","immortal_crystal","celestial_herb"]},
};

// ===== 地点任务定义 =====
// 任务类型: defeat_traitor(击败叛徒), submit_material(提交材料), check_location(检查地点)
const LOCATION_QUEST_POOL = [
  // 击败叛徒类
  {type:"defeat_traitor", title:"\u7ED4\u62FF\u53DB\u5F92", desc:"\u4E00\u540D\u53DB\u9003\u7684\u5F92\u5F1F\u85CF\u533F\u4E8E\u9644\u8FD1\uFF0C\u5C06\u5176\u51FB\u8D25\u4EE5\u636E\u3002", minStage:0, rewardStones:200, rewardExp:150, rewardItem:"healing_pill"},
  {type:"defeat_traitor", title:"\u6E05\u9664\u9B54\u4FEE", desc:"\u6709\u9B54\u4FEE\u6F5C\u5165\u9644\u8FD1\uFF0C\u9700\u5C06\u5176\u65A9\u6740\u3002", minStage:1, rewardStones:500, rewardExp:300, rewardItem:"foundation_pill"},
  {type:"defeat_traitor", title:"\u7F5A\u6749\u51B6\u7F6A\u6D6E", desc:"\u4E00\u540D\u8D1F\u6848\u5728\u9006\u7684\u4FEE\u58EB\u85CF\u533F\u4E8E\u6B64\uFF0C\u6C42\u9053\u53CB\u52A9\u6211\u6E05\u7406\u95E8\u6237\u3002", minStage:0, rewardStones:300, rewardExp:200, rewardItem:"qi_pill"},
  {type:"defeat_traitor", title:"\u8FFD\u6740\u901A\u7F09\u72AF", desc:"\u5B98\u5E9C\u901A\u7F09\u4E00\u540D\u91CD\u8D1F\u6848\u5728\u9006\uFF0C\u6B3B\u8D44\u91D1\u4E30\u539A\u3002", minStage:0, rewardStones:400, rewardExp:200, rewardItem:"iron_sword"},
  // 提交材料类
  {type:"submit_material", title:"\u91C7\u96C6\u7075\u8349", desc:"\u7EC3\u529F\u623F\u9700\u8981\u4E0A\u7B49\u7075\u8349\u70BC\u5236\u4E39\u836F\uFF0C\u8BF7\u52A9\u91C7\u96C63\u682A\u3002", minStage:0, requiredItem:"spirit_grass", requiredCount:3, rewardStones:150, rewardExp:100, rewardItem:"healing_pill"},
  {type:"submit_material", title:"\u7B79\u5907\u7075\u77F3", desc:"\u5EFA\u8BBE\u6CD5\u9635\u9700\u8981\u5927\u91CF\u7075\u77F3\uFF0C\u8BF7\u52A9\u52D9\u96C6\u7075\u77F3\u3002", minStage:0, requiredItem:"spirit_stone", requiredCount:5, rewardStones:300, rewardExp:100, rewardItem:"qi_pill"},
  {type:"submit_material", title:"\u732E\u4E0A\u94C1\u77FF", desc:"\u70BC\u5668\u574A\u9700\u8981\u94C1\u77FF\u7740\u706C\u70BC\u5236\u6CD5\u5668\uFF0C\u8BF7\u52A9\u52D8\u91C7\u94C1\u77FF\u3002", minStage:0, requiredItem:"iron_ore", requiredCount:3, rewardStones:200, rewardExp:120, rewardItem:"iron_sword"},
  {type:"submit_material", title:"\u6536\u96C6\u5996\u517D\u76AE", desc:"\u70BC\u5236\u9632\u5177\u9700\u8981\u5996\u517D\u76AE\uFF0C\u8BF7\u52A9\u730E\u67405\u5F20\u5996\u517D\u76AE\u3002", minStage:0, requiredItem:"beast_pelt", requiredCount:5, rewardStones:250, rewardExp:150, rewardItem:"leather_armor"},
  // 检查地点类
  {type:"check_location", title:"\u5DE1\u67E5\u8352\u91CE", desc:"\u6700\u8FD1\u57CE\u5916\u8352\u91CE\u4E2D\u602A\u4E8B\u9891\u53D1\uFF0C\u8BF7\u524D\u5F80\u67E5\u770B\u60C5\u51B5\u3002", minStage:0, targetLocation:"\u5929\u5357\u574A\u5E02\u57CE", rewardStones:200, rewardExp:150, rewardItem:"healing_pill"},
  {type:"check_location", title:"\u63A2\u67E5\u53E4\u8FF9", desc:"\u9644\u8FD1\u53D1\u73B0\u4E86\u53E4\u4FEE\u58EB\u9057\u8FF9\uFF0C\u8BF7\u524D\u5F80\u67E5\u770B\u3002", minStage:1, targetLocation:"\u865A\u5929\u6BBF", rewardStones:400, rewardExp:300, rewardItem:"foundation_pill"},
  {type:"check_location", title:"\u524D\u5F80\u6D77\u6E2F", desc:"\u6D77\u6E2F\u51FA\u73B0\u6D77\u517D\uFF0C\u8BF7\u524D\u5F80\u67E5\u770B\u3002", minStage:1, targetLocation:"\u4E71\u661F\u6D77\u6E21\u53E3", rewardStones:300, rewardExp:200, rewardItem:"qi_pill"},
  {type:"check_location", title:"\u4FA6\u67E5\u8349\u539F", desc:"\u6155\u5170\u8349\u539F\u6709\u5F02\u52A8\uFF0C\u8BF7\u524D\u5F80\u4FA6\u67E5\u3002", minStage:2, targetLocation:"\u6155\u5170\u8349\u539F", rewardStones:500, rewardExp:400, rewardItem:"foundation_pill"},
  {type:"check_location", title:"\u63A2\u7D22\u5760\u9B54\u8C37", desc:"\u5760\u9B54\u8C37\u6709\u5F02\u52A8\uFF0C\u8BF7\u524D\u5F80\u63A2\u67E5\u3002", minStage:3, targetLocation:"\u5760\u9B54\u8C37", rewardStones:800, rewardExp:600, rewardItem:"core_formation_pill"},
];

// ===== 新增世界地图地点 =====
// 注：长安城已由 worlddata.js 统一定义（含王朝建筑与副本区域），此处不再重复定义
const NEW_WORLD_MAP_ENTRIES = {
  "\u6D1B\u9633\u57CE": {name:"\u6D1B\u9633\u57CE", x:55, y:30, type:"city", desc:"\u5927\u5510\u4E1C\u90FD\uFF0C\u7E41\u534E\u4E0D\u8F93\u957F\u5B89\u3002", reqStage:0,
    subAreas:["\u6D1B\u9633\u5BAB","\u8001\u57CE\u533A","\u9F99\u95E8\u77F3\u7A9F","\u6D1B\u6C34\u6E2F"],
    connections:["\u957F\u5B89\u57CE","\u4E1C\u6FD1\u6276\u6851"]},
  "\u5317\u72C4\u8349\u539F": {name:"\u5317\u72C4\u8349\u539F", x:35, y:15, type:"warzone", desc:"\u5317\u65B9\u86EE\u5937\u4E4B\u5730\uFF0C\u8349\u539F\u8FBE\u5343\u91CC\uFF0C\u94C1\u9A91\u5954\u7A81\u3002", reqStage:0,
    subAreas:["\u914B\u957F\u5927\u5E10","\u8428\u6EE1\u796D\u575B","\u8349\u539F\u7267\u573A","\u8FC5\u72C4\u8BAD\u7EC3\u573A"],
    connections:["\u957F\u5B89\u57CE","\u6155\u5170\u8349\u539F"]},
  "\u5357\u86EE\u4E1B\u6797": {name:"\u5357\u86EE\u4E1B\u6797", x:50, y:50, type:"danger", desc:"\u5357\u65B9\u86EE\u8352\u4E4B\u5730\uFF0C\u6BD2\u866B\u904D\u5E03\uFF0C\u86EE\u65CF\u5404\u5F02\u3002", reqStage:1,
    subAreas:["\u86EE\u738B\u6D1E","\u5DEB\u796D\u575B","\u6BD2\u8CAB\u8C37","\u86EE\u8352\u7EC3\u529F\u5730"],
    connections:["\u957F\u5B89\u57CE","\u5760\u9B54\u8C37"]},
  "\u4E1C\u6FD1\u6276\u6851": {name:"\u4E1C\u6FD1\u6276\u6851", x:85, y:35, type:"city", desc:"\u4E1C\u6D77\u4E4B\u4E0A\u7684\u5C9B\u56FD\uFF0C\u6B66\u58EB\u4E91\u96C6\uFF0C\u5F02\u56FD\u60C5\u8C03\u3002", reqStage:1,
    subAreas:["\u5C06\u519B\u5E9C","\u795E\u793E","\u9053\u573A","\u6E2F\u53E3\u753A"],
    connections:["\u6D1B\u9633\u57CE","\u4E71\u661F\u6D77\u6E21\u53E3"]},
  "\u897F\u57DF\u8BF8\u56FD": {name:"\u897F\u57DF\u8BF8\u56FD", x:15, y:35, type:"city", desc:"\u897F\u57DF\u4E09\u5341\u516D\u56FD\uFF0C\u6C99\u6F20\u4E2D\u7684\u7EFF\u6D32\u4E0E\u4F5B\u56FD\u3002", reqStage:1,
    subAreas:["\u56FD\u4E3B\u5E9C","\u4F5B\u5BFA","\u96C6\u5E02","\u7EFF\u6D32"],
    connections:["\u957F\u5B89\u57CE","\u7075\u754C\u5165\u53E3"]},
};

// ===== 新增城镇定义 =====
// 注：长安城已由 worlddata.js TOWNS 统一定义，此处不再重复定义
const NEW_TOWN_ENTRIES = {
  "\u6D1B\u9633\u57CE": {
    name:"\u6D1B\u9633\u57CE", region:"\u6D1B\u9633\u57CE", desc:"\u5927\u5510\u4E1C\u90FD\uFF0C\u7E41\u534E\u4E0D\u8F93\u957F\u5B89\u3002", reqStage:0,
    shops:["\u4E39\u836F\u94FA","\u5175\u5668\u94FA","\u9632\u5177\u94FA","\u6742\u8D27\u94FA","\u5BA2\u6808","\u8336\u9986"],
  },
  "\u4E1C\u6FD1\u6276\u6851": {
    name:"\u4E1C\u6FD1\u6276\u6851", region:"\u4E1C\u6FD1\u6276\u6851", desc:"\u4E1C\u6D77\u4E4B\u4E0A\u7684\u5C9B\u56FD\uFF0C\u6B66\u58EB\u4E91\u96C6\uFF0C\u5F02\u56FD\u60C5\u8C03\u3002", reqStage:1,
    shops:["\u4E39\u836F\u94FA","\u5175\u5668\u94FA","\u9632\u5177\u94FA","\u6742\u8D27\u94FA","\u5BA2\u6808","\u8336\u9986"],
  },
  "\u897F\u57DF\u8BF8\u56FD": {
    name:"\u897F\u57DF\u8BF8\u56FD", region:"\u897F\u57DF\u8BF8\u56FD", desc:"\u897F\u57DF\u4E09\u5341\u516D\u56FD\uFF0C\u6C99\u6F20\u4E2D\u7684\u7EFF\u6D32\u4E0E\u4F5B\u56FD\u3002", reqStage:1,
    shops:["\u4E39\u836F\u94FA","\u5175\u5668\u94FA","\u6742\u8D27\u94FA","\u5BA2\u6808","\u8336\u9986"],
  },
};

// ===== 长安城场所配置（特殊） =====
const DYNASTY_PLACE_MAP = {
  "\u957F\u5B89\u57CE": ["imperial_palace","ministry_war","ministry_person","exam_hall","main_street","barracks","grand_temple","residential","inn","teahouse"],
  "\u6D1B\u9633\u57CE": ["gov_office","academy","market","residential","inn","teahouse","temple","arena"],
};

// ===== 蛮夷场所配置 =====
const BARBARIAN_PLACE_MAP = {
  "\u5317\u72C4\u8349\u539F": ["chief_tent","shaman_altar","pasture","warrior_pit","trade_post"],
  "\u5357\u86EE\u4E1B\u6797": ["chief_tent","shaman_altar","warrior_pit","shrine"],
  "\u4E1C\u6FD1\u6276\u6851": ["chief_tent","shaman_altar","warrior_pit","trade_post","inn"],
  "\u897F\u57DF\u8BF8\u56FD": ["chief_tent","shrine","trade_post","pasture","inn"],
};

// ===== 王朝(大唐)官员体系 =====
const DYNASTY_OFFICIALS = {
  emperor:   {title:"\u7687\u5E1D", cultLevel:5, desc:"\u5929\u5B50\u4E4B\u5C0A\uFF0C\u638C\u5929\u4E0B\u4E4B\u6743\u3002", mood:0},
  prince:    {title:"\u4EB2\u738B", cultLevel:3, desc:"\u7687\u65CF\u5B97\u5BA4\uFF0C\u5730\u4F4D\u5C0A\u8D35\u3002", mood:20},
  minister:  {title:"\u4E1E\u76F8", cultLevel:3, desc:"\u767E\u5B98\u4E4B\u9996\uFF0C\u6743\u503E\u5929\u4E0B\u3002", mood:10},
  general:   {title:"\u5927\u5C06\u519B", cultLevel:4, desc:"\u7EDF\u5E05\u5929\u4E0B\u5175\u9A6C\uFF0C\u6218\u529F\u8D6B\u8D6B\u3002", mood:15},
  minister_war: {title:"\u5175\u90E8\u5C1A\u4E66", cultLevel:2, desc:"\u638C\u7BA1\u5175\u9A6C\u8C03\u5EA6\u3002", mood:10},
  minister_person: {title:"\u540F\u90E8\u5C1A\u4E66", cultLevel:2, desc:"\u638C\u7BA1\u5B98\u5458\u4EFB\u514D\u8003\u6838\u3002", mood:10},
  prefect:   {title:"\u5DDE\u523A\u53F2", cultLevel:1, desc:"\u4E00\u5DDE\u4E4B\u957F\uFF0C\u6C11\u653F\u957F\u5B98\u3002", mood:15},
  magistrate: {title:"\u53BF\u4EE4", cultLevel:0, desc:"\u4E00\u53BF\u4E4B\u957F\uFF0C\u4EB2\u6C11\u4E4B\u5B98\u3002", mood:20},
  guard_captain: {title:"\u7981\u519B\u7EDF\u9886", cultLevel:1, desc:"\u7981\u519B\u5C06\u9886\uFF0C\u62A4\u536B\u4EAC\u57CE\u3002", mood:15},
  scholar:   {title:"\u592A\u5B66\u5B66\u58EB", cultLevel:0, desc:"\u592A\u5B66\u4E2D\u7684\u5B66\u8005\uFF0C\u535A\u5B66\u591A\u624D\u3002", mood:30},
  guard:     {title:"\u57CE\u95E8\u5B88\u536B", cultLevel:0, desc:"\u57CE\u95E8\u5B88\u536B\uFF0C\u76D7\u8D44\u51FA\u8EAB\u3002", mood:25},
  merchant:  {title:"\u5BCC\u8D3E\u5546\u4EBA", cultLevel:0, desc:"\u5BCC\u7532\u4E00\u65B9\uFF0C\u8D22\u529B\u96C4\u539A\u3002", mood:20},
};

// ===== 蛮夷NPC体系 =====
const BARBARIAN_NPC_TYPES = {
  "\u5317\u72C4\u8349\u539F": {
    chieftain: {title:"\u914B\u957F", cultLevel:2, desc:"\u90E8\u65CF\u4E4B\u9996\u9886\u3002", mood:0},
    shaman: {title:"\u8428\u6EE1\u5DEB\u5E08", cultLevel:2, desc:"\u90E8\u65CF\u7684\u7CBE\u795E\u9886\u8896\u3002", mood:10},
    warrior: {title:"\u72C4\u9A91\u5175", cultLevel:1, desc:"\u9A91\u5C04\u7CBE\u6E5B\uFF0C\u6218\u6597\u529B\u5F3A\u3002", mood:15},
    herdsman: {title:"\u7267\u6C11", cultLevel:-1, desc:"\u8349\u539F\u4E0A\u7684\u7267\u6C11\u3002", mood:30},
  },
  "\u5357\u86EE\u4E1B\u6797": {
    chieftain: {title:"\u86EE\u738B", cultLevel:3, desc:"\u5404\u90E8\u86EE\u65CF\u7684\u738B\u8005\u3002", mood:0},
    shaman: {title:"\u5DEB\u5E08", cultLevel:2, desc:"\u64CD\u7EB5\u6BD2\u866B\u7684\u5DEB\u5E08\u3002", mood:10},
    warrior: {title:"\u86EE\u65CF\u6218\u58EB", cultLevel:1, desc:"\u8EAB\u4E0A\u6BD2\u866B\u7684\u86EE\u65CF\u6218\u58EB\u3002", mood:15},
    hunter: {title:"\u730E\u4EBA", cultLevel:0, desc:"\u4E1B\u6797\u4E2D\u7684\u730E\u4EBA\u3002", mood:25},
  },
  "\u4E1C\u6FD1\u6276\u6851": {
    chieftain: {title:"\u5C06\u519B", cultLevel:3, desc:"\u6276\u6851\u4E4B\u4E3B\uFF0C\u638C\u63E1\u5929\u4E0B\u5927\u6743\u3002", mood:0},
    shaman: {title:"\u795E\u5B98", cultLevel:2, desc:"\u795E\u793E\u7684\u7CBE\u795E\u9886\u8896\u3002", mood:10},
    warrior: {title:"\u6B66\u58EB", cultLevel:1, desc:"\u4EE5\u6B66\u529B\u4E3A\u751F\u7684\u6218\u6597\u8005\u3002", mood:15},
    merchant: {title:"\u5546\u4EBA", cultLevel:0, desc:"\u6E2F\u53E3\u7684\u5546\u4EBA\u3002", mood:25},
  },
  "\u897F\u57DF\u8BF8\u56FD": {
    chieftain: {title:"\u56FD\u4E3B", cultLevel:3, desc:"\u897F\u57DF\u5C0F\u56FD\u7684\u56FD\u4E3B\u3002", mood:0},
    shaman: {title:"\u9AD8\u50E7", cultLevel:2, desc:"\u4F5B\u6CD5\u9AD8\u6DF1\u7684\u9AD8\u50E7\u3002", mood:15},
    warrior: {title:"\u62A4\u536B", cultLevel:1, desc:"\u4F5B\u5BFA\u62A4\u536B\u3002", mood:20},
    merchant: {title:"\u4E1D\u7EE8\u5546\u4EBA", cultLevel:0, desc:"\u4E1D\u7EE8\u4E4B\u8DEF\u4E0A\u7684\u5546\u4EBA\u3002", mood:25},
  },
};

// ===== 合并到全局 =====
Object.assign(WORLD_MAP, NEW_WORLD_MAP_ENTRIES);
Object.assign(TOWNS, NEW_TOWN_ENTRIES);

// ===== 更新现有地点的连接，使新地点可从世界地图导航到达 =====
// 注：天南坊市城已在 worlddata.js 中包含长安城连接，此处跳过避免重复
if (WORLD_MAP["\u6155\u5170\u8349\u539F"]) {
  WORLD_MAP["\u6155\u5170\u8349\u539F"].connections.push("\u5317\u72C4\u8349\u539F");
}
if (WORLD_MAP["\u5760\u9B54\u8C37"]) {
  WORLD_MAP["\u5760\u9B54\u8C37"].connections.push("\u5357\u86EE\u4E1B\u6797");
}
if (WORLD_MAP["\u4E71\u661F\u6D77\u6E21\u53E3"]) {
  WORLD_MAP["\u4E71\u661F\u6D77\u6E21\u53E3"].connections.push("\u4E1C\u6FD1\u6276\u6851");
}
if (WORLD_MAP["\u7075\u754C\u5165\u53E3"]) {
  WORLD_MAP["\u7075\u754C\u5165\u53E3"].connections.push("\u897F\u57DF\u8BF8\u56FD");
}

// ===== 补充缺失的物品定义 =====
Object.assign(ITEMS, {
  // 材料类
  "iron_ore": {name:"\u94C1\u77FF\u77F3", type:"material", desc:"\u70BC\u5668\u57FA\u7840\u6750\u6599\uFF0C\u53EF\u70BC\u5236\u4F4E\u9636\u6CD5\u5668\u3002"},
  "beast_pelt": {name:"\u5996\u517D\u76AE", type:"material", desc:"\u5996\u517D\u7684\u76AE\u6BDB\uFF0C\u70BC\u5236\u9632\u5177\u7684\u6750\u6599\u3002"},
  "gold_ingot": {name:"\u91D1\u952D", type:"material", desc:"\u51E1\u4EBA\u4E16\u754C\u7684\u91D1\u5757\uFF0C\u5728\u671D\u5EF7\u4E2D\u53EF\u4F5C\u4E3A\u8D37\u5E01\u3002"},
  "warhorse_soul": {name:"\u6218\u9A6C\u4E4B\u9B42", type:"material", desc:"\u8349\u539F\u4E0A\u53E4\u6218\u9A6C\u7684\u9B42\u9B44\uFF0C\u70BC\u5236\u5750\u9A91\u6CD5\u5668\u7684\u73CD\u8D35\u6750\u6599\u3002"},
  "poison_herb": {name:"\u6BD2\u8349", type:"material", desc:"\u5357\u86EE\u4E1B\u6797\u4E2D\u7684\u6BD2\u8349\uFF0C\u70BC\u5236\u6BD2\u4E39\u7684\u539F\u6599\u3002"},
  "healing_herb": {name:"\u7597\u4F24\u8349", type:"material", desc:"\u91CE\u751F\u7684\u7597\u4F24\u8349\u836F\uFF0C\u53EF\u5165\u836F\u3002"},
  "qi_herb": {name:"\u805A\u7075\u8349", type:"material", desc:"\u91CE\u751F\u7684\u805A\u7075\u8349\u836F\uFF0C\u53EF\u5165\u836F\u3002"},
  "sea_crystal": {name:"\u6D77\u6676", type:"material", desc:"\u4E71\u661F\u6D77\u6D77\u5E95\u7684\u6C34\u5C5E\u6027\u7075\u6676\uFF0C\u70BC\u5236\u6C34\u7CFB\u6CD5\u5668\u7684\u6750\u6599\u3002"},
  "void_crystal": {name:"\u865A\u5929\u6676", type:"material", desc:"\u865A\u5929\u6BBF\u4EA7\u51FA\u7684\u7A7A\u95F4\u5C5E\u6027\u7075\u6676\uFF0C\u6781\u4E3A\u7A00\u6709\u3002"},
  "demon_crystal": {name:"\u9B54\u6676", type:"material", desc:"\u5760\u9B54\u8C37\u4E2D\u7684\u9B54\u6C14\u51DD\u7ED3\u4F53\uFF0C\u70BC\u5236\u9B54\u9053\u6CD5\u5668\u7684\u6750\u6599\u3002"},
  "spirit_crystal": {name:"\u7075\u6676", type:"material", desc:"\u7075\u754C\u4EA7\u51FA\u7684\u9AD8\u7EA7\u7075\u77F3\uFF0C\u8574\u542B\u5DE8\u5927\u7075\u6C14\u3002"},
  "immortal_crystal": {name:"\u4ED9\u6676", type:"material", desc:"\u4ED9\u754C\u4EA7\u51FA\u7684\u81F3\u9AD8\u7075\u7269\uFF0C\u8574\u542B\u4ED9\u6C14\u3002"},
  "celestial_herb": {name:"\u5929\u6750\u5730\u5B9D", type:"material", desc:"\u4ED9\u754C\u7684\u5929\u7136\u7075\u836F\uFF0C\u4EF7\u503C\u8FDE\u57CE\u3002"},
  // 武器类
  "wood_staff": {name:"\u6728\u6756", type:"weapon", grade:1, atk:3, desc:"\u9EC4\u67AB\u8C37\u5F1F\u5B50\u5E38\u7528\u7684\u6728\u6756\uFF0C\u7075\u6728\u6240\u5236\u3002"},
  "ancient_sword": {name:"\u53E4\u5251", type:"weapon", grade:3, atk:35, desc:"\u53E4\u4FEE\u58EB\u9057\u7559\u7684\u53E4\u5251\uFF0C\u5176\u4E0A\u6B8B\u7559\u7740\u5251\u610F\u3002"},
  "katana": {name:"\u6256\u6851\u5200", type:"weapon", grade:3, atk:40, desc:"\u4E1C\u6FD1\u6276\u6851\u6240\u4F20\u7684\u6254\u5200\uFF0C\u5229\u843D\u5982\u98CE\u3002"},
  "demon_sword": {name:"\u9B54\u5251", type:"weapon", grade:4, atk:100, desc:"\u5760\u9B54\u8C37\u4E2D\u51FA\u571F\u7684\u9B54\u5251\uFF0C\u9B54\u6C14\u903C\u4EBA\u3002", mpCost:8},
  // 防具类
  "leather_armor": {name:"\u76AE\u7532", type:"armor", grade:1, def:5, desc:"\u5996\u517D\u76AE\u5236\u6210\u7684\u76AE\u7532\uFF0C\u8F7B\u4FBF\u5B9E\u7528\u3002"},
  "water_armor": {name:"\u6C34\u7075\u7532", type:"armor", grade:3, def:25, desc:"\u4EE5\u6D77\u6676\u70BC\u5236\u7684\u6C34\u5C5E\u6027\u6CD5\u7532\uFF0C\u80FD\u62B5\u5FA1\u6C34\u7CFB\u6CD5\u672F\u3002", mpCost:5},
  // 饰品类
  "buddha_bead": {name:"\u4F5B\u73E0", type:"accessory", grade:3, def:15, maxMp:50, desc:"\u897F\u57DF\u4F5B\u5BFA\u4E2D\u7684\u4F5B\u73E0\uFF0C\u53EF\u62A4\u8EAB\u5B89\u795E\u3002"},
});
