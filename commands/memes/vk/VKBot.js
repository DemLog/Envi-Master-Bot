const VKAPI = "https://api.vk.com/method/";
const request = require('request');
const {MessageEmbed} = require("discord.js");

class VKBot {
    constructor() {
        this.accessToken = require('./config.json').serviceToken;
        this.verAPI = '5.131';
    }

    getURLParams(url, params = {}) {
        let responseURL = url + '?';
        params["v"] = this.verAPI;
        params["access_token"] = this.accessToken;

        for (const [key, value] of Object.entries(params)) {
            const param = `${key}=${value}`;
            responseURL += param + '&';
        }
        return responseURL;
    }

    getPostsGroup(ownerID, offset, count) {
        const params = {
            "owner_id": ownerID, "offset": offset, "count": count, "extended": "true"
        };
        let api = this.getURLParams(VKAPI + "wall.get", params);
        return new Promise((resolve, reject) => {
            request(api, {json: true}, (err, res, body) => {
                if (err) return reject("🚫 Ошибка! Неудачное соединение к VK API, повтори позже");
                if (body.error) return reject(`🚫 Ошибка! ${body.error["error_msg"]}`);

                const response = {};
                const data = body.response;
                response["count"] = data.count;
                response["memes"] = [];

                const profiles = {};
                if (data["profiles"]) data["profiles"].forEach(user => {
                    profiles[user.id] = {name: user["first_name"] + " " + user["last_name"], photo: user["photo_100"]}
                })

                response["group"] = {
                    "id": data.groups[0]["id"], "name": data.groups[0]["name"], "photo": data.groups[0]["photo_200"]
                };
                data.items.forEach((meme, idx) => {
                    if (!meme["marked_as_ads"]) {
                        const res = {};
                        res["text"] = meme.text.split('\n');
                        res["date"] = new Date(meme.date * 1000);
                        res["likes"] = meme.likes["count"];
                        res["views"] = meme.views["count"];
                        res["photos"] = [];
                        if (meme.attachments) meme.attachments.forEach(photo => {
                            if (photo.type === "photo") {
                                const sizes = photo["photo"]["sizes"];
                                res["photos"].push(sizes[sizes.length - 1].url);
                            }
                        });
                        if (res["photos"].length === 0) return;

                        if (!meme["signer_id"]) {
                            res["author"] = {};
                        } else {
                            res["author"] = profiles[meme["signer_id"]]
                        }
                        response["memes"].push(res);
                    }
                });
                if (response["memes"].length === 0) return reject("🚫 Ошибка! В группе нет постов");
                return resolve(response);
            })
        });
    }

    // Не работает на сервисном ключе
    // findGroup(textFind) {
    //     console.log(textFind)
    //     const params = {
    //         "count": 15, "q": textFind
    //     };
    //     let api = this.getURLParams(VKAPI + "groups.search", params);
    //     console.log(encodeURI(api))
    //     return new Promise((resolve, reject) => {
    //         request(api, {json: true}, (err, res, body) => {
    //             if (err) return reject("🚫 Ошибка! Неудачное соединение к VK API, повтори позже");
    //             if (body.error) return reject(`🚫 Ошибка! ${body.error["error_msg"]}`);
    //
    //             const response = [];
    //             const data = body.response.items;
    //             data.forEach(group => response.push({
    //                 "id": group["id"],
    //                 "name": group["name"],
    //                 "slug": group["screen_name"],
    //                 "photo": group["photo_200"]
    //
    //             }))
    //             return response;
    //         })
    //     });
    // }

    checkURLGroup(url) {
        return new Promise((resolve, reject) => {
            const regexURl = /(^https?:\/{2})?(vk\.com)\/([a-z/._]+$)/g;
            if (!regexURl.test(url)) return reject("🚫 Ошибка! Неверно указанна ссылка");
            let domain = url.split('/');
            domain = domain[domain.length - 1];

            const params = {
                "group_id": domain
            };
            let api = this.getURLParams(VKAPI + "groups.getById", params);
            request(api, {json: true}, (err, res, body) => {
                if (err) return reject("🚫 Ошибка! Неудачное соединение к VK API, повтори позже");
                if (body.error) return reject(`🚫 Ошибка! ${body.error["error_msg"]}`);
                const data = body.response;
                if (data.length === 0) return reject("🚫 Ошибка! Не удалось найти данную группу");
                if (data[0]["is_closed"]) return reject("🚫 Ошибка! Данная группа закрыта");
                return resolve({
                    "id": data[0]["id"],
                    "name": data[0]["name"],
                    "slug": data[0]["screen_name"],
                    "photo": data[0]["photo_200"]
                });
            });
        });
    }

    displayDiscordEmbed(group, meme) {
        return new MessageEmbed()
            .setColor('#0091ff')
            .setTitle(group.name)
            .setDescription(meme.text.join('\n'))
            .setTimestamp(meme.date)
            .setImage(meme.photos[0]) // Временно
            .setThumbnail(group.photo)
            .setAuthor(Object.keys(meme.author).length === 0 ? null : {
                name: meme.author.name, iconURL: meme.author.photo
            })
            .setFooter({
                text: `${meme.likes} лайков | ${meme.views} просмотров`,
                iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/VK_Compact_Logo_%282021-present%29.svg/2048px-VK_Compact_Logo_%282021-present%29.svg.png"
            });
    }
}

module.exports = new VKBot();