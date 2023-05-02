const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose')


const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

// main().catch(err => console.log(err));

// async function main() {

//     // Connect to MongoDB  
//     await mongoose.connect('mongodb+srv://2021mt93731:YKE0qgxgO0v6CAlz@cluster0.taeysw5.mongodb.net/query-db?retryWrites=true&w=majority');

//     // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
// }

// const commentsSchema = new mongoose.Schema({
//     id: String,
//     content: String,
//     status: String
// });

// // Create a schema for a todo item
// const postSchema = new mongoose.Schema({
//     title: String,
//     postId: String,
//     comments: [commentsSchema]
// });

// // Create a model based on the schema
// const Post = mongoose.model('Post', postSchema);

const handleEvent = async (type, data) => {

    if (type === 'PostCreated') {
        const { id, title } = data;
        posts[id] = { id, title, comments: [] };
        // try {
        //     const post = await Post.create({
        //         title: title,
        //         postId: id,
        //         comments: []
        //     }); 
        //     //console.log('PostCreated:', post);
        // } catch (err) {
        //     console.log( err);
        // }

    }

    if (type === 'CommentCreated') {
        const { id, content, postId, status } = data;

        const post = posts[postId];
        post.comments.push({ id, content, status });

        // try {
        //     const post = await Post.updateOne(
        //         { postId: postId },
        //         { $push: { comments: { id: id, content: content, status: status } } }
        //     );
        //     //console.log('CommentCreated:', post);
        // } catch (err) {
        //     console.log(err);
        // }
    }

    if (type === 'CommentUpdated') {
        const { id, content, postId, status } = data;

        const post = posts[postId];
        const comment = post.comments.find(comment => {
            return comment.id === id;
        })
        comment.status = status;
        comment.content = content;

        // try {
        //     const post = await Post.updateOne(
        //         { postId: postId, 'comments.id': id },
        //         { $set: { 'comments.$.status': status } }
        //     );
        //     //console.log('CommentUpdated:', post);
        // } catch (err) {
        //     console.log(err);
        // }

    }

};

app.get('/posts', async (req, res) => {
    try {
        //const posts = await Post.find({});
        res.send(posts);
      } catch (err) {
        res.status(500).send({ error: 'Error retrieving posts' });
      }
});

app.post('/events', (req, res) => {
    const { type, data } = req.body;

    handleEvent(type, data);

    console.log('Received Event', req.body.type);
    res.send({});

});

app.listen(4002, async () => {
    console.log("Listening on 4002");

    //const res = await axios.get('http://event-bus-srv:4005/events');
    const res = await axios.get('http://localhost:4005/events');

    for (let event of res.data) {
        console.log('Processing event:', event.type);
        handleEvent(event.type, event.data);
    }
});
