// 参考：https://learn.microsoft.com/ja-jp/training/modules/blob-storage-image-upload-static-web-apps/5-exercise-serverless
// 生成されるのは、
// コンテナレベル
// read/create権限
// 有効期限2時間

const {
  StorageSharedKeyCredential,
  ContainerSASPermissions,
  generateBlobSASQueryParameters,
} = require("@azure/storage-blob");
const { extractConnectionStringParts } = require("./utils.js");

function generateSasToken(connectionString, container, permissions) {
  const { accountKey, accountName, url } =
    extractConnectionStringParts(connectionString);
  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey.toString("base64")
  );

  var expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 2);

  const sasKey = generateBlobSASQueryParameters(
    {
      containerName: container,
      permissions: ContainerSASPermissions.parse(permissions),
      expiresOn: expiryDate,
    },
    sharedKeyCredential
  );

  return {
    sasKey: sasKey.toString(),
    url: url,
  };
}

module.exports = async function (context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");
  // c: create
  const permissions = "rc";
  const container = "user-icons";
  context.res = {
    body: generateSasToken(
      process.env.BLOB_CONNECTION_STRING,
      container,
      permissions
    ),
  };
  context.done();
};
