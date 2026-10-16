const dgram = require('dgram');

const EventEmitter = require('events');
const AddressInfo = require('net');

const { rFactor2UdpBroadcaster } = require('./compiled');
const constants = require('./constants');

const DEFAULT_PORT = 20888;
const CLIENT_STARTED_ERROR_MESSAGE = 'Client was already started';

const { ENUMPACKETS } = constants;

class TelemetryClient extends EventEmitter {
  constructor(port=DEFAULT_PORT, verbose=true) {
    super();

    this.port = port;
    this.verbose = verbose;
    this.isRunning = false;
  }

  handleMessage(m) {
    const message = TelemetryClient.parseMessage(m);
    this.emit(ENUMPACKETS[message.PacketHeader.PacketType], message);
  }

  static parseMessage(m) {
    const message = rFactor2UdpBroadcaster.DataPacket.decode(m);
    return message;
  }

  start() {
    if (this.isRunning) {
      throw CLIENT_STARTED_ERROR_MESSAGE;
    }

    this.socket = dgram.createSocket('udp4');

    this.socket.on('listening', () => {
      if (!this.socket) {
        return;
      }

      const address = this.socket.address();

      if (this.verbose) {
        console.log(
          `UDP socket listening on ${address.address}:${address.port}`
        );
      }

      this.socket.setBroadcast(true);
    });

    this.socket.on('message', m => this.handleMessage(m));

    this.socket.bind(this.port);

    this.isRunning = true;
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    return (
      this.socket &&
      this.socket.close(() => {
        if (this.verbose) {
          console.log(`UDP socket closed`);
        }

        this.socket = undefined;

        this.isRunning = false;
      })
    );
  }
}

exports.TelemetryClient = TelemetryClient;
exports.constants = constants;
