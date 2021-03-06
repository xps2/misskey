<template>
<div class="nav">
	<transition name="back">
		<div class="backdrop"
			v-if="isOpen"
			@click="$parent.isDrawerOpening = false"
			@touchstart="$parent.isDrawerOpening = false"
		></div>
	</transition>
	<transition name="nav">
		<div class="body" v-if="isOpen">
			<router-link class="me" v-if="$store.getters.isSignedIn" :to="`/@${$store.state.i.username}`">
				<img class="avatar" :src="$store.state.i.avatarUrl" alt="avatar"/>
				<p class="name">{{ $store.state.i | userName }}</p>
			</router-link>
			<div class="links">
				<ul>
					<li><router-link to="/" :data-active="$route.name == 'index'">%fa:home%%i18n:@timeline%%fa:angle-right%</router-link></li>
					<li><router-link to="/i/notifications" :data-active="$route.name == 'notifications'">%fa:R bell%%i18n:@notifications%<template v-if="hasUnreadNotification">%fa:circle%</template>%fa:angle-right%</router-link></li>
					<li><router-link to="/i/messaging" :data-active="$route.name == 'messaging'">%fa:R comments%%i18n:@messaging%<template v-if="hasUnreadMessagingMessage">%fa:circle%</template>%fa:angle-right%</router-link></li>
					<li v-if="$store.getters.isSignedIn && $store.state.i.isLocked"><router-link to="/i/received-follow-requests" :data-active="$route.name == 'received-follow-requests'">%fa:R envelope%%i18n:@follow-requests%<template v-if="$store.getters.isSignedIn && $store.state.i.pendingReceivedFollowRequestsCount">%fa:circle%</template>%fa:angle-right%</router-link></li>
					<li><router-link to="/reversi" :data-active="$route.name == 'reversi'">%fa:gamepad%%i18n:@game%<template v-if="hasGameInvitation">%fa:circle%</template>%fa:angle-right%</router-link></li>
				</ul>
				<ul>
					<li><router-link to="/i/widgets" :data-active="$route.name == 'widgets'">%fa:R calendar-alt%%i18n:@widgets%%fa:angle-right%</router-link></li>
					<li><router-link to="/i/favorites" :data-active="$route.name == 'favorites'">%fa:star%%i18n:@favorites%%fa:angle-right%</router-link></li>
					<li><router-link to="/i/lists" :data-active="$route.name == 'user-lists'">%fa:list%%i18n:@user-lists%%fa:angle-right%</router-link></li>
					<li><router-link to="/i/drive" :data-active="$route.name == 'drive'">%fa:cloud%%i18n:@drive%%fa:angle-right%</router-link></li>
				</ul>
				<ul>
					<li><a @click="search">%fa:search%%i18n:@search%%fa:angle-right%</a></li>
					<li><router-link to="/i/settings" :data-active="$route.name == 'settings'">%fa:cog%%i18n:@settings%%fa:angle-right%</router-link></li>
					<li v-if="$store.getters.isSignedIn && $store.state.i.isAdmin"><router-link to="/admin">%fa:terminal%<span>%i18n:@admin%</span>%fa:angle-right%</router-link></li>
					<li @click="dark"><p><template v-if="$store.state.device.darkmode">%fa:moon%</template><template v-else>%fa:R moon%</template><span>%i18n:@darkmode%</span></p></li>
				</ul>
			</div>
			<div class="announcements" v-if="announcements && announcements.length > 0">
				<article v-for="announcement in announcements">
					<span v-html="announcement.title" class="title"></span>
					<div v-html="announcement.text"></div>
				</article>
			</div>
			<a :href="aboutUrl"><p class="about">%i18n:@about%</p></a>
		</div>
	</transition>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { lang } from '../../../config';

export default Vue.extend({
	props: ['isOpen'],

	data() {
		return {
			hasGameInvitation: false,
			connection: null,
			connectionId: null,
			aboutUrl: `/docs/${lang}/about`,
			announcements: []
		};
	},

	computed: {
		hasUnreadNotification(): boolean {
			return this.$store.getters.isSignedIn && this.$store.state.i.hasUnreadNotification;
		},

		hasUnreadMessagingMessage(): boolean {
			return this.$store.getters.isSignedIn && this.$store.state.i.hasUnreadMessagingMessage;
		}
	},

	mounted() {
		(this as any).os.getMeta().then(meta => {
			this.announcements = meta.broadcasts;
		});

		if (this.$store.getters.isSignedIn) {
			this.connection = (this as any).os.stream.getConnection();
			this.connectionId = (this as any).os.stream.use();

			this.connection.on('reversi_invited', this.onReversiInvited);
			this.connection.on('reversi_no_invites', this.onReversiNoInvites);
		}
	},

	beforeDestroy() {
		if (this.$store.getters.isSignedIn) {
			this.connection.off('reversi_invited', this.onReversiInvited);
			this.connection.off('reversi_no_invites', this.onReversiNoInvites);
			(this as any).os.stream.dispose(this.connectionId);
		}
	},

	methods: {
		search() {
			const query = window.prompt('%i18n:@search%');
			if (query == null || query == '') return;
			this.$router.push(`/search?q=${encodeURIComponent(query)}`);
		},

		onReversiInvited() {
			this.hasGameInvitation = true;
		},

		onReversiNoInvites() {
			this.hasGameInvitation = false;
		},

		dark() {
			this.$store.commit('device/set', {
				key: 'darkmode',
				value: !this.$store.state.device.darkmode
			});
		}
	}
});
</script>

<style lang="stylus" scoped>
@import '~const.styl'

root(isDark)
	$color = isDark ? #c9d2e0 : #777

	.backdrop
		position fixed
		top 0
		left 0
		z-index 1025
		width 100%
		height 100%
		background isDark ? rgba(#000, 0.7) : rgba(#000, 0.2)

	.body
		position fixed
		top 0
		left 0
		z-index 1026
		width 240px
		height 100%
		overflow auto
		-webkit-overflow-scrolling touch
		background isDark ? #16191f : #fff

	.me
		display block
		margin 0
		padding 16px

		.avatar
			display inline
			max-width 64px
			border-radius 32px
			vertical-align middle

		.name
			display block
			margin 0 16px
			position absolute
			top 0
			left 80px
			padding 0
			width calc(100% - 112px)
			color $color
			line-height 96px
			overflow hidden
			text-overflow ellipsis
			white-space nowrap

	ul
		display block
		margin 16px 0
		padding 0
		list-style none

		&:first-child
			margin-top 0

		&:last-child
			margin-bottom 0

		> li
			display block
			font-size 1em
			line-height 1em

			a, p
				display block
				margin 0
				padding 0 20px
				line-height 3rem
				line-height calc(1rem + 30px)
				color $color
				text-decoration none

				&[data-active]
					color $theme-color-foreground
					background $theme-color

					> [data-fa]:last-child
						color $theme-color-foreground

				> [data-fa]:first-child
					margin-right 0.5em
					width 20px
					text-align center

				> [data-fa].circle
					margin-left 6px
					font-size 10px
					color $theme-color

				> [data-fa]:last-child
					position absolute
					top 0
					right 0
					padding 0 20px
					font-size 1.2em
					line-height calc(1rem + 30px)
					color $color
					opacity 0.5

	.announcements
		> article
			background isDark ? rgba(30, 129, 216, 0.2) : rgba(155, 196, 232, 0.2)
			color isDark ? #fff : #3f4967
			padding 16px
			margin 8px 0
			font-size 12px

			> .title
				font-weight bold

	.about
		margin 0 0 8px 0
		padding 1em 0
		text-align center
		font-size 0.8em
		color $color
		opacity 0.5

.nav-enter-active,
.nav-leave-active {
	opacity: 1;
	transform: translateX(0);
	transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.nav-enter,
.nav-leave-active {
	opacity: 0;
	transform: translateX(-240px);
}

.back-enter-active,
.back-leave-active {
	opacity: 1;
	transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.back-enter,
.back-leave-active {
	opacity: 0;
}

.nav[data-darkmode]
	root(true)

.nav:not([data-darkmode])
	root(false)

</style>
