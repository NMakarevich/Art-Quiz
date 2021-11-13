import SettingsScreen from './js/settingsScreen';
import StartScreen from './js/startScreen'
import './sass/style.scss'

const container = document.querySelector('.container');

let startScreen = new StartScreen();
container.append(startScreen.elem);

document.addEventListener('open-settings', () => {
  const settingsScreen = new SettingsScreen();
  settingsScreen.render();
  startScreen.destroy();
  startScreen.elem.addEventListener('animationend', () => container.append(settingsScreen.elem))
  document.addEventListener('close-settings', () => {
    startScreen = new StartScreen();
    settingsScreen.destroy();
    settingsScreen.elem.addEventListener('animationend', () => container.append(startScreen.elem))
  })
})
