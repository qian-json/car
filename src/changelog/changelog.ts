import '../style.css';
import { changelogData } from './changelogData';

document.addEventListener('DOMContentLoaded', () => {
    const changelogList = document.querySelector('main ul');
    if (!changelogList) return;

    changelogList.innerHTML = changelogData
        .map(entry => `<li>v${entry.version}: ${entry.changes}</li>`)
        .join('');
});