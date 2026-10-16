const { TelemetryClient, constants } = require('.');

const { PACKETS } = constants;

const client = new TelemetryClient();
client.on(PACKETS.TelemetryData, message => console.log(message));
client.on(PACKETS.ScoringData, message => console.log(message));
client.on(PACKETS.GraphicsData, message => console.log(message));
client.on(PACKETS.PhysicsData, message => console.log(message));

client.start();
