"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const storage_blob_1 = require("@azure/storage-blob");
const fs_1 = __importDefault(require("fs"));
require("dotenv").config();
const axiosClient = axios_1.default.create({
    baseURL: process.env.FUNCTION_URL,
    headers: {
        "Content-Type": "application/json",
    },
});
const getImageUrl = (imageName) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield axiosClient.get("");
    if (res.status != 200) {
        console.error("cannot get sas token");
        return undefined;
    }
    const sasToken = res.data;
    return `${sasToken.url}/${process.env.CONTAINER_NAME}/${imageName}?${sasToken.sasKey}`;
});
const uploadImage = (targetFileName, data) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = `demo-${(0, uuid_1.v4)()}`;
    const extension = targetFileName.split(".").pop();
    if (!extension) {
        console.error("cannot extract extention");
        return undefined;
    }
    const imageUrl = yield getImageUrl(`${fileName}.${extension}`);
    if (!imageUrl) {
        return undefined;
    }
    const blockBlobClient = new storage_blob_1.BlockBlobClient(imageUrl);
    blockBlobClient.uploadData(data);
    return `${fileName}.${extension}`;
});
const exec = () => __awaiter(void 0, void 0, void 0, function* () {
    const imageFilePath = "demo.png";
    const image = fs_1.default.readFileSync(imageFilePath);
    const res = yield uploadImage(imageFilePath, image);
    console.log(res);
});
exec();
