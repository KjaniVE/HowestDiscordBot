const { SlashCommandBuilder, MessageFlags, PermissionsBitField} = require('discord.js');
const { logAction } = require("../../handlers/logHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the kick.')
                .setRequired(false)),

    async execute(interaction) {
        const userToKick = interaction.options.getUser('user');
        const memberToKick = interaction.guild.members.cache.get(userToKick.id);
        const reason = interaction.options.getString('reason') || 'No reason provided.';

        // 1. Check if the user is the server owner
        if (userToKick.id === interaction.guild.ownerId) {
            await logAction(interaction.guild, 'USER_KICK_FAILED', "USER IS OWNER", userToKick.id);
            userToKick.send(`${interaction.user.username} tried kicking you from your own server.`);
            return interaction.reply({ content: 'You cannot kick the owner of the server. Owner has been notified', flags: MessageFlags.Ephemeral });
        }

        // 2. Check if the command user has permission to kick members
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            await logAction(interaction.guild, 'USER_KICK_FAILED', "NO PERMISSION TO KICK", interaction.user.id);
            return interaction.reply({ content: 'You do not have permission to kick members.', flags: MessageFlags.Ephemeral });
        }

        // 3. Check if the bot has permission to kick members
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: "I don't have permission to kick members.", flags: MessageFlags.Ephemeral });
        }

        // 4. Check if the user to kick is higher in role hierarchy or not kickable
        if (!memberToKick.kickable) {
            await logAction(interaction.guild, 'USER_KICK_FAILED', `USER ${userToKick.username} NOT KICKABLE`, interaction.user.id);
            return interaction.reply({ content: `I cannot kick ${userToKick.username}. Insufficient permissions.`, flags: MessageFlags.Ephemeral });
        }

        // 5. Check if the user is trying to kick themselves
        if (userToKick.id === interaction.user.id) {
            await logAction(interaction.guild, 'USER_KICK_FAILED', "USER TRIED TO KICK THEMSELVES", userToKick.id);
            return interaction.reply({ content: 'You cannot kick yourself.', flags: MessageFlags.Ephemeral });
        }

        // 6. Check if the target is a bot
        if (userToKick.bot) {
            await logAction(interaction.guild, 'USER_KICK_FAILED', "USER IS A BOT", userToKick.id);
            return interaction.reply({ content: 'You cannot kick a bot.', flags: MessageFlags.Ephemeral });
        }

        try {
            // 7. Send a DM to the user about the kick
            await userToKick.send(`You have been kicked from ${interaction.guild.name} for the following reason: ${reason}`);

            // 8. Kick the user with the reason
            await memberToKick.kick(reason);

            // 9. Confirm the kick in the channel
            await interaction.reply({ content: `Successfully kicked ${userToKick.tag}.`, flags: MessageFlags.Ephemeral });

            // 10. Log the kick action
            await logAction(interaction.guild, 'USER_KICKED', reason, userToKick.id);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while trying to kick this user.', flags: MessageFlags.Ephemeral });
        }
    }
};
