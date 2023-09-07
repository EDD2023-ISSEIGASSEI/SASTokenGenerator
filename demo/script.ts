import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { BlockBlobClient } from "@azure/storage-blob";
import fs from "fs";
require("dotenv").config();

type SASToken = {
  sasKey: string;
  url: string;
};

const axiosClient = axios.create({
  baseURL: process.env.FUNCTION_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getImageUrl = async (imageName: string): Promise<string | undefined> => {
  const res = await axiosClient.get("");
  if (res.status != 200) {
    console.error("cannot get sas token");
    return undefined;
  }
  const sasToken: SASToken = res.data;
  return `${sasToken.url}/${process.env.CONTAINER_NAME}/${imageName}?${sasToken.sasKey}`;
};

const uploadImage = async (
  targetFileName: string,
  data: Buffer
): Promise<string | undefined> => {
  const fileName = `demo-${uuidv4()}`;
  const extension = targetFileName.split(".").pop();
  if (!extension) {
    console.error("cannot extract extention");
    return undefined;
  }
  const imageUrl = await getImageUrl(`${fileName}.${extension}`);
  if (!imageUrl) {
    return undefined;
  }
  const blockBlobClient = new BlockBlobClient(imageUrl);
  blockBlobClient.uploadData(data);
  return `${fileName}.${extension}`;
};

const exec = async () => {
  const imageFilePath = "demo.png";
  const image = fs.readFileSync(imageFilePath);
  const res = await uploadImage(imageFilePath, image);
  console.log(res);
};

exec();
