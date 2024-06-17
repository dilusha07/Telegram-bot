const fs = require('fs');
const path = require('path');

function inviteUserToGroup(ctx,chatId) {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf8'));
  const groupInviteLink = config.group_invite_link;
  if (groupInviteLink) {
    ctx.telegram.sendMessage(chatId, `Join our group: ${groupInviteLink}`);
  } else {
    ctx.telegram.sendMessage(chatId, 'Group invitation link is not available.');
  }
}

module.exports = {
  inviteUserToGroup
};
