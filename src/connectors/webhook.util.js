require('custom-env').env();
const fs = require('fs');
const errors = require('./../errors');
const ajv = new require('ajv')({ verbose: false });
// let JSONAPISerializer = require('jsonapi-serializer').Serializer;

const axios = require('axios');
const https = require('https');
require('custom-env').env();
const REJECT_UNAUTHORIZED_REQUESTS = JSON.parse(process.env.SSL_REJECT_UNAUTHORIZED);

const TIMEOUT = 300000;
const AUTH = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD
}

const webhookSchema = require('./../validator/schemas/webhook.schema');
let webhookAjv = ajv.compile(webhookSchema);

module.exports = {
    createWebhook,
    getWebhooks,
    getWebhookById,
    updateWebhook,
    deleteWebhook,
    serializeWebhook: serializeWebhooks,
    validateWebhook,
    sendNotifications,
};

function createWebhook(request) {
    // console.log(request.body);
    
    let webhook = {
        user: request.auth.user,
        type: 'webhooks',
        id: request.body.data.id,
        resourceType: request.body.data.attributes.resourceType,
        callback: request.body.data.attributes.callback,
        conditions: request.body.data.attributes.conditions,
        watching: request.body.data.relationships.watching.data
    }

    const webhooks = JSON.parse(fs.readFileSync('./data/webhooks.data.json'));
    if(webhooks.find(item => item.id === webhook.id)) {
        console.log('ID Conflict!');
        throw errors.conflictingIDs;
    }
    else {
        webhooks.push(webhook);
    }

    fs.writeFileSync('./data/webhooks.data.json', JSON.stringify(webhooks,null,2));

    return { info: 'OK' };
};

function getWebhooks(request) {
    const webhooks = JSON.parse(fs.readFileSync('./data/webhooks.data.json')).filter(webhook => webhook.user === request.user);
    let res = { data: {} };

    res.data.Items = webhooks;
    if (res.data) {
        res.status = 200;
    }
    else {
        res.status = 404;
    }

    return res;
};

function getWebhookById(request) {
    const webhooks = JSON.parse(fs.readFileSync('./data/webhooks.data.json')).filter(webhook => webhook.user === request.user);
    let res = { 
        data: { 
            Items: webhooks.find(webhook => webhook.id === request.params.id) 
        }
    };

    if (res.data.Items) {
        res.status = 200;
    }
    else {
        res.status = 404;
    }

    return res;
};

function updateWebhook(request) {

};

function deleteWebhook(request) {

};

function serializeWebhooks(data, request, meta) {
    let response = {
        jsonapi: { version: "1.0" },
        links: { self: `${request.selfUrl}` },
        data: []
    }

    if(Array.isArray(data))
        data.forEach(webhook => response.data.push(serializeWebhook(webhook,request)) );
    else
        response.data = serializeWebhook(data,request);

    return response;
};

function serializeWebhook(webhook,request) {
    let watching = webhook.watching ? [ ...webhook.watching ] : [] ;
    let serializedHook = {} 
    
    serializedHook.type = 'webhooks';
    serializedHook.id = webhook.id;
    serializedHook.links = {
        self: `${request.selfUrl+'/'+webhook.id}`
    };
    serializedHook.attributes = {
        resourceType: webhook.resourceType,
        callback: webhook.callback,
        conditions: webhook.conditions,
        secret: webhook.secret ? webhook.secret : undefined,
    }
    serializedHook.relationships = {
        watching: {
            data: watching,
            links: {
                related: `${request.selfUrl}/watching`
            }
        }
    }

    return serializedHook;
}

function validateWebhook(object) {
    // console.log('Didn\'t validate, LoL');

    let result = { valid: [], invalid: [] };
    if(Array.isArray(object)) {
        for (object of array)
            validate(webhookAjv, object, result);
    }
    else {
        validate(webhookAjv, object, result);
    }
    
    return result;
};

function validate(validation, object, result) {
    let isValid = validation(object);
  
    if(isValid){
      console.log('OK: Object <'+object.id+'> is VALID.');
      result.valid.push(object);
    }
    else {
      let message = object && object.id ? 'Object <'+object.id+'>' : 'Data';
      console.log('ERROR: '+message+' is INVALID!');
      // console.log('ERROR: '+message+' is INVALID! ' + JSON.stringify(validation.errors,null,1));
      result.invalid.push(object);
      console.log(validation.errors);
    }
}

async function sendNotifications() {
    console.log('Webhhok: Notifying clients...');
    
    let webhooks = JSON.parse(fs.readFileSync('./data/webhooks.data.json'));
    for (const webhook of webhooks) {
        let optsGet = {
            url: `/api/1.0/${webhook.resourceType}`,
            baseURL: process.env.REF_SERVER_URL,
            method: 'GET',
            auth: AUTH,
            httpsAgent: new https.Agent({ rejectUnauthorized: REJECT_UNAUTHORIZED_REQUESTS, keepAlive: true, })
        };

        let resGet = await axios(optsGet);
        resGet.data.meta = undefined;
        resGet.data.links = undefined;

        let postData = {};

        if(webhook.conditions[0] === 'alpinebits/add') {
            postData.data = resGet.data.data[0];
        } 
        else if(webhook.conditions[0] === 'alpinebits/modify') {
            postData.data = resGet.data.data[1];
        }
        else if(webhook.conditions[0] === 'alpinebits/delete') {
            postData.data = resGet.data.data[0];
            postData.data.attributes = undefined;
            postData.data.relationships = undefined;
            postData.data.links = undefined;
        }
        else {
            postData = resGet.data;
        }

        let optsPost = {
            url: webhook.callback,
            method: 'POST',
            data: JSON.stringify(postData,null,2),
            headers: {
                'Content-Type': 'application/vnd.api+json'
            },
            params: {
                secret: webhook.secret
            }
        }
        let resPost = await axios(optsPost);
    }
    
  }