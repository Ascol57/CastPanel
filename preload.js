/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

const { contextBridge } = require('electron')
const fs = require('fs');
const { get } = require('http');

contextBridge.exposeInMainWorld('API', {
    saveSettings: (config) => {
        fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
    },
    getSettings: () => {
        return JSON.parse(fs.readFileSync('config.json', 'utf-8'));
    }
})

console.log("preload.js loaded")