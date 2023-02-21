const express = require('express');
const {validationResult}= require('express-validator');

module.exports = {
    register : async (req, res)=>{
        try {
            res.render('freeCourse-register',{
                title: 'Free Lesson',
                reCaptchaSiteKey: process.env.recaptcha_siteKey
            }) 
        } catch (error) {
            console.log(error.message)
            res.status(500).redirect('/500');
        }

    },
    doRegister: async (req, res)=>{
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                const oldData = req.body;
                delete oldData.password;
                delete oldData.cPassword;
                res.locals.oldData = oldData;
                const errorObj = {}
                errors.errors.forEach(element => {
                    errorObj[element.param] = element.msg;
                });
                return res.status(400).render('freeCourse-register',{
                    title: 'Free Lesson',
                    errorObj,
                    reCaptchaSiteKey: process.env.recaptcha_siteKey
                }) 
            }
            res.json(req.body);
        } catch (error) {
            console.log(error.message);
            res.status(500).redirect('/500')
        }
    }
}