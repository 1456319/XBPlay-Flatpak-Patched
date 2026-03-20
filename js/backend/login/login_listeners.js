const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
   console.warn('preload DOMContentLoaded')
})

window.addEventListener('showLoadingOverlay', () => {
   showLoadingOverlay()
})

window.addEventListener('msal', (event) => {
   console.warn('Found Token')
   ipcRenderer.send('msal', event.detail)
})

window.addEventListener('close-login', (event) => {
   console.warn('Closing Login')
   ipcRenderer.send('close-login', event.detail)
})

let loadingOverlayCooldown = null
function hideLoadingOverlay() {
   console.error('hideLoadingOverlay');

   // show window (if in background mode) after 5 seconds of consistently being on the login page
   clearTimeout(loadingOverlayCooldown)
   loadingOverlayCooldown = setTimeout(() => {
      if (!document.getElementById('loading-overlay-test123')){
         ipcRenderer.send('hide-overlay-popup')
      }
   }, 5000)

   if (!document.getElementById('loading-overlay-test123')){
      return;
   }
   document.getElementById('loading-overlay-test123').remove();
}

function showLoadingOverlay() {
   console.error('showLoadingOverlay (DISABLED)');
   return;
}

function showCloseButton() {
   try {
      var button = document.createElement("button");
      button.innerHTML = "ABORT";
      button.style.cssText = "font-size: 18px; position:absolute; left:20%; bottom: 1%; width: 60%; height: 10%; z-index:10001; background-color: #e7e7e7; color: black;"

      // 2. Append somewhere
      document.body.appendChild(button);

      // 3. Add event handler
      button.addEventListener ("click", function() {
         window.dispatchEvent(new CustomEvent("close-login", {
            detail: { data: true }
         }));
      });

   } catch (err){
      console.error(err)
   }
}

document.onreadystatechange = () => {
   try {
      const url = window.location.href;
      if (url.includes('login.live.com') || (url.toLowerCase().includes('https://www.xbox.com/en-us/auth/msa') && !url.toLowerCase().includes('https://www.xbox.com/en-us/auth/msa?action=loggedin&locale_hint='))){
         hideLoadingOverlay();
      } else {
         showLoadingOverlay();
      }

      showCloseButton();
   } catch (err){
      console.error(err);
   }
};