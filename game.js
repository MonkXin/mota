const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let hero = { x: 5, y: 9, hp: 1200, atk: 25, def: 15, ykeys: 0, bkeys: 0, money: 0, floor: 0 };
let isVictory = false;

const monsters = {
    4: { name: "绿史莱姆", atk: 22, hp: 60, def: 10, money: 15, icon: "👾" },
    12: { name: "骷髅战士", atk: 55, hp: 150, def: 25, money: 40, icon: "💀" },
    11: { name: "魔塔之王", atk: 180, hp: 1500, def: 80, money: 0, icon: "👹" } 
};

// 5层地图数据（保持不变）
const maps = [
    [[1,1,1,1,1,1,1,1,1,1,1],[1,10,5,0,1,0,6,9,0,1,1],[1,0,2,0,1,0,1,1,1,0,1],[1,0,1,1,1,0,1,12,0,0,1],[1,6,14,0,4,0,3,0,1,1,1],[1,1,1,1,1,7,1,0,5,0,1],[1,0,4,0,0,0,1,1,1,0,1],[1,0,1,1,1,1,1,0,4,0,1],[1,0,2,0,1,0,6,0,1,1,1],[1,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1]],
    [[1,1,1,1,1,1,1,1,1,1,1],[1,6,9,6,0,1,12,4,12,0,1],[1,1,1,1,0,1,1,1,1,0,1],[1,2,0,1,0,0,14,0,1,0,1],[1,0,0,15,0,1,1,0,1,0,1],[1,0,1,1,8,1,7,0,0,0,1],[1,0,1,0,0,1,1,0,1,0,1],[1,0,1,0,0,0,0,0,1,0,1],[1,1,1,1,1,1,1,1,1,0,1],[1,4,4,4,0,0,0,5,5,0,1],[1,1,1,1,1,1,1,1,1,1,1]],
    [[1,1,1,1,1,1,1,1,1,1,1],[1,6,6,6,1,5,5,5,1,6,6,1],[1,6,9,6,1,6,13,6,1,6,9,1],[1,6,6,6,1,16,0,6,1,6,6,1],[1,1,15,1,1,1,3,1,1,1,1],[1,0,0,0,0,8,0,0,0,0,1],[1,1,1,1,1,7,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,1],[1,2,14,2,1,1,1,2,14,2,1],[1,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1]],
    [[1,1,1,1,1,1,1,1,1,1,1],[1,12,12,12,1,5,0,5,1,12,12,1],[1,12,0,12,1,0,9,0,1,12,0,1],[1,12,12,12,1,0,6,0,1,12,12,1],[1,1,3,1,1,1,15,1,1,3,1],[1,14,0,0,0,8,0,0,0,14,1],[1,1,3,1,1,1,7,1,1,3,1],[1,12,12,12,1,0,6,0,1,12,12,1],[1,12,0,12,1,0,9,0,1,12,0,1],[1,12,12,12,1,5,0,5,1,12,12,1],[1,1,1,1,1,1,1,1,1,1,1]],
    [[1,1,1,1,1,1,1,1,1,1,1],[1,5,6,9,0,0,0,9,6,5,1],[1,6,1,1,1,0,1,1,1,6,1],[1,9,1,0,0,0,0,0,1,9,1],[1,0,1,0,1,1,1,0,1,0,1],[1,0,0,0,1,11,1,0,0,0,1],[1,0,1,0,1,1,1,0,1,0,1],[1,9,1,0,0,8,0,0,1,9,1],[1,6,1,1,1,0,1,1,1,6,1],[1,5,6,9,0,0,0,9,6,5,1],[1,1,1,1,1,1,1,1,1,1,1]]
];

// --- UI 控制逻辑 ---
function showPanel(id) {
    closeAllPanels();
    document.getElementById(id).style.display = 'block';
}

function closeAllPanels() {
    document.querySelectorAll('.overlay-panel').forEach(p => p.style.display = 'none');
}

// 商店购买逻辑
function buyAttribute(type) {
    if (hero.money < 60) {
        alert("金币不足！需要 60 金币。");
        return;
    }
    hero.money -= 60;
    if (type === 'hp') hero.hp += 600;
    if (type === 'atk') hero.atk += 6;
    if (type === 'def') hero.def += 6;
    render();
}

// 怪物手册动态更新
function updateManual() {
    const list = document.getElementById('manual-list');
    list.innerHTML = "";
    [4, 12, 11].forEach(id => {
        const m = monsters[id];
        let dmg = "无法击败";
        if (hero.atk > m.def) {
            dmg = (Math.ceil(m.hp / (hero.atk - m.def)) - 1) * Math.max(0, m.atk - hero.def);
        }
        list.innerHTML += `
            <div class="manual-row">
                <span>${m.icon}</span>
                <span>${m.name}</span>
                <span class="dmg-val">损失: ${dmg}</span>
            </div>
        `;
    });
    showPanel('manual-panel');
}

// --- 游戏核心渲染（逻辑同前） ---
function render() {
    if (isVictory) {
        ctx.fillStyle = "rgba(0,0,0,0.85)"; ctx.fillRect(0,0,440,440);
        ctx.fillStyle = "#ffd700"; ctx.font = "bold 40px Arial"; ctx.textAlign = "center";
        ctx.fillText("🎉 恭喜通关！", 220, 200);
        return;
    }
    ctx.fillStyle = "#1a1b26"; ctx.fillRect(0,0,440,440);
    const curMap = maps[hero.floor];
    for (let y=0; y<11; y++) {
        for (let x=0; x<11; x++) {
            const t = curMap[y][x];
            if (t===1) { ctx.fillStyle="#24283b"; ctx.fillRect(x*40+1, y*40+1, 38,38); }
            else if (t!==0) {
                const icon = {2:"🔑",3:"🚪",4:"👾",5:"🍷",6:"💎",7:"⏫",8:"⏬",9:"🧿",10:"🎅",11:"👹",12:"💀",13:"🛡️",14:"💙",15:"🔵",16:"⚔️"}[t];
                ctx.font="28px Arial"; ctx.textAlign="center"; ctx.textBaseline="middle";
                ctx.fillText(icon || "", x*40+20, y*40+20);
            }
        }
    }
    ctx.fillText("🧙‍♂️", hero.x*40+20, hero.y*40+20);
    // UI 更新
    document.getElementById('ui-hp').innerText = hero.hp;
    document.getElementById('ui-atk').innerText = hero.atk;
    document.getElementById('ui-def').innerText = hero.def;
    document.getElementById('ui-money').innerText = hero.money;
    document.getElementById('ui-ykey').innerText = hero.ykeys;
    document.getElementById('ui-bkey').innerText = hero.bkeys;
    document.getElementById('ui-floor').innerText = hero.floor + 1;
}

function move(dx, dy) {
    if (document.querySelector('.overlay-panel[style*="block"]')) return; // 有面板开启时不许移动
    if (isVictory) return;
    const nx = hero.x + dx, ny = hero.y + dy;
    const curMap = maps[hero.floor];
    if (nx<0 || nx>10 || ny<0 || ny>10) return;
    const t = curMap[ny][nx];

    if (t===1) return;
    if (t===10) { showPanel('store-panel'); return; } // 触发商店面板

    // 拾取与交互（保持原有逻辑）
    if (t===3 && hero.ykeys>0) { hero.ykeys--; curMap[ny][nx]=0; } else if (t===3) return;
    if (t===15 && hero.bkeys>0) { hero.bkeys--; curMap[ny][nx]=0; } else if (t===15) return;
    if (t===2) { hero.ykeys++; curMap[ny][nx]=0; }
    if (t===14) { hero.bkeys++; curMap[ny][nx]=0; }
    if (t===5) { hero.hp+=300; curMap[ny][nx]=0; }
    if (t===6) { hero.atk+=3; curMap[ny][nx]=0; }
    if (t===9) { hero.def+=3; curMap[ny][nx]=0; }
    if (t===13) { hero.def+=25; curMap[ny][nx]=0; alert("🛡️ 获得【钢盾】！"); }
    if (t===16) { hero.atk+=40; curMap[ny][nx]=0; alert("⚔️ 获得【英雄剑】！"); }
    if (t===7) { hero.floor++; hero.x=5; hero.y=9; render(); return; }
    if (t===8) { hero.floor--; hero.x=5; hero.y=1; render(); return; }

    if ([4,11,12].includes(t)) {
        const m = monsters[t];
        if (hero.atk <= m.def) { alert("⚠️ 攻击力不足！"); return; }
        const dmg = (Math.ceil(m.hp/(hero.atk-m.def))-1) * Math.max(0, m.atk-hero.def);
        if (hero.hp > dmg) {
            hero.hp-=dmg; hero.money+=m.money; curMap[ny][nx]=0;
            if (t===11) isVictory=true;
        } else { alert("💀 生命值不足！"); return; }
    }
    hero.x = nx; hero.y = ny;
    render();
}

window.onkeydown = (e) => {
    const k = e.key.toLowerCase();
    if (k === 'l') updateManual();
    if (k === 'escape') closeAllPanels();
    if (['w','s','a','d'].includes(k)) move(k==='w'?0:k==='s'?0:k==='a'?-1:1, k==='w'?-1:k==='s'?1:0);
};

// 按钮绑定
['btnW','btnS','btnA','btnD'].forEach((id, i) => document.getElementById(id).onclick = () => move([0,0,-1,1][i], [-1,1,0,0][i]));

window.onload = render;
render();