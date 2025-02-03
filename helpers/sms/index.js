const { default: Axios } = require("axios");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");

module.exports = {
    sendSMS: async (smsText, mobileNo, template_id) => {

        const auth = {
            // project_code: process.env.PDBM_PROJECT_CODE,
            // password: process.env.PDBM_PASSWORD,
            project_code: 'VM',
            password: 'vm@9930i',
        };

        const url = "https://trails.9930i.com/Api/authentication/authenticate";
        // $this->response($url);
        let result;
        if (global.SMS_REFRESH_TOKEN) {
            const refUrl =
                "https://trails.9930i.com/Api/authentication/getAccessToken";
            const refData = {
                refreshToken: global.SMS_REFRESH_TOKEN,
            };
            result = await Axios.post(refUrl, refData)
                .then((resp) => resp.data)
                .catch((err) => {
                    console.log(err);
                    return false;
                });
            if (!result || !result.accessToken) {
                result = await Axios.post(url, auth).then((resp) => resp.data);
                global.SMS_REFRESH_TOKEN = result.refreshToken;
            }
        } else {
            result = await Axios.post(url, auth).then((resp) => resp.data).catch((err) => {
                return false;
            });;
            global.SMS_REFRESH_TOKEN = result.refreshToken;
        }

        const smsData = {
            to: mobileNo,
            message: smsText,
            template_id: template_id,
        };

        const header = {
            Authorization: result.accessToken,
        };
        console.log("Auth token : ", header);
        let smsUrl = "https://trails.9930i.com/Api/SMS/sendSMS";

        let smsResult = await Axios.post(smsUrl, smsData, {
            headers: header,
        }).then((resp) => resp.data);
        // console.log("Sms Response : ", smsResult);
        return smsResult;
    },
    sendMail: async (source, subject, text, fromName, toEmail, attachements = []) => {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_SMTP_PORT,
            transportMethod: process.env.EMAIL_PROTOCOL,
            ignoreTLS: true,
            secure: false,
            secureConnection: true,
            connectionTimeout: 10000,
            requireTLS: false,
            auth: {
                user: process.env.EMAIL || "noreply@oberonoils.in",
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        
        const template = handlebars.compile(source);
        const replacements = {};
        const htmlToSend = template(replacements);

        var mailOptions = {
            from: {
                name: fromName,
                address: process.env.EMAIL || "noreply@oberonoils.in",
            },
            to: toEmail,
            subject: subject,
            text: text,
            html: htmlToSend,
            bcc: [process.env.EMAIL_BCC],
        };

        if (attachements.length) {
            mailOptions.attachments = attachements;
        }

        // const sendMail = util.promisify(transporter.sendMail);

        let mailResult = await transporter
            .sendMail(mailOptions)
            .then((info) => info)
            .catch((err) => {
                throw err;
            });
            console.log(mailResult)
        return mailResult;
    },
};
