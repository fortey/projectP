class Skill {
    constructor(name, frames, width, height) {
        this.sprite = 'assets/sprites/' + name + '.png';
        this.audio = 'assets/audio/' + name + '.wav';
        this.width = width;
        this.height = height;
        this.frames = frames;
        this.frameRate = 10;
        this.hideOnComplete = true;
        this.pivotY = 0;
    }
}

const lightning = new Skill('lightning', [0, 1, 2, 3, 4, 5], 500, 300);
lightning.pivotY = -150;

export const skills = {
    'lightning': lightning,
    'napalm': new Skill('napalm', [0, 1, 2], 150, 150),
}