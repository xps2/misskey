<template>
<x-widgets-column v-if="column.type == 'widgets'" :column="column" :is-stacked="isStacked"/>
<x-notifications-column v-else-if="column.type == 'notifications'" :column="column" :is-stacked="isStacked"/>
<x-tl-column v-else-if="column.type == 'home'" :column="column" :is-stacked="isStacked"/>
<x-tl-column v-else-if="column.type == 'local'" :column="column" :is-stacked="isStacked"/>
<x-tl-column v-else-if="column.type == 'hybrid'" :column="column" :is-stacked="isStacked"/>
<x-tl-column v-else-if="column.type == 'global'" :column="column" :is-stacked="isStacked"/>
<x-tl-column v-else-if="column.type == 'list'" :column="column" :is-stacked="isStacked"/>
<x-mentions-column v-else-if="column.type == 'mentions'" :column="column" :is-stacked="isStacked"/>
</template>

<script lang="ts">
import Vue from 'vue';
import XTlColumn from './deck.tl-column.vue';
import XNotificationsColumn from './deck.notifications-column.vue';
import XWidgetsColumn from './deck.widgets-column.vue';
import XMentionsColumn from './deck.mentions-column.vue';

export default Vue.extend({
	components: {
		XTlColumn,
		XNotificationsColumn,
		XWidgetsColumn,
		XMentionsColumn
	},

	props: {
		column: {
			type: Object,
			required: true
		},
		isStacked: {
			type: Boolean,
			required: false,
			default: false
		}
	}
});
</script>
