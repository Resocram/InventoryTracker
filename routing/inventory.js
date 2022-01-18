const express = require("express");
const { redirect } = require("express/lib/response");
const Database = require("./database.js")
const db = new Database("mongodb://localhost:27017","Inventory");
const router = express.Router();

router.get("/", async function(req, res){
    db.getItems().then(response =>{
        if(response){
            res.status(200);
            res.send(response);
        }else{
            res.status(404);
            res.send("Error in getting inventory")
        }
    }).catch(err =>{
        res.status(404);
        res.send(err.message)
    })
})

router.get("/filter", async function(req, res){
    if(req.query.attribute && req.query.comparator && req.query.value){
        let value = req.query.value;
        // Check if the value is a number
        if(!isNaN(value)){
            value = Number(value)
        }
        // Treat all values with a comma as a comma-separated string
        else if(value.includes(",")>-1){
            value = value.split(",").map(item => item.trim());
        }
        let filter = {
            attribute: req.query.attribute,
            comparator: req.query.comparator,
            value: value
        }

        db.getItemFiltered(filter).then(response =>{
            if(response){
                res.status(200);
                res.send(response);
            }else{
                res.status(404);
                res.send("No such item with this id")
            }
        }).catch(err =>{
            res.status(404);
            res.send(err.message)
        })
    }else{
        res.status(404);
        res.send("Missing filter requirements, must need attribute, comparator, and value")
    }
})


// router.get("/:id", async function(req, res){
//     db.getItem(req.params.id).then(response =>{
//         if(response){
//             res.status(200);
//             res.send(response);
//         }else{
//             res.status(404);
//             res.send("No such item with this id")
//         }
//     }).catch(err =>{
//         res.status(404);
//         res.send(err.message)
//     })
// })

router.post("/", async function(req, res){
    let id = req.body.id == null ? Math.random().toString() : req.body.id;
    let newItem = {
        _id: id,
        name: req.body.name,
        cost: Number(req.body.cost),
        quantity: Number(req.body.quantity),
        country: req.body.country,
        creationTime: Date.now(),
        updateTime: Date.now(),
        tags: req.body.tags
    }
    db.createItem(newItem).then(response =>{
        res.status(200);
        res.send(response);
    }).catch(err =>{
        res.status(400);
        res.send(err.message)
    })
})

router.put("/:id", async function(req, res){
    if(req.params.id){
        let newItem = {
            name: req.body.name,
            cost: req.body.cost,
            quantity: req.body.quantity,
            country: req.body.country,
            creationTime: req.body.creationTime,
            tags: req.body.tags
        }
        // Remove attributes that are blank
        Object.keys(newItem).forEach((k) => (newItem[k] == null || newItem[k] == '') && delete newItem[k]);
        db.updateItem(req.params.id,newItem).then(response =>{
            res.status(200);
            res.send(response);
        }).catch(err =>{
            res.status(400);
            res.send(err.message);
        })
    }else{
        res.status(400);
        res.send("No item ID specified")
    }
})

router.delete("/:id", async function(req, res){
    if(req.params.id){
        db.deleteItem(req.params.id).then(response =>{
            res.status(200);
            res.send(response);
        }).catch(err =>{
            res.status(400);
            res.send(err.message);
        })
    }else{
        res.status(400);
        res.send("No item ID specified")
    }
})




module.exports = router