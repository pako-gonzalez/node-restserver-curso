// ========
// Puerto
// ========
process.env.PORT = process.env.PORT || 3000;

// ========
// Entorno
// ========
process.env.NODE_ENV = process.env.NODE_ENV ||  'dev';

// ========
// BBDD
// ========
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb://cafe-user:123ABC@ds263571.mlab.com:63571/cafe';
}

process.env.URL_DB = urlDB;