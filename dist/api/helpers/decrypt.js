"use strict";
/*
 * This file is part of WPPConnect.
 *
 * WPPConnect is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * WPPConnect is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with WPPConnect.  If not, see <https://www.gnu.org/licenses/>.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.magix = exports.mediaTypes = exports.timeout = exports.makeOptions = void 0;
var crypto = __importStar(require("crypto"));
var futoin_hkdf_1 = __importDefault(require("futoin-hkdf"));
var atob = require("atob");
var makeOptions = function (useragentOverride) { return ({
    responseType: 'arraybuffer',
    headers: {
        'User-Agent': processUA(useragentOverride),
        DNT: '1',
        'Upgrade-Insecure-Requests': '1',
        origin: 'https://web.whatsapp.com/',
        referer: 'https://web.whatsapp.com/',
    },
}); };
exports.makeOptions = makeOptions;
var timeout = function (ms) {
    return new Promise(function (res) { return setTimeout(res, ms); });
};
exports.timeout = timeout;
exports.mediaTypes = {
    IMAGE: 'Image',
    VIDEO: 'Video',
    AUDIO: 'Audio',
    PTT: 'Audio',
    DOCUMENT: 'Document',
    STICKER: 'Image',
};
var processUA = function (userAgent) {
    var ua = userAgent ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36';
    if (!ua.includes('WhatsApp'))
        ua = 'WhatsApp/2.16.352 ' + ua;
    return ua;
};
var magix = function (fileData, mediaKeyBase64, mediaType, expectedSize) {
    var encodedHex = fileData.toString('hex');
    var encodedBytes = hexToBytes(encodedHex);
    var mediaKeyBytes = base64ToBytes(mediaKeyBase64);
    var info = "WhatsApp ".concat(exports.mediaTypes[mediaType.toUpperCase()], " Keys");
    var hash = 'sha256';
    var salt = new Uint8Array(32);
    var expandedSize = 112;
    var mediaKeyExpanded = (0, futoin_hkdf_1.default)(mediaKeyBytes, expandedSize, {
        salt: salt,
        info: info,
        hash: hash,
    });
    var iv = mediaKeyExpanded.slice(0, 16);
    var cipherKey = mediaKeyExpanded.slice(16, 48);
    var decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv);
    var decoded = decipher.update(encodedBytes);
    var mediaDataBuffer = expectedSize
        ? fixPadding(decoded, expectedSize)
        : decoded;
    return mediaDataBuffer;
};
exports.magix = magix;
var fixPadding = function (data, expectedSize) {
    // Hitung padding yang dibutuhkan (untuk multiple of 16 byte)
    var padding = (16 - (expectedSize % 16) + 16) % 16;
    if (padding > 0) {
        if (expectedSize + padding == data.length) {
            // Jika paddingnya pas, trim byte yang tidak perlu
            data = data.slice(0, data.length - padding);
        }
        else if (data.length + padding == expectedSize) {
            // Jika padding diperlukan, tambahkan padding ke buffer
            var arr = new Uint8Array(padding).fill(padding); // Menggunakan Uint8Array untuk padding
            data = Buffer.concat([data, Buffer.from(arr)]);
        }
    }
    // Mengembalikan data tanpa perlu konversi ke 'utf-8' jika sudah dalam bentuk Buffer
    return data;
};
var hexToBytes = function (hexStr) {
    var intArray = [];
    for (var i = 0; i < hexStr.length; i += 2) {
        intArray.push(parseInt(hexStr.substr(i, 2), 16));
    }
    return new Uint8Array(intArray);
};
var base64ToBytes = function (base64Str) {
    var binaryStr = atob(base64Str);
    var byteArray = new Uint8Array(binaryStr.length);
    for (var i = 0; i < binaryStr.length; i++) {
        byteArray[i] = binaryStr.charCodeAt(i);
    }
    return byteArray;
};
