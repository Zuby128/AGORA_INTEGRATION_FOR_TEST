require('dotenv').config();
const express = require('express');
const { RtcTokenBuilder, RtcRole, RtmRole, RtmTokenBuilder } = require('agora-access-token');

const PORT = 8080;

const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

const app = express();

const nocache = (req, resp, next) => {
    resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    resp.header('Expires', '-1');
    resp.header('Pragma', 'no-cache');
    next();
};

const generateAccessToken = (req, resp) => {
    // set response header
    resp.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Origin", "http://localhost:4200/"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Methods: PUT,GET,POST,DELETE");
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    // get channel name
    const channelName = req.query.channelName;
    if (!channelName) {
        return resp.status(500).json({ 'error': `channel is required app` });
    }
    // get uid 
    let uid = req.query.uid;
    if (!uid || uid == '') {
        uid = 0;
    }
    // get role
    let role = RtcRole.SUBSCRIBER;
    if (req.query.role == 'publisher') {
        role = RtcRole.PUBLISHER;
    }
    // get the expire time
    let expireTime = req.query.expireTime;
    if (!expireTime || expireTime == '') {
        expireTime = 3600;
    } else {
        expireTime = parseInt(expireTime, 10);
    }
    // calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;
    // build the token
    const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);

    // return the token
    return resp.json({ 'token': token });
};

const generateRTMAccessToken = (req, resp) => {
    // set response header
    resp.header('Access-Control-Allow-Origin', '*');
    // get uid 
    let uid = req.query.uid;
    if (!uid || uid == '') {
        uid = 0;
    }
    // get role
    let role = RtmRole.SUBSCRIBER;
    if (req.query.role == 'publisher') {
        role = RtmRole.PUBLISHER;
    }
    // get the expire time
    let expireTime = req.query.expireTime;
    if (!expireTime || expireTime == '') {
        expireTime = 3600;
    } else {
        expireTime = parseInt(expireTime, 10);
    }
    // calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;
    // build the token
    const token = RtmTokenBuilder.buildToken(APP_ID, APP_CERTIFICATE, uid, role, privilegeExpireTime);

    // return the token
    return resp.json({ 'key': token });
};

app.get('/access_rtc_token', nocache, generateAccessToken);

app.get('/access_rtm_token', nocache, generateRTMAccessToken);

app.get('/a', (req, res) => {res.header('Access-Control-Allow-Origin', '*'); console.log("geldi geldei geldi"); res.sendStatus(200).send('bıuraya geliyor')})

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
