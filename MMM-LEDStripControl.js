/* global Module

/* Magic Mirror
 * Module: LEDStripControl
 *
 * By Tom Hirschberger
 * MIT Licensed.
 */  
Module.register('MMM-LEDStripControl', {

  defaults: {
    showPongOptions: true,
    showNormalColorOptions: true,
    showPongColorOptions: true,
    showColorIndicators: true,
    outputOnIcon: "fa fa-lightbulb-o",
    outputOffIcon: "fa fa-lightbulb-o",
    upIcon: "fa fa-angle-up",
    upFastIcon: "fa fa-angle-double-up",
    downIcon: "fa fa-angle-down",
    downFastIcon: "fa fa-angle-double-down",
    fetchStatusInterval: 30
  },

  suspend: function() {
    const self = this
    if(self.statusTimeout !== null){
       clearTimeout(self.statusTimeout)
       self.statusTimeout = null
    }
  },

  resume: function() {
    const self = this
    self.scheduleStatusUpdate()
  },

  scheduleStatusUpdate(){
    const self = this
    self.statusTimeout = setTimeout(()=>{
      self.sendNotification("LED_STRIP_CONTROL_FETCH_STATUS","dummy")
  
      self.statusTimeout = setTimeout(()=>{
        self.sendNotification("LED_STRIP_CONTROL_FETCH_STATUS","dummy")
      }, self.config.fetchStatusInterval * 1000)  
    }, self.config.fetchStatusInterval * 1000)
  },

  getStyles: function() {
    return ['font-awesome.css', 'ledstripcontrol.css']
  },

  getUpDownElement: function(key, cssClassPart){
    const self = this
    let wrapper = document.createElement('div')
      wrapper.className="lsc-up-down-wrapper "+cssClassPart

      let fastUp = document.createElement('i')
        fastUp.className = self.config.upFastIcon+" lsc-icon lsc-fastUp "+cssClassPart
        fastUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":key,"step":self.curValues[key].step_u_f})})
      wrapper.appendChild(fastUp)

      let up = document.createElement('i')
        up.className = self.config.upIcon+" lsc-icon lsc-up "+cssClassPart
        up.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":key,"step":self.curValues[key].step_u})})
      wrapper.appendChild(up)

      let value = document.createElement('div')
        value.className = "lsc-value "+cssClassPart

        if (self.curValues[key].selected == true){
          value.className += " lsc-selected"
        } else {
          value.className += " lsc-unselected"
        }

      self.curValues[key].obj = value
      self.elements.push(key)
      if (typeof self.curValues[key].fractions !== "undefined"){
        value.innerHTML = Number.parseFloat(self.curValues[key].value).toFixed(self.curValues[key].fractions)
      } else {
        value.innerHTML = self.curValues[key].value
      }
      
      wrapper.appendChild(value)

      let down = document.createElement('i')
        down.className = self.config.downIcon+" lsc-icon lsc-down "+cssClassPart
        down.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":key,"step":self.curValues[key].step_d})})
      wrapper.appendChild(down)

      let fastDown = document.createElement('i')
        fastDown.className = self.config.downFastIcon+" lsc-icon lsc-fastDown "+cssClassPart
        fastDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":key,"step":self.curValues[key].step_d_f})})
      wrapper.appendChild(fastDown)
    return wrapper
  },

  getColorDomObject: function(keyPrefix, header, cssClassPart){
    const self = this
    let colorWrapper = document.createElement('div')
      colorWrapper.className = "lsc-totalColorWrapper "+cssClassPart
      let colorHeaderLine = document.createElement('div')
        colorHeaderLine.className = "lsc-color-header "+cssClassPart
        colorHeaderLine.innerHTML = header
      colorWrapper.appendChild(colorHeaderLine)

      if (self.config.showColorIndicators){
        let colorIndicator = document.createElement('div')
          colorIndicator.className = "lsc-colorIndicator "+cssClassPart
          colorIndicator.style.background = "#"+self.fullColorHex(self.curValues[keyPrefix+"_r"].value, self.curValues[keyPrefix+"_g"].value, self.curValues[keyPrefix+"_b"].value)
        colorWrapper.appendChild(colorIndicator)
      }

      let colorOuterWrapper = document.createElement('div')
        colorOuterWrapper.className = "lsc-colorOuterWrapper "+cssClassPart
        //color red
        colorOuterWrapper.appendChild(self.getUpDownElement(keyPrefix+"_r", cssClassPart+"-red"))

        //color green
        colorOuterWrapper.appendChild(self.getUpDownElement(keyPrefix+"_g", cssClassPart+"-green"))

        //color blue
        colorOuterWrapper.appendChild(self.getUpDownElement(keyPrefix+"_b", cssClassPart+"-blue"))

      colorWrapper.appendChild(colorOuterWrapper)
    return colorWrapper
  },

  getOptionsDomObject: function(header, elements, cssClassPart){
    const self = this
    let wrapper = document.createElement('div')
      wrapper.className = "lsc-totalOptionsWrapper "+cssClassPart
          
      let optionsHeaderLine = document.createElement('div')
        optionsHeaderLine.className = "lsc-options-header "+cssClassPart
        optionsHeaderLine.innerHTML = header
      wrapper.appendChild(optionsHeaderLine)
          
      let optionsOuterWrapper = document.createElement('div')
        optionsOuterWrapper.className = "lsc-optionsOuterWrapper "+cssClassPart

        for (let curIdx in elements){
          let curElementKey = elements[curIdx][0]
          let curElementHeader = elements[curIdx][1]

          let optionsInnerWrapper = document.createElement('div')
            optionsInnerWrapper.className = "lsc-optionsInnerWrapper "+cssClassPart+"-"+curElementKey

            let optionsInnerHeader = document.createElement('div')
              optionsInnerHeader.className = "lsc-optionsInnerHeader "+cssClassPart+"-"+curElementKey
              optionsInnerHeader.innerHTML = curElementHeader
            optionsInnerWrapper.appendChild(optionsInnerHeader)

            optionsInnerWrapper.appendChild(self.getUpDownElement(curElementKey, cssClassPart+"-"+curElementKey))
          optionsOuterWrapper.appendChild(optionsInnerWrapper)
        }
      wrapper.append(optionsOuterWrapper)

      return wrapper
  },

  getDom: function() {
    const self = this
    self.elements = []
    let wrapper = document.createElement('div')
      wrapper.className = "lsc-rootWrapper"

      let outputWrapper = document.createElement('div')
        outputWrapper.className = "lsc-outputWrapper"
        let outputIcon = document.createElement('i')
        if(self.curValues["output"].value == true){
          outputIcon.className = self.config.outputOnIcon + " lsc-icon lsc-output lsc-output-on"
        } else {
          outputIcon.className = self.config.outputOffIcon + " lsc-icon lsc-output lsc-output-off"
        }

        if (self.curValues["output"].selected == true){
          outputIcon.className += " lsc-selected"
        } else {
          outputIcon.className += " lsc-unselected"
        }
        self.curValues["output"].obj = outputIcon
        outputIcon.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"output"})})
        self.elements.push("output")

        outputWrapper.appendChild(outputIcon)
      wrapper.appendChild(outputWrapper)

      if (self.config.showNormalColorOptions){
        wrapper.appendChild(self.getColorDomObject("color", "Color", "lsc-ncolor"))
      }

      if (self.config.showPongColorOptions){
        //color control of the pong colors
        wrapper.appendChild(self.getColorDomObject("pong_color", "Pong Color", "lsc-pcolor"))

        //color control of the pong result colors
        wrapper.appendChild(self.getColorDomObject("pong_result_color", "Pong Result Color", "lsc-rcolor"))
      }

      //pong options
      if (self.config.showPongOptions == true){
        let pGeneralOptionsElements = [
          ["pong_num_leds", "LEDs"],
          ["pong_max_wins", "Wins"],
          ["pong_tolerance", "Tolerance"]
        ]
        wrapper.append(self.getOptionsDomObject("Pong General", pGeneralOptionsElements, "lsc-pgeneral"))

        let pSpeedOptionsElements = [
          ["pong_init_delay", "Init"],
          ["pong_dec_per_run", "Decrement"],
          ["pong_min_delay", "Min"]
        ]
        wrapper.append(self.getOptionsDomObject("Pong Speed", pSpeedOptionsElements, "lsc-pspeed"))

        let pDelayOptionsElements = [
          ["pong_btn_delay", "Button"],
          ["pong_result_delay_during", "Result (D)"],
          ["pong_result_delay_after", "Result (A)"]
        ]
        wrapper.append(self.getOptionsDomObject("Pong Delay", pDelayOptionsElements, "lsc-pdelay"))
      }

    return wrapper;
  },

  start: function () {
    const self = this
    self.selectedElement = 0

    self.elements = []
    self.statusTimeout = null

    self.curValues = {
      "output" : {"value":false, "selected": true, "obj" : null},

      "color_r" : {"value":255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255, "selected": false, "obj" : null},
      "color_g" : {"value":255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255, "selected": false, "obj" : null},
      "color_b" : {"value":255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255, "selected": false, "obj" : null},

      "pong_color_r" : {"value": 0, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255, "selected": false, "obj" : null},
      "pong_color_g" : {"value": 0, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255, "selected": false, "obj" : null},
      "pong_color_b" : {"value": 255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255, "selected": false, "obj" : null},

      "pong_result_color_r" : {"value": 0, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255, "selected": false, "obj" : null},
      "pong_result_color_g" : {"value": 255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255, "selected": false, "obj" : null},
      "pong_result_color_b" : {"value": 0, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255, "selected": false, "obj" : null},

      "pong_init_delay" : {"value": 0.5, "step_u": 0.05, "step_d": 0.05, "step_u_f": 0.1, "step_d_f": 0.1, "min": 0.1, "fractions": 2,"selected": false, "obj" : null},
      "pong_dec_per_run" : {"value": 0.05, "step_u": 0.01, "step_d": 0.01, "step_u_f": 0.05, "step_d_f": 0.05, "min": 0, "fractions": 2, "selected": false, "obj" : null},
      "pong_min_delay" : {"value": 0.02, "step_u": 0.005, "step_d": 0.005, "step_u_f": 0.1, "step_d_f": 0.1, "min": 0.005, "fractions": 3, "selected": false, "obj" : null},

      "pong_num_leds" : {"value": 10, "step_u": 1, "step_d": 1, "step_u_f": 5, "step_d_f": 5, "min": 3, "selected": false, "obj" : null},
      "pong_max_wins" : {"value": 2, "step_u": 1, "step_d": 1, "step_u_f": 3, "step_d_f": 3, "min": 1, "selected": false, "obj" : null},
      "pong_tolerance" : {"value": 2, "step_u": 1, "step_d": 1, "step_u_f": 3, "step_d_f": 3, "min": 0, "selected": false, "obj" : null},

      "pong_result_delay_after" : {"value": 5, "step_u": 0.5, "step_d": 0.5, "step_u_f": 1, "step_d_f": 1, "min": 0.1, "fractions": 1, "selected": false, "obj" : null},
      "pong_result_delay_during" : {"value": 3, "step_u": 0.5, "step_d": 0.5, "step_u_f": 1, "step_d_f": 1, "min": 0, "fractions": 1, "selected": false, "obj" : null},
      "pong_btn_delay": {"value": 2, "step_u": 0.5, "step_d": 0.5, "step_u_f": 1, "step_d_f": 1, "min": 0.5, "fractions": 1, "selected": false, "obj" : null},
    };

    for (let key in self.curValues){
      console.log("Checking config for key: "+key)
      if (typeof self.config[key] !== "undefined"){
        if (typeof self.config[key].value !== "undefined"){
          console.log("Setting value of key: "+key+" to "+self.config[key].value)
          self.curValues[key].value = self.config[key].value
        }
  
        if (typeof self.config[key].step_u !== "undefined"){
          self.curValues[key].step_u = self.config[key].step_u
        }
  
        if (typeof self.config[key].step_d !== "undefined"){
          self.curValues[key].step_d = self.config[key].step_d
        }
  
        if (typeof self.config[key].step_u_f !== "undefined"){
          self.curValues[key].step_u_f = self.config[key].step_u_f
        }
  
        if (typeof self.config[key].step_d_f !== "undefined"){
          self.curValues[key].step_d_f = self.config[key].step_d_f
        }
  
        if (typeof self.config[key].min !== "undefined"){
          self.curValues[key].min = self.config[key].min
        }
  
        if (typeof self.config[key].max !== "undefined"){
          self.curValues[key].max = self.config[key].max
        }
      }
    }

    Log.info("Starting module: " + self.name);
    self.sendSocketNotification('CONFIG', self.config)

    self.scheduleStatusUpdate()

    setTimeout(()=>{
      self.sendNotification("LED_STRIP_CONTROL_FETCH_STATUS","dummy")
    }, 1000)
  },

  notificationReceived: function (notification, payload) {
    const self = this

    if (notification === "LED_STRIP_CONTROL_NEXT_ELEMENT"){
      console.log("Changing to next element")
      self.curValues[self.elements[self.selectedElement]].selected = false
      self.selectedElement += 1

      if (self.selectedElement >= self.elements.length){
        self.selectedElement = 0
      }
      console.log("Changing to element: "+self.selectedElement+ " which is: "+self.elements[self.selectedElement])
      self.curValues[self.elements[self.selectedElement]].selected = true
      self.updateDom()
    } else if (notification === "LED_STRIP_CONTROL_PREVIOUS_ELEMENT"){
      self.curValues[self.elements[self.selectedElement]].selected = false
      self.selectedElement -= 1
      
      if (self.selectedElement < 0){
        self.selectedElement = self.elements.length-1
      }
      console.log("Changing to element: "+self.selectedElement+ " which is: "+self.elements[self.selectedElement])
      self.curValues[self.elements[self.selectedElement]].selected = true
      self.updateDom()
    } else if (notification === "LED_STRIP_CONTROL_DECREASE_VALUE"){
      let abort = false
      if (typeof payload.element !== "undefined"){
        if (self.elements[self.selectedElement] !== payload.element){
          let newIdx = self.elements.indexOf(payload.element)
          if(newIdx >= 0){
            self.curValues[self.elements[self.selectedElement]].selected = false
            self.selectedElement = newIdx
            self.curValues[self.elements[self.selectedElement]].selected = true
          } else {
            console.log("Could not find specified element. Aborting!")
            abort = true
          }
        }
      }

      if (!abort){
        console.log("Decreasing the value of element: "+self.elements[self.selectedElement])
        if (typeof self.curValues[self.elements[self.selectedElement]].value === "boolean"){
          self.curValues[self.elements[self.selectedElement]].value = !self.curValues[self.elements[self.selectedElement]].value
        } else {
          let step = self.curValues[self.elements[self.selectedElement]].step_d
          if (typeof payload.step !== "undefined"){
            step = payload.step
          }
          self.curValues[self.elements[self.selectedElement]].value = (1*self.curValues[self.elements[self.selectedElement]].value) - step

          if (typeof self.curValues[self.elements[self.selectedElement]].min !== "undefined"){
            if (self.curValues[self.elements[self.selectedElement]].value < self.curValues[self.elements[self.selectedElement]].min){
              self.curValues[self.elements[self.selectedElement]].value = self.curValues[self.elements[self.selectedElement]].min
            }
          }
        }

        self.updateDom()

        if (self.elements[self.selectedElement] === "output"){
          if(self.curValues[self.elements[self.selectedElement]].value == true){
            self.sendNotification("LED_STRIP_CONTROL_OUTPUT", "on")
          } else {
            self.sendNotification("LED_STRIP_CONTROL_OUTPUT", "off")
          }
          
        } else {
          self.sendConfigurationNotification()
        }
        
      }
    } else if (notification === "LED_STRIP_CONTROL_INCREASE_VALUE"){
      let abort = false
      if (typeof payload.element !== "undefined"){
        if (self.elements[self.selectedElement] !== payload.element){
          let newIdx = self.elements.indexOf(payload.element)
          if(newIdx >= 0){
            self.curValues[self.elements[self.selectedElement]].selected = false
            self.selectedElement = newIdx
            self.curValues[self.elements[self.selectedElement]].selected = true
          } else {
            console.log("Could not find specified element. Aborting!")
            abort = true
          }
        }
      }

      if (!abort){
        console.log("Increasing the value of element: "+self.elements[self.selectedElement])
        if (typeof self.curValues[self.elements[self.selectedElement]].value === "boolean"){
          self.curValues[self.elements[self.selectedElement]].value = !self.curValues[self.elements[self.selectedElement]].value
        } else {
          let step = self.curValues[self.elements[self.selectedElement]].step_u
          if (typeof payload.step !== "undefined"){
            step = payload.step
          }

          console.log("old value: "+self.curValues[self.elements[self.selectedElement]].value)
          console.log("step: "+step)
          self.curValues[self.elements[self.selectedElement]].value = (1*self.curValues[self.elements[self.selectedElement]].value) + step
          console.log("new value before max check: "+self.curValues[self.elements[self.selectedElement]].value)

          if (typeof self.curValues[self.elements[self.selectedElement]].max !== "undefined"){
            if (self.curValues[self.elements[self.selectedElement]].value > self.curValues[self.elements[self.selectedElement]].max){
              self.curValues[self.elements[self.selectedElement]].value = self.curValues[self.elements[self.selectedElement]].max
            }
          }

          console.log("new value after max check: "+self.curValues[self.elements[self.selectedElement]].value)
        }
        self.updateDom()
        if (self.elements[self.selectedElement] === "output"){
          if(self.curValues[self.elements[self.selectedElement]].value == true){
            self.sendNotification("LED_STRIP_CONTROL_OUTPUT", "on")
          } else {
            self.sendNotification("LED_STRIP_CONTROL_OUTPUT", "off")
          }
          
        } else {
          self.sendConfigurationNotification()
        }
      }
    } else if (notification === "LED_STRIP_CONTROL_STATUS_UPDATE"){
      self.updateValuesToNotificationPayload(payload)
    } else if (notification === "LED_STRIP_CONTROL_TOGGLE_OUTPUT"){
      self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE", {"element":"output"})
    }
  },

  socketNotificationReceived: function (notification, payload) {
    const self = this
  },

  sendConfigurationNotification: function(){
    const self = this
    let curConfigArray = {}
    for(let i = 0; i < self.elements.length; i++){
      let curName = self.elements[i]
      if(curName.startsWith("pong_")){
        if (typeof curConfigArray["pong"] === "undefined"){
          curConfigArray["pong"] = {}
        }

        if (typeof self.curValues[curName].fractions !== "undefined"){
          curConfigArray["pong"][curName.substring(5)] = Number.parseFloat(self.curValues[curName].value).toFixed(self.curValues[curName].fractions)
        } else {
          curConfigArray["pong"][curName.substring(5)] = Number.parseInt(self.curValues[curName].value)
        }
        
      } else {
        if(curName !== "output"){
          if (typeof self.curValues[curName].fractions !== "undefined"){
            curConfigArray[curName] = Number.parseFloat(self.curValues[curName].value).toFixed(self.curValues[curName].fractions)
          } else {
            curConfigArray[curName] = Number.parseInt(self.curValues[curName].value)
          }
        }
      }
    }

    console.log("Sending current config.")
    self.sendNotification("LED_STRIP_CONTROL_CURRENT_CONFIG", JSON.stringify(curConfigArray))
  },

  updateValuesToNotificationPayload: function(newValues){
    const self = this
    newValuesObj = JSON.parse(newValues)
    for (let key in newValuesObj){
      if(key !== "pong"){
        if (typeof self.curValues[key] !== "undefined"){
          self.curValues[key].value = newValuesObj[key]
        }
      } else {
        for(let subKey in newValuesObj["pong"]){
          if (typeof self.curValues["pong_"+subKey] !== "undefined"){
            self.curValues["pong_"+subKey].value = newValuesObj["pong"][subKey]
          }
        }
      }
    }

    self.updateDom()
  },

  rgbToHex: function (rgb) { 
    var hex = Number(rgb).toString(16);
    if (hex.length < 2) {
         hex = "0" + hex;
    }
    return hex;
  },

  fullColorHex: function(r,g,b) {   
    var red = this.rgbToHex(r);
    var green = this.rgbToHex(g);
    var blue = this.rgbToHex(b);
    return red+green+blue;
  },
})
