import * as express from 'express';

interface IRoute {
	method: string;
	endpoint: string;
}

const handlerPath = `${__dirname}/restHandlers`;

export default function(app: express.Express): void {
	'use strict';
	console.log('Init router');

	app.get('/', (req: express.Request, res: express.Response) => {
		res.status(200).send('Rain tree sketch');
	});

	app.get('/login', require(`${handlerPath}/login`).default);
	app.get('/screenname-available', require(`${handlerPath}/screenname-available`).default);

	app.post('/account/create', require(`${handlerPath}/account/create`).default);
	app.get('/account/show', require(`${handlerPath}/account/show`).default);
	app.put('/account/update-name', require(`${handlerPath}/account/update-name`).default);
	app.put('/account/update-url', require(`${handlerPath}/account/update-url`).default);
	app.put('/account/update-icon', require(`${handlerPath}/account/update-icon`).default);

	app.get('/users/show', require(`${handlerPath}/users/show`).default);
	app.post('/users/follow', require(`${handlerPath}/users/follow`).default);
	app.delete('/users/unfollow', require(`${handlerPath}/users/unfollow`).default);
	app.get('/users/followings', require(`${handlerPath}/users/followings`).default);
	app.get('/users/followers', require(`${handlerPath}/users/followers`).default);
	app.get('/users/search', require(`${handlerPath}/users/search`).default);

	app.get('/posts/timeline', require(`${handlerPath}/posts/timeline`).default);
	app.get('/posts/user-timeline', require(`${handlerPath}/posts/user-timeline`).default);
	app.get('/posts/show', require(`${handlerPath}/posts/show`).default);
	app.get('/posts/talk', require(`${handlerPath}/posts/talk`).default);
	app.get('/posts/replies', require(`${handlerPath}/posts/replies`).default);
	app.post('/posts/status', require(`${handlerPath}/posts/status`).default);
	app.post('/posts/photo', require(`${handlerPath}/posts/photo`).default);
	app.post('/posts/favorite', require(`${handlerPath}/posts/favorite`).default);
	app.post('/posts/repost', require(`${handlerPath}/posts/repost`).default);

	app.post('/album/files/upload', require(`${handlerPath}/album/files/upload`).default);
	app.get('/album/files/show', require(`${handlerPath}/album/files/show`).default);
	app.get('/album/files/list', require(`${handlerPath}/album/files/list`).default);
	app.put('/album/files/move', require(`${handlerPath}/album/files/move`).default);
	app.put('/album/files/rename', require(`${handlerPath}/album/files/rename`).default);
	app.delete('/album/files/delete', require(`${handlerPath}/album/files/delete`).default);
	app.post('/album/folders/create', require(`${handlerPath}/album/folders/create`).default);
	app.put('/album/folders/move', require(`${handlerPath}/album/folders/move`).default);
	app.put('/album/folders/rename', require(`${handlerPath}/album/folders/rename`).default);

	app.get('/search/hashtags', require(`${handlerPath}/search/hashtags`).default);
}
