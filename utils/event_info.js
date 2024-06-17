const fs = require('fs');
const path = require('path');

const eventInfoPath = path.join(__dirname, 'event_info.txt');

function getEventDetails() {
  if (!fs.existsSync(eventInfoPath)) {
    return 'No event details available.';
  }
  return fs.readFileSync(eventInfoPath, 'utf8');
}

function processEventInfoMessage(ctx) {
  const eventDetails = getEventDetails();
  ctx.reply(eventDetails);
}

module.exports = {
  processEventInfoMessage
};
