import {FitEnum, FormatEnum} from "sharp";

export interface IImageFormat {
    width: number,
    height: number,
    type: keyof FormatEnum,
    fit: keyof FitEnum,
}

export const getPostImageFormat = (
    width: number = 720,
    height: number = 480,
    type: string = 'jpg',
    fit: string = 'fill',
): IImageFormat => ({
    width: width,
    height: height,
    type: type as keyof  FormatEnum,
    fit: fit as keyof FitEnum
})