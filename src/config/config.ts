const config = {
    MONGODB_URI:process.env.MONGODB_URI,
    secret:process.env.SECRET_KEY,
    Bcrypt_rounds:process.env.Bcrypt_rounds,
    nodemailer:{
        user:process.env.mail_user,
        pass:process.env.mail_password
    },
    appName:process.env.appName,
    port:process.env.PORT
}

export default config;