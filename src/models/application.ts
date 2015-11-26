import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export default function application(db: mongoose.Connection): mongoose.Model<mongoose.Document> {
	'use strict';

	const schema: mongoose.Schema = new Schema({
		createdAt: { type: Date, required: true, default: Date.now },
		userId: { type: Schema.Types.ObjectId, required: true },
		appKey: { type: String, required: true },
		callbackUrl: { type: String, required: false, default: null },
		description:  { type: String, required: true },
		iconId: { type: Schema.Types.ObjectId, required: false, default: null },
		permissions: { type: [String], required: true },
		isSuspended: { type: Boolean, required: false, default: false },
		idDeleted: { type: Boolean, required: false, default: false }
	});

	if (!(<any>schema).options.toObject) {
		(<any>schema).options.toObject = {};
	}
	(<any>schema).options.toObject.transform = (doc: any, ret: any) => {
		ret.id = doc.id;
		delete ret._id;
		delete ret.__v;
	};

	return db.model('Application', schema, 'Applications');
}
