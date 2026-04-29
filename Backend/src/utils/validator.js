// Filename: src/utils/validator.js
const validator = require('validator');

const validate = (data)=>{
    const mandatoryFields = ['firstName', 'emailId', 'password'];
    const IsAllowed = mandatoryFields.every((k)=>Object.keys(data).includes(k));
    if(!IsAllowed){
        throw new Error("Missing mandatory fields: firstName, emailId, password");
    }
    if(!validator.isEmail(data.emailId)){
        throw new Error("Invalid email format");
    }
    if(!validator.isStrongPassword(data.password)){
        throw new Error("Password is not strong enough");
    }
}

module.exports = validate;