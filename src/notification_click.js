const NEW_REQUEST = 'NEW_REQUEST'
const NEW_DIALOGUE = 'NEW_DIALOGUE'

importScripts('./ngsw-worker.js');

(function () {
    'use strict';

    self.addEventListener('notificationclick', (event) => {
        let notification = event.notification.data;
        if (clients.openWindow) {
            let origin = event.currentTarget.location.origin;
            if (notification.type === NEW_DIALOGUE){
                clients.openWindow(origin + `/#/dialogue/${notification.dialogue._id}`);
            } else if (notification.type === NEW_REQUEST){
                clients.openWindow(origin + `/#/channel/${notification.channel._id}`);
            }
        }
    });}
());
