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
	WASD!: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };
	pointer!: Phaser.Input.Pointer;
	contextLost!: Phaser.Events.EventEmitter;
	projectiles!: Phaser.Physics.Arcade.Group;
	fire!: Phaser.Input.Pointer;

	

	createWASDKeys(input: Phaser.Input.InputPlugin) {
		if (!input.keyboard) {
			throw new Error('Keyboard input not enabled for scene');
		}
		return {
			W:
			input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
			A:
			input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
			S:
			input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
			D:
			input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
		}
	}

	createFireButton() {

		this.input.on('pointerdown', (pointer:Phaser.Input.Pointer) => {
			
			if(pointer.leftButtonDown()) {
				const angle = this.player.rotation;
				this.shootProjectile(angle);
				this.fire = pointer;
			}
		})
	}

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
    this.load.image('dude', 
        'dist/assets/dude.png')
	this.load.image('projectile', 'dist/assets/pewpew-1.png')
    }
	
    create ()
    {
		this.WASD = this.createWASDKeys(this.input);
		this.cursors = this.input.keyboard!.createCursorKeys();
		this.createFireButton()
		//this.scoreText = this.add.text(this, 16, 16, 'score: 0', { fontSize: '62px', color: '#fff' });
       
		this.add.image(400, 300, 'sky');
        this.add.image(400, 300, 'star');
		this.platforms = this.physics.add.staticGroup();
	
		this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
		this.platforms.create(600, 400, 'ground');
		this.platforms.create(50, 250, 'ground');
		this.platforms.create(750, 220, 'ground');

		this.player = this.physics.add.sprite(100, 450, 'dude')
		this.player.displayWidth = 80;
		this.player.displayHeight = 80;
		//this.player.setBounce(0.2);
		this.player.setCollideWorldBounds(true);
		this.player.setDrag(1000);

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
		this.physics.add.collider(this.bombs, this.player, this.hitBomb, undefined, this)
		this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this)
		this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', color: '#000' });
		this.projectiles = this.physics.add.group()
   
	}

	shootProjectile(angle: number) {
		let projectile = this.projectiles.create(this.player.x, this.player.y, 'projectile')
		let speed = 600;
		projectile.body.velocity.x = Math.cos(angle) * speed;
		console.log(Math.cos(angle))
		projectile.body.velocity.y = Math.sin(angle) * speed;
		console.log(Math.sin(angle))
		projectile.displayHeight = 15;
		projectile.displayWidth = 15;
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

		// if(this.stars.countActive(true) === 0) {
		// 	this.stars.children.iterate(child => {

		// 		let sprite = child as Phaser.Physics.Arcade.Sprite;
		// 		sprite.enableBody(true, sprite.x, 0, true, true);
		// 		return null;
		// 	});
		// };

		var x = (this.player.x < 400) ? Phaser.Math.Between(400,800) : Phaser.Math.Between(0, 400);
		var bomb = this.bombs.create(x, 16, 'bomb');
		bomb.setBounce(1);
		bomb.setCollideWorldBounds(true);
		bomb.setVelocity(Phaser.Math.Between(-200, 200),20); 
	}

	update() 
	{	

		// Update player rotation
        const pointer = this.input.activePointer;
        const angle = Phaser.Math.Angle.Between(
            this.player.x,
            this.player.y,
            pointer.x,
            pointer.y
        );
        this.player.setRotation(angle);
		
		
        // Update player velocity
        let newAngle;
		let speed = 500;

		if(this.WASD.W.isDown) {
           	newAngle = this.player.rotation;
			   
		} else if(this.WASD.S.isDown) {
			newAngle = this.player.rotation + Math.PI;
		} 
		
		if(this.WASD.A.isDown) {
			if(this.WASD.S.isDown) {
				newAngle = (newAngle !== undefined) ?
				(newAngle + Math.PI/4) : (this.player.rotation - Math.PI/2)
			} else {
				newAngle = (newAngle !== undefined) ?
				(newAngle - Math.PI/4) : (this.player.rotation - Math.PI/2)
			}

		} else if(this.WASD.D.isDown) {
			if(this.WASD.S.isDown) {
				newAngle = (newAngle !== undefined) ?
				(newAngle - Math.PI/4) : (this.player.rotation + Math.PI/2)
			} else {
				newAngle = (newAngle !== undefined) ?
				(newAngle + Math.PI/4) : (this.player.rotation + Math.PI/2)
		}
		} 

		if(newAngle !== undefined) {
			this.physics.velocityFromRotation(
				newAngle,
				speed,
				(<Phaser.Physics.Arcade.Body>this.player.body).velocity
			);
		} else {
			this.player.setVelocity(0)
		}

		//setting up bomb chasing after the player
		this.bombs.children.iterate((bomb:  Phaser.GameObjects.GameObject) => {
			let newBomb = bomb as Phaser.Physics.Arcade.Image
			let angle =
			Phaser.Math.Angle.Between(newBomb.x, newBomb.y, this.player.x, this.player.y);
			let velocity = new Phaser.Math.Vector2();
			velocity.setToPolar(angle, 100);//speed of the bomb

			newBomb.setVelocity(velocity.x, velocity.y);
			return null
		});

		

	}

}

