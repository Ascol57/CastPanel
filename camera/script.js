const config = window.API.getSettings();

navigator.mediaDevices.enumerateDevices().then(function (devices) {
    options = [];

    for (var i = 0; i < devices.length; i++) {
        var device = devices[i];
        if (device.kind === 'videoinput') {
            options.push(device);
        }
    };
    id = options.find(e => e.label.includes("OBS")).deviceId;

    var constraints = {};
    constraints.video = {
        optional: [{ sourceId: id }]
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function (stream) {
            document.getElementById('camera').srcObject = stream;
        }).catch(function () {
            alert('could not connect stream');
        });
});