<template>
<div class="root photos">
	<p class="initializing" v-if="fetching">%fa:spinner .pulse .fw%%i18n:@loading%<mk-ellipsis/></p>
	<div class="stream" v-if="!fetching && images.length > 0">
		<a v-for="image in images"
			class="img"
			:style="`background-image: url(${image.media.url})`"
			:href="image.note | notePage"
		></a>
	</div>
	<p class="empty" v-if="!fetching && images.length == 0">%i18n:@no-photos%</p>
</div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	props: ['user'],
	data() {
		return {
			fetching: true,
			images: []
		};
	},
	mounted() {
		(this as any).api('users/notes', {
			userId: this.user.id,
			withFiles: true,
			limit: 6
		}).then(notes => {
			notes.forEach(note => {
				note.media.forEach(media => {
					if (this.images.length < 9) this.images.push({
						note,
						media
					});
				});
			});
			this.fetching = false;
		});
	}
});
</script>

<style lang="stylus" scoped>
.root.photos

	> .stream
		display -webkit-flex
		display -moz-flex
		display -ms-flex
		display flex
		justify-content center
		flex-wrap wrap
		padding 8px

		> .img
			flex 1 1 33%
			width 33%
			height 80px
			background-position center center
			background-size cover
			background-clip content-box
			border solid 2px transparent
			border-radius 4px

	> .initializing
	> .empty
		margin 0
		padding 16px
		text-align center
		color #aaa

		> i
			margin-right 4px

</style>

