const Discord = require('discord.js');
const client = new Discord.Client();
var customchannels = 0;
var customchannellimit = 2; //set limit for number of custom channels, edit to your needs
var customchannelnames = [];

// Connect and perform routine maintenance.
client.on('ready', () => {
	console.log('[' + new Date().toISOString() + '] Connected!');
	
	// Set the online status.
	client.user.setStatus('online');
	
	// Get a list of channels.
	var channelsOrdered = client.channels.array().slice(0);
	
	// Evaluate only voice channels.
	channelsOrdered = channelsOrdered.filter(function(channel) {
		return channel.type == 'voice' && typeof channel.position !== 'undefined';
	});
	
	// Sort channels by their current position.
	channelsOrdered = channelsOrdered.sort(function(channelA, channelB) {
		return channelA.position - channelB.position;
	});
	
	// Re-sort channels to support auto-grouping and maximum voice quality.
	var currentPosition = 100;
	channelsOrdered.forEach(function(channel) {
		currentChannel = client.channels.get(channel.id);
		currentChannel.edit({bitrate: 96000, position: currentPosition})
			.then(editedChannel => {
				console.log('[' + new Date().toISOString() + '] Set ' + editedChannel.type + ' channel "' + editedChannel.name + '" (' + editedChannel.id + ') position to ' + editedChannel.position + ' with ' + editedChannel.bitrate / 1000 + 'kbps bitrate')
			})
			.catch(console.error);
		currentPosition += 100;
	});
});

function checkcustomchannels(channelname){
	var temp = false;
	for(i = 0; i<customchannelnames.length){
		if(customchannelnames[i]==channelname){
			temp = true;
		}
	}
	return temp;
}

bot.on("message", msg => {
    if(msg.channel.name=="general"){//change general to whatever chat channel is to be used with this bot, general is the default
       	if (msg.content.startsWith("!newchannel")) {
		var msgwords = msg.content.split(" ");
        	if(customchannels<customchannellimit&&msgwords.length>1){
			var newchannelname;
			for (i = 1; i < msgwords.length-1; i++) { 
    				newchannelname += msgwords[i];
			}
			if(newchannelname.length<=20||newchannelname.length<3){//can't make channels with too long or too short names, numbers editable
				msg.guild.createChannel(newchannelname, 'voice')
				customchannelnames.push(newchannelname);
					.then(createdChannel => {
						createdChannel.edit({bitrate: 96000, position: channelsOrdered[channelsOrdered.length].position + 100})
						.then(createdChannel => {
							msg.member.setVoiceChannel(createdChannel)
							.then(console.log('[' + new Date().toISOString() + '] Moved user "' + member.user.username + '#' + member.user.discriminator + '" (' + member.user.id + ') to ' + createdChannel.type + ' channel "' + createdChannel.name + '" (' + createdChannel.id + ') at position ' + createdChannel.position))
								.catch(console.error);
						})
						.catch(console.error);
					})
					.catch(console.error);
			   }
			else{
				bot.sendMessage(msg.channel, "Sorry, I can't create that channel at the moment, the channel name was either too long or too short, try a different name");
			}
		   msg.channel.sendMessage("pong!");
		   }
		else{ //too many custom channels, notify user(s) new channel cannot be created
			bot.sendMessage(msg.channel, "Sorry, I can't create that channel at the moment, I either have too many custom channels or you gave me an invalid channel name");
		}
    }
}
});

// Trigger on VOICE_STATE_UPDATE events.
client.on('voiceStateUpdate', (oldMember, member) => {
	
	// Check if the user entered a new channel.
	if (member.voiceChannelID) {
		const newChannel = member.guild.channels.get(member.voiceChannelID);
		
		// If the user entered a game channel (prefixed with a game controller icon), group them into their own channel.
		if (newChannel.name.startsWith('🎮')) {
			member.guild.createChannel('━ Group', 'voice')
				.then(createdChannel => {
					createdChannel.edit({bitrate: 96000, position: newChannel.position + 50})
						.then(createdChannel => {
							member.setVoiceChannel(createdChannel)
								.then(console.log('[' + new Date().toISOString() + '] Moved user "' + member.user.username + '#' + member.user.discriminator + '" (' + member.user.id + ') to ' + createdChannel.type + ' channel "' + createdChannel.name + '" (' + createdChannel.id + ') at position ' + createdChannel.position))
								.catch(console.error);
						})
						.catch(console.error);
				})
				.catch(console.error);
		}
	}
	
	// Check if the user came from another channel.
	if (oldMember.voiceChannelID) {
		const oldChannel = oldMember.guild.channels.get(oldMember.voiceChannelID);
		
		// Delete the user's now empty temporary channel, if applicable.
		if (oldChannel.name.includes('Group') && !oldChannel.members.array().length||checkcustomchannels(oldChannel.name) && !oldChannel.members.array().length) {
			oldChannel.delete()
				.then(function() {
					console.log('[' + new Date().toISOString() + '] Deleted ' + oldChannel.type + ' channel "' + oldChannel.name + '" (' + oldChannel.id + ')');
				})
				.catch(console.error);
		}
	}
});

client.login('');
