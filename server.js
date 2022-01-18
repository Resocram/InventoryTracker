const express = require("express")
const path = require('path');
const inventoryRoute = require('./routing/inventory')
const host = "localhost"
const port = 3000

//const db = new Database("mongodb://localhost:27017", "shopify-inventory");
const clientApp = path.join(__dirname, 'client');
let app = express()
app.use(express.json()) 						// to parse application/json
app.use(express.urlencoded({ extended: true })) // to parse application/x-www-form-urlencoded
app.use('/', express.static(clientApp, { extensions: ['html'] }));
app.use("/inventory",inventoryRoute);
app.listen(port, () => {
	console.log(`${new Date()}  App Started. Listening on ${host}:${port}, serving ${clientApp}`);
});

// InventoryItem
// id. name,Cost, Country_of_origin,