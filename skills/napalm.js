const { Skill } = require('./skill.js');

class Napalm extends Skill {
    constructor(key, distance, area, damage) {
        super(key, distance, area, damage);
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
        return [targetsID, deadPlayersID];
    }
}
module.exports.Napalm = Napalm;