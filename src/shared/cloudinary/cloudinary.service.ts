import { BadRequestException, Injectable } from "@nestjs/common";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    async uploadImage(
        file: Express.Multer.File,
    ): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                { folder: 'petgo_stores' },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) {
                        return reject(new BadRequestException('Erro ao fazer upload: Resposta vazia do Cloudinary'));
                    }
                    resolve(result);
                });

            const streamifier = require('streamifier');
            streamifier.createReadStream(file.buffer).pipe(upload);
        });
    }

}