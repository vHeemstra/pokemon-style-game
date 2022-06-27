const canvas = document.querySelector('canvas')
canvas.width = 1024
canvas.height = 576

const c = canvas.getContext('2d')
c.imageSmoothingEnabled = false

const offset = {
  x: -735,
  y: -650
}

const boundaries = []
for (let i = 0; i < collisions.length; i++ ) {
  if (collisions[i] === 1025) {
    const x = i % 70
    const y = (i - x) / 70
    boundaries.push(
      new Boundary({
        position: {
          x: x * Boundary.width + offset.x,
          y: y * Boundary.height + offset.y
        }
      })
    )
  }
}

const battleZones = []
for (let i = 0; i < battleZonesData.length; i++ ) {
  if (battleZonesData[i] === 1025) {
    const x = i % 70
    const y = (i - x) / 70
    battleZones.push(
      new Boundary({
        position: {
          x: x * Boundary.width + offset.x,
          y: y * Boundary.height + offset.y
        }
      })
    )
  }
}

const characters = []
for (let i = 0; i < charactersMapData.length; i++ ) {
  const x = i % 70
  const y = (i - x) / 70
  let symbol = charactersMapData[i]

  // 1026 === villager
  if (symbol === 1026) {
    characters.push(
      new Sprite({
        position: {
          x: x * Boundary.width + offset.x,
          y: y * Boundary.height + offset.y
        },
        image: images.villager,
        frames: {
          max: 4,
          hold: 60
        },
        scale: 3,
        animate: true
      })
    )
  }
  // 1031 === oldMan
  else if (symbol === 1031) {
    characters.push(
      new Sprite({
        position: {
          x: x * Boundary.width + offset.x,
          y: y * Boundary.height + offset.y
        },
        image: images.oldMan,
        frames: {
          max: 4,
          hold: 60
        },
        scale: 3
      })
    )
  }

  if (symbol !== 0) {
    boundaries.push(
      new Boundary({
        position: {
          x: x * Boundary.width + offset.x,
          y: y * Boundary.height + offset.y
        }
      })
    )
  }
}

const player = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 4 / 2,
    y: canvas.height / 2 - 68 / 2
  },
  image: images.playerDown,
  frames: {
    max: 4,
    hold: 10
  },
  sprites: {
    up: images.playerUp,
    left: images.playerLeft,
    right: images.playerRight,
    down: images.playerDown
  }
})

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: images.background
})

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: images.foreground
})

const movables = [
  background,
  ...boundaries,
  foreground,
  ...battleZones,
  ...characters
]

const renderables = [
  background,
  ...boundaries,
  ...battleZones,
  ...characters,
  player,
  foreground
]

const keys = {
  up: {
    pressed: false
  },
  left: {
    pressed: false
  },
  down: {
    pressed: false
  },
  right: {
    pressed: false
  }
}
let lastKey = ''
let clicked = false

const battle = {
  initiated: false
}

function animate() {
  const animationId = window.requestAnimationFrame(animate)

  let moving = true
  player.animate = false

  if (battle.initiated) return

  // activate a battle
  if (keys.up.pressed || keys.left.pressed || keys.down.pressed || keys.right.pressed) {
    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i]
      const overlappingArea = (
          Math.min(
            player.position.x + player.width,
            battleZone.position.x + battleZone.width
          ) -
          Math.max(player.position.x, battleZone.position.x)
        ) * (
          Math.min(
            player.position.y + player.height,
            battleZone.position.y + battleZone.height
          ) -
          Math.max(player.position.y, battleZone.position.y)
        )
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: battleZone
        })
        && overlappingArea > (player.width * player.height) / 2
        && Math.random() < 0.01
      ) {
        // deactivate current animation loop
        window.cancelAnimationFrame(animationId)

        audio.Map.stop()
        audio.initBattle.play()
        audio.battle.play()

        battle.initiated = true
        gsap.to('#overlappingDiv', {
          opacity: 1,
          repeat: 4,
          yoyo: true,
          duration: 0.4,
          onComplete() {
            // activate a new animation loop
            initBattle()
            animateBattle()
            gsap.to('#overlappingDiv', {
              opacity: 0,
              duration: 0.4
            })
          }
        })
        break
      }
    }
  }

  if (keys.up.pressed && lastKey === 'up') {
    player.animate = true
    player.image = player.sprites.up

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: 0, y: 3 }
    })

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + 3
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.y += 3
      })
  } else if (keys.left.pressed && lastKey === 'left') {
    player.animate = true
    player.image = player.sprites.left

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: 3, y: 0 }
    })

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x + 3,
              y: boundary.position.y
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.x += 3
      })
  } else if (keys.down.pressed && lastKey === 'down') {
    player.animate = true
    player.image = player.sprites.down

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: 0, y: -3 }
    })

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y - 3
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.y -= 3
      })
  } else if (keys.right.pressed && lastKey === 'right') {
    player.animate = true
    player.image = player.sprites.right

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: -3, y: 0 }
    })

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x - 3,
              y: boundary.position.y
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.x -= 3
      })
  }

  // draw current game state
  for (let i = 0; i < renderables.length; i++ ) {
    renderables[i].draw()
  }
}

function startGame() {
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'w':
      case 'ArrowUp':
        keys.up.pressed = true
        lastKey = 'up'
        break

      case 'a':
      case 'ArrowLeft':
        keys.left.pressed = true
        lastKey = 'left'
        break

      case 's':
      case 'ArrowDown':
        keys.down.pressed = true
        lastKey = 'down'
        break

      case 'd':
      case 'ArrowRight':
        keys.right.pressed = true
        lastKey = 'right'
        break
    }
  })

  window.addEventListener('keyup', (e) => {
    switch (e.key) {
      case 'w':
      case 'ArrowUp':
        keys.up.pressed = false
        break

      case 'a':
      case 'ArrowLeft':
        keys.left.pressed = false
        break

      case 's':
      case 'ArrowDown':
        keys.down.pressed = false
        break

      case 'd':
      case 'ArrowRight':
        keys.right.pressed = false
        break
    }
  })

  window.addEventListener('click', () => {
    if (!clicked) {
      audio.Map.play()
      clicked = true
    }
  })

  animate()
}

loadImages(() => {
  startGame()
})
