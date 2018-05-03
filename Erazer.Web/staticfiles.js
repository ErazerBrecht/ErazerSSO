const express = require('express');
const mime = require('mime/lite');

module.exports = (wwwroot) => {
    // TODO THROW ERROR OR LOG WHEN WWWROOT IS UNDEFINED!!
    
    return express.static(wwwroot, {
        setHeaders: function (res, path) {
            if (mime.getType(path) === 'text/html') {
                res.setHeader('Cache-Control', 'public, max-age=0');
            }
            else {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
        }
    });
}