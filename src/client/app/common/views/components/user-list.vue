<template>
<ui-container :body-togglable="true" @toggle="onToggle" :expanded="expanded">
	<template #header><slot></slot></template>

	<mk-error v-if="!fetching && !inited" @retry="init()"/>

	<div class="efvhhmdq" :class="{ iconOnly }" v-size="[{ lt: 500, class: 'narrow' }]">
		<div class="no-users" v-if="inited && us.length == 0">
			<p>{{ $t('no-users') }}</p>
		</div>
		<div class="user" v-for="user in us" :key="user.id">
			<mk-avatar class="avatar" :user="user"/>
			<div class="body" v-if="!iconOnly">
				<div class="name">
					<router-link class="name" :to="user | userPage" v-user-preview="user.id"><mk-user-name :user="user"/></router-link>
					<p class="username">@{{ user | acct }}</p>
					<p class="followed" v-if="showFollows && user.isFollowed">{{ $t('follows-you') }}</p>
				</div>
				<div class="description" v-if="user.description" :title="user.description">
					<mfm :text="user.description" :is-note="false" :author="user" :i="$store.state.i" :custom-emojis="user.emojis" :plain="true" :nowrap="true"/>
				</div>
				<mk-follow-button class="koudoku-button" v-if="$store.getters.isSignedIn && user.id != $store.state.i.id" :user="user" mini/>
			</div>
		</div>
		<button class="more" :class="{ fetching: fetchingMoreUsers }" v-if="cursor != null" @click="fetchMoreUsers()" :disabled="fetchingMoreUsers">
			<template v-if="fetchingMoreUsers"><fa icon="spinner" pulse fixed-width/></template>{{ fetchingMoreUsers ? $t('@.loading') : $t('@.load-more') }}
		</button>
	</div>
</ui-container>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../../i18n';

export default Vue.extend({
	i18n: i18n('common/views/components/user-list.vue'),

	props: {
		makePromise: {
			required: true
		},
		iconOnly: {
			type: Boolean,
			default: false
		},
		showFollows: {
			type: Boolean,
			default: false
		},
		expanded: {
			type: Boolean,
			default: true
		},
	},

	data() {
		return {
			initialized: false,
			fetching: true,
			fetchingMoreUsers: false,
			us: [],
			inited: false,
			cursor: null
		};
	},

	created() {
		if (this.expanded) this.init();
	},

	methods: {
		init() {
			this.initialized = true;
			this.fetching = true;
			this.makePromise().then(x => {
				if (Array.isArray(x)) {
					this.us = x;
				} else {
					this.us = x.users;
					this.cursor = x.cursor;
				}
				this.inited = true;
				this.fetching = false;
			}, e => {
				this.fetching = false;
			});
		},

		fetchMoreUsers() {
			this.fetchingMoreUsers = true;
			this.makePromise(this.cursor).then(x => {
				this.us = this.us.concat(x.users);
				this.cursor = x.cursor;
				this.fetchingMoreUsers = false;
			}, e => {
				this.fetchingMoreUsers = false;
			});
		},

		onToggle(show: boolean) {
			if (show && !this.initialized) this.init();
		}
	}
});
</script>

<style lang="stylus" scoped>
.efvhhmdq
	&.narrow
		> .user > .body > .name
			width 100%
			padding-right 40px

		> .user > .body > .description
			display none

	&.iconOnly
		padding 12px
		text-align center

		> .user
			display inline-block
			padding 0
			border-bottom none

			> .avatar
				display inline-block
				margin 4px

	> .no-users
		text-align center
		color var(--text)

	> .user
		display flex
		padding 16px
		border-bottom solid 1px var(--faceDivider)

		&:last-child
			border-bottom none

		> .avatar
			display block
			flex-shrink 0
			margin 0 12px 0 0
			width 42px
			height 42px
			border-radius 8px

		> .body
			display flex
			width calc(100% - 54px)

			> .name
				width 45%

				> .name
					margin 0
					font-size 16px
					line-height 24px
					color var(--text)

				> .username
					display block
					margin 0
					font-size 13px
					line-height 13px
					color var(--text)
					opacity 0.7

				> .followed
					display inline-block
					margin 0
					font-size 11px
					font-style italic
					margin-top: 2px
					color var(--text)
					opacity 0.7

			> .description
				width 55%
				color var(--text)
				line-height 42px
				white-space nowrap
				overflow hidden
				text-overflow ellipsis
				opacity 0.7
				font-size 14px
				padding-right 40px

			> .koudoku-button
				position absolute
				top 0px
				right 0px

	> .more
		display block
		width 100%
		padding 16px
		color var(--text)
		border-top solid var(--lineWidth) rgba(#000, 0.05)

		&:hover
			background rgba(#000, 0.025)

		&:active
			background rgba(#000, 0.05)

		&.fetching
			cursor wait

		> [data-icon]
			margin-right 4px

</style>
