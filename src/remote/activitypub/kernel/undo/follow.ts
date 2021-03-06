import * as mongo from 'mongodb';
import User, { IRemoteUser } from '../../../../models/user';
import config from '../../../../config';
import unfollow from '../../../../services/following/delete';
import cancelRequest from '../../../../services/following/requests/cancel';
import { IFollow } from '../../type';
import FollowRequest from '../../../../models/follow-request';

export default async (actor: IRemoteUser, activity: IFollow): Promise<void> => {
	const id = typeof activity.object == 'string' ? activity.object : activity.object.id;

	if (!id.startsWith(config.url + '/')) {
		return null;
	}

	const followee = await User.findOne({
		_id: new mongo.ObjectID(id.split('/').pop())
	});

	if (followee === null) {
		throw new Error('followee not found');
	}

	if (followee.host != null) {
		throw new Error('フォロー解除しようとしているユーザーはローカルユーザーではありません');
	}

	const req = await FollowRequest.findOne({
		followerId: actor._id,
		followeeId: followee._id
	});

	if (req) {
		await cancelRequest(followee, actor);
	} else {
		await unfollow(actor, followee);
	}
};
