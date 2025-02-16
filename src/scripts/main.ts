import '../style.css';
import { initGame } from './game';
import { changelogData } from './changelogData';

function updateVersions() {
    // Update latest updates list
    const changesList = document.querySelector('#latest-updates');
    if (changesList) {
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

    // Update title version
    const titleElement = document.querySelector('h1');
    if (titleElement && changelogData.length > 0) {
        titleElement.textContent = `Ass Etocorsa v${changelogData[0].version}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initGame();
    updateVersions();
});