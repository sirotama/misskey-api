import {Post, Reply} from '../../models';
import {IApplication, IUser, IPost, IReply, IAlbumFile} from '../../interfaces';
import publishUserStream from '../../core/publish-user-stream';
import serializePost from '../../core/serialize-post';
import savePostMentions from '../../core/save-post-mentions';
import extractHashtags from '../../core/extract-hashtags';
import registerHashtags from '../../core/register-hashtags';
import getAlbumFile from '../../core/get-album-file';

/**
 * 投稿に返信します
 * @param app API利用App
 * @param user API利用ユーザー
 * @param inReplyToPostId 返信先投稿のID
 * @param text 本文
 * @param filesString 添付するファイルのIDを,で区切った文字列
 * @return 作成された投稿オブジェクト
 */
export default function(
	app: IApplication,
	user: IUser,
	inReplyToPostId: string,
	text?: string,
	filesString?: string
): Promise<Object> {
	'use strict';

	const maxTextLength = 300;
	const maxFileLength = 4;

	return new Promise<Object>((resolve, reject) => {
		// Init 'inReplyToPostId' parameter
		if (inReplyToPostId === undefined || inReplyToPostId === null || inReplyToPostId === '') {
			return reject('in-reply-to-post-id-is-required');
		}

		// Init 'text' parameter
		if (text !== undefined && text !== null) {
			text = text.trim();
			if (text.length === 0) {
				text = null;
			} else if (text.length > maxTextLength) {
				return reject('too-long-text');
			}
		} else {
			text = null;
		}

		// Init 'filesString' parameter
		let fileIds: string[] = null;
		if (filesString !== undefined && filesString !== null) {
			fileIds = filesString
				.split(',')
				.map(fileId => fileId.trim())
				.filter(fileId => fileId !== '');
			if (fileIds.length === 0) {
				fileIds = null;
			} else if (fileIds.length > maxFileLength) {
				return reject('too-many-files');
			}

			// 重複チェック
			let isRejected = false;
			fileIds.forEach(fileId => {
				let count = 0;
				fileIds.forEach(fileId2 => {
					if (fileId === fileId2) {
						count++;
						if (count === 2) {
							isRejected = true;
						}
					}
				});
			});
			if (isRejected) {
				return reject('duplicate-files');
			}
		} else {
			fileIds = null;
		}

		// テキストが無いかつ添付ファイルも無かったらエラー
		if (text === null && fileIds === null) {
			return reject('text-or-files-is-required');
		}

		// 返信先に指定されている投稿が実在するかチェック
		Post.findById(inReplyToPostId, (err: any, inReplyToPost: IPost) => {
			if (err !== null) {
				return reject(err);
			} else if (inReplyToPost === null) {
				return reject('reply-target-not-found');
			} else if (inReplyToPost.isDeleted) {
				return reject('reply-target-not-found');
			} else if (inReplyToPost.type === 'repost') {
				return reject('reply-to-repost-is-not-allowed');
			}

			// 添付ファイルがあれば添付ファイルのバリデーションを行う
			if (fileIds !== null) {
				Promise.all(fileIds.map(fileId => getAlbumFile(user.id, fileId)))
				.then(files => {
					create(files);
				}, (filesCheckErr: any) => {
					reject(filesCheckErr);
				});
			} else {
				create(null);
			}

			function create(files: IAlbumFile[] = null): void {
				// ハッシュタグ抽出
				const hashtags: string[] = extractHashtags(text);

				// 作成
				Reply.create({
					app: app !== null ? app.id : null,
					user: user.id,
					inReplyToPost: inReplyToPost.id,
					files: files !== null ? files.map(file => file.id) : null,
					text: text,
					hashtags: hashtags
				}, (createErr: any, createdReply: IReply) => {
					if (createErr !== null) {
						return reject(createErr);
					}

					// Resolve promise
					serializePost(createdReply, user).then(serialized => {
						resolve(serialized);
					}, (serializeErr: any) => {
						reject(serializeErr);
					});

					// 投稿数インクリメント
					user.postsCount++;
					user.save();

					// 返信数インクリメント
					inReplyToPost.repliesCount++;
					inReplyToPost.save();

					// ハッシュタグをデータベースに登録
					registerHashtags(user, hashtags);

					// メンションを抽出してデータベースに登録
					savePostMentions(user, createdReply, createdReply.text);

					// Streaming
					publishUserStream(user.id, {
						type: 'post',
						value: {
							id: createdReply.id
						}
					});
				});
			}
		});
	});
}
