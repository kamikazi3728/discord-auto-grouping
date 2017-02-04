module.exports = function(client,args) {

  // Trigger on VOICE_STATE_UPDATE events.
	client.on('voiceStateUpdate', (oldMember, member) => {
	// Check if the user entered a new channel.
		if (member.voiceChannelID) {
			const newChannel = member.guild.channels.get(member.voiceChannelID);
		
			// If the user entered a game channel (prefixed with a game controller icon), group them into their own channel.
			if (newChannel.name.startsWith('🎮')) {
				member.guild.createChannel('Group', 'voice')
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
			if (oldChannel.name.includes('Group') && !oldChannel.members.array().length) {
				oldChannel.delete()
					.then(function() {
						console.log('[' + new Date().toISOString() + '] Deleted ' + oldChannel.type + ' channel "' + oldChannel.name + '" (' + oldChannel.id + ')');
					})
					.catch(console.error);
			}
		}
	});
}


