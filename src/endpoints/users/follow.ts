import { UserFollowing, User } from '../../models';
import { IUserFollowing, IUser } from '../../interfaces';
import createNotification from '../../core/create-notification';

/**
 * ユーザーをフォローします
 * @param follower フォローするユーザー
 * @param followeeId フォローされるユーザーID
 */
export default function follow(follower: IUser, followeeId: string): Promise<void> {
	'use strict';
	return new Promise<void>((resolve, reject) => {
		if (follower.id.toString() === followeeId) {
			return reject('followee-is-you');
		}
		User.findById(followeeId, (userFindErr: any, followee: IUser) => {
			if (userFindErr !== null) {
				return reject(userFindErr);
			} else if (followee === null) {
				return reject('followee-not-found');
			}
			UserFollowing.findOne({
				followee: followeeId,
				follower: follower.id
			}, (followingFindErr: any, userFollowing: IUserFollowing) => {
				if (followingFindErr !== null) {
					return reject(followingFindErr);
				} else if (userFollowing !== null) {
					return reject('already-following');
				}
				UserFollowing.create({
					followee: followeeId,
					follower: follower.id
				}, (createErr: any, createdUserFollowing: IUserFollowing) => {
					if (createErr !== null) {
						return reject(createErr);
					}
					follower.followingsCount++;
					follower.save();
					followee.followersCount++;
					followee.save();
					resolve();

					// 通知を作成
					createNotification(null, followeeId, 'follow', {
						userId: follower.id
					});
				});
			});
		});
	});
}
