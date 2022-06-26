const images = {};
const imageSources = {
  'background':       './img/Pellet Town.png',
  'foreground':       './img/foregroundObjects.png',
  'playerDown':       './img/playerDown.png',
  'playerLeft':       './img/playerLeft.png',
  'playerRight':      './img/playerRight.png',
  'playerUp':         './img/playerUp.png',
  'oldMan':           './img/oldMan/Idle.png',
  'villager':         './img/villager/Idle.png',
  'battleBackground': './img/battleBackground.png',
  'draggleSprite':    './img/draggleSprite.png',
  'embySprite':       './img/embySprite.png',
  'fireball':         './img/fireball.png',
};
Object.keys(imageSources).forEach(k => {
  images[k] = new Image()
})

function loadImages(callback) {
  Promise.all(
    Object.entries(imageSources).map(([k, filename], i) => {
      return new Promise((resolve, reject) => {
          images[k].addEventListener('load', () => {
            resolve([filename, images[k]])
          });
          images[k].src = filename
      })
    })
  ).then((values) => {
    console.log('%c\u2713%c Loaded all %d images', 'font-weight: bold; color: #99CC99', 'color: black', values.length)
    callback()
  })
}
