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
    showColorOptions: true,
    showColorIndicators: true,
    outputOnIcon: "fa fa-lightbulb-o",
    outputOffIcon: "fa fa-lightbulb-o",
    upIcon: "fa fa-angle-up",
    upFastIcon: "fa fa-angle-double-up",
    downIcon: "fa fa-angle-down",
    downFastIcon: "fa fa-angle-double-down",
    fetchStatusInterval: 30
  },

  getStyles: function() {
    return ['font-awesome.css', 'ledstripcontrol.css']
  },

  getDom: function() {
    const self = this
    self.elements = []
    const wrapper = document.createElement('div')
      wrapper.className = "lsc-rootWrapper"

      const outputWrapper = document.createElement('div')
        outputWrapper.className = "lsc-outputWrapper"
        const outputIcon = document.createElement('i')
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

      if (self.config.showColorOptions){
        //color control during "normal" mode
        const normalColorWrapper = document.createElement('div')
          normalColorWrapper.className = "lsc-totalColorWrapper lsc-ncolor"
          const nColorHeaderLine = document.createElement('div')
            nColorHeaderLine.className = "lsc-color-header lsc-ncolor"
            nColorHeaderLine.innerHTML = "Color"
          normalColorWrapper.appendChild(nColorHeaderLine)

          if (self.config.showColorIndicators){
            const normalColorIndicator = document.createElement('div')
              normalColorIndicator.className = "lsc-colorIndicator lsc-ncolor"
              normalColorIndicator.style.background = "#"+self.fullColorHex(self.curValues["color_r"].value, self.curValues["color_g"].value, self.curValues["color_b"].value)
            normalColorWrapper.appendChild(normalColorIndicator)
          }

          const normalColorOuterWrapper = document.createElement('div')
            normalColorOuterWrapper.className = "lsc-colorOuterWrapper lsc-ncolor"
            //color red
            const normalColorRedWrapper = document.createElement('div')
              normalColorRedWrapper.className="lsc-colorInnerWrapper lsc-ncolor-red"

              const nColorRFastUp = document.createElement('i')
                nColorRFastUp.className = self.config.upFastIcon+" lsc-icon lsc-ncolor-red lsc-fastUp"
                nColorRFastUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"color_r","step":self.curValues["color_r"].step_u_f})})
              normalColorRedWrapper.appendChild(nColorRFastUp)

              const nColorRUp = document.createElement('i')
                nColorRUp.className = self.config.upIcon+" lsc-icon lsc-ncolor-red lsc-up"
                nColorRUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"color_r","step":self.curValues["color_r"].step_u})})
              normalColorRedWrapper.appendChild(nColorRUp)

              const nColorRValue = document.createElement('div')
                nColorRValue.className = "lsc-value lsc-ncolor-red"

                if (self.curValues["color_r"].selected == true){
                  nColorRValue.className += " lsc-selected"
                } else {
                  nColorRValue.className += " lsc-unselected"
                }

                self.curValues["color_r"].obj = nColorRValue
                self.elements.push("color_r")
                nColorRValue.innerHTML = self.curValues["color_r"].value

                
              normalColorRedWrapper.appendChild(nColorRValue)

              const nColorRDown = document.createElement('i')
                nColorRDown.className = self.config.downIcon+" lsc-icon lsc-ncolor-red lsc-down"
                nColorRDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":"color_r","step":self.curValues["color_r"].step_d})})
              normalColorRedWrapper.appendChild(nColorRDown)

              const nColorRFastDown = document.createElement('i')
                nColorRFastDown.className = self.config.downFastIcon+" lsc-icon ncolor-red lsc-fastDown"
                nColorRFastDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":"color_r","step":self.curValues["color_r"].step_d_f})})
              normalColorRedWrapper.appendChild(nColorRFastDown)

            normalColorOuterWrapper.appendChild(normalColorRedWrapper)

            //color green
            const normalColorGreenWrapper = document.createElement('div')
              normalColorGreenWrapper.className="lsc-colorInnerWrapper lsc-ncolor-green"

              const nColorGFastUp = document.createElement('i')
                nColorGFastUp.className = self.config.upFastIcon+" lsc-icon lsc-ncolor-green lsc-fastUp"
                nColorGFastUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"color_g","step":self.curValues["color_g"].step_u_f})})
              normalColorGreenWrapper.appendChild(nColorGFastUp)

              const nColorGUp = document.createElement('i')
                nColorGUp.className = self.config.upIcon+" lsc-icon lsc-ncolor-green lsc-up"
                nColorGUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"color_g","step":self.curValues["color_g"].step_u})})
              normalColorGreenWrapper.appendChild(nColorGUp)

              const nColorGValue = document.createElement('div')
                nColorGValue.className = "lsc-value lsc-ncolor-green"

                if (self.curValues["color_g"].selected == true){
                  nColorGValue.className += " lsc-selected"
                } else {
                  nColorGValue.className += " lsc-unselected"
                }

                self.curValues["color_g"].obj = nColorGValue
                self.elements.push("color_g")

                nColorGValue.innerHTML = self.curValues["color_g"].value
              normalColorGreenWrapper.appendChild(nColorGValue)

              const nColorGDown = document.createElement('i')
                nColorGDown.className = self.config.downIcon+" lsc-icon lsc-ncolor-green lsc-down"
                nColorGDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":"color_g","step":self.curValues["color_g"].step_d})})
              normalColorGreenWrapper.appendChild(nColorGDown)

              const nColorGFastDown = document.createElement('i')
                nColorGFastDown.className = self.config.downFastIcon+" lsc-icon ncolor-green lsc-fastDown"
                nColorGFastDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":"color_g","step":self.curValues["color_g"].step_d_f})})
              normalColorGreenWrapper.appendChild(nColorGFastDown)

            normalColorOuterWrapper.appendChild(normalColorGreenWrapper)

            //color blue
            const normalColorBlueWrapper = document.createElement('div')
              normalColorBlueWrapper.className="lsc-colorInnerWrapper lsc-ncolor-blue"

              const nColorBFastUp = document.createElement('i')
                nColorBFastUp.className = self.config.upFastIcon+" lsc-icon lsc-ncolor-blue lsc-fastUp"
                nColorBFastUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"color_b","step":self.curValues["color_b"].step_u_f})})
              normalColorBlueWrapper.appendChild(nColorBFastUp)

              const nColorBUp = document.createElement('i')
                nColorBUp.className = self.config.upIcon+" lsc-icon lsc-ncolor-blue lsc-up"
                nColorBUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"color_b","step":self.curValues["color_b"].step_u})})
              normalColorBlueWrapper.appendChild(nColorBUp)

              const nColorBValue = document.createElement('div')
                nColorBValue.className = "lsc-value lsc-ncolor-blue"

                if (self.curValues["color_b"].selected == true){
                  nColorBValue.className += " lsc-selected"
                } else {
                  nColorBValue.className += " lsc-unselected"
                }

                self.curValues["color_b"].obj = nColorBValue
                self.elements.push("color_b")

                nColorBValue.innerHTML = self.curValues["color_b"].value
              normalColorBlueWrapper.appendChild(nColorBValue)

              const nColorBDown = document.createElement('i')
                nColorBDown.className = self.config.downIcon+" lsc-icon lsc-ncolor-blue lsc-down"
                nColorBDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":"color_b","step":self.curValues["color_b"].step_u})})
              normalColorBlueWrapper.appendChild(nColorBDown)

              const nColorBFastDown = document.createElement('i')
                nColorBFastDown.className = self.config.downFastIcon+" lsc-icon ncolor-blue lsc-fastDown"
                nColorBFastDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":"color_b","step":self.curValues["color_b"].step_d_f})})
              normalColorBlueWrapper.appendChild(nColorBFastDown)

            normalColorOuterWrapper.appendChild(normalColorBlueWrapper)

          normalColorWrapper.appendChild(normalColorOuterWrapper)
        wrapper.appendChild(normalColorWrapper)
      }


      //pong options
      if (self.config.showPongOptions == true){
        //color control of the pong colors
        const pongColorWrapper = document.createElement('div')
          pongColorWrapper.className = "lsc-totalColorWrapper lsc-pcolor"
          const pColorHeaderLine = document.createElement('div')
            pColorHeaderLine.className = "lsc-color-header lsc-pcolor"
            pColorHeaderLine.innerHTML = "PONG Color"
          pongColorWrapper.appendChild(pColorHeaderLine)

          if (self.config.showColorIndicators){
            const pongColorIndicator = document.createElement('div')
              pongColorIndicator.className = "lsc-colorIndicator lsc-pcolor"
              pongColorIndicator.style.background = "#"+self.fullColorHex(self.curValues["pong_color_r"].value, self.curValues["pong_color_g"].value, self.curValues["pong_color_b"].value)
            pongColorWrapper.appendChild(pongColorIndicator)
          }

          const pongColorOuterWrapper = document.createElement('div')
            pongColorOuterWrapper.className = "lsc-colorOuterWrapper lsc-pcolor"
            //color red
            const pongColorRedWrapper = document.createElement('div')
              pongColorRedWrapper.className="lsc-colorInnerWrapper lsc-pcolor-red"

              const pColorRFastUp = document.createElement('i')
                pColorRFastUp.className = self.config.upFastIcon+" lsc-icon lsc-pcolor-red lsc-fastUp"
                pColorRFastUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"pong_color_r","step":self.curValues["pong_color_r"].step_u_f})})
              pongColorRedWrapper.appendChild(pColorRFastUp)

              const pColorRUp = document.createElement('i')
                pColorRUp.className = self.config.upIcon+" lsc-icon lsc-pcolor-red lsc-up"
                pColorRUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"pong_color_r","step":self.curValues["pong_color_r"].step_u})})
              pongColorRedWrapper.appendChild(pColorRUp)

              const pColorRValue = document.createElement('div')
                pColorRValue.className = "lsc-value lsc-pcolor-red"

                if (self.curValues["pong_color_r"].selected == true){
                  pColorRValue.className += " lsc-selected"
                } else {
                  pColorRValue.className += " lsc-unselected"
                }
  
                self.curValues["pong_color_r"].obj = pColorRValue
                self.elements.push("pong_color_r")

                pColorRValue.innerHTML = self.curValues["pong_color_r"].value
              pongColorRedWrapper.appendChild(pColorRValue)

              const pColorRDown = document.createElement('i')
                pColorRDown.className = self.config.downIcon+" lsc-icon lsc-pcolor-red lsc-down"
                pColorRDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":"pong_color_r","step":self.curValues["pong_color_r"].step_d})})
              pongColorRedWrapper.appendChild(pColorRDown)

              const pColorRFastDown = document.createElement('i')
                pColorRFastDown.className = self.config.downFastIcon+" lsc-icon pcolor-red lsc-fastDown"
                pColorRFastDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":"pong_color_r","step":self.curValues["pong_color_r"].step_d_f})})
              pongColorRedWrapper.appendChild(pColorRFastDown)

            pongColorOuterWrapper.appendChild(pongColorRedWrapper)

            //color green
            const pongColorGreenWrapper = document.createElement('div')
              pongColorGreenWrapper.className="lsc-colorInnerWrapper lsc-pcolor-green"

              const pColorGFastUp = document.createElement('i')
                pColorGFastUp.className = self.config.upFastIcon+" lsc-icon lsc-pcolor-green lsc-fastUp"
                pColorGFastUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"pong_color_g","step":self.curValues["pong_color_g"].step_u_f})})
              pongColorGreenWrapper.appendChild(pColorGFastUp)

              const pColorGUp = document.createElement('i')
                pColorGUp.className = self.config.upIcon+" lsc-icon lsc-pcolor-green lsc-up"
                pColorGUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"pong_color_g","step":self.curValues["pong_color_g"].step_u})})
              pongColorGreenWrapper.appendChild(pColorGUp)

              const pColorGValue = document.createElement('div')
                pColorGValue.className = "lsc-value lsc-pcolor-green"

                if (self.curValues["pong_color_g"].selected == true){
                  pColorGValue.className += " lsc-selected"
                } else {
                  pColorGValue.className += " lsc-unselected"
                }
  
                self.curValues["pong_color_g"].obj = pColorGValue
                self.elements.push("pong_color_g")

                pColorGValue.innerHTML = self.curValues["pong_color_g"].value
              pongColorGreenWrapper.appendChild(pColorGValue)

              const pColorGDown = document.createElement('i')
                pColorGDown.className = self.config.downIcon+" lsc-icon lsc-pcolor-green lsc-down"
                pColorGDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":"pong_color_g","step":self.curValues["pong_color_g"].step_d})})
              pongColorGreenWrapper.appendChild(pColorGDown)

              const pColorGFastDown = document.createElement('i')
                pColorGFastDown.className = self.config.downFastIcon+" lsc-icon pcolor-green lsc-fastDown"
                pColorGFastDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":"pong_color_g","step":self.curValues["pong_color_g"].step_d_f})})
              pongColorGreenWrapper.appendChild(pColorGFastDown)

            pongColorOuterWrapper.appendChild(pongColorGreenWrapper)

            //color blue
            const pongColorBlueWrapper = document.createElement('div')
              pongColorBlueWrapper.className="lsc-colorInnerWrapper lsc-pcolor-blue"

              const pColorBFastUp = document.createElement('i')
                pColorBFastUp.className = self.config.upFastIcon+" lsc-icon lsc-pcolor-blue lsc-fastUp"
                pColorBFastUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"pong_color_b","step":self.curValues["pong_color_b"].step_u_f})})
              pongColorBlueWrapper.appendChild(pColorBFastUp)

              const pColorBUp = document.createElement('i')
                pColorBUp.className = self.config.upIcon+" lsc-icon lsc-pcolor-blue lsc-up"
                pColorBUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"pong_color_b","step":self.curValues["pong_color_b"].step_u})})
              pongColorBlueWrapper.appendChild(pColorBUp)

              const pColorBValue = document.createElement('div')
                pColorBValue.className = "lsc-value lsc-pcolor-blue"

                if (self.curValues["pong_color_b"].selected == true){
                  pColorBValue.className += " lsc-selected"
                } else {
                  pColorBValue.className += " lsc-unselected"
                }
  
                self.curValues["pong_color_b"].obj = pColorBValue
                self.elements.push("pong_color_b")

                pColorBValue.innerHTML = self.curValues["pong_color_b"].value
              pongColorBlueWrapper.appendChild(pColorBValue)

              const pColorBDown = document.createElement('i')
                pColorBDown.className = self.config.downIcon+" lsc-icon lsc-pcolor-blue lsc-down"
                pColorBDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":"pong_color_b","step":self.curValues["pong_color_b"].step_d})})
              pongColorBlueWrapper.appendChild(pColorBDown)

              const pColorBFastDown = document.createElement('i')
                pColorBFastDown.className = self.config.downFastIcon+" lsc-icon pcolor-blue lsc-fastDown"
                pColorBFastDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":"pong_color_b","step":self.curValues["pong_color_b"].step_d_f})})
              pongColorBlueWrapper.appendChild(pColorBFastDown)

            pongColorOuterWrapper.appendChild(pongColorBlueWrapper)

          pongColorWrapper.appendChild(pongColorOuterWrapper)
        wrapper.appendChild(pongColorWrapper)


        //color control of the pong result colors
        const pongResultColorWrapper = document.createElement('div')
          pongResultColorWrapper.className = "lsc-totalColorWrapper lsc-prcolor"
          const prColorHeaderLine = document.createElement('div')
            prColorHeaderLine.className = "lsc-color-header lsc-prcolor"
            prColorHeaderLine.innerHTML = "PONG Result Color"
          pongResultColorWrapper.appendChild(prColorHeaderLine)

          if (self.config.showColorIndicators){
            const pongResultColorIndicator = document.createElement('div')
              pongResultColorIndicator.className = "lsc-colorIndicator lsc-prcolor"
              pongResultColorIndicator.style.background = "#"+self.fullColorHex(self.curValues["pong_result_color_r"].value, self.curValues["pong_result_color_g"].value, self.curValues["pong_result_color_b"].value)
            pongResultColorWrapper.appendChild(pongResultColorIndicator)
          }

          const pongResultColorOuterWrapper = document.createElement('div')
            pongResultColorOuterWrapper.className = "lsc-colorOuterWrapper lsc-prcolor"
            //color red
            const pongResultColorRedWrapper = document.createElement('div')
              pongResultColorRedWrapper.className="lsc-colorInnerWrapper lsc-prcolor-red"

              const prColorRFastUp = document.createElement('i')
                prColorRFastUp.className = self.config.upFastIcon+" lsc-icon lsc-prcolor-red lsc-fastUp"
                prColorRFastUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"pong_result_color_r","step":self.curValues["pong_result_color_r"].step_u_f})})
              pongResultColorRedWrapper.appendChild(prColorRFastUp)

              const prColorRUp = document.createElement('i')
                prColorRUp.className = self.config.upIcon+" lsc-icon lsc-prcolor-red lsc-up"
                prColorRUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"pong_result_color_r","step":self.curValues["pong_result_color_r"].step_u})})
              pongResultColorRedWrapper.appendChild(prColorRUp)

              const prColorRValue = document.createElement('div')
                prColorRValue.className = "lsc-value lsc-prcolor-red"

                if (self.curValues["pong_result_color_r"].selected == true){
                  prColorRValue.className += " lsc-selected"
                } else {
                  prColorRValue.className += " lsc-unselected"
                }
  
                self.curValues["pong_result_color_r"].obj = prColorRValue
                self.elements.push("pong_result_color_r")

                prColorRValue.innerHTML = self.curValues["pong_result_color_r"].value
              pongResultColorRedWrapper.appendChild(prColorRValue)

              const prColorRDown = document.createElement('i')
                prColorRDown.className = self.config.downIcon+" lsc-icon lsc-prcolor-red lsc-down"
                prColorRDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":"pong_result_color_r","step":self.curValues["pong_result_color_r"].step_d})})
              pongResultColorRedWrapper.appendChild(prColorRDown)

              const prColorRFastDown = document.createElement('i')
                prColorRFastDown.className = self.config.downFastIcon+" lsc-icon prcolor-red lsc-fastDown"
                prColorRFastDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":"pong_result_color_r","step":self.curValues["pong_result_color_r"].step_d_f})})
              pongResultColorRedWrapper.appendChild(prColorRFastDown)

            pongResultColorOuterWrapper.appendChild(pongResultColorRedWrapper)

            //color green
            const pongResultColorGreenWrapper = document.createElement('div')
              pongResultColorGreenWrapper.className="lsc-colorInnerWrapper lsc-prcolor-green"

              const prColorGFastUp = document.createElement('i')
                prColorGFastUp.className = self.config.upFastIcon+" lsc-icon lsc-prcolor-green lsc-fastUp"
                prColorGFastUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"pong_result_color_g","step":self.curValues["pong_result_color_g"].step_u_f})})
              pongResultColorGreenWrapper.appendChild(prColorGFastUp)

              const prColorGUp = document.createElement('i')
                prColorGUp.className = self.config.upIcon+" lsc-icon lsc-prcolor-green lsc-up"
                prColorGUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"pong_result_color_g","step":self.curValues["pong_result_color_g"].step_u})})
              pongResultColorGreenWrapper.appendChild(prColorGUp)

              const prColorGValue = document.createElement('div')
                prColorGValue.className = "lsc-value lsc-prcolor-green"

                if (self.curValues["pong_result_color_g"].selected == true){
                  prColorGValue.className += " lsc-selected"
                } else {
                  prColorGValue.className += " lsc-unselected"
                }
  
                self.curValues["pong_result_color_g"].obj = prColorGValue
                self.elements.push("pong_result_color_g")

                prColorGValue.innerHTML = self.curValues["pong_result_color_g"].value
              pongResultColorGreenWrapper.appendChild(prColorGValue)

              const prColorGDown = document.createElement('i')
                prColorGDown.className = self.config.downIcon+" lsc-icon lsc-prcolor-green lsc-down"
                prColorGDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":"pong_result_color_g","step":self.curValues["pong_result_color_g"].step_d})})
              pongResultColorGreenWrapper.appendChild(prColorGDown)

              const prColorGFastDown = document.createElement('i')
                prColorGFastDown.className = self.config.downFastIcon+" lsc-icon prcolor-green lsc-fastDown"
                prColorGFastDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":"pong_result_color_g","step":self.curValues["pong_result_color_g"].step_d_f})})
              pongResultColorGreenWrapper.appendChild(prColorGFastDown)

            pongResultColorOuterWrapper.appendChild(pongResultColorGreenWrapper)

            //color blue
            const pongResultColorBlueWrapper = document.createElement('div')
              pongResultColorBlueWrapper.className="lsc-colorInnerWrapper lsc-prcolor-blue"

              const prColorBFastUp = document.createElement('i')
                prColorBFastUp.className = self.config.upFastIcon+" lsc-icon lsc-prcolor-blue lsc-fastUp"
                prColorBFastUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"pong_result_color_b","step":self.curValues["pong_result_color_b"].step_u_f})})
              pongResultColorBlueWrapper.appendChild(prColorBFastUp)

              const prColorBUp = document.createElement('i')
                prColorBUp.className = self.config.upIcon+" lsc-icon lsc-prcolor-blue lsc-up"
                prColorBUp.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_INCREASE_VALUE",{"element":"pong_result_color_b","step":self.curValues["pong_result_color_b"].step_u})})
              pongResultColorBlueWrapper.appendChild(prColorBUp)

              const prColorBValue = document.createElement('div')
                prColorBValue.className = "lsc-value lsc-prcolor-blue"

                if (self.curValues["pong_result_color_b"].selected == true){
                  prColorBValue.className += " lsc-selected"
                } else {
                  prColorBValue.className += " lsc-unselected"
                }
  
                self.curValues["pong_result_color_b"].obj = prColorBValue
                self.elements.push("pong_result_color_b")

                prColorBValue.innerHTML = self.curValues["pong_result_color_b"].value
              pongResultColorBlueWrapper.appendChild(prColorBValue)

              const prColorBDown = document.createElement('i')
                prColorBDown.className = self.config.downIcon+" lsc-icon lsc-prcolor-blue lsc-down"
                prColorBDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":"pong_result_color_b","step":self.curValues["pong_result_color_b"].step_d})})
              pongResultColorBlueWrapper.appendChild(prColorBDown)

              const prColorBFastDown = document.createElement('i')
                prColorBFastDown.className = self.config.downFastIcon+" lsc-icon prcolor-blue lsc-fastDown"
                prColorBFastDown.addEventListener("click", ()=>{self.notificationReceived("LED_STRIP_CONTROL_DECREASE_VALUE",{"element":"pong_result_color_b","step":self.curValues["pong_result_color_b"].step_d_f})})
              pongResultColorBlueWrapper.appendChild(prColorBFastDown)

            pongResultColorOuterWrapper.appendChild(pongResultColorBlueWrapper)

          pongResultColorWrapper.appendChild(pongResultColorOuterWrapper)
        wrapper.appendChild(pongResultColorWrapper)

      }

    return wrapper;
  },

  start: function () {
    const self = this
    self.selectedElement = 0

    self.elements = []

      //     "pong_num_leds",
      //     "pong_max_wins",
      //     "pong_tolerance",

      //     "pong_init_delay",
      //     "pong_dec_per_run",
      //     "pong_min_delay",

      //     "pong_btn_delay",
      //     "pong_result_delay_after",
      //     "pong_result_delay_during"
      // )

    self.curValues = {
      "output" : {"value":false, "selected": true, "obj" : null},
      "color_r" : {"value":255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255, "selected": false, "obj" : null},
      "color_g" : {"value":255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255, "selected": false, "obj" : null},
      "color_b" : {"value":255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255, "selected": false, "obj" : null},
      "pong_btn_delay": {"value": 2, "step_u": 0.5, "step_d": 0.5, "step_u_f": 1, "step_d_f": 1, "min": 0.2, "selected": false, "obj" : null},
      "pong_init_delay" : {"value": 0.5, "step_u": 0.05, "step_d": 0.05, "step_u_f": 0.1, "step_d_f": 0.1, "min": 0.005, "selected": false, "obj" : null},
      "pong_dec_per_run" : {"value": 0.05, "step_u": 0.01, "step_d": 0.01, "step_u_f": 0.05, "step_d_f": 0.05, "min": 0, "selected": false, "obj" : null},
      "pong_min_delay" : {"value": 0.02, "step_u": 0.005, "step_d": 0.005, "step_u_f": 0.1, "step_d_f": 0.1, "min": 0.005, "selected": false, "obj" : null},
      "pong_num_leds" : {"value": 10, "step_u": 1, "step_d": 1, "step_u_f": 5, "step_d_f": 5, "min": 3, "selected": false, "obj" : null},
      "pong_max_wins" : {"value": 2, "step_u": 1, "step_d": 1, "step_u_f": 3, "step_d_f": 3, "min": 1, "selected": false, "obj" : null},
      "pong_tolerance" : {"value": 2, "step_u": 1, "step_d": 1, "step_u_f": 3, "step_d_f": 3, "min": 0, "selected": false, "obj" : null},
      "pong_result_delay_after" : {"value": 5, "step_u": 0.5, "step_d": 0.5, "step_u_f": 1, "step_d_f": 1, "min": 0.1, "selected": false, "obj" : null},
      "pong_result_delay_during" : {"value": 3, "step_u": 0.5, "step_d": 0.5, "step_u_f": 1, "step_d_f": 1, "min": 0, "selected": false, "obj" : null},
      "pong_color_r" : {"value": 0, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255, "selected": false, "obj" : null},
      "pong_color_g" : {"value": 0, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255, "selected": false, "obj" : null},
      "pong_color_b" : {"value": 255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255, "selected": false, "obj" : null},
      "pong_result_color_r" : {"value": 0, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255, "selected": false, "obj" : null},
      "pong_result_color_g" : {"value": 255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255, "selected": false, "obj" : null},
      "pong_result_color_b" : {"value": 0, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255, "selected": false, "obj" : null},
    };

    Log.info("Starting module: " + self.name);
    self.sendSocketNotification('CONFIG', self.config)

    setTimeout(()=>{
      self.sendNotification("LED_STRIP_CONTROL_FETCH_STATUS","dummy")
  
      setTimeout(()=>{
        self.sendNotification("LED_STRIP_CONTROL_FETCH_STATUS","dummy")
      }, self.config.fetchStatusInterval * 1000)  
    }, self.config.fetchStatusInterval * 1000)

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
        } else {
          console.log("New element is old element!")
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
          self.curValues[self.elements[self.selectedElement]].value = self.curValues[self.elements[self.selectedElement]].value - step

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
        } else {
          console.log("New element is old element!")
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
          self.curValues[self.elements[self.selectedElement]].value = self.curValues[self.elements[self.selectedElement]].value + step

          if (typeof self.curValues[self.elements[self.selectedElement]].max !== "undefined"){
            if (self.curValues[self.elements[self.selectedElement]].value > self.curValues[self.elements[self.selectedElement]].max){
              self.curValues[self.elements[self.selectedElement]].value = self.curValues[self.elements[self.selectedElement]].max
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
    } else if (notification === "LED_STRIP_CONTROL_STATUS_UPDATE"){
      self.updateValuesToNotificationPayload(payload)
    }
  },

  socketNotificationReceived: function (notification, payload) {
    const self = this
  },

  sendConfigurationNotification: function(){
    const self = this
    let curConfigArray = { "pong": {}}
    for(let i = 0; i < self.elements.length; i++){
      let curName = self.elements[i]
      if(curName.startsWith("pong_")){
        curConfigArray["pong"][curName.substring(5)] = self.curValues[curName].value
      } else {
        if(curName !== "output"){
          curConfigArray[curName] = self.curValues[curName].value
        }
      }
    }

    console.log("Sending current config: "+JSON.stringify(curConfigArray))
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
