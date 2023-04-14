import Phaser from 'phaser'

import Demo from './HelloWorldScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'app',
    backgroundColor: '#125555',
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 900 },
		},
	},
	scene: [Demo],
}

export default new Phaser.Game(config)
