"use strict";

let _ = require("lodash"),
  config = process.config.global_config,
  multer = require("multer"),
  fs = require("fs-promise");
const path = require("path");

const mime_type = {
  "application/vnd.ms-excel": "csv",
  "application/json": "json",
  "text/csv": "csv",
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/gif": "gif",
};

let userProfilePicture = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      callback(
        null,
        config.upload_folder + config.upload_entities.user_profile_image_folder
      );
    },
    filename: function (req, file, callback) {
      let fileName =
        Date.now() +
        Math.round(Math.random() * 10000) +
        "." +
        file.originalname.split(".")[file.originalname.split(".").length - 1];
      callback(null, fileName);
    },
  }),
});

let uploadVocationImage = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      callback(
        null,
        config.upload_folder + config.upload_entities.vocation_image_folder
      );
    },
    filename: function (req, file, callback) {
      let fileName =
        Date.now() +
        Math.round(Math.random() * 10000) +
        "." +
        file.originalname.split(".")[file.originalname.split(".").length - 1];
      callback(null, fileName);
    },
  }),
});

let uploadSubVocationImage = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      callback(
        null,
        config.upload_folder + config.upload_entities.sub_vocation_image_folder
      );
    },
    filename: function (req, file, callback) {
      let fileName =
        Date.now() +
        Math.round(Math.random() * 10000) +
        "." +
        file.originalname.split(".")[file.originalname.split(".").length - 1];
      callback(null, fileName);
    },
  }),
});

let uploadReceiverImage = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, config.upload_folder + config.upload_entities.user_images);
    },
    filename: function (req, file, callback) {
      let fileName =
        Date.now() +
        Math.round(Math.random() * 10000) +
        "." +
        file.originalname.split(".")[file.originalname.split(".").length - 1];
      callback(null, fileName);
    },
  }),
});

let uploadHrKycDocuments = multer({
  // mutiple files pdf and jpg/jpeg/png
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      callback(
        null,
        config.upload_folder + config.upload_entities.hr_kyc_documents_folder
      );
    },
    filename: function (req, file, callback) {
      let fileName =
        Date.now() +
        Math.round(Math.random() * 10000) +
        "." +
        file.originalname.split(".")[file.originalname.split(".").length - 1];
      callback(null, fileName);
    },
  }),
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg" && ext !== ".pdf") {
      return callback(new Error("Only images are allowed"));
    }
    callback(null, true);
  },
}).fields([
  { name: "GST", maxCount: 1 },
  { name: "PAN", maxCount: 1 },
]);

module.exports = {
  userProfilePicture: userProfilePicture,
  uploadReceiverImage: uploadReceiverImage,
  uploadVocationImage: uploadVocationImage,
  uploadSubVocationImage: uploadSubVocationImage,
  uploadHrKycDocuments,
};
