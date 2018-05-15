const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const categorySchema = new mongoose.Schema({
	title: {type: String, required: true},
	body: {type: String, required: true}
});

const schema = new mongoose.Schema({
	identifier: {type: String, required: true},
	content: [categorySchema]
});
schema.plugin(uniqueValidator);

module.exports = mongoose.model('HelpArticle', schema);
