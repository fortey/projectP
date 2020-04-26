const { Skill } = require('./skill.js');

class Lightning extends Skill {
    constructor(key, distance, area, damage, updateCallback) {
        super(key, distance, area, damage, updateCallback);
        this.cooldown = 7000;
    }

}
module.exports.Lightning = Lightning;