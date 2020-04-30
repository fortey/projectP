import { ExpBar } from "./expBar.js";
class UIScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'UIScene'
        });
        this.skills = [];
    }
    create() {

        const c1 = this.add.container(27, this.cameras.main._height - 32);
        c1.add(new MenuItem(this, 0, 0, 'lightning-ico', 0));
        c1.bar = new ExpBar(this, c1, 5);
        c1.levelLabel = this.add.text(-25, -25, '0', { color: "white", fontSize: 16, fontStyle: 'bold' });
        c1.add(c1.levelLabel);
        this.skills.push(c1);

        const c2 = this.add.container(79, this.cameras.main._height - 32);
        c2.add(new MenuItem(this, 0, 0, 'napalm-ico', 1));
        c2.bar = new ExpBar(this, c2, 5);
        c2.levelLabel = this.add.text(-25, -25, '0', { color: "white", fontSize: 16, fontStyle: 'bold' });
        c2.add(c2.levelLabel);
        this.skills.push(c2);

        this.events.on("GameOver", this.onGameOver, this);
    }

    onGameOver() {
        this.add.text(30, this.cameras.main.centerY, 'Game Over', { color: "#df3508", fontSize: 90 });
        this.skills.forEach((item) => {
            item.setVisible(false);
            item.setInteractive(false);
        });
    }

    onKeyInput(event) {
        if (this.currentMenu && this.currentMenu.selected) {
            if (event.code === "ArrowUp") {
                this.currentMenu.moveSelectionUp();
            } else if (event.code === "ArrowDown") {
                this.currentMenu.moveSelectionDown();
            } else if (event.code === "ArrowRight" || event.code === "Shift") {

            } else if (event.code === "Space" || event.code === "ArrowLeft") {
                this.currentMenu.confirm();
            }
        }
    }

    updatePlayerList(players) {
        if (this.playerList) this.playerList.destroy();
        this.playerList = this.add.container(this.cameras.main._width - 180, 20);
        const playersArray = Object.values(players).sort((player1, player2) => {
            if (player1.level > player2) return -1;
            else if (player1.level < player2) return 1;
            else return 0;
        });
        for (let i = 0; i < playersArray.length; i++) {
            const player = this.add.text(0, i * 15, `${playersArray[i].name} | lvl. ${playersArray[i].level}`);
            this.playerList.add(player);
        }
    }
    updateSkill(index, skill) {
        const skillContainer = this.skills[index];
        skillContainer.bar.set(skill.exp, skill.maxExp);
        skillContainer.levelLabel.destroy();
        skillContainer.levelLabel = this.add.text(-25, -25, skill.level, { color: "white", fontSize: 16, fontStyle: 'bold' });
        skillContainer.add(skillContainer.levelLabel);

        skillContainer.endTime = skill.endTime;
        skillContainer.timeEvent = this.time.addEvent({
            delay: 100, loop: true, callback: () => {
                if (skillContainer.timer) skillContainer.timer.destroy();
                if (skillContainer.endTime - Date.now() < 0) {
                    skillContainer.timeEvent.destroy();
                } else {
                    skillContainer.timer = this.add.text(-12, -10, Math.ceil((skillContainer.endTime - Date.now()) / 1000), { color: 'black', fontSize: 34, fontStyle: 'bold' });
                    skillContainer.add(skillContainer.timer);
                }
            }, callbackScope: this
        });


    }
}

class MenuItem extends Phaser.GameObjects.Image {

    constructor(scene, x, y, texture, skillIndex) {
        super(scene, x, y, texture);
        this.setInteractive();
        this.on('pointerdown', () => {
            if (scene.skills[skillIndex].endTime && scene.skills[skillIndex].endTime - Date.now() > 0) return;
            scene.events.emit("Skill", skillIndex);
        });
    }
}

export { UIScene };