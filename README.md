# DSC-Discord-Bot
This code interrogates the DSC API into a Discord bot allowing user's to search for the name's of player's in game and get their in game stats.
# SetUp
Step 1. Drag and drop all file's to the file path: C:\Users\YOUR SYSTEM NAME HERE  

Step 2. Rename the file "FIXME.env" to ".env" removing the "FIXME" part of the file name.  

Step 3. Open the file ".env" and replace "BOT_TOKEN_HERE" with your Discord bot token and replace "CLIENT_ID_HERE" with your bots client ID.  

Step 4. Run the below command in an active CMD (admin or not does not matter)  
npm init -y  
npm install discord.js dotenv  

Step 5. Run the command "node register-commands.js" in CMD.  
This command registers all the commands from my code to your Discord bot. If you have any existing commands they will be over written.  

Step 6. Run the command "npm start"  
This will start the bot
# Things To Note
The bot come's with a built in RPC, no need to worry about creating your own.  
This code is free to use as all my code is but credit is appreciated.  
The bot may not be able to pull all stats about certain things from the API.  
# DSC
Discord: https://discord.gg/McdwTWCHR9  
DSC API: https://dsc.wilkingames.net/api
