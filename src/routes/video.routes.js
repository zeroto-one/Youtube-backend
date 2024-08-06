import { Router } from "express";
import { deleteVideo, getAllVideos, getRelatedVideos, getSearchResult, getSubscribedVideos, getVideoById, incrementViewCount, uploadVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

export const router = Router();
router.use(verifyJWT); //write here to use it everywhere
//upload video router
router.route("/upload").post(
    upload.fields([
        { name: "video", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    uploadVideo
);

router.route("/delete/:id").post(deleteVideo);
router.route("/").get(getAllVideos);
router.route("/:id").get(getVideoById)
router.route("/increment-views/:id").patch(incrementViewCount);
router.route("/related/:id").get(getRelatedVideos);
router.route("/search").get(getSearchResult);
router.route("/subscribed").get(getSubscribedVideos);