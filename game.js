/**
 * 魔塔：英雄传说 - 通关优化版
 */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 初始数值微调：稍微提高初始防御，减少前期损耗
let hero = { x: 5, y: 9, hp: 1200, atk: 22, def: 15, ykeys: 0, bkeys: 0, money: 0, floor: 0 };

const monsters = {
    4: { name: "绿头怪", atk: 22, hp: 60, def: 8, money: 15, icon: "👾" },
    12: { name: "骷髅兵", atk: 55, hp: 140, def: 22, money: 45, icon: "💀" },
    11: { name: "大魔王", atk: 160, hp: 1200, def: 70, money: 0, icon: "👹" } 
};

// 地图数据：在第2层增加了更多资源
const maps = [
    // 0层
    [[1,1,1,1,1,1,1,1,1,1,1],[1,10,5,0,1,15,6,9,14,1,1],[1,0,2,0,1,0,1,1,1,0,1],[1,0,1,1,1,0,1,12,0,0,1],[1,6,14,0,4,0,3,0,1,1,1],[1,1,1,1,1,7,1,0,5,0,1],[1,0,4,0,0,0,1,1,1,0,1],[1,0,1,1,1,1,1,0,4,0,1],[1,0,2,0,1,0,6,0,1,1,1],[1,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1]],
    // 1层
    [[1,1,1,1,1,1,1,1,1,1,1],[1,6,9,6,0,1,12,4,12,0,1],[1,1,1,1,0,1,1,1,1,0,1],[1,2,0,1,0,0,14,0,1,0,1],[1,0,0,15,0,1,1,0,1,0,1],[1,0,1,1,8,1,7,0,0,0,1],[1,0,1,0,0,1,1,0,1,0,1],[1,0,1,0,0,0,0,0,1,0,1],[1,1,1,1,1,1,1,1,1,0,1],[1,4,4,4,0,0,0,5,5,11,1],[1,1,1,1,1,1,1,1,1,1,1]],
    // 2层 (大幅加强奖励)
    [[1,1,1,1,1,1,1,1,1,1,1],[1,6,6,6,1,5,5,5,1,6,6,1],[1,6,9,6,1,6,13,6,1,6,9,1],[1,6,6,6,1,16,0,6,1,6,6,1],[1,1,15,1,1,1,3,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,8,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,1],[1,2,14,2,1,1,1,2,14,2,1],[1,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1]]
];

function showDmg(x, y, dmg) {
    const el = document.createElement('div');
    el.className = 'dmg-popup';
    el.innerText = `-${dmg}`;
    el.style.left = (canvas.offsetLeft + x * 40 + 10) + 'px';
    el.style.top = (canvas.offsetTop + y * 40) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 600);
}

function render() {
    ctx.fillStyle = "#1a1b26";
    ctx.fillRect(0, 0, 440, 440);
    const curMap = maps[hero.floor];
    for (let y = 0; y < 11; y++) {
        for (let x = 0; x < 11; x++) {
            const t = curMap[y][x];
            const px = x * 40, py = y * 40;
            if (t === 1) {
                ctx.fillStyle = "#24283b";
                ctx.fillRect(px + 1, py + 1, 38, 38);
                ctx.fillStyle = "#414868";
                ctx.fillRect(px + 4, py + 4, 32, 4);
            } else {
                ctx.strokeStyle = "#24283b";
                ctx.strokeRect(px, py, 40, 40);
                if (t !== 0) {
                    const icon = {2:"🔑",3:"🚪",4:"👾",5:"🍷",6:"💎",7:"⏫",8:"⏬",9:"🧿",10:"🎅",11:"👹",12:"💀",13:"🛡️",14:"💙",15:"🔵",16:"⚔️"}[t];
                    ctx.font = "28px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    if ([4,11,12].includes(t) && hero.atk <= monsters[t].def) ctx.globalAlpha = 0.3;
                    ctx.fillText(icon || "", px+20, py+20);
                    ctx.globalAlpha = 1.0;
                }
            }
        }
    }
    ctx.font = "30px Arial";
    ctx.fillText("🧙‍♂️", hero.x*40+20, hero.y*40+20);
    
    // 更新 UI
    document.getElementById('ui-hp').innerText = hero.hp;
    document.getElementById('ui-atk').innerText = hero.atk;
    document.getElementById('ui-def').innerText = hero.def;
    document.getElementById('ui-money').innerText = hero.money;
    document.getElementById('ui-ykey').innerText = hero.ykeys;
    document.getElementById('ui-bkey').innerText = hero.bkeys;
    document.getElementById('ui-floor').innerText = hero.floor + 1;
}

function move(dx, dy) {
    const nx = hero.x + dx, ny = hero.y + dy;
    const curMap = maps[hero.floor];
    if (nx < 0 || nx > 10 || ny < 0 || ny > 10) return;
    const t = curMap[ny][nx];

    if (t === 1) return;

    if (t === 10) {
        let choice = prompt("🎅 仙人：1.生命+600(60金) 2.攻击+6(60金) 3.防御+6(60金)");
        if (choice === "1" && hero.money >= 60) { hero.hp += 600; hero.money -= 60; }
        if (choice === "2" && hero.money >= 60) { hero.atk += 6; hero.money -= 60; }
        if (choice === "3" && hero.money >= 60) { hero.def += 6; hero.money -= 60; }
        render(); return;
    }

    if (t === 3 && hero.ykeys > 0) { hero.ykeys--; curMap[ny][nx] = 0; } else if (t === 3) return;
    if (t === 15 && hero.bkeys > 0) { hero.bkeys--; curMap[ny][nx] = 0; } else if (t === 15) return;

    if (t === 2) { hero.ykeys++; curMap[ny][nx] = 0; }
    if (t === 14) { hero.bkeys++; curMap[ny][nx] = 0; }
    if (t === 5) { hero.hp += (hero.floor === 2 ? 800 : 250); curMap[ny][nx] = 0; } // 2层血瓶更猛
    if (t === 6) { hero.atk += 2; curMap[ny][nx] = 0; }
    if (t === 9) { hero.def += 2; curMap[ny][nx] = 0; }
    if (t === 13) { hero.def += 20; curMap[ny][nx] = 0; alert("🛡️ 获得【钢盾】！"); }
    if (t === 16) { hero.atk += 35; curMap[ny][nx] = 0; alert("⚔️ 获得【英雄剑】！"); }

    if (t === 7) { hero.floor++; hero.x = 5; hero.y = 9; render(); return; }
    if (t === 8) { hero.floor--; hero.x = 5; hero.y = 1; render(); return; }

    if ([4,11,12].includes(t)) {
        const m = monsters[t];
        if (hero.atk <= m.def) {
            alert(`⚠️ 攻击力不足！你无法伤到 ${m.name}。你需要至少 ${m.def + 1} 点攻击力。`);
            return;
        }
        const dmgPerTurn = Math.max(0, m.atk - hero.def);
        const turns = Math.ceil(m.hp / (hero.atk - m.def));
        const totalDmg = (turns - 1) * dmgPerTurn;

        if (hero.hp > totalDmg) {
            hero.hp -= totalDmg;
            hero.money += m.money;
            showDmg(nx, ny, totalDmg);
            curMap[ny][nx] = 0;
            if (t === 11) {
                alert("🎊 恭喜！你击败了魔王，拯救了公主，成为了传说！");
                location.reload(); // 重新开始
            }
        } else {
            alert("💀 你的生命值不足以击败这个怪物！");
            return;
        }
    }

    hero.x = nx; hero.y = ny;
    render();
}

window.onkeydown = (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w') move(0, -1); if (k === 's') move(0, 1);
    if (k === 'a') move(-1, 0); if (k === 'd') move(1, 0);
    if (k === 'l') {
        let str = "📖 怪物分析:\n";
        [4, 12, 11].forEach(id => {
            const m = monsters[id];
            const dmg = hero.atk <= m.def ? "无法击败" : (Math.ceil(m.hp/(hero.atk-m.def))-1) * Math.max(0, m.atk-hero.def);
            str += `${m.icon}${m.name}: 损耗 ${dmg}\n`;
        });
        alert(str);
    }
};

['btnW','btnS','btnA','btnD'].forEach((id, i) => {
    document.getElementById(id).onclick = () => move([0,0,-1,1][i], [-1,1,0,0][i]);
});

window.onload = render;
render();