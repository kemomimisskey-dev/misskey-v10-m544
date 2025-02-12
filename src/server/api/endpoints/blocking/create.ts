import $ from 'cafy';
import ID, { transform } from '../../../../misc/cafy-id';
import * as ms from 'ms';
import { pack } from '../../../../models/user';
import Blocking from '../../../../models/blocking';
import create from '../../../../services/blocking/create';
import define from '../../define';
import { ApiError } from '../../error';
import { getUser } from '../../common/getters';
import deleteFollowing from '../../../../services/following/delete';

export const meta = {
	stability: 'stable',

	desc: {
		'ja-JP': '指定したユーザーをブロックします。',
		'en-US': 'Block a user.'
	},

	tags: ['account'],

	limit: {
		duration: ms('1hour'),
		max: 100
	},

	requireCredential: true,

	kind: ['write:blocks', 'write:following', 'following-write'],

	params: {
		userId: {
			validator: $.type(ID),
			transform: transform,
			desc: {
				'ja-JP': '対象のユーザーのID',
				'en-US': 'Target user ID'
			}
		}
	},

	errors: {
		noSuchUser: {
			message: 'No such user.',
			code: 'NO_SUCH_USER',
			id: '7cc4f851-e2f1-4621-9633-ec9e1d00c01e'
		},

		blockeeIsYourself: {
			message: 'Blockee is yourself.',
			code: 'BLOCKEE_IS_YOURSELF',
			id: '88b19138-f28d-42c0-8499-6a31bbd0fdc6'
		},

		alreadyBlocking: {
			message: 'You are already blocking that user.',
			code: 'ALREADY_BLOCKING',
			id: '787fed64-acb9-464a-82eb-afbd745b9614'
		},
	}
};

export default define(meta, async (ps, user) => {
	const blocker = user;

	// 自分自身
	if (user._id.equals(ps.userId)) {
		throw new ApiError(meta.errors.blockeeIsYourself);
	}

	// Get blockee
	const blockee = await getUser(ps.userId).catch(e => {
		if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new ApiError(meta.errors.noSuchUser);
		throw e;
	});

	// Check if already blocking
	const exist = await Blocking.findOne({
		blockerId: blocker._id,
		blockeeId: blockee._id
	});

	if (exist !== null) {
		throw new ApiError(meta.errors.alreadyBlocking);
	}

	const follower = await getUser(ps.userId);
	const followee = user;
	await deleteFollowing(follower, followee);

	// Create blocking
	await create(blocker, blockee);

	return await pack(blockee._id, user, {
		detail: true
	});
});
