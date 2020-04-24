class Skill {
    constructor(key, distance, area, damage) {
        this.key = key;
        this.distance = distance;
        this.damage = damage;
        this.area = area;
    }

    canUse(playerX, playerY, x, y) {
        return this.distanceBetween(playerX, playerY, x, y) > this.distance;
    }
    distanceBetween = (x1, y1, x2, y2) => {
        var dx = Math.abs(x1 - x2) - 10;
        var dy = Math.abs(y1 - y2) - 11;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

module.exports.Skill = Skill;