'use strict'

var express = require('express');
var ArticleController = require('../controllers/article')

var router = express.Router();
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './upload/articles'})
//rutas de test
router.post('/datos-curso', ArticleController.datosCurso);
router.get('/test-de-controller', ArticleController.test);

router.get('/get-article/:id', ArticleController.getArticle);
router.get('/get-articles/:last?', ArticleController.getArticles);
router.put('/article-update/:id', ArticleController.update);
router.post('/save', ArticleController.save);
router.delete('/article-delete/:id', ArticleController.delete);
router.post('/image-upload/:id?', md_upload, ArticleController.upload);
router.get('/get-image/:image', ArticleController.getImage);
router.get('/search/:search', ArticleController.search);
module.exports = router;