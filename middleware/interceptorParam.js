// Some information for printing access interface

const ExpressBrute = require("express-brute");
let store = new ExpressBrute.MemoryStore();
exports.bruteForce = new ExpressBrute(store);
exports.interceptorParam = (req, res, next) => {

    console.info("\nInterceptorParam-StartRecord------------------------------------------------")
    console.info("InterceptorParam-Access Time   : ", new Date().toLocaleString())
    console.info("InterceptorParam-Access API    : ", getAPIPath(req.originalUrl))
    console.info("InterceptorParam-Req    Body   : ", req.body)
    console.info("InterceptorParam-Req    Params : ", req.params)
    console.info("InterceptorParam-Req    Query  : ", req.query)
    return next()

}


const getAPIPath = (originalUrl) => {
    // has ?
    if (originalUrl.indexOf('?') > 0) {
        return originalUrl.substring(0, originalUrl.indexOf('?'))
    }

    return originalUrl
}
