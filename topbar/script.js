config = window.API.getSettings();

const obs = new OBSWebSocket();

class OBSStatusClass {
    streaming = false;
    recording = false;

    constructor() {
        this.refresh()
    }

    setStreaming(status) {
        this.streaming = status;
        this.refresh()
    }

    setRecording(status) {
        this.recording = status;
        this.refresh()
    }

    refresh() {
        if (this.streaming) {
            document.querySelector('.streaming').classList.add('active');
        } else {
            document.querySelector('.streaming').classList.remove('active');
        }
        if (this.recording) {
            document.querySelector('.recording').classList.add('active');
        } else {
            document.querySelector('.recording').classList.remove('active');
        }
        document.querySelector('.streaming').innerText = this.streaming ? 'Streaming' : 'Not streaming';
        document.querySelector('.recording').innerText = this.recording ? 'Recording' : 'Not recording';
    }
}

var OBSstatus = new OBSStatusClass();

obs.connect(`ws://${config.OBS.Address}:${config.OBS.Port}`, config.OBS.Password).then(async() => {
    OBSstatus.setStreaming((await obs.call('GetStreamStatus')).outputActive);
    OBSstatus.setRecording((await obs.call('GetRecordStatus')).outputActive);
    obs.call('StartVirtualCam');

    document.querySelector('.streaming').addEventListener('click', () => {
        console.log('click');
        obs.call('ToggleStream');
    });

    document.querySelector('.recording').addEventListener('click', () => {
        console.log('click');
        obs.call('ToggleRecord');
    });

    obs.on('StreamStateChanged', (data) => {
        OBSstatus.setStreaming(data.outputActive);
    });

    obs.on('RecordingStateChanged', (data) => {
        OBSstatus.setRecording(data.outputActive);
    });
});


document.querySelector('.settings').innerText = "Settings";
document.querySelector('.settings').addEventListener('click', () => {
    window.open('../settings/index.html');
});

console.log("renderer.js loaded")