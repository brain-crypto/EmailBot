const { Client, Intents} = require('discord.js');
const sgMail = require('@sendgrid/mail');
const keep_alive = require('./keep_alive.js');
const database = require("@replit/database");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, "GUILD_MESSAGES"] });

let dblink = "YOUR REPLIT DATABASE LOCATION";
let roleid = "YOUR VERIFIED ROLE ID";
let channelid = "YOUR BOT COMMAND CHANNEL ID"; 
let adminid = "YOUR USER ID"; 
let servername = "YOUR SERVER NAME"; 
sgMail.setApiKey(process.env.SENDGRID_KEY)

email = {
  to: "",
  from: process.env.EMAIL,
  subject: 'Verify your server email',
  html: "",
}
const db = new database(dblink);

async function verify(msg){
  await msg.member.roles.add(roleid);
  await db.set(`${msg.author.id}_verified`, 1); 
  let email = await db.get(`${msg.author.id}_email`); 
  await db.set(`${email}_verified`, 1); 
  let name = await db.get(email);
  try {
    await msg.member.setNickname(name);
  } catch {
    await msg.channel.send(`<@${msg.author.id}> Please change your nickname to your real name.`); 
  }
}
async function verified(id){
  let verified = await db.get(`${id}_verified`);
  return verified == 1; 
}
// you need a table matching everyone's email to their name for this function to work
async function email_check(email){
  let name = await db.get(email);
  return name != null; 
}
async function insert_email(email, id){
  await db.set(`${id}_email`, email);
}
async function insert_code(code, id){
  await db.set(`${id}_code`, code);
}
async function spam_count(id){
  let count = await db.get(`${id}_spam`) + 1; 
  await db.set(`${id}_spam`, count); 
}
async function spam_check(id){
  let count = await db.get(`${id}_spam`); 
  return count > 4; 
}
async function init(id){
  let email = await db.get(`${id}_email`); 
  if (email == null) return; 
  await db.set(`${id}_email`, '');
  await db.set(`${id}_code`, 0);
  await db.set(`${id}_verified`, 0);
  await db.set(`${id}_spam`, 0);
  await db.set(`${email}_verified`, 0); 
}
async function get_code(id){
  let code = await db.get(`${id}_code`); 
  return code; 
}
client.on('ready', () => {
  client.user.setActivity("./help", {type: 'PLAYING'}); 
})
client.on('messageCreate', async msg => {
	if (msg.channel.id == channelid && msg.author.id != client.user.id) {
    msg_content = msg.content.trim();
    if (msg_content.split(" ")[0] == "./reset" && msg.author.id == adminid){
      msg_content = msg_content.split(" ")[1];
      if (isNaN(msg_content)){
        await msg.channel.send(`<@${msg.author.id}> Usage: ./reset <user id> \nFor example: ./reset 123456789`); 
      }
      else{
        await init(msg_content);
        let member = await msg.guild.members.fetch(msg_content);
        await member.roles.remove(roleid);
        await msg.channel.send(`<@${msg_content}> has been reset.`);
      }
    }
    else if (msg_content == "./help"){
      await msg.channel.send(
        "```How to verify: \n" +
        "  1. send your school email\n" +
        "  2. send the verification code you received\n\n" +
        "Admin command: \n" +
        "  ./reset <user id>```"
                             ); 
    }
		else if (await email_check(msg_content)) {
      await msg.delete(); 
			if (await spam_check(msg.author.id)) {
				await msg.channel.send(`<@${msg.author.id}> Your account has been suspended for spamming emails. Please explain to Brian why you typed in your email over five times >:(`);
			}
      else if (await verified(msg.author.id)){
        await verify(msg);
        await msg.channel.send(`<@${msg.author.id}> I have just given you your roles back, enjoy!`);
      }
			else if (!(await verified(msg_content))) {
        if (await db.get(`${msg.author.id}_email`) == null) await init(msg.author.id); 
				code = Math.floor(Math.random() * 900000 + 100000);
				await spam_count(msg.author.id);
				await insert_code(code, msg.author.id);
				await insert_email(msg_content, msg.author.id);
        email.to = msg_content; 
        email.html = `Hi there,<br><br>Your verification code for ${servername} is:<h1>${code}</h1>By getting verified, you confirm that you are using your own email and will adhere to all the server rules.<br><br>Cheers,<br>${servername} admin team<br><br><sup>This is an automated message. If you received it in error, send us a reply.</sup>`
        sgMail
          .send(email)
          .then(() => {
            msg.channel.send(`<@${msg.author.id}> Email sent. **Reply here with your verification code**. If you haven't received it, check your spam folder.`);
          })
          .catch((error) => {
            msg.channel.send(error); 
          })
			}
      else{
        await msg.channel.send(`<@${msg.author.id}> That email is already used.`);
      }
		}
    else if (msg_content.length == 6 && !isNaN(msg_content)){
      code = parseInt(msg_content);
      if (code == await get_code(msg.author.id)){
        await verify(msg);
        await msg.channel.send(`<@${msg.author.id}> You have been verified on ${servername}.`);
      }
      else{
        await msg.channel.send(`<@${msg.author.id}> Incorrect code.`);
      }
    }
    else{
      await msg.channel.send(`<@${msg.author.id}> Invalid email or command. If you need help, use ./help`);
    }
	}
  else if (msg.author.id == adminid){
    msg_content = msg.content.trim();
    if (msg_content.split(" ")[0] == "./say"){
      await msg.delete();
      await msg.channel.send(msg_content.substring(6)); 
    }
  }
})
client.login(process.env.DISCORD_TOKEN); 
