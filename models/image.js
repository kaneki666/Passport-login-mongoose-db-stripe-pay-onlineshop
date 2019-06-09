const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const crypto = require('crypto');
const path = require('path')

const mongoURI = 'mongodb+srv://Sadman:789123789456@mydb-zcwke.mongodb.net/test?retryWrites=true';

const conn = mongoose.createConnection((mongoURI), { useNewUrlParser: true });

let gfs;

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});


const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                console.log('Image Uploded In Server');
                resolve(fileInfo);
            });
        });
    }
});
const uploadimage = multer({ storage });
module.exports = uploadimage;