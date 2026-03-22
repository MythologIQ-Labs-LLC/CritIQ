const eventBus = require('./core/event-bus');
const mainWindow = require('./ui/main-window');
const markupToolbar = require('./ui/markup-toolbar');
const screenshotPreview = require('./ui/screenshot-preview');
const noteInputPanel = require('./ui/note-input-panel');

mainWindow.init(eventBus);
markupToolbar.init(eventBus);
screenshotPreview.init(eventBus);
noteInputPanel.init(eventBus);
