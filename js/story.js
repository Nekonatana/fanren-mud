/* ====== 凡人修仙传MUD · 剧情数据 ====== */
/* 每个节点包含: text(文本), choices(选项), enter(进入时效果), combat(战斗) */

const STORY = {
// ==================== 序章 ====================
"start":{
  chapter:"序章 · 七玄门",
  text:[
    {type:"chapter_title",content:"序 章 · 七 玄 门"},
    {type:"narration",content:"天南大陆，群山连绵。在偏远的青牛山中，有一座名为七玄门的小宗门。"},
    {type:"narration",content:"你叫韩立，今年十五岁，出身贫寒农家。三年前，因体格尚可，被选入七玄门做了外门弟子。"},
    {type:"narration",content:"七玄门虽是天南小派，却也传授修仙之法。只是你资质平庸，灵根驳杂，三年来仅练到练气一层，在同门中垫底。"},
    {type:"dialogue",content:"韩师弟，掌门师伯叫你去一趟正殿。」 ——一个师兄路过说道。"},
    {type:"thought",content:"掌门师伯找我？难道是要将我逐出山门？"},
    {type:"narration",content:"你心中忐忑，快步走向七玄门正殿。"},
  ],
  choices:[
    {text:"前往正殿",next:"meet_master"},
  ],
},

"meet_master":{
  chapter:"序章 · 七玄门",
  text:[
    {type:"narration",content:"正殿之上，七玄门掌门墨居仁端坐蒲团。他须发皆白，面容慈祥，却有一双洞察人心的眼睛。"},
    {type:"dialogue",content:"韩立，你入我七玄门三年，虽资质平庸，却勤勉刻苦，从不懈怠。为师看在眼里。"},
    {type:"dialogue",content:"如今门中有一桩机缘。天南第一大派黄枫谷，正在各小派中选拔有潜力的弟子前去修炼。我决定推荐你。"},
    {type:"thought",content:"黄枫谷？那可是天南赫赫有名的大派！"},
    {type:"dialogue",content:"不过……为师先要考校你一番。修仙之路，不只需要天赋，更需要心性与抉择。"},
    {type:"narration",content:"墨居仁手一翻，桌上出现一把精铁剑、一瓶丹药和一本泛黄的册子。"},
    {type:"dialogue",content:"三样东西，你选其一。此乃考验，选什么没有对错之分，只看你心之所向。"},
  ],
  choices:[
    {text:"拿起精铁剑 —— \"弟子愿以武入道。\"",next:"choice_martial",effect:{item:"iron_sword",atk:5}},
    {text:"拿起丹药瓶 —— \"弟子愿以丹道辅修。\"",next:"choice_pill",effect:{item:"healing_pill",count:3,luck:1}},
    {text:"拿起泛黄册子 —— \"弟子愿学更多知识。\"",next:"choice_book",effect:{item:"qi_pill",count:2,comp:1}},
  ],
},

"choice_martial":{
  text:[
    {type:"dialogue",content:"好！有志气。这把精铁剑便赐予你。记住，武者勇猛精进，但切记不可逞匹夫之勇。"},
    {type:"system_msg",content:"获得：精铁剑（武器 +5攻击）"},
    {type:"dialogue",content:"三日后，你便随为师前往黄枫谷。在此之前，去后山采药时留意些。最近有弟子说后山古洞中有异象。"},
  ],
  choices:[
    {text:"前往后山古洞探查",next:"find_bottle"},
    {text:"询问师伯门中是否有其他事",next:"side_quest_missing_sister",condition:{notQuestActive:"sq_missing_sister"}},
  ],
},
"choice_pill":{
  text:[
    {type:"dialogue",content:"嗯，丹道亦是修行。这瓶疗伤丹给你，日后炼丹路上或有大用。"},
    {type:"system_msg",content:"获得：疗伤丹×3"},
    {type:"dialogue",content:"三日后，你便随为师前往黄枫谷。在此之前，去后山采药时留意些。最近有弟子说后山古洞中有异象。"},
  ],
  choices:[{text:"前往后山古洞探查",next:"find_bottle"}],
},
"choice_book":{
  text:[
    {type:"dialogue",content:"哦？你选了这本《长春功》残卷。此功法虽不完整，却是上古功法残篇。慧眼如炬。"},
    {type:"system_msg",content:"获得：长春功（功法）、补气丹×2"},
    {type:"dialogue",content:"三日后，你便随为师前往黄枫谷。在此之前，去后山采药时留意些。最近有弟子说后山古洞中有异象。"},
  ],
  choices:[{text:"前往后山古洞探查",next:"find_bottle",effect:{technique:"changchun_gong"}}],
},

"find_bottle":{
  text:[
    {type:"chapter_title",content:"第 一 章 · 绿 瓶 之 缘"},
    {type:"narration",content:"后山古洞幽暗潮湿。你小心翼翼地摸索前行，忽然看到洞壁深处有微弱的绿色光芒。"},
    {type:"narration",content:"走近一看，是一个巴掌大小的绿色小瓶，通体碧绿，瓶口有古朴的纹路。你伸手将其拿起，一股清凉之意从掌心传遍全身。"},
    {type:"thought",content:"这是什么？似乎……是件宝物？"},
    {type:"system_msg",content:"✨ 获得神秘宝物：小绿瓶！"},
    {type:"narration",content:"你将小绿瓶收入怀中。突然，洞中传来一声低沉的吼叫——一头野猪妖冲了出来！"},
  ],
  choices:[{text:"拔剑迎战！",next:"combat_boar"}],
  enter:{item:"green_bottle",achievement:"bottle_owner",flag:"has_bottle"},
  combat:{enemy:"wild_boar",onWin:"after_boar",onLose:"death_boar"},
},

"combat_boar":{
  text:[
    {type:"danger",content:"野猪妖！双目赤红，獠牙锋利！"},
    {type:"system_msg",content:"战斗开始！"},
  ],
  choices:[{text:"战斗中……",next:"combat_boar"}],
},

"death_boar":{
  text:[
    {type:"danger",content:"你未能抵挡野猪妖的冲击，倒在了古洞之中……"},
    {type:"system_msg",content:"你死了。但天道给了你一次重来的机会。"},
  ],
  choices:[{text:"重来之",next:"find_bottle"}],
},

"after_boar":{
  text:[
    {type:"narration",content:"你险险击败了野猪妖，气喘吁吁地靠在洞壁上。这一战让你对战斗有了更深的体悟。"},
    {type:"system_msg",content:"获得：20经验，5灵石"},
    {type:"dialogue",content:"韩立！你没事吧？」 ——师兄张铁赶来，看到地上的野猪妖吃了一惊。"},
    {type:"dialogue",content:"你居然能杀死野猪妖？了不起！"},
  ],
  choices:[
    {text:"如实告知小绿瓶的存在",next:"trust_zhangtie",effect:{flag:"told_bottle"}},
    {text:"隐瞒小绿瓶的事",next:"hide_bottle",effect:{flag:"hid_bottle"}},
    {text:"询问张铁有何需要帮忙",next:"side_quest_zhangtie_herb",condition:{notQuestActive:"sq_zhangtie_herb"}},
    {text:"听说墨大夫近来行为古怪……",next:"sq_modoctor_intro",condition:{notFlag:"sq_modoctor_done"}},
  ],
  enter:{exp:20,stone:5,achievement:"first_kill"},
},

"trust_zhangtie":{
  text:[
    {type:"dialogue",content:"师兄，我在洞里捡到一个小瓶，似乎不是凡物……"},
    {type:"narration",content:"张铁接过小绿瓶端详片刻，摇了摇头。"},
    {type:"dialogue",content:"看不出什么名堂。不过你既然发现了就收好吧。对了，韩师弟，为兄有一事相求。"},
    {type:"dialogue",content:"我最近在修炼一门功法，需要一味千年灵草。你若日后有能力，帮我留意可好？"},
    {type:"narration",content:"你答应了师兄。虽然不知这小绿瓶有何妙用，但你隐约觉得，此物将改变你的一生。"},
  ],
  choices:[{text:"回到正殿准备出发",next:"to_huangfeng"}],
  enter:{flag:"zhangtie_trust",comp:1},
},

"hide_bottle":{
  text:[
    {type:"thought",content:"这小瓶来历不明，还是不要声张为好。修仙界尔虞我诈，多一分谨慎便多一分安全。"},
    {type:"dialogue",content:"没什么，只是运气好，捡了把锈剑，凑巧杀死了它。"},
    {type:"narration",content:"你不动声色地将小绿瓶藏好。张铁将信将疑，但也没多问。"},
    {type:"thought",content:"日后若能参透这小瓶的秘密，便是我的机缘。"},
  ],
  choices:[{text:"回到正殿准备出发",next:"to_huangfeng"}],
  enter:{flag:"cautious",luck:1},
},

"to_huangfeng":{
  text:[
    {type:"chapter_title",content:"第 二 章 · 黄 枫 谷"},
    {type:"narration",content:"三日后，你随墨居仁师伯离开七玄门，前往天南大派黄枫谷。"},
    {type:"narration",content:"黄枫谷坐落于一处灵脉之上，门内灵气浓郁，远非七玄门可比。你被安排在外门弟子中修炼。"},
    {type:"dialogue",content:"你就是墨老弟推荐的韩立？资质确实一般……不过既然来了，便好好修炼吧。」 ——一位黄枫谷长老淡淡说道。"},
    {type:"narration",content:"你在黄枫谷安顿下来。某日修炼时，你发现小绿瓶有一个惊人的秘密——它能催熟灵草！"},
    {type:"system_msg",content:"小绿瓶觉醒：可催熟灵草，大幅加速修炼速度！"},
    {type:"narration",content:"有了小绿瓶催熟灵草，你的修炼速度远超常人。短短数月，你便从练气一层突破到了练气三层。"},
    {type:"system_msg",content:"修为提升至：练气三层！全属性大幅提升！"},
  ],
  choices:[{text:"继续修炼",next:"huangfeng_choices"}],
  enter:{cultUp:2,achievement:"seven_profound",flag:"in_huangfeng"},
},

"huangfeng_choices":{
  text:[
    {type:"narration",content:"在黄枫谷修炼期间，你面临几个选择。每个选择都将影响你的修炼之路。"},
    {type:"dialogue",content:"韩师弟，宗门炼丹堂在招收助手。你对丹道有兴趣吗？"},
    {type:"dialogue",content:"另外，武技堂也在招人。你武艺不错，可以去试试。"},
    {type:"dialogue",content:"还有……坊市那边有场拍卖会，据说有珍稀功法。"},
  ],
  choices:[
    {text:"加入炼丹堂 —— 学习炼丹之术",next:"alchemy_path",effect:{flag:"alchemy",comp:1}},
    {text:"加入武技堂 —— 专研战斗",next:"martial_path",effect:{flag:"martial",atk:3}},
    {text:"前往坊市拍卖会",next:"market_path",effect:{flag:"market",stone:-50}},
    {text:"出城探索天南坊市城外荒野",next:"tiannan_free_explore"},
    {text:"⚜️ 查看主线任务",next:"pmain_tiannan_start"},
    {text:"种植灵草修炼",next:"_wild_menu"},
    {text:"找张铁交付千年药草",next:"side_quest_zhangtie_deliver",condition:{questActive:"sq_zhangtie_herb",item:"thousand_year_ginseng"}},
    {text:"寻找失踪的师妹陆云",next:"side_quest_missing_sister_complete",condition:{questActive:"sq_missing_sister"}},
  ],
},

"alchemy_path":{
  text:[
    {type:"narration",content:"你加入了炼丹堂。在老药师的指导下，你学会了基本的炼丹术。"},
    {type:"system_msg",content:"学会：炼丹术（可炼制丹药）"},
    {type:"narration",content:"更重要的是，你利用小绿瓶催熟的灵草，偷偷炼制了大量丹药。你的修为突飞猛进。"},
    {type:"narration",content:"在炼丹堂，你遇到了一位名叫晏婴的女子。她是天南修仙世家的嫡女，因家族变故暂居黄枫谷。"},
    {type:"dialogue",content:"你就是韩立？我听说你炼丹天赋不错。我叫晏婴，日后多多交流。"},
    {type:"thought",content:"此女气质不凡，似乎不简单……"},
  ],
  choices:[{text:"与晏婴交往",next:"yan_ying_meet"}],
  enter:{technique:"immortal_gu_refine",item:"spirit_grass",stone:20},
},

"martial_path":{
  text:[
    {type:"narration",content:"你加入了武技堂。在严苛的训练下，你的战斗能力大幅提升。"},
    {type:"system_msg",content:"学会：剑气术（杀招·伤害30·消耗10灵力）"},
    {type:"narration",content:"武技堂中你结识了一位师兄，他传授了你一些战斗技巧。"},
    {type:"dialogue",content:"韩师弟，你的剑感不错。这招'风刃术'也教给你吧。"},
  ],
  choices:[{text:"继续修炼，准备外出历练",next:"tiannan_explore"}],
  enter:{technique:"sword_qi",technique2:"wind_blade",atk:5},
},

"market_path":{
  text:[
    {type:"narration",content:"你来到坊市拍卖会。场中人来人往，各色法宝灵药琳琅满目。"},
    {type:"narration",content:"你的目光被一件灵器吸引——那是一把泛着青光的飞剑，名曰青霜剑。"},
    {type:"dialogue",content:"青霜剑，寒铁所铸，起拍价30灵石。"},
  ],
  choices:[
    {text:"竞拍青霜剑（花费50灵石）",next:"market_sword",effect:{item:"qingshuang_sword",stone:-50}},
    {text:"转而购买功法残卷（花费30灵石）",next:"market_skill",effect:{technique:"flame_burst",stone:-30}},
    {text:"什么也不买，存钱",next:"market_save"},
  ],
},

"market_sword":{
  text:[
    {type:"system_msg",content:"获得：青霜剑（武器 +15攻击）"},
    {type:"narration",content:"你以50灵石拍下青霜剑。此剑入手冰凉，剑气内敛，确实是一把好剑。"},
  ],
  choices:[{text:"返回继续修炼",next:"tiannan_explore"}],
},
"market_skill":{
  text:[
    {type:"system_msg",content:"学会：烈焰爆（杀招·伤害50·消耗20灵力）"},
    {type:"narration",content:"你买到一本功法残卷，上面记载着烈焰爆的施法之法。"},
  ],
  choices:[{text:"返回继续修炼",next:"tiannan_explore"}],
},
"market_save":{
  text:[
    {type:"thought",content:"修仙路上灵石紧缺，还是存着吧。"},
    {type:"narration",content:"你空手而归，但守住了灵石。"},
  ],
  choices:[{text:"返回继续修炼",next:"tiannan_explore"}],
},

"yan_ying_meet":{
  text:[
    {type:"narration",content:"在炼丹堂的朝夕相处中，你和晏婴渐渐熟络。她冰肌玉骨，天赋异禀，对冰系法术有极高造诣。"},
    {type:"dialogue",content:"韩立，你的炼丹术越来越好了。这瓶冰心丹送给你，算是我的一点心意。"},
    {type:"system_msg",content:"获得：补气丹×5"},
    {type:"dialogue",content:"对了，我听说天南最近有修仙者试炼，我们去看看如何？"},
  ],
  choices:[
    {text:"答应晏婴，一同历练",next:"yan_ying_join",effect:{companion:"yan_ying",flag:"has_yanying"}},
    {text:"婉拒，独自历练",next:"tiannan_explore",effect:{flag:"solo"}},
    {text:"询问晏婴需要什么",next:"side_quest_yanying_pill",condition:{notQuestActive:"sq_yanying_grass"}},
    {text:"交付3株灵草（完成炼丹之助）",next:"side_quest_yanying_complete",condition:{questActive:"sq_yanying_grass",item:"spirit_grass",itemCount:3}},
  ],
  enter:{item:"qi_pill",count:5,stone:30},
},

"yan_ying_join":{
  text:[
    {type:"system_msg",content:"💕 道侣加入：晏婴！"},
    {type:"narration",content:"晏婴正式成为你的道侣。她擅长冰系法术，在战斗中会辅助你。"},
    {type:"dialogue",content:"韩郎，日后我们并肩而行。"},
    {type:"system_msg",content:"道侣加成：攻击+30，防御+20"},
  ],
  choices:[{text:"前往天南试炼",next:"tiannan_explore"}],
  enter:{achievement:"first_companion"},
},

// ==================== 第三章: 天南 ====================
"tiannan_explore":{
  text:[
    {type:"chapter_title",content:"第 三 章 · 天 南 试 炼"},
    {type:"narration",content:"天南大陆，万宗林立。你离开黄枫谷，踏上了天南历练之路。"},
    {type:"narration",content:"在一片密林中，你遭遇了一群山贼。他们虽是凡人，但人数众多，领头者似乎有低阶修为。"},
  ],
  choices:[
    {text:"正面战斗",next:"combat_bandit"},
    {text:"绕道而行",next:"tiannan_avoid",effect:{exp:-10}},
  ],
},

"death_bandit":{
  text:[
    {type:"danger",content:"你竟不敌区区山贼……"},
    {type:"system_msg",content:"天道给了你重来之机。"},
  ],
  choices:[{text:"重来",next:"tiannan_explore"}],
},

"tiannan_avoid":{
  text:[
    {type:"narration",content:"你选择绕道而行，虽然多走了些路，但避免了不必要的消耗。"},
    {type:"thought",content:"实力不足时，不争一时之气，方为修士之智。"},
  ],
  choices:[{text:"继续探索天南",next:"tiannan_event"}],
},

"after_bandit":{
  text:[
    {type:"narration",content:"你击退了山贼，领头者落荒而逃。你在他们的营地中发现了一些灵石和丹药。"},
    {type:"system_msg",content:"获得：30经验，10灵石，疗伤丹×1"},
  ],
  choices:[{text:"继续探索天南",next:"tiannan_event"}],
  enter:{exp:30,stone:10,item:"healing_pill"},
},

"tiannan_event":{
  text:[
    {type:"narration",content:"在天南游历期间，你听闻一则消息：青云山福地近日灵气大涨，各大门派纷纷派人前往争夺修炼权。"},
    {type:"dialogue",content:"青云山福地？若能进入其中修炼，修为必能大增。"},
    {type:"narration",content:"与此同时，你也听到另一则消息：乱星海的星宫正在招募修士，说是有一场大试炼。"},
    {type:"narration",content:"更让你心动的是，天南修仙界十年一度的'血色试炼'即将开启，传闻试炼禁地中藏有上古传承与筑基机缘。"},
  ],
  choices:[
    {text:"前往青云山福地争夺修炼权",next:"blessed_qingyun"},
    {text:"参加血色试炼（推荐）",next:"blood_trial_intro"},
    {text:"直接前往乱星海",next:"chaos_sea_intro",effect:{flag:"skip_foundation"}},
    {text:"自由探索天南坊市城外",next:"tiannan_free_explore"},
    {text:"前往附近城镇休整",next:"_wild_menu"},
  ],
},

// ===== 第三章扩展：血色试炼 =====
"blood_trial_intro":{
  text:[
    {type:"narration",content:"你来到血色试炼的报名处。这里聚集了天南各派的年轻弟子，每个人都满怀机缘之望。"},
    {type:"dialogue",content:"这次血色试炼，胜者可获得筑基丹与上古功法残卷。但试炼禁地凶险万分，每年都有弟子陨落其中。"},
    {type:"system_msg",content:"血色试炼：3轮战斗，胜利可获得大量经验、灵石与筑基丹。"},
  ],
  choices:[
    {text:"报名参加血色试炼",next:"blood_trial_round1"},
    {text:"放弃试炼，继续天南游历",next:"tiannan_event"},
  ],
  enter:{flag:"blood_trial_started"},
},

"blood_trial_round1":{
  text:[
    {type:"narration",content:"试炼第一轮——各派弟子混战。你被分到一个有七名弟子的混战圈。"},
    {type:"danger",content:"试炼弟子们各显神通，飞剑符箓齐发。"},
  ],
  choices:[{text:"迎战",next:"blood_trial_combat1"}],
  combat:{enemy:"blood_trial_disciple",onWin:"blood_trial_round2",onLose:"blood_trial_defeat"},
},

"blood_trial_round2":{
  text:[
    {type:"narration",content:"你击败了对手，进入第二轮——禁地妖兽挑战。"},
    {type:"system_msg",content:"获得：280经验，50灵石"},
    {type:"danger",content:"禁地深处传来兽吼，一只凶恶的妖兽冲了出来！"},
  ],
  choices:[{text:"迎战妖兽",next:"blood_trial_combat2"}],
  enter:{exp:280,stone:50},
  combat:{enemy:"blood_trial_beast",onWin:"blood_trial_round3",onLose:"blood_trial_defeat"},
},

"blood_trial_round3":{
  text:[
    {type:"narration",content:"妖兽倒下，你来到试炼核心——一座上古石台。石台之上，盘坐着一个散发血光的守关者。"},
    {type:"dialogue",content:"过我这关，传承便是你的。否则，留下你的命。"},
    {type:"system_msg",content:"获得：520经验，120灵石"},
  ],
  choices:[{text:"决战守关者",next:"blood_trial_combat3"}],
  enter:{exp:520,stone:120},
  combat:{enemy:"blood_trial_boss",onWin:"blood_trial_victory",onLose:"blood_trial_defeat"},
},

"blood_trial_victory":{
  text:[
    {type:"system_msg",content:"✨ 血色试炼通关！"},
    {type:"narration",content:"守关者化为血光散去，留下一枚筑基丹与一卷上古功法残卷。"},
    {type:"system_msg",content:"获得：1100经验，280灵石，筑基丹×1，长春功精要"},
    {type:"dialogue",content:"小友资质虽平，却有大气运。这枚筑基丹与功法残卷，便赠予你吧。"},
    {type:"thought",content:"有了这枚筑基丹，我离筑基就更近一步了！"},
  ],
  choices:[
    {text:"前往青云山福地继续修炼",next:"blessed_qingyun"},
    {text:"直接前往乱星海",next:"chaos_sea_intro",effect:{flag:"skip_foundation"}},
    {text:"返回天南坊市城休整",next:"tiannan_free_explore"},
  ],
  enter:{exp:1100,stone:280,item:"foundation_pill",flag:"blood_trial_victory"},
},

"blood_trial_defeat":{
  text:[
    {type:"danger",content:"你在血色试炼中失利，被传送出禁地。"},
    {type:"system_msg",content:"虽败犹荣，你获得了一些经验与灵石。"},
    {type:"narration",content:"你虽未能通关，但试炼中的战斗让你受益匪浅。"},
  ],
  choices:[
    {text:"继续天南游历",next:"tiannan_event"},
    {text:"前往青云山福地修炼",next:"blessed_qingyun"},
  ],
  enter:{exp:150,stone:30},
},

"blessed_qingyun":{
  text:[
    {type:"narration",content:"青云山，云雾缭绕，灵气充沛。各派修士齐聚山脚，争论不休。"},
    {type:"dialogue",content:"青云山福地乃我天南共有的修炼圣地，各家轮流入内。今日轮到你们黄枫谷了。"},
    {type:"narration",content:"你作为黄枫谷弟子，获得进入福地修炼的机会。"},
    {type:"system_msg",content:"进入福地·青云山！修炼效率翻倍！"},
    {type:"narration",content:"在福地中，你利用小绿瓶催熟灵草，配合天地灵气修炼。修为突飞猛进！"},
    {type:"system_msg",content:"修为提升至：练气六层！"},
  ],
  choices:[{text:"在福地中继续修炼",next:"foundation_attempt"}],
  enter:{exp:500,stone:50,cultUp:3,item:"spirit_grass",achievement:"tiannan_hero"},
},

"foundation_attempt":{
  text:[
    {type:"narration",content:"经过在福地的修炼，你的修为已达练气十二层圆满，到了筑基的关口。"},
    {type:"dialogue",content:"筑基是修仙路上的第一道大关。若筑基成功，你便真正踏入修仙者的行列。"},
    {type:"narration",content:"你取出一颗筑基丹，盘膝坐下。"},
    {type:"danger",content:"筑基开始！灵力在体内翻涌，经脉承受着巨大的冲击！"},
  ],
  choices:[
    {text:"全力冲击筑基",next:"foundation_success",effect:{flag:"foundation_tried"}},
    {text:"服用额外筑基丹辅助突破",next:"foundation_boost",effect:{item:"foundation_pill"}},
  ],
},

"foundation_boost":{
  text:[
    {type:"narration",content:"你服下筑基丹，药力化为一股暖流，引导灵力冲击瓶颈。"},
  ],
  choices:[{text:"冲击筑基",next:"foundation_success"}],
},

"foundation_success":{
  text:[
    {type:"system_msg",content:"✨ 筑基成功！"},
    {type:"narration",content:"轰——一道灵光冲天而起！你感到丹田中的灵力发生了质变，经脉中流转的灵力更加精纯。"},
    {type:"narration",content:"你睁开双眼，天地在你眼中已不同往日。你已不是凡人，而是真正的修仙者！"},
    {type:"system_msg",content:"修为提升至：筑基初期！全属性大幅提升！"},
    {type:"dialogue",content:"恭喜你，韩立。你已成为筑基期修士。」 ——一道苍老的声音传来。"},
    {type:"narration",content:"一位白发老者飘然而至，他是天南赫赫有名的化神期前辈——魏无涯。"},
    {type:"dialogue",content:"年轻人，你可愿听老夫一言？"},
  ],
  choices:[
    {text:"恭敬聆听前辈教诲",next:"wei_advice",effect:{flag:"respect_wei"}},
    {text:"婉拒，想独自探索",next:"chaos_sea_intro",effect:{flag:"independent"}},
  ],
  enter:{cultUp:1,achievement:"foundation",flag:"is_foundation"},
},

"wei_advice":{
  text:[
    {type:"dialogue",content:"修仙之路，道心为重。你有大机缘在身，但切记——机缘越大，觊觎之人越多。"},
    {type:"dialogue",content:"天南虽好，但天地太小。若想真正求道，当去更广阔的天地。"},
    {type:"dialogue",content:"乱星海、虚天殿……这些地方藏有上古机缘。但同样凶险万分。"},
    {type:"dialogue",content:"另外，你体内的灵根驳杂。若有朝一日能找到'五行归元'之法，或许能改善根骨。"},
    {type:"system_msg",content:"获得前辈指点：悟性+2，机缘+2"},
    {type:"dialogue",content:"去吧，年轻人。修仙路漫漫，望你不忘初心。"},
  ],
  choices:[{text:"前往乱星海",next:"chaos_sea_intro"}],
  enter:{comp:2,luck:2},
},

// ==================== 第四章: 乱星海 ====================
"chaos_sea_intro":{
  text:[
    {type:"chapter_title",content:"第 四 章 · 乱 星 海"},
    {type:"narration",content:"你离开了天南，踏上了前往乱星海的旅程。"},
    {type:"narration",content:"乱星海无边无际，星岛密布。海中灵兽众多，盛产星辰砂等炼器珍材。星宫是这里最大的势力，掌控着星海秩序。"},
    {type:"narration",content:"你乘船渡海，在一座星岛上落脚。岛上的修士告诉你，星宫正在举办一场大试炼——通过者可获得进入虚天殿的资格。"},
    {type:"dialogue",content:"虚天殿？那可是上古遗迹，传说中有无数宝物！"},
  ],
  choices:[
    {text:"报名参加星宫试炼",next:"star_palace_trial"},
    {text:"先在乱星海历练",next:"sea_explore",effect:{flag:"sea_explore_first"}},
  ],
},

"sea_explore":{
  text:[
    {type:"narration",content:"你决定先在乱星海历练一番。海中灵兽众多，正是修炼战斗的好地方。"},
    {type:"narration",content:"在一次猎杀海兽时，你遇到了一位独自修炼的女子——萧舞。"},
    {type:"dialogue",content:"你是外来者？我叫萧舞，在这片海域修炼有些年头了。"},
    {type:"dialogue",content:"你的修为不错，但在这片海域，没有同伴很危险。不如我们结伴而行？"},
  ],
  choices:[
    {text:"接受萧舞的邀请",next:"xiao_wu_join",effect:{companion:"xiao_wu"}},
    {text:"婉拒，独自前行",next:"star_palace_trial",effect:{flag:"solo_sea"}},
  ],
},

"xiao_wu_join":{
  text:[
    {type:"system_msg",content:"💕 道侣加入：萧舞！"},
    {type:"narration",content:"萧舞成为你的道侣。她性格洒脱，擅长水系法术，在海上是极好的助力。"},
    {type:"dialogue",content:"韩郎，这星海之中有一处天星洞福地，灵气极为充沛。我带你去。"},
    {type:"system_msg",content:"发现福地·天星洞！"},
  ],
  choices:[{text:"前往天星洞福地修炼",next:"tianxing_blessed"}],
  enter:{achievement:"first_companion",stone:50},
},

"tianxing_blessed":{
  text:[
    {type:"narration",content:"天星洞位于乱星海深处的一座隐秘星岛内。洞中星光璀璨，灵气浓郁得几乎化为实质。"},
    {type:"system_msg",content:"进入福地·天星洞！获得大量修炼经验！"},
    {type:"narration",content:"在萧舞的协助下，你利用小绿瓶和天星洞的灵气修炼，修为再次精进。"},
    {type:"system_msg",content:"修为提升至：筑基中期！"},
    {type:"narration",content:"修炼之余，萧舞教了你一套功法——碧海潮生诀。"},
    {type:"system_msg",content:"学会：碧海潮生诀（功法·灵力上限+200）"},
  ],
  choices:[{text:"前往星宫试炼",next:"star_palace_trial"}],
  enter:{exp:2000,stone:100,cultUp:1,technique:"blue_sea",item:"star_sand"},
},

"star_palace_trial":{
  text:[
    {type:"narration",content:"星宫试炼分为三关：战斗、阵法、悟道。通过全部三关者，方可获得进入虚天殿的资格。"},
    {type:"dialogue",content:"第一关：战斗。击败星宫守卫即可通过。"},
  ],
  choices:[{text:"开始第一关",next:"combat_star_guard"}],
  combat:{enemy:"star_palace_guard",onWin:"trial_2",onLose:"trial_fail"},
},

"trial_fail":{
  text:[
    {type:"danger",content:"试炼失败……"},
    {type:"narration",content:"你被星宫弟子扶出试炼场。虽然失败了，但你并非一无所获。"},
    {type:"dialogue",content:"年轻人，别灰心。半年后还有一次机会。"},
  ],
  choices:[
    {text:"在海中修炼后再次挑战",next:"sea_train_retry"},
  ],
},

"sea_train_retry":{
  text:[
    {type:"narration",content:"你在乱星海中修炼了半年，修为有所精进，再次来到星宫试炼。"},
  ],
  choices:[{text:"再次挑战第一关",next:"combat_star_guard",effect:{exp:500,stone:50}}],
},

"trial_2":{
  text:[
    {type:"system_msg",content:"第一关通过！"},
    {type:"dialogue",content:"第二关：阵法。请在限定时间内破阵。"},
    {type:"narration",content:"你面前出现一座玄妙阵法，阵中灵光流转，变幻莫测。"},
  ],
  choices:[
    {text:"以悟性破解阵法",next:"trial_2_success",condition:{comp:">=3"}},
    {text:"以蛮力冲击阵法",next:"trial_2_force"},
  ],
},

"trial_2_force":{
  text:[
    {type:"danger",content:"你的蛮力未能破阵，灵力消耗殆尽……"},
    {type:"narration",content:"但星宫长老看在你第一关表现出色，给了你第二次机会。"},
    {type:"dialogue",content:"再试一次，用你的脑子，不是用蛮力。"},
  ],
  choices:[{text:"重新破阵",next:"trial_2_success"}],
},

"trial_2_success":{
  text:[
    {type:"system_msg",content:"第二关通过！"},
    {type:"dialogue",content:"第三关：悟道。请在静室中冥想，感悟天地大道。"},
    {type:"narration",content:"你进入一间空旷的静室，盘膝而坐。灵气环绕，你感到与天地之间有了一丝微妙的联系。"},
    {type:"thought",content:"道……什么是道？"},
  ],
  choices:[
    {text:"感悟\"顺应天道\"",next:"trial_3_heaven",effect:{flag:"dao_heaven"}},
    {text:"感悟\"逆天而行\"",next:"trial_3_rebel",effect:{flag:"dao_rebel"}},
    {text:"感悟\"中庸之道\"",next:"trial_3_balance",effect:{flag:"dao_balance"}},
  ],
},

"trial_3_heaven":{
  text:[
    {type:"narration",content:"你感悟到顺应天道之理。万物自有其规律，强求不如顺势而为。"},
    {type:"system_msg",content:"道心感悟：顺应天道。悟性+3，灵力上限+100。"},
  ],
  choices:[{text:"完成试炼",next:"trial_complete"}],
  enter:{comp:3,maxMp:100},
},
"trial_3_rebel":{
  text:[
    {type:"narration",content:"你感悟到逆天而行之志。天道不公，便逆天而改命！"},
    {type:"system_msg",content:"道心感悟：逆天而行。攻击+20，但防御-10。"},
  ],
  choices:[{text:"完成试炼",next:"trial_complete"}],
  enter:{atk:20,def:-10},
},
"trial_3_balance":{
  text:[
    {type:"narration",content:"你感悟到中庸之道。不偏不倚，刚柔并济，方为正道。"},
    {type:"system_msg",content:"道心感悟：中庸之道。全属性+5。"},
  ],
  choices:[{text:"完成试炼",next:"trial_complete"}],
  enter:{atk:5,def:5,comp:1,luck:1,maxMp:50,maxHp:50},
},

"trial_complete":{
  text:[
    {type:"system_msg",content:"✨ 星宫试炼全部通过！"},
    {type:"dialogue",content:"恭喜你，年轻人。你已获得进入虚天殿的资格。"},
    {type:"narration",content:"星宫宫主亲自接见了你，并赠予你一枚虚天令。"},
    {type:"system_msg",content:"获得：虚天令（进入虚天殿的凭证）"},
    {type:"dialogue",content:"虚天殿三年后开启。在那之前，星海中将有一场大变，你若有意，可助星宫一臂之力。"},
  ],
  choices:[
    {text:"协助星宫平定海乱",next:"chaos_sea_war_intro"},
    {text:"三年后直接前往虚天殿",next:"void_temple_intro"},
    {text:"自由探索乱星海",next:"luanxing_explore"},
  ],
  enter:{achievement:"sea_conqueror",exp:1000},
},

// ===== 第四章扩展：乱星海海战 =====
"chaos_sea_war_intro":{
  text:[
    {type:"narration",content:"星宫宫主告知你，近期乱星海中出现了一伙凶悍的海盗，号称'乱星海霸主'，他们劫掠商船、屠戮修士，甚至觊觎星宫的统治。"},
    {type:"dialogue",content:"这伙海盗的首领修为高深，手下更有大批亡命之徒。星宫愿以重金悬赏，邀请各派修士共同剿灭。"},
    {type:"system_msg",content:"协助星宫平乱：3场战斗，奖励丰厚灵石与星辰砂。"},
  ],
  choices:[
    {text:"接下任务，前往海盗据点",next:"chaos_sea_war_round1"},
    {text:"暂不参与，直接前往虚天殿",next:"void_temple_intro"},
  ],
  enter:{flag:"chaos_sea_war"},
},

"chaos_sea_war_round1":{
  text:[
    {type:"narration",content:"你随星宫舰队来到海盗活动海域。前方出现一队海盗巡逻船。"},
    {type:"danger",content:"海盗船逼来，战斗一触即发！"},
  ],
  choices:[{text:"迎战巡逻队",next:"chaos_sea_war_combat1"}],
  combat:{enemy:"star_palace_patrol",onWin:"chaos_sea_war_round2",onLose:"chaos_sea_war_defeat"},
},

"chaos_sea_war_round2":{
  text:[
    {type:"narration",content:"你击溃了巡逻队，直逼海盗主寨。寨门前，一名千夫长拦住了你。"},
    {type:"system_msg",content:"获得：680经验，180灵石"},
    {type:"dialogue",content:"来者何人？休想踏过我这一关！"},
  ],
  choices:[{text:"迎战千夫长",next:"chaos_sea_war_combat2"}],
  enter:{exp:680,stone:180},
  combat:{enemy:"star_palace_captain",onWin:"chaos_sea_war_round3",onLose:"chaos_sea_war_defeat"},
},

"chaos_sea_war_round3":{
  text:[
    {type:"narration",content:"千夫长倒下，你闯入主寨。寨中一名身披玄铁战甲的男子正冷冷地望着你。"},
    {type:"dialogue",content:"你便是星宫请来的帮手？哼，能闯到这里，算你有点本事。但我才是这片海域的主人！"},
    {type:"danger",content:"乱星海霸主——玄铁战甲男子，向你扑来！"},
    {type:"system_msg",content:"获得：1500经验，380灵石"},
  ],
  choices:[{text:"决战霸主",next:"chaos_sea_war_combat3"}],
  enter:{exp:1500,stone:380},
  combat:{enemy:"chaos_sea_overlord",onWin:"chaos_sea_war_victory",onLose:"chaos_sea_war_defeat"},
},

"chaos_sea_war_victory":{
  text:[
    {type:"system_msg",content:"✨ 乱星海霸主被击败！"},
    {type:"narration",content:"霸主重伤遁逃，海盗群龙无首，星宫舰队一举扫平了海盗据点。"},
    {type:"dialogue",content:"多谢小友相助！这是星宫的一点心意——大量灵石与星辰砂。"},
    {type:"system_msg",content:"获得：2600经验，680灵石，星辰砂×3"},
    {type:"thought",content:"此次平乱收获颇丰，修为更进一步。虚天殿开殿在即，是时候前往了。"},
  ],
  choices:[
    {text:"前往虚天殿",next:"void_temple_intro"},
    {text:"返回乱星海休整",next:"luanxing_explore"},
  ],
  enter:{exp:2600,stone:680,item:"star_sand",count:3,flag:"chaos_sea_victory"},
},

"chaos_sea_war_defeat":{
  text:[
    {type:"danger",content:"你在海战中受伤，被星宫弟子救回。"},
    {type:"system_msg",content:"虽未全胜，但仍获得了一些战功奖励。"},
    {type:"narration",content:"你休养了一段时间，修为略有精进。"},
  ],
  choices:[
    {text:"前往虚天殿",next:"void_temple_intro"},
    {text:"继续在乱星海修炼",next:"luanxing_explore"},
  ],
  enter:{exp:500,stone:100},
},

// ==================== 第五章: 虚天殿 ====================
"void_temple_intro":{
  text:[
    {type:"chapter_title",content:"第 五 章 · 虚 天 殿"},
    {type:"narration",content:"三年后，虚天殿开启。天下修士齐聚，你凭借虚天令进入其中。"},
    {type:"narration",content:"虚天殿内部宏大无比，仿佛一方独立天地。殿中灵气浓郁，更有无数上古遗留的宝物和凶兽。"},
    {type:"narration",content:"殿内分为多层。你和其他修士一起进入了第一层。"},
  ],
  choices:[{text:"探索虚天殿第一层",next:"void_floor1"}],
},

"void_floor1":{
  text:[
    {type:"narration",content:"第一层是一座巨大的迷宫。灵光流转间，你隐约看到了几个方向。"},
    {type:"narration",content:"你听到左边传来打斗声，右边似乎有宝物灵光，前方则是一条幽深的通道。"},
  ],
  choices:[
    {text:"前往左侧查看战斗",next:"void_help_others"},
    {text:"前往右侧拾取宝物",next:"void_loot"},
    {text:"直行深入通道",next:"void_floor2_intro"},
  ],
},

"void_help_others":{
  text:[
    {type:"narration",content:"你循声而去，发现一名修士正被一只虚空兽围攻。此人似已力竭，岌岌可危。"},
    {type:"dialogue",content:"道友救我！我乃星宫弟子，你若救我，必有重谢！"},
  ],
  choices:[
    {text:"出手相救",next:"void_rescue",effect:{flag:"rescued_star"}},
    {text:"趁虚抢夺虚空兽身上的宝物",next:"void_betray",effect:{flag:"betrayed"}},
  ],
},

"death_void":{
  text:[
    {type:"danger",content:"虚空兽太过强大……"},
    {type:"system_msg",content:"天道给了你重来之机。"},
  ],
  choices:[{text:"重来",next:"void_floor1"}],
},

"void_rescue":{
  text:[
    {type:"narration",content:"你决定出手相救，拔剑冲向虚空兽！"},
    {type:"danger",content:"虚空兽转头向你扑来！"},
  ],
  choices:[{text:"战斗中……",next:"void_rescue"}],
  combat:{enemy:"void_beast",onWin:"void_after_rescue",onLose:"death_void"},
},

"void_betray":{
  text:[
    {type:"danger",content:"你趁乱夺取了虚空兽旁的一件宝物——那修士惨叫一声，被虚空兽撕碎。"},
    {type:"system_msg",content:"获得：紫煞剑（武器+40攻击）、灵石×100"},
    {type:"thought",content:"修仙界弱肉强食，我不过是为求长生……"},
    {type:"danger",content:"虚空兽发出怒吼，向你扑来！你感到一丝心魔的波动……"},
  ],
  choices:[{text:"战斗中……",next:"void_betray"}],
  enter:{item:"zisha_sword",stone:100,flag:"evil_act",achievement:"no_mercy",luck:-1},
  combat:{enemy:"void_beast",onWin:"void_floor2_intro",onLose:"death_void"},
},

"void_loot":{
  text:[
    {type:"narration",content:"你来到右侧，发现一个石台。台上放着一面古印，散发着雷光。"},
    {type:"system_msg",content:"获得：雷神印（法宝·攻击+80·防御+40）"},
    {type:"narration",content:"刚拿到古印，一只虚空兽便冲了过来！"},
  ],
  choices:[{text:"迎战虚空兽",next:"combat_void_loot"}],
  enter:{item:"thunder_seal"},
  combat:{enemy:"void_beast",onWin:"void_after_loot",onLose:"death_void"},
},

"void_after_loot":{
  text:[
    {type:"narration",content:"你击退了虚空兽，擦了擦额头的汗水。"},
  ],
  choices:[{text:"前往虚天殿深处",next:"void_floor2_intro"}],
},

"void_floor2_intro":{
  text:[
    {type:"narration",content:"你来到虚天殿第二层。这里空间更加广阔，殿中央悬浮着一座巨大的青铜古鼎。"},
    {type:"dialogue",content:"那是……虚天鼎！上古先天灵宝！」 ——不知谁喊了一声。"},
    {type:"narration",content:"殿中央，虚天鼎散发着蒙蒙灵光。鼎旁站着一个身影——一位紫衣少女。"},
    {type:"dialogue",content:"你终于来了。」 ——少女转身，面带微笑看着你。"},
  ],
  choices:[{text:"与神秘少女交谈",next:"meet_ziyan"}],
},

"meet_ziyan":{
  text:[
    {type:"dialogue",content:"我叫紫烟。虚天鼎与我有缘，但它也需要一位真正的主人。"},
    {type:"dialogue",content:"这虚天鼎是先天灵宝，镇压天地。它选择了你——因为你身上那件东西。"},
    {type:"thought",content:"小绿瓶？！她知道小绿瓶的事？！"},
    {type:"dialogue",content:"不必惊慌。我不会夺你的宝物。虚天鼎的认主仪式需要两人配合——你愿意接受吗？"},
  ],
  choices:[
    {text:"接受紫烟的提议",next:"void_accept_ziyan",effect:{companion:"zi_yan",item:"heaven_void_cauldron"}},
    {text:"拒绝，独自取鼎",next:"void_refuse_ziyan"},
    {text:"趁虚夺取虚天鼎",next:"void_steal_cauldron",effect:{flag:"stole_cauldron"}},
  ],
},

"void_accept_ziyan":{
  text:[
    {type:"system_msg",content:"✨ 获得先天灵宝：虚天鼎！"},
    {type:"system_msg",content:"💕 道侣加入：紫烟！"},
    {type:"narration",content:"在紫烟的引导下，你完成了虚天鼎的认主仪式。虚天鼎化为一道灵光没入你的丹田，一股磅礴之力充盈全身。"},
    {type:"dialogue",content:"从今日起，你我便是道侣。虚天鼎选择了你，也选择了我。"},
    {type:"system_msg",content:"虚天鼎：攻击+200，防御+200。紫烟加成：攻击+100，防御+60。"},
  ],
  choices:[{text:"修为大增，准备离开虚天殿",next:"after_void_temple"}],
  enter:{achievement:"void_temple"},
},

"void_refuse_ziyan":{
  text:[
    {type:"narration",content:"你拒绝了紫烟。她微微一笑，并不恼怒。"},
    {type:"dialogue",content:"你很有主见。不过，虚天鼎不会轻易认主。"},
    {type:"narration",content:"你尝试独自沟通虚天鼎，但始终无法成功。最终你只得遗憾离去。"},
    {type:"thought",content:"或许，我错过了一个机缘……"},
    {type:"system_msg",content:"你未能获得虚天鼎。但获得了雷神印的额外力量。"},
  ],
  choices:[{text:"离开虚天殿",next:"after_void_temple"}],
  enter:{atk:50,flag:"missed_cauldron"},
},

"void_steal_cauldron":{
  text:[
    {type:"danger",content:"你趁紫烟不备，猛然出手，试图夺取虚天鼎！"},
    {type:"narration",content:"紫烟身形一闪，轻松避开。她的眼中闪过一丝失望。"},
    {type:"dialogue",content:"你选错了路。贪念是心魔之源。"},
    {type:"danger",content:"虚天鼎发出排斥之力，将你击飞！"},
    {type:"system_msg",content:"受到反噬！气血-200，灵力-100"},
    {type:"narration",content:"你灰头土脸地退下，未能取得虚天鼎。紫烟也没有为难你，只是叹了口气。"},
    {type:"danger",content:"你的心魔增长了……"},
  ],
  choices:[{text:"离开虚天殿",next:"after_void_temple"}],
  enter:{hp:-200,mp:-100,flag:"heart_demon",achievement:"no_mercy"},
},

"void_after_rescue":{
  text:[
    {type:"narration",content:"你击败了虚空兽，星宫弟子得救了。"},
    {type:"dialogue",content:"多谢道友相救！我叫厉飞雨，是星宫弟子。这枚乾坤戒赠予道友，聊表谢意。"},
    {type:"system_msg",content:"获得：乾坤戒（饰品·防御+50·灵力上限+500）"},
    {type:"dialogue",content:"另外，虚天殿深处有一位神秘女子，似乎与虚天鼎有缘。道友若有缘，可以去看看。"},
  ],
  choices:[{text:"前往虚天殿深处",next:"void_floor2_intro"}],
  enter:{item:"space_ring",flag:"li_feiyu_friend"},
},

"after_void_temple":{
  text:[
    {type:"narration",content:"虚天殿之行让你获益匪浅。修为精进了不少，更获得了几件宝物。"},
    {type:"system_msg",content:"修为提升至：结丹初期！"},
    {type:"narration",content:"离开虚天殿前，你听闻殿内还有第三层——藏有上古守护者与虚天残灵，凶险万分，但宝物惊人。"},
    {type:"narration",content:"与此同时，天南与慕兰草原的战事一触即发，各派正在征召修士参战。"},
  ],
  choices:[
    {text:"挑战虚天殿第三层（高难度）",next:"void_floor3_intro"},
    {text:"前往慕兰草原参战",next:"mulan_intro"},
    {text:"自由探索",next:"_wild_menu"},
  ],
  enter:{cultUp:1,achievement:"core_formation",exp:5000,stone:200},
},

// ===== 第五章扩展：虚天殿第三层 =====
"void_floor3_intro":{
  text:[
    {type:"narration",content:"你独自进入虚天殿第三层。这里灵气浓郁得近乎化为实质，殿中央悬浮着一道残破的虚影。"},
    {type:"danger",content:"虚影感知到你的气息，缓缓凝聚成形——竟是虚天殿的护殿金甲傀儡！"},
    {type:"dialogue",content:"擅闯禁地者，死！"},
  ],
  choices:[{text:"迎战金甲傀儡",next:"void_floor3_combat1"}],
  combat:{enemy:"void_floor3_puppet",onWin:"void_floor3_second",onLose:"void_floor3_defeat"},
},

"void_floor3_second":{
  text:[
    {type:"system_msg",content:"获得：3200经验，880灵石"},
    {type:"narration",content:"金甲傀儡倒下，殿深处一道虚影缓缓凝聚——竟是虚天殿 former 主人的残灵！"},
    {type:"dialogue",content:"年轻人……能击败我的傀儡，你已有资格继承我的衣钵。但首先，让我看看你的本事！"},
    {type:"danger",content:"虚天残灵向你发动了攻击！"},
  ],
  choices:[{text:"迎战虚天残灵",next:"void_floor3_combat2"}],
  enter:{exp:3200,stone:880},
  combat:{enemy:"void_spirit_remnant",onWin:"void_floor3_victory",onLose:"void_floor3_defeat"},
},

"void_floor3_victory":{
  text:[
    {type:"system_msg",content:"✨ 击败虚天残灵！"},
    {type:"narration",content:"残灵化为点点灵光散去，临散前留下一句话："},
    {type:"dialogue",content:"善用你所获之物……天道轮回报应不爽。去罢，年轻人。"},
    {type:"system_msg",content:"获得：4800经验，1500灵石，虚天残图×1"},
    {type:"thought",content:"虚天残图……似乎与更上层的秘境有关。先去慕兰草原，战事要紧。"},
  ],
  choices:[
    {text:"前往慕兰草原",next:"mulan_intro"},
    {text:"返回自由探索",next:"_wild_menu"},
  ],
  enter:{exp:4800,stone:1500,item:"star_sand",count:2,flag:"void_floor3_cleared"},
},

"void_floor3_defeat":{
  text:[
    {type:"danger",content:"你被虚天殿第三层的强者击败，被殿内灵光传送出去。"},
    {type:"system_msg",content:"虽败犹荣，你仍获得了一些经验。"},
  ],
  choices:[
    {text:"前往慕兰草原",next:"mulan_intro"},
    {text:"自由探索",next:"_wild_menu"},
  ],
  enter:{exp:800,stone:150},
},

// ==================== 第六章: 慕兰大战 ====================
"mulan_intro":{
  text:[
    {type:"chapter_title",content:"第 六 章 · 慕 兰 大 战"},
    {type:"narration",content:"慕兰草原，天南与中原的交界。这里即将爆发一场修仙界的大战。"},
    {type:"narration",content:"天南修仙联盟与慕兰草原的萨满修士积怨已深，终于到了兵戎相见的地步。"},
    {type:"dialogue",content:"韩道友，你修为不凡，可愿为天南一战？」 ——黄枫谷长老前来征召。"},
  ],
  choices:[
    {text:"加入天南联盟参战",next:"mulan_join_alliance",effect:{flag:"alliance_side"}},
    {text:"保持中立，暗中观察",next:"mulan_neutral",effect:{flag:"neutral"}},
    {text:"投靠慕兰萨满",next:"mulan_join_saman",effect:{flag:"saman_side"}},
  ],
},

"mulan_join_alliance":{
  text:[
    {type:"narration",content:"你加入了天南联盟。在军中，你遇到了许多同门和旧识。"},
    {type:"dialogue",content:"韩师弟！没想到你也来了。」 ——是你黄枫谷的同门师兄。"},
    {type:"narration",content:"战前，联盟安排你前往万蛇窟福地修炼，为大战做准备。"},
    {type:"system_msg",content:"进入福地·万蛇窟！修为大增！"},
    {type:"narration",content:"在万蛇窟中，你不仅获得了大量灵药，还发现了一只铁皮蛊！"},
    {type:"system_msg",content:"获得仙蛊：铁皮蛊！防御+10"},
  ],
  choices:[{text:"参加慕兰大战",next:"mulan_battle"}],
  enter:{exp:5000,stone:100,item:"thousand_year_ginseng",guWorm:"iron_skin_gu",achievement:"gu_master"},
},

"mulan_neutral":{
  text:[
    {type:"narration",content:"你选择保持中立，在暗中观察这场大战。"},
    {type:"narration",content:"你在战场上捡漏，收集双方遗落的宝物和功法。虽然有些不光彩，但这就是修仙界的现实。"},
    {type:"system_msg",content:"获得：天魔功残卷、灵石×200、千年人参×2"},
    {type:"narration",content:"在一次捡漏中，你遇到了一位慕兰草原的女子——慕青。"},
    {type:"dialogue",content:"你也是来捡漏的？呵，倒是个聪明人。我叫慕青，是慕兰的草药师。"},
  ],
  choices:[
    {text:"与慕青结伴",next:"muqing_join",effect:{companion:"mu_qing"}},
    {text:"独自行动",next:"mulan_battle",effect:{flag:"solo_mulan"}},
  ],
  enter:{technique:"heaven_demon",stone:200,item:"thousand_year_ginseng",count:2},
},

"mulan_join_saman":{
  text:[
    {type:"danger",content:"你选择投靠慕兰萨满。这是一个危险的决定……"},
    {type:"narration",content:"慕兰萨满接纳了你，但对你心存戒备。他们教了你一些独特的功法。"},
    {type:"system_msg",content:"学会：天魔功（功法·攻击+50·防御+30）"},
    {type:"narration",content:"在萨满的指导下，你还学会了炼蛊术，并炼制出一只赤焰蛊。"},
    {type:"system_msg",content:"获得仙蛊：赤焰蛊！攻击+15"},
  ],
  choices:[{text:"参加慕兰大战",next:"mulan_battle"}],
  enter:{technique:"heaven_demon",guWorm:"flame_gu",flag:"joined_saman",achievement:"gu_master"},
},

"muqing_join":{
  text:[
    {type:"system_msg",content:"💕 道侣加入：慕青！"},
    {type:"narration",content:"慕青成为你的道侣。她精通草木之术，擅长炼丹，能在战斗中为你恢复。"},
    {type:"dialogue",content:"韩郎，在这乱世中，我们互相扶持吧。"},
  ],
  choices:[{text:"参加慕兰大战",next:"mulan_battle"}],
  enter:{achievement:"first_companion"},
},

"mulan_battle":{
  text:[
    {type:"narration",content:"大战爆发！法术横飞，灵光漫天。无数修士在战场上厮杀，血染草原。"},
    {type:"narration",content:"一名慕兰萨满拦住了你的去路，实力强横！"},
  ],
  choices:[{text:"迎战慕兰萨满",next:"combat_mulan_shaman"}],
  combat:{enemy:"mulan_shaman",onWin:"mulan_after_battle",onLose:"death_mulan"},
},

"death_mulan":{
  text:[
    {type:"danger",content:"你在慕兰大战中陨落……"},
    {type:"system_msg",content:"天道给了你重来之机。"},
  ],
  choices:[{text:"重来",next:"mulan_battle"}],
},

"mulan_after_battle":{
  text:[
    {type:"narration",content:"你击败了慕兰萨满，在战场上名声大振。"},
    {type:"narration",content:"但慕兰大军并未就此退却——慕兰可汗派出了精锐亲卫与大巫师，准备反扑。"},
    {type:"system_msg",content:"获得：龙纹刀（武器·攻击+400），蛟龙血"},
    {type:"danger",content:"慕兰大军压境，决战在即！"},
    {type:"narration",content:"战后，你也听闻坠魔谷中出现了上古魔修的遗迹。"},
  ],
  choices:[
    {text:"参与慕兰决战（高难度）",next:"mulan_final_war_intro"},
    {text:"直接前往坠魔谷",next:"demon_valley_intro"},
    {text:"自由探索慕兰战场",next:"mulan_explore"},
  ],
  enter:{item:"dragon_pattern_blade",item2:"dragon_blood",achievement:"mulan_warrior",exp:8000,stone:300},
},

// ===== 第六章扩展：慕兰决战 =====
"mulan_final_war_intro":{
  text:[
    {type:"narration",content:"决战之夜，慕兰可汗亲率精锐亲卫与大巫师反扑。天南联盟严阵以待。"},
    {type:"dialogue",content:"韩道友，慕兰可汗亲卫与大巫师修为高深，非你我能够匹敌。还请道友斩首其大巫师，断了慕兰的根基！"},
    {type:"system_msg",content:"慕兰决战：3场战斗，奖励海量经验与灵石。"},
  ],
  choices:[
    {text:"潜入慕兰大营",next:"mulan_final_war_round1"},
    {text:"放弃决战，前往坠魔谷",next:"demon_valley_intro"},
  ],
  enter:{flag:"mulan_final_war"},
},

"mulan_final_war_round1":{
  text:[
    {type:"narration",content:"你潜入慕兰大营，遭遇一队慕兰斥候。"},
    {type:"danger",content:"斥候们抽出弯刀，向你扑来！"},
  ],
  choices:[{text:"迎战斥候",next:"mulan_final_war_combat1"}],
  combat:{enemy:"mulan_scout",onWin:"mulan_final_war_round2",onLose:"mulan_final_war_defeat"},
},

"mulan_final_war_round2":{
  text:[
    {type:"narration",content:"你解决斥候，潜入大营核心。帐篷中传来低沉的咒语声——慕兰大巫师正在举行血祭！"},
    {type:"system_msg",content:"获得：1300经验，280灵石"},
    {type:"dialogue",content:"外来者！竟敢打扰我的血祭——拿命来！"},
    {type:"danger",content:"大巫师召唤出血色雾气，向你扑来！"},
  ],
  choices:[{text:"决战大巫师",next:"mulan_final_war_combat2"}],
  enter:{exp:1300,stone:280},
  combat:{enemy:"mulan_sorcerer",onWin:"mulan_final_war_round3",onLose:"mulan_final_war_defeat"},
},

"mulan_final_war_round3":{
  text:[
    {type:"narration",content:"大巫师倒下，血祭中断。慕兰可汗闻讯大怒，亲率亲卫前来围杀你。"},
    {type:"system_msg",content:"获得：3200经验，980灵石"},
    {type:"dialogue",content:"杀我大巫师者，必死无疑！亲卫们，给我杀！"},
    {type:"danger",content:"慕兰可汗亲卫——重甲骑兵向你冲来！"},
  ],
  choices:[{text:"决战可汗亲卫",next:"mulan_final_war_combat3"}],
  enter:{exp:3200,stone:980},
  combat:{enemy:"mulan_khan_guard",onWin:"mulan_final_war_victory",onLose:"mulan_final_war_defeat"},
},

"mulan_final_war_victory":{
  text:[
    {type:"system_msg",content:"✨ 慕兰决战胜利！"},
    {type:"narration",content:"可汗亲卫全军覆没，慕兰可汗仓皇逃遁。天南联盟乘胜追击，慕兰大军溃败。"},
    {type:"dialogue",content:"韩道友，此战首功非你莫属！这是天南联盟的一点心意。"},
    {type:"system_msg",content:"获得：4800经验，1500灵石，龙血×2"},
    {type:"thought",content:"此战收获颇丰，足以冲击元婴期。坠魔谷的机缘不容错过。"},
  ],
  choices:[
    {text:"前往坠魔谷",next:"demon_valley_intro"},
    {text:"返回慕兰战场休整",next:"mulan_explore"},
  ],
  enter:{exp:4800,stone:1500,item:"dragon_blood",count:2,flag:"mulan_final_victory"},
},

"mulan_final_war_defeat":{
  text:[
    {type:"danger",content:"你在决战中受伤，被天南联盟弟子救回。"},
    {type:"system_msg",content:"虽未全胜，但仍获得了一些战功奖励。"},
    {type:"narration",content:"你休养了一段时间，修为略有精进。"},
  ],
  choices:[
    {text:"前往坠魔谷",next:"demon_valley_intro"},
    {text:"自由探索",next:"_wild_menu"},
  ],
  enter:{exp:800,stone:150},
},

// ==================== 第七章: 坠魔谷 ====================
"demon_valley_intro":{
  text:[
    {type:"chapter_title",content:"第 七 章 · 坠 魔 谷"},
    {type:"narration",content:"坠魔谷，古时大能陨落之地。此地魔气冲天，常年被黑雾笼罩。据说谷中藏有上古魔修传承和无数宝物。"},
    {type:"narration",content:"你深入谷中，感受到浓烈的魔气侵蚀。若非你修为精进，恐怕早已被魔气入侵心神。"},
    {type:"danger",content:"此处凶险万分，步步杀机。"},
  ],
  choices:[
    {text:"深入坠魔谷",next:"demon_valley_deep"},
    {text:"自由探索坠魔谷外围",next:"_wild_menu"},
    {text:"返回附近城镇休整",next:"_wild_return"},
  ],
},

"demon_valley_deep":{
  text:[
    {type:"narration",content:"谷中幽暗，四壁如削。你走着走着，发现前方分出数条岔路。"},
    {type:"dialogue",content:"左路有淡淡药香，中路有微弱灵光，右路则传来阵阵阴风。而在更深处，一股令人心悸的恐怖气息若隐若现——那是魔域核心的方向。"},
  ],
  choices:[
    {text:"走左路（药香）",next:"demon_left"},
    {text:"走中路（灵光）",next:"demon_middle"},
    {text:"走右路（阴风）",next:"demon_right"},
    {text:"深入魔域核心（高难度）",next:"demon_valley_core_intro"},
  ],
},

"demon_valley_core_intro":{
  text:[
    {type:"danger",content:"你循着那股恐怖气息，向魔域核心深入。越往里走，魔气越发浓郁，连灵力护罩都被腐蚀得滋滋作响。"},
    {type:"narration",content:"前方豁然开朗——这是一处巨大的地下魔窟。窟顶倒悬着无数魔蝠，中央一座魔池翻涌着黑色液体。"},
    {type:"dialogue",content:"擅闯魔域者——死！」 ——一个尖锐的声音从窟顶传来。"},
    {type:"danger",content:"成群的魔蝠扑面而来，为首一只体型巨大的魔蝠王盯着你，獠牙上滴着紫黑色的毒液。"},
  ],
  choices:[{text:"迎战魔蝠王",next:"combat_demon_valley_bat"}],
  combat:{enemy:"demon_valley_bat",onWin:"demon_valley_core_bat_win",onLose:"demon_valley_core_fail"},
},

"combat_demon_valley_bat":{
  text:[{type:"danger",content:"魔蝠王扑杀而来！"}],
  choices:[{text:"战斗中……",next:"combat_demon_valley_bat"}],
},

"demon_valley_core_bat_win":{
  text:[
    {type:"narration",content:"魔蝠王发出凄厉的嘶吼，从窟顶坠落，砸得地动山摇。其余魔蝠四散逃窜。"},
    {type:"system_msg",content:"击败魔蝠王！修为大增。"},
    {type:"narration",content:"你继续向魔池深处走去。魔池中央浮现出一道高大的魔影——那是古魔麾下的魔将残魂。"},
    {type:"dialogue",content:"千年了……终于有像样的修士送上门来。让本将用你的鲜血，唤醒主人的真身！"},
  ],
  choices:[{text:"迎战魔将",next:"combat_demon_valley_general"}],
  combat:{enemy:"demon_valley_general",onWin:"demon_valley_core_general_win",onLose:"demon_valley_core_fail"},
  enter:{exp:2400,stone:580,achievement:"first_kill"},
},

"combat_demon_valley_general":{
  text:[{type:"danger",content:"古魔麾下魔将挥舞魔刃斩来！"}],
  choices:[{text:"战斗中……",next:"combat_demon_valley_general"}],
},

"demon_valley_core_general_win":{
  text:[
    {type:"danger",content:"魔将的残魂在惨叫中消散。但他的鲜血已经流入魔池——魔池开始剧烈翻涌！"},
    {type:"narration",content:"一道冲天的黑光从魔池中爆发，整座魔窟都在颤抖。一颗散发着无尽魔气的巨大心脏从池底缓缓升起——古魔之心！"},
    {type:"dialogue",content:"哈哈哈！本座沉睡千年，今日终将重见天日！小辈，感谢你送来的祭品！"},
    {type:"danger",content:"这是古魔的本源之心，是它复生的关键。一旦让它苏醒，整个修仙界都将陷入浩劫！"},
    {type:"thought",content:"绝不能让它复活！这一战，关乎苍生！"},
  ],
  choices:[{text:"决战古魔之心",next:"combat_demon_valley_heart"}],
  combat:{enemy:"demon_valley_heart",onWin:"demon_valley_core_heart_win",onLose:"demon_valley_core_fail"},
  enter:{exp:5200,stone:1600},
},

"combat_demon_valley_heart":{
  text:[{type:"danger",content:"古魔之心爆发出毁天灭地的魔气！"}],
  choices:[{text:"战斗中……",next:"combat_demon_valley_heart"}],
},

"demon_valley_core_heart_win":{
  text:[
    {type:"system_msg",content:"✨✨✨ 古魔之心被你彻底摧毁！✨✨✨"},
    {type:"narration",content:"伴随着一声惊天动地的爆鸣，古魔之心炸裂开来。滔天的魔气在瞬间消散，整座魔窟轰然崩塌。"},
    {type:"narration",content:"你在崩塌前一刻飞身而出，怀中抱着从魔池底部捞起的一枚古朴玉简——上面记载着失传已久的上古功法。"},
    {type:"system_msg",content:"获得：虚天残卷（修为暴增），大量灵石！"},
    {type:"dialogue",content:"你不仅阻止了一场浩劫，还获得了上古传承。此事传开，必将震动整个修仙界。"},
    {type:"thought",content:"魔域已平，但那魔修残魂的气息……还在更深处。"},
  ],
  choices:[{text:"前往魔池底部探查残魂",next:"demon_valley_boss"}],
  enter:{exp:8800,stone:2800,technique:"void_slash",achievement:"demon_valley",flag:"destroyed_ancient_demon",cultUp:1},
},

"demon_valley_core_fail":{
  text:[
    {type:"danger",content:"魔域核心的敌人太过强大，你身负重伤，被迫撤退。"},
    {type:"narration",content:"你勉力逃出魔窟，在谷口喘息良久。看来需要修为精进后再来挑战。"},
    {type:"system_msg",content:"天道给了你重来之机。"},
  ],
  choices:[
    {text:"重整旗鼓再战",next:"demon_valley_core_intro"},
    {text:"先去其他岔路探索",next:"demon_valley_deep"},
    {text:"返回附近城镇休整",next:"_wild_return"},
  ],
  enter:{hp:-500},
},

"demon_left":{
  text:[
    {type:"narration",content:"你走进左路，药香越来越浓。在一处石室中，你发现了一株万年灵药和一只沉睡的血灵蛊！"},
    {type:"system_msg",content:"获得：千年人参×3，血灵蛊（仙蛊·战斗中持续回血）"},
    {type:"narration",content:"血灵蛊自动钻入你的体内，你感到一股温暖的力量在经脉中流动。"},
  ],
  choices:[{text:"继续深入",next:"demon_valley_boss"}],
  enter:{item:"thousand_year_ginseng",count:3,guWorm:"blood_spirit_gu"},
},

"demon_middle":{
  text:[
    {type:"narration",content:"你走进中路。灵光来自一间石室中的古卷——上面记载着一门强大的杀招。"},
    {type:"system_msg",content:"学会：万剑归宗（杀招·伤害250·消耗60灵力）"},
    {type:"narration",content:"你将古卷上的功法记下，正要离开时，石室震动，一只铁骨尸冲了出来！"},
  ],
  choices:[{text:"迎战铁骨尸",next:"combat_iron_bone"}],
  combat:{enemy:"iron_bone",onWin:"demon_after_iron",onLose:"death_demon"},
},

"death_demon":{
  text:[
    {type:"danger",content:"你倒在了坠魔谷中……"},
    {type:"system_msg",content:"天道给了你重来之机。"},
  ],
  choices:[{text:"重来",next:"demon_valley_deep"}],
},

"demon_after_iron":{
  text:[
    {type:"narration",content:"你击败了铁骨尸，继续深入。"},
  ],
  choices:[{text:"前往谷底",next:"demon_valley_boss"}],
},

"demon_right":{
  text:[
    {type:"danger",content:"你走进右路，阴风刺骨。前方出现一个巨大的魔影——坠魔谷的魔主！"},
    {type:"dialogue",content:"哈哈哈！又一个送上门来的修士！成为本座的力量吧！"},
  ],
  choices:[
    {text:"迎战魔主",next:"combat_demon_lord"},
    {text:"转身逃跑",next:"demon_flee"},
  ],
},

"death_demon2":{
  text:[
    {type:"danger",content:"魔主之力太过恐怖……"},
    {type:"system_msg",content:"天道给了你重来之机。"},
  ],
  choices:[{text:"重来",next:"demon_valley_deep"}],
},

"demon_flee":{
  text:[
    {type:"narration",content:"你果断选择撤退。在逃跑途中，你发现了一个隐蔽的洞穴。"},
    {type:"narration",content:"洞穴中有一位修士正在闭关。她名叫李莹，似乎在躲避什么。"},
    {type:"dialogue",content:"你是谁？……罢了，这里不安全。我们一起离开吧。"},
  ],
  choices:[
    {text:"与李莹结伴离开",next:"liying_join",effect:{companion:"li_ying"}},
    {text:"独自离开",next:"demon_valley_boss",effect:{flag:"solo_demon"}},
  ],
},

"liying_join":{
  text:[
    {type:"system_msg",content:"💕 道侣加入：李莹！"},
    {type:"narration",content:"李莹成为你的道侣。她身世成谜，擅长暗影之术，攻击力极强。"},
  ],
  choices:[{text:"前往谷底",next:"demon_valley_boss"}],
  enter:{achievement:"first_companion"},
},

"demon_valley_boss":{
  text:[
    {type:"narration",content:"你来到坠魔谷的最深处。这里魔气最为浓郁，中央有一个巨大的魔池。"},
    {type:"dialogue",content:"你来了……穿越千年来到此处，你便是命运选中之人。」 ——一个苍老的声音从魔池中传来。"},
    {type:"narration",content:"魔池中浮现一个虚影——那是上古魔修的残魂。"},
    {type:"dialogue",content:"本座可以传授你魔道至高功法，代价是……你的道心将被魔染。你可愿意？"},
  ],
  choices:[
    {text:"接受魔修传承",next:"demon_accept",effect:{flag:"demon_inheritance"}},
    {text:"拒绝并摧毁残魂",next:"demon_refuse",effect:{flag:"destroyed_demon"}},
    {text:"尝试两全——封印残魂并夺取功法",next:"demon_seal",effect:{flag:"sealed_demon"}},
  ],
},

"demon_accept":{
  text:[
    {type:"danger",content:"你接受了魔修传承。一股滔天魔气涌入你的体内……"},
    {type:"system_msg",content:"学会：封魔印、虚空斩。攻击暴增！"},
    {type:"danger",content:"但你的道心被魔气侵蚀……心魔增长了。"},
    {type:"system_msg",content:"获得：万毒蛊（仙蛊·攻击+20）"},
  ],
  choices:[{text:"修为大增，前往灵界",next:"spirit_world_intro"}],
  enter:{technique:"demon_seal",technique2:"void_slash",guWorm:"poison_gu",atk:100,flag:"heart_demon_grew",achievement:"demon_valley",exp:15000,stone:500,cultUp:1},
},

"demon_refuse":{
  text:[
    {type:"narration",content:"你断然拒绝了魔修的诱惑。你凝聚全身灵力，向残魂发起了攻击！"},
    {type:"dialogue",content:"不——！」 ——残魂发出凄厉的惨叫，被你的灵力彻底净化。"},
    {type:"system_msg",content:"道心坚定！悟性+5，机缘+3"},
    {type:"narration",content:"残魂消散后，魔池中浮现出一件宝物和一卷功法。"},
    {type:"system_msg",content:"获得：巨丝网（法宝）、九转玄功（炼体奇术·气血+500·攻击+30·防御+30）"},
  ],
  choices:[{text:"修为精进，前往灵界",next:"spirit_world_intro"}],
  enter:{technique:"nine_transformation",item:"giant_silk",comp:5,luck:3,achievement:"merciful",achievement2:"demon_valley",exp:15000,stone:500,cultUp:1},
},

"demon_seal":{
  text:[
    {type:"narration",content:"你以巧妙的手法封印了残魂，同时夺取了它的功法传承。两全其美！"},
    {type:"system_msg",content:"学会：封魔印、大衍决"},
    {type:"system_msg",content:"获得：铁心蛊（仙蛊·防御+15）"},
    {type:"thought",content:"既保住了道心，又获得了力量。这才是修仙者的智慧。"},
  ],
  choices:[{text:"修为精进，前往灵界",next:"spirit_world_intro"}],
  enter:{technique:"demon_seal",technique2:"big_day",guWorm:"iron_will_gu",achievement:"hidden_truth",achievement2:"demon_valley",exp:15000,stone:500,cultUp:1},
},

// ==================== 第八章: 灵界飞升 ====================
"spirit_world_intro":{
  text:[
    {type:"chapter_title",content:"第 八 章 · 灵 界 之 路"},
    {type:"narration",content:"历经七玄门、黄枫谷、乱星海、虚天殿、慕兰大战、坠魔谷……你的修仙之路已走过了漫长的岁月。"},
    {type:"narration",content:"你的修为在人界已算不俗，但距离飞升灵界还有一段距离。真正的考验才刚刚开始。"},
    {type:"dialogue",content:"飞升灵界……这是每一个修士的终极梦想。但天劫之威，足以毁灭一切。"},
    {type:"narration",content:"你回到了一处清修之地，准备冲击更高的境界，为飞升灵界做准备。"},
  ],
  choices:[
    {text:"闭关修炼",next:"spirit_train"},
    {text:"出城历练积攒底蕴",next:"_wild_menu"},
    {text:"前往附近城镇打听消息",next:"_wild_return"},
  ],
},

"spirit_train":{
  text:[
    {type:"narration",content:"你利用毕生所学，配合小绿瓶催熟的灵药，开始了漫长的闭关。"},
    {type:"narration",content:"数十年光阴转瞬即逝。你的修为有了长足的进步！"},
    {type:"system_msg",content:"✨ 修为大增！"},
    {type:"narration",content:"化神之后的修炼更加艰难。你需要找到飞升的契机。"},
    {type:"dialogue",content:"韩道友，灵界有一处通道即将开启。若要飞升，这是最好的机会。"},
    {type:"danger",content:"然而就在此时，你感到道心深处有一丝异样的波动——那是心魔在窥伺。"},
    {type:"thought",content:"心魔不除，渡劫必败。在飞升之前，必须先在心中斩魔！"},
  ],
  choices:[
    {text:"立刻前往飞升通道",next:"spirit_channel",effect:{flag:"eager_ascending"}},
    {text:"先修炼至大乘再飞升",next:"spirit_delayed",effect:{flag:"patient_ascending"}},
    {text:"闭关斩心魔（高难度·必经）",next:"heart_demon_trial_intro"},
    {text:"出城探索积攒实力",next:"_wild_menu"},
  ],
  enter:{cultUp:2,achievement:"spirit_transformation",exp:100000,stone:1000},
},

"heart_demon_trial_intro":{
  text:[
    {type:"danger",content:"你盘膝入定，神识沉入道心深处。在这里，修为与法宝都失去了意义——你只能以道心直面心魔。"},
    {type:"narration",content:"道心之内，往事如走马灯般闪现。被欺凌的童年、刀光剑影的修仙路、生死相依的道侣……每一个画面都在考验你的道。"},
    {type:"dialogue",content:"你为何而修？为长生？为权势？为情？还是为那虚无缥缈的大道？」 ——心魔的声音在你耳边响起，幻化成你自己的模样。"},
    {type:"danger",content:"心魔化出你最强的形态，向你扑来！"},
  ],
  choices:[{text:"直面心魔",next:"combat_heart_demon_trial"}],
  combat:{enemy:"heart_demon",onWin:"heart_demon_trial_win",onLose:"heart_demon_trial_fail"},
},

"combat_heart_demon_trial":{
  text:[{type:"danger",content:"心魔以你最熟悉的招式反击！"}],
  choices:[{text:"战斗中……",next:"combat_heart_demon_trial"}],
},

"heart_demon_trial_fail":{
  text:[
    {type:"danger",content:"你败给了心魔，神识被震荡出道心。"},
    {type:"narration",content:"你猛然睁眼，冷汗涔涔。心魔未除，渡劫之时必有后患。"},
    {type:"system_msg",content:"心魔值+1，需要继续修炼稳固道心。"},
  ],
  choices:[
    {text:"继续闭关再战",next:"heart_demon_trial_intro"},
    {text:"先出城历练",next:"_wild_menu"},
  ],
  enter:{heartDemon:1},
},

"heart_demon_trial_win":{
  text:[
    {type:"system_msg",content:"✨ 心魔被斩！道心通明！"},
    {type:"narration",content:"你以坚定的道心击碎了心魔的幻象。心魔消散之处，留下一缕纯净的道韵，被你吸收。"},
    {type:"system_msg",content:"道心圆满：心魔值-3，悟性+8，机缘+5，攻击+5%。"},
    {type:"dialogue",content:"道心既定，天劫又有何惧？现在的你，已具备飞升灵界的资格。"},
    {type:"thought",content:"心魔已斩，但天劫之前，还需经历凡尘一劫，方能圆满。"},
  ],
  choices:[
    {text:"前往飞升通道",next:"spirit_channel",effect:{flag:"heart_demon_cleared"}},
    {text:"先历凡尘劫",next:"mortal_tribulation_intro",effect:{flag:"mortal_trial_attempt"}},
    {text:"继续闭关修炼",next:"spirit_delayed"},
  ],
  enter:{heartDemon:-3,comp:8,luck:5,atk:0.05,achievement:"hidden_truth",exp:9800,flag:"heart_demon_cleared"},
},

"mortal_tribulation_intro":{
  text:[
    {type:"danger",content:"凡尘劫——传说中只有少数大能才会主动迎击的劫难。它并非肉身之劫，而是因果之劫。"},
    {type:"narration",content:"你以神识沟通天道，主动引动凡尘劫。顿时，你一生所结的因果化作实质，化作一尊巨大的劫影降临！"},
    {type:"dialogue",content:"韩立，你欠下无数因果，今日便是清算之时！」 ——劫影开口，声如雷鸣。"},
  ],
  choices:[{text:"迎战凡尘劫",next:"combat_mortal_tribulation"}],
  combat:{enemy:"mortal_tribulation",onWin:"mortal_tribulation_win",onLose:"mortal_tribulation_fail"},
},

"combat_mortal_tribulation":{
  text:[{type:"danger",content:"凡尘劫影以因果之力压制而来！"}],
  choices:[{text:"战斗中……",next:"combat_mortal_tribulation"}],
},

"mortal_tribulation_fail":{
  text:[
    {type:"danger",content:"凡尘劫太过沉重，你被因果压制，神识受创。"},
    {type:"narration",content:"你勉强稳住道心，撤回神识。看来因果未清，需继续行善积德。"},
    {type:"system_msg",content:"因果值+5，需要继续修炼再战。"},
  ],
  choices:[
    {text:"重整再战",next:"mortal_tribulation_intro"},
    {text:"先去飞升通道",next:"spirit_channel"},
  ],
  enter:{karma:5},
},

"mortal_tribulation_win":{
  text:[
    {type:"system_msg",content:"✨ 凡尘劫渡过！因果尽消！"},
    {type:"narration",content:"你以大毅力斩断了所有因果纠缠，劫影在金光中消散。你的修为在渡劫中再次精进，福缘深厚。"},
    {type:"system_msg",content:"因果值-10，悟性+10，机缘+8，全属性+10%。"},
    {type:"dialogue",content:"因果已了，道心通明，心魔尽除。天劫降临吧！我已无所畏惧！"},
  ],
  choices:[{text:"前往飞升通道",next:"spirit_channel",effect:{flag:"mortal_trial_cleared"}}],
  enter:{karma:-10,comp:10,luck:8,atk:0.1,def:0.1,maxHp:0.1,maxMp:0.1,exp:18000,flag:"mortal_trial_cleared"},
},

"spirit_delayed":{
  text:[
    {type:"narration",content:"你选择稳扎稳打，继续修炼。又过了数百年，你终于突破到了大乘期！"},
    {type:"system_msg",content:"✨ 突破至：大乘后期！"},
    {type:"narration",content:"大乘期修士，已是人界巅峰的存在。你感到天地间的规则在你面前变得清晰可见。"},
    {type:"dialogue",content:"现在，是时候飞升了。"},
  ],
  choices:[{text:"前往飞升通道",next:"spirit_channel"}],
  enter:{cultUp:3,achievement:"great_vehicle",exp:500000,stone:2000},
},

"spirit_channel":{
  text:[
    {type:"narration",content:"飞升通道位于一处天地交汇之处。通道中灵气狂涌，雷光闪烁——这是天劫的前兆。"},
    {type:"danger",content:"渡劫！这是飞升灵界的最后一道考验！"},
    {type:"narration",content:"天空乌云密布，一道道天雷劈下。你必须承受住天劫的洗礼，方能飞升！"},
  ],
  choices:[{text:"开始渡劫",next:"tribulation"}],
},

"tribulation":{
  text:[
    {type:"danger",content:"轰隆隆——！天雷轰鸣！第一道天劫雷劈下！"},
    {type:"narration",content:"你全力运转灵力护体，虚天鼎发出蒙蒙灵光将你笼罩。"},
  ],
  choices:[{text:"承受天劫",next:"combat_tribulation"}],
  combat:{enemy:"tribulation_lightning",onWin:"tribulation_2",onLose:"tribulation_fail"},
},

"tribulation_fail":{
  text:[
    {type:"danger",content:"天劫之力太过恐怖，你的肉身崩溃了……"},
    {type:"narration",content:"但你的元神未灭。虚天鼎护住了你最后一丝元神。"},
    {type:"dialogue",content:"韩郎！」 ——你的道侣们急忙赶来，将你的元神护住。"},
  ],
  choices:[
    {text:"元神夺舍重生",next:"tribulation_reborn",effect:{flag:"reborn"}},
    {text:"放弃飞升，转修散仙",next:"ending_retreat"},
  ],
},

"tribulation_reborn":{
  text:[
    {type:"narration",content:"你以元神夺舍了一具灵体，重新修炼。虽然修为跌落，但你的人生经验让修炼速度远超常人。"},
    {type:"system_msg",content:"修为跌落至化神期，但全属性+20%。"},
    {type:"narration",content:"数百年后，你再次来到飞升通道前。这一次，你做好了万全准备。"},
  ],
  choices:[{text:"再次渡劫",next:"tribulation"}],
  enter:{atk:0.2,def:0.2,maxHp:0.2,maxMp:0.2},
},

"tribulation_2":{
  text:[
    {type:"danger",content:"第一道天劫已过！但天空中的雷云更加恐怖——九重天劫！"},
    {type:"narration",content:"这是真正的飞升之劫。九重天雷，一重比一重强！"},
  ],
  choices:[{text:"继续承受天劫",next:"combat_tribulation_2"}],
  combat:{enemy:"immortal_tribulation",onWin:"ascending_success",onLose:"tribulation_fail"},
},

"combat_tribulation_2":{
  text:[
    {type:"danger",content:"仙劫降临！天地变色！"},
  ],
  choices:[{text:"战斗中……",next:"combat_tribulation_2"}],
},

// ==================== 结局分支 ====================
"ascending_success":{
  text:[
    {type:"system_msg",content:"✨✨✨ 天劫渡过！飞升灵界！✨✨✨"},
    {type:"narration",content:"九重天劫尽数渡过！你的肉身在雷火中淬炼得更加坚固，元神蜕变为仙灵之体！"},
    {type:"narration",content:"一道金光从天而降，接引你飞升灵界！"},
  ],
  choices:[{text:"飞升灵界",next:"spirit_world_continue"}],
  enter:{cultUp:2,achievement:"ascension",exp:1000000,stone:5000},
},

"ending_choice":{
  text:[
    {type:"chapter_title",content:"终 章 · 大 道 之 选"},
    {type:"narration",content:"你渡过了仙劫，灵界已容不下你的修为。仙界的大门为你敞开。"},
    {type:"narration",content:"在飞升仙界之前，你面临人生中最重要的抉择——你将以何种方式证道成仙？"},
    {type:"narration",content:"回顾你的一生，从七玄门的一个普通弟子，到如今即将飞升仙界的修士。你的每一个选择都在塑造着你的道。"},
    {type:"system_msg",content:"选择你的飞升之道——这将决定你的最终结局。"},
  ],
  choices:[],
},

"ending_retreat":{
  text:[
    {type:"narration",content:"你放弃了飞升，选择在人间隐世修行。与道侣相伴，日日修炼，倒也逍遥自在。"},
  ],
  choices:[],
  // 直接触发结局
  ending:"retreat_end",
},

// ==================== 灵界篇 ====================
"spirit_world_explore":{
  text:[
    {type:"chapter_title",content:"第 九 章 · 灵 界 风 云"},
    {type:"narration",content:"灵界，高于人间的修仙界。这里的灵气是人间的百倍，修士的实力也远超人间。"},
    {type:"narration",content:"你在灵界修炼了数千年，修为已至大乘后期巅峰。"},
    {type:"narration",content:"某日，你感应到一股强大的仙力波动——那是仙界的接引之力。"},
    {type:"dialogue",content:"飞升仙界的机会来了。但这一次的天劫，将是仙劫——足以毁灭一个世界！"},
  ],
  choices:[{text:"准备渡仙劫",next:"spirit_world_final"}],
},

"spirit_world_final":{
  text:[
    {type:"narration",content:"你召集了所有道侣，做好了最后的准备。"},
    {type:"dialogue",content:"韩郎，无论结果如何，我们都陪着你。"},
    {type:"narration",content:"天空裂开一道巨大的缝隙，仙劫之雷轰然降下！"},
  ],
  choices:[{text:"迎击仙劫！",next:"combat_immortal_tribulation"}],
  combat:{enemy:"immortal_tribulation",onWin:"ending_choice",onLose:"final_fail"},
},

"final_fail":{
  text:[
    {type:"danger",content:"仙劫之力太过恐怖……"},
    {type:"narration",content:"你的肉身在仙劫中崩溃。但你的元神已经足够强大，化为一道光芒飞升而去。"},
    {type:"dialogue",content:"韩郎！"},
    {type:"narration",content:"你的道侣们悲痛万分。你的元神飘向远方，虽然未能肉身成仙，但元神飞升也是一种飞升……"},
  ],
  choices:[],
  ending:"sacrifice_end",
},

"final_ending":{
  text:[
    {type:"system_msg",content:"✨✨✨ 仙劫渡过！飞升仙界！✨✨✨"},
    {type:"narration",content:"你成功渡过仙劫！你的肉身化为仙体，元神蜕变为仙灵！"},
    {type:"narration",content:"一道金光从仙界降下，接引你飞升！你的道侣们也随之飞升！"},
  ],
  choices:[],
  // 动态决定结局
  dynamicEnding:true,
},

// ==================== 结局分支节点 ====================
"ending_true_path":{
  text:[
    {type:"narration",content:"你选择以正道飞升。太上忘情，无为而治，这便是你的道。"},
    {type:"narration",content:"你舍弃了世间一切牵挂，将道心淬炼至极致。金光护体，飞升仙界！"},
    {type:"system_msg",content:"✨ 正道飞升成功！"},
  ],
  choices:[],
  ending:"ascension_true",
},

"ending_demon_path":{
  text:[
    {type:"narration",content:"你选择以魔道飞升。逆天改命，我行我道！"},
    {type:"danger",content:"滔天魔气冲天而起，天劫降下，但你以魔抗天，强行渡劫！"},
    {type:"system_msg",content:"😈 魔道飞升成功！"},
  ],
  choices:[],
  ending:"ascension_demon",
},

"ending_martial_path":{
  text:[
    {type:"narration",content:"你选择以武入道。肉身成圣，以力证道！"},
    {type:"narration",content:"你将全身灵力灌注于肉身，九转玄功运转至极致。天劫劈下，你不闪不避，以肉身硬抗！"},
    {type:"system_msg",content:"⚔️ 武道飞升成功！"},
  ],
  choices:[],
  ending:"ascension_battle",
},

"ending_companion_path":{
  text:[
    {type:"narration",content:"你选择与道侣携手飞升。大道独行不如比翼双飞。"},
    {type:"narration",content:"你的道侣们与你站在一起，共同承受天劫。你们的灵力交汇共鸣，威力倍增！"},
    {type:"dialogue",content:"韩郎，我们一起飞升！"},
    {type:"system_msg",content:"💕 携手飞升成功！"},
  ],
  choices:[],
  ending:"ascension_true",
},

"ending_transcend_path":{
  text:[
    {type:"narration",content:"你选择超脱天道。这是前所未有的疯狂之举——打破天道的束缚！"},
    {type:"danger",content:"天劫化为仙劫，整片天穹都在颤抖！"},
    {type:"narration",content:"你以毕生修为、所有窍穴、所有功法、所有仙蛊之力合一，向天道发起了终极冲击！"},
    {type:"system_msg",content:"✨✨✨ 超脱成功！✨✨✨"},
    {type:"narration",content:"天道规则在你面前碎裂！你超脱了一切束缚，成为了真正的至高真仙！"},
  ],
  choices:[],
  ending:"true_immortal",
},

"ending_mortal_path":{
  text:[
    {type:"narration",content:"你放弃了飞升。也许是看透了修仙界的争斗，也许只是想回归平静的生活。"},
    {type:"narration",content:"你找了一处山清水秀之地，与道侣相伴，过着平凡却充实的生活。"},
  ],
  choices:[],
  ending:"retreat_end",
},

// ==================== 后日谈（结局后继续游玩） ====================
"after_ending_hub":{
  text:[
    {type:"chapter_title",content:"后 日 谈 · 大 道 无 尽"},
    {type:"narration",content:"大道既成，你却并未止步。修仙之路，本就永无止境。"},
    {type:"narration",content:"你回到熟悉的修仙界，往日的伙伴、敌人、恩怨都还在。这一次，没有紧迫的飞升之约，你可以按自己的节奏，继续探索这广袤的修仙世界。"},
    {type:"dialogue",content:"道友，听说你已证大道？不知可否指点一二？」 ——一位后辈修士恭敬地问道。"},
    {type:"thought",content:"既已超脱，便随心而行。或修炼、或游历、或再战强敌，皆由我心。"},
  ],
  choices:[
    {text:"前往灵界修炼场",next:"spirit_world_training"},
    {text:"前往灵界坊市",next:"spirit_world_market"},
    {text:"探索万灵秘境",next:"spirit_world_secret_realm"},
    {text:"挑战天界",next:"celestial_world_intro"},
    {text:"出城自由探索",next:"_wild_menu"},
    {text:"返回所在城镇",next:"_wild_return"},
    {text:"查看我的修仙历程（再触发结局）",next:"ending_review"},
  ],
  enter:{flag:"post_ending_hub"},
},

"ending_review":{
  text:[
    {type:"narration",content:"你回首修仙之路，往事历历在目。"},
    {type:"system_msg",content:"你已完成一次修仙历程。若想重新选择结局，可在此触发。"},
    {type:"dialogue",content:"道在何方？这一次，你的答案又是什么？"},
  ],
  choices:[
    {text:"再次面对大道之选",next:"ending_choice"},
    {text:"返回后日谈",next:"after_ending_hub"},
  ],
},

// ==================== 灵界篇（从飞升后继续） ====================
"spirit_world_continue":{
  text:[
    {type:"chapter_title",content:"灵 界 · 新 的 起 点"},
    {type:"narration",content:"你飞升灵界后，发现这里远比人间更加广阔。灵气是人间的百倍，修士的实力也远超人间。"},
    {type:"narration",content:"你的修为在灵界只能算中等，但你积累的底蕴远超同阶修士。"},
    {type:"narration",content:"在灵界修炼期间，你遇到了传说中的青仙子。她是一位早已飞升灵界的前辈，境界高深。"},
    {type:"dialogue",content:"你便是从下界飞升上来的韩立？我观你根基深厚，机缘非凡。"},
    {type:"dialogue",content:"灵界之上还有仙界。若想飞升仙界，你需要渡过仙劫。那是足以毁灭一界的恐怖力量。"},
  ],
  choices:[
    {text:"向青仙子请教仙劫之秘",next:"spirit_world_train",effect:{flag:"asked_xian"}},
    {text:"自行修炼，等待时机",next:"spirit_world_train",effect:{flag:"self_train"}},
  ],
  enter:{achievement:"spirit_world",flag:"in_spirit_world"},
},

"spirit_world_train":{
  text:[
    {type:"narration",content:"你在灵界潜心修炼。数十万年光阴转瞬即逝，你的修为已至合体期巅峰。"},
    {type:"system_msg",content:"修为提升至：合体后期！"},
    {type:"narration",content:"在修炼过程中，你将毕生所学融会贯通，领悟了'仙道天击'——仙人级别的终极杀招。"},
    {type:"system_msg",content:"学会：仙道天击（杀招·伤害50000·消耗1000灵力）"},
    {type:"narration",content:"青仙子也在这段时光中成为了你的道侣。她的仙力加成让你实力大增。"},
  ],
  choices:[
    {text:"继续修炼至大乘期",next:"spirit_world_breakthrough"},
    {text:"前往灵界坊市探索",next:"spirit_world_market"},
    {text:"探索万灵秘境",next:"spirit_world_secret_realm"},
    {text:"出城探索灵界荒原",next:"_wild_menu"},
    {text:"参加灵界拍卖会",next:"_auction_menu"},
    {text:"种植灵草养老修炼",next:"_wild_menu"},
  ],
  enter:{companion:"fairy_qing",technique:"immortal_strike",cultUp:3,exp:2000000,stone:5000},
},

"spirit_world_breakthrough":{
  text:[
    {type:"narration",content:"经过漫长岁月的修炼，你终于突破到了大乘期巅峰！"},
    {type:"system_msg",content:"✨ 突破至：大乘后期！"},
    {type:"narration",content:"大乘期巅峰，距离渡劫飞升仙界只差一步。但你感应到——仙劫即将降临！"},
    {type:"danger",content:"天空裂开一道巨大的缝隙，仙劫之雷蓄势待发！"},
  ],
  choices:[
    {text:"迎接仙劫！",next:"spirit_world_final"},
  ],
  enter:{cultUp:3,achievement:"great_vehicle",exp:5000000,stone:10000},
},

"combat_immortal_tribulation_final":{
  text:[
    {type:"danger",content:"仙劫降临！天地变色！"},
  ],
  choices:[{text:"战斗中……",next:"combat_immortal_tribulation_final"}],
},

// ==================== 辅助节点 ====================
"cultivate_meditate":{
  text:[
    {type:"narration",content:"你盘膝而坐，运转功法修炼。灵气缓缓流入体内……"},
  ],
  choices:[],
  isMeditate:true,
},

// ==================== 飞升后·灵界扩展剧情 ====================
"spirit_world_arrive_2":{
  text:[
    {type:"chapter_title",content:"灵 界 篇 · 初 临 灵 界"},
    {type:"narration",content:"飞升灵界后，你发现这里的灵气浓度是人界的百倍，修为提升的速度远超从前。"},
    {type:"narration",content:"但也意味着，这里的敌人同样强大百倍。人界的大乘期，在灵界不过是寻常修士。"},
    {type:"dialogue",content:"新飞升的修士？报上名来。你从哪个界面飞升而来？"},
    {type:"narration",content:"一个灵界巡逻修士拦住了你。"},
  ],
  choices:[
    {text:"恭敬回答",next:"spirit_world_register",effect:{flag:"polite"}},
    {text:"不屑理会",next:"spirit_world_conflict",effect:{flag:"arrogant",heartDemon:1}},
  ],
},

"spirit_world_register":{
  text:[
    {type:"narration",content:"你恭敬地回答了来历，巡逻修士点了点头。"},
    {type:"dialogue",content:"嗯，规矩还是要守的。去灵界注册处登记吧，领取飞升令牌。"},
    {type:"narration",content:"你获得了一枚飞升令牌，成为灵界正式居民。"},
    {type:"system_msg",content:"获得飞升令牌！可自由出入灵界各区域。"},
  ],
  choices:[
    {text:"前往灵界坊市",next:"spirit_world_market"},
    {text:"前往灵界修炼场",next:"spirit_world_training"},
  ],
  enter:{exp:100000},
},

"spirit_world_conflict":{
  text:[
    {type:"danger",content:"你的傲慢引起了巡逻修士的不满。"},
    {type:"dialogue",content:"哼，刚飞升就目中无人？教训教训他！"},
    {type:"narration",content:"三个灵界修士围了上来。"},
  ],
  choices:[
    {text:"迎战",next:"combat_spirit_guards"},
    {text:"道歉化解",next:"spirit_world_register",effect:{flag:"apologized"}},
  ],
},

"combat_spirit_guards":{
  text:[
    {type:"danger",content:"灵界巡逻队发起了攻击！"},
  ],
  choices:[{text:"战斗",next:"combat_spirit_guards"}],
  combat:{enemy:"spirit_realm_bandit",onWin:"spirit_world_win_fight",onLose:"spirit_world_lose_fight"},
},

"spirit_world_win_fight":{
  text:[
    {type:"narration",content:"你击败了巡逻修士，但引来了更多关注。"},
    {type:"dialogue",content:"实力不错……但灵界不是人界，小心行事。"},
    {type:"narration",content:"你获得了一些灵石和声望。"},
  ],
  choices:[
    {text:"前往灵界坊市",next:"spirit_world_market"},
  ],
  enter:{stone:5000,exp:50000,karma:10},
},

"spirit_world_lose_fight":{
  text:[
    {type:"danger",content:"你被击败了……灵界果然强者如云。"},
    {type:"narration",content:"你勉强逃走，来到一处偏僻之地休养。"},
  ],
  choices:[
    {text:"前往灵界修炼场",next:"spirit_world_training"},
  ],
  enter:{hp:-200},
},

"spirit_world_market":{
  text:[
    {type:"chapter_title",content:"灵 界 坊 市"},
    {type:"narration",content:"灵界坊市繁华无比，各种灵宝仙器琳琅满目。你在坊市中发现了很多在人界难得一见的宝物。"},
    {type:"dialogue",content:"这位道友，要不要来看看我的摊位？灵界珍品，价格公道。"},
  ],
  choices:[
    {text:"浏览摊位（拍卖会）",next:"_auction_menu"},
    {text:"打听灵界消息",next:"spirit_world_rumors"},
    {text:"前往修炼场",next:"spirit_world_training"},
    {text:"探索灵界荒原",next:"_wild_menu"},
    {text:"返回所在城镇",next:"_wild_return"},
  ],
},

"spirit_world_rumors":{
  text:[
    {type:"narration",content:"你在坊市中打听到一些消息。"},
    {type:"dialogue",content:"听说最近灵界出了大事——虚空裂缝在扩大，古魔的气息越来越浓了。"},
    {type:"dialogue",content:"还有人说，天界最近在选拔仙兵，表现优异的灵界修士有机会被选中。"},
    {type:"dialogue",content:"对了，灵界深处有一处'万灵秘境'，据说里面有上古仙人的传承。但实力不够的进去了就是送死。"},
  ],
  choices:[
    {text:"前往万灵秘境",next:"spirit_world_secret_realm",effect:{flag:"heard_secret_realm"}},
    {text:"回去修炼",next:"spirit_world_training"},
    {text:"前往坊市",next:"spirit_world_market"},
  ],
},

"spirit_world_training":{
  text:[
    {type:"chapter_title",content:"灵 界 修 炼"},
    {type:"narration",content:"你来到灵界修炼场，这里的灵气浓度让你惊叹。在这里修炼，效率是人界的数十倍。"},
    {type:"dialogue",content:"你可以在此修炼、探索、参加拍卖会，也可以种植灵草养老修炼。"},
  ],
  choices:[
    {text:"修炼打坐",next:"cultivate_meditate"},
    {text:"前往坊市",next:"spirit_world_market"},
    {text:"出城探索",next:"_wild_menu"},
    {text:"参加拍卖会",next:"_auction_menu"},
    {text:"种植灵草",next:"_wild_menu"},
    {text:"探索万灵秘境",next:"spirit_world_secret_realm"},
    {text:"前往天界",next:"celestial_world_intro"},
    {text:"返回所在城镇",next:"_wild_return"},
  ],
},

"spirit_world_secret_realm":{
  text:[
    {type:"chapter_title",content:"万 灵 秘 境"},
    {type:"danger",content:"万灵秘境——灵界最危险的禁地之一。"},
    {type:"narration",content:"你来到秘境入口，一股强大的威压扑面而来。里面灵气充沛，但同样危机四伏。"},
    {type:"dialogue",content:"你要进入万灵秘境吗？里面有上古仙人的传承，但也有致命的凶兽。"},
  ],
  choices:[
    {text:"深入秘境",next:"secret_realm_deep"},
    {text:"在外围探索",next:"secret_realm_outer"},
    {text:"返回修炼场",next:"spirit_world_training"},
  ],
},

"secret_realm_outer":{
  text:[
    {type:"narration",content:"你在秘境外围探索，发现了一些灵草和灵石。"},
    {type:"reward",content:"获得了一些修炼资源。"},
  ],
  choices:[
    {text:"继续深入",next:"secret_realm_deep"},
    {text:"返回",next:"spirit_world_training"},
  ],
  enter:{exp:200000,stone:3000,item:"golden_lotus"},
},

"secret_realm_deep":{
  text:[
    {type:"danger",content:"你深入秘境，一只灵界灵兽挡住了去路！"},
    {type:"narration",content:"灵兽的气息十分强大，这是一场硬仗。"},
  ],
  choices:[{text:"迎战灵兽",next:"combat_secret_realm_beast"}],
  combat:{enemy:"spirit_beast",onWin:"secret_realm_victory",onLose:"secret_realm_defeat"},
},

"secret_realm_victory":{
  text:[
    {type:"narration",content:"你击败了灵界灵兽！在它守护的地方，你发现了一个上古传承。"},
    {type:"system_msg",content:"✨ 获得上古功法传承：太清仙诀！"},
    {type:"narration",content:"你的修为大幅提升，同时对天道的理解也更上一层楼。"},
  ],
  choices:[
    {text:"继续探索",next:"secret_realm_deeper"},
    {text:"返回修炼场",next:"spirit_world_training"},
  ],
  enter:{technique:"great_purity",exp:500000,comp:3,achievement:"spirit_realm_hero"},
},

"secret_realm_defeat":{
  text:[
    {type:"danger",content:"你被灵兽击败，不得不退回外围。"},
    {type:"narration",content:"看来你的修为还不够，需要继续修炼。"},
  ],
  choices:[
    {text:"返回修炼",next:"spirit_world_training"},
  ],
},

"secret_realm_deeper":{
  text:[
    {type:"danger",content:"秘境深处传来恐怖的气息……"},
    {type:"narration",content:"一只灵界守护者出现了！它比灵兽强大数倍。"},
    {type:"dialogue",content:"你确定要挑战它吗？"},
  ],
  choices:[
    {text:"挑战守护者",next:"combat_secret_realm_guardian"},
    {text:"先撤退",next:"spirit_world_training"},
  ],
},

"combat_secret_realm_guardian":{
  text:[
    {type:"danger",content:"灵界守护者发起了攻击！"},
  ],
  choices:[{text:"战斗",next:"combat_secret_realm_guardian"}],
  combat:{enemy:"spirit_realm_guardian",onWin:"guardian_victory",onLose:"guardian_defeat"},
},

"guardian_victory":{
  text:[
    {type:"narration",content:"你击败了灵界守护者！"},
    {type:"system_msg",content:"✨ 获得仙剑·天罡！"},
    {type:"narration",content:"在守护者的巢穴中，你找到了一柄仙剑和大量宝物。"},
    {type:"dialogue",content:"你的实力已足以引起天界的注意。是时候尝试飞升天界了。"},
  ],
  choices:[
    {text:"前往天界",next:"celestial_world_intro"},
    {text:"返回修炼",next:"spirit_world_training"},
  ],
  enter:{item:"immortal_sword",exp:1000000,stone:50000,achievement:"celestial_champion"},
},

"guardian_defeat":{
  text:[
    {type:"danger",content:"守护者太强大了……你不得不撤退。"},
    {type:"narration",content:"继续修炼，积攒实力后再来挑战。"},
  ],
  choices:[
    {text:"返回修炼",next:"spirit_world_training"},
  ],
},

// ==================== 天界剧情 ====================
"celestial_world_intro":{
  text:[
    {type:"chapter_title",content:"天 界 篇 · 登 天 之 路"},
    {type:"narration",content:"你来到灵界与天界的交界处。天界之门矗立在前方，散发着耀眼的仙光。"},
    {type:"dialogue",content:"要进入天界，必须通过天劫考验。这是对所有修士的最终考验。"},
    {type:"danger",content:"天劫之威足以毁灭一切，但也是通往至高境界的唯一道路。"},
  ],
  choices:[
    {text:"迎接天劫！",next:"celestial_tribulation"},
    {text:"先回去修炼",next:"spirit_world_training"},
  ],
  enter:{cultUp:2,exp:5000000},
},

"celestial_tribulation":{
  text:[
    {type:"danger",content:"天劫降临！九天雷鸣！"},
    {type:"narration",content:"天劫之雷劈向你，这是你修仙路上最危险的一刻。"},
  ],
  choices:[{text:"迎击天劫",next:"combat_celestial_tribulation"}],
  combat:{enemy:"celestial_beast",onWin:"celestial_world_arrive",onLose:"celestial_tribulation_fail"},
},

"celestial_tribulation_fail":{
  text:[
    {type:"danger",content:"天劫之力太过强大，你身受重伤。"},
    {type:"narration",content:"你需要恢复后再来挑战天劫。"},
  ],
  choices:[
    {text:"返回修炼",next:"spirit_world_training"},
  ],
  enter:{hp:-500},
},

"celestial_world_arrive":{
  text:[
    {type:"chapter_title",content:"天 界 · 仙 人 之 境"},
    {type:"narration",content:"渡过天劫，你成功飞升天界！"},
    {type:"system_msg",content:"✨ 突破至：飞升成仙！"},
    {type:"narration",content:"天界仙气弥漫，随处可见仙兽灵禽。你的修为在天界只是入门，但已经超越了凡间的一切。"},
    {type:"dialogue",content:"恭喜道友飞升成功。天界浩瀚无边，机遇与危险并存。"},
    {type:"narration",content:"一位仙人向你走来，面带微笑。"},
  ],
  choices:[
    {text:"请教仙人",next:"celestial_guide"},
  ],
  enter:{cultUp:1,achievement:"ascension"},
},

"celestial_guide":{
  text:[
    {type:"dialogue",content:"天界分为数个区域：仙人聚居的仙城、仙兽出没的仙野、以及传说中的混沌之地。"},
    {type:"dialogue",content:"在仙城可以交易、修炼；在仙野可以狩猎仙兽、采集仙草；混沌之地则藏着远古的秘密。"},
    {type:"dialogue",content:"每隔一段时间，天界会举办仙界大比，优胜者可获得仙器赏赐。"},
    {type:"narration",content:"你可以自由探索天界，修炼、战斗、种植、参加拍卖会，直到你觉得自己足够强大，再去挑战终极试炼。"},
  ],
  choices:[
    {text:"前往仙城",next:"celestial_city"},
    {text:"探索仙野",next:"_wild_menu"},
    {text:"修炼打坐",next:"cultivate_meditate"},
    {text:"参加拍卖会",next:"_auction_menu"},
    {text:"返回所在城镇",next:"_wild_return"},
  ],
  enter:{exp:10000000,stone:50000},
},

"celestial_city":{
  text:[
    {type:"chapter_title",content:"天 界 仙 城"},
    {type:"narration",content:"仙城是天界最繁华之地，仙人云集，宝物汇聚。"},
    {type:"narration",content:"你在仙城中见到了许多传说中的存在，也发现了很多稀世珍宝。"},
  ],
  choices:[
    {text:"参加仙界拍卖会",next:"_auction_menu"},
    {text:"打听混沌之地的消息",next:"celestial_chaos_rumor"},
    {text:"前往仙界大比报名处",next:"celestial_tournament"},
    {text:"返回修炼",next:"celestial_training"},
    {text:"探索仙野",next:"_wild_menu"},
    {text:"返回所在城镇",next:"_wild_return"},
  ],
},

"celestial_chaos_rumor":{
  text:[
    {type:"danger",content:"混沌之地——天界最危险的禁地。"},
    {type:"dialogue",content:"混沌之地在仙界边缘，那里有一只虚空古魔盘踞。据说击败它，就能获得超脱天道的力量。"},
    {type:"dialogue",content:"但无数年来，进入混沌之地的仙人，没有一个活着回来。"},
  ],
  choices:[
    {text:"前往混沌之地",next:"celestial_chaos_realm"},
    {text:"返回仙城",next:"celestial_city"},
  ],
},

"celestial_tournament":{
  text:[
    {type:"chapter_title",content:"仙 界 大 比"},
    {type:"narration",content:"仙界大比是天界最盛大的比武大会，所有仙人都可以参加。"},
    {type:"dialogue",content:"第一轮对手是天界守卫，击败它即可进入下一轮。"},
  ],
  choices:[
    {text:"参加大比",next:"combat_celestial_tournament_1"},
    {text:"暂时放弃",next:"celestial_city"},
  ],
},

"combat_celestial_tournament_1":{
  text:[
    {type:"narration",content:"天界守卫走上擂台，向你发起挑战。"},
  ],
  choices:[{text:"战斗",next:"combat_celestial_tournament_1"}],
  combat:{enemy:"celestial_guardian",onWin:"tournament_round2",onLose:"tournament_lose"},
},

"tournament_round2":{
  text:[
    {type:"narration",content:"你击败了天界守卫！观众席上爆发出欢呼声。"},
    {type:"dialogue",content:"不错！接下来是你的最终对手——虚空古魔的化身。"},
    {type:"danger",content:"虚空古魔的化身出现了！它虽然只是化身，但实力已经恐怖至极。"},
  ],
  choices:[
    {text:"迎战古魔化身",next:"combat_celestial_tournament_2"},
    {text:"认输退出",next:"celestial_city"},
  ],
  enter:{exp:500000,stone:10000},
},

"combat_celestial_tournament_2":{
  text:[
    {type:"danger",content:"虚空古魔化身发起了攻击！"},
  ],
  choices:[{text:"战斗",next:"combat_celestial_tournament_2"}],
  combat:{enemy:"void_ancient_demon",onWin:"tournament_win",onLose:"tournament_lose"},
},

"tournament_win":{
  text:[
    {type:"chapter_title",content:"仙 界 大 比 · 冠 军"},
    {type:"narration",content:"你击败了虚空古魔的化身！全场震惊！"},
    {type:"system_msg",content:"✨ 仙界大比冠军！获得造化鼎！"},
    {type:"dialogue",content:"不可思议……你竟然击败了古魔化身。天界为你而震动！"},
    {type:"narration",content:"你获得了仙界大比的最高荣誉和奖励。"},
    {type:"dialogue",content:"你已经有了挑战混沌之地的实力。去吧，天道的终极秘密就在那里。"},
  ],
  choices:[
    {text:"前往混沌之地",next:"celestial_chaos_realm"},
    {text:"返回仙城",next:"celestial_city"},
  ],
  enter:{item:"creation_cauldron",exp:5000000,stone:100000,achievement:"celestial_champion"},
},

"tournament_lose":{
  text:[
    {type:"danger",content:"你在大比中落败。"},
    {type:"narration",content:"虽然输了，但你在战斗中获得了宝贵的经验。"},
  ],
  choices:[
    {text:"返回仙城",next:"celestial_city"},
  ],
  enter:{exp:200000},
},

"celestial_training":{
  text:[
    {type:"chapter_title",content:"天 界 修 炼"},
    {type:"narration",content:"你在天界找到一处灵气汇聚之地修炼。这里的修炼效率远超灵界。"},
    {type:"dialogue",content:"你可以修炼、探索、参加拍卖会，或种植仙草。"},
  ],
  choices:[
    {text:"修炼打坐",next:"cultivate_meditate"},
    {text:"探索仙野",next:"_wild_menu"},
    {text:"参加拍卖会",next:"_auction_menu"},
    {text:"前往仙城",next:"celestial_city"},
    {text:"前往混沌之地",next:"celestial_chaos_realm"},
    {text:"挑战天道（结局）",next:"ending_choice"},
    {text:"返回所在城镇",next:"_wild_return"},
  ],
},

"celestial_chaos_realm":{
  text:[
    {type:"chapter_title",content:"混 沌 之 地"},
    {type:"danger",content:"混沌之地——天道边缘的禁地。"},
    {type:"narration",content:"你踏入混沌之地，四周是无尽的虚空和混沌之力。这里没有时间，没有方向，只有纯粹的毁灭与创造之力。"},
    {type:"danger",content:"虚空古魔的真身就沉睡在这里。"},
  ],
  choices:[
    {text:"挑战虚空古魔真身",next:"combat_void_demon_true"},
    {text:"先探索外围",next:"chaos_realm_explore"},
    {text:"暂时撤退",next:"celestial_city"},
  ],
},

"chaos_realm_explore":{
  text:[
    {type:"narration",content:"你在混沌之地外围探索，发现了一些远古遗物。"},
    {type:"reward",content:"获得大量经验和仙草！"},
  ],
  choices:[
    {text:"挑战古魔真身",next:"combat_void_demon_true"},
    {text:"返回仙城",next:"celestial_city"},
  ],
  enter:{exp:2000000,stone:50000,item:"immortal_herb"},
},

"combat_void_demon_true":{
  text:[
    {type:"danger",content:"虚空古魔真身苏醒了！"},
    {type:"narration",content:"这是修仙路上最强的敌人。古魔的力量足以毁天灭地。"},
  ],
  choices:[{text:"终极之战",next:"combat_void_demon_true"}],
  combat:{enemy:"void_ancient_demon",onWin:"ultimate_victory",onLose:"ultimate_defeat"},
},

"ultimate_victory":{
  text:[
    {type:"chapter_title",content:"终 极 之 战 · 胜 利"},
    {type:"narration",content:"你击败了虚空古魔真身！"},
    {type:"narration",content:"在古魔消散的瞬间，你感受到了天道的召唤。混沌之地的力量涌入你体内，你的修为达到了前所未有的高度。"},
    {type:"system_msg",content:"✨ 你已超越天道！"},
    {type:"dialogue",content:"你……你竟然做到了。从今以后，你便是天道之上的存在。"},
  ],
  choices:[
    {text:"选择你的最终结局",next:"ending_choice"},
  ],
  enter:{cultUp:2,exp:10000000,stone:200000,achievement:"celestial_champion"},
},

"ultimate_defeat":{
  text:[
    {type:"danger",content:"古魔真身太过强大……你被击退了。"},
    {type:"narration",content:"但你的实力已经足够震撼天界。继续修炼，终有一日你会战胜它。"},
  ],
  choices:[
    {text:"返回修炼",next:"celestial_training"},
  ],
  enter:{exp:1000000},
},

// ==================== 扩展副本·七玄门篇 ====================
"seven_profound_explore":{
  text:[
    {type:"chapter_title",content:"七 玄 门 · 深 入 探 索"},
    {type:"narration",content:"你决定在七玄门周围深入探索，看看有没有什么机缘。"},
    {type:"narration",content:"后山的密林中传来异响……"},
  ],
  choices:[
    {text:"前往后山查看",next:"seven_profound_back_mountain"},
    {text:"去藏经阁翻阅典籍",next:"seven_profound_library"},
    {text:"向师兄请教",next:"seven_profound_ask_senior"},
    {text:"返回修炼",next:"cultivate_meditate"},
    {text:"返回所在城镇",next:"_wild_return"},
  ],
},

"seven_profound_back_mountain":{
  text:[
    {type:"narration",content:"你来到后山密林，发现一只铁臂猿正在啃食灵果。"},
    {type:"dialogue",content:"这只妖兽似乎发现你了……"},
  ],
  choices:[
    {text:"击杀铁臂猿",next:"combat_back_mountain_ape"},
    {text:"悄悄绕过",next:"seven_profound_back_mountain_sneak"},
  ],
},

"combat_back_mountain_ape":{
  text:[],
  choices:[{text:"战斗",next:"combat_back_mountain_ape"}],
  combat:{enemy:"iron_ape",onWin:"back_mountain_victory",onLose:"back_mountain_defeat"},
},

"back_mountain_victory":{
  text:[
    {type:"narration",content:"你击败了铁臂猿！在它守护的地方，你发现了一株灵草。"},
    {type:"reward",content:"获得灵草！"},
  ],
  choices:[
    {text:"继续探索后山",next:"seven_profound_back_mountain"},
    {text:"返回",next:"cultivate_meditate"},
  ],
  enter:{exp:35,stone:8,item:"spirit_grass"},
},

"back_mountain_defeat":{
  text:[
    {type:"danger",content:"铁臂猿比你想象的强大……你被打伤逃回。"},
  ],
  choices:[
    {text:"返回修炼",next:"cultivate_meditate"},
  ],
  enter:{hp:-30},
},

"seven_profound_back_mountain_sneak":{
  text:[
    {type:"narration",content:"你悄悄绕过了铁臂猿，在密林深处发现了一个隐蔽的洞府。"},
    {type:"dialogue",content:"这是……前辈留下的洞府？"},
    {type:"narration",content:"洞府中有一本破旧的功法残卷和几枚灵石。"},
  ],
  choices:[
    {text:"拾取",next:"seven_profound_cave_loot"},
    {text:"小心查看",next:"seven_profound_cave_trap"},
  ],
},

"seven_profound_cave_loot":{
  text:[
    {type:"reward",content:"获得灵石和功法残卷！"},
    {type:"system_msg",content:"学会：剑气术！"},
  ],
  choices:[
    {text:"返回",next:"cultivate_meditate"},
  ],
  enter:{stone:30,technique:"sword_qi",exp:50},
},

"seven_profound_cave_trap":{
  text:[
    {type:"danger",content:"你触发了洞府的禁制！"},
    {type:"narration",content:"一道灵力冲击波击中了你，但你还是拿到了功法残卷。"},
  ],
  choices:[
    {text:"返回",next:"cultivate_meditate"},
  ],
  enter:{hp:-20,stone:20,technique:"sword_qi",exp:30},
},

"seven_profound_library":{
  text:[
    {type:"narration",content:"你在藏经阁翻阅典籍，发现了一本关于修炼基础的书。"},
    {type:"system_msg",content:"悟性提升！"},
  ],
  choices:[
    {text:"继续翻阅",next:"seven_profound_library_2"},
    {text:"返回",next:"cultivate_meditate"},
  ],
  enter:{exp:30,comp:1},
},

"seven_profound_library_2":{
  text:[
    {type:"narration",content:"你继续翻阅，在一本古籍中看到了关于仙蛊的记载。"},
    {type:"dialogue",content:"原来仙蛊可以通过喂养和融合来提升……"},
    {type:"system_msg",content:"了解更多修仙知识！"},
  ],
  choices:[
    {text:"返回",next:"cultivate_meditate"},
  ],
  enter:{exp:40,comp:1},
},

"seven_profound_ask_senior":{
  text:[
    {type:"dialogue",content:"师弟，修炼有什么不懂的尽管问。"},
    {type:"narration",content:"师兄耐心地为你讲解了修炼中的一些注意事项。"},
    {type:"system_msg",content:"悟性和机缘提升！"},
  ],
  choices:[
    {text:"返回",next:"cultivate_meditate"},
  ],
  enter:{comp:1,luck:1,exp:20},
},

// ==================== 天南篇扩展 ====================
"tiannan_free_explore":{
  text:[
    {type:"chapter_title",content:"天 南 · 修 仙 之 地"},
    {type:"narration",content:"天南修仙界地域辽阔，天南坊市城是其中最繁华的城市。你可以在城中交易、探索城外荒野、前往附近城镇。"},
  ],
  choices:[
    {text:"探索天南坊市城外荒野",next:"_wild_explore_天南坊市城"},
    {text:"前往黄枫谷",next:"tiannan_huangfeng"},
    {text:"前往长安城",next:"_return_to_wild_长安城"},
    {text:"前往太南谷",next:"_return_to_wild_太南谷"},
    {text:"寻找机缘",next:"tiannan_adventure"},
    {text:"找张铁交付千年药草",next:"side_quest_zhangtie_deliver",condition:{questActive:"sq_zhangtie_herb",item:"thousand_year_ginseng"}},
    {text:"寻找失踪的师妹陆云",next:"side_quest_missing_sister_complete",condition:{questActive:"sq_missing_sister"}},
    {text:"返回修炼",next:"cultivate_meditate"},
  ],
},

"tiannan_huangfeng":{
  text:[
    {type:"narration",content:"你来到黄枫谷，这里的灵木之术闻名天南。"},
    {type:"dialogue",content:"道友来黄枫谷有何贵干？"},
  ],
  choices:[
    {text:"请教修炼",next:"tiannan_huangfeng_learn"},
    {text:"交易物品",next:"_auction_menu"},
    {text:"返回",next:"tiannan_free_explore"},
  ],
},

"tiannan_huangfeng_learn":{
  text:[
    {type:"narration",content:"黄枫谷长老传授了你一些修炼心得。"},
    {type:"system_msg",content:"获得经验！"},
  ],
  choices:[
    {text:"返回",next:"tiannan_free_explore"},
  ],
  enter:{exp:200,comp:1},
},

"tiannan_adventure":{
  text:[
    {type:"narration",content:"你在天南寻找机缘……"},
    {type:"narration",content:"一处废弃的洞府引起了你的注意。"},
  ],
  choices:[
    {text:"探索洞府",next:"tiannan_cave"},
    {text:"返回",next:"tiannan_free_explore"},
  ],
},

"tiannan_cave":{
  text:[
    {type:"narration",content:"你进入废弃洞府，发现一只血目狼妖守护着一处宝物。"},
  ],
  choices:[
    {text:"击杀狼妖",next:"combat_tiannan_wolf"},
    {text:"撤退",next:"tiannan_free_explore"},
  ],
},

"combat_tiannan_wolf":{
  text:[],
  choices:[{text:"战斗",next:"combat_tiannan_wolf"}],
  combat:{enemy:"blood_wolf",onWin:"tiannan_cave_victory",onLose:"tiannan_cave_defeat"},
},

"tiannan_cave_victory":{
  text:[
    {type:"narration",content:"你击败了血目狼妖！在洞府深处找到了一些宝物。"},
    {type:"reward",content:"获得灵石、灵草和一枚筑基丹！"},
  ],
  choices:[
    {text:"返回",next:"tiannan_free_explore"},
  ],
  enter:{exp:150,stone:60,item:"foundation_pill",item2:"spirit_grass"},
},

"tiannan_cave_defeat":{
  text:[
    {type:"danger",content:"狼妖太强了，你不得不撤退。"},
  ],
  choices:[
    {text:"返回修炼",next:"cultivate_meditate"},
  ],
},

// ==================== 乱星海扩展 ====================
"luanxing_explore":{
  text:[
    {type:"chapter_title",content:"乱 星 海 · 海 域 探 索"},
    {type:"narration",content:"乱星海无边无际，海中灵兽众多，资源丰富。"},
  ],
  choices:[
    {text:"出海探索",next:"_wild_menu"},
    {text:"前往星宫",next:"luanxing_star_palace"},
    {text:"寻找蛟龙",next:"luanxing_sea_dragon"},
    {text:"返回修炼",next:"cultivate_meditate"},
    {text:"返回所在城镇",next:"_wild_return"},
  ],
},

"luanxing_star_palace":{
  text:[
    {type:"narration",content:"你来到星宫，这里是乱星海最大的势力。"},
    {type:"dialogue",content:"星宫每年举办试炼，通过者可获得丰厚奖励。"},
  ],
  choices:[
    {text:"参加星宫试炼",next:"combat_star_palace_trial"},
    {text:"交易物品",next:"_auction_menu"},
    {text:"返回",next:"luanxing_explore"},
  ],
},

"combat_star_palace_trial":{
  text:[
    {type:"narration",content:"星宫试炼开始！你将面对星宫守卫的挑战。"},
  ],
  choices:[{text:"战斗",next:"combat_star_palace_trial"}],
  combat:{enemy:"star_palace_guard",onWin:"star_palace_victory",onLose:"star_palace_defeat"},
},

"star_palace_victory":{
  text:[
    {type:"narration",content:"你通过了星宫试炼！"},
    {type:"reward",content:"获得灵石和星辰砂！"},
  ],
  choices:[
    {text:"返回",next:"luanxing_explore"},
  ],
  enter:{exp:300,stone:80,item:"star_sand"},
},

"star_palace_defeat":{
  text:[
    {type:"danger",content:"你未通过试炼……需要更加强大。"},
  ],
  choices:[
    {text:"返回修炼",next:"cultivate_meditate"},
  ],
},

"luanxing_sea_dragon":{
  text:[
    {type:"danger",content:"你在深海中发现了一条蛟龙的踪迹。"},
    {type:"narration",content:"蛟龙是乱星海最强的灵兽之一，击败它可以获得蛟龙血。"},
  ],
  choices:[
    {text:"挑战蛟龙",next:"combat_sea_dragon"},
    {text:"先撤退",next:"luanxing_explore"},
  ],
},

"combat_sea_dragon":{
  text:[
    {type:"danger",content:"蛟龙怒吼，海浪滔天！"},
  ],
  choices:[{text:"战斗",next:"combat_sea_dragon"}],
  combat:{enemy:"sea_dragon",onWin:"sea_dragon_victory",onLose:"sea_dragon_defeat"},
},

"sea_dragon_victory":{
  text:[
    {type:"narration",content:"你击败了蛟龙！获取了珍贵的蛟龙血。"},
    {type:"reward",content:"获得蛟龙血和大量经验！"},
  ],
  choices:[
    {text:"返回",next:"luanxing_explore"},
  ],
  enter:{exp:1000,stone:300,item:"dragon_blood"},
},

"sea_dragon_defeat":{
  text:[
    {type:"danger",content:"蛟龙太强了……你需要更强的修为。"},
  ],
  choices:[
    {text:"返回修炼",next:"cultivate_meditate"},
  ],
},

// ==================== 慕兰大战扩展 ====================
"mulan_explore":{
  text:[
    {type:"chapter_title",content:"慕 兰 大 战 · 战 火 纷 飞"},
    {type:"narration",content:"慕兰草原战火不断，你在战场上寻找机遇。"},
  ],
  choices:[
    {text:"探索慕兰战场",next:"_wild_menu"},
    {text:"挑战慕兰战将",next:"combat_mulan_chief"},
    {text:"寻找慕兰草原的秘境",next:"mulan_secret"},
    {text:"返回修炼",next:"cultivate_meditate"},
    {text:"返回所在城镇",next:"_wild_return"},
  ],
},

"combat_mulan_chief":{
  text:[
    {type:"danger",content:"慕兰大战将拦住了你的去路！"},
  ],
  choices:[{text:"战斗",next:"combat_mulan_chief"}],
  combat:{enemy:"mulan_war_chief",onWin:"mulan_chief_victory",onLose:"mulan_chief_defeat"},
},

"mulan_chief_victory":{
  text:[
    {type:"narration",content:"你击败了慕兰大战将！缴获了大量战利品。"},
    {type:"reward",content:"获得灵石和龙纹刀！"},
  ],
  choices:[
    {text:"返回",next:"mulan_explore"},
  ],
  enter:{exp:1200,stone:400,item:"dragon_pattern_blade"},
},

"mulan_chief_defeat":{
  text:[
    {type:"danger",content:"战将太强了，你需要更多准备。"},
  ],
  choices:[
    {text:"返回修炼",next:"cultivate_meditate"},
  ],
},

"mulan_secret":{
  text:[
    {type:"narration",content:"你在慕兰草原深处发现了一处隐秘的洞穴。"},
    {type:"dialogue",content:"这里似乎隐藏着什么……"},
    {type:"narration",content:"洞穴中传来一股淡淡的灵药香气。"},
  ],
  choices:[
    {text:"深入探索",next:"mulan_secret_deep"},
    {text:"返回",next:"mulan_explore"},
  ],
},

"mulan_secret_deep":{
  text:[
    {type:"narration",content:"你在洞穴深处发现了一株千年人参和大量灵石！"},
    {type:"reward",content:"获得大量宝物！"},
  ],
  choices:[
    {text:"返回",next:"mulan_explore"},
  ],
  enter:{exp:800,stone:500,item:"thousand_year_ginseng"},
},

// ==================== 坠魔谷扩展 ====================
"demo_valley_explore":{
  text:[
    {type:"chapter_title",content:"坠 魔 谷 · 深 入 魔 域"},
    {type:"danger",content:"坠魔谷深处魔气弥漫，每走一步都充满危险。"},
  ],
  choices:[
    {text:"深入魔域探索",next:"_wild_menu"},
    {text:"挑战魔将",next:"combat_demon_general"},
    {text:"寻找魔主宝藏",next:"demon_valley_treasure"},
    {text:"返回修炼",next:"cultivate_meditate"},
    {text:"返回所在城镇",next:"_wild_return"},
  ],
},

"combat_demon_general":{
  text:[
    {type:"danger",content:"坠魔谷的魔将出现了！"},
  ],
  choices:[{text:"战斗",next:"combat_demon_general"}],
  combat:{enemy:"demon_general",onWin:"demon_general_victory",onLose:"demon_general_defeat"},
},

"demon_general_victory":{
  text:[
    {type:"narration",content:"你击败了魔将！获得了魔将的宝物。"},
    {type:"reward",content:"获得天魔功和大量灵石！"},
  ],
  choices:[
    {text:"返回",next:"demo_valley_explore"},
  ],
  enter:{exp:2500,stone:800,technique:"heaven_demon"},
},

"demon_general_defeat":{
  text:[
    {type:"danger",content:"魔将太强了……你需要更强的实力。"},
  ],
  choices:[
    {text:"返回修炼",next:"cultivate_meditate"},
  ],
},

"demon_valley_treasure":{
  text:[
    {type:"narration",content:"你在坠魔谷深处发现了一处魔主的藏宝地。"},
    {type:"danger",content:"但有古魔残尸守护着宝藏。"},
  ],
  choices:[
    {text:"挑战古魔残尸",next:"combat_ancient_demon"},
    {text:"撤退",next:"demo_valley_explore"},
  ],
},

"combat_ancient_demon":{
  text:[
    {type:"danger",content:"古魔残尸苏醒了！"},
  ],
  choices:[{text:"战斗",next:"combat_ancient_demon"}],
  combat:{enemy:"ancient_demon corpse",onWin:"ancient_demon_victory",onLose:"ancient_demon_defeat"},
},

"ancient_demon_victory":{
  text:[
    {type:"narration",content:"你击败了古魔残尸！在它的宝藏中找到了虚空蛊和大量宝物。"},
    {type:"reward",content:"获得虚空蛊和大量经验！"},
  ],
  choices:[
    {text:"返回",next:"demo_valley_explore"},
  ],
  enter:{exp:3000,stone:1000,guWorm:"void_gu"},
},

"ancient_demon_defeat":{
  text:[
    {type:"danger",content:"古魔残尸太过强大……"},
  ],
  choices:[
    {text:"返回修炼",next:"cultivate_meditate"},
  ],
},

// ==================== 永久主线 ====================
// 七玄门篇
"pmain_qixuan_start":{
  chapter:"主线 · 七玄门",
  text:[
    {type:"chapter_title",content:"主 线 · 七 玄 门 修 行"},
    {type:"system_msg",content:"你已自动加入七玄门，成为外门弟子。"},
    {type:"narration",content:"七玄门虽小，却是你修仙之路的起点。门中有藏经阁、丹房、武技堂，后山更有灵药园和古洞。"},
    {type:"dialogue",content:"韩师弟，你既然入了七玄门，便要恪守门规，每日勤勉修炼。掌门墨居仁有令，弟子须达到筑基期方可外出历练。"},
    {type:"narration",content:"你在七玄门中安心修炼，利用小绿瓶催熟灵草，修为日渐精进。"},
    {type:"system_msg",content:"当前目标：提升修为至筑基期（练气6层以上），达到后可前往天南历练。"},
  ],
  choices:[
    {text:"前往后山探索",next:"seven_profound_back_mountain"},
    {text:"去藏经阁翻阅典籍",next:"seven_profound_library"},
    {text:"向师兄请教修炼",next:"seven_profound_ask_senior"},
    {text:"闭关修炼",next:"cultivate_meditate"},
    {text:"查看七玄门门规与贡献",next:"pmain_qixuan_info"},
  ],
  enter:{flag:"joined_seven_profound"},
},

"pmain_qixuan_info":{
  chapter:"主线 · 七玄门",
  text:[
    {type:"narration",content:"七玄门门规："},
    {type:"dialogue",content:"一、弟子须勤勉修炼，不得懈怠。"},
    {type:"dialogue",content:"二、筑基期弟子可外出历练，但须定期回门派汇报。"},
    {type:"dialogue",content:"三、对门派贡献卓著者，可获赐丹药和功法。"},
    {type:"dialogue",content:"四、弟子可随时申请离开本门，但贡献度将清零。灵石和声望不受影响。"},
    {type:"system_msg",content:"你在七玄门的贡献度：0。达到一定贡献度后可领取门派奖励。"},
  ],
  choices:[
    {text:"返回",next:"pmain_qixuan_start"},
    {text:"申请离开七玄门（贡献清零，灵石声望不变）",next:"pmain_leave_qixuan"},
  ],
},

"pmain_leave_qixuan":{
  chapter:"主线 · 离开七玄门",
  text:[
    {type:"narration",content:"你向墨居仁师伯提出离开七玄门的请求。"},
    {type:"dialogue",content:"韩立，你既然决意外出历练，为师不拦你。只是你离开后，在门中的贡献将清零。你身上的灵石和声望不受影响。"},
    {type:"dialogue",content:"去吧，天南广阔，大有作为。若有朝一日功成名就，别忘了七玄门。"},
    {type:"system_msg",content:"你已离开七玄门。贡献度清零，灵石和声望保持不变。"},
    {type:"narration",content:"你收拾行囊，告别同门，踏上了前往天南的路。"},
  ],
  choices:[
    {text:"前往天南历练",next:"pmain_tiannan_start",effect:{flag:"left_qixuan"}},
  ],
  enter:{flag:"left_qixuan"},
},

// 天南篇
"pmain_tiannan_start":{
  chapter:"主线 · 天南历练",
  text:[
    {type:"chapter_title",content:"主 线 · 天 南 历 练"},
    {type:"narration",content:"天南修仙界地域辽阔，天南坊市城是其中最繁华的城市，黄枫谷是天南第一大派。"},
    {type:"narration",content:"天南坊市城下有荒野、洞天福地，周边还有长安城、太南谷等城镇，是修士历练的绝佳之地。"},
    {type:"system_msg",content:"当前目标：提升修为，在天南探索洞天福地，积累实力后可前往乱星海。"},
    {type:"narration",content:"你在黄枫谷的修炼十分顺利，小绿瓶催熟的灵草让你修为突飞猛进。"},
  ],
  choices:[
    {text:"探索天南坊市城外荒野",next:"_wild_explore_天南坊市城"},
    {text:"前往天南坊市城",next:"tiannan_free_explore"},
    {text:"前往长安城",next:"_return_to_wild_长安城"},
    {text:"前往太南谷",next:"_return_to_wild_太南谷"},
    {text:"寻找洞天福地",next:"tiannan_adventure"},
    {text:"闭关修炼",next:"cultivate_meditate"},
    {text:"前往乱星海（需结丹期以上）",next:"pmain_luanxing_start"},
  ],
},

// 乱星海篇
"pmain_luanxing_start":{
  chapter:"主线 · 乱星海探险",
  text:[
    {type:"chapter_title",content:"主 线 · 乱 星 海 探 险"},
    {type:"narration",content:"乱星海无边无际，海中灵兽众多，资源丰富。这里是修士的宝库，也是险地。"},
    {type:"narration",content:"你乘船来到乱星海，星宫是此地最大的势力，掌控着海域秩序。"},
    {type:"dialogue",content:"道友，乱星海中蛟龙出没，海兽横行。不过若能猎杀灵兽，收获颇丰。"},
    {type:"system_msg",content:"当前目标：在乱星海猎杀灵兽，提升修为至元婴期，寻找虚天殿的线索。"},
  ],
  choices:[
    {text:"出海探索",next:"_wild_menu"},
    {text:"前往星宫参加试炼",next:"luanxing_star_palace"},
    {text:"寻找蛟龙",next:"luanxing_sea_dragon"},
    {text:"闭关修炼",next:"cultivate_meditate"},
    {text:"前往虚天殿（需元婴期以上）",next:"pmain_xutiandian_start"},
    {text:"返回所在城镇",next:"_wild_return"},
  ],
},

// 虚天殿篇
"pmain_xutiandian_start":{
  chapter:"主线 · 虚天殿之行",
  text:[
    {type:"chapter_title",content:"主 线 · 虚 天 殿 之 行"},
    {type:"narration",content:"虚天殿是乱星海深处的上古遗迹，传说其中藏有虚天残图和大量古宝。"},
    {type:"danger",content:"虚天殿中机关重重，更有强大的守护傀儡镇守，修为不足者有去无回。"},
    {type:"narration",content:"你来到虚天殿入口，巨大的殿门上刻满了远古符文，散发出幽幽光芒。"},
    {type:"dialogue",content:"这里便是虚天殿……传闻殿中有虚天残图，集齐残图可找到上古传承。"},
    {type:"system_msg",content:"当前目标：探索虚天殿，击败守护傀儡，获取古宝和虚天残图。"},
  ],
  choices:[
    {text:"进入虚天殿探索",next:"pmain_xutiandian_explore"},
    {text:"出海寻找灵兽",next:"_wild_menu"},
    {text:"闭关修炼",next:"cultivate_meditate"},
    {text:"前往慕兰草原（需化神期以上）",next:"pmain_mulan_start"},
    {text:"返回所在城镇",next:"_wild_return"},
  ],
},

"pmain_xutiandian_explore":{
  text:[
    {type:"narration",content:"你推开沉重的殿门，走入虚天殿内部。殿中空旷幽深，四周墙壁上的符文时明时暗。"},
    {type:"narration",content:"忽然，殿中光芒大作——一尊金甲傀儡从地面升起，手持长戟，向你冲来！"},
    {type:"danger",content:"金甲傀儡！虚天殿的守护者！"},
  ],
  choices:[
    {text:"迎战金甲傀儡",next:"pmain_combat_puppet"},
    {text:"先撤退",next:"pmain_xutiandian_start"},
  ],
},

"pmain_combat_puppet":{
  text:[],
  choices:[{text:"战斗中",next:"pmain_combat_puppet"}],
  combat:{enemy:"star_palace_guard",onWin:"pmain_xutiandian_victory",onLose:"pmain_xutiandian_defeat"},
},

"pmain_xutiandian_victory":{
  text:[
    {type:"narration",content:"你击败了金甲傀儡！在殿中深处，你找到了数件古宝和大量灵石。"},
    {type:"reward",content:"获得：古宝星辰砂、大量灵石、5000经验！"},
    {type:"system_msg",content:"虚天殿探索完成！修为大幅提升。"},
  ],
  choices:[
    {text:"返回修炼",next:"cultivate_meditate"},
  ],
  enter:{exp:5000,stone:500,item:"star_sand"},
},

"pmain_xutiandian_defeat":{
  text:[
    {type:"danger",content:"金甲傀儡太过强大，你不得不撤退出虚天殿。"},
    {type:"system_msg",content:"需要更强的修为才能通过虚天殿。"},
  ],
  choices:[
    {text:"返回修炼",next:"cultivate_meditate"},
  ],
},

// 慕兰大战篇
"pmain_mulan_start":{
  chapter:"主线 · 慕兰大战",
  text:[
    {type:"chapter_title",content:"主 线 · 慕 兰 大 战"},
    {type:"narration",content:"慕兰草原位于天南之北，是慕兰族修士的领地。慕兰族与天南修士世代不和，战火频发。"},
    {type:"danger",content:"慕兰族大军压境，天南修士联盟正在集结！大战一触即发！"},
    {type:"dialogue",content:"道友，天南危矣！慕兰族来势汹汹，我等修士当共赴国难！"},
    {type:"narration",content:"你随天南联军来到慕兰草原前线。草原广袤无垠，远处可见慕兰族的法阵在闪烁。"},
    {type:"system_msg",content:"当前目标：参与慕兰大战，击败慕兰族修士，保卫天南。"},
  ],
  choices:[
    {text:"参加前线战斗",next:"pmain_mulan_battle"},
    {text:"前往敌后侦察",next:"pmain_mulan_recon"},
    {text:"闭关修炼",next:"cultivate_meditate"},
    {text:"前往坠魔谷（需化神后期）",next:"pmain_zhuimogu_start"},
    {text:"返回所在城镇",next:"_wild_return"},
  ],
},

"pmain_mulan_battle":{
  text:[
    {type:"danger",content:"慕兰族修士向你发起攻击！"},
    {type:"narration",content:"战场上法术横飞，你面前出现一名慕兰族高手。"},
  ],
  choices:[
    {text:"迎战慕兰高手",next:"pmain_combat_mulan"},
    {text:"暂时撤退",next:"pmain_mulan_start"},
  ],
},

"pmain_combat_mulan":{
  text:[],
  choices:[{text:"战斗中",next:"pmain_combat_mulan"}],
  combat:{enemy:"mulan_beast_rider",onWin:"pmain_mulan_victory",onLose:"pmain_mulan_defeat"},
},

"pmain_mulan_victory":{
  text:[
    {type:"narration",content:"你击败了慕兰族高手！天南联军士气大振。"},
    {type:"reward",content:"获得大量灵石和声望！"},
    {type:"dialogue",content:"道友武艺超群！有你相助，天南无忧矣！"},
    {type:"system_msg",content:"慕兰大战阶段性胜利。继续战斗可获得更多声望。"},
  ],
  choices:[
    {text:"继续战斗",next:"pmain_mulan_battle"},
    {text:"返回修炼",next:"cultivate_meditate"},
  ],
  enter:{exp:8000,stone:800},
},

"pmain_mulan_defeat":{
  text:[
    {type:"danger",content:"慕兰高手实力强横，你不得不后撤。"},
    {type:"system_msg",content:"需要更强的修为才能在慕兰大战中立足。"},
  ],
  choices:[
    {text:"返回修炼",next:"cultivate_meditate"},
  ],
},

"pmain_mulan_recon":{
  text:[
    {type:"narration",content:"你潜入慕兰族后方，发现了一处秘密营地。"},
    {type:"narration",content:"营地中似乎藏有慕兰族的战略物资和功法。"},
    {type:"danger",content:"守卫发现了你的踪迹！"},
  ],
  choices:[
    {text:"强行夺取",next:"pmain_mulan_recon_fight"},
    {text:"撤退",next:"pmain_mulan_start"},
  ],
},

"pmain_mulan_recon_fight":{
  text:[],
  choices:[{text:"战斗",next:"pmain_mulan_recon_fight"}],
  combat:{enemy:"mulan_beast_rider",onWin:"pmain_mulan_recon_victory",onLose:"pmain_mulan_defeat"},
},

"pmain_mulan_recon_victory":{
  text:[
    {type:"narration",content:"你击败守卫，夺取了慕兰族的物资和稀有材料！"},
    {type:"reward",content:"获得：星辰砂、600灵石、6000经验！"},
  ],
  choices:[
    {text:"返回",next:"pmain_mulan_start"},
  ],
  enter:{exp:6000,stone:600,item:"star_sand"},
},

// 坠魔谷篇
"pmain_zhuimogu_start":{
  chapter:"主线 · 坠魔谷探秘",
  text:[
    {type:"chapter_title",content:"主 线 · 坠 魔 谷 探 秘"},
    {type:"narration",content:"坠魔谷是天南最凶险之地之一。传说远古时有大魔陨落于此，谷中魔气弥漫，却也有无数上古遗宝。"},
    {type:"danger",content:"谷中古魔残尸横行，更有魔气侵蚀心智，心性不坚者入谷必死。"},
    {type:"narration",content:"你来到坠魔谷入口，漆黑的雾气从谷中涌出，隐约可闻鬼哭狼嚎。"},
    {type:"dialogue",content:"此处便是坠魔谷……传说谷中有上古魔修的传承。"},
    {type:"system_msg",content:"当前目标：深入坠魔谷，击败古魔残尸，获取上古遗宝。"},
  ],
  choices:[
    {text:"深入坠魔谷",next:"pmain_zhuimogu_explore"},
    {text:"在谷口探索",next:"_wild_menu"},
    {text:"闭关修炼",next:"cultivate_meditate"},
    {text:"尝试飞升灵界（需炼虚期以上）",next:"pmain_lingjie_start"},
    {text:"返回所在城镇",next:"_wild_return"},
  ],
},

"pmain_zhuimogu_explore":{
  text:[
    {type:"narration",content:"你踏入坠魔谷，四周魔气缭绕。你运转功法护住心神，缓缓前行。"},
    {type:"narration",content:"谷中到处是白骨和残破法器。忽然，一具古魔残尸从地上爬起，向扑来！"},
    {type:"danger",content:"古魔残尸！上古魔修的遗骸！"},
  ],
  choices:[
    {text:"迎战古魔残尸",next:"pmain_combat_demon"},
    {text:"撤退",next:"pmain_zhuimogu_start"},
  ],
},

"pmain_combat_demon":{
  text:[],
  choices:[{text:"战斗中",next:"pmain_combat_demon"}],
  combat:{enemy:"ancient_demon corpse",onWin:"pmain_zhuimogu_victory",onLose:"pmain_zhuimogu_defeat"},
},

"pmain_zhuimogu_victory":{
  text:[
    {type:"narration",content:"你击败了古魔残尸！在谷底深处，你发现了一座上古洞府。"},
    {type:"narration",content:"洞府中藏有上古魔修的宝物和大量灵石。"},
    {type:"reward",content:"获得：星辰砂、2000灵石、20000经验！"},
    {type:"system_msg",content:"坠魔谷探索完成！你的修为已臻至巅峰，可以尝试飞升了。"},
  ],
  choices:[
    {text:"返回修炼",next:"cultivate_meditate"},
  ],
  enter:{exp:20000,stone:2000,item:"star_sand"},
},

"pmain_zhuimogu_defeat":{
  text:[
    {type:"danger",content:"古魔残尸太过强大，你不得不撤出坠魔谷。"},
    {type:"system_msg",content:"需要更强的修为才能通过坠魔谷。"},
  ],
  choices:[
    {text:"返回修炼",next:"cultivate_meditate"},
  ],
},

// 灵界篇
"pmain_lingjie_start":{
  chapter:"主线 · 飞升灵界",
  text:[
    {type:"chapter_title",content:"主 线 · 飞 升 灵 界"},
    {type:"narration",content:"你已修至炼虚期，天灵之气已无法满足你的修炼。飞升灵界，是你唯一的出路。"},
    {type:"narration",content:"你盘膝而坐，运转全身灵力，引动天地异象。雷劫云层在天空中汇聚。"},
    {type:"danger",content:"飞升雷劫降临！这是修仙者最大的考验！"},
    {type:"system_msg",content:"当前目标：渡过飞升雷劫，飞升灵界！"},
  ],
  choices:[
    {text:"迎接飞升雷劫",next:"pmain_lingjie_tribulation"},
    {text:"继续修炼准备",next:"cultivate_meditate"},
  ],
},

"pmain_lingjie_tribulation":{
  text:[
    {type:"danger",content:"九天雷劫轰然落下！你全力抵御！"},
    {type:"narration",content:"第一道、第二道……你咬牙坚持，身体几乎被雷劫撕裂。"},
    {type:"narration",content:"第九道雷劫终于过去，天空中出现一道金光，灵界的接引之光！"},
    {type:"system_msg",content:"飞升成功！你已踏入灵界！"},
    {type:"reward",content:"修为飞升至灵界境！全属性大幅提升！"},
    {type:"narration",content:"灵界灵气浓郁，远超人界百倍。你感到前所未有的舒畅。"},
    {type:"chapter_title",content:"灵 界 · 新 的 征 途"},
    {type:"narration",content:"灵界广阔无边，强者如云。你开始了新的修炼征途。"},
    {type:"system_msg",content:"恭喜！你完成了凡人修仙的全部主线！但修仙之路永无止境……"},
  ],
  choices:[
    {text:"在灵界继续修炼",next:"cultivate_meditate"},
  ],
  enter:{exp:100000,stone:10000,achievement:"ascension"},
  dynamicEnding:true,
},

"combat_bandit":{
  text:[
    {type:"danger",content:"山贼！手持钢刀，面目凶狠！"},
    {type:"system_msg",content:"战斗开始！"},
  ],
  choices:[{text:"战斗中……",next:"combat_bandit"}],
  combat:{enemy:"bandit",onWin:"after_bandit",onLose:"death_bandit"},
},

"combat_star_guard":{
  text:[
    {type:"danger",content:"星宫守卫！身披战甲，手持长矛！"},
    {type:"system_msg",content:"战斗开始！"},
  ],
  choices:[{text:"战斗中……",next:"combat_star_guard"}],
},

"combat_void_loot":{
  text:[
    {type:"danger",content:"虚空兽！面目狰狞，空间之力涌动！"},
    {type:"system_msg",content:"战斗开始！"},
  ],
  choices:[{text:"战斗中……",next:"combat_void_loot"}],
},

"combat_mulan_shaman":{
  text:[
    {type:"danger",content:"慕兰萨满！手持骨杖，周身巫术灵光！"},
    {type:"system_msg",content:"战斗开始！"},
  ],
  choices:[{text:"战斗中……",next:"combat_mulan_shaman"}],
},

"combat_iron_bone":{
  text:[
    {type:"danger",content:"铁骨尸！铜皮铁骨，刀枪不入！"},
    {type:"system_msg",content:"战斗开始！"},
  ],
  choices:[{text:"战斗中……",next:"combat_iron_bone"}],
},

"combat_demon_lord":{
  text:[
    {type:"danger",content:"坠魔谷魔主！魔气滔天，威压如山！"},
    {type:"system_msg",content:"战斗开始！"},
  ],
  choices:[{text:"战斗中……",next:"combat_demon_lord"}],
  combat:{enemy:"demon_lord",onWin:"demon_valley_boss",onLose:"death_demon2"},
},

"combat_tribulation":{
  text:[
    {type:"danger",content:"天劫雷轰！天雷降世，万物颤抖！"},
    {type:"system_msg",content:"战斗开始！"},
  ],
  choices:[{text:"战斗中……",next:"combat_tribulation"}],
},

"combat_immortal_tribulation":{
  text:[
    {type:"danger",content:"仙劫降临！仙光万丈，天地变色！"},
    {type:"system_msg",content:"战斗开始！"},
  ],
  choices:[{text:"战斗中……",next:"combat_immortal_tribulation"}],
},

"combat_secret_realm_beast":{
  text:[
    {type:"danger",content:"灵界灵兽！气息强大，虎视眈眈！"},
    {type:"system_msg",content:"战斗开始！"},
  ],
  choices:[{text:"战斗中……",next:"combat_secret_realm_beast"}],
},

"combat_celestial_tribulation":{
  text:[
    {type:"danger",content:"天界天劫！九天雷动，仙威浩荡！"},
    {type:"system_msg",content:"战斗开始！"},
  ],
  choices:[{text:"战斗中……",next:"combat_celestial_tribulation"}],
},

// ==================== 主线支线任务 ====================
// 支线1：大师兄的千年药草
"side_quest_zhangtie_herb":{
  title:"支线·师兄的嘱托",
  text:[
    {type:"narration",content:"你问张铁是否有什么需要帮忙的。张铁犹豫片刻，开口道："},
    {type:"dialogue",content:"韩师弟，不瞒你说，为兄最近在修炼一门功法，已到了突破瓶颈的关口，却需要一株千年药草来辅助。"},
    {type:"dialogue",content:"我知道太南谷深处可能有此物，但那里妖兽凶猛，为兄一人去不了。你……可愿帮我这个忙？"},
  ],
  choices:[
    {text:"答应帮忙寻找千年药草",next:"side_quest_zhangtie_accept",effect:{flag:"sq_zhangtie_herb_accepted",storyQuest:{id:"sq_zhangtie_herb",name:"大师兄的千年药草",desc:"为张铁寻找一株千年药草",area:"太南谷",areaName:"太南谷"}}},
    {text:"婉拒，自己还有事",next:"after_boar"},
  ],
},

"side_quest_zhangtie_accept":{
  title:"支线·师兄的嘱托",
  text:[
    {type:"dialogue",content:"师弟，多谢你！千年药草一般在太南谷的深山里能找到，你若找到，给我带来，我传你一套防身功法！"},
    {type:"system_msg",content:"✅ 任务已接取：大师兄的千年药草（前往太南谷寻找千年药草）"},
  ],
  choices:[
    {text:"返回继续主线（任务已在任务面板，可随时前往太南谷）",next:"after_boar"},
  ],
  enter:{flag:"sq_zhangtie_herb_active"},
},

"side_quest_zhangtie_deliver":{
  title:"支线·师兄的嘱托",
  text:[
    {type:"narration",content:"你带着千年药草回来找到张铁。张铁看到药草，喜出望外。"},
    {type:"dialogue",content:"师弟，多谢你！这株药草对我至关重要。来，这是我答应传你的——铁骨功！"},
    {type:"system_msg",content:"✅ 任务完成：大师兄的千年药草"},
    {type:"system_msg",content:"学会：铁骨功！"},
  ],
  choices:[
    {text:"交付千年药草，学习铁骨功",next:"huangfeng_choices",effect:{flag:"sq_zhangtie_herb_done",technique:"iron_bone_art",completeStoryQuest:"sq_zhangtie_herb"}},
  ],
},

// 支线2：失踪的师妹
"side_quest_missing_sister":{
  title:"支线·失踪的师妹",
  text:[
    {type:"narration",content:"你向墨居仁师伯询问门中是否还有其他事情。"},
    {type:"dialogue",content:"墨居仁眉头一皱：「近日，我门下一名叫陆云的弟子外出采药未归，怕是在七玄门外的野林中遇了险。你既然入门，便替我去找找她。」"},
  ],
  choices:[
    {text:"接下寻找任务",next:"find_bottle",effect:{storyQuest:{id:"sq_missing_sister",name:"失踪的师妹",desc:"在野外寻找失踪的弟子陆云",area:"七玄门集镇",areaName:"七玄门集镇"}}},
    {text:"稍后再说",next:"find_bottle"},
  ],
},

// 支线3：炼丹材料收集
"side_quest_yanying_pill":{
  title:"支线·炼丹之助",
  text:[
    {type:"dialogue",content:"晏婴说她在炼制一种特殊丹药，需要3株灵草作为材料。如果你能帮忙收集，她愿意以丹药相赠。"},
  ],
  choices:[
    {text:"答应收集灵草",next:"yan_ying_meet",effect:{storyQuest:{id:"sq_yanying_grass",name:"炼丹之助",desc:"为晏婴收集3株灵草",area:"七玄门集镇",areaName:"七玄门集镇"}}},
    {text:"婉拒",next:"yan_ying_meet"},
  ],
},

// 支线2完成：失踪的师妹
"side_quest_missing_sister_complete":{
  title:"支线·失踪的师妹",
  text:[
    {type:"narration",content:"你四处打探陆云的下落。终于，在七玄门外的一片野林深处，你找到了受伤的陆云。"},
    {type:"dialogue",content:"多谢师兄相救！我以为再也回不去了……"},
    {type:"narration",content:"你护送陆云回到七玄门。墨居仁师伯对你大加赞赏，赐你一枚筑基丹作为奖励。"},
    {type:"system_msg",content:"✅ 任务完成：失踪的师妹"},
    {type:"system_msg",content:"获得：筑基丹×1、灵石×50"},
  ],
  choices:[
    {text:"继续修行",next:"huangfeng_choices",effect:{flag:"sq_missing_sister_done",item:"foundation_pill",stone:50,completeStoryQuest:"sq_missing_sister"}},
  ],
},

// 支线3完成：炼丹之助
"side_quest_yanying_complete":{
  title:"支线·炼丹之助",
  text:[
    {type:"narration",content:"你带着3株灵草回到晏婴处。晏婴接过灵草，喜笑颜开。"},
    {type:"dialogue",content:"韩郎，多谢你！这瓶补气丹送给你，是我的一点心意。日后若还需要灵草，尽管来找我。"},
    {type:"system_msg",content:"✅ 任务完成：炼丹之助"},
    {type:"system_msg",content:"获得：补气丹×3、灵石×30"},
  ],
  choices:[
    {text:"与晏婴继续交往",next:"yan_ying_meet",effect:{flag:"sq_yanying_grass_done",item:"qi_pill",count:3,stone:30,completeStoryQuest:"sq_yanying_grass"}},
  ],
},

// ============================================================
// 墨大夫样板章节 · 多路径解决/隐秘行动/继承/双重真相/长期回响
// 设计文档第十五章示范节点：验证整套系统
// ============================================================

"sq_modoctor_intro":{
  chapter:"支线·墨府疑云",
  text:[
    {type:"chapter_title",content:"墨 府 疑 云"},
    {type:"narration",content:"你听说墨居仁师伯年轻时人称「墨大夫」，曾在青牛山下行医多年，积攒了不少家产。"},
    {type:"narration",content:"近来你注意到墨大夫行为有些古怪——他频繁接见外人，深夜书房灯火通明，偶有诡异药味从其居所飘出。"},
    {type:"thought",content:"墨师伯似乎在暗中谋划什么。修仙界凶险，多一分了解便多一分把握。"},
    {type:"system_msg",content:"支线任务开启：墨府疑云（多路径解决示范）"},
  ],
  choices:[
    {text:"暗中调查墨大夫",next:"sq_modoctor_investigate",effect:{flag:"sq_modoctor_active",storyQuest:{id:"sq_modoctor",name:"墨府疑云",desc:"调查墨大夫的暗中谋划，决定如何处理此事",area:"qixuan",areaName:"七玄门"}}},
    {text:"暂不介入",next:"_wild_return"},
  ],
},

// 阶段一：前期观察
"sq_modoctor_investigate":{
  text:[
    {type:"narration",content:"你开始暗中观察墨大夫的行踪。经过数日跟踪，你发现以下线索："},
    {type:"narration",content:"1. 墨大夫常在深夜会见一名黑衣修士，此人修为不低于筑基期。"},
    {type:"narration",content:"2. 墨府后院有一座药园，种满了罕见灵药，由两名药童看护。"},
    {type:"narration",content:"3. 墨大夫有一名养女墨彩环，掌管府中账目，对墨大夫十分敬重。"},
    {type:"narration",content:"4. 墨大夫书房中藏有大量医书丹方，其中不乏邪修功法残页。"},
    {type:"thought",content:"看来墨大夫并非表面那般慈祥。他似乎在筹划某种邪术，可能涉及夺舍或采补。"},
  ],
  choices:[
    {text:"继续深入调查（试探墨彩环）",next:"sq_modoctor_probe_caibuan"},
    {text:"潜入书房搜集证据",next:"sq_modoctor_sneak_study"},
    {text:"直接质问墨大夫",next:"sq_modoctor_confront_early"},
    {text:"先去结交墨彩环建立关系",next:"sq_modoctor_befriend_caibuan"},
  ],
  enter:{flag:"modoctor_investigated"},
},

// 路径A：试探墨彩环
"sq_modoctor_probe_caibuan":{
  text:[
    {type:"narration",content:"你找到墨彩环，旁敲侧击地询问墨大夫近况。"},
    {type:"dialogue",content:"墨姑娘，近来师伯可好？我见他似乎操劳过度……"},
    {type:"narration",content:"墨彩环神色微变，随即恢复如常。"},
    {type:"dialogue",content:"父亲大人精力充沛，多谢韩兄弟关心。只是近来事务繁忙，不便见客。」 ——墨彩环语气中带着一丝警惕。"},
    {type:"thought",content:"她的反应说明她知道些什么，但不愿透露。或许需要先取得她的信任。"},
  ],
  choices:[
    {text:"继续追问",next:"sq_modoctor_caibuan_refuse"},
    {text:"转而结交墨彩环",next:"sq_modoctor_befriend_caibuan"},
    {text:"潜入书房搜集证据",next:"sq_modoctor_sneak_study"},
  ],
  enter:{flag:"probed_caibuan"},
},

"sq_modoctor_caibuan_refuse":{
  text:[
    {type:"dialogue",content:"墨姑娘，我总觉得师伯近来行为有异……你是否知道些什么？"},
    {type:"narration",content:"墨彩环脸色一沉，语气转冷。"},
    {type:"dialogue",content:"韩兄弟，父亲大人的事，自有父亲大人做主。你若无事，请回吧。」 ——她显然不愿多说。"},
    {type:"thought",content:"操之过急了。她对我产生了戒心，日后行事需更加小心。"},
  ],
  choices:[
    {text:"暂时退避",next:"sq_modoctor_investigate",effect:{flag:"caibuan_suspicious"}},
  ],
  enter:{flag:"caibuan_alienated"},
},

// 路径B：潜入书房
"sq_modoctor_sneak_study":{
  text:[
    {type:"narration",content:"你趁夜色潜入墨大夫的书房。书房内陈设古朴，书架上摆满了医书丹方。"},
    {type:"narration",content:"你在书案下发现一个暗格，里面藏着一本黑色封皮的册子——《夺舍秘术·残卷》。"},
    {type:"danger",content:"册中记载：修炼此术者可夺他人肉身，延续寿元。但需修为相近、体质相合之人方可成功。"},
    {type:"thought",content:"果然！墨大夫在修炼夺舍之术！他收我为徒，莫非……就是为了夺我的身体？！"},
    {type:"narration",content:"你强压怒火，将册子放回原处。此时门外传来脚步声——"},
  ],
  choices:[
    {text:"藏匿躲避",next:"sq_modoctor_hide_success"},
    {text:"翻窗逃离",next:"sq_modoctor_flee_study"},
  ],
  enter:{flag:"found_evil_book"},
},

"sq_modoctor_hide_success":{
  text:[
    {type:"narration",content:"你迅速躲入书架后的阴影中。墨大夫推门而入，目光在书房中扫视一圈，似乎察觉到什么。"},
    {type:"dialogue",content:"奇怪……似乎有人来过。」 ——墨大夫喃喃自语，随即锁好暗格离去。"},
    {type:"system_msg",content:"你已掌握墨大夫修炼夺舍术的确凿证据。"},
    {type:"thought",content:"证据到手。接下来该如何处置？是公开揭发、暗中反杀、还是……反客为主？"},
  ],
  choices:[
    {text:"公开揭发墨大夫",next:"sq_modoctor_confront_public"},
    {text:"设伏反杀墨大夫（原著路线）",next:"sq_modoctor_ambush_plan"},
    {text:"暗中布局，夺取墨府",next:"sq_modoctor_secret_takeover"},
    {text:"逃离七玄门",next:"sq_modoctor_flee_sect"},
  ],
},

"sq_modoctor_flee_study":{
  text:[
    {type:"danger",content:"你翻窗时不慎碰倒花瓶，「哐当」一声巨响！"},
    {type:"dialogue",content:"谁在那里！」 ——墨大夫的怒喝传来，一道凌厉的掌风袭来！"},
    {type:"narration",content:"你被掌风扫中，受伤不轻，但侥幸逃出书房。"},
    {type:"system_msg",content:"墨大夫已发现你的窥探！关系恶化，他可能对你动手。"},
  ],
  choices:[
    {text:"先去疗伤，再做打算",next:"sq_modoctor_investigate",effect:{flag:"modoctor_hostile"}},
  ],
  enter:{flag:"caught_sneaking"},
},

// 路径C：结交墨彩环
"sq_modoctor_befriend_caibuan":{
  text:[
    {type:"narration",content:"你决定先与墨彩环建立良好关系，或许日后能从她口中得知真相。"},
    {type:"narration",content:"你时常帮墨彩环打理药园、分拣灵药，渐渐取得了她的信任。"},
    {type:"dialogue",content:"韩兄弟，你为人诚恳，不似其他弟子那般浮躁。这株养神草送你，算是我的一点心意。」 ——墨彩环微笑道。"},
    {type:"system_msg",content:"与墨彩环关系提升。你获得了她的信任。"},
  ],
  choices:[
    {text:"试探她关于墨大夫的事",next:"sq_modoctor_caibuan_trust_reveal",condition:{flag:"caibuan_trust"}},
    {text:"继续加深关系",next:"sq_modoctor_caibuan_deepen",effect:{flag:"caibuan_trust"}},
    {text:"潜入书房搜集证据",next:"sq_modoctor_sneak_study"},
  ],
  enter:{flag:"caibuan_friend"},
},

"sq_modoctor_caibuan_deepen":{
  text:[
    {type:"narration",content:"你与墨彩环往来日深。她向你吐露了心事。"},
    {type:"dialogue",content:"韩兄弟，实不相瞒……父亲大人近来变得很奇怪。他常在深夜与人密谈，还让我准备许多生魂丹的材料。我担心他……走了邪路。"},
    {type:"thought",content:"她果然知道一些内情，而且对墨大夫的行为也感到不安。"},
  ],
  choices:[
    {text:"告知她夺舍术的真相",next:"sq_modoctor_caibuan_ally",effect:{flag:"told_caibuan_truth"}},
    {text:"继续隐瞒，自己处理",next:"sq_modoctor_investigate"},
  ],
  enter:{flag:"caibuan_trust"},
},

"sq_modoctor_caibuan_trust_reveal":{
  text:[
    {type:"narration",content:"你与墨彩环深谈。她终于向你吐露了心中的忧虑。"},
    {type:"dialogue",content:"韩兄弟，父亲大人近来……似乎在修炼某种邪术。我曾在书房看到一本黑色册子，上面记载着夺舍之法。"},
    {type:"dialogue",content:"我担心他的目标……是我们这些弟子。但我无能为力，只能装作不知。"},
    {type:"thought",content:"墨彩环提供了关键证词。现在证据确凿。"},
  ],
  choices:[
    {text:"与她商议对策",next:"sq_modoctor_caibuan_ally"},
    {text:"独自行动",next:"sq_modoctor_investigate"},
  ],
},

"sq_modoctor_caibuan_ally":{
  text:[
    {type:"narration",content:"你将夺舍术的真相告知墨彩环。她先是震惊，随即神色复杂。"},
    {type:"dialogue",content:"……我早有预感。韩兄弟，你打算如何处置？无论你做什么决定，我都支持你。但若要动手，请不要伤害无辜。"},
    {type:"system_msg",content:"墨彩环成为你的盟友。她将协助你处理墨府事宜。"},
    {type:"thought",content:"有了墨彩环的配合，我的选择更多了。"},
  ],
  choices:[
    {text:"公开揭发墨大夫",next:"sq_modoctor_confront_public"},
    {text:"设伏反杀墨大夫",next:"sq_modoctor_ambush_plan"},
    {text:"暗中布局，夺取墨府",next:"sq_modoctor_secret_takeover"},
    {text:"劝墨大夫改邪归正",next:"sq_modoctor_negotiate"},
  ],
  enter:{flag:"caibuan_ally"},
},

// 路径D：直接质问（高风险）
"sq_modoctor_confront_early":{
  text:[
    {type:"narration",content:"你直接找到墨大夫，质问他的所作所为。"},
    {type:"dialogue",content:"师伯，弟子听闻您在修炼夺舍之术，可有此事？"},
    {type:"narration",content:"墨大夫脸色骤变，随即恢复慈祥笑容。"},
    {type:"dialogue",content:"韩立，你听信了什么谣言？为师乃是正道修士，怎会修炼邪术？不过……你既然起了疑心，为师也不便留你了。"},
    {type:"danger",content:"墨大夫突然出手！一道黑气直袭你的天灵盖！"},
    {type:"system_msg",content:"墨大夫发动突袭！你被逼入绝境！"},
  ],
  choices:[
    {text:"拼死一战",next:"sq_modoctor_emergency_combat"},
  ],
  enter:{flag:"modoctor_hostile"},
},

"sq_modoctor_emergency_combat":{
  text:[
    {type:"danger",content:"墨大夫露出狰狞面目：「既然你发现了，就别怪为师心狠！你的身体，正合我用！」"},
  ],
  choices:[{text:"战斗",next:"sq_modoctor_emergency_combat"}],
  combat:{enemy:"mo_doctor_desperate",onWin:"sq_modoctor_kill_result",onLose:"sq_modoctor_death"},
},

// 结局1：公开揭发
"sq_modoctor_confront_public":{
  text:[
    {type:"narration",content:"你带着证据来到七玄门正殿，当众揭发墨大夫修炼夺舍邪术。"},
    {type:"dialogue",content:"各位长老！墨居仁修炼夺舍之术，意图谋害弟子！这是从他书房搜出的邪术册子！"},
    {type:"narration",content:"七玄门长老们传阅册子，面色凝重。墨大夫脸色铁青，却仍强辩。"},
    {type:"dialogue",content:"这是污蔑！此册乃是老夫收缴的邪物，正准备销毁！」 ——墨大夫狡辩道。"},
    {type:"narration",content:"然而墨彩环出庭作证，加上你掌握的证据，长老们最终决定将墨大夫逐出七玄门。"},
    {type:"system_msg",content:"✅ 墨大夫被公开揭发并逐出七玄门。"},
    {type:"reward",content:"获得：声望提升、墨府药园（公开继承）、500灵石"},
  ],
  choices:[
    {text:"接管墨府产业",next:"sq_modoctor_inherit_public"},
  ],
  enter:{flag:"modoctor_exposed",stone:500,achievement:"exposer"},
},

"sq_modoctor_inherit_public":{
  text:[
    {type:"narration",content:"墨大夫被逐出后，七玄门长老会决议将其产业交由你打理，作为揭发有功的奖赏。"},
    {type:"narration",content:"你正式接管墨府：药园、医书、丹方、灵石，以及墨大夫的「神医弟子」名号。"},
    {type:"dialogue",content:"韩师弟，墨府就交给你了。希望你能善用这些资源，造福门派。」 ——掌门长老说道。"},
    {type:"system_msg",content:"你公开继承了墨府产业，获得合法身份。"},
    {type:"thought",content:"公开路线虽然名声好，但墨大夫逃脱了，日后可能寻仇。"},
  ],
  choices:[
    {text:"墨府事务已了",next:"_wild_return",effect:{flag:"sq_modoctor_done",completeStoryQuest:"sq_modoctor",item:"medical_book",stone:300}},
  ],
  enter:{flag:"inherited_publicly"},
},

// 结局2：设伏反杀（原著路线）
"sq_modoctor_ambush_plan":{
  text:[
    {type:"narration",content:"你决定效仿原著，设伏反杀墨大夫。你假意不知真相，继续跟随墨大夫修炼，暗中准备。"},
    {type:"thought",content:"墨大夫，你以为我是任你宰割的羔羊？殊不知，猎人与猎物的身份，即将逆转。"},
    {type:"narration",content:"数月后，墨大夫认为时机成熟，邀请你到密室「传功」。这正是他动手的信号。"},
    {type:"dialogue",content:"韩立，为师今日传你一门秘法，需在密室中闭关修炼……"},
    {type:"thought",content:"来了！就是现在！"},
  ],
  choices:[
    {text:"将计就计，反杀墨大夫",next:"sq_modoctor_ambush_combat"},
  ],
  enter:{flag:"ambush_planned"},
},

"sq_modoctor_ambush_combat":{
  text:[
    {type:"danger",content:"密室中，墨大夫突然发难：「韩立，你的身体归我了！」"},
    {type:"narration",content:"你早有准备，祭出法器，与墨大夫展开殊死搏斗！"},
  ],
  choices:[{text:"战斗",next:"sq_modoctor_ambush_combat"}],
  combat:{enemy:"mo_doctor",onWin:"sq_modoctor_kill_result",onLose:"sq_modoctor_death"},
},

"sq_modoctor_kill_result":{
  text:[
    {type:"chapter_title",content:"反 杀 成 功"},
    {type:"narration",content:"墨大夫倒在血泊中，双目圆睁，死不瞑目。"},
    {type:"dialogue",content:"你……你竟然……」 ——墨大夫临死前难以置信。"},
    {type:"thought",content:"师伯，是你先要害我。修仙界弱肉强食，我不杀你，你便杀我。"},
    {type:"system_msg",content:"✅ 墨大夫已被反杀。"},
    {type:"narration",content:"现在需要处理善后——如何向外界解释墨大夫的死？"},
  ],
  choices:[
    {text:"宣称修炼事故",next:"sq_modoctor_narrative_accident"},
    {text:"宣称仇家所为",next:"sq_modoctor_narrative_enemy"},
    {text:"如实禀报门派",next:"sq_modoctor_narrative_truth"},
  ],
  enter:{flag:"killed_modoctor",achievement:"slayer"},
},

// 双重真相：公开叙事选择
"sq_modoctor_narrative_accident":{
  text:[
    {type:"narration",content:"你对外宣称墨大夫在闭关修炼时走火入魔，不幸身亡。"},
    {type:"dialogue",content:"师伯他……修炼时出了意外，我来时已无力回天。」 ——你面露悲痛。"},
    {type:"narration",content:"七玄门长老们信以为真，为墨大夫举行了葬礼。墨彩环虽怀疑，但没有证据。"},
    {type:"system_msg",content:"公开叙事：「修炼事故」。可信度较高。"},
    {type:"system_msg",content:"真实真相：玩家反杀墨大夫（已记录在世界事实中，永不删除）。"},
    {type:"thought",content:"暂时瞒过了众人。但墨彩环的眼神……她似乎起了疑心。"},
  ],
  choices:[
    {text:"接管墨府产业",next:"sq_modoctor_inherit_secret",effect:{flag:"narrative_accident"}},
  ],
  enter:{flag:"lied_about_death"},
},

"sq_modoctor_narrative_enemy":{
  text:[
    {type:"narration",content:"你伪造现场，制造墨大夫被仇家暗杀的假象。"},
    {type:"dialogue",content:"师伯曾与一名邪修结怨，那邪修趁师伯闭关时下手……我来时已晚。」 ——你神情悲愤。"},
    {type:"narration",content:"七玄门派人追查「邪修」，当然一无所获。墨彩环对此说法半信半疑。"},
    {type:"system_msg",content:"公开叙事：「仇家暗杀」。可信度中等，留有破绽。"},
    {type:"system_msg",content:"真实真相：玩家反杀墨大夫（已记录在世界事实中，永不删除）。"},
    {type:"thought",content:"这番布置虽然周全，但伪造的痕迹终归是隐患。"},
  ],
  choices:[
    {text:"接管墨府产业",next:"sq_modoctor_inherit_secret",effect:{flag:"narrative_enemy"}},
  ],
  enter:{flag:"fabricated_enemy_story"},
},

"sq_modoctor_narrative_truth":{
  text:[
    {type:"narration",content:"你如实向七玄门长老禀报墨大夫修炼邪术、意图夺舍的经过。"},
    {type:"dialogue",content:"师伯修炼夺舍邪术，意图谋害弟子。弟子迫于无奈，将其击杀。请长老明察！"},
    {type:"narration",content:"长老们查验现场和证据后，确认了你的说法。你被判定为正当防卫，无罪。"},
    {type:"system_msg",content:"公开叙事：「正当防卫」。可信度极高。"},
    {type:"system_msg",content:"真实真相与公开叙事一致。"},
    {type:"reward",content:"获得：声望提升、正当防卫嘉奖"},
  ],
  choices:[
    {text:"接管墨府产业",next:"sq_modoctor_inherit_public",effect:{flag:"narrative_truth"}},
  ],
  enter:{flag:"told_truth"},
},

// 隐秘继承
"sq_modoctor_inherit_secret":{
  text:[
    {type:"narration",content:"你以「墨大夫关门弟子」的身份接管了墨府。药园、医书、丹方、灵石，尽数落入你手。"},
    {type:"dialogue",content:"韩兄弟，父亲大人的后事……就劳你操持了。」 ——墨彩环强忍悲痛。"},
    {type:"narration",content:"你获得了墨大夫的「神医弟子」身份，以及他的病人关系网。"},
    {type:"system_msg",content:"你隐秘继承了墨府产业，但秘密压力增加。"},
    {type:"thought",content:"产业到手，但墨彩环的怀疑、旧日的书信、知情者的存在……都是隐患。"},
  ],
  choices:[
    {text:"墨府事务已了",next:"sq_modoctor_longterm_echo",effect:{flag:"sq_modoctor_done",completeStoryQuest:"sq_modoctor",item:"medical_book",stone:300}},
  ],
  enter:{flag:"inherited_secretly"},
},

// 结局3：暗中夺取（邪道路线）
"sq_modoctor_secret_takeover":{
  text:[
    {type:"narration",content:"你决定不杀墨大夫，而是暗中布局，夺取他的产业和身份。"},
    {type:"thought",content:"杀了墨大夫只会惹来麻烦。不如让他「自愿」交出一切，然后……处理掉。"},
    {type:"narration",content:"你与墨彩环配合，暗中在墨大夫的丹药中下毒，使其修为衰退。"},
    {type:"narration",content:"数月后，墨大夫修为大跌，不得不将墨府事务交由你打理。"},
    {type:"dialogue",content:"韩立，老夫年老体衰，墨府就交给你了……照顾好彩环。」 ——墨大夫虚弱地说。"},
    {type:"danger",content:"现在墨大夫已无反抗之力。你打算如何处置他？"},
  ],
  choices:[
    {text:"毒杀灭口",next:"sq_modoctor_poison_kill",effect:{flag:"poisoned_modoctor"}},
    {text:"放他离去",next:"sq_modoctor_let_go",effect:{flag:"spared_modoctor"}},
    {text:"夺取他的修为（吞噬路线）",next:"sq_modoctor_devour",effect:{flag:"devoured_modoctor"}},
  ],
  enter:{flag:"took_over_secretly"},
},

"sq_modoctor_poison_kill":{
  text:[
    {type:"narration",content:"你加大毒药剂量，墨大夫在睡梦中无声死去。"},
    {type:"dialogue",content:"韩兄弟，父亲大人他……走得安详。」 ——墨彩环并不知情。"},
    {type:"system_msg",content:"墨大夫被毒杀。公开叙事：「病逝」。"},
    {type:"system_msg",content:"真实真相：玩家毒杀墨大夫（已记录在世界事实中，永不删除）。"},
    {type:"thought",content:"干净利落。但毒杀的痕迹……日后若有人验尸，便会露馅。"},
  ],
  choices:[
    {text:"接管墨府",next:"sq_modoctor_inherit_secret"},
  ],
  enter:{flag:"poisoned_modoctor_dead"},
},

"sq_modoctor_let_go":{
  text:[
    {type:"narration",content:"你放墨大夫离去。他带着一身残废的修为，消失在夜色中。"},
    {type:"dialogue",content:"韩立……你比老夫想象中更狠。记住，今日之恩，他日必报。」 ——墨大夫留下一句话后离去。"},
    {type:"system_msg",content:"墨大夫被放走。他可能日后寻仇，也可能就此隐居。"},
    {type:"thought",content:"放虎归山，后患无穷。但我已夺得墨府，他已无力回天。"},
  ],
  choices:[
    {text:"接管墨府",next:"sq_modoctor_inherit_secret"},
  ],
  enter:{flag:"modoctor_fled"},
},

"sq_modoctor_devour":{
  text:[
    {type:"danger",content:"你运转吞噬功法，强行吸收墨大夫残存的修为！"},
    {type:"narration",content:"墨大夫的修为如潮水般涌入你的经脉。你的修为暴涨，但经脉隐隐作痛。"},
    {type:"system_msg",content:"获得大量修为！但法力驳杂，因果负荷增加。"},
    {type:"thought",content:"异种法力在体内冲撞……需要日后洗炼。这就是捷径的代价。"},
  ],
  choices:[
    {text:"接管墨府",next:"sq_modoctor_inherit_secret"},
  ],
  enter:{flag:"devoured_modoctor_power",exp:3000},
},

// 结局4：逃离
"sq_modoctor_flee_sect":{
  text:[
    {type:"narration",content:"你深知自己修为低微，不是墨大夫的对手，决定逃离七玄门。"},
    {type:"narration",content:"你连夜收拾细软，趁夜色离开。墨大夫发现后派人追杀，但你侥幸逃脱。"},
    {type:"system_msg",content:"你逃离了七玄门。墨大夫对你怀恨在心，日后可能派人追杀。"},
    {type:"thought",content:"留得青山在，不怕没柴烧。终有一日，我会回来清算这笔账。"},
  ],
  choices:[
    {text:"浪迹天涯",next:"_wild_return",effect:{flag:"fled_sect",completeStoryQuest:"sq_modoctor"}},
  ],
  enter:{flag:"became_fugitive"},
},

// 结局5：谈判劝善
"sq_modoctor_negotiate":{
  text:[
    {type:"narration",content:"你找到墨大夫，开门见山地表明自己已知夺舍之事，但不想与之为敌。"},
    {type:"dialogue",content:"师伯，弟子知晓您的秘密。但弟子无意揭发，只想与师伯做个交易。"},
    {type:"narration",content:"墨大夫沉默良久，最终叹了口气。"},
    {type:"dialogue",content:"韩立，你比老夫想象中聪明。说吧，你想要什么？」 ——墨大夫语气复杂。"},
    {type:"dialogue",content:"弟子想要墨府的医书丹方，以及师伯不再谋害弟子的承诺。作为交换，弟子会保守秘密。"},
    {type:"narration",content:"墨大夫权衡利弊后，答应了你的条件。"},
    {type:"system_msg",content:"✅ 与墨大夫达成协议。获得医书丹方，但秘密成为双方筹码。"},
    {type:"thought",content:"暂时相安无事。但墨大夫的心思难测，这协议能维持多久？"},
  ],
  choices:[
    {text:"墨府事务已了",next:"_wild_return",effect:{flag:"sq_modoctor_done",completeStoryQuest:"sq_modoctor",item:"medical_book",stone:200}},
  ],
  enter:{flag:"negotiated_deal"},
},

// 长期回响：多年后旧事重提
"sq_modoctor_longterm_echo":{
  text:[
    {type:"narration",content:"墨府事务了结后，你以为一切尘埃落定。然而数年后——"},
    {type:"narration",content:"一日，你在整理墨大夫遗物时，发现一封未寄出的信件。信中提到墨大夫曾将一份夺舍秘术的完整版藏在别处。"},
    {type:"danger",content:"若此信被他人发现，你的秘密可能暴露！"},
    {type:"thought",content:"必须找到这份完整版秘术，要么销毁，要么……据为己有。"},
    {type:"system_msg",content:"长期回响触发：旧信件可能导致秘密暴露。"},
  ],
  choices:[
    {text:"销毁信件和秘术",next:"sq_modoctor_echo_destroy",effect:{flag:"destroyed_evidence"}},
    {text:"据为己有（学习夺舍术）",next:"sq_modoctor_echo_learn",effect:{flag:"learned_seize_technique"}},
    {text:"暂时搁置",next:"_wild_return",effect:{flag:"ignored_evidence"}},
  ],
},

"sq_modoctor_echo_destroy":{
  text:[
    {type:"narration",content:"你找到藏匿的秘术完整版，将其付之一炬。"},
    {type:"system_msg",content:"证据已销毁。秘密压力降低。"},
    {type:"thought",content:"隐患已除。但墨大夫的旧友若知此事，恐怕还会追查……"},
  ],
  choices:[
    {text:"继续修行",next:"_wild_return"},
  ],
},

"sq_modoctor_echo_learn":{
  text:[
    {type:"danger",content:"你抵御不住诱惑，开始研习夺舍秘术。"},
    {type:"system_msg",content:"你学会了夺舍术（邪道）。但因果负荷大增，神魂稳定度下降。"},
    {type:"thought",content:"此术虽邪，却是一条保命的后路。但我必须谨慎使用，否则必遭反噬。"},
  ],
  choices:[
    {text:"继续修行",next:"_wild_return"},
  ],
  enter:{flag:"learned_evil_art"},
},

// 死亡结局
"sq_modoctor_death":{
  text:[
    {type:"danger",content:"你败在了墨大夫手中。他夺走了你的身体，你的意识渐渐消散……"},
    {type:"system_msg",content:"你被夺舍了。但天道给了你一次重来的机会。"},
  ],
  choices:[{text:"重来之",next:"sq_modoctor_intro"}],
},

// ==================== 战斗桩节点（占位，防止过渡窗口点击导致卡死） ====================
"blood_trial_combat1":{text:[{type:"system_msg",content:"战斗中……"}],choices:[]},
"blood_trial_combat2":{text:[{type:"system_msg",content:"战斗中……"}],choices:[]},
"blood_trial_combat3":{text:[{type:"system_msg",content:"战斗中……"}],choices:[]},
"chaos_sea_war_combat1":{text:[{type:"system_msg",content:"战斗中……"}],choices:[]},
"chaos_sea_war_combat2":{text:[{type:"system_msg",content:"战斗中……"}],choices:[]},
"chaos_sea_war_combat3":{text:[{type:"system_msg",content:"战斗中……"}],choices:[]},
"mulan_final_war_combat1":{text:[{type:"system_msg",content:"战斗中……"}],choices:[]},
"mulan_final_war_combat2":{text:[{type:"system_msg",content:"战斗中……"}],choices:[]},
"mulan_final_war_combat3":{text:[{type:"system_msg",content:"战斗中……"}],choices:[]},
"void_floor3_combat1":{text:[{type:"system_msg",content:"战斗中……"}],choices:[]},
"void_floor3_combat2":{text:[{type:"system_msg",content:"战斗中……"}],choices:[]},
};
