/* global Module

/* Magic Mirror
 * Module: LedStripControl
 *
 * By Tom Hirschberger
 * MIT Licensed.
 */
Module.register('MMM-LedStripControl', {

  defaults: {
  },

  getStyles: function() {
    return ['ledstripcontrol.css']
  },

  getDom: function() {
    const self = this
    const wrapper = document.createElement('div')
    return wrapper;
  },

  start: function () {
    const self = this
    Log.info("Starting module: " + self.name);
    self.sendSocketNotification('CONFIG', self.config)
  },

  notificationReceived: function (notification, payload) {
    const self = this
  },

  socketNotificationReceived: function (notification, payload) {
    const self = this
  },
})
