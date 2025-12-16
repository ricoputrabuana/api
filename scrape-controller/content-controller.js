const axios = require("axios")
const cheerio = require("cheerio")
const { ROOT_URL } = require("../utils/options")

async function scrapeTrending(url) {
    try {
        const html = await axios.get(url, {
            timeout: 15000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8"
            }
        })

        const $ = cheerio.load(html.data)

        return {
            date: $(".date-article").text().trim(),
            title:
              $("h1#post_title").text().trim() ||
              $(".title-tag-container").text().trim(),
            content: getContent($),
            img: getImg($),
            tag: getTag($),
            doctor: getDoctor($),
            source: ROOT_URL,
        }
    } catch (err) {
        console.error("SCRAPE ERROR:", err.message)
        throw Error(err.message)
    }
}



function getTag($) {
    return Array.from($(".tag-label-container > *")).map(elm => ({
        app_link: $(elm).attr("href").split("/").pop(),
        tag: $(elm).attr("href").split("/").pop().replace("-", " "),
        source_link: ROOT_URL + $(elm).attr("href"),
    }))
}

function getImg($) {
    const img1 = $("#postContent img").attr("src")
    if (img1) return img1

    const img2 = $(".post-content img").attr("src")
    if (img2) return img2

    return null
}

function getContent($) {
    let contentType1 = "#postContent > *:not(div)"
    let contentType2 = ".post-content > *:not(div)"
    return contentLoad($, contentType1) != "" ? contentLoad($, contentType1) : contentLoad($, contentType2)
}

function contentLoad($, parameter) {
    return Array.from($(parameter)).map(elm => $(elm).text().replace(/\n/g, " ")).filter(e => e !== "")
}

module.exports = (url) => scrapeTrending(url)
