class Skill {
    constructor(key, distance, area, damage, updateCallback) {
        this.key = key;
        this.distance = distance;
        this.damage = damage;
        this.area = area;
        this.level = 0;
        this.exp = 0;
        this.expForLevel = 5;
        this.maxExp = 5;
        this.updateCallback = updateCallback;
    }

    canUse(playerX, playerY, x, y) {
        return this.distanceBetween(playerX, playerY, x, y) > this.distance;
    }
    distanceBetween = (x1, y1, x2, y2) => {
        var dx = Math.abs(x1 - x2) - 10;
        var dy = Math.abs(y1 - y2) - 11;
        return Math.sqrt(dx * dx + dy * dy);
    }

    addExp() {
        this.exp += 1;
        if (this.exp >= this.maxExp) {
            this.exp -= this.maxExp;
            this.level++;
            this.maxExp += this.expForLevel;
            this.damage += Math.trunc(this.damage / 10);
        }
        this.updateCallback(this);
    }
}

module.exports.Skill = Skill;