import type { PluginAPI } from '@ampcode/plugin'

export default function (amp: PluginAPI) {
	amp.registerCommand(
		'wordpress-studio-task',
		{
			title: 'WordPress Studio Task',
			category: 'wordpress',
			description: 'Append WordPress.com Studio workflow guidance to the current Amp thread.',
		},
		async (ctx) => {
			await ctx.thread?.append([
				{
					type: 'user-message',
					content:
						'Use the wordpress-creator skill, choose the smallest suitable WordPress.com implementation path, and prefer the wordpress-studio MCP server for site operations and verification.',
				},
			])
		},
	)
}
