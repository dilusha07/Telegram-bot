const fs = require('fs');
const path = require('path');
const registrationFilePath = path.join(__dirname, 'registration_steps.json');
const { inviteUserToGroup } = require('./group_invitation');

// Load registration steps
function loadRegistrationSteps() {
  if (!fs.existsSync(registrationFilePath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(registrationFilePath, 'utf8'));
}

// Save registration steps
function saveRegistrationSteps(steps) {
  fs.writeFileSync(registrationFilePath, JSON.stringify(steps, null, 2));
}

// Validate email
function isValidEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

// Validate name
function isValidName(name) {
  return /^[a-zA-Z ]+$/.test(name);
}

// Process registration
function processRegistration(ctx) {
  const steps = loadRegistrationSteps();
  const chatId = ctx.chat.id;
  steps[chatId] = { step: 1 };
  saveRegistrationSteps(steps);
  ctx.reply('Please enter your full name:');
}

// Continue registration
function continueRegistration(ctx) {
  const steps = loadRegistrationSteps();
  const chatId = ctx.chat.id;
  const text = ctx.message.text;

  if (steps[chatId].step === 1) {
    if (isValidName(text)) {
      steps[chatId] = { ...steps[chatId], name: text.trim(), step: 2 };
      saveRegistrationSteps(steps);
      ctx.reply('Now, please enter your email:');
    } else {
      ctx.reply('Invalid name. Please enter a valid name:');
    }
  } else if (steps[chatId].step === 2) {
    if (isValidEmail(text)) {
      steps[chatId] = { ...steps[chatId], email: text.trim().toLowerCase(), step: 3 };
      saveRegistrationSteps(steps);
      ctx.reply('Great! How many tickets do you need?');
    } else {
      ctx.reply('Invalid email. Please enter a valid email:');
    }
  } else if (steps[chatId].step === 3) {
    const tickets = parseInt(text.trim(), 10);
    if (!isNaN(tickets) && tickets > 0) {
      steps[chatId] = { ...steps[chatId], tickets, step: 4 };
      saveRegistrationSteps(steps);
      ctx.reply(`Please confirm your registration:\nName: ${steps[chatId].name}\nEmail: ${steps[chatId].email}\nTickets: ${tickets}\n\nType 'yes' to confirm or 'no' to cancel.`);
    } else {
      ctx.reply('Invalid number. Please enter a valid number of tickets:');
    }
  } else if (steps[chatId].step === 4) {
    if (text.toLowerCase() === 'yes') {
      const { name, email, tickets } = steps[chatId];
      const uniqueID = `${name}_${Date.now()}`;
      const userInfo = { chatId, name, email, tickets, id: uniqueID };
      saveUserInfo(userInfo);
      ctx.reply(`Thank you, ${name}! Your request for ${tickets} tickets has been received. Your unique ID is ${uniqueID}.`);
         // Add user to group
      inviteUserToGroup(ctx, ctx.chat.id);
      delete steps[chatId];
      saveRegistrationSteps(steps);
    } else if (text.toLowerCase() === 'no') {
      ctx.reply('Registration cancelled.');
      delete steps[chatId];
      saveRegistrationSteps(steps);
    } else {
      ctx.reply("Invalid response. Type 'yes' to confirm or 'no' to cancel.");
    }
  }

}

// Check user state
function checkUserState(chatId) {
  const steps = loadRegistrationSteps();
  return !!steps[chatId];
}

// Save user info
function saveUserInfo(userInfo) {
  const dbPath = path.join(__dirname, 'users.json');
  const users = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf8')) : [];
  users.push(userInfo);
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
}

// // Invite user to group
// function inviteUserToGroup(chatId) {
//     const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf8'));
//     const groupInviteLink = config.group_invite_link;
//     if (groupInviteLink) {
//       ctx.telegram.sendMessage(chatId, `Join our group: ${groupInviteLink}`);
//     } else {
//       ctx.telegram.sendMessage(chatId, 'Group invitation link is not available.');
//     }
//   }
  

module.exports = {
  processRegistration,
  continueRegistration,
  checkUserState
};
