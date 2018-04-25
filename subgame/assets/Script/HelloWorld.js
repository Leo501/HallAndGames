cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        // defaults, set visually when attaching this script to the Canvas
        text: 'Hello_World!'
    },

    // use this for initialization
    onLoad: function() {
        this.label.string = this.text;
    },

    // called every frame
    update: function(dt) {

    },
    on_back: function() {
        console.log("btn_back clicked!!!!");
      
        require(cc.INGAME  + "/src/dating.js");
    },
});