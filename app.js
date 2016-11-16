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
            layer.appendTextConsole("Server::onServerUp() -> Server Started");
        };

        this.server.onServerDown = function(evt) {
            layer.appendTextConsole("Server::onServerDown() -> Server Stoped");
        };

        this.server.onConnection = function(evt) {
            layer.appendTextConsole("Server::onConnection() -> ClientId=" + evt.socketId );
        };

        this.server.onMessage = function(evt) {
            layer.appendTextConsole("Server::onMessage() -> ClientId=" + evt.socketId + ", msg=" + evt.data);
            layer.server.send(evt.socketId, "Hello!");
        };

        this.server.onDisconnection = function(evt) {
            layer.appendTextConsole("Server::onDisconnection()  -> ClientId=" + evt.socketId);
        };

        this.server.onError = function(evt) {
            layer.appendTextConsole("Server::onError()");
        };


        var broadcastButton = new ccui.Button();
        broadcastButton.setTitleText("Broadcast");
        broadcastButton.setPosition(size.width*1/4 , size.height/8);
        broadcastButton.addTouchEventListener(this.broadcastMsg, this);
        broadcastButton.setTitleFontSize(30);
        this.addChild(broadcastButton);
        

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
    broadcastMsg : function(sender, type){
        switch (type)
        {
            case ccui.Widget.TOUCH_ENDED:
                if(this.server.readyState ===  WebSocketServer.UP){ // DOWN, STARTING, STOPPING
                    this.server.broadcast("To all!");  
                }
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
                    self.appendTextConsole("Client::onopen() -> Connected to server");
                    webSocket.send("Test");
                };

                webSocket.onmessage = function(evt) {
                    var textStr = evt.data;
                    self.appendTextConsole("Client::onmessage() -> msg=" +  evt.data);
                };

                webSocket.onerror = function(evt) {
                    self.appendTextConsole("Client::onerror()");
                };

                webSocket.onclose = function(evt) {
                    self.appendTextConsole("Client::onclose()");
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

