import {Post} from '../../../models';
import {IUser, IPost} from '../../../interfaces';
import serializeTimeline from '../../../core/serialize-timeline';
import populateAll from '../../../core/post-populate-all';

/**
 * 指定された投稿を起点とした場合のそれ以前の会話のストリームを取得します
 * @param user API利用ユーザー
 * @param id 投稿のID
 * @param limit 取得する投稿の最大数
 */
export default function show(user: IUser, id: string, limit: number = 30): Promise<Object[]> {
	'use strict';
	return new Promise<Object[]>((resolve, reject) => {
		Post.findById(id, (findErr: any, source: IPost) => {
			if (findErr !== null) {
				reject(findErr);
			} else if (source === null) {
				reject('not-found');
			} else if (source.inReplyToPost === null) {
				resolve([]);
			} else {
				get(<string>source.inReplyToPost).then(posts => {
					// すべてpopulateする
					Promise.all(posts.map(post => populateAll(post)))
					.then(populatedTimeline => {
						// 整形
						serializeTimeline(populatedTimeline, user).then(serializedTimeline => {
							resolve(serializedTimeline);
						}, (serializeErr: any) => {
							reject(serializeErr);
						});
					}, (populatedErr: any) => {
						reject(populatedErr);
					});
				}, (err: any) => {
					reject(err);
				});
			}
		});
	});
}

function get(id: string): Promise<IPost[]> {
	'use strict';
	return new Promise<IPost[]>((resolve, reject) => {
		Post.findById(id, (err: any, post: IPost) => {
			if (err !== null) {
				reject(err);
			} else if (post.inReplyToPost === null) {
				resolve([post]);
			} else {
				get(<string>post.inReplyToPost).then(nextPosts => {
					resolve([...nextPosts, post]);
				}, (getErr: any) => {
					reject(getErr);
				});
			}
		});
	});
}
