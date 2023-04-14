import * as Phaser from 'phaser';

export default class Demo extends Phaser.Scene
{

	platforms!: Phaser.Physics.Arcade.StaticGroup;
	player!: Phaser.Physics.Arcade.Sprite;
	cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	stars!: Phaser.Physics.Arcade.Group;
	score: number;
	scoreText!: Phaser.GameObjects.Text;
	bombs!: Phaser.Physics.Arcade.Group;
	gameOver: boolean;



    constructor ()
    {
        super('demo');
		this.score = 0;
		this.gameOver = false;
    }
	


    preload ()
    {
	this.load.image('sky', 'dist/assets/sky.png');
    this.load.image('ground', 'dist/assets/platform.png');
    this.load.image('star', 'dist/assets/star.png');
    this.load.image('bomb', 'dist/assets/bomb.png');
    this.load.spritesheet('dude', 
        'dist/assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
    }
	
    create ()
    {
		this.cursors = this.input.keyboard!.createCursorKeys();
		//this.scoreText = this.add.text(this, 16, 16, 'score: 0', { fontSize: '62px', color: '#fff' });
       
		this.add.image(400, 300, 'sky');
        this.add.image(400, 300, 'star');
		this.platforms = this.physics.add.staticGroup();
	
		this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
		this.platforms.create(600, 400, 'ground');
		this.platforms.create(50, 250, 'ground');
		this.platforms.create(750, 220, 'ground');

		this.player = this.physics.add.sprite(100, 450, 'dude')
		this.player.setBounce(0.2);
		this.player.setCollideWorldBounds(true);

		// this.physics.add.sprite(100, 450, 'dude').setBounce(0.2);
		// this.physics.add.sprite(100, 450, 'dude').setCollideWorldBounds(true);

		this.anims.create( {
			key: 'left',
			frames: this.anims.generateFrameNames('dude', { 
				start: 0,
				end: 3
			}),
				frameRate: 10,
				repeat: -1

		});

		this.anims.create( {
			key: 'turn',
			frames: [ {
				key: 'dude', frame: 4
			}],
			frameRate: 20
		});

		this.anims.create ( { 
			key: 'right',
			frames: this.anims.generateFrameNumbers('dude', {
				start: 5,
				end: 8
			}),
			frameRate: 10,
			repeat: -1
		});

		this.physics.add.collider(this.player, this.platforms)

		this.stars = this.physics.add.group( {
			key: 'star',
			repeat: 11,
			setXY: {x:12, y:0, stepX:70 }
		});
		this.stars.children.iterate(child => {
			let sprite = child as Phaser.Physics.Arcade.Sprite;
			sprite.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
			return null;
			
		})
		this.bombs = this.physics.add.group();
		this.physics.add.collider(this.bombs, this.platforms)
		this.physics.add.collider(this.bombs, this.player, this.hitBomb, undefined, this)

		this.physics.add.collider(this.stars, this.platforms)
		this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this)
		this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', color: '#000' });
    }
	
	hitBomb(player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
		bomb: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
		this.physics.pause();
		this.player.setTint(0xff0000);
		this.player.anims.play('turn');
		this.gameOver = true;
	}

	collectStar(player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
		star: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
		let sprite = star as Phaser.Physics.Arcade.Sprite;
		sprite.disableBody(true, true);
		this.score += 10;
		this.scoreText.setText('Score: ' + this.score);

		if(this.stars.countActive(true) === 0) {
			this.stars.children.iterate(child => {
				let sprite = child as Phaser.Physics.Arcade.Sprite;
				sprite.enableBody(true, sprite.x, 0, true, true);
				return null;
			});
		};

		var x = (this.player.x < 400) ? Phaser.Math.Between(400,800) : Phaser.Math.Between(0, 400);
		var bomb = this.bombs.create(x, 16, 'bomb');
		bomb.setBounce(1);
		bomb.setCollideWorldBounds(true);
		bomb.setVelocity(Phaser.Math.Between(-200, 200),20); 
	}

	update() 
	{
		if(this.cursors && this.cursors.left.isDown) {
			this.player.setVelocityX(-160);
			this.player.anims.play('left', true)
		}
		else if(this.cursors.right.isDown) {
			this.player.setVelocityX(160);
			this.player.anims.play('right', true);
		} else {
			this.player.setVelocityX(0);
			this.player.anims.play('turn')
		}
		if(this.cursors.up.isDown && this.player.body!.touching.down) {
			this.player.setVelocityY(-630)
		}
	}

}

// const config = {
//     type: Phaser.AUTO,
//     backgroundColor: '#125555',
//     width: 800,
//     height: 600,
//     scene: Demo,
// 	physics: {
// 		default: 'arcade',
// 		arcade: {
// 			gravity: { x: 900 },
// 		},
// 	},
// };

// const game = new Phaser.Game(config);