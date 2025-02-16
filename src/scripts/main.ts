import '../style.css';
import { initGame } from './game';
import { changelogData } from './changelogData';

function updateLatestChanges() {
    const changesList = document.querySelector('#latest-updates');
    if (!changesList) return;

    const latestThree = changelogData.slice(0, 3);
    const changesHTML = latestThree
        .map(entry => `<li>v${entry.version} - ${entry.changes}</li>`)
        .join('');

    changesList.innerHTML = changesHTML + `
        <li>
            full changelog can be found <a href="./changelog.html">here</a>
        </li>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    initGame();
    updateLatestChanges();
});