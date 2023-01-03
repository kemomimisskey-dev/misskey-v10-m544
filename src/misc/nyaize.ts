export function nyaize(text: string): string {
	return text
		// ja-JP
		.replace(/な$/gm, 'にゃ')
		.replace(/ナ/gm, 'ニャ')
		.replace(/ﾅ/gm, 'ﾆｬ')
		.replace(/(な{1})(?=。|\.|、|\,|\！|\!|\?|\？|\…|\・|\‥|\ー)/gm, 'にゃ')
		.replace(/(ナ{1})(?=。|\.|、|\,|\！|\!|\?|\？|\…|\・|\‥|\ー)/gm, 'ニャ')
		.replace(/(ﾅ{1})(?=。|\.|、|\,|\！|\!|\?|\？|\…|\・|\‥|\ー)/gm, 'ﾆｬ')
}
