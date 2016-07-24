import {User} from '../db/db';
import {IUser} from '../db/interfaces';

export default function(text: string): Promise<IUser[]> {
	if (text === null) {
		return Promise.resolve(null);
	}

	var mentions = text.match(/@[a-zA-Z0-9\-]+/g);

	// 重複チェック
	// http://qiita.com/cocottejs/items/7afe6d5f27ee7c36c61f
	mentions = mentions.filter(function (x, i, self) {
			return self.indexOf(x) === i;
		}
	);

	if (mentions === null) {
		return Promise.resolve(null);
	}

	return Promise.all(mentions.map(mention => new Promise<IUser>((resolve, reject) => {
		const sn = mention.replace('@', '');
		User.findOne({screenNameLower: sn.toLowerCase()}, (err: any, user: IUser) => {
			if (err !== null) {
				reject(err);
			} else {
				resolve(user);
			}
		});
	})));
}
