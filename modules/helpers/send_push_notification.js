let UserModel = require("../models/User");
const { messaging } = require('../../app');
let config = process.config.global_config;

const sendFirebaseNotification = async (v_title, t_message, v_image_path = '', type, i_news_id, news,i_user_id='') => {
  const { messaging } = require('../../app');

  let activeUsersList = "";
  
  if(i_user_id > 0 && i_user_id != "")
  {
      activeUsersList = await UserModel.findAll({
        where: {e_status : 'Active',id :i_user_id},
        raw: true
      });
  }
  else
  {    
      activeUsersList = await UserModel.findAll({
        where: {e_status : 'Active'},
        raw: true
      });
  }
    

  let device_tokens = activeUsersList?.map(user => user?.v_device_token)?.filter(deviceToken => deviceToken !== null && deviceToken !== undefined && deviceToken !== '');

  let uniqueDeviceTokens = new Set(device_tokens);

  let uniqueDeviceTokensArray = Array.from(uniqueDeviceTokens);

  if(uniqueDeviceTokensArray?.length > 0) {
    let message = {
      "tokens": uniqueDeviceTokensArray,
      "notification": {
        "title": v_title,
        "body": t_message,
        //"image_url" : '',
        "image" : ''
      },
      "sound": "default",
      "apns":{
          "payload": {
            "aps": 
            {
              "sound": "default",
              "mutable-content":1
            }
          },
          "fcm_options":
          {
            "image":""
          }
      },
      "data" : {
        "i_news_id" : i_news_id ? JSON.stringify(i_news_id) : "",
        "news_detail" : news ? JSON.stringify(news) : "",
       }
    };

    if(type == 'News') {
      message.notification.body = message.notification.title,
      message.notification.title = ''
      
      v_image_path = news.v_image_name ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.news_image_folder + news.v_image_name : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + 'NO_IMAGE_FOUND.jpg';

    } else {
      delete message.data.i_news_id
      delete message.data.news_detail
    }
    
    if (v_image_path) {
      message.notification.image = v_image_path;
      //message.notification.image_url = v_image_path;
      message.apns.fcm_options.image = v_image_path;

      //message.data.image_url = v_image_path;
      //message.data.image_url = v_image_path;
    }

  
    console.log(message)

    messaging.sendMulticast(message)
      .then((response) => {
        // Response is an object with results for each token
        response.responses.forEach((result, index) => {
          if (result.error) {
            console.error(`Failed to send notification to token ${message.tokens[index]}:`, result.error);
          } else {
            console.log(`Successfully sent notification to token ${message.tokens[index]}`);
          }
        });
      })
      .catch((error) => {
        console.error('Error sending notification:', error);
      }); 
  }
};

module.exports = {
  sendFirebaseNotification,
};
