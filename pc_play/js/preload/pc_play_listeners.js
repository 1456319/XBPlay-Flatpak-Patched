const { ipcRenderer } = require('electron');

// RECEIVES DATA FROM RENDER, SENDS TO FRONTEND
ipcRenderer.on('load_saved_hosts', (event, data) => {
    window.dispatchEvent(new CustomEvent('load_saved_hosts', {
        detail: data
    }));
});

ipcRenderer.on('update_pc_play_installed_text', (event, data) => {
    window.dispatchEvent(new CustomEvent('update_pc_play_installed_text', {
        detail: data
    }));
});

ipcRenderer.on('show_toast', (event, data) => {
    window.dispatchEvent(new CustomEvent('show_toast', {
        detail: data
    }));
});

ipcRenderer.on('set_loading_visibility', (event, data) => {
    window.dispatchEvent(new CustomEvent('set_loading_visibility', {
        detail: data
    }));
});
ipcRenderer.on('download_percent', (event, data) => {
    window.dispatchEvent(new CustomEvent('download_percent', {
        detail: data
    }));
});

ipcRenderer.on('load_app_list', (event, data) => {
    window.dispatchEvent(new CustomEvent('load_app_list', {
        detail: data
    }));
});
ipcRenderer.on('close_app', (event, data) => {
    ipcRenderer.send('close_app', data)
});

// BELOW SENDS DATA TO RENDERER FROM FRONTEND
window.addEventListener('host_list_apps', (event) => {
    console.log('host_list_apps', event.detail)
    ipcRenderer.send('host_list_apps', event.detail)
})
window.addEventListener('host_open_client', (event) => {
    console.log('host_open_client', event.detail)
    ipcRenderer.send('host_open_client', event.detail)
})
window.addEventListener('host_added', (event) => {
    console.log('host_added', event.detail)
    ipcRenderer.send('host_added', event.detail)
})
window.addEventListener('host_search', (event) => {
    console.log('host_search', event.detail)
    ipcRenderer.send('host_search', event.detail)
})
window.addEventListener('host_delete', (event) => {
    console.log('host_delete', event.detail)
    ipcRenderer.send('host_delete', event.detail)
})
window.addEventListener('host_connect', (event) => {
    console.log('host_connect', event.detail)
    ipcRenderer.send('host_connect', event.detail)
})
window.addEventListener('start_stream', (event) => {
    console.log('start_stream', event.detail)
    ipcRenderer.send('start_stream', event.detail)
})
window.addEventListener('close_pc_play', (event) => {
    console.log('close_pc_play', event.detail)
    ipcRenderer.send('close_pc_play', event.detail)
})
window.addEventListener('close_pc_play_title_picker', (event) => {
    console.log('close_pc_play_title_picker', event.detail)
    ipcRenderer.send('close_pc_play_title_picker', event.detail)
})
window.addEventListener('configure_client', (event) => {
    console.log('configure_client', event.detail)
    ipcRenderer.send('configure_client', event.detail)
})
window.addEventListener('uninstall_client', (event) => {
    console.log('uninstall_client', event.detail)
    ipcRenderer.send('uninstall_client', event.detail)
})
window.addEventListener('settings_items_updated', (event) => {
    ipcRenderer.send('settings_items_updated', event.detail)
})