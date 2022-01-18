const { MongoClient, ObjectID } = require('mongodb');	// require the mongodb driver

/**
 * Uses mongodb v3.6+ - [API Documentation](http://mongodb.github.io/node-mongodb-native/3.6/api/)
 * Database wraps a mongoDB connection to provide a higher-level abstraction layer
 */
function Database(mongoUrl, dbName){
	if (!(this instanceof Database)) return new Database(mongoUrl, dbName);
	this.connected = new Promise((resolve, reject) => {
		MongoClient.connect(
			mongoUrl,
			{
				useNewUrlParser: true
			},
			(err, client) => {
				if (err) reject(err);
				else {
					console.log('[MongoClient] Connected to ' + mongoUrl + '/' + dbName);
					resolve(client.db(dbName));
				}
			}
		)
	});
	this.status = () => this.connected.then(
		db => ({ error: null, url: mongoUrl, db: dbName }),
		err => ({ error: err })
	);
}


Database.prototype.getItems = function(){
	return this.connected.then(db =>
		new Promise((resolve,reject) =>{
			let cursor = db.collection("items").find({}).toArray();
			resolve(cursor);
		})
	)
}

Database.prototype.getItemFiltered = function(filter){
	let datatype = typeof filter.value
	console.log(filter)
	if(datatype === 'number'){
		return this.connected.then(db =>
			new Promise((resolve,reject) =>{
				let cursor = filterByNumber(db,filter)
				resolve(cursor);
			})
		)
	}else if(datatype === 'string'){
		return this.connected.then(db =>
			new Promise((resolve,reject) =>{
				let cursor = filterByString(db,filter)
				resolve(cursor);
			})
		)

	}else if(datatype === 'object' && Array.isArray(filter.value)){
		return this.connected.then(db =>
			new Promise((resolve,reject) =>{
				let cursor = filterByArray(db,filter)
				resolve(cursor);
			})
		)
	}
	return Promise.reject(new Error("Invalid attribute type"))
}

// Ignore the comparator as I only check which values are present in array
function filterByArray(db, filter){
	let attribute = filter.attribute;
	let value = filter.value
	let obj = {}
	obj[attribute] = {$all: value}
	let cursor = db.collection("items").find(obj).toArray()
	return cursor;
}

// Ignore the comparator as only string matching is supported
function filterByString(db, filter){
	let attribute = filter.attribute;
	let value = filter.value
	let obj = {};
	obj[attribute] = value;
	let cursor = db.collection("items").find(obj).toArray();
	return cursor;
}

function filterByNumber(db, filter){
	let attribute = filter.attribute;
	let comparator = filter.comparator;
	let value = parseInt(filter.value);
	let obj = {};
	if(comparator === '>'){
		obj[attribute] = {$gt: value};
	}
	else if(comparator === '<'){
		obj[attribute] = {$lt: value};
	}
	else if(comparator === '='){
		obj[attribute] = {$eq: value};
	}
	let cursor = db.collection("items").find(obj).toArray();
	return cursor;
}

Database.prototype.getItem = function(id){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			let cursor = db.collection("items").findOne({_id:id});
			resolve(cursor);
		})
	)
}

Database.prototype.createItem = function(item){
	return this.connected.then(db => 
		new Promise((resolve, reject) => {
			// My design implementation strictly enforces every item to have a name.
			// If no ID is included, mongoDB will automatically generate one
			if(item.name){
				db.collection("items").insertOne(item, function(err, res){
					if(err) reject(err);
					resolve(item);
				})
			}else{
				reject(new Error("Item name not found"))
			}
		})
	)
}

Database.prototype.updateItem = function(id, item){
	return this.connected.then(db => 
		new Promise((resolve, reject) => {
			let cursor = db.collection("items").updateOne({_id:id}, {$set: item}, {upsert: false})
			resolve(cursor)
		})
	)
}

Database.prototype.deleteItem = function(id){
	return this.connected.then(db => 
		new Promise((resolve, reject) => {
			let cursor = db.collection("items").remove({_id:id})
			resolve(cursor)
		})
	)
}


module.exports = Database;