import * as Phaser from 'phaser';

export default class Demo extends Phaser.Scene
{

	platforms!: Phaser.Physics.Arcade.StaticGroup;
	player!: Phaser.Physics.Arcade.Sprite;
	cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	stars!: Phaser.Physics.Arcade.Group;
	timeRemaining!: number;
	timerText!: Phaser.GameObjects.Text;
	gameOverText!: Phaser.GameObjects.Text;
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
				this.shootProjectile(angle + Phaser.Math.DegToRad(-47));
				this.fire = pointer;
			}
		})
	}

    constructor ()
    {
        super('demo');
		
		this.gameOver = false;
		
    }
	


    preload ()
    {
	this.load.image('sky', 'dist/assets/sky.png');
    this.load.image('ground', 'dist/assets/platform.png');
    this.load.image('star', 'dist/assets/star.png');
    this.load.image('bomb', 'dist/assets/bomb.png');
    this.load.spritesheet('dude', 
        'dist/assets/dude.png', {frameWidth: 100, frameHeight: 100})
	this.load.image('projectile', 'dist/assets/pewpew-1.png')
    }
	
    create ()
    {
		this.WASD = this.createWASDKeys(this.input);
		this.cursors = this.input.keyboard!.createCursorKeys();
		this.createFireButton()
		
		this.add.image(400, 300, 'sky');
        this.add.image(400, 300, 'star');
		this.platforms = this.physics.add.staticGroup();
	
		this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
		this.platforms.create(600, 400, 'ground');
		this.platforms.create(50, 250, 'ground');
		this.platforms.create(750, 220, 'ground');

		this.player = this.physics.add.sprite(100, 450, 'dude')
		
		this.player.setFrame(0)
		this.player.setCollideWorldBounds(true);
		this.player.setDrag(1000);

		this.anims.create({
			key: 'alldirections',
			frames: this.anims.generateFrameNames('dude', { 
				start: 0,
				end: 2
			}),
				frameRate: 10,
				repeat: -1
		})
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

		this.time.addEvent({
			delay:3000,
			callback: () => {
				var x = (this.player.x < 400) ? Phaser.Math.Between(400,800) : Phaser.Math.Between(0, 400);
				var bomb = this.bombs.create(x, 16, 'bomb');
				bomb.setCollideWorldBounds(true);
				bomb.setVelocity(Phaser.Math.Between(-300, 800),200); 
			},
			loop:true
		});
		this.bombs = this.physics.add.group();
		this.projectiles = this.physics.add.group()
		this.physics.add.collider(this.bombs, this.player, this.hitBomb, undefined, this)
		this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this)
		this.physics.add.collider(this.projectiles, this.bombs, this.projectileHit, undefined, this)
		
		this.gameOverText = this.add.text(450, 100, "", {fontSize:'48px', color:'red'})

		this.timeRemaining = 30;
		this.timerText = this.add.text(16, 16, `Time: ${this.timeRemaining}`, { fontSize: '24px', color: '#fff' });
		this.time.addEvent({
			delay: 1000,
			callback: () => {
				this.timeRemaining--;
				this.timeRemaining > 0 ? this.timerText.setText(`Time: ${this.timeRemaining}`) :this.timerText.setText(`Time: 0`);
			},
			loop: true
		});
   
	}

	shootProjectile(angle: number) {
		let projectile = this.projectiles.create(this.player.x, this.player.y, 'projectile');
		projectile.rotation = angle + Math.PI / 2;
		let speed = 600;
		projectile.body.velocity.x = Math.cos(angle) * speed;
		projectile.body.velocity.y = Math.sin(angle) * speed;
		projectile.displayHeight = 15;
		projectile.displayWidth = 3;
	}
	
	hitBomb(player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
		bomb: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
		let bombSprite = bomb as Phaser.Physics.Arcade.Sprite;
		var color = Phaser.Display.Color.GetColor32(255, 0, 0, 0);
		bombSprite.disableBody(true, true)
		this.timeRemaining -= 10;
		this.player.anims.play('turn');
		this.player.setTintFill(color).setAlpha(0.5)
		
		this.time.addEvent({
			delay: 150,
			callback: () => {
				this.player.clearTint();
				this.player.setAlpha(1)
			}
		})

		
	}

	timeSystem() {
		if(this.timeRemaining <= 0) {
			this.physics.pause(); 
			this.gameOverText.setText("Game Over");
			this.player.setTintFill(0x1AFF0000)
			this.gameOver = true;
		}
	
	}

	projectileHit(projectile: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
		 bomb: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
		
			if(projectile && bomb) {
				let bombSprite = bomb as Phaser.Physics.Arcade.Sprite;
				let projectileSprite = projectile as Phaser.Physics.Arcade.Sprite;
				this.timeRemaining += 5;
				this.timerText.appendText("+5s")
				bombSprite.disableBody(true, true);
				projectileSprite.disableBody(true, true);

				const x = (bombSprite.x + projectileSprite.x) / 2;
				const y = (bombSprite.y + projectileSprite.y) / 2;

				const scoreTest = this.add.text(x,y, "+5s", {
					fontSize:'18px', 
					color:'red'
				})
				scoreTest.setOrigin(0.5, 0.5);

				this.time.delayedCall(1000, () => {
				scoreTest.destroy();
			})
        
			}

		}			
	collectStar(player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
		star: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {

		let sprite = star as Phaser.Physics.Arcade.Sprite;
		sprite.disableBody(true, true);
		this.timeRemaining += 6;
		// this.timerText.setText('Score: ' + this.timer);

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
		bomb.setVelocity(Phaser.Math.Between(-300, 800),200); 
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
        this.player.setRotation(angle + Phaser.Math.DegToRad(47));
		
		
        // Update player velocity
        let newAngle;
		let speed = 500;

		if(this.WASD.W.isDown) {
           	newAngle = this.player.rotation - Phaser.Math.DegToRad(47);
			this.player.anims.play('alldirections', true);
			   
		} else if(this.WASD.S.isDown) {
			newAngle = this.player.rotation + Math.PI - Phaser.Math.DegToRad(47);
			this.player.anims.play('alldirections', true);
		} 


		
		if(this.WASD.A.isDown) {
			if(this.WASD.S.isDown) {
				newAngle = (newAngle !== undefined) ?
				(newAngle + Math.PI/4 - Phaser.Math.DegToRad(47)) : (this.player.rotation - Math.PI/2 - Phaser.Math.DegToRad(47))
			} else {
				newAngle = (newAngle !== undefined) ?
				(newAngle - Math.PI/4 - Phaser.Math.DegToRad(47)) : (this.player.rotation - Math.PI/2 - Phaser.Math.DegToRad(47))
			}

		} else if(this.WASD.D.isDown) {
			if(this.WASD.S.isDown) {
				newAngle = (newAngle !== undefined) ?
				(newAngle - Math.PI/4 - Phaser.Math.DegToRad(47)) : (this.player.rotation + Math.PI/2 - Phaser.Math.DegToRad(47))
			} else {
				newAngle = (newAngle !== undefined) ?
				(newAngle + Math.PI/4 - Phaser.Math.DegToRad(47)) : (this.player.rotation + Math.PI/2 - Phaser.Math.DegToRad(47))
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
			velocity.setToPolar(angle, 300);//speed of the bomb

			newBomb.setVelocity(velocity.x, velocity.y);
			return null
		});
		this.timeSystem()
		

	}

}

