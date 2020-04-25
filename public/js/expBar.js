export class ExpBar {

    constructor(scene, container, maxValue, value = 0) {
        this.bar = new Phaser.GameObjects.Graphics(scene);
        container.add(this.bar);

        this.x = -25;
        this.y = 25;
        this.set(value, maxValue);

        //scene.add.existing(this.bar);
    }

    set(value, maxValue) {
        this.value = value;
        this.maxValue = maxValue;
        this.p = 48 / maxValue;

        this.draw();
    }

    draw() {
        this.bar.clear();

        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x, this.y, 50, 5);

        //  exp

        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x + 1, this.y + 1, 48, 4);


        this.bar.fillStyle(0x00ff00);


        var d = Math.floor(this.p * this.value);

        this.bar.fillRect(this.x + 1, this.y + 1, d, 4);
    }

}