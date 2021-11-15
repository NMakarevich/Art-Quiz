import Levels from './js/levelsScreen';
import SettingsScreen from './js/settingsScreen';
import StartScreen from './js/startScreen'
import './sass/style.scss'

const container = document.querySelector('.container');

const startScreen = new StartScreen();
const settingsScreen = new SettingsScreen();
let levels;
container.append(startScreen.elem);

let settingsSource;

document.addEventListener('open-settings', (event) => {
  settingsScreen.render();
  settingsSource = event.detail;
  settingsSource.destroy();
  settingsSource.elem.addEventListener('animationend', () => container.append(settingsScreen.elem))
})

document.addEventListener('close-settings', () => {
  settingsSource.render();
  settingsScreen.destroy();
  settingsScreen.elem.addEventListener('animationend', () => container.append(settingsSource.elem))
})

document.addEventListener('select-quiz', async (event) => {
  levels = new Levels(event.detail);
  await levels.render();
  startScreen.destroy();
  startScreen.elem.addEventListener('animationend', () => container.append(levels.elem))
})

document.addEventListener('to-start', () => {
  startScreen.render();
  levels.destroy();
  levels.elem.addEventListener('animationend', () => container.append(startScreen.elem))
})

document.addEventListener('run-quiz', (event) => {

})