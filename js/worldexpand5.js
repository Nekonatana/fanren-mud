/* ====== 凡人修仙传MUD · 扩展5引擎（场所系统/任务/王朝/蛮夷/NPC分布） ====== */

Object.assign(WorldSystem, {
  // ===== 初始化扩展5状态 =====
  initExpand5State(state) {
    if (!state.locQuests) state.locQuests = {};
    if (!state.locQuestCooldown) state.locQuestCooldown = {};
    if (!state.activeLocQuests) state.activeLocQuests = [];
    if (!state.completedLocQuests) state.completedLocQuests = 0;
    if (!state.npcPlaces) state.npcPlaces = {};
    if (!state.dynastyRank) state.dynastyRank = null;
    if (!state.assignedPlaces) state.assignedPlaces = {}; // locKey -> true (已分配过场所)
  },

  // ===== 给区域内的NPC分配场所 =====
  assignAreaPlaces(state, locKey) {
    if (!state.npcList) return;
    // 只对没有place字段的NPC分配
    const needAssign = state.npcList.filter(npc => npc.isAlive && npc.area === locKey && !npc.place);
    if (needAssign.length === 0) return;

    const places = this.getLocationPlaces(locKey);
    if (places.length === 0) return;

    // 先统计每个场所已有多少NPC
    const placeCounts = {};
    places.forEach(p => { placeCounts[p] = 0; });
    state.npcList.forEach(npc => {
      if (npc.isAlive && npc.area === locKey && npc.place && placeCounts[npc.place] !== undefined) {
        placeCounts[npc.place]++;
      }
    });

    // 分配NPC到场所
    needAssign.forEach(npc => {
      // 民居优先分配凡人/孩童
      if (npc.isCommoner || npc.isChild) {
        if (places.includes("residential") && placeCounts.residential < 3) {
          npc.place = "residential";
          placeCounts.residential++;
          return;
        }
      }
      // 选择NPC数量未满的场所
      const available = places.filter(p => {
        const def = PLACE_DEFS[p];
        if (!def) return false;
        if (p === "residential") return placeCounts[p] < 3; // 民居最多3个
        return placeCounts[p] < def.npcRange[1];
      });
      if (available.length > 0) {
        const chosen = available[Math.floor(Math.random() * available.length)];
        npc.place = chosen;
        placeCounts[chosen]++;
      } else {
        // 所有场所都满了，随机分配
        npc.place = places[Math.floor(Math.random() * places.length)];
        placeCounts[npc.place]++;
      }
    });
    state.assignedPlaces[locKey] = true;
  },

  // ===== 显示场所NPC列表（超过5个时） =====
  showPlaceNPCList(locKey, placeType) {
    const s = Game.state;
    this.initExpand5State(s);
    const placeName = this.getPlaceDisplayName(locKey, placeType);
    const npcs = this.getPlaceNPCs(s, locKey, placeType);

    let html = '<div class="modal-section"><div class="modal-section-title">' + placeName + ' \u00B7 \u4EBA\u5458\u540D\u5355</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.85em;margin-bottom:12px;">\u5171' + npcs.length + '\u4EBA</p>';

    npcs.forEach(npc => {
      const genderStr = npc.isFemale ? "\u5973" : "\u7537";
      const cultStr = npc.cultLevel !== undefined && npc.cultLevel >= 0 ? npc.cultName : "\u51E1\u4EBA";
      const childStr = npc.isChild ? "\u5B69\u7AE5\u00B7" : "";
      const titleStr = npc.officialTitle ? npc.officialTitle + "\u00B7" : (npc.barbarianTitle ? npc.barbarianTitle + "\u00B7" : "");
      html += '<div class="modal-item-row" style="cursor:pointer;" onclick="UI.closeModal();Game.gotoNode(\'_npc_talk_' + npc.id + '\')">';
      html += '<div><span style="color:var(--gold-bright);">' + titleStr + childStr + npc.name + '</span>';
      html += ' <span style="font-size:0.8em;color:var(--text-dim);">(' + genderStr + '\u00B7' + cultStr + ')</span></div>';
      html += '<div class="modal-item-desc">' + npc.action + '</div>';
      html += '</div>';
    });

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal();Game.gotoNode(\'_enter_place_' + locKey + '|' + placeType + '\')">\u8FD4\u56DE</button>');
  },

  // ===== 获取地点的场所列表 =====
  getLocationPlaces(locKey) {
    let places = [];
    // 王朝城市
    if (DYNASTY_PLACE_MAP[locKey]) {
      places = DYNASTY_PLACE_MAP[locKey].slice();
    }
    // 蛮夷地区
    else if (BARBARIAN_PLACE_MAP[locKey]) {
      places = BARBARIAN_PLACE_MAP[locKey].slice();
    }
    // 通用配置
    else if (LOCATION_PLACES[locKey]) {
      places = LOCATION_PLACES[locKey].slice();
    }
    // 根据地点类型自动生成
    else {
      const loc = WORLD_MAP[locKey];
      if (!loc) return [];
      if (loc.type === "sect") {
        places = ["sect_hall","scripture_lib","training_ground","alchemy_room","herb_garden","disciple_quart","back_mountain","mission_hall"];
      } else if (loc.type === "city") {
        places = ["residential","gov_office","academy","market","inn","teahouse","temple","arena","city_gate"];
      } else if (loc.type === "wild" || loc.type === "warzone" || loc.type === "danger") {
        places = ["residential","market","temple"];
      } else if (loc.type === "sea") {
        places = ["dock","market","inn","temple"];
      } else if (loc.type === "ruins") {
        places = ["back_mountain","temple"];
      } else if (loc.type === "realm") {
        places = ["sect_hall","scripture_lib","treasure_pav","disciple_quart","market","inn","grand_temple"];
      }
    }
    return places;
  },

  // ===== 获取场所显示名称 =====
  getPlaceName(locKey, placeType) {
    const overrides = PLACE_NAME_OVERRIDES[locKey];
    if (overrides && overrides[placeType]) return overrides[placeType];
    const def = PLACE_DEFS[placeType];
    if (!def) return placeType;
    const loc = WORLD_MAP[locKey];
    const locName = loc ? loc.name : locKey;
    // 家族类地点用"祠堂"代替"主殿"
    if (placeType === "sect_hall") {
      const sectRank = SECT_RANKINGS ? Object.keys(SECT_RANKINGS).find(k => SECT_RANKINGS[k].name === locName) : null;
      if (sectRank) return locName + "\u4E3B\u6BBF";
    }
    return locName + def.icon;
  },

  // ===== 显示场所面板 =====
  showPlacesPanel(locKey) {
    const s = Game.state;
    this.initExpand5State(s);
    const loc = WORLD_MAP[locKey];
    if (!loc) { UI.toast("\u672A\u77E5\u5730\u70B9\u3002", "danger"); return; }

    const places = this.getLocationPlaces(locKey);
    if (places.length === 0) {
      UI.toast("\u6B64\u5730\u65E0\u53EF\u524D\u5F80\u4E4B\u5904\u3002", "info");
      return;
    }

    let html = '<div class="modal-section"><div class="modal-section-title">\u{1F3D7}\uFE0F ' + loc.name + ' \u00B7 \u524D\u5F80\u5404\u5904</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.85em;margin-bottom:12px;">\u9009\u62E9\u8981\u524D\u5F80\u7684\u573A\u6240</p>';

    places.forEach(placeType => {
      const def = PLACE_DEFS[placeType];
      if (!def) return;
      const placeName = this.getPlaceDisplayName(locKey, placeType);
      // 获取该场所的NPC数量
      const placeNPCs = this.getPlaceNPCs(s, locKey, placeType);
      const npcCount = placeNPCs.length;
      const hasDungeon = placeType === "back_mountain" || (placeType === "training_ground" && Math.random() < 0.3);

      html += '<div class="modal-item-row" onclick="UI.closeModal();Game.gotoNode(\'_enter_place_' + locKey + '|' + placeType + '\')" style="cursor:pointer;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
      html += '<div><span style="font-size:1.3em;">' + def.icon + '</span> ';
      html += '<span style="color:var(--gold-bright);font-weight:bold;">' + placeName + '</span>';
      if (npcCount > 0) {
        html += ' <span style="font-size:0.75em;color:var(--jade);">(' + npcCount + '\u4EBA)</span>';
      }
      html += '</div>';
      html += '<span style="color:var(--text-dim);font-size:0.8em;">\u524D\u5F80 \u00BB</span>';
      html += '</div>';
      html += '<div class="modal-item-desc">' + def.descBase + '</div>';
      html += '</div>';
    });

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">\u5173\u95ED</button>');
  },

  // ===== 获取场所显示名（含override和后缀） =====
  getPlaceDisplayName(locKey, placeType) {
    const overrides = PLACE_NAME_OVERRIDES[locKey];
    if (overrides && overrides[placeType]) return overrides[placeType];
    const def = PLACE_DEFS[placeType];
    if (!def) return placeType;
    const loc = WORLD_MAP[locKey];
    const locName = loc ? loc.name : locKey;
    return locName + def.defaultName;
  },

  // ===== 进入具体场所 =====
  enterPlace(locKey, placeType) {
    const s = Game.state;
    this.initExpand5State(s);
    this.initWorldState(s);
    const def = PLACE_DEFS[placeType];
    if (!def) { UI.toast("\u672A\u77E5\u573A\u6240\u3002", "danger"); return; }

    // 记录当前场所（用于NPC交谈后返回）
    s.currentPlace = {locKey, placeType};

    const placeName = this.getPlaceDisplayName(locKey, placeType);
    const loc = WORLD_MAP[locKey];
    const placeNPCs = this.getPlaceNPCs(s, locKey, placeType);

    // 确保场所有NPC
    if (placeNPCs.length === 0 && placeType !== "back_mountain") {
      this.ensurePlaceNPCs(s, locKey, placeType);
    }

    const updatedNPCs = this.getPlaceNPCs(s, locKey, placeType);

    let texts = [
      {type:"narration", content:"\u4F60\u6765\u5230\u4E86" + placeName + "\u3002"},
      {type:"narration", content:def.descBase},
    ];

    if (updatedNPCs.length > 0) {
      texts.push({type:"system_msg", content:"\u6B64\u5904\u6709" + updatedNPCs.length + "\u4EBA\u3002"});
    }

    UI.closeModal();
    UI.renderNarrative(texts);

    // 生成选项
    const choices = [];

    // NPC交谈
    const showNPCs = updatedNPCs.slice(0, 5);
    showNPCs.forEach(npc => {
      const genderStr = npc.isFemale ? "\u5973" : "\u7537";
      const cultStr = npc.cultLevel !== undefined && npc.cultLevel >= 0 ? npc.cultName : "\u51E1\u4EBA";
      const childStr = npc.isChild ? "\u5B69\u7AE5\u00B7" : "";
      const officialStr = npc.officialTitle ? npc.officialTitle + "\u00B7" : "";
      choices.push({text:"\u4E0E" + officialStr + childStr + npc.name + "\u4EA4\u8C08\uFF08" + genderStr + "\u00B7" + cultStr + "\uFF09", next:"_npc_talk_" + npc.id, effect:{}});
    });
    if (updatedNPCs.length > 5) {
      choices.push({text:"\u67E5\u770B\u66F4\u591A\u4EBA\uFF08\u5171" + updatedNPCs.length + "\u4EBA\uFF09", next:"_place_npc_list_" + locKey + "|" + placeType, effect:{}});
    }

    // 场所特定动作
    if (def.actions.includes("quest") || def.actions.includes("meet_leader")) {
      const hasQuests = this.getLocationQuests(locKey).length > 0;
      if (hasQuests) {
        choices.push({text:"\u{1F4CB} \u67E5\u770B\u4EFB\u52A1\u677F", next:"_loc_quest_panel_" + locKey, effect:{}});
      }
    }
    if (def.actions.includes("learn") || def.actions.includes("read")) {
      choices.push({text:"\u{1F4DA} \u9605\u8BFB\u5178\u7C4D\uFF08\u83B7\u5F97\u4FEE\u4E3A\u7ECF\u9A8C\uFF09", next:"_place_learn_" + locKey + "|" + placeType, effect:{}});
    }
    if (def.actions.includes("spar") || def.actions.includes("train")) {
      choices.push({text:"\u2694\uFE0F \u7EC3\u529F\u4FEE\u70BC\uFF08\u83B7\u5F97\u4FEE\u4E3A\u7ECF\u9A8C\uFF09", next:"_place_train_" + locKey + "|" + placeType, effect:{}});
    }
    if (def.actions.includes("gather_herb")) {
      choices.push({text:"\u{1F33F} \u91C7\u96C6\u7075\u8349", next:"_place_gather_" + locKey, effect:{}});
    }
    if (def.actions.includes("rest") || def.actions.includes("rumor")) {
      choices.push({text:"\u{1F375} \u542C\u95FB\u4F20\u95FB", next:"_place_rumor_" + locKey, effect:{}});
    }
    if (def.actions.includes("pray") || def.actions.includes("blessing")) {
      choices.push({text:"\u{1F64F} \u7948\u79B0\uFF08\u83B7\u5F97\u798F\u7F18\uFF09", next:"_place_pray_" + locKey, effect:{}});
    }
    if (def.actions.includes("exam") && locKey === "\u957F\u5B89\u57CE") {
      choices.push({text:"\u270D\uFE0F \u53C2\u52A0\u79D1\u4E3E\u8003\u8BD5", next:"_dynasty_exam_", effect:{}});
    }
    if (def.actions.includes("enlist") && locKey === "\u957F\u5B89\u57CE") {
      choices.push({text:"\u{1FA96} \u62A5\u540D\u4ECE\u519B", next:"_dynasty_enlist_", effect:{}});
    }
    if (def.actions.includes("audience") && locKey === "\u957F\u5B89\u57CE") {
      choices.push({text:"\u{1F3F0} \u8BF7\u6C42\u89C1\u9A7E", next:"_dynasty_audience_", effect:{}});
    }
    if (def.actions.includes("alchemy")) {
      choices.push({text:"\u2697\uFE0F \u70BC\u5236\u4E39\u836F", next:"_place_alchemy_" + locKey, effect:{}});
    }
    if (def.actions.includes("exchange")) {
      choices.push({text:"\u{1F48E} \u5151\u6362\u5B9D\u7269", next:"_place_exchange_" + locKey, effect:{}});
    }

    // 副本入口
    if (def.actions.includes("dungeon") || placeType === "back_mountain") {
      const dungeon = LOCATION_DUNGEON_DEFS[locKey] || SECT_DUNGEONS && SECT_DUNGEONS[this.getSectIdByLocKey(locKey)];
      if (dungeon) {
        const cultStage = CULT_LEVELS[s.cultLevel].stage;
        if (cultStage >= dungeon.reqStage) {
          choices.push({text:"\u{1F3AA} \u524D\u5F80\u526F\u672C\uFF1A" + dungeon.name, next:"_loc_dungeon_enter_" + locKey, effect:{}});
        }
      }
    }

    // 返回
    choices.push({text:"\u8FD4\u56DE" + (loc ? loc.name : ""), next:"_place_back_" + locKey, effect:{}});

    UI.renderChoices(choices);
    UI.updateAll();
  },

  // ===== 通过locKey找sectId =====
  getSectIdByLocKey(locKey) {
    if (!SECT_MAP_LOCATIONS) return null;
    for (const sectId in SECT_MAP_LOCATIONS) {
      if (SECT_MAP_LOCATIONS[sectId].mapKey === locKey) return sectId;
    }
    return null;
  },

  // ===== 获取/生成地点任务 =====
  getLocationQuests(locKey) {
    const s = Game.state;
    this.initExpand5State(s);
    if (!s.locQuests[locKey]) {
      // 生成2-3个任务
      const cultStage = CULT_LEVELS[s.cultLevel].stage;
      const available = LOCATION_QUEST_POOL.filter(q => q.minStage <= cultStage);
      const count = Math.min(3, available.length);
      const selected = [];
      const pool = available.slice();
      for (let i = 0; i < count; i++) {
        if (pool.length === 0) break;
        const idx = Math.floor(Math.random() * pool.length);
        const quest = pool.splice(idx, 1)[0];
        const questIdx = LOCATION_QUEST_POOL.indexOf(quest);
        selected.push(questIdx);
      }
      s.locQuests[locKey] = selected;
    }
    // 过滤掉已接受和冷却中的
    const result = [];
    s.locQuests[locKey].forEach(qIdx => {
      const isActive = s.activeLocQuests.some(q => q.locKey === locKey && q.questIdx === qIdx);
      const cooldown = s.locQuestCooldown[locKey] && s.locQuestCooldown[locKey][qIdx];
      const currentDay = s.day || 0;
      if (!isActive && (!cooldown || currentDay >= cooldown)) {
        result.push({idx: qIdx, quest: LOCATION_QUEST_POOL[qIdx]});
      }
    });
    return result;
  },

  // ===== 显示地点任务面板 =====
  showLocationQuestPanel(locKey) {
    const s = Game.state;
    this.initExpand5State(s);
    const quests = this.getLocationQuests(locKey);
    const loc = WORLD_MAP[locKey];
    const locName = loc ? loc.name : locKey;

    let html = '<div class="modal-section"><div class="modal-section-title">\u{1F4CB} ' + locName + ' \u00B7 \u4EFB\u52A1\u677F</div>';

    if (quests.length === 0) {
      html += '<p style="text-align:center;color:var(--text-dim);padding:20px;">\u76EE\u524D\u6CA1\u6709\u53EF\u63A5\u53D7\u7684\u4EFB\u52A1\u3002</p>';
    } else {
      quests.forEach(q => {
        const quest = q.quest;
        html += '<div class="modal-item-row" style="cursor:pointer;" onclick="UI.closeModal();Game.gotoNode(\'_accept_loc_quest_' + locKey + '|' + q.idx + '\')">';
        html += '<div style="color:var(--gold-bright);font-weight:bold;">' + quest.title + '</div>';
        html += '<div class="modal-item-desc">' + quest.desc + '</div>';
        html += '<div class="modal-item-stats" style="color:var(--jade);">\u5956\u52B1\uFF1A' + quest.rewardStones + '\u7075\u77F3\u3001' + quest.rewardExp + '\u7ECF\u9A8C';
        if (quest.rewardItem) html += '\u3001' + (ITEMS[quest.rewardItem] ? ITEMS[quest.rewardItem].name : quest.rewardItem);
        html += '</div>';
        const typeNames = {defeat_traitor:"\u51FB\u8D25\u53DB\u5F92", submit_material:"\u63D0\u4EA4\u6750\u6599", check_location:"\u524D\u5F80\u68C0\u67E5"};
        html += '<div class="modal-item-stats" style="color:var(--text-dim);">\u7C7B\u578B\uFF1A' + (typeNames[quest.type]||quest.type) + '</div>';
        html += '</div>';
      });
    }

    // 显示进行中的任务
    const activeHere = s.activeLocQuests.filter(q => q.locKey === locKey);
    if (activeHere.length > 0) {
      html += '<div style="margin-top:12px;padding-top:8px;border-top:1px solid var(--border);"><div style="color:var(--gold-bright);font-size:0.9em;margin-bottom:8px;">\u8FDB\u884C\u4E2D\u7684\u4EFB\u52A1</div>';
      activeHere.forEach(aq => {
        const quest = LOCATION_QUEST_POOL[aq.questIdx];
        html += '<div class="modal-item-row">';
        html += '<div style="color:var(--jade);">' + quest.title + '</div>';
        if (quest.type === "submit_material" && quest.requiredItem) {
          const has = (s.items && s.items[quest.requiredItem]) || 0;
          html += '<div class="modal-item-stats">\u6750\u6599\uFF1A' + (ITEMS[quest.requiredItem]?ITEMS[quest.requiredItem].name:quest.requiredItem) + ' (' + has + '/' + quest.requiredCount + ')</div>';
          if (has >= quest.requiredCount) {
            html += '<button class="btn-combat" style="margin-top:4px;font-size:0.7em;padding:3px 8px;" onclick="UI.closeModal();Game.gotoNode(\'_submit_material_' + locKey + '|' + aq.questIdx + '\')">\u{1F4E6} \u63D0\u4EA4\u6750\u6599</button>';
          }
        } else if (quest.type === "check_location" && quest.targetLocation) {
          html += '<div class="modal-item-stats">\u524D\u5F80\uFF1A' + quest.targetLocation + '</div>';
        } else if (quest.type === "defeat_traitor") {
          html += '<div class="modal-item-stats">\u51FB\u8D25\u53DB\u5F92\u5373\u53EF\u5B8C\u6210</div>';
        }
        html += '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">\u5173\u95ED</button>');
  },

  // ===== 接受地点任务 =====
  acceptLocationQuest(locKey, questIdx) {
    const s = Game.state;
    this.initExpand5State(s);
    const quest = LOCATION_QUEST_POOL[questIdx];
    if (!quest) return;

    const questEntry = {locKey, questIdx, progress: 0};
    // 击败叛徒类: 生成一个叛徒NPC
    if (quest.type === "defeat_traitor") {
      const loc = WORLD_MAP[locKey];
      const locName = loc ? loc.name : locKey;
      const traitorLevel = Math.max(0, CULT_LEVELS[s.cultLevel].stage);
      const traitor = this.generateNPC(s.cultLevel, locKey);
      traitor.name = "\u53DB\u5F92\u00B7" + traitor.name;
      traitor.title = "\u53DB\u5F92";
      traitor.isTraitorQuest = true;
      traitor.questLocKey = locKey;
      traitor.questIdx = questIdx;
      s.npcList = s.npcList || [];
      s.npcList.push(traitor);
      questEntry.targetNPCId = traitor.id;
      UI.toast("\u53DB\u5F92\u5DF2\u51FA\u73B0\u5728\u9644\u8FD1\uFF01", "danger");
    }

    s.activeLocQuests.push(questEntry);
    UI.toast("\u63A5\u53D7\u4E86\u4EFB\u52A1\uFF1A" + quest.title, "success");
    this.showLocationQuestPanel(locKey);
  },

  // ===== 提交任务材料 =====
  submitQuestMaterials(locKey, questIdx) {
    const s = Game.state;
    this.initExpand5State(s);
    const quest = LOCATION_QUEST_POOL[questIdx];
    if (!quest || quest.type !== "submit_material") return;

    const has = (s.items && s.items[quest.requiredItem]) || 0;
    if (has < quest.requiredCount) {
      UI.toast("\u6750\u6599\u4E0D\u8DB3\uFF01\u9700\u8981" + quest.requiredCount + "\u4E2A" + (ITEMS[quest.requiredItem]?ITEMS[quest.requiredItem].name:quest.requiredItem), "danger");
      return;
    }

    // 扣除材料
    s.items[quest.requiredItem] -= quest.requiredCount;
    if (s.items[quest.requiredItem] <= 0) delete s.items[quest.requiredItem];

    // 完成任务
    this.completeLocationQuest(locKey, questIdx);
  },

  // ===== 完成地点任务 =====
  completeLocationQuest(locKey, questIdx) {
    const s = Game.state;
    this.initExpand5State(s);
    const quest = LOCATION_QUEST_POOL[questIdx];
    if (!quest) return;

    // 发放奖励
    s.stones = (s.stones || 0) + quest.rewardStones;
    s.exp = (s.exp || 0) + quest.rewardExp;
    if (quest.rewardItem) {
      s.items = s.items || {};
      s.items[quest.rewardItem] = (s.items[quest.rewardItem] || 0) + 1;
    }
    s.completedLocQuests = (s.completedLocQuests || 0) + 1;

    // 从活跃列表移除
    s.activeLocQuests = s.activeLocQuests.filter(q => !(q.locKey === locKey && q.questIdx === questIdx));

    // 设置冷却（5天后可再次接取）
    if (!s.locQuestCooldown[locKey]) s.locQuestCooldown[locKey] = {};
    s.locQuestCooldown[locKey][questIdx] = (s.day || 0) + 5;

    // 生成新任务替换
    const cultStage = CULT_LEVELS[s.cultLevel].stage;
    const available = LOCATION_QUEST_POOL.filter(q => q.minStage <= cultStage && !s.locQuests[locKey].includes(LOCATION_QUEST_POOL.indexOf(q)));
    if (available.length > 0) {
      const newQuest = available[Math.floor(Math.random() * available.length)];
      s.locQuests[locKey].push(LOCATION_QUEST_POOL.indexOf(newQuest));
    }

    const itemName = quest.rewardItem && ITEMS[quest.rewardItem] ? ITEMS[quest.rewardItem].name : "";
    UI.toast("\u4EFB\u52A1\u5B8C\u6210\uFF01\u83B7\u5F97" + quest.rewardStones + "\u7075\u77F3\u3001" + quest.rewardExp + "\u7ECF\u9A8C" + (itemName ? "\u3001" + itemName : ""), "success");

    let texts = [
      {type:"system_msg", content:"\u4EFB\u52A1\u5B8C\u6210\uFF01"},
      {type:"system_msg", content:"\u83B7\u5F97\u5956\u52B1\uFF1A" + quest.rewardStones + "\u7075\u77F3\u3001" + quest.rewardExp + "\u7ECF\u9A8C" + (itemName ? "\u3001" + itemName : "")},
    ];
    UI.renderNarrative(texts);
    UI.updateAll();
  },

  // ===== 检查地点任务完成（到达目标地点时调用） =====
  checkLocationQuestOnArrive(locKey) {
    const s = Game.state;
    this.initExpand5State(s);
    const active = s.activeLocQuests.filter(q => {
      const quest = LOCATION_QUEST_POOL[q.questIdx];
      return quest && quest.type === "check_location" && quest.targetLocation === locKey;
    });
    active.forEach(aq => {
      this.completeLocationQuest(aq.locKey, aq.questIdx);
    });
  },

  // ===== 直接进入地点副本 =====
  enterLocationDungeon(locKey) {
    const s = Game.state;
    this.initExpand5State(s);

    // 设置当前野外区域（探索连续性），NPC交谈离开后继续探索而非返回城镇
    if (typeof this.setCurrentWilderness === 'function') {
      this.setCurrentWilderness(locKey, locKey);
    }
    // 清除场所上下文，避免NPC离开后返回场所
    s.currentPlace = null;

    const dungeon = LOCATION_DUNGEON_DEFS[locKey];
    if (!dungeon) {
      // 尝试宗门副本
      const sectId = this.getSectIdByLocKey(locKey);
      if (sectId && SECT_DUNGEONS && SECT_DUNGEONS[sectId]) {
        this.enterSectDungeon(sectId);
        return;
      }
      UI.toast("\u6B64\u5730\u65E0\u526F\u672C\u3002", "info");
      return;
    }

    const cultStage = CULT_LEVELS[s.cultLevel].stage;
    if (cultStage < dungeon.reqStage) {
      UI.toast("\u4FEE\u4E3A\u4E0D\u8DB3\uFF0C\u65E0\u6CD5\u8FDB\u5165\u6B64\u526F\u672C\uFF01", "danger");
      return;
    }

    let texts = [
      {type:"chapter_title", content:dungeon.name},
      {type:"narration", content:dungeon.desc},
    ];
    UI.renderNarrative(texts);

    // 50%遇敌, 30%获宝, 20%空
    const roll = Math.random();
    if (roll < 0.5) {
      // 战斗
      const enemyLv = dungeon.enemyLv;
      const enemy = {
        name: this.generateDungeonEnemyName(locKey),
        hp: 2000 + enemyLv * 2000,
        maxHp: 2000 + enemyLv * 2000,
        atk: 100 + enemyLv * 100,
        def: 50 + enemyLv * 50,
        exp: 200 + enemyLv * 300,
        stones: 50 + enemyLv * 100,
        drops: dungeon.rewards,
      };
      s._dungeonLocKey = locKey;
      Game.startCombat(enemy, "_loc_dungeon_win_" + locKey, "_loc_dungeon_lose");
    } else if (roll < 0.8) {
      // 获宝
      const item = dungeon.rewards[Math.floor(Math.random() * dungeon.rewards.length)];
      s.items = s.items || {};
      s.items[item] = (s.items[item] || 0) + 1;
      const itemName = ITEMS[item] ? ITEMS[item].name : item;
      const stones = 50 + Math.floor(Math.random() * 100) * (enemyLv + 1);
      s.stones = (s.stones || 0) + stones;
      UI.renderNarrative([
        {type:"system_msg", content:"\u5728\u526F\u672C\u4E2D\u53D1\u73B0\u4E86\u5B9D\u7269\uFF01"},
        {type:"system_msg", content:"\u83B7\u5F97\uFF1A" + itemName + " x1\u3001" + stones + "\u7075\u77F3"},
      ]);
      UI.renderChoices([{text:"\u79BB\u5F00\u526F\u672C", next:"_place_back_" + locKey, effect:{}}]);
      UI.updateAll();
    } else {
      // 空
      UI.renderNarrative([{type:"system_msg", content:"\u4E00\u65E0\u6240\u83B7\u3002"}]);
      UI.renderChoices([{text:"\u79BB\u5F00\u526F\u672C", next:"_place_back_" + locKey, effect:{}}]);
      UI.updateAll();
    }
  },

  // ===== 生成副本敌人名称 =====
  generateDungeonEnemyName(locKey) {
    const names = {
      "\u4E03\u7384\u95E8": ["\u540E\u5C71\u5996\u72FC","\u5BC6\u6797\u866B\u7387","\u5C71\u5D16\u5DE8\u87EE"],
      "\u9EC4\u67AB\u8C37": ["\u6728\u7CBE","\u7075\u6728\u5996\u517D","\u6811\u9B3C"],
      "\u5929\u5357\u574A\u5E02\u57CE": ["\u53E4\u5893\u50F5\u5C38","\u5730\u5BAB\u5B88\u536B","\u5E7D\u9B42"],
      "\u957F\u5B89\u57CE": ["\u5730\u5BAB\u7981\u519B","\u53E4\u5893\u67AA\u7075","\u5730\u5BAB\u523A\u5BA2"],
      "\u5317\u72C4\u8349\u539F": ["\u51B0\u5C42\u5996\u517D","\u96EA\u72FC","\u5317\u72C4\u72C2\u6218\u58EB"],
      "\u5357\u86EE\u4E1B\u6797": ["\u6BD2\u86FE","\u86EE\u8352\u5996\u517D","\u5DEB\u5E08\u5076\u5076"],
    };
    const list = names[locKey] || ["\u526F\u672C\u5996\u517D","\u5B88\u62A4\u8005","\u5F02\u517D"];
    return list[Math.floor(Math.random() * list.length)];
  },

  // ===== 副本胜利 =====
  locationDungeonVictory(locKey) {
    const s = Game.state;
    const dungeon = LOCATION_DUNGEON_DEFS[locKey];
    if (!dungeon) return;
    // 额外奖励
    const item = dungeon.rewards[Math.floor(Math.random() * dungeon.rewards.length)];
    s.items = s.items || {};
    s.items[item] = (s.items[item] || 0) + 1;
    const itemName = ITEMS[item] ? ITEMS[item].name : item;
    UI.toast("\u526F\u672C\u80DC\u5229\uFF01\u83B7\u5F97" + itemName, "success");
    let texts = [
      {type:"system_msg", content:"\u526F\u672C\u80DC\u5229\uFF01"},
      {type:"system_msg", content:"\u83B7\u5F97\u989D\u5916\u5956\u52B1\uFF1A" + itemName + " x1"},
    ];
    UI.renderNarrative(texts);
    UI.renderChoices([{text:"\u7EE7\u7EED\u63A2\u7D22", next:"_loc_dungeon_enter_" + locKey, effect:{}}, {text:"\u79BB\u5F00\u526F\u672C", next:"_place_back_" + locKey, effect:{}}]);
    UI.updateAll();
  },

  // ===== 场所NPC管理 =====
  // 给NPC分配场所
  assignNPCToPlace(npc, locKey) {
    if (npc.place) return npc.place;
    const places = this.getLocationPlaces(locKey);
    if (places.length === 0) return null;
    // 民居优先分配凡人/孩童
    if (npc.isCommoner || npc.isChild) {
      if (places.includes("residential")) {
        npc.place = "residential";
        return "residential";
      }
    }
    // 其他NPC随机分配
    const nonResidential = places.filter(p => p !== "residential");
    if (nonResidential.length > 0) {
      npc.place = nonResidential[Math.floor(Math.random() * nonResidential.length)];
    } else {
      npc.place = places[0];
    }
    return npc.place;
  },

  // 获取场所中的NPC
  getPlaceNPCs(state, locKey, placeType) {
    if (!state.npcList) return [];
    return state.npcList.filter(npc => npc.isAlive && npc.area === locKey && npc.place === placeType);
  },

  // 确保场所有NPC
  ensurePlaceNPCs(state, locKey, placeType) {
    const def = PLACE_DEFS[placeType];
    if (!def) return;
    const existing = this.getPlaceNPCs(state, locKey, placeType);
    const minCount = def.npcRange[0];
    if (existing.length >= minCount) return;

    const needed = minCount - existing.length;
    for (let i = 0; i < needed; i++) {
      let npc;
      if (placeType === "residential") {
        // 民居: 凡人/孩童
        if (Math.random() < 0.5) {
          npc = this.generateCommonerNPC(locKey);
        } else {
          npc = this.generateChildNPC(locKey);
        }
      } else if (DYNASTY_PLACE_MAP[locKey]) {
        // 王朝NPC
        npc = this.generateDynastyNPC(locKey, placeType);
      } else if (BARBARIAN_PLACE_MAP[locKey]) {
        // 蛮夷NPC
        npc = this.generateBarbarianNPC(locKey, placeType);
      } else {
        // 普通修士
        npc = this.generateNPC(Game.state.cultLevel, locKey);
      }
      if (npc) {
        npc.place = placeType;
        state.npcList = state.npcList || [];
        state.npcList.push(npc);
      }
    }
  },

  // ===== 生成王朝NPC =====
  generateDynastyNPC(locKey, placeType) {
    const s = Game.state;
    const loc = WORLD_MAP[locKey];
    const locName = loc ? loc.name : locKey;
    // 根据场所决定NPC类型
    let officialType = "guard";
    if (placeType === "imperial_palace") officialType = Math.random() < 0.3 ? "emperor" : (Math.random() < 0.5 ? "prince" : "guard_captain");
    else if (placeType === "ministry_war") officialType = Math.random() < 0.3 ? "general" : "minister_war";
    else if (placeType === "ministry_person") officialType = "minister_person";
    else if (placeType === "exam_hall") officialType = "scholar";
    else if (placeType === "main_street") officialType = Math.random() < 0.5 ? "merchant" : "scholar";
    else if (placeType === "barracks") officialType = Math.random() < 0.3 ? "general" : "guard";
    else if (placeType === "grand_temple") officialType = "scholar";
    else if (placeType === "city_gate") officialType = "guard";
    else if (placeType === "residential") officialType = Math.random() < 0.5 ? "merchant" : "guard";
    else if (placeType === "inn") officialType = "merchant";
    else if (placeType === "teahouse") officialType = "scholar";

    const official = DYNASTY_OFFICIALS[officialType] || DYNASTY_OFFICIALS.guard;
    const surname = NPC_SURNAMES[Math.floor(Math.random() * NPC_SURNAMES.length)];
    const givenName = Math.random() < 0.5 ?
      NPC_GIVEN_NAMES_M[Math.floor(Math.random() * NPC_GIVEN_NAMES_M.length)] :
      NPC_GIVEN_NAMES_F[Math.floor(Math.random() * NPC_GIVEN_NAMES_F.length)];
    const isFemale = Math.random() < 0.2; // 王朝官员多为男性

    const cultLevel = Math.max(0, official.cultLevel);
    const cult = CULT_LEVELS[cultLevel] || CULT_LEVELS[0];
    const hp = 100 + cultLevel * 200;
    const personality = NPC_PERSONALITIES[Math.floor(Math.random() * NPC_PERSONALITIES.length)];

    const npc = {
      id: "dyn_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      name: surname + givenName,
      title: official.title,
      officialTitle: official.title,
      officialType: officialType,
      isFemale: isFemale,
      cultLevel: cultLevel,
      cultName: cult.name,
      personality: personality,
      action: "\u6B63\u5728\u5DEE\u65C5",
      hp: hp, maxHp: hp,
      atk: 30 + cultLevel * 50, def: 20 + cultLevel * 30,
      items: [], stones: 50 + cultLevel * 100,
      area: locKey,
      isAlive: true, isFriend: false, relationType: null,
      mood: official.mood,
      isDynastyNPC: true,
    };
    if (typeof this.setupNPCSocialNetwork === "function") this.setupNPCSocialNetwork(npc, s);
    if (typeof this.calculateInitialAffinity === "function") npc.mood = this.calculateInitialAffinity(npc, s);
    return npc;
  },

  // ===== 生成蛮夷NPC =====
  generateBarbarianNPC(locKey, placeType) {
    const s = Game.state;
    const barbarianTypes = BARBARIAN_NPC_TYPES[locKey] || BARBARIAN_NPC_TYPES["\u5317\u72C4\u8349\u539F"];

    let npcType = "warrior";
    if (placeType === "chief_tent") npcType = "chieftain";
    else if (placeType === "shaman_altar") npcType = "shaman";
    else if (placeType === "pasture") npcType = Math.random() < 0.7 ? "herdsman" : "warrior";
    else if (placeType === "warrior_pit") npcType = "warrior";
    else if (placeType === "trade_post") npcType = Math.random() < 0.5 ? "merchant" : "herdsman";
    else if (placeType === "shrine") npcType = "shaman";
    else if (placeType === "inn") npcType = "merchant";

    // 默认使用第一个type作为fallback
    const typeKey = barbarianTypes[npcType] ? npcType : Object.keys(barbarianTypes)[0];
    const bType = barbarianTypes[typeKey];
    const surname = NPC_SURNAMES[Math.floor(Math.random() * NPC_SURNAMES.length)];
    const givenName = Math.random() < 0.5 ?
      NPC_GIVEN_NAMES_M[Math.floor(Math.random() * NPC_GIVEN_NAMES_M.length)] :
      NPC_GIVEN_NAMES_F[Math.floor(Math.random() * NPC_GIVEN_NAMES_F.length)];
    const isFemale = Math.random() < 0.25;

    const cultLevel = Math.max(0, bType.cultLevel);
    const cult = CULT_LEVELS[cultLevel] || CULT_LEVELS[0];
    const hp = 100 + cultLevel * 200;
    const personality = NPC_PERSONALITIES[Math.floor(Math.random() * NPC_PERSONALITIES.length)];

    const npc = {
      id: "bar_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      name: surname + givenName,
      title: bType.title,
      barbarianTitle: bType.title,
      barbarianType: typeKey,
      isFemale: isFemale,
      cultLevel: cultLevel,
      cultName: cult.name,
      personality: personality,
      action: "\u6B63\u5728\u7AD9\u5C97",
      hp: hp, maxHp: hp,
      atk: 30 + cultLevel * 50, def: 20 + cultLevel * 30,
      items: [], stones: 30 + cultLevel * 80,
      area: locKey,
      isAlive: true, isFriend: false, relationType: null,
      mood: bType.mood,
      isBarbarianNPC: true,
    };
    if (typeof this.setupNPCSocialNetwork === "function") this.setupNPCSocialNetwork(npc, s);
    if (typeof this.calculateInitialAffinity === "function") npc.mood = this.calculateInitialAffinity(npc, s);
    return npc;
  },

  // ===== 场所动作: 阅读典籍 =====
  placeLearn(locKey) {
    const s = Game.state;
    const exp = 50 + CULT_LEVELS[s.cultLevel].stage * 50;
    s.exp = (s.exp || 0) + exp;
    this.advanceDays(1);
    UI.toast("\u9605\u8BFB\u5178\u7C4D\uFF0C\u83B7\u5F97" + exp + "\u7ECF\u9A8C\u3002", "success");
    UI.renderNarrative([{type:"system_msg", content:"\u4F60\u5728\u85CF\u7ECF\u9601\u4E2D\u9605\u8BFB\u5178\u7C4D\uFF0C\u83B7\u5F97" + exp + "\u7ECF\u9A8C\u3002"}]);
    UI.renderChoices([{text:"\u7EE7\u7EED\u9605\u8BFB", next:"_place_learn_" + locKey + "|scripture_lib", effect:{}}, {text:"\u8FD4\u56DE", next:"_enter_place_" + locKey + "|scripture_lib", effect:{}}]);
    UI.updateAll();
  },

  // ===== 场所动作: 练功修炼 =====
  placeTrain(locKey) {
    const s = Game.state;
    const exp = 80 + CULT_LEVELS[s.cultLevel].stage * 60;
    s.exp = (s.exp || 0) + exp;
    this.advanceDays(1);
    UI.toast("\u4FEE\u70BC\u83B7\u5F97" + exp + "\u7ECF\u9A8C\u3002", "success");
    UI.renderNarrative([{type:"system_msg", content:"\u4F60\u5728\u6F14\u6B66\u573A\u4FEE\u70BC\uFF0C\u83B7\u5F97" + exp + "\u7ECF\u9A8C\u3002"}]);
    UI.renderChoices([{text:"\u7EE7\u7EED\u4FEE\u70BC", next:"_place_train_" + locKey + "|training_ground", effect:{}}, {text:"\u8FD4\u56DE", next:"_enter_place_" + locKey + "|training_ground", effect:{}}]);
    UI.updateAll();
  },

  // ===== 场所动作: 采集灵草 =====
  placeGather(locKey) {
    const s = Game.state;
    const herbs = ["spirit_grass","spirit_grass","healing_herb","qi_herb"];
    const herb = herbs[Math.floor(Math.random() * herbs.length)];
    s.items = s.items || {};
    s.items[herb] = (s.items[herb] || 0) + 1;
    this.advanceDays(1);
    const herbName = ITEMS[herb] ? ITEMS[herb].name : herb;
    UI.toast("\u91C7\u96C6\u5230" + herbName + "\u00D71", "success");
    UI.renderNarrative([{type:"system_msg", content:"\u4F60\u5728\u836F\u562D\u4E2D\u91C7\u96C6\u5230" + herbName + "\u00D71\u3002"}]);
    UI.renderChoices([{text:"\u7EE7\u7EED\u91C7\u96C6", next:"_place_gather_" + locKey, effect:{}}, {text:"\u8FD4\u56DE", next:"_enter_place_" + locKey + "|herb_garden", effect:{}}]);
    UI.updateAll();
  },

  // ===== 场所动作: 听传闻 =====
  placeRumor(locKey) {
    const rumors = [
      "\u542C\u8BF4\u6700\u8FD1\u5929\u5357\u8352\u91CE\u51FA\u73B0\u4E86\u4E00\u5934\u53E4\u5996\u517D\uFF0C\u4E0D\u77E5\u9053\u6709\u6CA1\u6709\u4EBA\u80FD\u5236\u670D\u3002",
      "\u67D0\u4F4D\u6563\u4FEE\u5728\u574A\u5E02\u62FF\u5230\u4E86\u4E00\u4EF6\u4E0A\u53E4\u6CD5\u5668\uFF0C\u5F15\u8D77\u4E86\u4E0D\u5C0F\u7684\u8F70\u52A8\u3002",
      "\u6700\u8FD1\u4E71\u661F\u6D77\u90A3\u8FB9\u4F3C\u4E4E\u6709\u6D77\u517D\u4F5C\u4E71\uFF0C\u5546\u8239\u90FD\u4E0D\u6562\u51FA\u6D77\u4E86\u3002",
      "\u6709\u4EBA\u8BF4\u5728\u5760\u9B54\u8C37\u6DF1\u5904\u53D1\u73B0\u4E86\u4E00\u5EA7\u53E4\u4FEE\u58EB\u7684\u6D1E\u5E9C\uFF0C\u4F46\u4E5F\u6709\u4EBA\u8BF4\u90A3\u662F\u9B54\u5C3D\u3002",
      "\u542C\u8BF4\u957F\u5B89\u57CE\u7687\u5BAB\u91CC\u6700\u8FD1\u6765\u4E86\u4E00\u4F4D\u5947\u4EBA\uFF0C\u80FD\u548C\u5999\u9020\u5316\u77F3\u3002",
      "\u5317\u72C4\u90A3\u8FB9\u6700\u8FD1\u4F3C\u4E4E\u5728\u8C03\u5175\uFF0C\u4E0D\u77E5\u9053\u662F\u8981\u6253\u4EC0\u4E48\u3002",
      "\u67D0\u4F4D\u5BA2\u6808\u8001\u677F\u8BF4\u4ED6\u5E74\u8F7B\u65F6\u66FE\u89C1\u8FC7\u4E00\u4F4D\u5143\u5A74\u671F\u7684\u9AD8\u4EBA\uFF0C\u4E00\u6307\u5C31\u5C06\u5C71\u5D16\u524A\u5E73\u4E86\u3002",
      "\u7075\u754C\u6700\u8FD1\u4F3C\u6709\u65B0\u7684\u7075\u8109\u88AB\u53D1\u73B0\uFF0C\u4E0D\u5C11\u4EBA\u8D76\u53BB\u62A2\u5360\u3002",
    ];
    const rumor = rumors[Math.floor(Math.random() * rumors.length)];
    UI.renderNarrative([{type:"narration", content:"\u4F60\u5728\u8336\u9986\u542C\u5230\u4E86\u4E00\u4E9B\u4F20\u95FB\uFF1A"}]);
    setTimeout(() => {
      UI.renderNarrative([{type:"dialogue", content:"\u300C" + rumor + "\u300D"}]);
      UI.renderChoices([{text:"\u7EE7\u7EED\u542C\u95FB", next:"_place_rumor_" + locKey, effect:{}}, {text:"\u8FD4\u56DE", next:"_enter_place_" + locKey + "|teahouse", effect:{}}]);
      UI.updateAll();
    }, 500);
  },

  // ===== 场所动作: 祈祷 =====
  placePray(locKey) {
    const s = Game.state;
    // 随机获得祝福
    const blessings = [
      {type:"exp", value:100, msg:"\u5FC3\u5982\u6B62\u6C34\uFF0C\u83B7\u5F97\u4FEE\u4E3A\u7ECF\u9A8C100\u3002"},
      {type:"stones", value:50, msg:"\u795E\u660E\u8D50\u4E8850\u7075\u77F3\u3002"},
      {type:"hp", value:9999, msg:"\u795E\u660E\u6CBB\u6108\u4E86\u4F60\u7684\u4F24\u52BF\u3002"},
      {type:"nothing", value:0, msg:"\u4E00\u65E0\u6240\u83B7\u3002"},
    ];
    const bless = blessings[Math.floor(Math.random() * blessings.length)];
    if (bless.type === "exp") s.exp = (s.exp || 0) + bless.value;
    else if (bless.type === "stones") s.stones = (s.stones || 0) + bless.value;
    else if (bless.type === "hp") s.hp = s.maxHp;
    this.advanceDays(1);
    UI.toast(bless.msg, bless.type === "nothing" ? "info" : "success");
    UI.renderNarrative([{type:"system_msg", content:bless.msg}]);
    UI.renderChoices([{text:"\u8FD4\u56DE", next:"_enter_place_" + locKey + "|temple", effect:{}}]);
    UI.updateAll();
  },

  // ===== 王朝科举考试 =====
  dynastyExam() {
    const s = Game.state;
    this.initExpand5State(s);
    const cultStage = CULT_LEVELS[s.cultLevel].stage;

    let texts = [
      {type:"chapter_title", content:"\u79D1\u4E3E\u8003\u8BD5"},
      {type:"narration", content:"\u4F60\u6765\u5230\u4E86\u79D1\u4E3E\u8003\u573A\uFF0C\u5B66\u5B50\u4EEC\u6B63\u5728\u6293\u7B14\u7814\u58A8\u3002"},
    ];
    UI.renderNarrative(texts);

    const choices = [];
    if (!s.dynastyRank) {
      choices.push({text:"\u53C2\u52A0\u8003\u8BD5\uFF08\u9700\u8981\u4E66\u751F\u8EAB\u4EFD\uFF09", next:"_dynasty_exam_take_", effect:{}});
    } else {
      texts = [{type:"system_msg", content:"\u4F60\u5DF2\u6709\u5B98\u8EAB\uFF1A" + s.dynastyRank + "\uFF0C\u65E0\u9700\u518D\u8003\u3002"}];
      UI.renderNarrative(texts);
    }
    choices.push({text:"\u79BB\u5F00", next:"_enter_place_\u957F\u5B89\u57CE|exam_hall", effect:{}});
    UI.renderChoices(choices);
    UI.updateAll();
  },

  // ===== 参加科举 =====
  dynastyExamTake() {
    const s = Game.state;
    const cultStage = CULT_LEVELS[s.cultLevel].stage;
    // 根据修为决定考试结果
    const success = Math.random() < (0.3 + cultStage * 0.05);
    this.advanceDays(3);

    if (success) {
      const ranks = ["\u79C0\u624D","\u4E3E\u4EBA","\u8FDB\u58EB","\u63A2\u82B1"];
      const rank = ranks[Math.min(cultStage, ranks.length - 1)];
      s.dynastyRank = rank;
      s.stones = (s.stones || 0) + 200;
      s.exp = (s.exp || 0) + 500;
      UI.toast("\u79D1\u4E3E\u9AD8\u4E2D\uFF01\u83B7\u5F97\u5B98\u8EAB\uFF1A" + rank, "success");
      UI.renderNarrative([
        {type:"system_msg", content:"\u79D1\u4E3E\u9AD8\u4E2D\uFF01"},
        {type:"system_msg", content:"\u4F60\u83B7\u5F97\u4E86\u5B98\u8EAB\uFF1A" + rank + "\uFF0C200\u7075\u77F3\u3001500\u7ECF\u9A8C\u3002"},
      ]);
    } else {
      UI.toast("\u79D1\u4E3E\u672A\u4E2D\uFF0C\u6765\u5E74\u518D\u8BD5\u3002", "info");
      UI.renderNarrative([{type:"system_msg", content:"\u79D1\u4E3E\u672A\u4E2D\uFF0C\u6765\u5E74\u518D\u8BD5\u3002"}]);
    }
    UI.renderChoices([{text:"\u79BB\u5F00", next:"_enter_place_\u957F\u5B89\u57CE|exam_hall", effect:{}}]);
    UI.updateAll();
  },

  // ===== 王朝从军 =====
  dynastyEnlist() {
    const s = Game.state;
    this.initExpand5State(s);
    const cultStage = CULT_LEVELS[s.cultLevel].stage;
    if (s.dynastyRank) {
      UI.toast("\u4F60\u5DF2\u6709\u5B98\u8EAB\uFF0C\u65E0\u9700\u518D\u4ECE\u519B\u3002", "info");
      UI.renderNarrative([{type:"system_msg", content:"\u4F60\u5DF2\u6709\u5B98\u8EAB\uFF1A" + s.dynastyRank + "\u3002"}]);
      UI.renderChoices([{text:"\u8FD4\u56DE", next:"_enter_place_\u957F\u5B89\u57CE|barracks", effect:{}}]);
      UI.updateAll();
      return;
    }
    const ranks = ["\u5C0F\u5352","\u4EC0\u957F","\u767E\u6237","\u5343\u6237"];
    const rank = ranks[Math.min(cultStage, ranks.length - 1)];
    s.dynastyRank = rank;
    s.stones = (s.stones || 0) + 100;
    s.exp = (s.exp || 0) + 300;
    UI.toast("\u4ECE\u519B\u6210\u529F\uFF01\u83B7\u5F97\u519B\u88C5\uFF1A" + rank, "success");
    UI.renderNarrative([
      {type:"system_msg", content:"\u4F60\u62A5\u540D\u4ECE\u519B\uFF0C\u83B7\u5F97\u4E86\u519B\u88C5\uFF1A" + rank + "\u3002"},
      {type:"system_msg", content:"\u83B7\u5F97100\u7075\u77F3\u3001300\u7ECF\u9A8C\u3002"},
    ]);
    UI.renderChoices([{text:"\u8FD4\u56DE", next:"_enter_place_\u957F\u5B89\u57CE|barracks", effect:{}}]);
    UI.updateAll();
  },

  // ===== 请求见驾 =====
  dynastyAudience() {
    const s = Game.state;
    this.initExpand5State(s);
    const cultStage = CULT_LEVELS[s.cultLevel].stage;
    if (cultStage < 2) {
      UI.toast("\u4FEE\u4E3A\u4E0D\u8DB3\uFF0C\u65E0\u8D44\u683C\u89C1\u9A7E\u3002", "danger");
      UI.renderNarrative([{type:"system_msg", content:"\u4FEE\u4E3A\u4E0D\u8DB3\uFF0C\u65E0\u8D44\u683C\u89C1\u9A7E\u3002\u9700\u7B51\u57FA\u671F\u4EE5\u4E0A\u3002"}]);
      UI.renderChoices([{text:"\u8FD4\u56DE", next:"_enter_place_\u957F\u5B89\u57CE|imperial_palace", effect:{}}]);
      UI.updateAll();
      return;
    }
    const reward = 500 + cultStage * 200;
    s.stones = (s.stones || 0) + reward;
    s.exp = (s.exp || 0) + 200;
    UI.toast("\u7687\u5E1D\u8D50\u4E88" + reward + "\u7075\u77F3\uFF01", "success");
    UI.renderNarrative([
      {type:"narration", content:"\u4F60\u5728\u7687\u5BAB\u4E2D\u89C1\u5230\u4E86\u7687\u5E1D\u3002"},
      {type:"dialogue", content:"\u300C\u4FEE\u58EB\u4E4B\u624D\uFF0C\u6C42\u4E4B\u4E0D\u5F97\u3002\u4ECA\u65E5\u8D50\u4F60\u5B9D\u7269\uFF0C\u671B\u4F60\u4E3A\u5929\u4E0B\u79CD\u798F\u3002\u300D"},
      {type:"system_msg", content:"\u83B7\u5F97" + reward + "\u7075\u77F3\u3001200\u7ECF\u9A8C\u3002"},
    ]);
    this.advanceDays(1);
    UI.renderChoices([{text:"\u8FD4\u56DE", next:"_enter_place_\u957F\u5B89\u57CE|imperial_palace", effect:{}}]);
    UI.updateAll();
  },

  // ===== NPC定位器（搜索NPC） =====
  showNPCLocator() {
    const s = Game.state;
    this.initExpand5State(s);
    let html = '<div class="modal-section"><div class="modal-section-title">\u{1F50D} \u5BFB\u627ENPC</div>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:0.85em;margin-bottom:12px;">\u8F93\u5165NPC\u59D3\u540D\u6216\u9009\u62E9\u5730\u70B9\u67E5\u770B</p>';

    // 显示所有有NPC的区域
    const areaNPCs = {};
    if (s.npcList) {
      s.npcList.forEach(npc => {
        if (!npc.isAlive) return;
        if (!areaNPCs[npc.area]) areaNPCs[npc.area] = [];
        areaNPCs[npc.area].push(npc);
      });
    }

    Object.keys(areaNPCs).sort().forEach(areaKey => {
      const npcs = areaNPCs[areaKey];
      const loc = WORLD_MAP[areaKey];
      const areaName = loc ? loc.name : areaKey;
      html += '<div class="modal-item-row" style="cursor:pointer;" onclick="UI.closeModal();Game.gotoNode(\'_npc_list_' + areaKey + '\')">';
      html += '<div style="color:var(--gold-bright);font-weight:bold;">' + areaName + ' (' + npcs.length + '\u4EBA)</div>';
      // 显示前3个NPC
      const sample = npcs.slice(0, 3).map(n => n.name).join("\u3001");
      html += '<div class="modal-item-desc">' + sample + (npcs.length > 3 ? ' ...' : '') + '</div>';
      html += '</div>';
    });

    html += '</div>';
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">\u5173\u95ED</button>');
  },

  // ===== 从场所返回 =====
  placeBack(locKey) {
    const s = Game.state;
    // 清除当前场所上下文
    if (s.currentPlace) s.currentPlace = null;
    const loc = WORLD_MAP[locKey];
    if (!loc) { Game.gotoNode("_open_map"); return; }
    // 检查是否有TOWNS入口
    const townKey = Object.keys(TOWNS).find(t => TOWNS[t].region === locKey || t === locKey);
    if (townKey) {
      this.enterTown(townKey);
    } else {
      // 非城镇，显示场所面板
      this.showPlacesPanel(locKey);
    }
  },
});

// ===== 合并到PLACE_DEFS的defaultName =====
Object.keys(PLACE_DEFS).forEach(k => {
  if (!PLACE_DEFS[k].defaultName) PLACE_DEFS[k].defaultName = PLACE_DEFS[k].icon;
});
// 用icon字段作为fallback, 实际名称由getPlaceDisplayName生成
// 补充defaultName字段
const _placeNameMap = {
  sect_hall:"\u5B97\u95E8\u4E3B\u6BBF", scripture_lib:"\u85CF\u7ECF\u9601", training_ground:"\u6F14\u6B66\u573A",
  alchemy_room:"\u70BC\u4E39\u623F", herb_garden:"\u836F\u562D", treasure_pav:"\u85CF\u5B9D\u9601",
  disciple_quart:"\u5F1F\u5B50\u5C45", back_mountain:"\u540E\u5C71", ancestor_hall:"\u7956\u5E08\u5802",
  mission_hall:"\u4EFB\u52A1\u5802",
  residential:"\u6C11\u5C45\u533A", gov_office:"\u8854\u95E8", academy:"\u4E66\u9662", market:"\u5E02\u96C6",
  inn:"\u5BA2\u6808", teahouse:"\u8336\u9986", temple:"\u57CE\u9685\u5EFA", city_gate:"\u57CE\u95E8", dock:"\u7801\u5934", arena:"\u6597\u6CD5\u573A",
  imperial_palace:"\u7687\u5BAB", ministry_war:"\u5175\u90E8", ministry_person:"\u540F\u90E8",
  exam_hall:"\u79D1\u4E3E\u8003\u573A", main_street:"\u6731\u96C0\u5927\u8857", barracks:"\u5175\u8425", grand_temple:"\u5927\u660E\u5BAB",
  chief_tent:"\u914B\u957F\u5927\u5E10", shaman_altar:"\u8428\u6EE1\u796D\u575B", pasture:"\u7267\u573A",
  warrior_pit:"\u8BAD\u7EC3\u573A", trade_post:"\u4E92\u5E02", shrine:"\u795E\u793E",
};
Object.keys(_placeNameMap).forEach(k => {
  if (PLACE_DEFS[k]) PLACE_DEFS[k].defaultName = _placeNameMap[k];
});
