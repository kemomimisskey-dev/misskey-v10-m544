<template>
<router-link class="ldlomzub" :to="`/${ canonical }`" v-user-preview="canonical">
	<span class="me" v-if="isMe">{{ $t('@.you') }}</span>
	<img class="avator" v-if="!isMe && avator != null" :src="avator"/>
	<span class="main">
		<span class="username">@{{ username }}</span>
		<span class="host" v-if="(host != localHost) || $store.state.settings.showFullAcct">@{{ toUnicode(host) }}</span>
	</span>
</router-link>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../../i18n';
import { toUnicode } from 'punycode/';
import { host as localHost } from '../../../config';

export default Vue.extend({
	i18n: i18n(),
	props: {
		username: {
			type: String,
			required: true
		},
		host: {
			type: String,
			required: true
		},
		customEmojis: {
			required: false,
			default: () => []
		}
	},
	data() {
		return {
			localHost
		};
	},
	computed: {
		canonical(): string {
			return `@${this.username}@${toUnicode(this.host)}`;
		},
		isMe(): boolean {
			return this.$store.getters.isSignedIn && this.canonical.toLowerCase() === `@${this.$store.state.i.username}@${toUnicode(localHost)}`.toLowerCase();
		},
		avator(): string {
			const ascii = `@${this.username}` + (this.host != localHost ? `@${this.host}` : '');
			return `/avatar/${ascii}`
		}
	},
	methods: {
		toUnicode
	}
});
</script>

<style lang="stylus" scoped>
.ldlomzub
	color var(--mfmMention)

	> .me
		pointer-events none
		user-select none
		padding 0 4px
		background var(--mfmMention)
		border solid var(--lineWidth) var(--mfmMention)
		border-radius 4px 0 0 4px
		color var(--mfmMentionForeground)

		& + .main
			padding 0 4px
			border solid var(--lineWidth) var(--mfmMention)
			border-radius 0 4px 4px 0

	> .avator
		height 1.25em
		vertical-align -0.25em
		margin-right 0.2em

	> .main
		opacity 0.5

</style>
