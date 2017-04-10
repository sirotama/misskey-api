import {IApplication, IUser} from '../../db/interfaces';
import create from '../../endpoints/posts/create';
import {logInfo} from 'log-cool';

export default function(
	app: IApplication,
	user: IUser,
	req: any,
	res: any
): void {
	create(
		app,
		user,
		req.payload['text'],
		req.payload['files']
	).then(post => {
		res({'result': true, post});
	}, (err: any) => {
		logInfo(JSON.stringify({'result': false, error: err}));
		res({'result': false, error:err}).code(400);
	});
}
