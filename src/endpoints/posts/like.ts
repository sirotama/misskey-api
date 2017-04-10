import {User, Post, PostLike} from '../../db/db';
import {IUser, IPost, IPostLike} from '../../db/interfaces';
import createNotification from '../../core/create-notification';

/**
 * Likeします
 * @param user ユーザー
 * @param id 対象の投稿のID
 */
export default function(user: IUser, id: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		// check user
		if (user === undefined || user === null) {
			return reject('plz-authenticate');
		} else if (user.isSuspended) {
			return reject('access-denied');
		}

		Post.findById(id, (err: any, post: IPost) => {
			if (err !== null) {
				return reject(err);
			} else if (post === null) {
				return reject('post-not-found');
			} else if (post.isDeleted) {
				return reject('post-is-deleted');
			} else if (post.type === 'repost') {
				return reject('no-like-to-repost');
			}
			PostLike.findOne({
				post: post.id,
				user: user.id
			}, (postLikeFindErr: any, postLike: IPostLike) => {
				if (postLikeFindErr !== null) {
					return reject(postLikeFindErr);
				}
				if (postLike !== null) {
					return reject('already-liked');
				}
				PostLike.create({
					post: post.id,
					user: user.id
				}, (createErr: any, createdPostLike: IPostLike) => {
					if (createErr !== null) {
						return reject(createErr);
					}
					resolve();

					// 投稿のlikesCountをインクリメント
					post.likesCount++;
					post.save();

					// ユーザーのlikesCountをインクリメント
					user.likesCount++;
					user.save();

					// 投稿の作者のlikedCountをインクリメント
					User.findById(<string>post.user, (authorFindErr: any, author: IUser) => {
						author.likedCount++;
						author.save();
					});

					// 自らに対してでなければ通知を作成
					if (post.user.toString() !== user._id.toString()) {
						createNotification(null, <string>post.user, 'like', {
							postId: post.id,
							userId: user.id
						});
					}
				});
			});
		});
	});
}
