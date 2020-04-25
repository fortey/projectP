import { ExpBar } from "./expBar.js";
class UIScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'UIScene'
        });
        this.skills = [];
    }
    create() {
        const x = this.cameras.main.x;//, this.cameras.main.centerY);
        //this.menus = this.add.container();
        //this.menus.add(new MenuItem(this, 27, this.cameras.main._height - 27, 'lightning-ico', 0));
        //this.menus.add(new MenuItem(this, 79, this.cameras.main._height - 32, 'lightning-ico', 1));
        const c1 = this.add.container(27, this.cameras.main._height - 32);
        c1.add(new MenuItem(this, 0, 0, 'lightning-ico', 0));
        c1.bar = new ExpBar(this, c1, 5);
        c1.levelLabel = this.add.text(-25, -25, '0', { color: "white", fontSize: 16 });
        c1.add(c1.levelLabel);
        this.skills.push(c1);

        const c2 = this.add.container(79, this.cameras.main._height - 32);
        c2.add(new MenuItem(this, 0, 0, 'lightning-ico', 1));
        c2.bar = new ExpBar(this, c2, 5);
        c2.levelLabel = this.add.text(-25, -25, '0', { color: "white", fontSize: 16 });
        c2.add(c2.levelLabel);
        this.skills.push(c2);

        this.events.on("GameOver", () => this.add.text(30, this.cameras.main.centerY, 'Game Over', { color: "#df3508", fontSize: 90 }), this);
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
        this.skills[index].bar.set(skill.exp, skill.maxExp);
        this.skills[index].levelLabel.destroy();
        this.skills[index].levelLabel = this.add.text(-25, -25, skill.level, { color: "white", fontSize: 16 });
        this.skills[index].add(this.skills[index].levelLabel);
    }
}

class MenuItem extends Phaser.GameObjects.Image {

    constructor(scene, x, y, texture, skillIndex) {
        super(scene, x, y, texture);
        this.setInteractive();
        this.on('pointerdown', () => {
            scene.events.emit("Skill", skillIndex);
        });
    }
}

export { UIScene };