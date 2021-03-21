import mongoose from 'mongoose';
import Path from 'path';
import fs from 'fs-extra';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { IUsers } from '../Api/users_sesions/sesion.users';

export function uploadImage(file: any, model: mongoose.Model<any>, path: string, imageName: string, filter: {}, update: string): Promise<object> {
    return new Promise((done, fail) => {
        const format: string = file.mimetype.slice(file.mimetype.lastIndexOf('/', file.mimetype.length) + 1);
        let directory: string = Path.join(__dirname, path);
        if (!fs.existsSync(directory)) fs.mkdirSync(directory);
        fs.readdir(directory)
            .then(files => {
                if (files.includes(imageName)) fs.unlinkSync(directory + files.find(el => el.includes(imageName)));
                file.mv(directory + imageName + "." + format, async (err: Error) => {
                    if (err) {
                        console.log(err);
                        fail({
                            message: "Error al subir imagen",
                            error: err
                        })
                    } else {
                        try {
                            await model.updateOne(filter, { $set: { [update]: path + imageName + "." + format } })
                            done({
                                status: true,
                                message: "Imagen subida con exito"
                            })
                        } catch (error) {
                            throw error;
                        }
                    }
                })
            })
            .catch(err => { throw err })
    })
}

export function sendEmail(from: string, to: string, subject: string, message: string): void {
    const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: message
    };
    nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: config.nodemailer.user,
            pass: config.nodemailer.pass
        },
        requireTLS: true,
        tls: {
            ciphers: 'SSLv3'
        }
    })
    .sendMail(mailOptions)
    .then((info) => {
        console.log("Mensaje mandado con exito", info.messageId, info.response);
    })
    .catch(err => console.log("Error al manda correo electronico", err));
}

export function decodeToken(token: string) {
    return jwt.decode(token);
}

export function filter(key: string, value: string):any {
    return key == null || key == undefined ? {} : { [key]: value };
}

export function now(): string {
    let date = new Date();
    date = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return date.toISOString();
}

export function StringNow(): string {
    return new Date().toLocaleDateString();
}

export function LineError(): string {
    let caller_line = new Error().stack.split("\n")[2];
    let index = caller_line.indexOf("at ");
    let clean = caller_line.slice(index + 2, caller_line.length);
    let line = clean.indexOf("ts");
    return clean.slice(line, clean.length);
}

export function createToken(payload: IUsers, expires: number): string {
    let options = {};
    if (expires > 0) options = { expiresIn: expires };
    return jwt.sign({
        id: payload._id,
        email: payload.email,
        name: payload.name
    }, config.secret, options);
}

export function ltDate(date: string): string {

    let split: any = date.split('-');
    split[2] = (parseInt(split[2]) + 1).toString();
    const endplus = split.join('-');

    return endplus;
}

export function MyError(err: number, message: string): { err: number, message: string } {
    return {
        err: err,
        message: message
    }
}