const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const joi = require('joi');

const db = require('./db');
const collection = "todo";
const app = express();

app.use(bodyParser.json());

const schema = joi.object().keys({
    todo: joi.string().required()
})

app.get('/',(req,res) =>{
    res.sendfile(path.join(__dirname, 'index.html'));
})

app.get('/getTodos',(req,res) => {
    db.getDB().collection(collection).find({}).toArray((err,documents) => {
        if(err)
            console.log(err)
        else 
            res.json(documents)
    })
})

app.put('/:id',(req,res,next) => {
    const todoID = req.params.id;
    const userInput = req.body;
    db.getDB().collection(collection).findOneAndUpdate({_id: db.getPrimaryKey(todoID)}, {$set: {todo: userInput.todo}},{returnOriginal: false},(err,result) =>{
        if(err){
            console.log(err);
        } else {
            res.json(result);
        }
    })

})

app.post('/',(req,res,next)=>{
    const userInput = req.body;
    joi.validate(userInput,schema,(err,result) => {
        if(err) {
            const error = new Error('invalid input');
            error.status = 400;
            next(error);
        } else {
            db.getDB().collection(collection).insertOne(userInput,(err,result) =>{
                if(err) {
                    const error = new Error('faild insert todo document');
                    error.status = 400;
                    next(error);
                } else {
                    res.json({result: result, document: result.ops[0],msg : "success insert tod", error:null});
                }
            });

        }
    })
})


app.delete('/:id',(req,res) => {
    const todoID = req.params.id;
    db.getDB().collection(collection).findOneAndDelete({_id:db.getPrimaryKey(todoID)},(err,result) =>{
        if(err) {
            console.log(err);
        } else {
            res.json(result);
        }
    })
})

app.use((err,req,res,next)=>{
    res.status(err.status).json({
        error: {
            message: err.message
        }
    });
})

db.connect((err) => {
    if(err) {
        console.log(err);
        process.exit(1);
    } else {
        app.listen(3000, ()=> {
            console.log("connect to mongodb,app is running on 3000 port");
        })
    }
})









