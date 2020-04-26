const { Skill } = require('./skill.js');

class Napalm extends Skill {
    constructor(key, distance, area, damage, updateCallback) {
        super(key, distance, area, damage, updateCallback);
        this.cooldown = 9000;
    }
}
module.exports.Napalm = Napalm;