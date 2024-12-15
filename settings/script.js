var config = window.API.getSettings();

document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    for (const [key, value] of formData.entries()) {
        if (key.startsWith('obs-')) {
            config.OBS[key.split('-')[1]] = value;
        } else if (key.startsWith('castmate-')) {
            config.Castmate[key.split('-')[1]] = value;
        } else if (key.startsWith('twitch-')) {
            config.Twitch[key.split('-')[1]] = value;
        } else {
            config[key] = value;
        }
    }
    window.API.saveSettings(config);
});

document.querySelector('form #obs-Address').value = config.OBS.Address;
document.querySelector('form #obs-Port').value = config.OBS.Port;
document.querySelector('form #obs-Password').value = config.OBS.Password;
document.querySelector('form #NetInterface').value = config.NetInterface;
document.querySelector('form #castmate-Address').value = config.Castmate.Address;
document.querySelector('form #castmate-Port').value = config.Castmate.Port;
document.querySelector('form #twitch-Channel').value = config.Twitch.Channel;