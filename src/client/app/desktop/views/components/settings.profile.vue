<template>
<div class="profile">
	<label class="avatar ui from group">
		<p>%i18n:@avatar%</p>
		<img class="avatar" :src="$store.state.i.avatarUrl" alt="avatar"/>
		<button class="ui" @click="updateAvatar">%i18n:@choice-avatar%</button>
	</label>
	<label class="ui from group">
		<p>%i18n:@name%</p>
		<input v-model="name" type="text" class="ui"/>
	</label>
	<label class="ui from group">
		<p>%i18n:@location%</p>
		<input v-model="location" type="text" class="ui"/>
	</label>
	<label class="ui from group">
		<p>%i18n:@description%</p>
		<textarea v-model="description" class="ui"></textarea>
	</label>
	<label class="ui from group">
		<p>%i18n:@birthday%</p>
		<input type="date" v-model="birthday"/>
	</label>
	<button class="ui primary" @click="save">%i18n:@save%</button>
	<section>
		<h2>%i18n:@locked-account%</h2>
		<mk-switch v-model="$store.state.i.isLocked" @change="onChangeIsLocked" text="%i18n:@is-locked%"/>
	</section>
	<section>
		<h2>%i18n:@other%</h2>
		<mk-switch v-model="$store.state.i.isBot" @change="onChangeIsBot" text="%i18n:@is-bot%"/>
		<mk-switch v-model="$store.state.i.isCat" @change="onChangeIsCat" text="%i18n:@is-cat%"/>
		<mk-switch v-model="alwaysMarkNsfw" text="%i18n:common.always-mark-nsfw%"/>
	</section>
</div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	data() {
		return {
			name: null,
			location: null,
			description: null,
			birthday: null,
		};
	},
	computed: {
		alwaysMarkNsfw: {
			get() { return this.$store.state.i.settings.alwaysMarkNsfw; },
			set(value) { (this as any).api('i/update', { alwaysMarkNsfw: value }); }
		},
	},
	created() {
		this.name = this.$store.state.i.name || '';
		this.location = this.$store.state.i.profile.location;
		this.description = this.$store.state.i.description;
		this.birthday = this.$store.state.i.profile.birthday;
	},
	methods: {
		updateAvatar() {
			(this as any).apis.updateAvatar();
		},
		save() {
			(this as any).api('i/update', {
				name: this.name || null,
				location: this.location || null,
				description: this.description || null,
				birthday: this.birthday || null
			}).then(() => {
				(this as any).apis.notify('%i18n:@profile-updated%');
			});
		},
		onChangeIsLocked() {
			(this as any).api('i/update', {
				isLocked: this.$store.state.i.isLocked
			});
		},
		onChangeIsBot() {
			(this as any).api('i/update', {
				isBot: this.$store.state.i.isBot
			});
		},
		onChangeIsCat() {
			(this as any).api('i/update', {
				isCat: this.$store.state.i.isCat
			});
		}
	}
});
</script>

<style lang="stylus" scoped>
.profile
	> .avatar
		> img
			display inline-block
			vertical-align top
			width 64px
			height 64px
			border-radius 4px

		> button
			margin-left 8px

</style>

