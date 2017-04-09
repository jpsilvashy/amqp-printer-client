var router = require('./router');
var colors = require('colors');
var amqp   = require('amqplib/callback_api');

// if the connection is closed or fails to be established at all, we will reconnect
var eventEmitter = null;
var amqpConn = null;
var pubChannel = null;
var offlinePubQueue = [];

var mq = {

  // Main start
  start: function(config, emitter) {
    eventEmitter = emitter;

    amqp.connect(config.rabbitMqUrl + "?heartbeat=60", function(err, conn) {
      if (err) {
        console.error("[AMQP]", colors.red(err.message));
        return setTimeout(mq.start, 1000);
      }

      conn.on("error", function(err) {
        if (err.message !== "Connection closing") {
          console.error("[AMQP] conn error", colors.red(err.message));
        }
      });

      conn.on("close", function() {
        console.error("[AMQP] reconnecting");
        return setTimeout(mq.start, 1000);
      });

      console.log("[AMQP] connected");
      amqpConn = conn;

      mq.connected(config.token);
    });
  },

  // when we connect to amqp
  connected: function(queue) {
    mq.startPublisher();
    mq.startWorker(queue);
  },

  // startPublisher
  startPublisher: function() {
    amqpConn.createConfirmChannel(function(err, ch) {
      if (mq.closeOnErr(err)) return;

      ch.on("error", function(err) {
        console.error("[AMQP] channel error", colors.red(err.message));
      });

      ch.on("close", function() {
        console.log("[AMQP] publisher channel closed");
      });

      pubChannel = ch;
      while (true) {
        var m = offlinePubQueue.shift();
        if (!m) break;
        mq.publish(m[0], m[1], m[2]);
      }
    });
  },

  // method to publish a message, will queue messages internally if the connection is down and resend later
  publish: function(exchange, routingKey, content) {
    var c = JSON.stringify(content)
    var content = new Buffer(c)

    try {
      pubChannel.publish(exchange, routingKey, content, { persistent: true }, function(err, ok) {
        if (err) {
          console.error("[AMQP] publish", err);
          offlinePubQueue.push([exchange, routingKey, content]);
          pubChannel.connection.close();
        }
      });
    } catch (e) {
      console.error("[AMQP] publish", e.message);
      offlinePubQueue.push([exchange, routingKey, content]);
    }
  },

  // A worker that acks messages only if processed succesfully
  startWorker: function(queue) {
    amqpConn.createChannel(function(err, ch) {
      if (mq.closeOnErr(err)) return;

      ch.on("error", function(err) {
        console.error("[AMQP] channel error", colors.red(err.message));
      });

      ch.on("close", function() {
        console.log("[AMQP] worker channel closed");
      });

      ch.prefetch(10);

      ch.assertQueue(queue, { durable: true }, function(err, _ok) {
        if (mq.closeOnErr(err)) return;
        ch.consume(queue, processMsg, { noAck: false });
        console.log("[AMQP] consuming from:", colors.green(queue));
      });

      function processMsg(msg) {
        mq.handleMessage(msg, function(ok) {
          try {
            if (true) ch.ack(msg); // ALWAYS ACK!!!!! FIXME?!
            else ch.reject(msg, true);
          } catch (e) {
            mq.closeOnErr(e);
          }
        });
      }
    });
  },

  // Actually handle the message
  handleMessage: function(message, callback) {
    eventEmitter.emit('handleMessage', message.content.toString());
    router.handleMessage(message, function(error, response) {
      if (error) {
        callback(false);
      } else {
        callback(true);
      }
    });
  },

  //
  closeOnErr: function(err) {
    if (!err) return false;
    console.error("[AMQP] error", colors.red(err));
    amqpConn.close();
    return true;
  }
}

module.exports = mq;
