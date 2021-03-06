<template>
<div class="mk-timeline-core">
	<mk-friends-maker v-if="src == 'home' && alone"/>
	<div class="fetching" v-if="fetching">
		<mk-ellipsis-icon/>
	</div>

	<mk-notes ref="timeline" :more="existMore ? more : null">
		<p :class="$style.empty" slot="empty">
			%fa:R comments%%i18n:@empty%
		</p>
	</mk-notes>
</div>
</template>

<script lang="ts">
import Vue from 'vue';

const fetchLimit = 10;

export default Vue.extend({
	props: {
		src: {
			type: String,
			required: true
		}
	},

	data() {
		return {
			fetching: true,
			moreFetching: false,
			existMore: false,
			connection: null,
			connectionId: null,
			date: null
		};
	},

	computed: {
		alone(): boolean {
			return this.$store.state.i.followingCount == 0;
		},

		stream(): any {
			switch (this.src) {
				case 'home': return (this as any).os.stream;
				case 'local': return (this as any).os.streams.localTimelineStream;
				case 'hybrid': return (this as any).os.streams.hybridTimelineStream;
				case 'global': return (this as any).os.streams.globalTimelineStream;
				case 'mentions': return (this as any).os.stream;
			}
		},

		endpoint(): string {
			switch (this.src) {
				case 'home': return 'notes/timeline';
				case 'local': return 'notes/local-timeline';
				case 'hybrid': return 'notes/hybrid-timeline';
				case 'global': return 'notes/global-timeline';
				case 'mentions': return 'notes/mentions';
			}
		},

		canFetchMore(): boolean {
			return !this.moreFetching && !this.fetching && this.existMore;
		}
	},

	mounted() {
		this.connection = this.stream.getConnection();
		this.connectionId = this.stream.use();

		this.connection.on(this.src == 'mentions' ? 'mention' : 'note', this.onNote);
		if (this.src == 'home') {
			this.connection.on('follow', this.onChangeFollowing);
			this.connection.on('unfollow', this.onChangeFollowing);
		}

		document.addEventListener('keydown', this.onKeydown);

		this.fetch();
	},

	beforeDestroy() {
		this.connection.off(this.src == 'mentions' ? 'mention' : 'note', this.onNote);
		if (this.src == 'home') {
			this.connection.off('follow', this.onChangeFollowing);
			this.connection.off('unfollow', this.onChangeFollowing);
		}
		this.stream.dispose(this.connectionId);

		document.removeEventListener('keydown', this.onKeydown);
	},

	methods: {
		fetch() {
			this.fetching = true;

			(this.$refs.timeline as any).init(() => new Promise((res, rej) => {
				(this as any).api(this.endpoint, {
					limit: fetchLimit + 1,
					untilDate: this.date ? this.date.getTime() : undefined,
					includeMyRenotes: this.$store.state.settings.showMyRenotes,
					includeRenotedMyNotes: this.$store.state.settings.showRenotedMyNotes,
					includeLocalRenotes: this.$store.state.settings.showLocalRenotes
				}).then(notes => {
					if (notes.length == fetchLimit + 1) {
						notes.pop();
						this.existMore = true;
					}
					res(notes);
					this.fetching = false;
					this.$emit('loaded');
				}, rej);
			}));
		},

		more() {
			if (!this.canFetchMore) return;

			this.moreFetching = true;

			const promise = (this as any).api(this.endpoint, {
				limit: fetchLimit + 1,
				untilId: (this.$refs.timeline as any).tail().id,
				includeMyRenotes: this.$store.state.settings.showMyRenotes,
				includeRenotedMyNotes: this.$store.state.settings.showRenotedMyNotes,
				includeLocalRenotes: this.$store.state.settings.showLocalRenotes
			});

			promise.then(notes => {
				if (notes.length == fetchLimit + 1) {
					notes.pop();
				} else {
					this.existMore = false;
				}
				notes.forEach(n => (this.$refs.timeline as any).append(n));
				this.moreFetching = false;
			});

			return promise;
		},

		onNote(note) {
			// Prepend a note
			(this.$refs.timeline as any).prepend(note);
		},

		onChangeFollowing() {
			this.fetch();
		},

		focus() {
			(this.$refs.timeline as any).focus();
		},

		warp(date) {
			this.date = date;
			this.fetch();
		},

		onKeydown(e) {
			if (e.target.tagName != 'INPUT' && e.target.tagName != 'TEXTAREA') {
				if (e.which == 84) { // t
					this.focus();
				}
			}
		}
	}
});
</script>

<style lang="stylus" scoped>
@import '~const.styl'

.mk-timeline-core
	> .mk-friends-maker
		border-bottom solid 1px #eee

	> .fetching
		padding 64px 0

</style>

<style lang="stylus" module>
.empty
	display block
	margin 0 auto
	padding 32px
	max-width 400px
	text-align center
	color #999

	> [data-fa]
		display block
		margin-bottom 16px
		font-size 3em
		color #ccc

</style>
