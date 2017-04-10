import {User} from '../db/db';
import {IUser} from '../db/interfaces';

export default function(text: string): Promise<IUser[]> {
	if (text === null) {
		return Promise.reject('text-is-null');
	}

	let mentions = text.match(/@[a-zA-Z0-9\-]+/g);

	if (mentions === null) {
		return Promise.reject('text-is-no-include-mentions');
	}

	// check duplicate
	// http://qiita.com/cocottejs/items/7afe6d5f27ee7c36c61f
	mentions = mentions.filter((search: string, count: number, self: any) => {
		return self.indexOf(search) === count;
	});

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
