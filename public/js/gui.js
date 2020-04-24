
class UIScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'UIScene'
        });
    }
    create() {
        const x = this.cameras.main.x;//, this.cameras.main.centerY);
        const im = new MenuItem(this, 27, this.cameras.main._height - 27, 'lightning-ico');
        const im2 = new MenuItem(this, 79, this.cameras.main._height - 27, 'lightning-ico');
        // basic container to hold all menus
        this.menus = this.add.container();
        this.menus.add(im);
        im.on('pointerdown', () => {
            console.log('pointerdown');
            this.events.emit("Skill", 0);
        });
        im.setInteractive();

        this.menus.add(im2);
        im2.on('pointerdown', () => {
            console.log('pointerdown');
            this.events.emit("Skill", 1);
        });
        im2.setInteractive();

        this.createMenu();

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
}

class MenuItem extends Phaser.GameObjects.Image {

    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
    }
}

export { UIScene };