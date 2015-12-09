/* globals window, Phaser */

'use strict';

(function(window){
  var game = null,
      gameId = 'flappy-fox',
      gameSpeed = 200,
      gameWidth = window.innerWidth,
      gameHeight = window.innerHeight,
      gameScore = 0,
      gameState = {
        Boot: {
          preload: function(){
            // create background
            var bgBmp = game.add.bitmapData(gameWidth, gameHeight);
            var bgGrid = bgBmp.context.createLinearGradient(0, 0, 0, gameHeight);
            bgGrid.addColorStop(0, '#00cfff');
            bgGrid.addColorStop(1, '#EAEFF2');
            bgBmp.context.fillStyle=bgGrid;
            bgBmp.context.fillRect(0, 0, gameWidth, gameHeight);
            game.cache.addBitmapData('bg', bgBmp);

            // load fox icon
            game.load.image('fox', 'img/firefox.png');
            // load tree icon
            game.load.image('cloud', 'img/cloud.png');
          },
          create: function(){
            this.state.start('Menu');
          }
        },
        Menu: {
          create: function(){
            game.add.sprite(0, 0, game.cache.getBitmapData('bg'));

            var text = game.add.text(
              game.world.centerX,
              game.world.centerY,
              'Click to PLAY =>',
              {
                font: '36px Arial',
                fill: '#ff0044',
                align: 'center'
              }
            );
            text.anchor.set(0.5);

            if(gameScore !== 0 ) {
              var textScore = game.add.text(
                game.world.centerX,
                game.world.centerY - 400,
                'Height Score: ' + gameScore,
                {
                  font: '64px Arial',
                  fill: '#fff',
                  align: 'center'
                }
              );

              textScore.anchor.set(0.5);
            }
            game.input.keyboard.onDownCallback = this.play.bind(this);
          },
          play: function(){
            this.state.start('Play');
          }
        },
        Play: {
          create: function(){
            game.add.sprite(0, 0, game.cache.getBitmapData('bg'));

            game.physics.startSystem(Phaser.Physics.ARCADE);

            this.score = 0;
            this.scoreLabel = game.add.text(20, 20, '0', {
              font: '48px Arial',
              fill: '#fff'
            });

            this.fox = game.add.sprite(128, 128, 'fox');
            game.physics.arcade.enable(this.fox);
            this.fox.body.gravity.y = 1000;

            this.trees = game.add.group();
            this.trees.enableBody = true;
            this.trees.createMultiple(50, 'cloud');

            game.input.keyboard.onDownCallback = this.jump.bind(this);

            this.generateTree();
            this.GenTreeTimer = game.time.events.loop(3000, this.generateTree, this);
           },

          update: function(){
            if (this.fox.angle < 20){
              this.fox.angle += 1;
            }
            if (this.fox.inWorld === false){
              this.state.start('Menu');
            }

            game.physics.arcade.overlap(this.fox, this.trees, this.collision, null, this);
          },

          jump: function() {
            this.fox.body.velocity.y = -400;
            game.add.tween(this.fox).to({angle: -20}, 100).start();
          },

          generateTree: function(){
            var column = gameHeight / 128,
                tree = null,
                hole = Math.floor(Math.random() * column) + 1;
            for (var i = 0; i < column; i++){
              if (i != hole && i != hole + 1){
                tree = this.trees.getFirstDead();
                tree.reset(gameWidth-10, (i * 128));
                tree.body.velocity.x = -1 * (gameSpeed);
                tree.checkWorldBounds = true;
                tree.outOfBoundsKill = true;
              }
            }
            this.gainScore();
          },

          gainScore: function(){
            this.score += 1;
            this.scoreLabel.text = this.score;
          },

          collision: function(){
            game.input.keyboard.onDownCallback = null;
            game.time.events.remove(this.GenTreeTimer);
            this.trees.forEachAlive(function(t){
              t.body.velocity.x = -50;
            }, this);
            this.fox.body.velocity.y = 600;
            game.add.tween(this.fox).to({angle: 90}, 1500).start();
            gameScore = this.score;
          }
        }
      };

  game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, gameId);
  game.state.add('Boot', gameState.Boot);
  game.state.add('Menu', gameState.Menu);
  game.state.add('Play', gameState.Play);
  game.state.start('Boot');
})(window);