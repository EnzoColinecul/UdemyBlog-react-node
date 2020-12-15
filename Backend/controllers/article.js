'use stric'

var validator = require('validator');
var Article = require('../models/article');
var fs = require('fs');
var path = require('path');


var controller={
   datosCurso: (req,res) => {
        var hola=req.body.hola;
    
        return res.status(200).send({
            curso: 'Master en frameworks', 
            autor: 'Enzuco',
            hola
        });
    },
    
    test: (req, res) => {
        return res.status(200).send({
            message: 'test de controller'
        });
    },

    save: (req, res) => {

        var params = req.body;

        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        }catch(error){
            return res.status(200).send({
                message: 'Faltan datos xD'
            });
        }

        if(validate_title && validate_content){
            var article = new Article();
            //Cargar parametros
            article.title = params.title;
            article.content = params.content;
            article.image = null;
            //Guardar article
            article.save((err, articleStored) =>{
                if(err || !articleStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'no se ha guardado el article'
                    })
                };
                //Devolver Respuesta
                return res.status(200).send({
                    status: 'success',
                    article: articleStored
                });
            })
        }else{
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos'
            });
        }
    },

    getArticles: (req,res) => {

        var query = Article.find({});

        var last = req.params.last;
        if(last || last != undefined){
            query.limit(5);
        }
        query.sort('-_id').exec((err,articles) => {

            if(err){
                return res.status(500).send({
                   status: 'error',
                   message: 'Error de carga' 
                });
            }

            if(!articles){
                return res.status(404).send({
                    status:'error',
                    message: 'No hay articulos que mostrar'
                })
            }
            return res.status(200).send({
                status: 'success',
                articles
            });
        })
    },

    getArticle: (req,res) =>{
        //recoger el id de la url
        var articleId = req.params.id;

        if(!articleId || articleId == null){
            return res.status(404).send({
                status: 'error',
                message: 'No hay articulos que mostrar'
            })
        }

        Article.findById(articleId,(err,article) => {
            if(err || !article){
                return res.status(500).send({
                    status: 'error',
                    message: 'No existe el articulo'
                })
            }
            return res.status(200).send({
                status: 'success',
                article
            });
        });
    },

    update: (req,res) => {
        var articleId = req.params.id;
        var params = req.body;

        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        }catch(error){
            return res.status(200).send({
                message: 'Faltan datos xD'
            });
        }
        
        if(validate_title && validate_content){
            Article.findOneAndUpdate({_id: articleId}, params,{new:true},(err,articleUpdated) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Datos no validos'
                    });  
                }

                if(!articleUpdated){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Articulo no encontrado'
                    });  
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                });
            });
        }else{
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos'
            });
        }
    },

    delete: (req,res) => {
        var articleId = req.params.id;

        if(articleId){
            Article.findOneAndDelete({_id: articleId}, (err,articleDelete) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Datos no validos'
                    });  
                }

                if(!articleDelete){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Articulo no encontrado'
                    });  
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleDelete
                });
            });
        }else{
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos'
            });
        }
    },

    upload: (req,res) => {
        var file_name = 'imagen no subida';

        if (!req.files){
            return res.status(404).send({
                status:'error',
                message: file_name
            })
        }

        var file_path = req.files.file0.path;
        var file_split = file_path.split('/');

        var file_name = file_split[2];

        var extension_split = file_name.split('\.');

        var file_extend = extension_split[1];

        if(file_extend != 'jpg' && file_extend != 'jpeg' && file_extend != 'png' && file_extend != 'gif'){
            //borrar archivo subido 
            fs.unlink(file_path,(err) => {
                return res.status(200).send({
                    status: 'error',
                    message: 'Extension no valida'
                })
            })
        }else{
            var articleId = req.params.id;

            Article.findOneAndUpdate({_id: articleId},{image: file_name},{new: true},(err,articleUpdated) => {
                
                if(err || !articleUpdated){
                    return res.status(200).send({
                        status: 'error',
                        message: 'No se pudo actualizar la imagen'
                    })
                }

                return res.status(200).send({
                    status: 'success',
                    article:articleUpdated
                }) 
            }); 
        }
    },

    getImage: (req,res) => {
        var file = req.params.image;
        var path_file = './upload/articles/'+file;
        
        fs.exists(path_file,(exists) => {
            if (exists){
                return res.sendFile(path.resolve(path_file));
            }else{
                return res.status(200).send({
                    status: 'error',
                    message: 'No se encontro la ruta de la imagen'
                });
            }
        });
    },

    search: (req,res) => {
        // Sacar el string a buscar
        var searchString = req.params.search;

        // Find or

        Article.find({ "$or": [
            { "title": { "$regex": searchString, "$options": "i"}}, // Si lo que busco en searchString esta incluido en title, trae ese articulo
            { "content": { "$regex": searchString, "$options": "i"}} // Si lo que busco en searchString esta incluido en content, trae ese articulo
        ]})
        .sort([['date','descending']])
        .exec((err, articles) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Se produjo un error al buscar'
                });
            }

            if(!articles || articles.length <= 0){
                return res.status(404).send({
                    status: 'error',
                    message: 'No se encontraron articulos con las palabras'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });

        }); 
    }
    
};

module.exports = controller;