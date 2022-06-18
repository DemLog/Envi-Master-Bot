const osmosis = require("osmosis");
const {MessageEmbed} = require("discord.js");

class Pikabu {
    URL = "https://185.26.99.7/tag/Мемы";

    // getInfoPage(url) {
    //     return new Promise((resolve, reject) => {
    //         osmosis
    //             .get(encodeURI(url))
    //             .headers({
    //                 "Host": "pikabu.ru",
    //                 "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:101.0) Gecko/20100101 Firefox/101.0"
    //             })
    //             .set({
    //                 countMemes: '.stories-search__feed-panel > span', currentPage: '.pagination__page_current'
    //             })
    //             .data(resolve)
    //             .error(()=>reject('🚫 Ошибка! Не возможно найти по данным тегам или недоступно соединение'))
    //     });
    // }

    getMemesPage(url) {
        let response = {countMemes: 0, memes: []};
        return new Promise((resolve, reject) => {
            osmosis
                .get(encodeURI(url))
                .headers({
                    "Host": "pikabu.ru",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:101.0) Gecko/20100101 Firefox/101.0"
                })
                .find('article.story[data-visited="false"]')
                .set({
                    title: 'a.story__title-link',
                    rating: 'div.story__rating-count',
                    time: 'time.story__datetime@datetime',
                    text: ['div.story-block_type_text > p'],
                    url: 'a.story__title-link@href',
                    image: 'img.story-image__image@data-src',
                    tags: ['.story__tags > a']
                })
                .data(data => response.memes.push(data))
                .find('.stories-search__feed-panel')
                .set({
                    countMemes: 'span'
                })
                .data(data => response.countMemes = parseInt(data.countMemes.match(/\d+/)[0]))
                .done(() => resolve(response))
                .error(() => reject('🚫 Ошибка! Не возможно найти по данным тегам или недоступно соединение'))
        })
    }

    createURLFind(tags = [], page = 1) {
        let url = String(this.URL);
        tags.forEach(tag => url += `,${tag}`);
        url += "?n=4";
        url += "&et=Длиннопост"
        if (page > 1) {
            url += `&page=${page}`;
        }
        return url;
    }

    displayDiscordEmbed(meme) {
        return new MessageEmbed()
            .setColor('#f1bb0a')
            .setTitle(meme.title)
            .setURL(meme.url)
            .setDescription(meme.text.join('\n'))
            .setTimestamp(meme.time)
            .setImage(meme.image)
            .setFooter({
                text: meme.tags.join(' | '),
                iconURL: "https://spng.pinpng.com/pngs/s/40-404256_file-number-sign-svg-hd-png.png"
            });

    }
}

module.exports = new Pikabu();