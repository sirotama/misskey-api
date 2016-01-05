import {PostMention} from '../../../../models';
import {IUser} from '../../../../interfaces';

/**
 * 未読のメンションの件数を取得します
 * @param user API利用ユーザー
 * @return 未読のメンションの件数
 */
export default function(user: IUser): Promise<number> {
	'use strict';

	return new Promise<number>((resolve, reject) => {
		PostMention
		.find({
			user: user.id,
			isRead: false
		})
		.limit(100)
		.count((err: any, count: number) => {
			if (err !== null) {
				return reject(err);
			}
			resolve(count);
		});
	});
}
