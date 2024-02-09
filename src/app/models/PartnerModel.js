/**
 * Model representing a partner of CrediWire's.
 * Essentially this serves as a getter/setter/forgetter for a JSON object.
 */
define(function() {
    var partnerModel = false;
    
    return {
        /**
         * Return current partner
         * 
         * @return object JSON representation of partner model.
         */
        getPartner : function() {
            return partnerModel;
        },
        
        /**
         * Set partner
         *
         * @param object partner JSON representation of partner model.
         */
        setPartner : function(partner) {
            partnerModel = partner;
        },
        
        /**
         * Forget partner
         */
        forgetPartner : function() {
            partnerModel = false;
        }
    };
});
