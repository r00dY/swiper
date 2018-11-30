let EventSystem = {

    register: function(object) {

        // Init events
        object._eventListeners = {};
        object._eventsBlocked = false;

        object.addEventListener = function(event, callback) {
            if (!object._eventListeners.hasOwnProperty(event)) { throw `Unknown event listener name: ${event}`; }

            object._eventListeners[event].push(callback);
        };

        object.removeEventListener = function(event, callback) {
            if (!object._eventListeners.hasOwnProperty(event)) { throw `Unknown event listener name: ${event}`; }

            let index = object._eventListeners[event].indexOf(callback);
            if (index > -1) {
                object._eventListeners[event].splice(index, 1);
            }
        };

        object._runEventListeners = function(event) {
            if (object._eventsBlocked) {
                return;
            }

            let args = Array.prototype.slice.call(arguments).slice(1);

            if (!object._eventListeners[event]) {
                console.log(object);
                console.log(event);
            }
            object._eventListeners[event].forEach((callback) => {
                callback(...args);
            });
        };

        object.blockEvents = function() {
            object._eventsBlocked = true;
        };

        object.unblockEvents = function() {
            object._eventsBlocked = false;
        };

    },

    addEvent: function(object, event) {
        object._eventListeners[event] = [];
    }
};

export default EventSystem;