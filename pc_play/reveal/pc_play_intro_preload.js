const { ipcRenderer } = require('electron');

window.addEventListener('close_tutorial', (event) => {
    console.log('close_tutorial', event.detail)
    ipcRenderer.send('close_tutorial', event.detail)
})