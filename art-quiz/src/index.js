import SettingsScreen from './js/settingsScreen';
import StartScreen from './js/startScreen'
import './sass/style.scss'

const container = document.querySelector('.container');

const startScreen = new StartScreen();
container.append(startScreen.elem);

document.addEventListener('open-settings', () => {
  const settingsScreen = new SettingsScreen();
  settingsScreen.render();
  startScreen.destroy();
  startScreen.elem.addEventListener('animationend', () => container.append(settingsScreen.elem))
  document.addEventListener('close-settings', () => {
    startScreen.render();
    settingsScreen.destroy();
    settingsScreen.elem.addEventListener('animationend', () => container.append(startScreen.elem))
  })
})

startScreen.elem.addEventListener('select-quiz', (event) => {
  console.log(event.detail)
})