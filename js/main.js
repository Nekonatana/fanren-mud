/* ====== 凡人修仙传MUD · UI模块与主逻辑 ====== */

const UI = {
  // ===== 显示游戏主界面 =====
  showGameScreen() {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    this.updateAll();
  },
  
  // ===== 渲染叙事文本 =====
  renderNarrative(textArr) {
    const container = document.getElementById('narrative-text');
    if (!container) return;
    container.innerHTML = '';
    
    textArr.forEach(line => {
      const p = document.createElement('p');
      p.className = line.type || 'narration';
      
      switch(line.type) {
        case 'chapter_title':
          p.innerHTML = line.content;
          break;
        case 'system_msg':
          p.innerHTML = '⟐ ' + line.content + ' ⟐';
          break;
        case 'dialogue':
          p.innerHTML = line.content;
          break;
        case 'thought':
          p.innerHTML = '💭 ' + line.content;
          break;
        case 'danger':
          p.innerHTML = '⚠ ' + line.content;
          break;
        case 'reward':
          p.innerHTML = '🎉 ' + line.content;
          break;
        case 'narration':
        default:
          p.innerHTML = line.content;
      }
      container.appendChild(p);
    });
    
    container.scrollTop = container.scrollHeight;
  },
  
  // ===== 渲染选项 =====
  renderChoices(choices) {
    const container = document.getElementById('choice-area');
    if (!container) return;
    container.innerHTML = '';
    
    // 如果有 compact 标记，将交互类选项放入网格，其余保持普通按钮
    const hasCompact = choices.some(c => c.compact);
    
    if (hasCompact) {
      const compactChoices = choices.filter(c => c.compact);
      const normalChoices = choices.filter(c => !c.compact);
      
      // 先渲染普通选项
      normalChoices.forEach(choice => {
        this._renderChoiceBtn(container, choice);
      });
      
      // 再渲染紧凑网格选项
      if (compactChoices.length > 0) {
        const grid = document.createElement('div');
        grid.className = compactChoices.length > 4 ? 'choice-grid' : 'choice-grid';
        compactChoices.forEach(choice => {
          this._renderChoiceBtn(grid, choice);
        });
        container.appendChild(grid);
      }
    } else {
      choices.forEach(choice => {
        this._renderChoiceBtn(container, choice);
      });
    }
    
    if (choices.length === 0) {
      container.innerHTML = '';
    }
  },
  
  _renderChoiceBtn(container, choice) {
    if (choice.condition) {
      if (!this.checkCondition(choice.condition)) return;
    }
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    let html = choice.text;
    if (choice.effect) {
      const hints = [];
      if (choice.effect.stone && choice.effect.stone < 0) hints.push('消耗' + Math.abs(choice.effect.stone) + '灵石');
      if (choice.effect.atk) hints.push((choice.effect.atk > 0 ? '+' : '') + choice.effect.atk + '攻击');
      if (choice.effect.def) hints.push((choice.effect.def > 0 ? '+' : '') + choice.effect.def + '防御');
      if (choice.effect.comp) hints.push('+' + choice.effect.comp + '悟性');
      if (choice.effect.luck) hints.push('+' + choice.effect.luck + '机缘');
      if (choice.effect.item) hints.push('获得:' + (ITEMS[choice.effect.item] ? ITEMS[choice.effect.item].name : choice.effect.item));
      if (choice.effect.technique) hints.push('学习:' + (TECHNIQUES[choice.effect.technique] ? TECHNIQUES[choice.effect.technique].name : '功法'));
      if (choice.effect.companion) hints.push('道侣:' + (COMPANIONS[choice.effect.companion] ? COMPANIONS[choice.effect.companion].name : ''));
      if (choice.effect.exp) hints.push('+' + choice.effect.exp + '经验');
      if (hints.length > 0) {
        html += '<span class="choice-hint">[' + hints.join(' · ') + ']</span>';
      }
    }
    btn.innerHTML = html;
    btn.onclick = () => {
      if (choice.effect && choice.effect.stone && choice.effect.stone < 0) {
        if (Game.state.spiritStones < Math.abs(choice.effect.stone)) {
          this.toast("灵石不足！", "danger");
          return;
        }
      }
      // 先应用 choice.effect（发放物品/功法/flag/属性/exp 等），再跳转
      if (choice.effect && typeof Game.applyEffects === 'function') {
        Game.applyEffects(choice.effect);
      }
      Game.gotoNode(choice.next);
    };
    container.appendChild(btn);
  },
  
  // ===== 检查条件 =====
  checkCondition(cond) {
    const s = Game.state;
    if (!s) return false;
    if (cond.comp && cond.comp.includes(">=")) {
      const m = cond.comp.match(/\d+/);
      const val = m ? parseInt(m[0]) : 0;
      return s.comp >= val;
    }
    if (cond.atk && cond.atk.includes(">=")) {
      const m = cond.atk.match(/\d+/);
      const val = m ? parseInt(m[0]) : 0;
      return s.atk >= val;
    }
    // 检查 flag（flags 为对象，使用属性检查）
    if (cond.flag) {
      return s.flags && s.flags[cond.flag];
    }
    // 反向 flag：存在则隐藏该选项
    if (cond.notFlag) {
      return !(s.flags && s.flags[cond.notFlag]);
    }
    // 检查物品
    if (cond.item) {
      const invItem = s.inventory ? s.inventory.find(i => i.id === cond.item) : null;
      if (!invItem) return false;
      if (cond.itemCount && invItem.count < cond.itemCount) return false;
      return true;
    }
    // 检查支线任务是否活跃
    if (cond.questActive) {
      return s.storyQuests && s.storyQuests.some(q => q.id === cond.questActive);
    }
    // 反向任务检查：任务已接取则隐藏该选项
    if (cond.notQuestActive) {
      return !(s.storyQuests && s.storyQuests.some(q => q.id === cond.notQuestActive));
    }
    return true;
  },
  
  // ===== 战斗UI =====
  showCombat(combatState) {
    document.getElementById('choice-area').style.display = 'none';
    document.getElementById('combat-area').style.display = 'block';
    this.updateCombat(combatState);
  },
  
  hideCombat() {
    document.getElementById('choice-area').style.display = 'block';
    document.getElementById('combat-area').style.display = 'none';
  },
  
  updateCombat(combatState) {
    const s = Game.state;
    const info = document.getElementById('combat-info');

    const playerHpPct = Math.max(0, (s.hp / s.maxHp) * 100);
    const enemyHpPct = Math.max(0, (combatState.enemyHp / combatState.enemyMaxHp) * 100);

    // 构建队友卡片HTML
    let partyHtml = '';
    if (s.party && s.party.length > 0) {
      s.party.forEach(memberId => {
        let memName = '', memAtk = 0, memDef = 0;
        if (memberId.startsWith('comp_')) {
          const compId = memberId.replace('comp_', '');
          const comp = typeof COMPANIONS !== 'undefined' ? COMPANIONS[compId] : null;
          if (!comp) return;
          const cData = (s.companionData && s.companionData[compId]) || {level:1, affinity:0};
          const lvlMult = 1 + (cData.level - 1) * (typeof COMPANION_LEVEL_DATA !== 'undefined' ? COMPANION_LEVEL_DATA.atkGrowth : 0.15);
          memName = comp.name;
          memAtk = Math.floor(comp.atkBonus * lvlMult);
          memDef = Math.floor(comp.defBonus * (1 + (cData.level - 1) * (typeof COMPANION_LEVEL_DATA !== 'undefined' ? COMPANION_LEVEL_DATA.defGrowth : 0.12)));
        } else {
          const npc = s.npcList ? s.npcList.find(n => n.id === memberId) : null;
          if (!npc) return;
          memName = npc.name;
          memAtk = npc.atk || 10;
          memDef = npc.def || 5;
        }
        partyHtml += `
          <div class="combatant-card" style="border-color:var(--jade);flex:1;min-width:120px;">
            <div class="combatant-name" style="font-size:0.9em;">🚶 ${memName}</div>
            <div style="font-size:0.7em;color:var(--jade);">队友助战中</div>
            <div style="font-size:0.75em;margin-top:4px;">攻:${memAtk} 防:${memDef}</div>
          </div>`;
      });
    } else if (s.travelCompanion && typeof WorldSystem !== 'undefined' && typeof WorldSystem.getTravelCompanionCombat === 'function') {
      const tc = WorldSystem.getTravelCompanionCombat(s);
      if (tc) {
        partyHtml += `
          <div class="combatant-card" style="border-color:var(--jade);flex:1;min-width:120px;">
            <div class="combatant-name" style="font-size:0.9em;">🚶 ${tc.name}</div>
            <div style="font-size:0.7em;color:var(--jade);">队友助战中</div>
            <div style="font-size:0.75em;margin-top:4px;">攻:${tc.atk} 防:${tc.def || 0}</div>
          </div>`;
      }
    }

    info.innerHTML = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <div class="combatant-card" style="flex:1;min-width:140px;">
          <div class="combatant-name">${s.name} <span style="font-size:0.8em;color:var(--jade);">[${CULT_LEVELS[s.cultLevel].name}]</span></div>
          <div style="font-size:0.75em;color:var(--text-dim);">HP: ${Math.max(0,s.hp)}/${s.maxHp} | MP: ${Math.max(0,s.mp)}/${s.maxMp}</div>
          <div class="combatant-hp-bar"><div class="combatant-hp-fill" style="width:${playerHpPct}%;background:linear-gradient(90deg,var(--jade),var(--jade-bright))"></div></div>
          <div style="font-size:0.75em;margin-top:4px;">攻:${s.atk} 防:${s.def}</div>
        </div>
        ${partyHtml}
        <div class="combatant-card" style="flex:1;min-width:140px;border-color:var(--crimson);">
          <div class="combatant-name">${combatState.enemy.name}</div>
          <div style="font-size:0.75em;color:var(--text-dim);">HP: ${combatState.enemyHp}/${combatState.enemyMaxHp}</div>
          <div class="combatant-hp-bar"><div class="combatant-hp-fill" style="width:${enemyHpPct}%"></div></div>
          <div style="font-size:0.75em;margin-top:4px;">攻:${combatState.enemy.atk} 防:${combatState.enemy.def}</div>
        </div>
      </div>
    `;
    
    // 战斗操作按钮
    const actions = document.getElementById('combat-actions');
    let html = `<button class="btn-combat" onclick="Game.combatAction('attack')">⚔️ 普通攻击</button>`;
    
    // 杀招
    s.techniques.forEach(t => {
      const tech = TECHNIQUES[t];
      if (tech.type === "attack") {
        const canUse = s.mp >= tech.mpCost;
        html += `<button class="btn-combat" ${canUse ? '' : 'disabled'} onclick="Game.combatAction('technique','${t}')" title="${tech.desc}">🔥 ${tech.name} (${tech.mpCost}灵力)</button>`;
      }
    });
    
    // 防御
    html += `<button class="btn-combat" onclick="Game.combatAction('defend')">🛡️ 防御</button>`;
    
    // 使用物品
    const consumables = s.inventory.filter(i => ITEMS[i.id] && ITEMS[i.id].type === "consumable");
    if (consumables.length > 0) {
      html += `<button class="btn-combat" onclick="UI.showCombatItems()">💊 使用物品</button>`;
    }
    
    // 逃跑
    html += `<button class="btn-combat" onclick="Game.combatAction('flee')">🏃 逃跑</button>`;
    
    actions.innerHTML = html;
    
    // 日志
    this.updateCombatLog(combatState.log);
  },
  
  updateCombatLog(log) {
    const logEl = document.getElementById('combat-log');
    logEl.innerHTML = log.map(l => `<div class="log-${l.type}">${l.msg}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  },
  
  showCombatItems() {
    const s = Game.state;
    const consumables = s.inventory.filter(i => ITEMS[i.id] && ITEMS[i.id].type === "consumable");
    let html = '<div class="modal-section"><div class="modal-section-title">使用物品</div>';
    consumables.forEach(inv => {
      const item = ITEMS[inv.id];
      html += `<div class="modal-item-row" onclick="Game.useItem('${inv.id}');UI.closeModal();"><div>`;
      html += `<div>${item.name} ×${inv.count}</div>`;
      html += `<div class="modal-item-desc">${item.desc}</div>`;
      html += `</div></div>`;
    });
    html += '</div>';
    this.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">取消</button>');
  },
  
  // ===== 更新所有UI =====
  updateAll() {
    this.updateStats();
    this.updateInventory();
    this.updateEquipment();
    this.updateTopBar();
    this.updateEventLog();
    this.updateQuestTracker();
  },
  
  updateTopBar() {
    const s = Game.state;
    if (!s) return;
    // 显示称号
    let nameDisplay = s.name;
    if (s.activeTitle && typeof TITLES !== 'undefined' && TITLES[s.activeTitle]) {
      nameDisplay = TITLES[s.activeTitle].icon + ' ' + s.name;
    }
    document.getElementById('player-name-display').textContent = nameDisplay;
    document.getElementById('player-cultivation-display').textContent = CULT_LEVELS[s.cultLevel].name;
    document.getElementById('current-location').textContent = s.location;
    document.getElementById('spirit-stone-display').innerHTML = '💎 ' + s.spiritStones;

    // 称号检查
    if (typeof WorldSystem !== 'undefined' && typeof WorldSystem.checkTitles === 'function') {
      WorldSystem.checkTitles();
    }

    // 成就检查
    if (s.spiritStones >= 10000) Game.giveAchievement("rich");
    if (s.companions.length >= Object.keys(COMPANIONS).length) Game.giveAchievement("all_companions");
    if (s.companions.length === 0 && s.cultLevel >= 10) Game.giveAchievement("lonely_path");
  },
  
  updateStats() {
    const s = Game.state;
    if (!s) return;
    const cult = CULT_LEVELS[s.cultLevel];
    document.getElementById('stat-hp').textContent = Math.max(0,s.hp) + '/' + s.maxHp;
    document.getElementById('stat-mp').textContent = Math.max(0,s.mp) + '/' + s.maxMp;
    document.getElementById('stat-atk').textContent = s.atk;
    document.getElementById('stat-def').textContent = s.def;
    document.getElementById('stat-spd').textContent = s.spd;
    document.getElementById('stat-comp').textContent = s.comp;
    document.getElementById('stat-luck').textContent = s.luck;
    // 灵根显示（兼容扩展8对象格式和原始字符串格式）
    var rootEl = document.getElementById('stat-root');
    if (rootEl) {
      if (typeof s.spiritRoot === 'object' && s.spiritRoot !== null) {
        if (typeof WorldSystem !== 'undefined' && typeof WorldSystem.getPlayerSpiritRootDisplay === 'function') {
          rootEl.textContent = WorldSystem.getPlayerSpiritRootDisplay();
        } else {
          var tierName = ['杂灵根','四灵根','三灵根','双灵根','单灵根','天灵根'][s.spiritRoot.tier] || '杂灵根';
          rootEl.textContent = tierName + '(' + (s.spiritRoot.elements||[]).join('') + ')';
        }
      } else {
        rootEl.textContent = s.spiritRoot || '杂灵根';
      }
    }
    
    // 经验条
    const expPct = (s.exp / cult.maxExp) * 100;
    document.getElementById('exp-bar').style.width = expPct + '%';
    document.getElementById('exp-text').textContent = s.exp + '/' + cult.maxExp;
    
    // 寿命和时间
    if (typeof WorldSystem !== 'undefined' && WorldSystem.initExpandState) {
      WorldSystem.initExpandState(s);
      const lifespanEl = document.getElementById('stat-lifespan');
      if (lifespanEl) lifespanEl.textContent = Math.floor(s.age || 16) + '/' + (s.lifespan || 120) + '年';
      const timeEl = document.getElementById('stat-gametime');
      if (timeEl) timeEl.textContent = '第' + (s.gameDay || 1) + '天';
    }
  },
  
  updateInventory() {
    const s = Game.state;
    if (!s) return;
    const container = document.getElementById('inventory-list');
    if (s.inventory.length === 0) {
      container.innerHTML = '<div style="color:var(--text-dim);font-size:0.75em;text-align:center;padding:8px;">空空如也</div>';
      return;
    }
    container.innerHTML = s.inventory.map(inv => {
      const item = ITEMS[inv.id];
      if (!item) return '';
      const gradeColors = ["","#aaa","#7dd4a0","#5b9bd5","#9b6dd4","#f0c75e"];
      return `<div class="inv-item" onclick="UI.showPanel('equipment')" title="${item.name}">` +
        `<span class="item-grade-${item.grade}">${item.name}${inv.count > 1 ? '×'+inv.count : ''}</span>` +
        `</div>`;
    }).join('');
  },
  
  updateEquipment() {
    const s = Game.state;
    if (!s) return;
    const slots = {weapon:"slot-weapon",armor:"slot-armor",accessory:"slot-accessory",artifact:"slot-artifact"};
    Object.keys(slots).forEach(slot => {
      const wrap = document.getElementById(slots[slot]);
      if (!wrap) return;
      const el = wrap.querySelector('.slot-item');
      if (!el) return;
      const itemId = s.equipment[slot];
      var eqDef = itemId ? ITEMS[itemId] : null;
      el.textContent = eqDef ? eqDef.name : '—';
      el.style.color = itemId ? 'var(--gold-bright)' : 'var(--text-dim)';
    });
  },
  
  updateEventLog() {
    const s = Game.state;
    if (!s) return;
    const log = document.getElementById('event-log');
    const stats = [
      '修为：' + CULT_LEVELS[s.cultLevel].name,
      '战斗胜利：' + s.battlesWon + '场',
      '仙蛊：' + s.guWorms.length + '只',
      '窍穴：' + s.apertures.length + '处',
      '道侣：' + (s.companions.length + (s.spouses || []).length) + '位',
      '功法：' + s.techniques.length + '种',
      '成就：' + s.achievements.length + '项',
      '灵宠：' + (s.spiritPets || []).length + '只',
      '后代：' + (s.offspring || []).length + '人',
      '寿命：' + Math.floor(s.age || 16) + '/' + (s.lifespan || 120) + '年',
    ];
    log.innerHTML = stats.map(s => `<div class="log-entry">${s}</div>`).join('');
  },
  
  // ===== 弹出面板 =====
  showPanel(panelType) {
    switch(panelType) {
      case 'cultivation': Game.showCultivationPanel(); break;
      case 'equipment': Game.showEquipmentPanel(); break;
      case 'guworm': Game.showGuWormPanel(); break;
      case 'aperture': Game.showAperturePanel(); break;
      case 'companion': Game.showCompanionPanel(); break;
      case 'party': Game.showPartyPanel(); break;
      case 'npctracker': WorldSystem.showNPCTrackerPanel(); break;
      case 'technique': Game.showTechniquePanel(); break;
      case 'map': WorldSystem.showWorldMap(); break;
      case 'carriage': WorldSystem.showCarriagePanel(); break;
      case 'achievement': Game.showAchievementPanel(); break;
      case 'farm': Game.showFarmPanel(); break;
      case 'auction': Game.showAuctionPanel(); break;
      case 'wilderness': Game.showWildernessPanel(); break;
      case 'alchemy': Game.showAlchemyPanel(); break;
      case 'quest': WorldSystem.showQuestPanel(); break;
      case 'town': WorldSystem.showTownPanel(); break;
      case 'spiritmountain': WorldSystem.showSpiritMountainPanel(); break;
      case 'spiritpet': WorldSystem.showSpiritPetPanel(); break;
      case 'offspring': WorldSystem.showOffspringPanel(); break;
      case 'sect': WorldSystem.showSectPanel(); break;
      case 'sectjoin': WorldSystem.showSectJoinPanel(); break;
      case 'home': WorldSystem.showHomePanel(); break;
      case 'inn': WorldSystem.showInnRestPanel(); break;
      case 'title': WorldSystem.showTitlePanel(); break;
      case 'sectranking': WorldSystem.showSectRankingPanel(); break;
      case 'anchors': Game.showAnchorsPanel(); break;
      case 'debts': Game.showDebtsPanel(); break;
      case 'social': UI.showSocialPanel(); break;
    }
  },
  
  showModal(title, body, footer) {
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('modal-footer').innerHTML = footer;
  },
  
  showModalBody(html, footer) {
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal-footer').innerHTML = footer;
  },
  
  closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
  },
  
  // ===== 社会动作面板：显示附近NPC并允许交互 =====
  showSocialPanel() {
    const s = Game.state;
    if (!s) return;
    if (typeof SocialSystem === 'undefined') {
      this.toast("社会系统未加载", "danger");
      return;
    }
    // 获取当前区域的NPC
    var npcs = [];
    if (s.npcList) {
      npcs = s.npcList.filter(function(n) { return n.isAlive !== false; }).slice(0, 20);
    }
    var html = '<div class="modal-section"><div class="modal-section-title">社会动作</div>';
    html += '<div style="font-size:0.8em;color:var(--text-dim);margin-bottom:8px;">选择NPC进行交谈、送礼、结交、偷窃等社会行为</div>';
    if (npcs.length === 0) {
      html += '<div style="text-align:center;padding:16px;color:var(--text-dim);">附近没有可交互的NPC，请先探索野外或前往城镇</div>';
    } else {
      npcs.forEach(function(npc) {
        var moodColor = npc.mood > 50 ? 'var(--jade)' : (npc.mood > 20 ? 'var(--gold)' : 'var(--crimson)');
        var cultName = npc.cultName || (typeof CULT_LEVELS !== 'undefined' && CULT_LEVELS[npc.cultLevel] ? CULT_LEVELS[npc.cultLevel].name : '凡人');
        html += '<div class="modal-item-row" style="flex-direction:column;align-items:flex-start;">';
        html += '<div style="width:100%;display:flex;justify-content:space-between;">';
        html += '<div><div style="color:var(--gold-bright);">' + npc.name + '</div>';
        html += '<div class="modal-item-desc">[' + cultName + '] 好感：<span style="color:' + moodColor + ';">' + (npc.mood || 0) + '</span></div></div>';
        html += '<div style="display:flex;gap:4px;flex-wrap:wrap;">';
        html += '<button class="btn-combat" style="font-size:0.7em;padding:4px 8px;" onclick="Game.socialAction(\'talk\',\'' + npc.id + '\')">交谈</button>';
        html += '<button class="btn-combat" style="font-size:0.7em;padding:4px 8px;" onclick="Game.socialAction(\'probe\',\'' + npc.id + '\')">试探</button>';
        html += '<button class="btn-combat" style="font-size:0.7em;padding:4px 8px;" onclick="Game.socialAction(\'befriend\',\'' + npc.id + '\')">结交</button>';
        html += '<button class="btn-combat" style="font-size:0.7em;padding:4px 8px;border-color:var(--crimson);color:var(--crimson);" onclick="Game.socialAction(\'steal\',\'' + npc.id + '\')">偷窃</button>';
        html += '</div></div></div>';
      });
    }
    html += '</div>';
    this.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },
  
  // ===== Toast通知 =====
  toast(msg, type='') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    // 限制最多同时显示 5 条 toast，超出移除最早的
    const MAX_TOASTS = 5;
    const existing = container.querySelectorAll('.toast');
    if (existing.length >= MAX_TOASTS) {
      for (let i = 0; i <= existing.length - MAX_TOASTS; i++) {
        if (existing[i]) existing[i].remove();
      }
    }
    const toast = document.createElement('div');
    toast.className = 'toast ' + (type ? 'toast-' + type : '');
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s';
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  },
  
  // ===== 任务追踪器更新 =====
  updateQuestTracker() {
    const s = Game.state;
    if (!s) return;
    if (typeof WorldSystem !== 'undefined') {
      WorldSystem.initWorldState(s);
      WorldSystem.updateQuests();
    }
    const tracker = document.getElementById('quest-tracker');
    if (!tracker) return;
    let html = '';
    let totalQuests = 0;

    // 永久主线任务（当前阶段）
    if (typeof WorldSystem !== 'undefined' && WorldSystem.PERMANENT_MAIN_STORY) {
      if (!s.pmainProgress) s.pmainProgress = 0;
      if (!s.pmainCompleted) s.pmainCompleted = [];
      const story = WorldSystem.PERMANENT_MAIN_STORY;
      let currentIdx = s.pmainProgress;
      while (currentIdx < story.length - 1 && s.pmainCompleted.includes(story[currentIdx].id)) {
        currentIdx++;
      }
      if (currentIdx < story.length) {
        const stage = story[currentIdx];
        const isCompleted = s.pmainCompleted.includes(stage.id);
        if (!isCompleted && totalQuests < 3) {
          html += '<div class="quest-item quest-clickable" onclick="Game.gotoNode(\'_pmain_quest_go_' + currentIdx + '\')" style="cursor:pointer;">';
          html += '<div class="quest-name">⚜️ ' + stage.name + '</div>';
          html += '<div class="quest-desc">' + stage.desc + ' [' + stage.stage + ']</div>';
          html += '</div>';
          totalQuests++;
        }
      }
    }

    // 主线/支线任务
    if (s.activeQuests && s.activeQuests.length > 0) {
      s.activeQuests.slice(0, 3).forEach(questId => {
        if (totalQuests >= 3) return;
        const quest = QUESTS[questId];
        if (!quest) return;
        const typeIcon = quest.type === "main" ? "⚜️" : "📌";
        var mainLoc = (typeof WorldSystem !== 'undefined' && WorldSystem.MAIN_QUEST_LOCATIONS) ? WorldSystem.MAIN_QUEST_LOCATIONS[questId] : null;
        var clickable = mainLoc && mainLoc.areas && mainLoc.areas.length > 0;
        if (clickable) {
          html += '<div class="quest-item quest-clickable" onclick="Game.gotoNode(\'_main_quest_go_' + questId + '\')" style="cursor:pointer;">';
        } else {
          html += '<div class="quest-item">';
        }
        html += '<div class="quest-name">' + typeIcon + ' ' + quest.name + '</div>';
        html += '<div class="quest-desc">' + quest.target + (clickable ? ' [' + mainLoc.areas[0] + ']' : '') + '</div>';
        html += '</div>';
        totalQuests++;
      });
    }

    // 地点任务
    if (s.activeLocQuests && s.activeLocQuests.length > 0) {
      s.activeLocQuests.slice(0, 3).forEach(aq => {
        if (totalQuests >= 3) return;
        const quest = LOCATION_QUEST_POOL[aq.questIdx];
        if (!quest) return;
        const locName = WORLD_MAP[aq.locKey] ? WORLD_MAP[aq.locKey].name : aq.locKey;
        html += '<div class="quest-item quest-clickable" onclick="Game.gotoNode(\'_loc_quest_go_' + aq.locKey + '\')" style="cursor:pointer;">';
        html += '<div class="quest-name">📍 ' + quest.title + '</div>';
        if (quest.type === "defeat_traitor") {
          const traitorNPC = s.npcList && s.npcList.find(n => n.isTraitorQuest && n.questLocKey === aq.locKey && n.questIdx === aq.questIdx);
          const traitorName = traitorNPC ? traitorNPC.name : "叛徒";
          html += '<div class="quest-desc">击败 ' + traitorName + ' @ ' + locName + '</div>';
        } else if (quest.type === "submit_material") {
          const itemName = ITEMS[quest.requiredItem] ? ITEMS[quest.requiredItem].name : quest.requiredItem;
          const invItem = s.inventory ? s.inventory.find(i => i.id === quest.requiredItem) : null;
          const has = invItem ? invItem.count : 0;
          html += '<div class="quest-desc">' + itemName + ' (' + has + '/' + quest.requiredCount + ') @ ' + locName + '</div>';
        } else if (quest.type === "check_location") {
          const targetName = WORLD_MAP[quest.targetLocation] ? WORLD_MAP[quest.targetLocation].name : quest.targetLocation;
          html += '<div class="quest-desc">前往 ' + targetName + '</div>';
        }
        html += '</div>';
        totalQuests++;
      });
    }

    // 扩展支线任务（worldexpand4 activeSideQuests）
    if (s.activeSideQuests && s.activeSideQuests.length > 0 && typeof SIDE_QUESTS !== 'undefined') {
      s.activeSideQuests.slice(0, 3).forEach(sqId => {
        if (totalQuests >= 3) return;
        const sq = SIDE_QUESTS[sqId];
        if (!sq) return;
        // 尝试找到该支线NPC所在区域
        var sqLoc = '';
        if (s.sideQuestNPCs) {
          for (var area in s.sideQuestNPCs) {
            if (s.sideQuestNPCs[area] && s.sideQuestNPCs[area].includes(sqId)) { sqLoc = area; break; }
          }
        }
        var clickable = sqLoc && typeof WorldSystem !== 'undefined' && WORLD_MAP && WORLD_MAP[sqLoc];
        if (clickable) {
          html += '<div class="quest-item quest-clickable" onclick="Game.gotoNode(\'_side_quest_go_' + sqLoc + '\')" style="cursor:pointer;">';
        } else {
          html += '<div class="quest-item">';
        }
        html += '<div class="quest-name">📜 ' + sq.name + '</div>';
        html += '<div class="quest-desc">' + sq.target + (sqLoc ? ' [' + (WORLD_MAP[sqLoc] ? WORLD_MAP[sqLoc].name : sqLoc) + ']' : '') + '</div>';
        html += '</div>';
        totalQuests++;
      });
    }

    // 主线自定义支线任务（storyQuests，由 story.js 接取）
    if (s.storyQuests && s.storyQuests.length > 0) {
      s.storyQuests.forEach(sq => {
        if (totalQuests >= 3) return;
        var clickable = sq.area && typeof WorldSystem !== 'undefined';
        if (clickable) {
          html += '<div class="quest-item quest-clickable" onclick="Game.gotoNode(\'_story_quest_go_' + sq.area + '\')" style="cursor:pointer;">';
        } else {
          html += '<div class="quest-item">';
        }
        html += '<div class="quest-name">📋 ' + sq.name + '</div>';
        html += '<div class="quest-desc">' + sq.desc + (sq.area ? ' [' + sq.areaName + ']' : '') + '</div>';
        html += '</div>';
        totalQuests++;
      });
    }

    if (totalQuests === 0) {
      tracker.innerHTML = '<div style="color:var(--text-dim);font-size:0.75em;text-align:center;padding:4px;">暂无任务</div>';
      return;
    }

    const remaining = (s.activeQuests ? s.activeQuests.length : 0) + (s.activeLocQuests ? s.activeLocQuests.length : 0) - totalQuests;
    if (remaining > 0) {
      html += '<div style="text-align:center;font-size:0.7em;color:var(--text-dim);">还有' + remaining + '个任务…</div>';
    }
    tracker.innerHTML = html;
  },

  // ===== 结局画面 =====
  showEnding(ending) {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('ending-screen').style.display = 'flex';
    document.getElementById('ending-icon').textContent = ending.icon || '🌟';
    document.getElementById('ending-title').textContent = ending.title;
    document.getElementById('ending-text').innerHTML = ending.text;
    
    // 显示获得的成就
    const achContainer = document.getElementById('ending-achievements');
    const s = Game.state;
    let achHtml = '';
    s.achievements.forEach(a => {
      const ach = ACHIEVEMENTS[a];
      if (ach) achHtml += `<span class="ending-ach">${ach.icon} ${ach.name}</span>`;
    });
    achContainer.innerHTML = '<div style="color:var(--gold);font-size:0.85em;margin-bottom:8px;">获得成就 (' + s.achievements.length + ')</div>' + achHtml;
    
    // 清除自动存档（保留手动存档）
    localStorage.removeItem('fanren_mud_slot___auto__');
    localStorage.removeItem('fanren_mud_save');
    
    // 记录结局统计
    let stats = '<div style="color:var(--text-dim);font-size:0.8em;margin-top:16px;">';
    stats += '最终修为：' + CULT_LEVELS[s.cultLevel].name + ' | ';
    stats += '道侣：' + s.companions.length + '位 | ';
    stats += '成就：' + s.achievements.length + '项 | ';
    stats += '战斗胜利：' + s.battlesWon + '场';
    stats += '</div>';
    document.getElementById('ending-text').innerHTML += stats;
  },
  
  // ===== 存档管理面板 =====
  currentSavePanel: null, // 'save' 或 'load'
  
  showSavePanel(mode) {
    this.currentSavePanel = mode;
    const isSaveMode = mode === 'save';
    const inGame = Game.state !== null;
    
    let html = '';
    
    // 顶部操作栏
    html += '<div class="save-toolbar">';
    html += '<button class="btn-combat" onclick="Game.importSave()">📥 导入存档</button>';
    if (inGame) {
      html += '<button class="btn-combat" onclick="Game.exportAllSaves()">📦 导出全部</button>';
    }
    html += '</div>';
    
    // 自动存档槽
    html += '<div class="save-section-title">⚡ 自动存档</div>';
    const autoData = Game.loadSlotData('__auto__');
    html += this.renderSaveSlot('__auto__', autoData, '自动存档', inGame, isSaveMode, true);
    
    // 手动存档槽
    html += '<div class="save-section-title">💾 手动存档槽</div>';
    for (let i = 1; i <= 6; i++) {
      const slotData = Game.loadSlotData(i);
      html += this.renderSaveSlot(i, slotData, '存档槽' + i, inGame, isSaveMode, false);
    }
    
    // 说明
    html += '<div class="save-help">';
    html += '<p>📌 导出存档可生成JSON文件，拷贝到其他电脑后通过「导入存档」即可恢复进度</p>';
    html += '<p>📌 自动存档在每次进入剧情节点时自动更新，手动存档不受影响</p>';
    html += '<p>📌 存档保存在浏览器本地，清除浏览器数据会丢失存档</p>';
    html += '</div>';
    
    UI.showModalBody(html, '<button class="btn-combat" onclick="UI.closeModal()">关闭</button>');
  },
  
  renderSaveSlot(slotId, slotData, defaultName, inGame, isSaveMode, isAuto) {
    const hasData = slotData !== null;
    let html = '<div class="save-slot' + (hasData ? '' : ' save-slot-empty') + '">';
    
    // 存档信息
    html += '<div class="save-slot-info">';
    if (hasData) {
      const s = slotData.state;
      const cultName = CULT_LEVELS[s.cultLevel] ? CULT_LEVELS[s.cultLevel].name : '未知';
      html += '<div class="save-slot-name">' + (slotData.slotName || defaultName) + '</div>';
      html += '<div class="save-slot-detail">';
      html += '<span class="save-cult">' + cultName + '</span>';
      html += '<span>💎' + (s.spiritStones || 0) + '</span>';
      html += '<span>⚔️' + (s.battlesWon || 0) + '</span>';
      html += '<span>💕' + (s.companions ? s.companions.length : 0) + '</span>';
      html += '<span>🏆' + (s.achievements ? s.achievements.length : 0) + '</span>';
      html += '</div>';
      html += '<div class="save-slot-time">📅 ' + (slotData.saveTime || '未知时间') + '</div>';
    } else {
      html += '<div class="save-slot-name">' + defaultName + '</div>';
      html += '<div class="save-slot-empty-text">— 空槽位 —</div>';
    }
    html += '</div>';
    
    // 操作按钮
    html += '<div class="save-slot-actions">';
    if (isSaveMode && inGame && !isAuto) {
      if (hasData) {
        html += '<button class="btn-combat btn-save-overwrite" onclick="Game.confirmSaveToSlot(\'' + slotId + '\',\'' + defaultName + '\')">覆盖存档</button>';
      } else {
        html += '<button class="btn-combat btn-save-new" onclick="Game.saveToSlot(\'' + slotId + '\',\'' + defaultName + '\')">存入此处</button>';
      }
    }
    if (hasData && !isSaveMode) {
      html += '<button class="btn-combat btn-load" onclick="Game.loadFromSlot(\'' + slotId + '\')">📖 读档</button>';
    }
    if (hasData) {
      html += '<button class="btn-combat" onclick="Game.exportSave(\'' + slotId + '\')">📤 导出</button>';
      if (!isAuto) {
        html += '<button class="btn-combat btn-del" onclick="Game.deleteSlot(\'' + slotId + '\')">🗑️</button>';
      }
    }
    html += '</div>';
    
    html += '</div>';
    return html;
  },
};

// ===== 移动端标签切换 =====
const MobileUI = {
  currentTab: 'center',
  
  isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  },
  
  switchTab(panel) {
    if (!this.isMobile()) return;
    this.currentTab = panel;
    
    const left = document.getElementById('left-panel');
    const center = document.getElementById('center-panel');
    const right = document.getElementById('right-panel');
    
    // 重置
    left.classList.remove('mobile-active');
    right.classList.remove('mobile-active');
    center.style.display = '';
    
    if (panel === 'left') {
      left.classList.add('mobile-active');
      center.style.display = 'none';
      right.classList.remove('mobile-active');
    } else if (panel === 'right') {
      right.classList.add('mobile-active');
      center.style.display = 'none';
      left.classList.remove('mobile-active');
    } else {
      left.classList.remove('mobile-active');
      right.classList.remove('mobile-active');
      center.style.display = '';
    }
    
    // 更新标签状态
    document.querySelectorAll('.mtab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.panel === panel);
    });
  },
  
  // 进入游戏时自动切到剧情页
  onGameStart() {
    if (this.isMobile()) {
      this.switchTab('center');
    }
  },
};

// ===== 初始化 =====
window.addEventListener('DOMContentLoaded', () => {
  // 检查存档（兼容新旧存档系统）
  if (Game.hasAnySave()) {
    document.getElementById('btn-continue').style.display = '';
  }
  
  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') UI.closeModal();
    if (e.key === 's' && e.ctrlKey) { e.preventDefault(); if (Game.state) Game.saveGame(); }
    if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); UI.showSavePanel('load'); }
  });
});
