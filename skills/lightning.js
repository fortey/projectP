const { Skill } = require('./skill.js');

class Lightning extends Skill {
    constructor(key, distance, area, damage, lvlUpCallback) {
        super(key, distance, area, damage, lvlUpCallback);
        // this.radius = radius;
        // this.damage = damage;
        // this.area = area;
    }

    use(x, y, players) {
        const targetsID = [];
        const deadPlayersID = [];
        for (let playerId in players) {
            let player = players[playerId];
            if (this.distanceBetween(player.x, player.y, x, y) <= this.area) {
                targetsID.push(playerId);
                player.HP = Math.max(player.HP - this.damage, 0);
                if (player.HP === 0) {
                    deadPlayersID.push(playerId);
                }
            }
        }
        // if (targetsID.length > 0)
        this.addExp();
        return [targetsID, deadPlayersID];
    }
}
module.exports.Lightning = Lightning;