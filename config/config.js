/**
 * Global configuration for running server will reside here
 * ALL DB configuration, S3, and other apis calling url
 * along with their host name and port should reside here.
 *
 * This app server will get started from server/app.json file when required parameters can be
 * altered based on environment.
 */
var config = {
  /**
   * server configuration
   */
  server: {
    port: process.env.PORT,
    networkCallTimeout: 30000,
  },
  base_url: process.env.BASE_URL,
  /**
   * DB configuration
   */
  mysql: {
    database_name: process.env.DBNAME,
    user_name: process.env.DBUSER_NAME,
    password: process.env.DBPASSWORD,
    host: process.env.DBHOST,
    port: process.env.DBPORT,
  },
  upload_folder: "uploads",
  upload_entities: {
    user_images: "/user_image/",
    vocation_image_folder: "/vocation_image/",
    sub_vocation_image_folder: "/sub_vocation_image/",
    user_profile_image_folder: "/userprofile_image/",
    hr_kyc_documents_folder: "/hr_kyc_documents/",
    post_image_folder: "/post_image/",
    compnay_image_folder: "/company_image/",

    slider_image_folder: '/slider_image/',
    admin_image_folder: '/admin_profile_image/',
    countries_image_folder: '/country_image/',
    profile_image_folder: '/profile_image/',
    category_image_folder: '/category_image/',
    news_image_folder: '/news_image/',
    upcoming_service_icon_image_folder : '/upcoming_service_icon_image/',
    notification_image_folder: '/notification_image/'
  },
};

module.exports = config;
