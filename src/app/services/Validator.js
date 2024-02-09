/**
 * Validator service for checking user-input data.
 */
define([

    'models/UserModel'

], function(UserModel) {
    var emailPattern = /^.+@.+\..+$/;
    var passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/;
    var passwordLength = 8;
    //var namePattern = /^[A-Za-z][A-Za-z0-9 -]*$/;
    var namePattern = /^.*$/;
    var vatPattern = /^([A-Za-z]{2})?[0-9]{8}([0-9]{5})?$/;
    var otherVatPattern = /^[A-Za-z0-9 -]*$/;
    const norwegianPattern = /^[a-z0-9]+[a-z_\-0-9]*$/i;
    const swedenPattern = /^\d{6}\-\d{4}$/;

    return {
        /**
         * Validate email address.
         *
         * @param string input Input to validate
         * @return boolean True on valid, false on invalid
         */
        email : function(input) {
            return emailPattern.test(input);
        },
        /**
         * Validate password
         *
         * @param string input Input to validate
         * @return boolean True on valid, false on invalid
         */
        password : function(input) {
            return passwordPattern.test(input) && input.length >= passwordLength;
        },
        /**
         * Validate a minimum length.
         *
         * @param string input Input to validate
         * @param int size The string length to check against
         * @return boolean True on valid, false on invalid
         */
        minLength : function(input, size) {
            return input.length >= size;
        },
         /**
         * Validate a maximum length.
         *
         * @param string input Input to validate
         * @param int size The string length to check against
         * @return boolean True on valid, false on invalid
         */
        maxLength : function(input, size) {
            return input.length <= size;
        },
        /**
         * Validate a name (a person, company, etc)
         * Just make sure there is at least one alpha character.
         *
         * @param string input Name to validate
         * @param int length Optional length checker
         * @return boolean True on valid, false on invalid
         */
        name : function(input, length) {
            if (!length) {
                length = 1;
            }
            return namePattern.test(input);
        },
        /**
         * Validate a VAT number.
         *
         * @param string input The VAT number to validate
         * @return boolean True on valid, false on invalid
         */
        vat : function(input) {
            return vatPattern.test(input);
        },

        norwegianVat : input => norwegianPattern.test(input),

        swedenVat : input => swedenPattern.test(input),

        otherVat : function(input) {
            return otherVatPattern.test(input) && input.length <= 20;
        },
        /**
         * Validate if entered email is not the email of the user.
         *
         * @param string input The email to validate
         * @return boolean True on valid, false on invalid
         */
        isOwnEmail(input) {
            const email = UserModel.profile().email;
            return  input === email;
        }
    };
});
