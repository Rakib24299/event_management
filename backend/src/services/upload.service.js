// EventEase Upload Service

const cloudinary =
    require("../config/cloudinary");

const AppError =
    require("../utils/AppError");


// Upload Single Image

const uploadSingleImage =
    async (file, folder) => {

        if (!file) {

            throw new AppError(
                "Image file is required.",
                400
            );

        }


        const result =
            await new Promise(
                (resolve, reject) => {

                    const uploadStream =
                        cloudinary.uploader.upload_stream(
                            {
                                folder,
                                resource_type:
                                    "image",
                            },

                            (
                                error,
                                result
                            ) => {

                                if (error) {

                                    return reject(
                                        error
                                    );

                                }

                                resolve(
                                    result
                                );

                            }
                        );


                    uploadStream.end(
                        file.buffer
                    );

                }
            );


        return {

            url:
                result.secure_url,

            publicId:
                result.public_id,

        };

    };


// Upload Multiple Images

const uploadMultipleImages =
    async (
        files,
        folder
    ) => {

        if (
            !files ||
            files.length === 0
        ) {

            throw new AppError(
                "Image files are required.",
                400
            );

        }


        const uploadedImages =
            await Promise.all(

                files.map(
                    async (file) => {

                        return await uploadSingleImage(
                            file,
                            folder
                        );

                    }
                )

            );


        return uploadedImages;

    };


module.exports = {

    uploadSingleImage,

    uploadMultipleImages,

};