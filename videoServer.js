var WebSocketServer = require('websocket').server;
var http = require('http');

var port = 8001;

var server = http.createServer(function (req, res) {
	console.log('Received request for ' + req.url);
	res.writeHead(404);
	res.end();
});

server.listen(port, function () {
  	console.log('Server is listening on port ' + port);
});

wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false
});
wsServer.setMaxListeners(0);

var connectionArray = [];
var reciever;


wsServer.on('request', function (request) {

	var connection = request.accept(null, request.origin);

	connection.on('message', function (message) {

	    if (message.type === 'utf8') {
	        //console.log('Received message: ' + message.utf8Data);

	        console.log('message : ' + message.utf8Data);
            //message.utf8Data.trim();
            var str = message.utf8Data;
//            str = str.replace(/^\s*/, "");
//            console.log('str: ' + str);
//            var messageStr = message.utf8Data;
	        str = str.substring(0, 1);
            
//                        if(str == " "){
//                  console.log('-->empty');
//                  messageStr = substring(0, messageStr.length-1);
//            }
            if (str == '{' || str == '[') {
                packet = JSON.parse(message.utf8Data);
                console.log('packet.PacketID: '+packet.PacketID);
	            switch (packet.PacketID) {
	                case 0:
	                    connection.isReceiver = false;
	                    connectionArray.push(connection);
	                    Send(connection, message.utf8Data);
	                    console.log('connection : ' + connection.remoteAddress);
	                    break;
	                case 1:
	                    connection.isReceiver = true;
	                    reciever = connection;
	                    console.log('connection receiver : ' + connection.remoteAddress);
	                    Send(connection, message.utf8Data);
	                    break;
	                case 3:
	                    broadReceiver(message.utf8Data);
	                    break;
	            }
	        } else {
	            console.log('not PacketID');
	        }
		}
		else if (message.type === 'binary') {
			connection.sendBytes(message.binaryData);
		}
	});
	connection.on('close', function (reasonCode, description) {

		if (connection.isReceiver == true) {
			reciever = null;
			console.log('Receiver Closed');
		} else {
			for (var i = 0; i < connectionArray.length; i++) {
	    		if (connectionArray[i] == connection) {
	    			connectionArray.splice(i, 1);
	    			break;
	    		}
	    	}
		}	

		console.log('Peer ' + connection.remoteAddress + ' disconnected.');
	});

});


function broadReceiver(stringMessage) {
    if (reciever != null){
		reciever.sendUTF(stringMessage);
        console.log('send: ' + stringMessage);

    }else{
        console.log('null reseiver');
    }
}

function broadCast(stringMessage) {
	for (var i = 0; i < connectionArray.length; i++) {
		connectionArray[i].sendUTF(stringMessage);
	}
}

function Send(connection, stringMessage) {
	connection.sendUTF(stringMessage);
}