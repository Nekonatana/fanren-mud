/* ====== 凡人修仙传MUD · 游戏引擎 ====== */

const Game = {
  state: null,
  currentNode: null,
  combatState: null,
  gameMonth: 1, // 游戏内月份
  farmSlots: [], // 灵田种植槽位
  
  // ===== 初始化新游戏 =====
  startNewGame() {
    this.state = {
      name: "韩立",
      isFemale: false,
      cultLevel: 0,
      exp: 0,
      hp: 100, maxHp: 100,
      mp: 50, maxMp: 50,
      atk: 10, def: 5, spd: 10,
      comp: 3, luck: 5,
      spiritRoot: "金木水火土",
      spiritStones: 100,
      location: "七玄门集镇",
      inventory: [],
      equipment: { weapon: null, armor: null, accessory: null, artifact: null },
      guWorms: [],
      guWormLevels: {}, // {guId: {level, exp}}
      apertures: [],
      companions: [],
      companionData: {}, // {compId: {level, exp, affinity}}
      techniques: [],
      achievements: [],
      flags: {},
      chapter: "序章",
      heartDemon: 0,
      karma: 0,
      meditateCount: 0,
      battlesWon: 0,
      // 新系统
      farmSeeds: {}, // {slotIndex: {seed, plantedTime, growDays}}
      farmHarvestCount: 0,
      wildExploreCount: 0,
      wildBattlesWon: 0,
      auctionWins: 0,
      alchemyCount: 0,
    };
    
    this.gameMonth = 1;
    this.farmSlots = [null, null, null, null]; // 4个种植槽位
    
    // 自动加入七玄门（永久主线初始状态）
    this.state.flags['joined_seven_profound'] = true;
    this.state.pmainProgress = 0;
    this.state.pmainCompleted = [];
    
    if (this.hasAnySave()) {
      document.getElementById('btn-continue').style.display = '';
    }
    
    UI.showGameScreen();
    if (typeof MobileUI !== 'undefined') MobileUI.onGameStart();
    UI.toast("修仙之路，始于足下。", "gold");
    this.gotoNode("start");
  },
  
  // ===== 加载存档（兼容旧版单槽） =====
  loadGame() {
    // 优先尝试自动存档
    const auto = this.loadSlotData('__auto__');
    if (auto) {
      this.state = auto.state;
      this.currentNode = auto.state.currentNode || "start";
      // 初始化扩展8状态
      if (typeof WorldSystem !== 'undefined' && typeof WorldSystem.initExpand8State === 'function') {
        WorldSystem.initExpand8State(this.state);
      }
      UI.showGameScreen();
      if (typeof MobileUI !== 'undefined') MobileUI.onGameStart();
      this.gotoNode(this.currentNode);
      UI.toast("自动存档已加载。", "success");
      return;
    }
    // 兼容旧版
    const oldSave = localStorage.getItem('fanren_mud_save');
    if (!oldSave) { UI.toast("无存档可加载，请开始新游戏。", "danger"); return; }
    try {
      this.state = JSON.parse(oldSave);
      // 初始化扩展8状态
      if (typeof WorldSystem !== 'undefined' && typeof WorldSystem.initExpand8State === 'function') {
        WorldSystem.initExpand8State(this.state);
      }
      UI.showGameScreen();
      if (typeof MobileUI !== 'undefined') MobileUI.onGameStart();
      this.gotoNode(this.state.currentNode || "start");
      UI.toast("存档已加载。", "success");
    } catch(e) {
      UI.toast("存档损坏，请开始新游戏。", "danger");
    }
  },
  
  // ===== 保存（快速保存到自动槽） =====
  saveGame() {
    if (!this.state) return;
    this.saveToSlot('__auto__', '自动存档');
  },
  
  // ===== 存档管理：读取槽位列表 =====
  getSlotList() {
    const slots = [];
    for (let i = 1; i <= 6; i++) {
      const data = this.loadSlotData(i);
      slots.push({ id: i, data: data });
    }
    return slots;
  },
  
  // ===== 读取单个槽位数据 =====
  loadSlotData(slotId) {
    const raw = localStorage.getItem('fanren_mud_slot_' + slotId);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch(e) { return null; }
  },
  
  // ===== 保存到指定槽位 =====
  saveToSlot(slotId, slotName) {
    if (!this.state) return;
    const saveData = {
      state: this.state,
      slotName: slotName || ('存档槽' + slotId),
      saveTime: new Date().toLocaleString('zh-CN'),
      version: '1.0',
    };
    try {
      localStorage.setItem('fanren_mud_slot_' + slotId, JSON.stringify(saveData));
      const displayName = slotId === '__auto__' ? '自动存档' : (slotName || ('存档槽' + slotId));
      UI.toast("已保存到" + displayName + "。", "success");
      // 保存后刷新面板
      if (UI.currentSavePanel) UI.showSavePanel(UI.currentSavePanel);
    } catch(e) {
      UI.toast("保存失败：存储空间不足。", "danger");
    }
  },
  
  // ===== 从指定槽位加载 =====
  loadFromSlot(slotId) {
    const data = this.loadSlotData(slotId);
    if (!data) { UI.toast("该槽位无存档。", "danger"); return; }
    try {
      this.state = data.state;
      this.currentNode = data.state.currentNode || "start";
      // 初始化扩展8状态
      if (typeof WorldSystem !== 'undefined' && typeof WorldSystem.initExpand8State === 'function') {
        WorldSystem.initExpand8State(this.state);
      }
      UI.showGameScreen();
      if (typeof MobileUI !== 'undefined') MobileUI.onGameStart();
      UI.closeModal();
      this.gotoNode(this.currentNode);
      UI.toast("存档「" + (data.slotName || slotId) + "」已加载。", "success");
    } catch(e) {
      UI.toast("存档损坏，无法加载。", "danger");
    }
  },
  
  // ===== 删除指定槽位存档 =====
  deleteSlot(slotId) {
    UI.showModal("确认删除", 
      "<p style='text-align:center;'>⚠️ 确定要删除此存档吗？此操作不可撤销。</p>",
      `<button class="btn-combat" onclick="UI.closeModal()">取消</button>
       <button class="btn-combat" style="border-color:var(--crimson);color:var(--crimson-bright)" onclick="Game.confirmDeleteSlot('${slotId}')">确认删除</button>`
    );
  },
  
  // ===== 确认覆盖存档 =====
  confirmSaveToSlot(slotId, slotName) {
    const existing = this.loadSlotData(slotId);
    const cultName = existing && existing.state && CULT_LEVELS[existing.state.cultLevel] 
      ? CULT_LEVELS[existing.state.cultLevel].name : '未知';
    UI.showModal("确认覆盖", 
      "<p style='text-align:center;'>⚠️ 此槽位已有存档（" + cultName + "）。</p><p style='text-align:center;'>确定要覆盖吗？</p>",
      `<button class="btn-combat" onclick="UI.closeModal()">取消</button>
       <button class="btn-combat" style="border-color:var(--gold-bright);color:var(--gold-bright)" onclick="Game.doSaveToSlot('${slotId}','${slotName}')">确认覆盖</button>`
    );
  },
  
  doSaveToSlot(slotId, slotName) {
    UI.closeModal();
    this.saveToSlot(slotId, slotName);
  },
  
  confirmDeleteSlot(slotId) {
    localStorage.removeItem('fanren_mud_slot_' + slotId);
    UI.closeModal();
    UI.toast("存档已删除。", "success");
    if (UI.currentSavePanel) UI.showSavePanel(UI.currentSavePanel);
  },
  
  // ===== 导出存档为JSON文件 =====
  exportSave(slotId) {
    const data = this.loadSlotData(slotId);
    if (!data) { UI.toast("该槽位无存档，无法导出。", "danger"); return; }
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cultName = CULT_LEVELS[data.state.cultLevel].name;
    const dateStr = new Date().toISOString().slice(0,10);
    a.download = '凡人修仙传_存档_' + cultName + '_' + dateStr + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    UI.toast("存档文件已导出！可拷贝到其他电脑导入。", "success");
  },
  
  // ===== 导出全部存档 =====
  exportAllSaves() {
    const allData = { version: '1.0', exportTime: new Date().toISOString(), slots: {} };
    let count = 0;
    for (let i = 1; i <= 6; i++) {
      const data = this.loadSlotData(i);
      if (data) { allData.slots[i] = data; count++; }
    }
    if (count === 0) { UI.toast("没有任何存档可导出。", "danger"); return; }
    
    const json = JSON.stringify(allData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '凡人修仙传_全部存档_' + new Date().toISOString().slice(0,10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    UI.toast("已导出" + count + "个存档！", "success");
  },
  
  // ===== 导入存档文件 =====
  importSave() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          // 判断是单存档还是全部存档
          if (data.slots) {
            // 全部存档导入
            let count = 0;
            Object.keys(data.slots).forEach(slotId => {
              localStorage.setItem('fanren_mud_slot_' + slotId, JSON.stringify(data.slots[slotId]));
              count++;
            });
            UI.toast("成功导入" + count + "个存档！", "success");
          } else if (data.state) {
            // 单存档导入——找空槽位
            let targetSlot = null;
            for (let i = 1; i <= 6; i++) {
              if (!this.loadSlotData(i)) { targetSlot = i; break; }
            }
            if (targetSlot === null) targetSlot = 6; // 满了就覆盖最后一个
            localStorage.setItem('fanren_mud_slot_' + targetSlot, JSON.stringify(data));
            UI.toast("存档已导入到槽位" + targetSlot + "！", "success");
          } else {
            UI.toast("文件格式不正确。", "danger");
          }
          if (UI.currentSavePanel) UI.showSavePanel(UI.currentSavePanel);
        } catch(err) {
          UI.toast("文件解析失败，请确认是有效的存档文件。", "danger");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },
  
  // ===== 自动存档（剧情节点触发） =====
  autoSave() {
    if (!this.state) return;
    const saveData = {
      state: this.state,
      slotName: '自动存档',
      saveTime: new Date().toLocaleString('zh-CN'),
      version: '1.0',
    };
    try {
      localStorage.setItem('fanren_mud_slot___auto__', JSON.stringify(saveData));
    } catch(e) { /* 静默失败 */ }
  },
  
  // ===== 检查是否有任何存档 =====
  hasAnySave() {
    for (let i = 1; i <= 6; i++) {
      if (this.loadSlotData(i)) return true;
    }
    if (localStorage.getItem('fanren_mud_slot___auto__')) return true;
    if (localStorage.getItem('fanren_mud_save')) return true; // 兼容旧版
    return false;
  },
  
  // ===== 确认重启 =====
  confirmRestart() {
    UI.showModal("重入轮回", 
      "<p style='text-align:center;color:var(--crimson-bright);'>⚠️ 当前修炼进度将丢失！</p><p>确定要重新开始吗？</p>",
      `<button class="btn-combat" onclick="UI.closeModal()">取消</button>
       <button class="btn-combat" style="border-color:var(--crimson);color:var(--crimson-bright)" onclick="Game.doRestart()">确认重入轮回</button>`
    );
  },
  
  doRestart() {
    // 清除自动存档（保留手动存档）
    localStorage.removeItem('fanren_mud_slot___auto__');
    localStorage.removeItem('fanren_mud_save');
    location.reload();
  },
  
  // ===== 跳转到剧情节点 =====
  gotoNode(nodeId) {
    // 处理特殊节点
    if (nodeId === "_wild_victory") { this.wildVictory(); return; }
    if (nodeId === "_wild_defeat") { this.wildDefeat(); return; }
    if (nodeId === "_wild_continue") {
      // 如果当前位置在WorldSystem地图中，使用世界系统的探索
      if (typeof WORLD_MAP !== 'undefined' && WORLD_MAP[this.state.location]) {
        WorldSystem.exploreArea(this.state.location);
      } else {
        this.exploreWilderness(this.state.location);
      }
      return;
    }
    if (nodeId === "_wild_return") {
      // 返回野外/副本所属城池
      if (this.state.currentPlace) this.state.currentPlace = null;
      if (typeof WorldSystem !== 'undefined' && typeof WorldSystem.returnToParent === 'function' && this.state.currentWilderness) {
        WorldSystem.returnToParent();
      } else {
        this.wildReturn();
      }
      return;
    }
    if (nodeId === "_npc_leave") {
      // NPC交谈离开后，如果在野外/副本则继续探索
      if (typeof WorldSystem !== 'undefined' && typeof WorldSystem.continueExploringAfterNPC === 'function' && this.state.currentWilderness) {
        // 先检查是否是支线NPC
        const npcId = this._lastNpcId;
        if (npcId && typeof WorldSystem.talkToSideQuestNPC === 'function') {
          const npc = this.state.npcList && this.state.npcList.find(n => n.id === npcId);
          if (npc && npc.isSideQuestNPC) {
            // 支线NPC离开后返回探索
          }
        }
        // 继续在当前区域探索
        WorldSystem.continueExploringAfterNPC();
      } else if (this.state.currentPlace) {
        // 从场所中交谈离开，返回场所
        var _cp = this.state.currentPlace;
        WorldSystem.enterPlace(_cp.locKey, _cp.placeType);
      } else {
        this.wildReturn();
      }
      return;
    }
    if (nodeId === "_town_leave") { WorldSystem.travelTo(this._lastMapRegion || "七玄门集镇"); return; }
    if (nodeId === "_open_map") { WorldSystem.showWorldMap(); return; }

    // NPC交互节点（扩展7：优先使用talkToNPCPanel统一面板）
    if (nodeId.startsWith("_npc_talk_")) {
      if (typeof WorldSystem.talkToNPCPanel === 'function') {
        WorldSystem.talkToNPCPanel(nodeId.replace("_npc_talk_", ""));
      } else {
        WorldSystem.talkToNPC(nodeId.replace("_npc_talk_", ""));
      }
      return;
    }
    if (nodeId.startsWith("_npc_steal_")) { WorldSystem.stealFromNPC(nodeId.replace("_npc_steal_", "")); return; }
    if (nodeId.startsWith("_npc_attack_")) { WorldSystem.attackNPC(nodeId.replace("_npc_attack_", "")); return; }
    if (nodeId.startsWith("_npc_befriend_")) { WorldSystem.befriendNPC(nodeId.replace("_npc_befriend_", "")); return; }
    if (nodeId.startsWith("_npc_marry_")) { WorldSystem.proposeMarriage(nodeId.replace("_npc_marry_", "")); return; }
    if (nodeId.startsWith("_npc_dual_")) { WorldSystem.dualCultivate(nodeId.replace("_npc_dual_", "")); return; }
    if (nodeId.startsWith("_npc_victory_")) { WorldSystem.npcVictory(nodeId.replace("_npc_victory_", "")); return; }
    if (nodeId.startsWith("_npc_defeat_")) { WorldSystem.npcDefeat(nodeId.replace("_npc_defeat_", "")); return; }

    // 扩展6路由：俘虏系统/义父母/NPC战败处理
    if (nodeId === "_no_dungeon") {
      UI.toast("你尚未建造地牢，无法关押俘虏！", "danger");
      UI.renderChoices([
        {text:"继续探索", next:"_wild_continue", effect:{}},
        {text:"返回", next:"_wild_return", effect:{}},
      ]);
      return;
    }
    if (nodeId.startsWith("_kill_npc_")) { WorldSystem.killDefeatedNPC(nodeId.replace("_kill_npc_", "")); return; }
    if (nodeId.startsWith("_release_npc_")) { WorldSystem.releaseDefeatedNPC(nodeId.replace("_release_npc_", "")); return; }
    if (nodeId.startsWith("_capture_npc_")) { WorldSystem.captureDefeatedNPC(nodeId.replace("_capture_npc_", "")); return; }
    if (nodeId.startsWith("_adopt_npc_")) { WorldSystem.adoptAsGodparent(nodeId.replace("_adopt_npc_", "")); return; }
    if (nodeId.startsWith("_captive_rescue_win_")) {
      const parts = nodeId.replace("_captive_rescue_win_", "").split("|");
      WorldSystem.captiveRescueVictory(parts[0], parts[1]);
      return;
    }
    if (nodeId.startsWith("_captive_rescue_lose_")) {
      WorldSystem.captiveRescueDefeat(nodeId.replace("_captive_rescue_lose_", ""));
      return;
    }

    // 扩展7路由：对话面板/忠贞度菜单/宗门建筑/友好度/征服双修/自立宗门管理
    // NPC闲聊
    if (nodeId.startsWith("_npc_chat_")) { WorldSystem.npcChat(nodeId.replace("_npc_chat_", "")); return; }
    // "更多"菜单
    if (nodeId.startsWith("_npc_more_")) { WorldSystem.showMorePanel(nodeId.replace("_npc_more_", "")); return; }
    // 宗门/家族区域
    if (nodeId.startsWith("_sect_area_")) { WorldSystem.enterSectArea(nodeId.replace("_sect_area_", "")); return; }
    // 宗门建筑
    if (nodeId.startsWith("_sect_building_")) { var _sb = nodeId.replace("_sect_building_", "").split("|"); WorldSystem.enterSectBuilding(_sb[0], _sb[1]); return; }
    // 藏书阁
    if (nodeId.startsWith("_sect_library_")) { WorldSystem.showSectLibrary(nodeId.replace("_sect_library_", "")); return; }
    // 藏宝阁
    if (nodeId.startsWith("_sect_treasure_")) { WorldSystem.showSectTreasure(nodeId.replace("_sect_treasure_", "")); return; }
    // 炼丹阁兑换
    if (nodeId.startsWith("_sect_pills_")) { WorldSystem.showSectPills(nodeId.replace("_sect_pills_", "")); return; }
    // 炼器阁兑换
    if (nodeId.startsWith("_sect_weapons_")) { WorldSystem.showSectWeapons(nodeId.replace("_sect_weapons_", "")); return; }
    // 阅读典籍
    if (nodeId.startsWith("_sect_read_")) { WorldSystem.sectRead(nodeId.replace("_sect_read_", "")); return; }
    // 练武场修炼
    if (nodeId.startsWith("_sect_train_")) { WorldSystem.sectTrain(nodeId.replace("_sect_train_", "")); return; }
    // 自行炼丹
    if (nodeId.startsWith("_sect_alchemy_craft_")) { WorldSystem.showAlchemyCraft(nodeId.replace("_sect_alchemy_craft_", "")); return; }
    // 自行炼器
    if (nodeId.startsWith("_sect_artifact_craft_")) { WorldSystem.showArtifactCraft(nodeId.replace("_sect_artifact_craft_", "")); return; }
    // 友好度事件 - 救助受伤
    if (nodeId.startsWith("_help_injured_")) { var _hi = nodeId.replace("_help_injured_", "").split("|"); WorldSystem.helpInjuredMember(_hi[0], _hi[1]); return; }
    // 友好度事件 - 战斗助阵
    if (nodeId.startsWith("_help_combat_")) { var _hc = nodeId.replace("_help_combat_", "").split("|"); WorldSystem.helpCombatMember(_hc[0], _hc[1]); return; }
    // 友好度战斗胜利
    if (nodeId.startsWith("_friendly_combat_win_")) { var _fw = nodeId.replace("_friendly_combat_win_", "").split("|"); WorldSystem.friendlyCombatWin(_fw[0], _fw[1]); return; }
    // 征服宗门强行双修
    if (nodeId.startsWith("_conquered_force_dual_")) { var _cd = nodeId.replace("_conquered_force_dual_", "").split("|"); WorldSystem.conqueredForceDual(_cd[0], _cd[1]); return; }
    // 自立宗门管理
    if (nodeId === "_own_sect_manage") { WorldSystem.showOwnSectManage(); return; }
    if (nodeId === "_own_sect_build") { WorldSystem.showOwnSectManage(); return; }
    // 扩展8路由
    if (nodeId.startsWith("_strip_root_")) { WorldSystem.showStripRootPanel(nodeId.replace("_strip_root_", "")); return; }
    if (nodeId.startsWith("_travel_with_")) { WorldSystem.setTravelCompanion(nodeId.replace("_travel_with_", "")); return; }
    if (nodeId === "_expand8_panel") { WorldSystem.showExpand8Panel(); return; }
    if (nodeId === "_sect_marriage") { WorldSystem.showSectMarriagePanel(); return; }
    if (nodeId === "_sect_events") { WorldSystem.showSectEventsPanel(); return; }
    if (nodeId === "_travel_panel") { WorldSystem.showTravelCompanionPanel(); return; }
    if (nodeId === "_summon_panel") { WorldSystem.showSummonPanel(); return; }
    if (nodeId === "_use_butian") { WorldSystem.useButianPill(); return; }
    // 城镇节点
    if (nodeId.startsWith("_town_enter_")) { WorldSystem.enterTown(nodeId.replace("_town_enter_", "")); return; }

    // 主线任务跳转
    if (nodeId.startsWith("_pmain_quest_go_")) {
      var idx = parseInt(nodeId.replace("_pmain_quest_go_", ""));
      if (typeof WorldSystem !== 'undefined' && typeof WorldSystem.goToMainQuest === 'function') {
        WorldSystem.goToMainQuest(idx);
      } else if (WorldSystem.PERMANENT_MAIN_STORY && WorldSystem.PERMANENT_MAIN_STORY[idx]) {
        this.gotoNode(WorldSystem.PERMANENT_MAIN_STORY[idx].node);
      }
      return;
    }
    if (nodeId.startsWith("_main_quest_go_")) {
      var questId = nodeId.replace("_main_quest_go_", "");
      if (typeof WorldSystem !== 'undefined' && WorldSystem.MAIN_QUEST_LOCATIONS && WorldSystem.MAIN_QUEST_LOCATIONS[questId]) {
        var mainLoc = WorldSystem.MAIN_QUEST_LOCATIONS[questId];
        var areaName = mainLoc.areas[0];
        var targetKey = null;
        if (typeof WORLD_MAP !== 'undefined') {
          Object.keys(WORLD_MAP).forEach(function(key) {
            if (WORLD_MAP[key].name === areaName || key === areaName) targetKey = key;
          });
        }
        if (targetKey && typeof WorldSystem.travelToWithTime === 'function') {
          WorldSystem.travelToWithTime(targetKey);
        } else {
          this.gotoNode(mainLoc.storyNode);
        }
      }
      return;
    }
    // 地点任务跳转
    if (nodeId.startsWith("_loc_quest_go_")) {
      var locKey = nodeId.replace("_loc_quest_go_", "");
      if (typeof WorldSystem !== 'undefined' && typeof WorldSystem.travelToWithTime === 'function') {
        WorldSystem.travelToWithTime(locKey);
      }
      return;
    }

    if (nodeId.startsWith("_town_shop_")) {
      const shopKey = nodeId.replace("_town_shop_", "");
      if (shopKey === "拍卖行") { this.showAuctionPanel(); return; }
      WorldSystem.enterShop(shopKey);
      return;
    }

    // 世界地图野外探索
    if (nodeId.startsWith("_wild_explore_")) { WorldSystem.exploreArea(nodeId.replace("_wild_explore_", "")); return; }

    // NPC列表
    if (nodeId.startsWith("_npc_list_")) { WorldSystem.showNPCListPanel(nodeId.replace("_npc_list_", "")); return; }

    // 扩展系统节点
    if (nodeId.startsWith("_npc_detail_")) { WorldSystem.showNPCDetail(nodeId.replace("_npc_detail_", "")); return; }
    if (nodeId.startsWith("_gift_npc_")) { WorldSystem.showGiftPanel(nodeId.replace("_gift_npc_", "")); return; }
    if (nodeId.startsWith("_give_pill_")) { WorldSystem.showGivePillPanel(nodeId.replace("_give_pill_", "")); return; }
    if (nodeId.startsWith("_rest_inn_")) { WorldSystem.showInnRestPanel(); return; }
    if (nodeId.startsWith("_buy_home_")) { WorldSystem.buyHome(nodeId.replace("_buy_home_", "")); return; }
    if (nodeId.startsWith("_sect_diplomacy_")) { WorldSystem.sectDiplomacyMenu(nodeId.replace("_sect_diplomacy_", "")); return; }
    if (nodeId === "_spirit_mountain_panel") { WorldSystem.showSpiritMountainPanel(); return; }
    if (nodeId === "_offspring_panel") { WorldSystem.showOffspringPanel(); return; }
    if (nodeId === "_spirit_pet_panel") { WorldSystem.showSpiritPetPanel(); return; }
    if (nodeId === "_sect_panel") { WorldSystem.showSectPanel(); return; }
    if (nodeId === "_home_panel") { WorldSystem.showHomePanel(); return; }
    if (nodeId === "_inn_panel") { WorldSystem.showInnRestPanel(); return; }

    // 扩展2系统节点（社交/忠贞/称号/宗门/洞天）
    if (nodeId.startsWith("_deceive_npc_")) { WorldSystem.deceiveNPC(nodeId.replace("_deceive_npc_", "")); return; }
    if (nodeId.startsWith("_lower_loyalty_")) { WorldSystem.showLowerLoyaltyPanel(nodeId.replace("_lower_loyalty_", "")); return; }
    if (nodeId.startsWith("_secret_dual_")) { WorldSystem.secretDualCultivate(nodeId.replace("_secret_dual_", "")); return; }
    if (nodeId.startsWith("_ambusher_victory_")) { WorldSystem.ambusherVictory(nodeId.replace("_ambusher_victory_", "")); return; }
    if (nodeId.startsWith("_ambusher_defeat_")) { WorldSystem.ambusherDefeat(nodeId.replace("_ambusher_defeat_", "")); return; }
    if (nodeId === "_wild_mountain_fight") { WorldSystem.startMountainGuardianFight(); return; }
    if (nodeId === "_mountain_guardian_win") { WorldSystem.mountainGuardianVictory(); return; }
    if (nodeId === "_mountain_guardian_lose") { WorldSystem.mountainGuardianDefeat(); return; }
    if (nodeId.startsWith("_enhanced_cave_win_")) { WorldSystem.enhancedCaveVictory(nodeId.replace("_enhanced_cave_win_", "")); return; }
    if (nodeId === "_enhanced_cave_lose") { WorldSystem.enhancedCaveDefeat(); return; }
    if (nodeId === "_sect_join_panel") { WorldSystem.showSectJoinPanel(); return; }
    if (nodeId.startsWith("_sect_task_win_")) { WorldSystem.sectTaskVictory(nodeId.replace("_sect_task_win_", "")); return; }
    if (nodeId === "_sect_task_lose") { WorldSystem.sectTaskDefeat(); return; }
    if (nodeId === "_own_sect_panel") { WorldSystem.showOwnSectPanel(); return; }
    if (nodeId.startsWith("_own_sect_invite_")) { WorldSystem.inviteNPCToSect(nodeId.replace("_own_sect_invite_", "")); return; }
    if (nodeId.startsWith("_poach_npc_")) { WorldSystem.showPoachPanel(nodeId.replace("_poach_npc_", "")); return; }
    if (nodeId.startsWith("_npc_social_")) { WorldSystem.showNPCSocialPanel(nodeId.replace("_npc_social_", "")); return; }
    if (nodeId === "_title_panel") { WorldSystem.showTitlePanel(); return; }

    // 扩展4系统节点（主线推进/宗门排名/支线/强迫双修/副本/新剧情NPC）
    if (nodeId.startsWith("_advance_pmain_")) { WorldSystem.advanceMainQuest(parseInt(nodeId.replace("_advance_pmain_", ""))); return; }
    if (nodeId === "_sect_ranking_panel") { WorldSystem.showSectRankingPanel(); return; }
    if (nodeId.startsWith("_sect_dungeon_win_")) { WorldSystem.sectDungeonVictory(nodeId.replace("_sect_dungeon_win_", "")); return; }
    if (nodeId === "_sect_dungeon_lose") { WorldSystem.enhancedCaveDefeat(); return; }
    if (nodeId === "_new_dungeon_lose") { WorldSystem.enhancedCaveDefeat(); return; }
    if (nodeId.startsWith("_new_dungeon_win_")) { WorldSystem.newDungeonVictory(nodeId.replace("_new_dungeon_win_", "")); return; }
    // 支线任务
    if (nodeId.startsWith("_accept_sq_")) { WorldSystem.acceptSideQuest(nodeId.replace("_accept_sq_", "")); return; }
    // 强迫双修
    if (nodeId.startsWith("_force_dual_npc_")) { WorldSystem.forceDualCult(nodeId.replace("_force_dual_npc_", "")); return; }
    if (nodeId.startsWith("_bribe_witness_")) { WorldSystem.bribeWitness(nodeId.replace("_bribe_witness_", "")); return; }
    if (nodeId.startsWith("_kill_witness_")) { WorldSystem.killWitness(nodeId.replace("_kill_witness_", "")); return; }
    // 新增剧情NPC交互
    if (nodeId.startsWith("_interact_new_story_")) { WorldSystem.interactNewStoryNPC(nodeId.replace("_interact_new_story_", "")); return; }
    if (nodeId.startsWith("_gift_new_story_")) { WorldSystem.giftNewStoryNPC(nodeId.replace("_gift_new_story_", "")); return; }
    if (nodeId.startsWith("_spar_new_story_")) { WorldSystem.sparNewStoryNPC(nodeId.replace("_spar_new_story_", "")); return; }
    if (nodeId.startsWith("_steal_new_story_")) { WorldSystem.stealNewStoryNPC(nodeId.replace("_steal_new_story_", "")); return; }
    if (nodeId.startsWith("_recruit_new_story_")) { WorldSystem.recruitNewStoryNPC(nodeId.replace("_recruit_new_story_", "")); return; }
    if (nodeId.startsWith("_dual_new_story_")) { WorldSystem.dualNewStoryNPC(nodeId.replace("_dual_new_story_", "")); return; }
    if (nodeId.startsWith("_force_dual_new_")) { WorldSystem.forceDualNewStoryNPC(nodeId.replace("_force_dual_new_", "")); return; }

    // 扩展5系统节点（场所/任务/王朝/蛮夷/NPC分布）
    if (nodeId.startsWith("_enter_place_")) { var _ep = nodeId.replace("_enter_place_", "").split("|"); WorldSystem.enterPlace(_ep[0], _ep[1]); return; }
    if (nodeId.startsWith("_place_panel_")) { WorldSystem.showPlacesPanel(nodeId.replace("_place_panel_", "")); return; }
    if (nodeId.startsWith("_place_npc_list_")) { var _pl = nodeId.replace("_place_npc_list_", "").split("|"); WorldSystem.showPlaceNPCList(_pl[0], _pl[1]); return; }
    if (nodeId.startsWith("_loc_dungeon_enter_")) { WorldSystem.enterLocationDungeon(nodeId.replace("_loc_dungeon_enter_", "")); return; }
    if (nodeId.startsWith("_loc_dungeon_win_")) { WorldSystem.locationDungeonVictory(nodeId.replace("_loc_dungeon_win_", "")); return; }
    if (nodeId === "_loc_dungeon_lose") { WorldSystem.enhancedCaveDefeat(); return; }
    if (nodeId.startsWith("_loc_quest_panel_")) { WorldSystem.showLocationQuestPanel(nodeId.replace("_loc_quest_panel_", "")); return; }
    if (nodeId.startsWith("_accept_loc_quest_")) { var _aq = nodeId.replace("_accept_loc_quest_", "").split("|"); WorldSystem.acceptLocationQuest(_aq[0], parseInt(_aq[1])); return; }
    if (nodeId.startsWith("_submit_material_")) { var _sm = nodeId.replace("_submit_material_", "").split("|"); WorldSystem.submitQuestMaterials(_sm[0], parseInt(_sm[1])); return; }
    if (nodeId.startsWith("_place_learn_")) { var _le = nodeId.replace("_place_learn_", "").split("|"); WorldSystem.placeLearn(_le[0]); return; }
    if (nodeId.startsWith("_place_train_")) { var _tr = nodeId.replace("_place_train_", "").split("|"); WorldSystem.placeTrain(_tr[0]); return; }
    if (nodeId.startsWith("_place_gather_")) { WorldSystem.placeGather(nodeId.replace("_place_gather_", "")); return; }
    if (nodeId.startsWith("_place_rumor_")) { WorldSystem.placeRumor(nodeId.replace("_place_rumor_", "")); return; }
    if (nodeId.startsWith("_place_pray_")) { WorldSystem.placePray(nodeId.replace("_place_pray_", "")); return; }
    if (nodeId.startsWith("_place_back_")) { WorldSystem.placeBack(nodeId.replace("_place_back_", "")); return; }
    if (nodeId === "_dynasty_exam_") { WorldSystem.dynastyExam(); return; }
    if (nodeId === "_dynasty_exam_take_") { WorldSystem.dynastyExamTake(); return; }
    if (nodeId === "_dynasty_enlist_") { WorldSystem.dynastyEnlist(); return; }
    if (nodeId === "_dynasty_audience_") { WorldSystem.dynastyAudience(); return; }
    if (nodeId === "_npc_locator_") { WorldSystem.showNPCLocator(); return; }

    // 扩展3系统节点(NPC追踪/驿站/剧情NPC)
    if (nodeId === "_carriage_panel") { WorldSystem.showCarriagePanel(); return; }
    if (nodeId.startsWith("_recruit_story_")) { WorldSystem.recruitStoryNPC(nodeId.replace("_recruit_story_", "")); return; }
    if (nodeId.startsWith("_gift_story_")) { WorldSystem.giftStoryNPC(nodeId.replace("_gift_story_", "")); return; }
    if (nodeId.startsWith("_spar_story_")) { WorldSystem.sparStoryNPC(nodeId.replace("_spar_story_", "")); return; }

    // 永久主线节点完成检查
    if (nodeId.startsWith("pmain_") && nodeId.endsWith("_start")) {
      // 标记当前阶段为已完成（当玩家进入下一阶段时）
      var stageId = nodeId.replace("_start", "");
      var s = this.state;
      if (s && s.pmainCompleted && !s.pmainCompleted.includes(stageId)) {
        // 检查是否已有下一阶段可进入
        var story = WorldSystem.PERMANENT_MAIN_STORY;
        for (var i = 0; i < story.length; i++) {
          if (story[i].node === nodeId) {
            // 自动推进进度
            if (s.pmainProgress < i) s.pmainProgress = i;
            // 如果有下一阶段且修为达标，标记当前为完成
            if (i + 1 < story.length) {
              var nextStage = story[i + 1];
              var cultStage = CULT_LEVELS[s.cultLevel].stage;
              if (cultStage >= nextStage.minCult) {
                if (!s.pmainCompleted.includes(stageId)) s.pmainCompleted.push(stageId);
                s.pmainProgress = i + 1;
              }
            }
            break;
          }
        }
      }
    }
    // 离开七玄门时标记
    if (nodeId === "pmain_leave_qixuan") {
      if (this.state) {
        if (!this.state.pmainCompleted) this.state.pmainCompleted = [];
        if (!this.state.pmainCompleted.includes("pmain_qixuan")) this.state.pmainCompleted.push("pmain_qixuan");
        this.state.pmainProgress = 1;
        this.state.flags['left_qixuan'] = true;
      }
    }
    // 飞升灵界完成
    if (nodeId === "pmain_lingjie_tribulation") {
      if (this.state) {
        if (!this.state.pmainCompleted) this.state.pmainCompleted = [];
        ["pmain_qixuan","pmain_tiannan","pmain_luanxing","pmain_xutiandian","pmain_mulan","pmain_zhuimogu","pmain_lingjie"].forEach(function(id) {
          if (!this.includes(id)) this.push(id);
        }, this.state.pmainCompleted);
        this.state.pmainProgress = 6;
      }
    }

    // 剧情NPC交互
    if (nodeId.startsWith("_interact_story_")) {
      WorldSystem.interactStoryNPC(nodeId.replace("_interact_story_", ""));
      return;
    }

    if (nodeId === "_menu") {
      UI.renderNarrative([
        {type:"system_msg",content:"请通过底部菜单选择操作"},
      ]);
      UI.renderChoices([
        {text:"修炼打坐", next:"cultivate_meditate", effect:{}},
        {text:"出城探索", next:"_wild_menu", effect:{}},
        {text:"参加拍卖会", next:"_auction_menu", effect:{}},
        {text:"返回所在城镇", next:"_wild_return", effect:{}},
      ]);
      return;
    }
    if (nodeId === "_wild_menu") { this.showWildernessPanel(); return; }
    if (nodeId === "_auction_menu") { this.showAuctionPanel(); return; }
    
    // 返回到指定荒野区域（主线基地模式）
    if (nodeId.startsWith("_return_to_wild_")) {
      const areaKey = nodeId.replace("_return_to_wild_", "");
      const s = this.state;
      if (typeof WorldSystem !== 'undefined' && typeof WORLD_MAP !== 'undefined' && WORLD_MAP[areaKey]) {
        const targetLoc = WORLD_MAP[areaKey];
        // 城镇类型：直接旅行，不设置荒野上下文
        if (targetLoc.type === "city" || targetLoc.type === "sect") {
          WorldSystem.travelToWithTime(areaKey);
        } else {
          // 荒野类型：设置荒野上下文，parent指向最近城镇
          s.currentWilderness = areaKey;
          s.currentWildernessParent = (typeof WorldSystem.findParentCity === 'function') ? WorldSystem.findParentCity(areaKey) : areaKey;
          WorldSystem.travelToWithTime(areaKey);
        }
      } else {
        this.wildReturn();
      }
      return;
    }
    
    const node = STORY[nodeId];
    if (!node) { console.error("Story node not found:", nodeId); return; }
    
    this.currentNode = nodeId;
    this.state.currentNode = nodeId;
    
    // 自动存档
    this.autoSave();
    
    if (node.chapter) this.state.chapter = node.chapter;
    
    // 执行进入节点效果
    if (node.enter) this.applyEffects(node.enter);
    
    // 处理结局
    if (node.ending) { this.triggerEnding(node.ending); return; }
    if (node.dynamicEnding) { this.triggerDynamicEnding(); return; }
    
    // 处理修炼节点
    if (node.isMeditate) { this.doMeditate(); return; }
    
    // 渲染文本
    UI.renderNarrative(node.text || []);
    
    // 处理战斗
    if (node.combat) {
      this.startCombat(node.combat);
    } else {
      UI.hideCombat();
    }
    
    // 渲染选项
    if (node.choices && node.choices.length > 0) {
      // 动态选项处理
      if (nodeId === "ending_choice") {
        this.generateEndingChoices();
      } else {
        UI.renderChoices(node.choices);
      }
    } else {
      UI.renderChoices([]);
    }
    
    UI.updateAll();
  },
  
  // ===== 应用效果 =====
  applyEffects(effects) {
    if (!effects) return;
    const s = this.state;
    
    if (effects.exp) { this.gainExp(effects.exp); }
    if (effects.stone) { s.spiritStones += effects.stone; }
    if (effects.atk) { s.atk += effects.atk; }
    if (effects.def) { s.def += effects.def; }
    if (effects.spd) { s.spd += effects.spd; }
    if (effects.comp) { s.comp += effects.comp; }
    if (effects.luck) { s.luck += effects.luck; }
    if (effects.maxHp) { s.maxHp += effects.maxHp; s.hp += effects.maxHp; }
    if (effects.maxMp) { s.maxMp += effects.maxMp; s.mp += effects.maxMp; }
    if (effects.hp) { s.hp = Math.min(s.maxHp, s.hp + effects.hp); }
    if (effects.mp) { s.mp = Math.min(s.maxMp, s.mp + effects.mp); }

    // 心魔和因果值
    if (effects.heartDemon) { s.heartDemon = (s.heartDemon || 0) + effects.heartDemon; }
    if (effects.karma) { s.karma = (s.karma || 0) + effects.karma; }

    // 修为提升
    if (effects.cultUp) {
      for (let i = 0; i < effects.cultUp; i++) this.cultUp();
    }
    
    // 物品
    if (effects.item) {
      const count = effects.count || 1;
      this.addItem(effects.item, count);
    }
    if (effects.item2) this.addItem(effects.item2, 1);
    
    // 功法
    if (effects.technique) {
      if (!s.techniques.includes(effects.technique)) {
        s.techniques.push(effects.technique);
        UI.toast("学会功法：" + TECHNIQUES[effects.technique].name, "gold");
      }
    }
    if (effects.technique2) {
      if (!s.techniques.includes(effects.technique2)) {
        s.techniques.push(effects.technique2);
        UI.toast("学会功法：" + TECHNIQUES[effects.technique2].name, "gold");
      }
    }
    
    // 仙蛊
    if (effects.guWorm) {
      if (!s.guWorms.includes(effects.guWorm)) {
        s.guWorms.push(effects.guWorm);
        UI.toast("获得仙蛊：" + GU_WORMS[effects.guWorm].name, "gold");
      }
    }
    
    // 道侣
    if (effects.companion) {
      if (!s.companions.includes(effects.companion)) {
        s.companions.push(effects.companion);
        UI.toast("道侣加入：" + COMPANIONS[effects.companion].name + "！", "gold");
      }
    }
    
    // 成就
    if (effects.achievement) this.giveAchievement(effects.achievement);
    if (effects.achievement2) this.giveAchievement(effects.achievement2);
    
    // 标记
    if (effects.flag) s.flags[effects.flag] = true;
  },
  
  // ===== 获取经验 =====
  gainExp(amount) {
    this.state.exp += amount;
    const cult = CULT_LEVELS[this.state.cultLevel];
    while (this.state.exp >= cult.maxExp && this.state.cultLevel < CULT_LEVELS.length - 1) {
      this.state.exp -= cult.maxExp;
      this.cultUp();
    }
    UI.updateStats();
  },
  
  // ===== 修为提升 =====
  cultUp() {
    if (this.state.cultLevel >= CULT_LEVELS.length - 1) return;
    this.state.cultLevel++;
    const cult = CULT_LEVELS[this.state.cultLevel];
    
    // 更新属性
    const prevCult = CULT_LEVELS[this.state.cultLevel - 1];
    const hpDiff = cult.hpBonus - prevCult.hpBonus;
    const mpDiff = cult.mpBonus - prevCult.mpBonus;
    const atkDiff = cult.atkBonus - prevCult.atkBonus;
    const defDiff = cult.defBonus - prevCult.defBonus;
    
    this.state.maxHp += hpDiff;
    this.state.maxMp += mpDiff;
    this.state.atk += atkDiff;
    this.state.def += defDiff;
    this.state.hp = this.state.maxHp;
    this.state.mp = this.state.maxMp;
    
    UI.toast("✨ 修为提升至：" + cult.name + "！", "gold");
    
    // 成就检查
    const stageAch = ["","","foundation","core_formation","infant","spirit_transformation","body_merge","great_vehicle","tribulation","ascension"];
    const stage = cult.stage;
    if (stageAch[stage+1]) this.giveAchievement(stageAch[stage+1]);
  },
  
  // ===== 添加物品 =====
  addItem(itemId, count=1) {
    const item = ITEMS[itemId];
    if (!item) return;
    
    // 检查是否已有堆叠
    const existing = this.state.inventory.find(i => i.id === itemId);
    if (existing) {
      existing.count += count;
    } else {
      this.state.inventory.push({id: itemId, count: count});
    }
    UI.toast("获得：" + item.name + (count > 1 ? " ×" + count : ""), "success");
    UI.updateInventory();
  },
  
  // ===== 使用物品 =====
  useItem(itemId) {
    const item = ITEMS[itemId];
    if (!item || item.type !== "consumable") return;
    
    const invItem = this.state.inventory.find(i => i.id === itemId);
    if (!invItem) return;
    
    if (item.effect) {
      if (item.effect.hp) this.state.hp = Math.min(this.state.maxHp, this.state.hp + item.effect.hp);
      if (item.effect.mp) this.state.mp = Math.min(this.state.maxMp, this.state.mp + item.effect.mp);
      UI.toast("使用" + item.name + "，" + (item.effect.hp ? "恢复" + item.effect.hp + "气血" : "") + (item.effect.mp ? "恢复" + item.effect.mp + "灵力" : ""), "success");
    }
    
    invItem.count--;
    if (invItem.count <= 0) {
      this.state.inventory = this.state.inventory.filter(i => i.id !== itemId);
    }
    UI.updateAll();
  },
  
  // ===== 装备物品 =====
  equipItem(itemId) {
    const item = ITEMS[itemId];
    if (!item) return;
    if (!["weapon","armor","accessory","artifact"].includes(item.type)) return;
    
    // 检查修为要求
    const reqStage = item.grade >= 4 ? 2 : item.grade >= 3 ? 1 : 0;
    if (CULT_LEVELS[this.state.cultLevel].stage < reqStage) {
      UI.toast("修为不足，无法装备此物！", "danger");
      return;
    }
    
    const slot = item.type;
    const oldItem = this.state.equipment[slot];
    
    // 卸下旧装备
    if (oldItem) {
      this.removeItemEffects(oldItem);
      this.addItem(oldItem, 1);
    }
    
    // 装备新物品
    this.state.equipment[slot] = itemId;
    this.applyItemEffects(itemId);
    
    // 从背包移除
    const invItem = this.state.inventory.find(i => i.id === itemId);
    if (invItem) {
      invItem.count--;
      if (invItem.count <= 0) this.state.inventory = this.state.inventory.filter(i => i.id !== itemId);
    }
    
    UI.toast("装备：" + item.name, "gold");
    UI.updateAll();
    UI.closeModal();
  },
  
  // 卸下装备
  unequipItem(slot) {
    const itemId = this.state.equipment[slot];
    if (!itemId) return;
    this.removeItemEffects(itemId);
    this.addItem(itemId, 1);
    this.state.equipment[slot] = null;
    UI.toast("卸下：" + ITEMS[itemId].name, "success");
    UI.updateAll();
    UI.closeModal();
  },
  
  applyItemEffects(itemId) {
    const item = ITEMS[itemId];
    if (!item) return;
    if (item.atk) this.state.atk += item.atk;
    if (item.def) this.state.def += item.def;
    if (item.spd) this.state.spd += item.spd;
    if (item.maxMp) { this.state.maxMp += item.maxMp; this.state.mp += item.maxMp; }
    if (item.maxHp) { this.state.maxHp += item.maxHp; this.state.hp += item.maxHp; }
  },
  
  removeItemEffects(itemId) {
    const item = ITEMS[itemId];
    if (!item) return;
    if (item.atk) this.state.atk -= item.atk;
    if (item.def) this.state.def -= item.def;
    if (item.spd) this.state.spd -= item.spd;
    if (item.maxMp) { this.state.maxMp -= item.maxMp; this.state.mp = Math.min(this.mp, this.state.maxMp); }
    if (item.maxHp) { this.state.maxHp -= item.maxHp; this.state.hp = Math.min(this.hp, this.state.maxHp); }
  },
  
  // ===== 开窍 =====
  openAperture(apertureId) {
    const apt = APERTURES[apertureId];
    if (!apt) return;
    if (this.state.apertures.includes(apertureId)) { UI.toast("此窍已开辟。", "danger"); return; }
    if (CULT_LEVELS[this.state.cultLevel].stage < apt.reqStage) {
      UI.toast("修为不足，无法开辟此窍！", "danger");
      return;
    }
    
    const cost = (apt.reqStage + 1) * 100;
    if (this.state.spiritStones < cost) {
      UI.toast("灵石不足！需要" + cost + "灵石。", "danger");
      return;
    }
    
    this.state.spiritStones -= cost;
    this.state.apertures.push(apertureId);
    
    // 应用效果
    const eff = apt.effect;
    if (eff.maxHpMult) { const bonus = Math.floor(this.state.maxHp * eff.maxHpMult); this.state.maxHp += bonus; this.state.hp += bonus; }
    if (eff.maxMpMult) { const bonus = Math.floor(this.state.maxMp * eff.maxMpMult); this.state.maxMp += bonus; this.state.mp += bonus; }
    if (eff.expMult) { /* 标记，在修炼时计算 */ }
    if (eff.atkMult) { const bonus = Math.floor(this.state.atk * eff.atkMult); this.state.atk += bonus; }
    if (eff.defMult) { const bonus = Math.floor(this.state.def * eff.defMult); this.state.def += bonus; }
    if (eff.spdMult) { const bonus = Math.floor(this.state.spd * eff.spdMult); this.state.spd += bonus; }
    if (eff.compBonus) { this.state.comp += eff.compBonus; }
    if (eff.luckBonus) { this.state.luck += eff.luckBonus; }
    if (eff.allMult) {
      const bonus = eff.allMult;
      const hpB = Math.floor(this.state.maxHp * bonus);
      const mpB = Math.floor(this.state.maxMp * bonus);
      const atkB = Math.floor(this.state.atk * bonus);
      const defB = Math.floor(this.state.def * bonus);
      this.state.maxHp += hpB; this.state.hp += hpB;
      this.state.maxMp += mpB; this.state.mp += mpB;
      this.state.atk += atkB; this.state.def += defB;
    }
    
    UI.toast("✨ 开窍成功：" + apt.name + "！", "gold");
    if (this.state.apertures.length === 1) this.giveAchievement("aperture_open");
    if (this.state.apertures.length >= Object.keys(APERTURES).length) this.giveAchievement("all_apertures");
    
    UI.closeModal();
    UI.updateAll();
    setTimeout(()=>UI.showPanel('aperture'), 100);
  },
  
  // ===== 修炼打坐 =====
  doMeditate() {
    const s = this.state;
    s.meditateCount++;
    
    // 计算修炼获得
    let expGain = 20 + s.cultLevel * 10;
    let mpRegen = Math.floor(s.maxMp * 0.3);
    
    // 仙蛊加成
    if (s.guWorms.includes("spirit_gu")) expGain = Math.floor(expGain * 1.2);
    
    // 空窍加成
    if (s.apertures.includes("guanyuan")) expGain = Math.floor(expGain * 1.15);
    
    // 功法加成
    let expMult = 1;
    s.techniques.forEach(t => {
      if (TECHNIQUES[t] && TECHNIQUES[t].expBonus) expMult += TECHNIQUES[t].expBonus;
    });
    expGain = Math.floor(expGain * expMult);
    
    // 福地加成
    if (s.flags.in_blessed_land) expGain *= 2;
    
    // 悟性加成（扩展7：每点悟性增加5%修炼经验）
    if (typeof WorldSystem !== 'undefined' && typeof WorldSystem.applyCompBonusToMeditate === 'function') {
      expGain = WorldSystem.applyCompBonusToMeditate(expGain);
    } else {
      expGain = Math.floor(expGain * (1 + (s.comp || 3) * 0.05));
    }
    
    // 义父母修炼效率加成
    if (s.adoptedGodparent) expGain = Math.floor(expGain * 1.1);

    // 灵根修炼倍率加成（扩展8）
    if (typeof WorldSystem !== 'undefined' && typeof WorldSystem.applySpiritRootCultivateBonus === 'function') {
      expGain = WorldSystem.applySpiritRootCultivateBonus(expGain);
    }
    
    s.mp = Math.min(s.maxMp, s.mp + mpRegen);
    this.gainExp(expGain);
    
    // 推进灵田生长1天
    this.advanceDays(1);
    
    UI.toast("修炼获得" + expGain + "经验，恢复" + mpRegen + "灵力。", "success");
    
    // 修炼后显示返回选项
    UI.renderChoices([
      {text:"继续修炼", next:"cultivate_meditate", effect:{}},
      {text:"返回所在城镇", next:"_wild_return", effect:{}},
    ]);
    
    UI.updateStats();
  },
  
  // ===== 成就 =====
  giveAchievement(achId) {
    if (this.state.achievements.includes(achId)) return;
    this.state.achievements.push(achId);
    const ach = ACHIEVEMENTS[achId];
    if (ach) UI.toast(ach.icon + " 成就解锁：" + ach.name, "gold");
  },
  
  // ===== 战斗系统 =====
  startCombat(combatData) {
    const enemy = ENEMIES[combatData.enemy];
    if (!enemy) return;
    
    this.combatState = {
      enemy: {...enemy},
      enemyHp: enemy.hp,
      enemyMaxHp: enemy.hp,
      onWin: combatData.onWin,
      onLose: combatData.onLose,
      turn: 0,
      log: [],
    };
    
    UI.showCombat(this.combatState);
    this.combatLog("遭遇" + enemy.name + "！战斗开始！", "system");
  },
  
  combatAction(action, techniqueId) {
    if (!this.combatState) return;
    const s = this.state;
    const cs = this.combatState;
    cs.turn++;
    
    let playerDmg = 0;
    if (action === "attack") {
      playerDmg = Math.max(1, s.atk - Math.floor(cs.enemy.def * 0.5));
      // 道侣主动攻击
      let companionDmg = 0;
      s.companions.forEach(c => {
        const comp = COMPANIONS[c];
        const cData = s.companionData[c] || {level:1, affinity:0};
        const levelMult = 1 + (cData.level - 1) * COMPANION_LEVEL_DATA.atkGrowth;
        const affMult = this.getAffinityMult(cData.affinity);
        companionDmg += Math.floor(comp.atkBonus * 0.5 * levelMult * affMult);
      });
      if (companionDmg > 0) {
        this.combatLog("道侣助攻击造成" + companionDmg + "伤害！", "player");
        playerDmg += companionDmg;
      }
      // 同行NPC助战（扩展8）
      if (typeof WorldSystem !== 'undefined' && typeof WorldSystem.getTravelCompanionCombat === 'function') {
        var travelComp = WorldSystem.getTravelCompanionCombat(s);
        if (travelComp) {
          var compDmg = Math.max(1, travelComp.atk - Math.floor(cs.enemy.def * 0.3));
          // 同行NPC暴击
          if (Math.random() < 0.12) {
            compDmg = Math.floor(compDmg * 1.6);
            this.combatLog(travelComp.name + "暴击！", "system");
          }
          playerDmg += compDmg;
          this.combatLog(travelComp.name + "助战造成" + compDmg + "伤害！", "player");
        }
      }
      // 暴击
      let critChance = 0.15 + s.luck * 0.01;
      if (s.companions.includes("li_ying")) critChance += 0.1; // 李莹暴击加成
      if (Math.random() < critChance) {
        playerDmg = Math.floor(playerDmg * 1.8);
        this.combatLog("暴击！", "system");
      }
      // 仙蛊攻击加成
      let guBonus = 0;
      s.guWorms.forEach(g => {
        const gu = GU_WORMS[g];
        const gLevel = (s.guWormLevels[g] || {level:1}).level;
        const growthMult = 1 + (gLevel - 1) * GU_LEVEL_DATA.growthPerLevel;
        if (gu.atkBonus) guBonus += Math.floor(gu.atkBonus * growthMult * 0.5);
      });
      if (guBonus > 0) playerDmg += guBonus;
      // 万毒蛊概率中毒
      if (s.guWorms.includes("poison_gu") || s.guWorms.includes("spirit_poison_gu")) {
        if (Math.random() < 0.25) {
          const poisonDmg = Math.floor(playerDmg * 0.3);
          playerDmg += poisonDmg;
          this.combatLog("毒蛊发作，额外" + poisonDmg + "毒伤害！", "player");
        }
      }
      // 成就：强力一击
      if (playerDmg > 10000) this.giveAchievement("power_up");
      this.combatLog("你攻击" + cs.enemy.name + "，造成" + playerDmg + "伤害。", "player");
    } else if (action === "technique" && techniqueId) {
      const tech = TECHNIQUES[techniqueId];
      if (s.mp < tech.mpCost) { UI.toast("灵力不足！", "danger"); return; }
      s.mp -= tech.mpCost;
      playerDmg = tech.damage || 0;
      // 灵根+修为+技能等级伤害加成（扩展8）
      if (typeof WorldSystem !== 'undefined' && typeof WorldSystem.computeTechniqueDamage === 'function') {
        playerDmg = WorldSystem.computeTechniqueDamage(playerDmg, tech, s);
      }
      if (tech.ignoreDef) {
        // 无视防御
      } else {
        playerDmg = Math.max(1, playerDmg - Math.floor(cs.enemy.def * 0.3));
      }
      // 道侣技能加成
      s.companions.forEach(c => {
        const comp = COMPANIONS[c];
        const cData = s.companionData[c] || {level:1, affinity:0};
        const levelMult = 1 + (cData.level - 1) * COMPANION_LEVEL_DATA.atkGrowth;
        playerDmg += Math.floor(comp.atkBonus * 0.8 * levelMult);
      });
      // 仙蛊技能
      if (s.guWorms.includes("void_gu") || s.guWorms.includes("star_void_gu")) {
        if (Math.random() < 0.2) {
          const bonusDmg = Math.floor(playerDmg * 0.5);
          playerDmg += bonusDmg;
          this.combatLog("虚空蛊触发，额外造成" + bonusDmg + "伤害！", "player");
        }
      }
      if (playerDmg > 10000) this.giveAchievement("power_up");
      this.combatLog("你施展" + tech.name + "，造成" + playerDmg + "伤害！", "player");
    } else if (action === "defend") {
      this.combatLog("你进入防御姿态。", "player");
      cs.defending = true;
    } else if (action === "item") {
      return;
    } else if (action === "flee") {
      let fleeChance = 0.4 + s.spd * 0.005;
      if (s.guWorms.includes("wind_gu")) fleeChance += 0.15;
      if (Math.random() < fleeChance) {
        this.combatLog("你成功逃脱！", "system");
        UI.hideCombat();
        this.combatState = null;
        this.gotoNode(this.currentNode);
        return;
      } else {
        this.combatLog("逃跑失败！", "system");
      }
    }
    
    cs.enemyHp -= playerDmg;
    
    if (cs.enemyHp <= 0) {
      cs.enemyHp = 0;
      this.combatLog(cs.enemy.name + "被击败！", "system");
      this.combatVictory();
      return;
    }
    
    // 敌人攻击 - AI增强
    let enemyDmg = Math.max(1, cs.enemy.atk - Math.floor(s.def * 0.5));
    // 敌人暴击
    if (Math.random() < 0.1) {
      enemyDmg = Math.floor(enemyDmg * 1.5);
      this.combatLog("敌人暴击！", "system");
    }
    if (cs.defending) { enemyDmg = Math.floor(enemyDmg * 0.5); cs.defending = false; }
    
    // 仙蛊防御
    let guDefReduction = 0;
    s.guWorms.forEach(g => {
      const gu = GU_WORMS[g];
      const gLevel = (s.guWormLevels[g] || {level:1}).level;
      const growthMult = 1 + (gLevel - 1) * GU_LEVEL_DATA.growthPerLevel;
      if (gu.defBonus) guDefReduction += Math.floor(gu.defBonus * growthMult * 0.3);
    });
    enemyDmg = Math.max(1, enemyDmg - guDefReduction);
    // 道侣防御加成
    s.companions.forEach(c => {
      const comp = COMPANIONS[c];
      const cData = s.companionData[c] || {level:1, affinity:0};
      const levelMult = 1 + (cData.level - 1) * COMPANION_LEVEL_DATA.defGrowth;
      enemyDmg = Math.max(1, enemyDmg - Math.floor(comp.defBonus * 0.3 * levelMult));
    });
    
    s.hp -= enemyDmg;
    this.combatLog(cs.enemy.name + "攻击你，造成" + enemyDmg + "伤害。", "enemy");
    
    // 仙蛊回血
    let regen = 0;
    if (s.guWorms.includes("blood_spirit_gu")) {
      const gLevel = (s.guWormLevels["blood_spirit_gu"] || {level:1}).level;
      regen += (5 + Math.floor(s.cultLevel * 2)) * gLevel;
    }
    if (s.guWorms.includes("wind_blood_gu")) {
      const gLevel = (s.guWormLevels["wind_blood_gu"] || {level:1}).level;
      regen += (15 + Math.floor(s.cultLevel * 3)) * gLevel;
    }
    if (regen > 0) {
      s.hp = Math.min(s.maxHp, s.hp + regen);
      this.combatLog("仙蛊为你恢复" + regen + "气血。", "system");
    }
    
    if (s.hp <= 0) {
      s.hp = 0;
      this.combatLog("你被击败了……", "system");
      this.combatDefeat();
      return;
    }
    
    UI.updateCombat(this.combatState);
    UI.updateStats();
  },
  
  combatVictory() {
    const cs = this.combatState;
    const s = this.state;
    s.battlesWon++;
    if (s.battlesWon === 1) this.giveAchievement("first_kill");
    
    // 奖励
    this.gainExp(cs.enemy.exp);
    s.spiritStones += cs.enemy.stone;
    this.combatLog("获得" + cs.enemy.exp + "经验，" + cs.enemy.stone + "灵石。", "system");
    
    // 掉落
    if (cs.enemy.drop && Math.random() < cs.enemy.dropRate) {
      this.addItem(cs.enemy.drop, 1);
      this.combatLog("获得掉落：" + ITEMS[cs.enemy.drop].name, "system");
    }
    
    UI.hideCombat();
    
    const winNode = cs.onWin;
    this.combatState = null;
    setTimeout(() => this.gotoNode(winNode), 800);
  },
  
  combatDefeat() {
    const cs = this.combatState;
    const s = this.state;
    s.hp = Math.floor(s.maxHp * 0.3); // 复活
    s.mp = Math.floor(s.maxMp * 0.3);
    UI.hideCombat();
    const loseNode = cs.onLose;
    this.combatState = null;
    setTimeout(() => this.gotoNode(loseNode), 800);
  },
  
  combatLog(msg, type) {
    if (!this.combatState) return;
    this.combatState.log.push({msg, type});
    UI.updateCombatLog(this.combatState.log);
  },
  
  // ===== 结局系统 =====
  triggerEnding(endingId) {
    const ending = ENDINGS[endingId];
    if (!ending) return;
    UI.showEnding(ending);
  },
  
  triggerDynamicEnding() {
    const s = this.state;
    let endingId = "ascension_true";
    
    // 根据玩家选择和状态决定结局
    if (s.flags.heart_demon || s.flags.demon_inheritance || s.flags.stole_cauldron) {
      if (s.heartDemon > 3) endingId = "ascension_demon";
    }
    
    if (s.flags.evil_act && s.companions.length === 0) {
      endingId = "betrayal_end";
    }
    
    if (s.companions.length === 0 && s.flags.solo) {
      if (s.achievements.length >= 20) endingId = "true_immortal";
      else endingId = "ascension_true";
    }
    
    if (s.flags.demon_corruption) {
      endingId = "demon_corruption";
    }
    
    // 最强结局条件
    if (s.cultLevel >= 24 && s.companions.length >= 3 && s.apertures.length >= 8 && s.achievements.includes("all_techniques")) {
      endingId = "true_immortal";
    }
    
    this.triggerEnding(endingId);
  },
  
  generateEndingChoices() {
    const s = this.state;
    const choices = [];
    
    // 根据玩家状态生成结局选项
    if (!s.flags.heart_demon && !s.flags.demon_inheritance) {
      choices.push({
        text: "以正道飞升，证太上忘情之道",
        next: "ending_true_path",
        effect: {flag:"ending_true"},
      });
    }
    
    if (s.flags.demon_inheritance || s.flags.heart_demon) {
      choices.push({
        text: "以魔道飞升，证逆天改命之道",
        next: "ending_demon_path",
        effect: {flag:"ending_demon"},
      });
    }
    
    if (s.techniques.includes("nine_transformation")) {
      choices.push({
        text: "以武入道，肉身成圣飞升",
        next: "ending_martial_path",
        effect: {flag:"ending_martial"},
      });
    }
    
    if (s.companions.length >= 2) {
      choices.push({
        text: "与道侣携手飞升，共证大道",
        next: "ending_companion_path",
        effect: {flag:"ending_companion"},
      });
    }
    
    if (s.apertures.length >= 8 && s.techniques.length >= 8) {
      choices.push({
        text: "尝试超脱天道，成就至高真仙",
        next: "ending_transcend_path",
        effect: {flag:"ending_transcend"},
      });
    }
    
    choices.push({
      text: "放弃飞升，回归凡尘",
      next: "ending_mortal_path",
      effect: {flag:"ending_mortal"},
    });
    
    UI.renderChoices(choices);
  },
  
  // ===== 修炼面板 =====
  showCultivationPanel() {
    const s = this.state;
    const cult = CULT_LEVELS[s.cultLevel];
    const nextCult = CULT_LEVELS[s.cultLevel + 1];
    
    let html = '<div class="modal-section">';
    html += '<div class="modal-section-title">当前修为</div>';
    html += '<div style="text-align:center;font-size:1.3em;color:var(--gold-bright);margin:10px 0;">' + cult.name + '</div>';
    html += '<div style="text-align:center;color:var(--text-dim);">阶段：' + STAGE_NAMES[cult.stage] + '</div>';
    html += '<div class="exp-bar-wrap" style="margin:10px 0;"><div class="exp-bar-fill" style="width:' + (s.exp / cult.maxExp * 100) + '%"></div><span>' + s.exp + '/' + cult.maxExp + '</span></div>';
    html += '</div>';
    
    html += '<div class="modal-section">';
    html += '<div class="modal-section-title">修炼操作</div>';
    html += '<button class="choice-btn" onclick="Game.closeCultPanel()">打坐修炼（+经验）</button>';
    html += '<button class="choice-btn" onclick="Game.closeCultPanel()">服丹修炼（消耗补气丹+灵力）</button>';
    if (nextCult) {
      const canBreakthrough = s.exp >= cult.maxExp;
      html += '<button class="choice-btn" ' + (canBreakthrough ? '' : 'disabled') + ' onclick="Game.closeCultPanel()">冲击下一境界：' + nextCult.name + '</button>';
    }
    html += '</div>';
    
    html += '<div class="modal-section">';
    html += '<div class="modal-section-title">属性详情</div>';
    html += '<div style="font-size:0.85em;line-height:2;">';
    html += '气血：' + s.hp + '/' + s.maxHp + '<br>';
    html += '灵力：' + s.mp + '/' + s.maxMp + '<br>';
    html += '攻击：' + s.atk + ' | 防御：' + s.def + ' | 速度：' + s.spd + '<br>';
    html += '悟性：' + s.comp + ' | 机缘：' + s.luck + '<br>';
    var rootDisplay = s.spiritRoot;
    if (typeof s.spiritRoot === 'object' && s.spiritRoot !== null) {
      if (typeof WorldSystem !== 'undefined' && typeof WorldSystem.getPlayerSpiritRootDisplay === 'function') {
        rootDisplay = WorldSystem.getPlayerSpiritRootDisplay();
      } else {
        rootDisplay = ['杂灵根','四灵根','三灵根','双灵根','单灵根','天灵根'][s.spiritRoot.tier] || '杂灵根';
      }
    }
    html += '灵根：' + rootDisplay + '<br>';
    html += '心魔值：' + s.heartDemon + ' | 因果值：' + s.karma + '<br>';
    html += '</div></div>';
    
    html += '<div class="modal-section">';
    html += '<div class="modal-section-title">功法</div>';
    if (s.techniques.length === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;">尚未学会任何功法</div>';
    } else {
      s.techniques.forEach(t => {
        const tech = TECHNIQUES[t];
        html += '<div class="modal-item-row"><div><div>' + tech.name + '</div><div class="modal-item-desc">' + tech.desc + '</div></div></div>';
      });
    }
    html += '</div>';
    
    html += '<div class="modal-section">';
    html += '<div class="modal-section-title">福地修炼</div>';
    Object.keys(BLESSED_LANDS).forEach(key => {
      const bl = BLESSED_LANDS[key];
      const canEnter = CULT_LEVELS[s.cultLevel].stage >= bl.reqStage;
      const cost = 50;
      const canAfford = s.spiritStones >= cost;
      html += '<div class="modal-item-row" ' + ((canEnter && canAfford) ? 'onclick="Game.enterBlessedLand(\'' + key + '\',' + cost + ')"' : '') + '>';
      html += '<div><div>' + bl.name + '</div><div class="modal-item-desc">' + bl.desc + '</div><div class="modal-item-stats">+' + bl.expGain + '经验 +' + bl.stoneGain + '灵石</div></div>';
      html += '<div style="color:' + (canEnter ? (canAfford ? 'var(--gold-bright)' : 'var(--crimson)') : 'var(--text-dim)') + ';">' + (canEnter ? (canAfford ? '进入(' + cost + '💎)' : '灵石不足') : '修为不足') + '</div>';
      html += '</div>';
    });
    html += '</div>';
    
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },
  
  enterBlessedLand(key, cost) {
    const s = this.state;
    const bl = BLESSED_LANDS[key];
    if (s.spiritStones < cost) { UI.toast("灵石不足！", "danger"); return; }
    s.spiritStones -= cost;
    this.gainExp(bl.expGain);
    s.spiritStones += bl.stoneGain;
    if (bl.itemDrop) this.addItem(bl.itemDrop, 1);
    UI.toast("在" + bl.name + "修炼，获得" + bl.expGain + "经验！", "gold");
    UI.closeModal();
    setTimeout(()=>UI.showPanel('cultivation'), 100);
  },
  
  closeCultPanel() {
    UI.closeModal();
    this.doMeditate();
  },
  
  // ===== 仙蛊面板 =====
  showGuWormPanel() {
    const s = this.state;
    let html = '<div class="modal-section"><div class="modal-section-title">已拥有仙蛊（可养成）</div>';
    if (s.guWorms.length === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;">尚未拥有仙蛊</div>';
    } else {
      s.guWorms.forEach(g => {
        const gu = GU_WORMS[g];
        const gData = s.guWormLevels[g] || {level:1, exp:0};
        const growthMult = 1 + (gData.level - 1) * GU_LEVEL_DATA.growthPerLevel;
        html += '<div class="modal-item-row" style="flex-direction:column;align-items:flex-start;">';
        html += '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;">';
        html += '<div><div style="color:var(--gold-bright);">' + gu.name + ' <span style="color:var(--jade);font-size:0.8em;">Lv.' + gData.level + '/' + GU_LEVEL_DATA.maxLevel + '</span></div>';
        html += '<div class="modal-item-desc">' + gu.desc + '</div>';
        html += '<div class="modal-item-stats">';
        if (gu.atkBonus) html += '攻击+' + Math.floor(gu.atkBonus * growthMult) + ' ';
        if (gu.defBonus) html += '防御+' + Math.floor(gu.defBonus * growthMult) + ' ';
        if (gu.spdBonus) html += '速度+' + Math.floor(gu.spdBonus * growthMult) + ' ';
        if (gu.expBonus) html += '经验+' + (gu.expBonus*100) + '% ';
        if (gu.hpRegen) html += '回血+' + Math.floor(gu.hpRegen * growthMult) + '/回合 ';
        if (gu.allBonus) html += '全属性+' + (gu.allBonus*100) + '% ';
        if (gu.skill) html += '技能:' + gu.skill + ' ';
        html += '</div></div>';
        if (gData.level < GU_LEVEL_DATA.maxLevel) {
          html += '<div style="text-align:right;">';
          html += '<button class="btn-combat" style="font-size:0.7em;padding:4px 8px;margin:2px;" onclick="Game.guFeed(\'' + g + '\')">喂养(💎50)</button>';
          const upCost = (GU_LEVEL_DATA.expPerLevel[gData.level-1]||100) * 2;
          html += '<button class="btn-combat" style="font-size:0.7em;padding:4px 8px;margin:2px;" onclick="Game.guLevelUp(\'' + g + '\')">升级(💎' + upCost + ')</button>';
          html += '</div>';
        } else {
          html += '<span style="color:var(--gold-bright);">👑 MAX</span>';
        }
        html += '</div>';
        // 经验条
        if (gData.level < GU_LEVEL_DATA.maxLevel) {
          const needed = GU_LEVEL_DATA.expPerLevel[gData.level - 1] || 100;
          const pct = ((gData.exp||0) / needed) * 100;
          html += '<div class="exp-bar-wrap" style="margin:4px 0;"><div class="exp-bar-fill" style="width:' + pct + '%"></div><span>经验 ' + (gData.exp||0) + '/' + needed + '</span></div>';
        }
        html += '</div>';
      });
    }
    html += '</div>';
    
    // 融合面板
    if (s.guWorms.length >= 2) {
      html += '<div class="modal-section"><div class="modal-section-title">🔮 仙蛊融合</div>';
      GU_LEVEL_DATA.fusionRecipes.forEach((r, i) => {
        const hasAll = r.input.every(g => s.guWorms.includes(g));
        const alreadyHas = s.guWorms.includes(r.result);
        html += '<div class="modal-item-row" style="opacity:' + (hasAll && !alreadyHas ? '1' : '0.4') + '">';
        html += '<div><div style="color:var(--purple-spirit);">' + r.name + '</div>';
        html += '<div class="modal-item-desc">' + r.input.map(g => GU_WORMS[g].name).join(" + ") + ' → ' + GU_WORMS[r.result].name + '</div>';
        html += '<div class="modal-item-stats">费用：💎5000 ' + (alreadyHas ? '(已拥有)' : '') + '</div></div>';
        if (hasAll && !alreadyHas && s.spiritStones >= 5000) {
          html += '<button class="btn-combat" style="font-size:0.7em;" onclick="Game.guFuse(' + i + ')">融合</button>';
        }
        html += '</div>';
      });
      html += '</div>';
    }
    
    html += '<div class="modal-section"><div class="modal-section-title">所有仙蛊图鉴</div>';
    Object.keys(GU_WORMS).forEach(g => {
      const gu = GU_WORMS[g];
      const has = s.guWorms.includes(g);
      html += '<div class="modal-item-row" style="opacity:' + (has ? '1' : '0.4') + '"><div>';
      html += '<div style="' + (has ? 'color:var(--gold-bright)' : 'color:var(--text-dim)') + '">' + gu.name + (has ? ' ✓' : ' (未获得)') + '</div>';
      html += '<div class="modal-item-desc">' + gu.desc + '</div>';
      html += '</div></div>';
    });
    html += '</div>';
    
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },
  
  // ===== 空窍面板 =====
  showAperturePanel() {
    const s = this.state;
    let html = '<div class="modal-section"><div class="modal-section-title">已开窍穴</div>';
    if (s.apertures.length === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;">尚未开辟任何窍穴</div>';
    } else {
      s.apertures.forEach(a => {
        const apt = APERTURES[a];
        html += '<div class="modal-item-row"><div>';
        html += '<div style="color:var(--gold-bright);">' + apt.name + '（' + apt.pos + '）</div>';
        html += '<div class="modal-item-desc">' + apt.desc + '</div>';
        html += '</div></div>';
      });
    }
    html += '</div>';
    
    html += '<div class="modal-section"><div class="modal-section-title">可开辟窍穴</div>';
    Object.keys(APERTURES).forEach(a => {
      const apt = APERTURES[a];
      const has = s.apertures.includes(a);
      const canOpen = CULT_LEVELS[s.cultLevel].stage >= apt.reqStage && !has;
      const cost = (apt.reqStage + 1) * 100;
      html += '<div class="modal-item-row" style="opacity:' + (has ? '0.5' : (canOpen ? '1' : '0.4')) + '" ' + (canOpen ? 'onclick="Game.openAperture(\'' + a + '\')"' : '') + '><div>';
      html += '<div style="color:' + (has ? 'var(--jade)' : (canOpen ? 'var(--gold-bright)' : 'var(--text-dim)')) + '">';
      html += apt.name + (has ? ' ✓' : (CULT_LEVELS[s.cultLevel].stage >= apt.reqStage ? '' : '（需' + STAGE_NAMES[apt.reqStage] + '）'));
      html += '</div>';
      html += '<div class="modal-item-desc">' + apt.desc + '</div>';
      if (!has && canOpen) html += '<div class="modal-item-stats">开辟费用：' + cost + '灵石</div>';
      html += '</div></div>';
    });
    html += '</div>';
    
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },
  
  // ===== 道侣面板 =====
  showCompanionPanel() {
    const s = this.state;
    let html = '<div class="modal-section"><div class="modal-section-title">道侣列表（可养成）</div>';
    if (s.companions.length === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;">尚无道侣<br><span style="font-size:0.8em;">在剧情中结识道侣，可获得战斗加成</span></div>';
    } else {
      s.companions.forEach(c => {
        const comp = COMPANIONS[c];
        const cData = s.companionData[c] || {level:1, exp:0, affinity:0};
        const affLevel = this.getAffinityLevel(cData.affinity);
        const levelMult = 1 + (cData.level - 1) * COMPANION_LEVEL_DATA.atkGrowth;
        const affMult = this.getAffinityMult(cData.affinity);
        const finalAtk = Math.floor(comp.atkBonus * levelMult * affMult);
        const finalDef = Math.floor(comp.defBonus * (1 + (cData.level - 1) * COMPANION_LEVEL_DATA.defGrowth) * affMult);
        
        html += '<div class="modal-item-row" style="flex-direction:column;align-items:flex-start;">';
        html += '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;">';
        html += '<div><div style="color:var(--gold-bright);">💕 ' + comp.name + '</div>';
        html += '<div class="modal-item-desc">' + comp.desc + '</div>';
        html += '<div class="modal-item-stats">';
        html += 'Lv.' + cData.level + '/' + COMPANION_LEVEL_DATA.maxLevel + ' | ';
        html += '亲密度：' + affLevel.name + '(' + cData.affinity + '/100) | ';
        html += '攻击加成：+' + finalAtk + ' | 防御加成：+' + finalDef + ' | ';
        html += '特殊：' + comp.special;
        html += '</div></div></div>';
        
        // 亲密度进度条
        html += '<div class="exp-bar-wrap" style="margin:6px 0;"><div class="exp-bar-fill" style="width:' + cData.affinity + '%"></div><span>亲密度 ' + cData.affinity + '/100</span></div>';
        
        // 互动按钮
        html += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;">';
        COMPANION_LEVEL_DATA.interactions.forEach(inter => {
          const canDo = !inter.cost || s.spiritStones >= inter.cost;
          html += '<button class="btn-combat" style="font-size:0.7em;padding:4px 8px;" ' + (canDo ? '' : 'disabled') + ' onclick="Game.companionInteract(\'' + c + '\',\'' + inter.id + '\')" title="' + inter.desc + '">';
          html += inter.name;
          if (inter.cost) html += '(💎' + inter.cost + ')';
          html += '</button>';
        });
        html += '</div>';
        
        html += '</div>';
      });
    }
    html += '</div>';
    
    html += '<div class="modal-section"><div class="modal-section-title">道侣图鉴</div>';
    Object.keys(COMPANIONS).forEach(c => {
      const comp = COMPANIONS[c];
      const has = s.companions.includes(c);
      html += '<div class="modal-item-row" style="opacity:' + (has ? '1' : '0.4') + '"><div>';
      html += '<div style="color:' + (has ? 'var(--gold-bright)' : 'var(--text-dim)') + '">' + comp.name + (has ? ' 💕' : '（' + comp.location + '）') + '</div>';
      html += '<div class="modal-item-desc">' + comp.desc + '</div>';
      html += '</div></div>';
    });
    html += '</div>';
    
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },
  
  // ===== 杀招面板 =====
  showTechniquePanel() {
    const s = this.state;
    let html = '<div class="modal-section"><div class="modal-section-title">已学功法杀招</div>';
    if (s.techniques.length === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;">尚未学会任何功法</div>';
    } else {
      s.techniques.forEach(t => {
        const tech = TECHNIQUES[t];
        html += '<div class="modal-item-row"><div>';
        html += '<div style="color:var(--gold-bright);">' + tech.name;
        const typeNames = {cultivation:"功法",attack:"杀招",defense:"防御",utility:"辅助",special:"特殊"};
        html += ' <span style="font-size:0.8em;color:var(--jade);">[' + (typeNames[tech.type]||tech.type) + ']</span>';
        html += '</div>';
        html += '<div class="modal-item-desc">' + tech.desc + '</div>';
        html += '<div class="modal-item-stats">';
        if (tech.damage) html += '伤害:' + tech.damage + ' ';
        if (tech.mpCost) html += '消耗:' + tech.mpCost + '灵力 ';
        if (tech.atkBonus) html += '攻击+' + tech.atkBonus + ' ';
        if (tech.defBonus) html += '防御+' + tech.defBonus + ' ';
        if (tech.expBonus) html += '经验+' + (tech.expBonus*100) + '% ';
        if (tech.maxMpBonus) html += '灵力上限+' + tech.maxMpBonus + ' ';
        if (tech.compBonus) html += '悟性+' + tech.compBonus + ' ';
        if (tech.luckBonus) html += '机缘+' + tech.luckBonus + ' ';
        html += '</div></div></div>';
      });
    }
    html += '</div>';
    
    html += '<div class="modal-section"><div class="modal-section-title">功法图鉴</div>';
    Object.keys(TECHNIQUES).forEach(t => {
      const tech = TECHNIQUES[t];
      const has = s.techniques.includes(t);
      html += '<div class="modal-item-row" style="opacity:' + (has ? '1' : '0.4') + '"><div>';
      html += '<div style="color:' + (has ? 'var(--gold-bright)' : 'var(--text-dim)') + '">' + tech.name + (has ? ' ✓' : '') + '</div>';
      html += '<div class="modal-item-desc">' + tech.desc + '</div>';
      html += '</div></div>';
    });
    html += '</div>';
    
    if (s.techniques.length >= Object.keys(TECHNIQUES).length) this.giveAchievement("all_techniques");
    
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },
  
  // ===== 地图面板 =====
  showMapPanel() {
    const s = this.state;
    let html = '<div class="modal-section"><div class="modal-section-title">天下地图</div>';
    Object.keys(LOCATIONS).forEach(loc => {
      const l = LOCATIONS[loc];
      const canGo = CULT_LEVELS[s.cultLevel].stage >= l.reqStage;
      const isHere = s.location === loc;
      html += '<div class="modal-item-row" style="opacity:' + (canGo ? '1' : '0.4') + '" ' + (canGo && !isHere ? 'onclick="Game.travel(\'' + loc + '\')"' : '') + '><div>';
      html += '<div style="color:' + (isHere ? 'var(--jade)' : (canGo ? 'var(--gold-bright)' : 'var(--text-dim)')) + '">';
      html += (isHere ? '📍 ' : '') + loc;
      if (!canGo) html += '（需' + STAGE_NAMES[l.reqStage] + '）';
      html += '</div>';
      html += '<div class="modal-item-desc">' + l.desc + '</div>';
      html += '</div></div>';
    });
    html += '</div>';
    
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },
  
  travel(loc) {
    this.state.location = loc;
    UI.toast("前往" + loc, "success");
    UI.closeModal();
    setTimeout(()=>UI.showPanel('map'), 100);
  },
  
  // ===== 成就面板 =====
  showAchievementPanel() {
    const s = this.state;
    let html = '<div class="modal-section"><div class="modal-section-title">已获得成就（' + s.achievements.length + '/' + Object.keys(ACHIEVEMENTS).length + '）</div>';
    Object.keys(ACHIEVEMENTS).forEach(a => {
      const ach = ACHIEVEMENTS[a];
      const has = s.achievements.includes(a);
      html += '<div class="modal-item-row" style="opacity:' + (has ? '1' : '0.4') + '"><div>';
      html += '<div style="color:' + (has ? 'var(--gold-bright)' : 'var(--text-dim)') + '">' + (has ? ach.icon : '🔒') + ' ' + ach.name + (has ? '' : ' (未解锁)') + '</div>';
      html += '<div class="modal-item-desc">' + ach.desc + '</div>';
      html += '</div></div>';
    });
    html += '</div>';
    
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },
  
  // ===== 灵田面板 =====
  showFarmPanel() {
    const s = this.state;
    if (!Game.farmSlots) Game.farmSlots = [null, null, null, null];
    let html = '<div class="modal-section"><div class="modal-section-title">🌱 灵田（种植收获）</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-bottom:12px;">在灵田种植灵草种子，修炼打坐可推进生长时间</p>';
    
    // 种植槽位
    for (let i = 0; i < 4; i++) {
      const slot = Game.farmSlots[i];
      html += '<div class="modal-item-row" style="flex-direction:column;align-items:flex-start;">';
      if (slot) {
        const seed = SEEDS[slot.seed];
        const isReady = slot.growDays >= slot.growTime;
        const pct = (slot.growDays / slot.growTime) * 100;
        html += '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;">';
        html += '<div><div style="color:var(--jade-bright);">槽位' + (i+1) + '：' + seed.name + '</div>';
        html += '<div class="modal-item-desc">生长进度：' + slot.growDays + '/' + slot.growTime + '天</div></div>';
        if (isReady) {
          html += '<button class="btn-combat" style="font-size:0.75em;border-color:var(--jade);color:var(--jade-bright);" onclick="Game.harvestCrop(' + i + ')">🌾 收获</button>';
        } else {
          html += '<span style="color:var(--text-dim);font-size:0.8em;">生长中…</span>';
        }
        html += '</div>';
        html += '<div class="exp-bar-wrap" style="margin:4px 0;"><div class="exp-bar-fill" style="width:' + pct + '%"></div><span>' + slot.growDays + '/' + slot.growTime + '天</span></div>';
      } else {
        html += '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;">';
        html += '<div style="color:var(--text-dim);">槽位' + (i+1) + '：空</div>';
        html += '</div>';
        // 种子选择
        html += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">';
        Object.keys(SEEDS).forEach(seedId => {
          const seed = SEEDS[seedId];
          const canAfford = s.spiritStones >= seed.cost;
          html += '<button class="btn-combat" style="font-size:0.65em;padding:3px 6px;" ' + (canAfford ? '' : 'disabled') + ' onclick="Game.plantSeed(' + i + ',\'' + seedId + '\')" title="' + seed.desc + '">';
          html += seed.name + '(💎' + seed.cost + '/' + seed.growTime + '天)';
          html += '</button>';
        });
        html += '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    
    // 提示
    html += '<div class="save-help"><p>📌 种植后通过「修炼打坐」推进时间，每次打坐推进1天</p>';
    html += '<p>📌 收获可获得灵草材料和经验</p>';
    html += '<p>📌 已收获次数：' + (s.farmHarvestCount || 0) + '</p></div>';
    
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },
  
  // ===== 野外探索面板 =====
  showWildernessPanel() {
    const s = this.state;
    let html = '<div class="modal-section"><div class="modal-section-title">🗺️ 出城探索</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-bottom:12px;">探索野外可获得经验、灵石、材料，也有随机事件</p>';
    
    Object.keys(WILDERNESS).forEach(key => {
      const area = WILDERNESS[key];
      const canGo = CULT_LEVELS[s.cultLevel].stage >= area.reqStage;
      html += '<div class="modal-item-row" style="opacity:' + (canGo ? '1' : '0.4') + '" ' + (canGo ? 'onclick="Game.exploreWilderness(\'' + key + '\')"' : '') + '><div>';
      html += '<div style="color:' + (canGo ? 'var(--gold-bright)' : 'var(--text-dim)') + '">📍 ' + key;
      if (!canGo) html += '（需' + STAGE_NAMES[area.reqStage] + '）';
      html += '</div>';
      html += '<div class="modal-item-desc">' + area.desc + '</div>';
      html += '<div class="modal-item-stats">经验加成+' + area.expBonus + '% | 灵石加成+' + area.stoneBonus + '% | 事件率' + Math.floor(area.eventChance*100) + '%</div>';
      html += '</div></div>';
    });
    html += '</div>';
    
    html += '<div class="save-help"><p>📌 探索每次消耗1天时间，同时推进灵田生长</p>';
    html += '<p>📌 野外敌人比剧情敌人更强，但奖励也更丰厚</p>';
    html += '<p>📌 已探索次数：' + (s.wildExploreCount || 0) + ' | 野外击杀：' + (s.wildBattlesWon || 0) + '</p></div>';
    
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },
  
  // ===== 道侣养成 =====
  getAffinityMult(affinity) {
    const levels = COMPANION_LEVEL_DATA.affinityLevels;
    let mult = 1;
    for (let i = levels.length - 1; i >= 0; i--) {
      if (affinity >= levels[i].threshold) { mult = 1 + levels[i].bonus; break; }
    }
    return mult;
  },
  
  getAffinityLevel(affinity) {
    const levels = COMPANION_LEVEL_DATA.affinityLevels;
    let result = levels[0];
    for (let i = levels.length - 1; i >= 0; i--) {
      if (affinity >= levels[i].threshold) { result = levels[i]; break; }
    }
    return result;
  },
  
  companionInteract(compId, interactionId) {
    const s = this.state;
    if (!s.companions.includes(compId)) return;
    const inter = COMPANION_LEVEL_DATA.interactions.find(i => i.id === interactionId);
    if (!inter) return;
    const cData = s.companionData[compId] || {level:1, exp:0, affinity:0};
    
    if (inter.cost && s.spiritStones < inter.cost) {
      UI.toast("灵石不足！需要" + inter.cost + "灵石。", "danger");
      return;
    }
    if (inter.cost) s.spiritStones -= inter.cost;
    
    cData.affinity = Math.min(100, cData.affinity + inter.affinityGain);
    if (inter.expGain) this.gainExp(inter.expGain);
    
    // 升级判断
    if (cData.level < COMPANION_LEVEL_DATA.maxLevel) {
      const needed = COMPANION_LEVEL_DATA.expPerLevel[cData.level - 1];
      cData.exp = (cData.exp || 0) + inter.affinityGain * 20;
      if (cData.exp >= needed) {
        cData.exp -= needed;
        cData.level++;
        UI.toast("💕 " + COMPANIONS[compId].name + "升级至" + cData.level + "级！", "gold");
      }
    }
    
    s.companionData[compId] = cData;
    
    if (cData.affinity >= 100) this.giveAchievement("companion_max");
    
    UI.toast(COMPANIONS[compId].name + "亲密度+" + inter.affinityGain + "（" + this.getAffinityLevel(cData.affinity).name + "）", "gold");
    UI.closeModal();
    setTimeout(()=>UI.showPanel('companion'), 100);
  },
  
  // ===== 仙蛊养成 =====
  guLevelUp(guId) {
    const s = this.state;
    if (!s.guWorms.includes(guId)) return;
    const gData = s.guWormLevels[guId] || {level:1, exp:0};
    if (gData.level >= GU_LEVEL_DATA.maxLevel) { UI.toast("已达满级！", "danger"); return; }
    
    const needed = GU_LEVEL_DATA.expPerLevel[gData.level - 1];
    const cost = needed * 2; // 灵石消耗=经验*2
    if (s.spiritStones < cost) {
      UI.toast("灵石不足！需要" + cost + "灵石升级。", "danger");
      return;
    }
    s.spiritStones -= cost;
    gData.level++;
    gData.exp = 0;
    s.guWormLevels[guId] = gData;
    
    UI.toast("🐛 " + GU_WORMS[guId].name + "升级至" + gData.level + "级！", "gold");
    if (gData.level >= GU_LEVEL_DATA.maxLevel) this.giveAchievement("gu_max_level");
    UI.closeModal();
    setTimeout(()=>UI.showPanel('guworm'), 100);
  },
  
  guFeed(guId) {
    const s = this.state;
    if (!s.guWorms.includes(guId)) return;
    const gData = s.guWormLevels[guId] || {level:1, exp:0};
    if (gData.level >= GU_LEVEL_DATA.maxLevel) { UI.toast("已达满级！", "danger"); return; }
    
    const cost = 50;
    if (s.spiritStones < cost) { UI.toast("灵石不足！", "danger"); return; }
    s.spiritStones -= cost;
    
    const expGain = 100;
    const needed = GU_LEVEL_DATA.expPerLevel[gData.level - 1];
    gData.exp = (gData.exp || 0) + expGain;
    if (gData.exp >= needed) {
      gData.exp -= needed;
      gData.level++;
      UI.toast("🐛 " + GU_WORMS[guId].name + "升级至" + gData.level + "级！", "gold");
      if (gData.level >= GU_LEVEL_DATA.maxLevel) this.giveAchievement("gu_max_level");
    } else {
      UI.toast("喂养" + GU_WORMS[guId].name + "，经验+" + expGain, "success");
    }
    s.guWormLevels[guId] = gData;
    UI.closeModal();
    setTimeout(()=>UI.showPanel('guworm'), 100);
  },
  
  guFuse(recipeIndex) {
    const s = this.state;
    const recipe = GU_LEVEL_DATA.fusionRecipes[recipeIndex];
    if (!recipe) return;
    const hasAll = recipe.input.every(g => s.guWorms.includes(g));
    if (!hasAll) { UI.toast("材料蛊不足！", "danger"); return; }
    if (s.guWorms.includes(recipe.result)) { UI.toast("已拥有此融合蛊！", "danger"); return; }
    
    const cost = 5000;
    if (s.spiritStones < cost) { UI.toast("灵石不足！需要" + cost + "灵石。", "danger"); return; }
    s.spiritStones -= cost;
    
    // 移除材料蛊
    recipe.input.forEach(g => {
      const idx = s.guWorms.indexOf(g);
      if (idx >= 0) s.guWorms.splice(idx, 1);
      delete s.guWormLevels[g];
    });
    
    // 添加融合蛊
    s.guWorms.push(recipe.result);
    s.guWormLevels[recipe.result] = {level:1, exp:0};
    
    UI.toast("🔮 融合成功！获得" + GU_WORMS[recipe.result].name + "！", "gold");
    this.giveAchievement("gu_fusion");
    UI.closeModal();
    setTimeout(()=>UI.showPanel('guworm'), 100);
  },
  
  // ===== 灵田种植系统 =====
  plantSeed(slotIndex, seedId) {
    const s = this.state;
    const seed = SEEDS[seedId];
    if (!seed) return;
    if (!this.farmSlots) this.farmSlots = [null, null, null, null];
    if (this.farmSlots[slotIndex]) { UI.toast("此槽位已种植！", "danger"); return; }
    if (s.spiritStones < seed.cost) { UI.toast("灵石不足！", "danger"); return; }
    s.spiritStones -= seed.cost;
    this.farmSlots[slotIndex] = {seed: seedId, growDays: 0, growTime: seed.growTime};
    s.farmSeeds = this.farmSlots;
    if (s.farmHarvestCount === 0) this.giveAchievement("farmer");
    UI.toast("🌱 种植" + seed.name + "，预计" + seed.growTime + "天成熟。", "success");
    UI.closeModal();
    setTimeout(()=>UI.showPanel('farm'), 100);
  },
  
  harvestCrop(slotIndex) {
    const s = this.state;
    if (!this.farmSlots || !this.farmSlots[slotIndex]) return;
    const slot = this.farmSlots[slotIndex];
    if (slot.growDays < slot.growTime) { UI.toast("尚未成熟！还需" + (slot.growTime - slot.growDays) + "天。", "danger"); return; }
    const seed = SEEDS[slot.seed];
    this.addItem(seed.harvest.item, seed.harvest.count);
    this.gainExp(seed.exp);
    s.farmHarvestCount = (s.farmHarvestCount || 0) + 1;
    if (s.farmHarvestCount >= 10) this.giveAchievement("harvest_master");
    this.farmSlots[slotIndex] = null;
    s.farmSeeds = this.farmSlots;
    UI.toast("🌾 收获" + ITEMS[seed.harvest.item].name + "×" + seed.harvest.count + "！", "gold");
    UI.closeModal();
    setTimeout(()=>UI.showPanel('farm'), 100);
  },
  
  advanceDays(days) {
    const s = this.state;
    if (!this.farmSlots) this.farmSlots = [null, null, null, null];
    // 灵田生长
    this.farmSlots.forEach((slot, i) => {
      if (slot && slot.growDays < slot.growTime) {
        slot.growDays += days;
      }
    });
    s.farmSeeds = this.farmSlots;
    // 每月拍卖会
    this.gameMonth += Math.floor(days / 30);
    // 扩展系统时间推进
    if (typeof WorldSystem !== 'undefined' && WorldSystem.advanceTime) {
      WorldSystem.advanceTime(days * 24);
    }
    // 灵山建筑生长
    if (typeof WorldSystem !== 'undefined' && WorldSystem.advanceMountainGrowth) {
      WorldSystem.advanceMountainGrowth(days);
    }
  },
  
  // ===== 拍卖会系统 =====
  showAuctionPanel() {
    const s = this.state;
    // 每次打开随机生成3-5件拍卖品
    const count = 3 + Math.floor(Math.random() * 3);
    const auctionList = [];
    const usedItems = new Set();
    for (let i = 0; i < count; i++) {
      let item;
      do {
        item = AUCTION_ITEMS[Math.floor(Math.random() * AUCTION_ITEMS.length)];
      } while (usedItems.has(item.item) && usedItems.size < AUCTION_ITEMS.length);
      usedItems.add(item.item);
      // 根据修为等级调整价格
      const priceMult = 1 + s.cultLevel * 0.2;
      const finalPrice = Math.floor(item.basePrice * priceMult * (0.8 + Math.random() * 0.4));
      auctionList.push({...item, finalPrice});
    }
    s._currentAuction = auctionList;
    
    let html = '<div class="modal-section"><div class="modal-section-title">🔨 本月拍卖会</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-bottom:12px;">拍卖会每月举办一次，商品随机刷新</p>';
    auctionList.forEach((a, i) => {
      const item = ITEMS[a.item];
      if (!item) return;
      const canAfford = s.spiritStones >= a.finalPrice;
      html += '<div class="modal-item-row" style="flex-direction:column;align-items:flex-start;">';
      html += '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;">';
      html += '<div><div style="color:var(--gold-bright);">' + item.name + '</div>';
      html += '<div class="modal-item-desc">' + a.desc + '</div></div>';
      html += '<div style="text-align:right;">';
      html += '<div style="color:' + (canAfford ? 'var(--gold-bright)' : 'var(--crimson)') + ';font-size:1.1em;">💎 ' + a.finalPrice + '</div>';
      if (canAfford) {
        html += '<button class="btn-combat" style="margin-top:4px;font-size:0.75em;" onclick="Game.auctionBuy(' + i + ')">竞拍</button>';
      } else {
        html += '<span style="color:var(--text-dim);font-size:0.8em;">灵石不足</span>';
      }
      html += '</div></div>';
      html += '<div class="modal-item-stats">';
      if (item.atk) html += '攻击+' + item.atk + ' ';
      if (item.def) html += '防御+' + item.def + ' ';
      if (item.maxMp) html += '灵力上限+' + item.maxMp + ' ';
      html += '</div></div>';
    });
    html += '</div>';
    
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },
  
  auctionBuy(index) {
    const s = this.state;
    if (!s._currentAuction || !s._currentAuction[index]) return;
    const a = s._currentAuction[index];
    if (s.spiritStones < a.finalPrice) { UI.toast("灵石不足！", "danger"); return; }
    s.spiritStones -= a.finalPrice;
    this.addItem(a.item, 1);
    s.auctionWins = (s.auctionWins || 0) + 1;
    if (s.auctionWins === 1) this.giveAchievement("auction_win");
    UI.toast("🔨 成功竞拍" + ITEMS[a.item].name + "！", "gold");
    // 从列表移除
    s._currentAuction.splice(index, 1);
    UI.closeModal();
    setTimeout(()=>UI.showPanel('auction'), 100);
  },
  
  // ===== 野外探索系统 =====
  exploreWilderness(areaKey) {
    const s = this.state;
    const area = WILDERNESS[areaKey];
    if (!area) return;
    if (CULT_LEVELS[s.cultLevel].stage < area.reqStage) { UI.toast("修为不足，无法探索此处！", "danger"); return; }
    
    s.wildExploreCount = (s.wildExploreCount || 0) + 1;
    if (s.wildExploreCount === 1) this.giveAchievement("explorer");
    if (s.wildExploreCount >= 10) this.giveAchievement("explorer");
    
    s.location = areaKey;
    this.advanceDays(1); // 探索消耗1天
    
    // 决定遇到什么
    const roll = Math.random();
    if (roll < area.eventChance) {
      // 遇到敌人
      const enemyKey = area.enemies[Math.floor(Math.random() * area.enemies.length)];
      const enemy = ENEMIES[enemyKey];
      // 难度缩放
      const scaledEnemy = {...enemy};
      const scale = 1 + s.cultLevel * 0.15;
      scaledEnemy.hp = Math.floor(enemy.hp * scale);
      scaledEnemy.atk = Math.floor(enemy.atk * scale);
      scaledEnemy.def = Math.floor(enemy.def * scale);
      scaledEnemy.exp = Math.floor(enemy.exp * (1 + area.expBonus / 100));
      scaledEnemy.stone = Math.floor(enemy.stone * (1 + area.stoneBonus / 100));
      scaledEnemy.name = enemy.name;
      
      this.combatState = {
        enemy: scaledEnemy,
        enemyHp: scaledEnemy.hp,
        enemyMaxHp: scaledEnemy.hp,
        onWin: "_wild_victory",
        onLose: "_wild_defeat",
        turn: 0,
        log: [],
        isWild: true,
        areaKey: areaKey,
      };
      
      UI.renderNarrative([
        {type:"narration",content:"你深入" + areaKey + "探索……"},
        {type:"danger",content:"⚠ 遭遇" + scaledEnemy.name + "！"},
      ]);
      UI.showCombat(this.combatState);
      this.combatLog("遭遇" + scaledEnemy.name + "！战斗开始！", "system");
    } else {
      // 随机事件
      const event = this.rollRandomEvent();
      this.processRandomEvent(event, areaKey);
    }
  },
  
  rollRandomEvent() {
    const totalWeight = RANDOM_EVENTS.reduce((s, e) => s + e.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const event of RANDOM_EVENTS) {
      roll -= event.weight;
      if (roll <= 0) return event;
    }
    return RANDOM_EVENTS[0];
  },
  
  processRandomEvent(event, areaKey) {
    const s = this.state;
    const area = WILDERNESS[areaKey];
    let texts = [
      {type:"narration",content:"你深入" + areaKey + "探索……"},
      {type:"narration",content:event.text},
    ];
    
    if (event.effect.stone) {
      s.spiritStones += event.effect.stone;
      if (event.effect.stone > 0) texts.push({type:"reward",content:"💎 " + (event.effect.stone > 0 ? "获得" : "消耗") + Math.abs(event.effect.stone) + "灵石"});
    }
    if (event.effect.exp) {
      this.gainExp(event.effect.exp);
      texts.push({type:"reward",content:"✨ 获得" + event.effect.exp + "经验"});
    }
    if (event.effect.item) {
      this.addItem(event.effect.item, 1);
      texts.push({type:"reward",content:"📦 获得" + ITEMS[event.effect.item].name});
    }
    if (event.effect.hp) {
      s.hp = Math.max(1, Math.min(s.maxHp, s.hp + event.effect.hp));
      if (event.effect.hp < 0) texts.push({type:"danger",content:"💔 " + Math.abs(event.effect.hp) + "点伤害"});
    }
    if (event.effect.comp) {
      s.comp += event.effect.comp;
      texts.push({type:"reward",content:"🧠 悟性+" + event.effect.comp});
    }
    if (event.effect.guWorm) {
      if (!s.guWorms.includes(event.effect.guWorm)) {
        s.guWorms.push(event.effect.guWorm);
        s.guWormLevels[event.effect.guWorm] = {level:1, exp:0};
        texts.push({type:"reward",content:"🐛 获得仙蛊：" + GU_WORMS[event.effect.guWorm].name + "！"});
      }
    }
    if (event.effect.combat) {
      const enemy = ENEMIES[event.effect.combat];
      this.combatState = {
        enemy: {...enemy},
        enemyHp: enemy.hp,
        enemyMaxHp: enemy.hp,
        onWin: "_wild_victory",
        onLose: "_wild_defeat",
        turn: 0,
        log: [],
        isWild: true,
        areaKey: areaKey,
      };
      UI.renderNarrative(texts);
      UI.showCombat(this.combatState);
      return;
    }
    
    texts.push({type:"narration",content:"探索完毕，你可以继续探索或返回。"});
    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"继续探索" + areaKey, next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
  },
  
  // ===== 炼丹系统 =====
  showAlchemyPanel() {
    const s = this.state;
    let html = '<div class="modal-section"><div class="modal-section-title">⚗️ 炼丹炉</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.8em;margin-bottom:12px;">使用灵草等材料炼制丹药</p>';
    
    const recipes = [
      {name:"疗伤丹",materials:[{id:"spirit_grass",count:2}],result:"healing_pill",cost:20,desc:"恢复100气血"},
      {name:"补气丹",materials:[{id:"spirit_grass",count:2}],result:"qi_pill",cost:20,desc:"恢复50灵力"},
      {name:"极品筑基丹",materials:[{id:"thousand_year_ginseng",count:1},{id:"spirit_grass",count:5}],result:"foundation_pill_supreme",cost:200,desc:"突破成功率+50%"},
      {name:"极品结丹丹",materials:[{id:"thousand_year_ginseng",count:2},{id:"golden_lotus",count:1}],result:"core_pill_supreme",cost:500,desc:"突破成功率+40%"},
      {name:"极品凝婴丹",materials:[{id:"golden_lotus",count:2},{id:"dragon_blood",count:1}],result:"infant_pill_supreme",cost:1000,desc:"突破成功率+35%"},
      {name:"破境丹",materials:[{id:"golden_lotus",count:1},{id:"star_sand",count:3}],result:"breakthrough_pill",cost:500,desc:"获得5000经验"},
      {name:"仙丹",materials:[{id:"immortal_herb",count:2},{id:"golden_lotus",count:3}],result:"immortal_pill",cost:5000,desc:"全恢复"},
    ];
    
    recipes.forEach((r, i) => {
      let canCraft = s.spiritStones >= r.cost;
      r.materials.forEach(m => {
        const inv = s.inventory.find(it => it.id === m.id);
        if (!inv || inv.count < m.count) canCraft = false;
      });
      html += '<div class="modal-item-row" style="flex-direction:column;align-items:flex-start;">';
      html += '<div style="width:100%;display:flex;justify-content:space-between;">';
      html += '<div><div style="color:var(--gold-bright);">' + r.name + '</div>';
      html += '<div class="modal-item-desc">' + r.desc + '</div>';
      html += '<div class="modal-item-stats">材料：' + r.materials.map(m => ITEMS[m.id].name + "×" + m.count).join("，") + ' | 💎' + r.cost + '</div></div>';
      if (canCraft) {
        html += '<button class="btn-combat" style="font-size:0.75em;" onclick="Game.craftPill(' + i + ')">炼制</button>';
      } else {
        html += '<span style="color:var(--text-dim);font-size:0.8em;">材料不足</span>';
      }
      html += '</div></div>';
    });
    
    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
    s._alchemyRecipes = recipes;
  },
  
  craftPill(index) {
    const s = this.state;
    if (!s._alchemyRecipes || !s._alchemyRecipes[index]) return;
    const r = s._alchemyRecipes[index];
    if (s.spiritStones < r.cost) { UI.toast("灵石不足！", "danger"); return; }
    let canCraft = true;
    r.materials.forEach(m => {
      const inv = s.inventory.find(it => it.id === m.id);
      if (!inv || inv.count < m.count) canCraft = false;
    });
    if (!canCraft) { UI.toast("材料不足！", "danger"); return; }
    
    s.spiritStones -= r.cost;
    r.materials.forEach(m => {
      const inv = s.inventory.find(it => it.id === m.id);
      inv.count -= m.count;
      if (inv.count <= 0) s.inventory = s.inventory.filter(it => it.id !== m.id);
    });
    
    // 90%成功率
    if (Math.random() < 0.9) {
      this.addItem(r.result, 1);
      s.alchemyCount = (s.alchemyCount || 0) + 1;
      if (s.alchemyCount === 1) this.giveAchievement("alchemist");
      UI.toast("⚗️ 炼制成功！获得" + ITEMS[r.result].name + "！", "gold");
    } else {
      UI.toast("💨 炼丹失败……材料报废了。", "danger");
    }
    UI.closeModal();
    setTimeout(()=>UI.showPanel('alchemy'), 100);
  },
  
  // ===== 野外战斗结果 =====
  wildVictory() {
    const cs = this.combatState;
    const s = this.state;
    s.battlesWon++;
    s.wildBattlesWon = (s.wildBattlesWon || 0) + 1;
    if (s.wildBattlesWon >= 50) this.giveAchievement("wilderness_master");
    if (s.battlesWon === 1) this.giveAchievement("first_kill");
    
    const area = WILDERNESS[cs.areaKey];
    const expGain = Math.floor(cs.enemy.exp * (1 + (area ? area.expBonus : 0) / 100));
    const stoneGain = Math.floor(cs.enemy.stone * (1 + (area ? area.stoneBonus : 0) / 100));
    this.gainExp(expGain);
    s.spiritStones += stoneGain;
    
    let texts = [
      {type:"narration",content:"你击败了" + cs.enemy.name + "！"},
      {type:"reward",content:"获得" + expGain + "经验，" + stoneGain + "灵石。"},
    ];
    if (cs.enemy.drop && Math.random() < (cs.enemy.dropRate || 0.2)) {
      this.addItem(cs.enemy.drop, 1);
      texts.push({type:"reward",content:"获得掉落：" + ITEMS[cs.enemy.drop].name});
    }
    texts.push({type:"narration",content:"你可以继续探索或返回。"});
    
    UI.hideCombat();
    this.combatState = null;
    UI.renderNarrative(texts);
    UI.renderChoices([
      {text:"继续探索", next:"_wild_continue", effect:{}},
      {text:"返回", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },
  
  wildDefeat() {
    const s = this.state;
    s.hp = Math.floor(s.maxHp * 0.3);
    s.mp = Math.floor(s.maxMp * 0.3);
    UI.hideCombat();
    this.combatState = null;
    UI.renderNarrative([
      {type:"danger",content:"你被击败了……勉强逃回了安全地带。"},
      {type:"narration",content:"你需要恢复气血后再继续探索。"},
    ]);
    UI.renderChoices([
      {text:"返回城镇", next:"_wild_return", effect:{}},
    ]);
    UI.updateAll();
  },
  
  wildReturn() {
    const s = this.state;
    // 优先使用扩展4的返回系统
    if (typeof WorldSystem !== 'undefined' && typeof WorldSystem.returnToParent === 'function' && s.currentWilderness) {
      WorldSystem.returnToParent();
      return;
    }
    // 兼容旧版：返回到最近的城镇
    const stage = CULT_LEVELS[s.cultLevel].stage;
    if (stage >= 8) s.location = "仙界";
    else if (stage >= 4) s.location = "灵界";
    else if (stage >= 3) s.location = "坠魔谷";
    else if (stage >= 2) s.location = "虚天殿";
    else if (stage >= 1) s.location = "乱星海";
    else s.location = "天南坊市城";
    
    UI.renderNarrative([
      {type:"narration",content:"你返回了" + s.location + "。"},
      {type:"system_msg",content:"你可以继续修炼、探索野外、参加拍卖会等。"},
    ]);
    UI.renderChoices([
      {text:"修炼打坐", next:"cultivate_meditate", effect:{}},
      {text:"查看菜单", next:"_menu", effect:{}},
    ]);
    UI.updateAll();
  },
  
  // ===== 装备面板 =====
  showEquipmentPanel() {
    const s = this.state;
    let html = '<div class="modal-section"><div class="modal-section-title">当前装备</div>';
    const slots = {weapon:"武器",armor:"防具",accessory:"饰品",artifact:"法宝"};
    Object.keys(slots).forEach(slot => {
      const itemId = s.equipment[slot];
      html += '<div class="modal-item-row"><div>';
      if (itemId) {
        const item = ITEMS[itemId];
        html += '<div style="color:var(--gold-bright);">' + slots[slot] + '：' + item.name + '</div>';
        html += '<div class="modal-item-desc">' + item.desc + '</div>';
        html += '<div class="modal-item-stats">';
        if (item.atk) html += '攻击+' + item.atk + ' ';
        if (item.def) html += '防御+' + item.def + ' ';
        if (item.spd) html += '速度+' + item.spd + ' ';
        if (item.maxMp) html += '灵力上限+' + item.maxMp + ' ';
        html += '</div>';
        html += '</div><button class="btn-combat" onclick="Game.unequipItem(\'' + slot + '\')">卸下</button></div>';
      } else {
        html += '<div style="color:var(--text-dim);">' + slots[slot] + '：无</div></div>';
      }
      html += '</div>';
    });
    html += '</div>';
    
    html += '<div class="modal-section"><div class="modal-section-title">背包物品</div>';
    if (s.inventory.length === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;">背包空空如也</div>';
    } else {
      s.inventory.forEach(inv => {
        const item = ITEMS[inv.id];
        if (!item) return;
        const gradeNames = ["","凡品","灵品","宝品","仙品","至宝"];
        const gradeColors = ["","#aaa","var(--jade-bright)","var(--blue-spirit)","var(--purple-spirit)","var(--gold-bright)"];
        html += '<div class="modal-item-row"><div>';
        html += '<div style="color:' + gradeColors[item.grade] + ';">' + item.name + (inv.count > 1 ? ' ×' + inv.count : '') + ' <span style="font-size:0.8em;">[' + gradeNames[item.grade] + ']</span></div>';
        html += '<div class="modal-item-desc">' + item.desc + '</div>';
        html += '<div class="modal-item-stats">';
        if (item.atk) html += '攻击+' + item.atk + ' ';
        if (item.def) html += '防御+' + item.def + ' ';
        if (item.spd) html += '速度+' + item.spd + ' ';
        if (item.maxMp) html += '灵力上限+' + item.maxMp + ' ';
        html += '</div></div>';
        
        if (["weapon","armor","accessory","artifact"].includes(item.type)) {
          html += '<button class="btn-combat" onclick="Game.equipItem(\'' + inv.id + '\')">装备</button>';
        } else if (item.type === "consumable") {
          html += '<button class="btn-combat" onclick="Game.useItem(\'' + inv.id + '\')">使用</button>';
        }
        html += '</div>';
      });
    }
    html += '</div>';
    
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },
};
