# EmailBot
The Discord bot used for verifying members in my school's Discord server. 
## Installation
1. Create a Replit repo with index.js and keep_alive.js.
2. Create an application on [[Discord Developer Portal]](https://discord.com/developers/applications). Invite it to your server with the permission to manage roles, chnage nicknames, read and send messages, and ping members. 
4. Set DISCORD_TOKEN, SENDGRID_KEY, EMAIL, dblink, roleid, channelid, adminid and servername to appropriate values.
5. Create a table in your database mapping everyone in your organisation's email to their name.
6. Start the bot and ping it every 5 minutes with UptimeRobot.
## Function
1. Verify users using their organisation email.
2. Change users' nicknames to their real names.
## Update
1. Replit no longer supports website monitoring services. Consider using a different hosting and database provider.
2. Consider using slash commands. 
