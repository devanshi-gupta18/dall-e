import express from 'express';
import * as dotenv from 'dotenv'
import { v2 as cloudinary } from 'cloudinary';

import Post from '../mongodb/models/post.js';

dotenv.config();

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


router.route('/').get(async (req, res) => {
    try {
        const posts = await Post.find({});
        res.status(200).json({ success: true, data: posts });
    } 
    catch (err) {
        res.status(500).json({ success: false, message: 'Fetching posts failed, please try again' });
    }
});


router.route('/').post(async (req, res) => {
    try {
        const { name, prompt, photo } = req.body;
        const photoUrl = await cloudinary.uploader.upload(photo);

        const newPost = await Post.create({
            name,
            prompt,
            photo: photoUrl.url,
        });

        res.status(200).json({ success: true, data: newPost });
    } 
    catch (err) {
        res.status(500).json({ success: false, message: 'Unable to create a post, please try again' });
    }
    finally{
        console.log("problem in api");
    }
});

export default router;


// fetch
// async function query(data) {
// 	const response = await fetch(
// 		"https://router.huggingface.co/fal-ai/fal-ai/qwen-image",
// 		{
// 			headers: {
// 				Authorization: `Bearer ${process.env.HF_TOKEN}`,
// 				"Content-Type": "application/json",
// 			},
// 			method: "POST",
// 			body: JSON.stringify(data),
// 		}
// 	);
// 	const result = await response.blob();
// 	return result;
// }


// query({     sync_mode: true,
//     prompt: "\"Astronaut riding a horse\"", }).then((response) => {
//     // Use image
// });


// huggingface.js
// import { InferenceClient } from "@huggingface/inference";

// const client = new InferenceClient(process.env.HF_TOKEN);

// const image = await client.textToImage({
//     provider: "fal-ai",
//     model: "Qwen/Qwen-Image",
// 	inputs: "Astronaut riding a horse",
// 	parameters: { num_inference_steps: 5 },
// });