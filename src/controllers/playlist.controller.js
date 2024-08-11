import { response } from "express";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse";


export const  createPlaylist= asyncHandler(async(req,res)=>{
    const {name, description}= req.body;
    if(!name||!description){
        throw new ApiError(400,"Please provide name and description");
    }
    const createPlaylist= await Playlist.create({
        name,
        description,
        owner: req.user?._id
    });
    if(!createPlaylist){
        throw new ApiError(400,"Failed to create playlist");
    }
    return res.status(200).json(200,createPlaylist,'Playlist created successfully');
});
export const addVideoToPlaylist= asyncHandler(async(req,res)=>{
    const {playlistId,videoId}=req.body;

    if(!playlistId && !videoId){
        throw new ApiError(400,"PlaylistId and videoId is required");
    }
    const playlist = await Playlist.findByIdAndUpdate(playlistId,{
        $push:{video:videoId}
    },{new :true});
    if(!playlist){
        throw new ApiError(404, "PlayList not found");
    }

    return res.status(200)
    .json(new ApiResponse(200,playlist,"Video added to playlist successfully"));

});
export const 