class Player {
    constructor(name, playerId) {
        this.name = name;
        this.flipX = false;
        this.x = Math.floor(Math.random() * 400) + 50;
        this.y = Math.floor(Math.random() * 500) + 50;
        this.playerId = playerId;
        this.level = 1;
        this.HP = 90;
        this.maxHP = 90;
        this.exp = 0;
        this.expForLevel = 10;
        this.maxExp = 10;
        //this.updateCallback = updateCallback;
    }

    addExp() {
        this.exp += 1;
        if (this.exp >= this.maxExp) {
            this.exp -= this.maxExp;
            this.level++;
            this.maxExp += this.expForLevel;
            this.maxHP += Math.trunc(this.maxHP / 10);
            this.onLevelUp();
        }
        this.updateCallback(this);
    }
}

module.exports.Player = Player;