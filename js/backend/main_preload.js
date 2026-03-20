const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {

    const btn = document.getElementById("xhome-tag")
    const btn2 = document.getElementById("xCloudButton")
    const btn3 = document.getElementById("gamepadOnlyButton")
    const btn4 = document.getElementById("gamepadBuilder")
    const btn5 = document.getElementById("login")
    const btn6 = document.getElementById("resetButton")
    const btn7 = document.getElementById("pcPlay")

    if (btn){
        btn.addEventListener("click", startXHomeButtonAction);
    } if (btn2){
        btn2.addEventListener("click", startXCloudButtonAction);
    } if (btn3){
        btn3.addEventListener("click", startGamepadOnlyButtonAction);
    } if (btn4){
        btn4.addEventListener("click", startGamepadBuilderButtonAction);
    } if (btn5){
        btn5.addEventListener("click", startLoginButtonAction);
    } if (btn6){
        btn6.addEventListener("click", startResetButtonAction);
    } if (btn7){
        btn7.addEventListener("click", startPcPlayButtonAction);
    }

    try {
        document.getElementById('toggleTypeButtonModal').addEventListener("click", quitGame);
        document.getElementById('toggleTypeButtonModal').innerText = 'Exit'
    } catch (err){}
})

window.addEventListener('login', (event) => {
    console.warn('Login')
    ipcRenderer.send('login', {requiresReload: true})
})
window.addEventListener('xalTokenUpdateRequest', (event) => {
    console.warn('xalTokenUpdateRequest')
    ipcRenderer.send('xalTokenUpdateRequest', event.detail)
})

ipcRenderer.on('hide-unlock', function (evt, message) {
    console.log('hide-unlock')
    if(document.getElementById('purchase')){
       document.getElementById('purchase').remove()
        document.getElementById('login').style.left = '32.5%'
    }
});

ipcRenderer.on('set-version', function (evt, message) {
    console.log('set-version', message)

    if (!message){
        return;
    }

    try {
        const versionDiv = document.getElementById('version-div')
        versionDiv.textContent = message
    } catch (err){
        console.error(err)
    }
});

ipcRenderer.on('set-steamcheck', function (evt, message) {
    console.log('set-steamcheck', message)

    try {
        const div = document.getElementById('steamcheck-div')
        div.textContent = `Steam Running: ${message}`
    } catch (err){
        console.error(err)
    }
});

// render processing hitting main process with a new language that was possibly updated from site and needs to be synced back to local
ipcRenderer.on('set-ui-language', async function (evt, message) {
    console.log('set-ui-language', message)

    if (!message){
        return;
    }

    try {
        const renderProcessUiLanguage = message
        const currentMainProcessUiLanguage = localStorage.getItem('settings_ui_language')

        if (renderProcessUiLanguage !== currentMainProcessUiLanguage){
            console.log('Detected render process and main process lang mismatch. Updating main process lang', renderProcessUiLanguage, currentMainProcessUiLanguage)
            localStorage.setItem('settings_ui_language', renderProcessUiLanguage)

            // Get the select element
            const uiLanguageElement = document.getElementById('settings_ui_language');
            if (uiLanguageElement) {
                // Update the value of the select element
                uiLanguageElement.value = renderProcessUiLanguage;

                // Manually trigger the `change` event
                const changeEvent = new Event('change');
                uiLanguageElement.dispatchEvent(changeEvent);
            } else {
                console.error('Element with ID "settings_ui_language" not found.');
            }
        }
    } catch (err){
        console.error(err)
    }
});

ipcRenderer.on('set-language', function (evt, message) {
    console.log('set-language', message)

    if (!message){
        return;
    }

    try {
        const lastUsedLanguage = message
        const dropdown = document.getElementById('xcloud-language')

        for (let i = 0; i < dropdown.length; i++) {

            if (lastUsedLanguage === dropdown[i].value) {
                dropdown[i].selected = true
                return;
            }
        }
    } catch (err){
        console.error(err)
    }
});

ipcRenderer.on('set-consoles', function (evt, message) {
    console.log('set-console', message)

    if (!message){
        return;
    }

    try {
        const consoleData = JSON.parse(message.consoles);
        const lastUsedConsole = message.lastUsed
        const dropdown = document.getElementById('xhome-console')

        dropdown.innerText = ''

        const consoleKeys = Object.keys(consoleData)
        for (let i = 0; i < consoleKeys.length; i++) {
            const option = document.createElement("option");

            option.value = consoleData[consoleKeys[i]];
            option.text = consoleKeys[i];
            if (lastUsedConsole === option.value) {
                option.selected = true
            }
            dropdown.appendChild(option);
        }

        if(!consoleKeys.length){
            const option = document.createElement("option");

            option.value = '';
            option.text = 'No Console - Login Required'
            option.disabled = true
            option.selected = true
            dropdown.appendChild(option);
        }
    } catch (err){
        console.error(err)
    }
});

ipcRenderer.on('set-regions', function (evt, message) {
    console.log('set-regions', message)
    if (!message){
        return;
    }

    try {
        const regionData = JSON.parse(message.regions);
        const defaultRegion = message.defaultRegion
        const selectedRegion = message.selectedRegion
        const dropdown = document.getElementById('xcloud-region')
        dropdown.innerText = ''

        for (let i = 0; i < regionData.length; i++) {
            const item = regionData[i]
            const option = document.createElement("option");
            option.value = item['baseUri']
            option.text = item['name']
            if (defaultRegion === option.value) {
                option.text += ' (Default)'
                if(selectedRegion === defaultRegion || !selectedRegion) {
                    option.selected = true
                }
            } else if (selectedRegion === option.value){
                option.selected = true
            }

            dropdown.appendChild(option);
        }

        if(!regionData.length){
            const option = document.createElement("option");
            option.value = '';
            option.text = 'Login Required'
            option.disabled = true   
            option.selected = true            
         
            dropdown.appendChild(option);
        }

    } catch (err){
        console.error(err)
    }
});

window.addEventListener('close_app', (event) => {
    console.warn('Close App')
    ipcRenderer.send('close_app', {})
})

// toggle logic
ipcRenderer.on('set-autologin-toggle', function (evt, message) {
    try {
        document.getElementById('auto_login').checked = (message['is_set']) ? 1 : 0
    } catch(err){}
});
window.addEventListener('auto_login_enable', (event) => {
    ipcRenderer.send('auto_login_toggle', {is_set: 1})
})
window.addEventListener('auto_login_disable', (event) => {
    ipcRenderer.send('auto_login_toggle', {is_set: 0})
})
window.addEventListener('settings_items_updated', (event) => {
    ipcRenderer.send('settings_items_updated', event.detail)
})


function quitGame(){
    ipcRenderer.send('quitGame')
}
function startXHomeButtonAction(){
    console.log('startXHomeButtonAction')
    const selectedConsole = document.getElementById('xhome-console').value
    console.log(selectedConsole)
    ipcRenderer.send('startXHome', selectedConsole)
}

function startXCloudButtonAction(){
    console.log('startXCloudButtonAction')

    const selectedRegion = document.getElementById('xcloud-region').value
    const selectedLanguage = document.getElementById('xcloud-language').value

    ipcRenderer.send('xCloudTitlePicker', {region: selectedRegion, language: selectedLanguage})
}

function startGamepadOnlyButtonAction(){
    console.log('startGamepadOnlyButtonAction')
    const selectedConsole = document.getElementById('xhome-console').value
    console.log(selectedConsole)
    ipcRenderer.send('startGamepadOnly', selectedConsole)
}
function startGamepadBuilderButtonAction(){
    console.log('startGamepadBuilderButtonAction')
    ipcRenderer.send('startGamepadBuilder')
}
function startLoginButtonAction(){
    console.log('startLoginButtonAction')
    let selectedOptionText = null
    try {
        const selectedRegionElement = document.getElementById('xcloud-region')
        const selectedIndex = selectedRegionElement.selectedIndex;
        const selectedOption = selectedRegionElement.options[selectedIndex];
        selectedOptionText = selectedOption.textContent;
    } catch (err) {
        console.log(err)
    }

    ipcRenderer.send('login', {'xcloud-region-name': selectedOptionText})
}

function startResetButtonAction(){
    console.log('startResetButtonAction')
    ipcRenderer.send('reset')
}

function startPcPlayButtonAction(){
    console.log('startPcPlayButtonAction')
    ipcRenderer.send('startPcPlay')
}

// NEEDED FOR ACTUAL SITE
window.addEventListener('quitGame', (event) => {
    console.warn('QuitGame')
    quitGame()
})

window.addEventListener('startXCloud', (event) => {
    console.warn('StartXCloud', event)
    ipcRenderer.send('startXCloud', event.detail.title)
})

window.addEventListener('steamStartXCloud', (event) => {
    console.warn('steamStartXCloud', event)
    ipcRenderer.send('steamStartXCloud', event.detail.data)
})

window.addEventListener('pwa_prompt_for_shortcut_creation', (event) => {
    console.warn('pwa_prompt_for_shortcut_creation', event)
    ipcRenderer.send('pwa_prompt_for_shortcut_creation', event.detail.data)
})

window.addEventListener('ui_language_update', (event) => {
    console.warn('ui_language_update', event)
    ipcRenderer.send('ui_language_update', event.detail.data)
})

window.addEventListener('downloadXCloudArtwork', (event) => {
    console.warn('downloadXCloudArtwork', event.detail)
    ipcRenderer.send('downloadXCloudArtwork', {})
})

window.addEventListener('show_gpu_settings', (event) => {
    console.warn('show_gpu_settings', event.detail)
    ipcRenderer.send('show_gpu_settings', {})
})

window.addEventListener('save_xcloud_images', (event) => {
    console.warn('save_xcloud_images', event)
    ipcRenderer.send('saveXCloudImages', event.detail)
})

window.addEventListener('custom_log', (event) => {
    console.warn('custom_log', event)
    ipcRenderer.send('custom_log', event.detail)
})