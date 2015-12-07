import { Hashtag } from '../models';
import { IUser, IHashtag } from '../interfaces';

export default function registerHashtags(me: IUser, hashtags: string[]): void {
	'use strict';
	hashtags.forEach(hashtag => {
		Hashtag.findOne({name: hashtag}, (err: any, existHashtag: IHashtag) => {
			if (existHashtag === null) {
				Hashtag.create({
					name: hashtag,
					users: [me.id]
				});
			} else {
				const meExist: any[] = (<any>existHashtag.users).filter((id: any) => {
					return id.toString() === me.id.toString();
				});
				if (meExist === []) {
					existHashtag.count++;
					(<any>existHashtag.users).push(me.id);
					existHashtag.save();
				}
			}
		});
	});
}
