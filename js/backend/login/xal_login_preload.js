const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
   if (!window.location.href.includes('/steam/login/login_page.html')){
      showCloseButton()
   }
});

function showCloseButton() {
   try {
      const button = document.createElement("button");
      button.innerHTML = "ABORT";
      button.style.cssText = "border-radius: 5px; font-size: 18px; position:absolute; left:20%; top: 1%; width: 60%; height: 7%; z-index:10001; background-color: white; color: black; border: 1px solid grey;"

      // 2. Append somewhere
      document.body.appendChild(button);

      // 3. Add event handler
      button.addEventListener ("click", function() {
         ipcRenderer.send('close-login')
      });

   } catch (err){
      console.error(err)
   }
}


// for steam QR code login page
window.addEventListener('login_clicked', () => {
   ipcRenderer.send('manual_login_clicked')
});

window.addEventListener('close', () => {
   ipcRenderer.send('close-login')
});

window.addEventListener('tokens_received', (event) => {
   ipcRenderer.send('tokens_received', event.detail)
});