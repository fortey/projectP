export class HealthBar {

    constructor(scene, container, maxHP, value = maxHP) {
        this.bar = new Phaser.GameObjects.Graphics(scene);
        container.add(this.bar);

        this.x = -16;
        this.y = -28;
        this.set(value, maxHP);
    }

    set(value, maxHP) {
        this.value = value;
        this.maxHP = maxHP;
        this.p = 30 / maxHP;

        this.draw();
    }

    decrease(amount) {
        this.value -= amount;

        if (this.value < 0) {
            this.value = 0;
        }

        this.draw();

        return (this.value === 0);
    }

    draw() {
        this.bar.clear();

        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x, this.y, 32, 10);

        //  Health

        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x + 1, this.y + 1, 30, 8);

        if (this.value < this.maxHP / 3) {
            this.bar.fillStyle(0xff0000);
        }
        else {
            this.bar.fillStyle(0x00ff00);
        }

        var d = Math.floor(this.p * this.value);

        this.bar.fillRect(this.x + 1, this.y + 1, d, 8);
    }

}