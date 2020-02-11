import webPush from 'web-push';

const users = {};

const vapidKeys = {
  subject: 'mailto:someone@example.com',
  publicKey:
    'BLNBquv_TzEMTZI9kN3Zk-nMW3dezq1b8z2Hjh26sba2YO4wnOIKX0QJCN7DkbtNqBSCZHaOphJQaaie4HhQqE0',
  privateKey: 'n9OEHVM8bYzYGGp_MyIr_OtWAWSKGzvP_xxxL785gzU',
};

webPush.setVapidDetails(
  vapidKeys.subject,
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

export const sendPush = (id, text) => {
  users[id] = users[id] || [];

  users[id].forEach((subscription) => {
    webPush.sendNotification(subscription, text);
  });
};

export const addSubscription = (id, subscription) => {
  users[id] = users[id] || [];

  users[id].push(subscription);
};
