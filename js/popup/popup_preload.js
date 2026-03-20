const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
	console.log('loaded')
});

window.addEventListener('alertify', (event) => {
    console.warn('alertify', event.detail)
    ipcRenderer.send('alertify_confirm', {
        response: event.detail.response,
        canceled: event.detail.canceled ?? false,
        id: event.detail.id
    })
})