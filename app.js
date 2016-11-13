var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    server : null,
    console : null,
    port : 7681,
    messages : [],
    ctor:function () {
        this._super();

        var size = cc.winSize;

    
        this.server = new WebSocketServer(this.port, "protocol");

        layer = this; 
        this.server.onServerUp = function(evt) {
            layer.appendTextConsole("WebsocketServer:: serverStarted");
        };

        this.server.onServerDown = function(evt) {
            layer.appendTextConsole("WebsocketServer:: serverStarted");
        };

        this.server.onConnect = function(evt) {
            layer.appendTextConsole("WebsocketServer:: onConnect");
        };

        this.server.onMessage = function(evt) {
            layer.appendTextConsole("WebsocketServer:: onMessage");
            layer.server.send("Hello!");
        };

        this.server.onDisconnection = function(evt) {
            layer.appendTextConsole("WebsocketServer:: onDisconnect");
        };

        this.server.onError = function(evt) {
            layer.appendTextConsole("WebsocketServer:: onError");
        };
        

        var startServerButton = new ccui.Button();
        startServerButton.setTitleText("Start Server");
        startServerButton.setPosition(size.width/4 , size.height/8 );
        startServerButton.addTouchEventListener(this.startServer, this);
        startServerButton.setTitleFontSize(30);
        this.addChild(startServerButton);

        var stopServerButton = new ccui.Button();
        stopServerButton.setTitleText("Stop Server");
        stopServerButton.setPosition(size.width*3/4 , size.height/8);
        stopServerButton.addTouchEventListener(this.stopServer, this);
        stopServerButton.setTitleFontSize(30);
        this.addChild(stopServerButton);

        var newClientButton = new ccui.Button();
        newClientButton.setTitleText("New Client");
        newClientButton.setPosition(size.width*3/4 , size.height/2);
        newClientButton.addTouchEventListener(this.newClient, this);
        newClientButton.setTitleFontSize(30);
        this.addChild(newClientButton);

        this.console = new ccui.TextField();
        this.console.setPosition(size.width/4 , size.height/2);
        this.console.setFontSize(20);
        this.console.setTextColor(cc.color(0, 255, 0));
        this.console.setTouchEnabled(false);
        this.console.setTextAreaSize(cc.size(size.width/4,size.height/2));
        this.console.setString("WebsocketServer down");
        this.console.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);    
        this.console.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        this.console.setTouchAreaEnabled(false);

        this.addChild(this.console);


        return true;
    },
    startServer : function(sender, type){
        switch (type)
        {
            case ccui.Widget.TOUCH_ENDED:
                this.server.start();
            break;
        }
    },
    stopServer : function(sender, type){
        switch (type)
        {
            case ccui.Widget.TOUCH_ENDED:
                this.server.stop();
            break;
        }
    },
    newClient :  function(sender, type){

        switch (type)
        {
            case ccui.Widget.TOUCH_ENDED:
                var webSocket = new WebSocket("ws://127.0.0.1:" + this.port, "protocol");

                self = this;

                webSocket.onopen = function(evt) {
                    self.appendTextConsole("WebSocketClient:: Connected to server");
                    webSocket.send("TestMessage");
                };

                webSocket.onmessage = function(evt) {
                    var textStr = evt.data;
                    self.appendTextConsole("WebSocketClient:: New message from server, msg = " +  evt);
                };

                webSocket.onerror = function(evt) {
                    self.appendTextConsole("WebSocketClient:: Connection error to server");
                };

                webSocket.onclose = function(evt) {
                    self.appendTextConsole("WebSocketClient:: Connection closed");
                };
                break;
        }
    },
    appendTextConsole : function(text){

        if(this.messages.length > 10){
            this.messages.shift();
            this.messages.push(text);
        }
        else{
            this.messages.push(text);
        }

        this.console.setString("");

        self = this;

        this.messages.forEach(function(entry) {
            self.console.setString(self.console.getString() + "\n" + entry);
        });
    }

});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

