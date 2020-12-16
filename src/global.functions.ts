import mongoose from 'mongoose';
import Path from 'path';
import fs from 'fs-extra';
import nodemailer from 'nodemailer';

export function uploadImage(file:any,model:mongoose.Model<any>,path:string,imageName:string,filter:{},update:string):Promise<object>{
    return new Promise((done,fail)=>{
        const format:string = file.mimetype.slice(file.mimetype.lastIndexOf('/',file.mimetype.length)+1);
        let directory:string = Path.join(__dirname,path);
        if(!fs.existsSync(directory))fs.mkdirSync(directory);
        fs.readdir(directory)
        .then(files=>{
            if(files.includes(imageName))fs.unlinkSync(directory+files.find(el=>el.includes(imageName)));
            file.mv(directory+imageName+"."+format,async(err:Error)=>{
                if(err){
                    console.log(err);
                    fail({
                        message:"Error al subir imagen",
                        error:err
                    })
                }else{
                    try {
                        await model.updateOne(filter,{$set:{[update]:path+imageName+"."+format}})
                        done({
                            status:true,
                            message:"Imagen subida con exito"
                        })
                    } catch (error) {
                        throw error;
                    }
                }
            })
        })
        .catch(err=>{throw err})
    })
}

export function sendEmail(from:string,email:string,subject:string,message:string):void{
    const mailOptions = {
        from:from,
        to:email,
        subject:subject,
        text:message
    };
    nodemailer.createTransport({
        host:'smtp.office365.com',
        port:587,
        secure:false,
        auth:{
            user:'safegarden2020@outlook.com',
            pass:'5af3gard3n2020'
        },
        requireTLS: true,
        tls: {
            ciphers: 'SSLv3'
        }
    })
    .sendMail(mailOptions)
    .then((info)=>{
        console.log("Mensaje mandado con exito",info.messageId,info.response);
    })
    .catch(err=>console.log("Error al manda correo electronico",err));
}