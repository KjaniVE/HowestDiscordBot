const { SlashCommandBuilder, MessageFlags, PermissionsBitField} = require('discord.js');
const { logAction } = require("../../handlers/logHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the ban.')
                .setRequired(false)),

    async execute(interaction) {
        const userToBan = interaction.options.getUser('user');
        const memberToBan = interaction.guild.members.cache.get(userToBan.id);
        const reason = interaction.options.getString('reason') || 'No reason provided.';

        if (userToBan.id === interaction.guild.ownerId) {
            await logAction(interaction.guild, 'USER_BAN_FAILED', "USER IS OWNER", userToBan.id);
            userToBan.send(`${interaction.user.username} tried banning you from your own server.`);
            return interaction.reply({ content: 'You cannot ban the owner of the server. Owner has been notified', flags: MessageFlags.Ephemeral });
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            await logAction(interaction.guild, 'USER_BAN_FAILED', "NO PERMISSION TO KICK", interaction.user.id);
            return interaction.reply({ content: 'You do not have permission to ban members.', flags: MessageFlags.Ephemeral });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "I don't have permission to ban members.", flags: MessageFlags.Ephemeral });
        }

        if (!memberToBan.bannable) {
            await logAction(interaction.guild, 'USER_BAN_FAILED', `USER ${userToBan.username} NOT BANNABLE`, interaction.user.id);
            return interaction.reply({ content: `I cannot ban ${userToBan.username}. Insufficient permissions.`, flags: MessageFlags.Ephemeral });
        }

        if (userToBan.id === interaction.user.id) {
            await logAction(interaction.guild, 'USER_BAN_FAILED', "USER TRIED TO KICK THEMSELVES", userToBan.id);
            return interaction.reply({ content: 'You cannot ban yourself.', flags: MessageFlags.Ephemeral });
        }

        if (userToBan.bot) {
            await logAction(interaction.guild, 'USER_BAN_FAILED', "USER IS A BOT", userToBan.id);
            return interaction.reply({ content: 'You cannot ban a bot.', flags: MessageFlags.Ephemeral });
        }

        try {
            await userToBan.send(`You have been banned from ${interaction.guild.name} for the following reason: ${reason}`);

            await memberToBan.ban({reason: reason});

            // 9. Confirm the kick in the channel
            await interaction.reply({ content: `Successfully banend ${userToBan.tag}.`, flags: MessageFlags.Ephemeral });

            // 10. Log the kick action
            await logAction(interaction.guild, 'USER_BANNED', reason, userToBan.id);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while trying to ban this user.', flags: MessageFlags.Ephemeral });
        }
    }
};
