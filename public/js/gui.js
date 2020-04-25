
class UIScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'UIScene'
        });
    }
    create() {
        const x = this.cameras.main.x;//, this.cameras.main.centerY);
        this.menus = this.add.container();
        this.menus.add(new MenuItem(this, 27, this.cameras.main._height - 27, 'lightning-ico', 0));
        this.menus.add(new MenuItem(this, 79, this.cameras.main._height - 27, 'lightning-ico', 1));

        //this.createMenu();


        //this.playerList.setSize(32, 36);

        this.events.on("GameOver", () => this.add.text(30, this.cameras.main.centerY, 'Game Over', { color: "#df3508", fontSize: 90 }), this);
    }
    createMenu() {

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
}

class MenuItem extends Phaser.GameObjects.Image {

    constructor(scene, x, y, texture, skillIndex) {
        super(scene, x, y, texture);
        this.setInteractive();
        this.on('pointerdown', () => {
            console.log('pointerdown');
            scene.events.emit("Skill", skillIndex);
        });
    }
}

export { UIScene };