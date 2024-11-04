const config = window.API.getSettings();

const obs = new OBSWebSocket();

scenecomponent = "<div class='scene-buttons'></div>"

obs.connect(`ws://${config.OBS.Address}:${config.OBS.Port}`, config.OBS.Password).then(() => {
    console.log('Connection Opened')

    obs.call("BroadcastCustomEvent", { eventData: { type: "test", data: "data" } })

    obs.on('CustomEvent', data => {
        console.log(data)
    })

    obs.call("GetSceneList").then(data => {
        console.log(data.scenes)
        scenes = data.scenes
        scenes.forEach(scene => {
            button = document.createElement("button")
            button.innerHTML = scene.sceneName
            button.onclick = () => {
                obs.call("SetCurrentProgramScene", { "sceneName": scene.sceneName })
            }
            document.querySelector(".scenes").prepend(button)
        });
    })
});

function refreshButtons(params) {
    fetch(`http://${config.Castmate.Address}:${config.Castmate.Port}/plugins/remote/buttons`, {
        "headers": {
            "Access-Control-Allow-Origin": "*"
        },
        "method": "GET",
        "mode": "cors"
    }).then(res => res.json()).then(buttons => {
        document.querySelector(".actions").innerHTML = ""
        buttons.buttons.forEach(action => {
            button = document.createElement("button")
            button.innerHTML = action
            button.onclick = () => {
                fetch(`http://${config.Castmate.Address}:${config.Castmate.Port}/plugins/remote/buttons/press?button=${action}`, {
                    "headers": {
                        "Access-Control-Allow-Origin": "*"
                    },
                    "method": "POST",
                    "mode": "cors",
                })
            }
            document.querySelector(".actions").prepend(button)
        });
    })
}

setInterval(refreshButtons, 5000)

document.querySelector(".shareButton").onclick = () => {
    copyToClipboard(config.sharedURL)
    document.querySelector(".shareButton").innerHTML = "Copied!"
    document.querySelector(".shareButton").classList.add("copied")
    setTimeout(() => {
        document.querySelector(".shareButton").innerHTML = "Share"
        document.querySelector(".shareButton").classList.remove("copied")
    }, 2000)
}

async function copyToClipboard(textToCopy) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
  
      // Move the textarea outside the viewport to make it invisible
      textarea.style.position = 'absolute';
      textarea.style.left = '-99999999px';
  
      document.body.prepend(textarea);
  
      // highlight the content of the textarea element
      textarea.select();
  
      try {
        document.execCommand('copy');
      } catch (err) {
        console.log(err);
      } finally {
        textarea.remove();
      }
    }
  }