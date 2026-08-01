/* ====== 凡人修仙传MUD · 扩展系统3 ====== */
/* NPC追踪定位 + 旅行时间 + 马车驿站 */

// ===== 剧情NPC位置数据（固定出现地点，随修为移动） =====
const STORY_NPC_LOCATIONS = {
  "yan_ying": {
    name:"晏婴", desc:"天南修仙世家之女",
    // 随修为阶段在不同地点出现
    locations: [
      {minCult:0, area:"七玄门集镇", subArea:"七玄门主殿", desc:"在七玄门集镇闲逛"},
      {minCult:1, area:"黄枫谷", subArea:"黄枫谷坊市", desc:"在黄枫谷坊市采买"},
      {minCult:2, area:"天南坊市城", subArea:"茶馆", desc:"在天南坊市城茶馆品茶"},
      {minCult:4, area:"乱星海渡口", subArea:"海港商铺", desc:"在乱星海渡口看海"},
      {minCult:6, area:"乱星海", subArea:"星宫", desc:"在乱星海星宫修炼"},
    ],
  },
  "xiao_wu": {
    name:"萧舞", desc:"乱星海洒脱女修",
    locations: [
      {minCult:1, area:"乱星海渡口", subArea:"散修客栈", desc:"在渡口客栈喝酒"},
      {minCult:2, area:"乱星海", subArea:"星砂矿岛", desc:"在星砂矿岛采砂"},
      {minCult:4, area:"乱星海", subArea:"海底遗迹", desc:"探索海底遗迹"},
      {minCult:6, area:"虚天殿", subArea:"虚天殿外围", desc:"在虚天殿外围历练"},
    ],
  },
  "mu_qing": {
    name:"慕青", desc:"慕兰草原神秘女子",
    locations: [
      {minCult:1, area:"天南坊市城", subArea:"丹药铺", desc:"在丹药铺买药"},
      {minCult:3, area:"虚天殿", subArea:"虚天殿外围", desc:"在虚天殿采药"},
      {minCult:5, area:"慕兰草原", subArea:"草原集市", desc:"在慕兰草原集市"},
      {minCult:7, area:"坠魔谷", subArea:"坠魔谷入口", desc:"在坠魔谷入口徘徊"},
    ],
  },
  "li_ying": {
    name:"李莹", desc:"坠魔谷神秘修士",
    locations: [
      {minCult:2, area:"天南坊市城", subArea:"古修士洞府", desc:"在古修士洞府探索"},
      {minCult:4, area:"虚天殿", subArea:"虚天秘境", desc:"在虚天秘境出没"},
      {minCult:6, area:"坠魔谷", subArea:"坠魔谷深处", desc:"在坠魔谷深处修炼"},
      {minCult:8, area:"灵界入口", subArea:"飞升台", desc:"在飞升台附近"},
    ],
  },
  "zi_yan": {
    name:"紫烟", desc:"虚天殿神秘少女",
    locations: [
      {minCult:3, area:"虚天殿", subArea:"虚天秘境", desc:"在虚天秘境中出现"},
      {minCult:5, area:"慕兰草原", subArea:"战场营地", desc:"在战场营地疗伤"},
      {minCult:7, area:"坠魔谷", subArea:"古魔封印地", desc:"在古魔封印地附近"},
      {minCult:9, area:"灵界", subArea:"灵界仙城", desc:"在灵界仙城出现"},
    ],
  },
  "fairy_qing": {
    name:"青仙子", desc:"灵界飞升的仙子",
    locations: [
      {minCult:5, area:"灵界入口", subArea:"飞升台", desc:"在飞升台附近显化"},
      {minCult:7, area:"灵界", subArea:"灵界仙城", desc:"在灵界仙城修炼"},
      {minCult:8, area:"灵界", subArea:"万灵秘境", desc:"在万灵秘境中出现"},
    ],
  },
};

// ===== 旅行距离与时间计算 =====
// 基于地图坐标计算旅行时间(小时)
const TRAVEL_TIME_BASE = 6; // 基础旅行时间(小时)

Object.assign(WorldSystem, {
  // ===== 初始化扩展3状态 =====
  initExpand3State(state) {
    if (!state.usedCarriage) state.usedCarriage = 0;
  },

  // ===== NPC追踪定位面板 =====
  showNPCTrackerPanel() {
    const s = Game.state;
    this.initWorldState(s);
    this.initExpand3State(s);
    
    let html = '<div class="modal-section"><div class="modal-section-title">👥 道侣与好友定位</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-bottom:12px;">查看道侣和好友的当前位置，前往相应地点可找到他们</p>';
    
    // === 道侣列表 ===
    html += '<div class="modal-section-title" style="font-size:0.9em;">💕 道侣</div>';
    
    // 世界系统道侣(spouses)
    const spouses = s.spouses || [];
    if (spouses.length === 0 && s.companions.length === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;padding:8px;">尚无道侣</div>';
    } else {
      // 世界系统道侣
      spouses.forEach(npcId => {
        const npc = s.npcList.find(n => n.id === npcId);
        if (!npc || !npc.isAlive) {
          html += '<div class="modal-item-row" style="opacity:0.5;"><div>';
          html += '<div style="color:var(--text-dim);">已故道侣</div>';
          html += '</div></div>';
          return;
        }
        const locName = this.getNPCCurrentAreaName(npc);
        const genderStr = npc.isFemale ? '♀' : '♂';
        html += '<div class="modal-item-row" style="flex-direction:column;align-items:flex-start;">';
        html += '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;">';
        html += '<div><div style="color:var(--pink);">' + genderStr + ' ' + (npc.title || '') + npc.name + '</div>';
        html += '<div class="modal-item-desc">修为：' + npc.cultName + ' | 当前位置：' + locName + '</div></div>';
        html += '<div style="text-align:right;">';
        html += '<div style="color:var(--gold-bright);font-size:0.85em;">📍 ' + locName + '</div>';
        // 如果NPC在当前地点，显示交谈按钮
        if (this.isNPCInCurrentArea(npc, s)) {
          html += '<button class="btn-combat" style="margin-top:4px;font-size:0.7em;padding:3px 8px;" onclick="UI.closeModal();Game.gotoNode(\'_npc_talk_' + npc.id + '\')">前往交谈</button>';
        } else {
          html += '<button class="btn-combat" style="margin-top:4px;font-size:0.7em;padding:3px 8px;opacity:0.6;" onclick="WorldSystem.travelToNPC(\'' + npc.id + '\')">前往寻找</button>';
        }
        html += '</div></div></div>';
      });
      
      // 剧情道侣
      s.companions.forEach(cId => {
        const comp = COMPANIONS[cId];
        if (!comp) return;
        const cData = s.companionData[cId] || {level:1, exp:0, affinity:0};
        const locInfo = this.getStoryNPCLocation(cId, s);
        html += '<div class="modal-item-row" style="flex-direction:column;align-items:flex-start;">';
        html += '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;">';
        html += '<div><div style="color:var(--pink);">💕 ' + comp.name + '</div>';
        html += '<div class="modal-item-desc">Lv.' + cData.level + ' | 亲密度：' + cData.affinity + '/100 | ' + comp.special + '</div>';
        html += '<div class="modal-item-desc" style="color:var(--jade);">📍 ' + (locInfo ? locInfo.area : '未知') + ' · ' + (locInfo ? locInfo.subArea : '') + '</div></div>';
        html += '<div style="text-align:right;">';
        html += '<div style="color:var(--gold-bright);font-size:0.85em;">' + (locInfo ? locInfo.desc : '') + '</div>';
        // 如果玩家在该地点
        if (locInfo && s.location === locInfo.area) {
          html += '<button class="btn-combat" style="margin-top:4px;font-size:0.7em;padding:3px 8px;" onclick="UI.closeModal();Game.gotoNode(\'_interact_story_' + cId + '\')">前往相见</button>';
        } else if (locInfo) {
          html += '<button class="btn-combat" style="margin-top:4px;font-size:0.7em;padding:3px 8px;opacity:0.7;" onclick="WorldSystem.travelToStoryNPC(\'' + cId + '\')">前往寻找</button>';
        }
        html += '</div></div></div>';
      });
    }
    
    // === 好友列表 ===
    html += '<div class="modal-section-title" style="font-size:0.9em;margin-top:12px;">🤝 好友</div>';
    const friends = s.npcFriends || [];
    if (friends.length === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;padding:8px;">尚无好友<br><span style="font-size:0.8em;">与NPC好感度达到50以上可结交</span></div>';
    } else {
      friends.forEach(npcId => {
        const npc = s.npcList.find(n => n.id === npcId);
        if (!npc || !npc.isAlive) return;
        const locName = this.getNPCCurrentAreaName(npc);
        const genderStr = npc.isFemale ? '♀' : '♂';
        html += '<div class="modal-item-row" style="flex-direction:column;align-items:flex-start;">';
        html += '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;">';
        html += '<div><div style="color:var(--gold-bright);">' + genderStr + ' ' + (npc.title || '') + npc.name + '</div>';
        html += '<div class="modal-item-desc">修为：' + npc.cultName + ' | 好感：' + npc.mood + '/100</div></div>';
        html += '<div style="text-align:right;">';
        html += '<div style="color:var(--jade);font-size:0.85em;">📍 ' + locName + '</div>';
        if (this.isNPCInCurrentArea(npc, s)) {
          html += '<button class="btn-combat" style="margin-top:4px;font-size:0.7em;padding:3px 8px;" onclick="UI.closeModal();Game.gotoNode(\'_npc_talk_' + npc.id + '\')">前往交谈</button>';
        } else {
          html += '<button class="btn-combat" style="margin-top:4px;font-size:0.7em;padding:3px 8px;opacity:0.6;" onclick="WorldSystem.travelToNPC(\'' + npc.id + '\')">前往寻找</button>';
        }
        html += '</div></div></div>';
      });
    }
    
    html += '</div>';
    
    // === 剧情NPC图鉴（可看到他们的位置） ===
    html += '<div class="modal-section"><div class="modal-section-title">📖 剧情人物行踪</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-bottom:8px;">剧情人物会在固定地点出现，随修为提升而移动</p>';
    Object.keys(STORY_NPC_LOCATIONS).forEach(npcId => {
      const snpc = STORY_NPC_LOCATIONS[npcId];
      const has = s.companions.includes(npcId);
      const locInfo = this.getStoryNPCLocation(npcId, s);
      const cultStage = CULT_LEVELS[s.cultLevel].stage;
      const canFind = snpc.locations.some(l => l.minCult <= cultStage);
      
      html += '<div class="modal-item-row" style="opacity:' + (canFind ? '1' : '0.4') + '"><div>';
      html += '<div style="color:' + (has ? 'var(--pink)' : (canFind ? 'var(--gold-bright)' : 'var(--text-dim)')) + '">';
      html += (has ? '💕 ' : (canFind ? '📍 ' : '🔒 ')) + snpc.name;
      if (has) html += ' (已结为道侣)';
      html += '</div>';
      html += '<div class="modal-item-desc">' + snpc.desc + '</div>';
      if (canFind && locInfo) {
        html += '<div class="modal-item-stats" style="color:var(--jade);">当前位置：' + locInfo.area + ' · ' + locInfo.subArea + '</div>';
        html += '<div class="modal-item-stats">' + locInfo.desc + '</div>';
        if (s.location === locInfo.area) {
          html += '<button class="btn-combat" style="margin-top:4px;font-size:0.7em;padding:3px 8px;" onclick="UI.closeModal();Game.gotoNode(\'_interact_story_' + npcId + '\')">前往相见</button>';
        }
      } else if (!canFind) {
        const nextLoc = snpc.locations.find(l => l.minCult > cultStage);
        if (nextLoc) {
          html += '<div class="modal-item-stats" style="color:var(--text-dim);">需' + STAGE_NAMES[nextLoc.minCult] + '后出现于' + nextLoc.area + '</div>';
        }
      }
      html += '</div></div>';
    });
    html += '</div>';
    
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },

  // ===== 获取NPC当前所在区域名称 =====
  getNPCCurrentAreaName(npc) {
    if (!npc.area) return '未知';
    const loc = WORLD_MAP[npc.area];
    if (loc) return loc.name;
    // 可能area存的是区域名
    return npc.area;
  },

  // ===== 检查NPC是否在当前玩家所在区域 =====
  isNPCInCurrentArea(npc, state) {
    if (!npc.area) return false;
    const locName = state.location || '';
    // 直接匹配
    if (npc.area === locName) return true;
    // 匹配WORLD_MAP的key
    const loc = WORLD_MAP[npc.area];
    if (loc && loc.name === locName) return true;
    // 反向匹配
    for (const key in WORLD_MAP) {
      if (WORLD_MAP[key].name === locName && key === npc.area) return true;
    }
    return false;
  },

  // ===== 获取剧情NPC当前位置 =====
  getStoryNPCLocation(npcId, state) {
    const snpc = STORY_NPC_LOCATIONS[npcId];
    if (!snpc) return null;
    const cultStage = CULT_LEVELS[state.cultLevel].stage;
    // 找到当前修为阶段对应的地点
    let currentLoc = null;
    for (let i = snpc.locations.length - 1; i >= 0; i--) {
      if (snpc.locations[i].minCult <= cultStage) {
        currentLoc = snpc.locations[i];
        break;
      }
    }
    return currentLoc;
  },

  // ===== 前往寻找NPC(自动旅行) =====
  travelToNPC(npcId) {
    const s = Game.state;
    const npc = s.npcList.find(n => n.id === npcId);
    if (!npc || !npc.isAlive) { UI.toast("此人已不在世。", "danger"); return; }
    
    // 找到NPC所在的WORLD_MAP key
    let targetKey = null;
    for (const key in WORLD_MAP) {
      if (key === npc.area || WORLD_MAP[key].name === npc.area) {
        targetKey = key;
        break;
      }
    }
    
    if (!targetKey) {
      UI.toast("无法确定" + npc.name + "的位置。", "danger");
      return;
    }
    
    // 检查修为要求
    const loc = WORLD_MAP[targetKey];
    if (CULT_LEVELS[s.cultLevel].stage < loc.reqStage) {
      UI.toast("修为不足，无法前往" + loc.name + "！", "danger");
      return;
    }
    
    UI.closeModal();
    // 使用旅行系统(消耗时间)
    this.travelToWithTime(targetKey);
  },

  // ===== 前往寻找剧情NPC =====
  travelToStoryNPC(npcId) {
    const s = Game.state;
    const locInfo = this.getStoryNPCLocation(npcId, s);
    if (!locInfo) { UI.toast("无法确定此人位置。", "danger"); return; }
    
    // 找到WORLD_MAP key
    let targetKey = null;
    for (const key in WORLD_MAP) {
      if (WORLD_MAP[key].name === locInfo.area || key === locInfo.area) {
        targetKey = key;
        break;
      }
    }
    
    if (!targetKey) {
      UI.toast("无法确定" + STORY_NPC_LOCATIONS[npcId].name + "的位置。", "danger");
      return;
    }
    
    UI.closeModal();
    this.travelToWithTime(targetKey);
  },

  // ===== 旅行时间计算 =====
  calculateTravelTime(fromKey, toKey) {
    const from = WORLD_MAP[fromKey];
    const to = WORLD_MAP[toKey];
    if (!from || !to) return TRAVEL_TIME_BASE;
    
    // 检查是否相邻(快速到达)
    if (from.connections && from.connections.includes(toKey)) {
      return TRAVEL_TIME_BASE; // 相邻区域6小时
    }
    if (to.connections && to.connections.includes(fromKey)) {
      return TRAVEL_TIME_BASE;
    }
    
    // 计算欧氏距离
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // 距离转换为小时(每10单位距离=6小时)
    const hours = Math.max(TRAVEL_TIME_BASE, Math.ceil(dist / 10) * TRAVEL_TIME_BASE);
    return Math.min(hours, 72); // 最多3天
  },

  // ===== 旅行费用计算(马车) =====
  calculateCarriageCost(fromKey, toKey) {
    const time = this.calculateTravelTime(fromKey, toKey);
    // 灵石费用 = 时间(小时) * 5
    return Math.ceil(time * 5);
  },

  // ===== 带时间消耗的旅行 =====
  travelToWithTime(locKey) {
    const s = Game.state;
    const loc = WORLD_MAP[locKey];
    if (!loc) return;
    
    // 找到当前所在区域的key
    let currentKey = null;
    for (const key in WORLD_MAP) {
      if (WORLD_MAP[key].name === s.location || key === s.location) {
        currentKey = key;
        break;
      }
    }
    
    // 计算旅行时间
    let travelHours = 0;
    if (currentKey && currentKey !== locKey) {
      travelHours = this.calculateTravelTime(currentKey, locKey);
    }
    
    // 检查修为要求
    if (CULT_LEVELS[s.cultLevel].stage < loc.reqStage) {
      UI.toast("修为不足，无法前往" + loc.name + "！", "danger");
      return;
    }
    
    s.location = loc.name;
    UI.closeModal();
    
    // 消耗旅行时间
    let timeMsg = "";
    if (travelHours > 0) {
      if (typeof this.advanceTime === 'function') {
        this.advanceTime(travelHours);
      } else {
        Game.advanceDays(Math.ceil(travelHours / 24));
      }
      const days = Math.floor(travelHours / 24);
      const hours = travelHours % 24;
      timeMsg = "（旅途耗时";
      if (days > 0) timeMsg += days + "天";
      if (hours > 0) timeMsg += hours + "时辰";
      timeMsg += "）";
    }
    
    UI.toast("前往" + loc.name + timeMsg, "success");
    
    // 初始化世界状态
    this.initWorldState(s);
    if (typeof this.initExpand4State === 'function') this.initExpand4State(s);
    if (typeof this.initExpand5State === 'function') this.initExpand5State(s);

    // 清除野外区域上下文（到达新地点时重置）
    if (loc.type !== "wild" && loc.type !== "sea" && loc.type !== "ruins" && loc.type !== "danger" && loc.type !== "warzone") {
      s.currentWilderness = null;
      s.currentWildernessParent = null;
    }

    // 确保该区域有足够的NPC
    this.ensureAreaNPCs(s, locKey);
    // 分配NPC到场所
    if (typeof this.assignAreaPlaces === 'function') this.assignAreaPlaces(s, locKey);
    // 检查到达地点的任务完成
    if (typeof this.checkLocationQuestOnArrive === 'function') this.checkLocationQuestOnArrive(locKey);
    
    // 判断是否有城镇
    const townKey = Object.keys(TOWNS).find(t => TOWNS[t].region === locKey);
    
    let texts = [
      {type:"narration",content:"你来到了" + loc.name + "。"},
      {type:"narration",content:loc.desc},
    ];
    
    if (travelHours > 0) {
      texts.push({type:"system_msg",content:"旅途消耗了" + (travelHours >= 24 ? Math.floor(travelHours/24) + "天" : "") + (travelHours % 24 > 0 ? (travelHours % 24) + "个时辰" : "") + "。"});
    }
    
    // 有概率发现洞天福地
    if (loc.type === "wild" || loc.type === "sea" || loc.type === "ruins" || loc.type === "danger") {
      if (Math.random() < 0.2) {
        if (Math.random() < 0.4 && typeof this.findEnhancedCave === 'function') {
          this.findEnhancedCave(loc.name);
        } else {
          this.findCaveDwelling(loc.name);
        }
        return;
      }
    }
    
    // 显示当前区域的NPC数量
    const areaNPCs = this.getAreaNPCs(s, locKey);
    if (areaNPCs.length > 0) {
      texts.push({type:"system_msg",content:"此地约有" + areaNPCs.length + "人活动。"});
    }
    
    UI.renderNarrative(texts);
    
    const choices = [];
    
    // 主线推进选项
    if (typeof this.getMainQuestProgressionChoice === 'function') {
      const progChoice = this.getMainQuestProgressionChoice(locKey);
      if (progChoice) choices.push(progChoice);
    }
    
    // 永久主线选项
    const pmainChoice = this.getPermanentMainChoice();
    if (pmainChoice) choices.push(pmainChoice);
    
    // 主线任务选项
    const mainQuestChoices = this.getMainQuestChoices(locKey);
    mainQuestChoices.forEach(mc => choices.push(mc));
    
    if (townKey) {
      choices.push({text:"进入" + TOWNS[townKey].name, next:"_town_enter_" + townKey, effect:{}});
    }

    // 前往各处（场所系统）
    if (typeof this.getLocationPlaces === 'function' && this.getLocationPlaces(locKey).length > 0) {
      choices.push({text:"🏛️ 前往各处", next:"_place_panel_" + locKey, effect:{}});
    }

    // 前往副本
    if (typeof LOCATION_DUNGEON_DEFS !== 'undefined' && LOCATION_DUNGEON_DEFS[locKey]) {
      const dungeon = LOCATION_DUNGEON_DEFS[locKey];
      const cultStage = CULT_LEVELS[s.cultLevel].stage;
      if (cultStage >= dungeon.reqStage) {
        choices.push({text:"🎪 前往副本：" + dungeon.name, next:"_loc_dungeon_enter_" + locKey, effect:{}});
      }
    }

    // 任务面板
    if (typeof this.getLocationQuests === 'function') {
      const quests = this.getLocationQuests(locKey);
      const activeQuests = (s.activeLocQuests || []).filter(q => q.locKey === locKey);
      if (quests.length > 0 || activeQuests.length > 0) {
        choices.push({text:"📋 查看任务", next:"_loc_quest_panel_" + locKey, effect:{}});
      }
    }

    // NPC定位器
    if (typeof this.showNPCLocator === 'function') {
      choices.push({text:"🔍 寻找NPC", next:"_npc_locator_", effect:{}});
    }

    // 驿站/马车选项
    choices.push({text:"🚂 前往驿站（快速移动）", next:"_carriage_panel", effect:{}});
    
    // 宗门排名
    if (typeof this.showSectRankingPanel === 'function') {
      choices.push({text:"🏯 宗门/家族排名", next:"_sect_ranking_panel", effect:{}});
    }
    if (loc.type === "wild" || loc.type === "sea" || loc.type === "ruins" || loc.type === "danger" || loc.type === "warzone") {
      choices.push({text:"探索" + loc.name, next:"_wild_explore_" + locKey, effect:{}});
    }
    
    // 与NPC交谈选项
    const availableNPCs = areaNPCs.slice(0, 3);
    availableNPCs.forEach(npc => {
      const genderStr = npc.isFemale ? "女" : "男";
      const cultStr = npc.cultLevel !== undefined ? npc.cultName : "凡人";
      choices.push({text:"与" + npc.name + "交谈（" + genderStr + "·" + cultStr + "）", next:"_npc_talk_" + npc.id, effect:{}});
    });
    if (areaNPCs.length > 3) {
      choices.push({text:"查看更多NPC（共" + areaNPCs.length + "人）", next:"_npc_list_" + locKey, effect:{}});
    }
    
    choices.push({text:"打开地图", next:"_open_map", effect:{}});
    choices.push({text:"返回", next:"_wild_return", effect:{}});
    UI.renderChoices(choices);
    UI.updateAll();
  },

  // ===== 马车/驿站面板 =====
  showCarriagePanel() {
    const s = Game.state;
    this.initWorldState(s);
    this.initExpand3State(s);
    
    // 找到当前所在区域key
    let currentKey = null;
    for (const key in WORLD_MAP) {
      if (WORLD_MAP[key].name === s.location || key === s.location) {
        currentKey = key;
        break;
      }
    }
    
    if (!currentKey) {
      UI.showModal("驿站", '<div style="text-align:center;color:var(--text-dim);padding:20px;">无法确定当前位置</div>', '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
      return;
    }
    
    let html = '<div class="modal-section"><div class="modal-section-title">🚂 驿站 · 快速移动</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-bottom:12px;">乘坐马车可大幅缩短旅行时间，但需支付灵石<br>当前位置：' + s.location + ' | 💎 ' + s.spiritStones + '</p>';
    
    // 列出所有可前往的地点
    Object.keys(WORLD_MAP).forEach(key => {
      const loc = WORLD_MAP[key];
      if (key === currentKey) return; // 跳过当前地点
      
      const canGo = CULT_LEVELS[s.cultLevel].stage >= loc.reqStage;
      const travelTime = this.calculateTravelTime(currentKey, key);
      const carriageCost = this.calculateCarriageCost(currentKey, key);
      const isAdjacent = (WORLD_MAP[currentKey].connections || []).includes(key) || (loc.connections || []).includes(currentKey);
      const canAfford = s.spiritStones >= carriageCost;
      
      html += '<div class="modal-item-row" style="opacity:' + (canGo ? '1' : '0.4') + ';flex-direction:column;align-items:flex-start;">';
      html += '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;">';
      html += '<div><div style="color:' + (canGo ? 'var(--gold-bright)' : 'var(--text-dim)') + ';">';
      html += '📍 ' + loc.name;
      if (!canGo) html += '（需' + STAGE_NAMES[loc.reqStage] + '）';
      if (isAdjacent && canGo) html += ' <span style="color:var(--jade);font-size:0.8em;">[相邻]</span>';
      html += '</div>';
      html += '<div class="modal-item-desc">' + loc.desc + '</div>';
      html += '<div class="modal-item-stats">';
      html += '步行：' + (travelTime >= 24 ? Math.floor(travelTime/24) + '天' : '') + (travelTime % 24 > 0 ? (travelTime % 24) + '时辰' : '');
      html += ' → 马车：' + Math.ceil(travelTime / 3) + '时辰';
      html += ' | 💎 ' + carriageCost;
      html += '</div></div>';
      html += '<div style="text-align:right;">';
      
      if (canGo) {
        // 马车快速移动
        if (canAfford) {
          html += '<button class="btn-combat" style="font-size:0.75em;padding:5px 10px;margin-bottom:4px;" onclick="WorldSystem.fastTravel(\'' + key + '\')">🚂 乘马车</button><br>';
        } else {
          html += '<span style="color:var(--crimson);font-size:0.75em;">灵石不足</span><br>';
        }
        // 步行(消耗完整时间)
        html += '<button class="btn-combat" style="font-size:0.7em;padding:3px 8px;opacity:0.8;" onclick="WorldSystem.travelToWithTime(\'' + key + '\')">🚶 步行前往</button>';
      }
      
      html += '</div></div></div>';
    });
    
    html += '</div>';
    
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },

  // ===== 马车快速旅行 =====
  fastTravel(targetKey) {
    const s = Game.state;
    
    // 找到当前所在区域key
    let currentKey = null;
    for (const key in WORLD_MAP) {
      if (WORLD_MAP[key].name === s.location || key === s.location) {
        currentKey = key;
        break;
      }
    }
    
    if (!currentKey) { UI.toast("无法确定当前位置。", "danger"); return; }
    
    const loc = WORLD_MAP[targetKey];
    if (!loc) return;
    
    // 检查修为
    if (CULT_LEVELS[s.cultLevel].stage < loc.reqStage) {
      UI.toast("修为不足！", "danger");
      return;
    }
    
    // 计算费用
    const cost = this.calculateCarriageCost(currentKey, targetKey);
    if (s.spiritStones < cost) {
      UI.toast("灵石不足！需要" + cost + "灵石。", "danger");
      return;
    }
    
    // 扣除灵石
    s.spiritStones -= cost;
    s.usedCarriage = (s.usedCarriage || 0) + 1;
    
    // 计算马车时间(步行的1/3)
    const walkTime = this.calculateTravelTime(currentKey, targetKey);
    const carriageTime = Math.max(2, Math.ceil(walkTime / 3));
    
    // 消耗时间
    if (typeof this.advanceTime === 'function') {
      this.advanceTime(carriageTime);
    } else {
      Game.advanceDays(Math.ceil(carriageTime / 24));
    }
    
    // 设置位置
    s.location = loc.name;
    UI.closeModal();
    
    this.initWorldState(s);
    this.ensureAreaNPCs(s, targetKey);
    
    const townKey = Object.keys(TOWNS).find(t => TOWNS[t].region === targetKey);
    
    let texts = [
      {type:"narration",content:"你乘坐驿马车来到了" + loc.name + "。"},
      {type:"narration",content:loc.desc},
      {type:"system_msg",content:"马车费时" + (carriageTime >= 24 ? Math.floor(carriageTime/24) + '天' : '') + (carriageTime % 24 > 0 ? (carriageTime % 24) + '个时辰' : '') + "，花费" + cost + "灵石。"},
    ];
    
    // 有概率发现洞天福地(乘坐马车概率降低)
    if (loc.type === "wild" || loc.type === "sea" || loc.type === "ruins" || loc.type === "danger") {
      if (Math.random() < 0.1) {
        if (Math.random() < 0.4 && typeof this.findEnhancedCave === 'function') {
          this.findEnhancedCave(loc.name);
        } else {
          this.findCaveDwelling(loc.name);
        }
        return;
      }
    }
    
    const areaNPCs = this.getAreaNPCs(s, targetKey);
    if (areaNPCs.length > 0) {
      texts.push({type:"system_msg",content:"此地约有" + areaNPCs.length + "人活动。"});
    }
    
    UI.renderNarrative(texts);
    
    const choices = [];
    
    const pmainChoice = this.getPermanentMainChoice();
    if (pmainChoice) choices.push(pmainChoice);
    
    const mainQuestChoices = this.getMainQuestChoices(targetKey);
    mainQuestChoices.forEach(mc => choices.push(mc));
    
    if (townKey) {
      choices.push({text:"进入" + TOWNS[townKey].name, next:"_town_enter_" + townKey, effect:{}});
    }
    
    choices.push({text:"🚂 前往驿站（快速移动）", next:"_carriage_panel", effect:{}});
    
    // 宗门排名
    if (typeof this.showSectRankingPanel === 'function') {
      choices.push({text:"🏯 宗门/家族排名", next:"_sect_ranking_panel", effect:{}});
    }
    
    if (loc.type === "wild" || loc.type === "sea" || loc.type === "ruins" || loc.type === "danger" || loc.type === "warzone") {
      choices.push({text:"探索" + loc.name, next:"_wild_explore_" + targetKey, effect:{}});
    }
    
    const availableNPCs = areaNPCs.slice(0, 3);
    availableNPCs.forEach(npc => {
      const genderStr = npc.isFemale ? "女" : "男";
      const cultStr = npc.cultLevel !== undefined ? npc.cultName : "凡人";
      choices.push({text:"与" + npc.name + "交谈（" + genderStr + "·" + cultStr + "）", next:"_npc_talk_" + npc.id, effect:{}});
    });
    if (areaNPCs.length > 3) {
      choices.push({text:"查看更多NPC（共" + areaNPCs.length + "人）", next:"_npc_list_" + targetKey, effect:{}});
    }
    
    choices.push({text:"打开地图", next:"_open_map", effect:{}});
    choices.push({text:"返回", next:"_wild_return", effect:{}});
    UI.renderChoices(choices);
    UI.updateAll();
  },

  // ===== 交互剧情NPC =====
  interactStoryNPC(companionId) {
    const s = Game.state;
    const comp = COMPANIONS[companionId];
    if (!comp) return;
    
    const cData = s.companionData[companionId] || {level:1, exp:0, affinity:0};
    const snpc = STORY_NPC_LOCATIONS[companionId];
    const locInfo = this.getStoryNPCLocation(companionId, s);
    
    let texts = [
      {type:"narration",content:"你在" + (locInfo ? locInfo.subArea : "此地") + "找到了" + comp.name + "。"},
      {type:"dialogue",content: this.getStoryNPCDialogue(companionId, cData)},
    ];
    
    // 增加亲密度(每次见面+5)
    if (cData.affinity < 100) {
      cData.affinity = Math.min(100, cData.affinity + 5);
      s.companionData[companionId] = cData;
      texts.push({type:"system_msg",content:"与" + comp.name + "见面，亲密度+5（当前：" + cData.affinity + "/100）"});
    }
    
    // 如果亲密度足够，可以结为道侣
    const canRecruit = cData.affinity >= 50 && !s.companions.includes(companionId);
    
    UI.renderNarrative(texts);
    
    const choices = [];
    if (canRecruit) {
      choices.push({text:"邀" + comp.name + "同行（结为道侣）", next:"_recruit_story_" + companionId, effect:{}});
    }
    
    // 如果已经是道侣，可以互动
    if (s.companions.includes(companionId)) {
      choices.push({text:"赠送礼物（+亲密度）", next:"_gift_story_" + companionId, effect:{}});
      choices.push({text:"切磋武艺（+经验）", next:"_spar_story_" + companionId, effect:{}});
    }
    
    choices.push({text:"告别离开", next:"_wild_return", effect:{}});
    UI.renderChoices(choices);
  },

  // ===== 获取剧情NPC对话 =====
  getStoryNPCDialogue(companionId, cData) {
    const comp = COMPANIONS[companionId];
    const affLevel = cData.affinity >= 80 ? "亲密" : cData.affinity >= 50 ? "友善" : cData.affinity >= 30 ? "客气" : "冷淡";
    
    const dialogues = {
      "yan_ying": {
        冷淡: "「你是何人？休要打扰本姑娘修炼。」",
        客气: "「道友有礼了，不知来此有何贵干？」",
        友善: "「又见面了，道友近来修为可有长进？」",
        亲密: "「你来了……我等你好久了。」",
      },
      "xiao_wu": {
        冷淡: "「哼，又来一个不知死活的。」",
        客气: "「道友好兴致，也来这乱星海游玩？」",
        友善: "「来来来，陪我喝一杯，讲讲天南的新鲜事！」",
        亲密: "「你终于来了……海上的风，还是不如你好看。」",
      },
      "mu_qing": {
        冷淡: "「……」她只是淡淡看了你一眼。",
        客气: "「道友也懂药理？不妨交流一二。」",
        友善: "「这株灵草送你吧，我这里多得是。」",
        亲密: "「你来了……我正好炼了一炉新丹，你尝尝。」",
      },
      "li_ying": {
        冷淡: "「走开，别挡我的路。」",
        客气: "「道友能走到这里，也算有些本事。」",
        友善: "「你的气息……倒是不像普通人。」",
        亲密: "「我说过会再见的……没想到这么快。」",
      },
      "zi_yan": {
        冷淡: "「凡人，你看到了不该看的东西。」",
        客气: "「道友身上有些奇特的气息……」",
        友善: "「虚天殿的秘密，或许你可以帮我一起探索。」",
        亲密: "「等待千年，终于等到了有缘之人。」",
      },
      "fairy_qing": {
        冷淡: "「仙凡有别，你好自为之。」",
        客气: "「你有飞升之资，好好修行。」",
        友善: "「灵界广阔，有你探索的空间。」",
        亲密: "「能在这灵界与你重逢，便是最好的缘法。」",
      },
    };
    
    const npcDialogues = dialogues[companionId];
    if (npcDialogues) return npcDialogues[affLevel] || npcDialogues.客气;
    return "「道友好。」";
  },

  // ===== 招募剧情NPC为道侣 =====
  recruitStoryNPC(companionId) {
    const s = Game.state;
    const comp = COMPANIONS[companionId];
    if (!comp) return;
    const cData = s.companionData[companionId] || {level:1, exp:0, affinity:0};
    
    // 检查修为要求
    if (CULT_LEVELS[s.cultLevel].stage < comp.reqStage) {
      UI.renderNarrative([
        {type:"narration",content:comp.name + "摇了摇头：「你的修为还不够，等你到了" + STAGE_NAMES[comp.reqStage] + "再来找我吧。」"},
      ]);
      UI.renderChoices([{text:"告辞离开", next:"_wild_return", effect:{}}]);
      return;
    }
    
    // 成功招募
    if (!s.companions.includes(companionId)) {
      s.companions.push(companionId);
      cData.affinity = Math.max(cData.affinity, 60);
      s.companionData[companionId] = cData;
      
      if (s.companions.length === 1) Game.giveAchievement("first_companion");
      if (s.companions.length >= Object.keys(COMPANIONS).length) Game.giveAchievement("all_companions");
      
      UI.renderNarrative([
        {type:"narration",content:comp.name + "欣然同意与你同行！"},
        {type:"dialogue",content:"「好！从今以后，你我便是道侣了！」"},
        {type:"reward",content:"🎉 获得道侣：" + comp.name + "（攻击+" + comp.atkBonus + " 防御+" + comp.defBonus + "）"},
        {type:"system_msg",content:comp.name + "的特技：" + comp.special + "，技能：" + (comp.skills || []).join("、")},
      ]);
    } else {
      UI.renderNarrative([
        {type:"narration",content:comp.name + "已经与你同行了。"},
      ]);
    }
    
    UI.renderChoices([{text:"继续", next:"_wild_return", effect:{}}]);
  },

  // ===== 给剧情NPC送礼 =====
  giftStoryNPC(companionId) {
    const s = Game.state;
    const comp = COMPANIONS[companionId];
    if (!comp) return;
    const cData = s.companionData[companionId] || {level:1, exp:0, affinity:0};
    
    // 随机消耗灵石送礼
    const cost = 50 + Math.floor(Math.random() * 100);
    if (s.spiritStones < cost) {
      UI.renderNarrative([
        {type:"narration",content:"你的灵石不够买一份像样的礼物……"},
      ]);
      UI.renderChoices([{text:"返回", next:"_wild_return", effect:{}}]);
      return;
    }
    
    s.spiritStones -= cost;
    const gain = 5 + Math.floor(Math.random() * 8);
    cData.affinity = Math.min(100, cData.affinity + gain);
    cData.exp = (cData.exp || 0) + 20;
    s.companionData[companionId] = cData;
    
    UI.renderNarrative([
      {type:"narration",content:"你花了" + cost + "灵石为" + comp.name + "买了一份礼物。"},
      {type:"dialogue",content:"「多谢道友美意！」" + comp.name + "露出笑意。"},
      {type:"system_msg",content:"亲密度+" + gain + "（当前：" + cData.affinity + "/100）"},
    ]);
    
    UI.renderChoices([
      {text:"再送一份", next:"_gift_story_" + companionId, effect:{}},
      {text:"告辞离开", next:"_wild_return", effect:{}},
    ]);
  },

  // ===== 与剧情NPC切磋 =====
  sparStoryNPC(companionId) {
    const s = Game.state;
    const comp = COMPANIONS[companionId];
    if (!comp) return;
    const cData = s.companionData[companionId] || {level:1, exp:0, affinity:0};
    
    const expGain = 50 + Math.floor(Math.random() * 100);
    s.exp += expGain;
    cData.exp = (cData.exp || 0) + 30;
    s.companionData[companionId] = cData;
    
    UI.renderNarrative([
      {type:"narration",content:"你与" + comp.name + "切磋了一番武艺。"},
      {type:"dialogue",content:"「道友身手不凡！」" + comp.name + "赞叹道。"},
      {type:"reward",content:"获得经验+" + expGain},
    ]);
    
    UI.renderChoices([
      {text:"再切磋一次", next:"_spar_story_" + companionId, effect:{}},
      {text:"告辞离开", next:"_wild_return", effect:{}},
    ]);
  },
});
