import { skills } from './skills.js';
import { HealthBar } from './healthBar.js';

class BootScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'BootScene'
        });
    }

    preload() {

        this.load.tilemapTiledJSON('map', 'assets/ground/map.json');
        this.load.image('tiles', 'assets/ground/ground-extruded.png');

        // enemies
        this.load.image("dragonblue", "assets/sprites/dragonblue.png");
        this.load.image("dragonorrange", "assets/sprites/dragonorrange.png");

        // our two characters
        this.load.spritesheet('player', 'assets/sprites/healer_f.png', { frameWidth: 32, frameHeight: 36 });

        this.load.image("arrow", "assets/sprites/arrow.png");

        for (let key in skills) {
            this.load.spritesheet(key, skills[key].sprite, { frameWidth: skills[key].width, frameHeight: skills[key].height });

            this.load.audio(key, skills[key].audio);
            this.load.image(key + '-ico', 'assets/sprites/' + key + '-ico.png');
        }
    }

    create() {
        // start the WorldScene
        this.scene.start('WorldScene');
    }
}

class WorldScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'WorldScene'
        });
    }
    preload() {

    }

    create() {
        this.socket = io();
        this.otherPlayers = this.physics.add.group();

        this.createMap();
        this.createAnimations();
        // listen for web socket events

        this.createSocket();
        // don't go out of the map
        this.physics.world.bounds.width = this.map.widthInPixels;
        this.physics.world.bounds.height = this.map.heightInPixels;
        // user input
        this.cursors = this.input.keyboard.createCursorKeys();

        // var spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        // spaceKey.on('down', function (key, event) {

        //     this.fire();

        // }.bind(this));

        // // where the enemies will be
        // this.spawns = this.physics.add.group({ classType: Phaser.GameObjects.Zone });
        // for (var i = 0; i < 30; i++) {
        //     var x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
        //     var y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
        //     // parameters are x, y, width, height
        //     this.spawns.create(x, y, 20, 20);
        // }

        this.bullets = this.physics.add.group({
            classType: Phaser.GameObjects.Sprite
        });

        // add collider
        this.physics.add.overlap(this.bullets, this.otherPlayers, this.onDamaged, false, this);
        //this.physics.add.overlap(this.bullets, obstacles, this.onDamaged, false, this);
        //this.physics.add.collider(this.bullets, obstacles);

        // we listen for 'wake' event
        this.sys.events.on('wake', this.wake, this);
        this.scene.run("UIScene");
        this.uiScene = this.scene.get("UIScene");
        this.uiScene.events.on("Skill", this.onSkillPressed, this);
        this.skillSounds = {};
        //this.music = this.sound.add('lightning');
        for (let key in skills) {
            skills[key].sound = this.sound.add(key);
        }

        this.input.on('pointerdown', (pointer) => {
            console.log('pointerdown ' + this.input.activePointer.worldX);
            //this.physics.moveTo(this.container, this.input.activePointer.worldX, this.input.activePointer.worldY, 80);
            //this.socket.emit('playerMovement', { x: this.input.activePointer.worldX, y: this.input.activePointer.worldY, flipX: this.player.flipX });
            this.onSkillPointerPressed(pointer);
        }, this);
    }

    createMap() {
        this.map = this.make.tilemap({ key: 'map' });

        // first parameter is the name of the tilemap in tiled
        var tiles = this.map.addTilesetImage('tileset', 'tiles', 32, 32, 1, 2);

        // creating the layers
        // var grass = this.map.createStaticLayer('ground', tiles, 0, 0);
        // this.obstacles = this.map.createStaticLayer('lava', tiles, 0, 0);
        var grass = this.map.createStaticLayer('Grass', tiles, 0, 0);
        this.obstacles = this.map.createStaticLayer('Obstacles', tiles, 0, 0);
        this.obstacles.setCollisionByExclusion([-1]);
    }
    createSocket() {
        this.socket.on('currentPlayers', function (players) {
            Object.keys(players).forEach(function (id) {
                if (players[id].playerId === this.socket.id) {
                    this.createPlayer(players[id]);
                } else {
                    this.addOtherPlayers(players[id]);
                }
            }.bind(this));
            this.uiScene.updatePlayerList(players);
        }.bind(this));

        this.socket.on('newPlayer', function (playerInfo) {
            this.addOtherPlayers(playerInfo);
        }.bind(this));

        this.socket.on('disconnect', function (playerId) {
            this.otherPlayers.getChildren().forEach(function (player) {
                if (playerId === player.playerId) {
                    player.destroy();
                }
            }.bind(this));
        }.bind(this));

        this.socket.on('playerMoved', function (playerInfo) {
            this.otherPlayers.getChildren().forEach(function (player) {
                if (playerInfo.playerId === player.playerId) {
                    player.flipX = playerInfo.flipX;
                    player.setPosition(playerInfo.x, playerInfo.y);
                    if (playerInfo.anim !== player.anim) {
                        if (playerInfo.anim === 'stop') {
                            player.player.anims.stop();
                        } else {
                            player.player.anims.play(playerInfo.anim, true);
                        }
                    }
                    player.anim = playerInfo.anim;
                }
            }.bind(this));
        }.bind(this));

        this.socket.on('useSkillComplete', this.useSkillComplete.bind(this));

        this.socket.on('userDead', this.onUserDead.bind(this));

        this.socket.on('updatePlayers', (players) => this.uiScene.updatePlayerList(players));
        this.socket.on('skillUpdate', ({ index, skill }) => {
            console.log('skill update ' + index);
            //this.skills[index] = skill;
        });

        //this.socket.on('skillPointerPressedComplete', this.onSkillPointerPressedComplete.bind(this));
    }

    useSkillComplete({ x, y, owner, skillIndex, targets, damage }) {
        const skillKey = this.skills[skillIndex].key;
        //console.log('useSkillComplete ', target);
        this.otherPlayers.getChildren().forEach((player) => {
            if (targets.indexOf(player.playerId) !== -1) {
                const x = player.x;
                const y = player.y - 150 - 16;
                // const lightning = this.add.sprite(x, y, skillKey, 0);
                // lightning.anims.play(skillKey, true);
                // skills[skillKey].sound.play();

                const effectText = this.add.text(player.x + 16, player.y, `-${damage}`, { color: "#df3508", fontSize: 16 });
                player.hp.decrease(damage);
                this.time.addEvent({ delay: 1000, callback: () => effectText.destroy() });
            }
        });
        // let enemy = this.otherPlayers.getChildren().find((player) => player.playerId === target);
        // if (!enemy && this.socket.id === target) {
        //     enemy = this.container;
        // }
        // const x = enemy.x;
        // const y = enemy.y - 150 - 16;
        const skillInfo = skills[skillKey];
        const skillSprite = this.add.sprite(x, y + skillInfo.pivotY, skillKey, 0);
        skillSprite.anims.play(skillKey, true);
        skills[skillKey].sound.play();

        if (targets.indexOf(this.socket.id) !== -1) {
            const player = this.container;
            const x = player.x;
            const y = player.y - 150 - 16;
            // const lightning = this.add.sprite(x, y, skillKey, 0);
            // lightning.anims.play(skillKey, true);
            // skills[skillKey].sound.play();

            const effectText = this.add.text(player.x + 16, player.y, `-${damage}`, { color: "#df3508", fontSize: 16 });
            player.hp.decrease(damage);
            this.time.addEvent({ delay: 1000, callback: () => effectText.destroy() });
        }

        this.onSkillPointerPressedComplete();
    }

    createPlayer(playerInfo) {

        this.isAlive = true;
        this.direction = 'right';
        this.player = this.add.sprite(0, 0, 'player', 6);

        this.container = this.add.container(playerInfo.x, playerInfo.y);
        this.container.setSize(32, 36);
        this.physics.world.enable(this.container);
        this.container.add(this.player);
        this.container.player = this.player;
        this.skills = playerInfo.skills;

        this.container.hp = new HealthBar(this, this.container, playerInfo.maxHP, playerInfo.HP);
        this.container.add(this.add.text(-16, - 43, playerInfo.name, { color: "white", fontSize: 16 }));

        // update camera
        this.updateCamera();

        // don't go out of the map
        this.container.body.setCollideWorldBounds(true);
        this.physics.add.collider(this.container, this.obstacles);
        this.physics.add.overlap(this.bullets, this.container, this.onDamaged, false, this);
    }

    onSkillPressed(index) {
        //console.log(this.skills[index].radius);
        if (!this.skillRadius) {
            this.skillRadius = this.add.graphics();
        }
        this.skillRadius.lineStyle(1, 0xffffff);
        this.skillRadius.strokeCircle(0, 0, this.skills[index].distance);
        this.container.add(this.skillRadius);
        //this.time.addEvent({ delay: 2000, callback: () => this.skillRadius.clear(), callbackScope: this });
        this.currentSkill = index;

        if (!this.skillArea) {
            this.skillArea = this.add.graphics();
        }
        this.skillArea.lineStyle(1, 0xffffff);
        this.skillArea.strokeCircle(0, 0, this.skills[index].area);
    }

    onSkillPointerPressed(pointer) {
        const distance = Phaser.Math.Distance.Between(this.container.x, this.container.y, pointer.worldX, pointer.worldY);
        if (this.currentSkill === undefined || distance > this.skills[this.currentSkill].distance) return;
        this.socket.emit('useSkill', { x: pointer.worldX, y: pointer.worldY, skillIndex: this.currentSkill });
    }

    onSkillPointerPressedComplete() {
        if (this.skillRadius) this.skillRadius.clear();
        if (this.skillArea) this.skillArea.clear();
        this.currentSkill = undefined;
    }

    updateCamera() {
        // limit camera to map
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.container, true, 0.08, 0.08);
        this.cameras.main.roundPixels = true; // avoid tile bleed
    }

    wake() {
        this.cursors.left.reset();
        this.cursors.right.reset();
        this.cursors.up.reset();
        this.cursors.down.reset();
    }

    addOtherPlayers(playerInfo) {
        const container = this.add.container(playerInfo.x, playerInfo.y);
        container.setSize(32, 36);
        const otherPlayer = this.add.sprite(0, 0, 'player', 9);
        container.add(otherPlayer);
        container.player = otherPlayer;
        otherPlayer.setTint(Math.random() * 0xffffff);
        container.playerId = playerInfo.playerId;
        //otherPlayer.setInteractive();
        // otherPlayer.on('pointerdown', () => this.socket.emit('useSkill', { skillIndex: this.currentSkill, target: container.playerId }), this);
        //otherPlayer.hp = new HealthBar(this, otherPlayer.x - 16, otherPlayer.y - 28, playerInfo.maxHP, playerInfo.HP);
        container.hp = new HealthBar(this, container, playerInfo.maxHP, playerInfo.HP);
        container.add(this.add.text(-16, - 43, playerInfo.name, { color: "white", fontSize: 16 }));
        this.otherPlayers.add(container);
    }

    createAnimations() {
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { frames: [10, 9, 10, 11] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { frames: [4, 3, 4, 5] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { frames: [0, 1, 2, 1] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { frames: [6, 7, 8, 7] }),
            frameRate: 10,
            repeat: -1
        });
        this.createSkillAnimations();
    }

    createSkillAnimations() {
        for (let key in skills) {
            this.anims.create({
                key: key,
                frames: this.anims.generateFrameNumbers(key, { frames: skills[key].frames }),
                frameRate: skills[key].frameRate,
                hideOnComplete: skills[key].hideOnComplete
            });
        }
    }
    fire() {
        const arrow = this.bullets.create(this.container.x + 100, this.container.y, 'arrow');
        switch (this.direction) {
            case 'left':
                arrow.body.setVelocityX(-80);
                break;
            case 'up':
                arrow.body.setVelocityY(-80);
                break;
            case 'down':
                arrow.body.setVelocityY(80);
                break;
            default:
                arrow.body.setVelocityX(80);
        }
    }

    onDamaged(player, bullet) {
        //this.bullets.kill(bullet);
        //this.bullets.remove(bullet, true, true);
        bullet.destroy();
        console.log('on damaged');
    }

    onMeetEnemy(player, zone) {
        // we move the zone to some other location
        zone.x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
        zone.y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);

        // shake the world
        this.cameras.main.shake(300);

        //this.input.stopPropagation();
        // start battle 
        //this.scene.switch('BattleScene');
    }

    onUserDead({ playerId }) {
        console.log('onUserDead', playerId);
        let playerContainer = this.otherPlayers.getChildren().find((player) => player.playerId === playerId);
        if (!playerContainer && this.socket.id === playerId) {
            playerContainer = this.container;
        }
        playerContainer.player.setAngle(90);
        this.time.addEvent({ delay: 1000, callback: () => playerContainer.destroy() });

        if (this.socket.id === playerId) {
            this.isAlive = false;
            //const effectText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Game Over', { color: "#df3508", fontSize: 100 });
            this.uiScene.events.emit("GameOver");
        }
    }

    updatePlayers(players) {

        this.otherPlayers.getChildren().forEach(function (player) {
            if (players[player.playerId]) {
                player.flipX = players[player.playerId].flipX;
                this.physics.moveTo(player, players[player.playerId].x, players[player.playerId].y, null, 66);
            }
        }.bind(this));
        this.physics.moveTo(this.container, players[this.socket.id].x, players[this.socket.id].y, null, 66);
        console.log('update ', players[this.socket.id].x, players[this.socket.id].y);
    }
    update(time, delta) {
        if (this.container && this.isAlive) {
            this.container.body.setVelocity(0);

            // Horizontal movement
            if (this.cursors.left.isDown) {
                this.container.body.setVelocityX(-80);
                this.direction = 'left';
            }
            else if (this.cursors.right.isDown) {
                this.container.body.setVelocityX(80);
                this.direction = 'right';
            }
            // Vertical movement
            if (this.cursors.up.isDown) {
                this.container.body.setVelocityY(-80);
                this.direction = 'up';
            }
            else if (this.cursors.down.isDown) {
                this.container.body.setVelocityY(80);
                this.direction = 'down';
            }

            // Update the animation last and give left/right animations precedence over up/down animations
            if (this.cursors.left.isDown) {
                this.player.anims.play('left', true);
                this.player.anim = 'left';
                //this.player.flipX = true;
            }
            else if (this.cursors.right.isDown) {
                this.player.anims.play('right', true);
                this.player.anim = 'right';
                //this.player.flipX = false;
            }
            else if (this.cursors.up.isDown) {
                this.player.anims.play('up', true);
                this.player.anim = 'up';
            }
            else if (this.cursors.down.isDown) {
                this.player.anims.play('down', true);
                this.player.anim = 'down';
            }
            else {
                this.player.anims.stop();
                this.player.anim = 'stop';
            }

            // emit player movement
            var x = this.container.x;
            var y = this.container.y;
            var flipX = this.player.flipX;
            if (this.container.oldPosition && (x !== this.container.oldPosition.x || y !== this.container.oldPosition.y || flipX !== this.container.oldPosition.flipX)) {
                this.socket.emit('playerMovement', { x, y, flipX, anim: this.player.anim });
            }
            // save old position data
            this.container.oldPosition = {
                x: this.container.x,
                y: this.container.y,
                flipX: this.player.flipX
            };
        }
        if (this.currentSkill !== undefined && this.skillArea) {
            const skill = this.skills[this.currentSkill];
            const distance = Phaser.Math.Distance.Between(this.container.x, this.container.y, this.input.activePointer.worldX, this.input.activePointer.worldY);
            if (distance > skill.distance && this.skillArea.color !== 'red') {
                this.skillArea.clear();
                this.skillArea.lineStyle(1, 0xed112b);
                this.skillArea.strokeCircle(0, 0, skill.area);
                this.skillArea.color = 'red';
                console.log('out ' + this.input.activePointer.worldX);
            }
            if (distance <= skill.distance && this.skillArea.color !== 'green') {
                this.skillArea.clear();
                this.skillArea.lineStyle(1, 0x0ab212);
                this.skillArea.strokeCircle(0, 0, skill.area);
                this.skillArea.color = 'green';
                console.log('in ' + this.input.activePointer.worldX);
            }
        }
        if (this.skillArea) {
            this.skillArea.setPosition(this.input.activePointer.worldX, this.input.activePointer.worldY);
        }
    }

}

export { BootScene, WorldScene };