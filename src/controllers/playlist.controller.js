import { response } from "express";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse";
import { isValidObjectId } from "mongoose";
import {User} from "../models/user.model.js"

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
export const removeVideoFromPlaylist =asyncHandler(async(req,res)=>{
    const {playlistId,videoId}= req.body;
    if(!isValidObjectId(playlistId)){
        throw new ApiError(404, "PlaylistId is not valid");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(404, "VideoId is not Valid");
    }
    // if(!playlistId || !videoId){
    //     throw new ApiError(400,"PlaylistId and videoId is required");
    // }
    const playlist= Playlist.findOne({_id:playlistId,owner:req.user?._id});
    if(!playlist){
        throw new ApiError(404,"PlayList not found or you are not authorized to delete this video from playlist").errors;
    }
    playlist.video.pull(videoId);
    playlist.save();

    return res.status(200)
    .json(new ApiResponse(200,{playlist},"Video deleted successfully form playlist"));


});
//this is to for trying to access public playlists of a user via username(we are not the user here)
export const getAllPlaylistsByUserName= asyncHandler(async(req,res)=>{
    //playlist collection me kitne owner currentUser hen
    const {username}= req.params;
    if(!username){
        throw new ApiError(400,"Please provide username");
    }
    const user=await User.findOne({username}).select("_id");
    if(!user){
        throw new ApiError(404, "User not found");
    }
    //we will now fetch playlist where owner is user(id)
    const playlist =await Playlist.find({owner:user})
    .populate('videos')
    .populate('owner')

    if(!playlist.length){
        return res.status(200).json(new ApiResponse(200,[],"No playList found"));
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist fetched Successfully"));
});
//get playlist by playlist Id
export const getPlaylistById= asyncHandler(async(req,res)=>{
    const {id}= req.params;
    if(!isValidObjectId(id)){
        throw new ApiError(404, "PlaylistId is not valid");
    }
    const playlist = await Playlist.findById({_id:id}).populate('videos').populate('owner');
    if(!playlist){
        return res  
    .status(200)
    .json(new ApiResponse(200,[],"No Playlist found"));
    }
    return res  
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist fetched Successfully"));

});

//update playlist
export const updatePlaylist= asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;
    const {name, description}=req.body;
    if(!isValidObjectId(playlistId)){
        throw new ApiError(404, "PlaylistId is not valid");
    }
    const user= req.user._id;

    const playlist= await Playlist.find({playlistId:playlistId,owner:user});
    if(!playlist){
        throw new ApiError(404,"Playlist not found or you are not authorized to update this playlist");
    }
    if(name){
        playlist.name=name;
    }
    if(description){
        playlist.description=description;
    }
    
    try {
        await playlist.save();
        res.status(200).json(new ApiResponse(200,playlist,"Playlist updated Successfully"))
    } catch (error) {
        throw new ApiError(500,"Failed to update Playlist , an error occurred while saving info to database");
    }

});

export const deletePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;
    if(!isValidObjectId(playlistId)){
        throw new ApiError(404, "PlaylistId is not valid");
    }
    const user= req.user._id;
    const playlist= await Playlist.findOneAndDelete({_id:playlistId,owner:user});
    if(!playlist){
        throw new ApiError(404,"Playlist not found or you are not authorized to delete this playlist");
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist deleted successfully"));

});
