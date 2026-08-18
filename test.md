# How To Set Up A DSC Server On A VPS

This setup will also allow you to run an unlimited amount of DSC servers under the same domain meaning you only need to buy a singular [CloudFlare](https://www.cloudflare.com) domain.
Need a VPS? [ZAP Hosting](https://zap-hosting.com/MuliBovich?voucher=MuliBovich-a-5907) is what I use and recommend and get 20% off all you're orders using the provided link.
Need support? Want access to extra feature's you never knew existed? Want access to extra DSC server tools? Join my [DSC Discord](https://discord.gg/enQTBuHVsC) server for free and instant access.



#### Part 1 - Preparing You're [CloudFlare](https://www.cloudflare.com) Domain  

1. Log into the [CloudFlare](https://dash.cloudflare.com/) dashboard.  
2. On the left side of the dashboard look for "Account home", it is almost always at the top of the left control panel. [Example Image](https://files.catbox.moe/rr5iav.png)  
3. You will now see a section called "Domains", this lists all the domains that you actively own. [Example Image](https://files.catbox.moe/7muxa8.png)  
4. Look for the domain that you want you're DSC server to use and press on it.  
The domain will show as something like yourdomain.org but we will be updating this to something like dscserver.yourdomain.org later on.  
5. On the left control panel look for "DNS" and select it. [Example Image](https://files.catbox.moe/0r5ymm.png)  
6. Under "DNS" look for "Records" and select it. [Example Image](https://files.catbox.moe/co6uio.png)  
7. Seven's a big one, we now will be creating a DNS Record for you're DSC server so follow CAREFULLY:  
   1. Set the "Type" to "A". [Example Image](https://files.catbox.moe/04bses.png)  
   2. Set the "Name" to the name that you want to appear for the domain. [Example Image](https://files.catbox.moe/04bses.png)  
   3. Set the "IPv4 address" to the IP address of you're server. [Example Image](https://files.catbox.moe/04bses.png)  
   4. Set "Proxy status" off (will auto change later when it is required). [Example Image](https://files.catbox.moe/04bses.png)  

8. Select the normally Blue button called "Save".  
And just like that you're [CloudFlare](https://www.cloudflare.com) domain is ready.  
#### Part 2 - Setting Up You're VPS And The DSC Server Hoster  

1. On you're VPS open a PowerShell Windows as an Administrator and run the below commands:

New-NetFirewallRule -DisplayName "DSC HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow  

New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow  

New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow  

What do these commands do MuliBovich?  
They all open ports allowing for player's to connect to the DSC through you're domain allowing all DSC player's to connect to you're server.  
The game client is able to connect to any server however the [Web Based Version](https://www.xwilkinx.com/play/combat/latest/) of DSC is only allowed to connect to HTTPS.  
2. Place all the DSC server hoster file's into the root username on you're VPS: [Example Image](https://files.catbox.moe/n6lwm8.png)
&#x20;  C:\\Users\\YourVPSNameHere  
3. Install Caddy Windows (AMD64) from [Caddy Download](https://caddyserver.com/download)  
4. Create a folder called "caddy" in the root of you're VPS's C Drive.  
5. Place the file(s) you just downloaded into the folder you just created. (you are normally given a singular EXE). [Example Image](https://files.catbox.moe/8b2wca.png)  
6. Create a TXT file and enter in the below text: (make sure you update everything). [Example Image](https://files.catbox.moe/5gwby2.png)  
YourServerDomainHere {

&#x20;   reverse\_proxy YourVPSIPAddressHere:9200

}
7. Rename the TXT file to "Caddyfile" (no extension). [Example Image](https://files.catbox.moe/f28s3z.png)  
8. Open Command Prompt as "Administrator" and run the following commands:  

C:\\caddy\\caddy.exe run --config C:\\caddy\\Caddyfile  

sc.exe create caddy start= auto binPath= "C:\\caddy\\caddy.exe run --config C:\\caddy\\Caddyfile" DisplayName= "Caddy Web Server"  

sc.exe start caddy  

9. Start you're DSC server using the command: node server.cjs  

