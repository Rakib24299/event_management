// ========================================
// EventEase Upload Controller
// ========================================

const uploadService =
    require("../services/upload.service");

const catchAsync =
    require("../utils/catchAsync");


// ========================================
// Upload Single Image
// ========================================

const uploadSingleImage =
    catchAsync(
        async (req, res) => {

            const result =
                await uploadService.uploadSingleImage(
                    req.file,
                    "eventease/events"
                );


            return res.status(200).json({

                success: true,

                message:
                    "Image uploaded successfully.",

                data: result,

            });

        }
    );


// ========================================
// Upload Multiple Images
// ========================================

const uploadMultipleImages =
    catchAsync(
        async (req, res) => {

            const result =
                await uploadService.uploadMultipleImages(
                    req.files,
                    "eventease/events/gallery"
                );


            return res.status(200).json({

                success: true,

                message:
                    "Images uploaded successfully.",

                data: result,

            });

        }
    );


module.exports = {

    uploadSingleImage,

    uploadMultipleImages,

};