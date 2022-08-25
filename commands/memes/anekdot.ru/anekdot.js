const osmosis = require("osmosis");

class Anekdot {
    URL = "https://www.anekdot.ru/release/anekdot/day/";

    getAnekdotRandom() {
        let response = {jokes: []};
        return new Promise((resolve, reject) => {
            osmosis
                .get(this.URL)
                .headers({
                    "Host": "www.anekdot.ru",
                    "Cookie": "uid=AAAAAWLStloAKTTgAxjTAg=="
                })
                .set({
                    jokes: ['.topicbox > div.text']
                })
                .data(data => {
                    console.log(data)
                    response.jokes = data.jokes
                })
                .done(() => resolve(response))
                .error(console.log)
        });
    }
}

module.exports = new Anekdot();