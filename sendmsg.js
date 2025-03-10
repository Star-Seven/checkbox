const axios = require("axios");
const { qywx, tgpushkey, qmsgkey, sckey, pushplustoken, vocechat } = config.Push
const { corpsecret, corpid, agentid, mediaid } = qywx
const { tgbotoken, chatid } = tgpushkey
const { api, uid, key } = vocechat || {}
async function sendmsg(text, isMarkdown = false) {
    console.log(text)
    if (sckey) await server(text);
    if (qmsgkey) await qmsg(text);
    if (pushplustoken) await pushplus(text);
    if (corpsecret) await wx(text);
    if (tgbotoken) await tgpush(text)
    if (vocechat && api) await vocechatP(text, true)
}

function server(msg) {
    return new Promise(async (resolve) => {
        try {
            let url
            const matchResult = sckey.match(/^sctp(\d+)t/i);
            if (matchResult) {
                url = `https://${matchResult[1]}.push.ft07.com/send/${sckey}.send?tags=CheckBox`;
            } else {
                url = `https://sctapi.ftqq.com/${sckey}.send`;
            }
            let data = `title=${encodeURI("签到盒每日任务已完成")}&desp=${encodeURI(msg.replace(/\n/g, "\n\n"))}`
            let res = await axios.post(url, data)
            if (res.data.code == 0) {
                console.log("Server酱:发送成功");
            } else {
                console.log("Server酱:发送失败");
                console.log(res.data.info);
            }
        } catch (err) {
            console.log("SCerver酱：发送接口调用失败");
            //      console.log(err.response.data.message);
        }
        resolve();
    });
}

function vocechatP(msg, isMarkdown = false) {
    return new Promise(async (resolve) => {
        try {
            let url = `${api}/api/bot/send_to_user/${uid}`;
            let headers = {
                'x-api-key': key,
                'Content-Type': isMarkdown ? 'text/markdown' : 'text/plain',
            };
            let res = await axios.post(url, msg.replace(/\n/g, `
            
`).replace(/【|】/g, "**"), { headers });
            if (res.data) {
                console.log("Vocechat: 发送成功");
            } else {
                console.log("Vocechat: 发送失败");
                console.log(res.data);
            }
        } catch (err) {
            console.log("Vocechat: 发送接口调用失败");
            console.log(err);
        }
        resolve();
    });
}

function pushplus(msg) {
    return new Promise(async (resolve) => {
        try {
            let url = "http://www.pushplus.plus/send"
            let data = {
                "token": pushplustoken,
                "title": "签到盒每日任务已完成-",
                "content": msg.replace(/\n/g, "<br>"),
                "temple": "html"
            }
            let res = await axios.post(url, data, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (res.data.code == 200) {
                console.log("pushplus:发送成功");
            } else {
                console.log("pushplus:发送失败");
                console.log(res.data.msg);
            }
        } catch (err) {
            console.log("pushplus酱：发送接口调用失败");
            console.log(err);
        }
        resolve();
    });
}

function qmsg(msg) {
    return new Promise(async (resolve) => {
        try {
            url = `https://qmsg.zendee.cn/send/${qmsgkey}`;
            res = await axios.post(url, `msg=${encodeURI(msg)}`);
            if (res.data.success) {
                console.log("qmsg酱:发送成功");
            } else {
                console.log("qmsg酱:发送失败 " + res.data.resson);

            }
        } catch (err) {
            console.log("qmsg酱:发送接口调用失败");
            console.log(err);
        }
        resolve();
    });
}

function tgpush(msg) {
    return new Promise(async (resolve) => {
        try {
            //   let url = "https://api.telegram.org/bot${tgbotoken}/sendMessage";
            //   let data=`parse_mode=Markdown&text=${msg.replace(/\n/g,"%0A").replace(/【|】/g,"*")}&chat_id=${chatid}`
            let url = `https://tg-bot.0x23.cf/bot${tgbotoken}/sendMessage?parse_mode=Markdown&text=${encodeURI(msg.replace(/【|】/g, "*"))}&chat_id=${chatid}`
            //   let res = await axios.post(url,data);
            let res = await axios.get(url);
            if (res.data.ok) {
                console.log("Tg：发送成功");
            } else {
                console.log("Tg：发送失败!");
                console.log(res.data);
            }
        } catch (err) {
            // console.log(err);
        }
        resolve();
    });
}

function wx(msg) {
    return new Promise(async (resolve) => {
        try {
            let url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${corpsecret}`
            let res = await axios.get(url)
            access_token = res.data.access_token
            let turl = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${access_token}`
            let text = {
                "touser": "@all",
                "msgtype": "text",
                "agentid": agentid ? agentid : 1000002,
                "text": {
                    "content": msg
                },
                "safe": 0
            }

            let mpnews = {
                "touser": "@all",
                "msgtype": "mpnews",
                "agentid": agentid ? agentid : 1000002,
                "mpnews": {
                    "articles": [
                        {
                            "title": "签到盒每日任务已完成",
                            "thumb_media_id": mediaid ? mediaid : "",
                            "author": "wenmoux",
                            "content_source_url": "",
                            "content": msg.replace(/\n/g, "<br>"),
                            "digest": msg
                        }
                    ]
                },
                "safe": 0
            }
            let data = mediaid ? mpnews : text
            let tres = await axios.post(turl, data)
            if (tres.data.errcode == 0) {
                console.log("企业微信:发送成功");
            } else {
                console.log("企业微信:发送失败");
                console.log(tres.data.errmsg);
            }
        } catch (err) {
            console.log("企业微信：发送接口调用失败");
            console.log(err);
        }
        resolve();
    });
}

module.exports = sendmsg