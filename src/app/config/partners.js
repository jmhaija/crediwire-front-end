/**
 * We are using marked formatter text;
 * The main syntax:
 * for link: [www.google.com](https://www.google.com)
 * for italic: *italic font-style string*
 * for bold: **bold string** or __bold string__
*/

define({

    /**
     * Partner models used for testing
     */
    
    testing: {
        sparkron: {
            "id": "",
            "code": "sparkron",
            "name": "Sparekassen Kronjylland",
            "lang": "da-DK",
            "logo": "/assets/img/partners/sparkron.png",
            "logoWidth": "300",
            "support": true,
            "connectString": "Jeg accepterer at dele min data med Sparekassen Kronjylland",
            "connectRequired": true,
            "confirmation": {
                "en-US": "By connecting your company you accept sharing your company's data with :company. You consent to :company storing and processing your company's data for the purpose of supporting and improve customer dialog, identify possible financial needs and/or continuously provide credit scoring.",
                "da-DK": "Ved at forbinde din virksomhed accepterer du at dele virksomhedens data med :company. Du giver tilladelse til at :company opbevarer og behandler virksomhedens data med det formål at understøtte og forbedre kundedialogen, identificere eventuelle finansielle behov og/eller løbende at foretage kreditbehandling.",
                "de-DE": "Wenn Sie Ihr Unternehmen verbinden, akzeptieren Sie, dass Ihre Daten mit :company geteilt werden. Sie stimmen zu, dass :company die Daten Ihres Unternehmens speichert und verarbeitet, um den Kundendialog zu unterstützen und zu verbessern, mögliche finanzielle Bedürfnisse zu identifizieren und/oder dauerhaft Kreditbewertungen bereitzustellen."
            },
            "color": "#d21925"
        },

        sydbank: {
            "id": "",
            "code": "sydbank",
            "name": "Sydbank",
            "lang": "da-DK",
            "logo": "/assets/img/partners/sydbank.png",
            "logoWidth": "210",
            "support": true,
            "connectString": "Jeg accepterer at dele min data med Sydbank",
            "connectRequired": true,
            "confirmation": {
                "en-US": "By connecting your company you accept sharing your company's data with :company. You consent to :company storing and processing your company's data for the purpose of supporting and improve customer dialog, identify possible financial needs and/or continuously provide credit scoring.",
                "da-DK": "Ved at forbinde din virksomhed accepterer du at dele virksomhedens data med :company. Du giver tilladelse til at :company opbevarer og behandler virksomhedens data med det formål at understøtte og forbedre kundedialogen, identificere eventuelle finansielle behov og/eller løbende at foretage kreditbehandling.",
                "de-DE": "Wenn Sie Ihr Unternehmen verbinden, akzeptieren Sie, dass Ihre Daten mit :company geteilt werden. Sie stimmen zu, dass :company die Daten Ihres Unternehmens speichert und verarbeitet, um den Kundendialog zu unterstützen und zu verbessern, mögliche finanzielle Bedürfnisse zu identifizieren und/oder dauerhaft Kreditbewertungen bereitzustellen."
            },
            "color": "#017ac9"
        },

        jyske: {
            "id": "",
            "code": "jyske-bank",
            "name": "Jyske Bank",
            "lang": "da-DK",
            "logo": "/assets/img/partners/jyske.png",
            "logoWidth": "350",
            "support": true,
            "connectString": "Jeg accepterer at dele min data med Jyske Bank",
            "connectRequired": true,
            "confirmation": {
                "en-US": "By connecting your company you accept sharing your company's data with :company. You consent to :company storing and processing your company's data for the purpose of supporting and improve customer dialog, identify possible financial needs and/or continuously provide credit scoring.",
                "da-DK": "Ved at forbinde din virksomhed accepterer du at dele virksomhedens data med :company. Du giver tilladelse til at :company opbevarer og behandler virksomhedens data med det formål at understøtte og forbedre kundedialogen, identificere eventuelle finansielle behov og/eller løbende at foretage kreditbehandling.",
                "de-DE": "Wenn Sie Ihr Unternehmen verbinden, akzeptieren Sie, dass Ihre Daten mit :company geteilt werden. Sie stimmen zu, dass :company die Daten Ihres Unternehmens speichert und verarbeitet, um den Kundendialog zu unterstützen und zu verbessern, mögliche finanzielle Bedürfnisse zu identifizieren und/oder dauerhaft Kreditbewertungen bereitzustellen."
            },
            "color": "#005c3c"
        },

        nordea: {
            "id": "",
            "code": "nordea",
            "name": "Nordea",
            "lang": "da-DK",
            "logo": "/assets/img/partners/nordea.png",
            "support": true,
            "connectString": "Opret automatisk forbindelse til bank",
            "connectRequired": true,
            "confirmation": {
                "en-US": "By connecting your company you accept sharing your company's data with :company. You consent to :company storing and processing your company's data for the purpose of supporting and improve customer dialog, identify possible financial needs and/or continuously provide credit scoring.",
                "da-DK": "Ved at forbinde din virksomhed accepterer du at dele virksomhedens data med :company. Du giver tilladelse til at :company opbevarer og behandler virksomhedens data med det formål at understøtte og forbedre kundedialogen, identificere eventuelle finansielle behov og/eller løbende at foretage kreditbehandling.",
                "de-DE": "Wenn Sie Ihr Unternehmen verbinden, akzeptieren Sie, dass Ihre Daten mit :company geteilt werden. Sie stimmen zu, dass :company die Daten Ihres Unternehmens speichert und verarbeitet, um den Kundendialog zu unterstützen und zu verbessern, mögliche finanzielle Bedürfnisse zu identifizieren und/oder dauerhaft Kreditbewertungen bereitzustellen."
            },
            "color": "#0000A0"
        },

        augusta: {
            "id": "",
            "code": "augusta",
            "name": null,
            "lang": "da-DK",
            "logo": "/assets/img/partners/augusta.jpg",
            "support": false,
            "connectString": "Opret automatisk forbindelse",
            "connectRequired": true,
            "confirmation": {
                "en-US": null,
                "da-DK": null,
                "de-DE": null
            },
            "color": "#29ABC5"
        },

        hvb: {
            "id": "",
            "code": "hvb",
            "name": "HypoVereinsbank",
            "lang": "de-DE",
            "logo": "/assets/img/partners/hvb.svg",
            "support": true,
            "connectString": "Schließen Sie an Bank automatisch an",
            "connectRequired": true,
            "description": "CrediWire wurde entwickelt, um Ihnen dabei zu helfen, die Management-Buchhaltung zu vereinfachen. CrediWire zeigt Ihnen einfache Illustrationen und bietet Ihnen Werkzeuge, mit denen Sie schneller auf die finanzielle Entwicklung in Ihrem Unternehmen reagieren können. Lesen Sie mehr über CrediWire [link=https://crediwire.de]hier[/link].",
            "confirmation": {
                "en-US": "By connecting your company you accept sharing your company's data with :company. You consent to :company storing and processing your company's data for the purpose of supporting and improve customer dialog, identify possible financial needs and/or continuously provide credit scoring.",
                "da-DK": "Ved at forbinde din virksomhed accepterer du at dele virksomhedens data med :company. Du giver tilladelse til at :company opbevarer og behandler virksomhedens data med det formål at understøtte og forbedre kundedialogen, identificere eventuelle finansielle behov og/eller løbende at foretage kreditbehandling.",
                "de-DE": "Wenn Sie Ihr Unternehmen verbinden, akzeptieren Sie, dass Ihre Daten mit :company geteilt werden. Sie stimmen zu, dass :company die Daten Ihres Unternehmens speichert und verarbeitet, um den Kundendialog zu unterstützen und zu verbessern, mögliche finanzielle Bedürfnisse zu identifizieren und/oder dauerhaft Kreditbewertungen bereitzustellen."
            }
        },

        bank: {
            "id": "",
            "code": "bank",
            "name": "Bank",
            "lang": "da-DK",
            "logo": "/assets/img/partners/bank.png",
            "support": true,
            "connectString": "Opret automatisk forbindelse til bank",
            "connectRequired": true,
            "confirmation": {
                "en-US": "By connecting your company you accept sharing your company's data with :company. You consent to :company storing and processing your company's data for the purpose of supporting and improve customer dialog, identify possible financial needs and/or continuously provide credit scoring.",
                "da-DK": "Ved at forbinde din virksomhed accepterer du at dele virksomhedens data med :company. Du giver tilladelse til at :company opbevarer og behandler virksomhedens data med det formål at understøtte og forbedre kundedialogen, identificere eventuelle finansielle behov og/eller løbende at foretage kreditbehandling.",
                "de-DE": "Wenn Sie Ihr Unternehmen verbinden, akzeptieren Sie, dass Ihre Daten mit :company geteilt werden. Sie stimmen zu, dass :company die Daten Ihres Unternehmens speichert und verarbeitet, um den Kundendialog zu unterstützen und zu verbessern, mögliche finanzielle Bedürfnisse zu identifizieren und/oder dauerhaft Kreditbewertungen bereitzustellen."
            }
        },

        spks: {
            "id": "",
            "code": "spks",
            "name": "Sparekassen Sjælland-Fyn",
            "lang": "da-DK",
            "logo": "/assets/img/partners/spks.png",
            "support": true,
            "connectString": "Opret automatisk forbindelse til bank",
            "connectRequired": true,
            "confirmation": {
                "en-US": "By connecting your company you accept sharing your company's data with :company. You consent to :company storing and processing your company's data for the purpose of supporting and improve customer dialog, identify possible financial needs and/or continuously provide credit scoring.",
                "da-DK": "Ved at forbinde din virksomhed accepterer du at dele virksomhedens data med :company. Du giver tilladelse til at :company opbevarer og behandler virksomhedens data med det formål at understøtte og forbedre kundedialogen, identificere eventuelle finansielle behov og/eller løbende at foretage kreditbehandling.",
                "de-DE": "Wenn Sie Ihr Unternehmen verbinden, akzeptieren Sie, dass Ihre Daten mit :company geteilt werden. Sie stimmen zu, dass :company die Daten Ihres Unternehmens speichert und verarbeitet, um den Kundendialog zu unterstützen und zu verbessern, mögliche finanzielle Bedürfnisse zu identifizieren und/oder dauerhaft Kreditbewertungen bereitzustellen."
            },
            "color": "#3EA339"
        },

        vaekstfonden: {
            "id": "",
            "code": "vaekstfonden",
            "name": "Vækstfonden",
            "lang": "da-DK",
            "logo": "/assets/img/partners/vaekstfonden.gif",
            "support": true,
            "connectString": " Opret automatisk forbindelse",
            "connectRequired": true,
            "confirmation": {
                "en-US": "By connecting your company you accept sharing your company's data with :company. You consent to :company storing and processing your company's data for the purpose of supporting and improve customer dialog, identify possible financial needs and/or continuously provide credit scoring.",
                "da-DK": "Ved at forbinde din virksomhed accepterer du at dele virksomhedens data med :company. Du giver tilladelse til at :company opbevarer og behandler virksomhedens data med det formål at understøtte og forbedre kundedialogen, identificere eventuelle finansielle behov og/eller løbende at foretage kreditbehandling.",
                "de-DE": "Wenn Sie Ihr Unternehmen verbinden, akzeptieren Sie, dass Ihre Daten mit :company geteilt werden. Sie stimmen zu, dass :company die Daten Ihres Unternehmens speichert und verarbeitet, um den Kundendialog zu unterstützen und zu verbessern, mögliche finanzielle Bedürfnisse zu identifizieren und/oder dauerhaft Kreditbewertungen bereitzustellen."
            }
        },

        albank: {
            "id": "",
            "code": "al-bank",
            "name": "Arbejdernes Landsbank",
            "lang": "da-DK",
            "logo": "/assets/img/partners/arbland.jpg",
            "logoWidth": "385",
            "support": true,
            "connectString": " Opret automatisk forbindelse til Arbejdernes Landsbank",
            "connectRequired": true,
            "confirmation": {
                "en-US": "By connecting your company you accept sharing your company's data with :company. You consent to :company storing and processing your company's data for the purpose of supporting and improve customer dialog, identify possible financial needs and/or continuously provide credit scoring.",
                "da-DK": "Ved at forbinde din virksomhed accepterer du at dele virksomhedens data med :company. Du giver tilladelse til at :company opbevarer og behandler virksomhedens data med det formål at understøtte og forbedre kundedialogen, identificere eventuelle finansielle behov og/eller løbende at foretage kreditbehandling.",
                "de-DE": "Wenn Sie Ihr Unternehmen verbinden, akzeptieren Sie, dass Ihre Daten mit :company geteilt werden. Sie stimmen zu, dass :company die Daten Ihres Unternehmens speichert und verarbeitet, um den Kundendialog zu unterstützen und zu verbessern, mögliche finanzielle Bedürfnisse zu identifizieren und/oder dauerhaft Kreditbewertungen bereitzustellen."
            },
            "color": "#AF1E2D"
        },

        fsr: {
           "code": "fsr",
           "name": "FSR - danske revisorer",
           "lang": "da-DK",
           "logo": "/assets/img/partners/fsr.png",
           "color": "#14143C"
         },

        ikano: {
            "id": "",
            "code": "ikano",
            "name": "Ikano Bank",
            "lang": "da-DK",
            "logo": "/assets/img/partners/ikano.png",
            "support": true,
            "connectString": "Opret automatisk forbindelse til Ikano Bank",
            "connectRequired": true,
            "confirmation": {
                "en-US": "Jeg giver hermed samtykke til at dele regnskabsoplysninger fra omhandlede virksomheds økonomisystem med Ikano Bank til brug for nærværende ansøgning. Endvidere giver jeg samtykke til, at Ikano Bank må behandle og opbevare regnskabsoplysningerne med det formål at foretage kreditbehandling og identificering af virksomhedens eventuelle finansielle behov. Jeg er bekendt med, at samtykket til enhver tid kan trækkes tilbage. <p><em>Alle personoplysninger videregivet til Ikano Bank behandles i henhold til Ikano Banks persondatapolitik, der er tilgængelig på Ikano Banks hjemmeside <a href='https://www.ikanobank.dk' target='_blank'>www.ikanobank.dk</a></em></p>",
                "da-DK": "Jeg giver hermed samtykke til at dele regnskabsoplysninger fra omhandlede virksomheds økonomisystem med Ikano Bank til brug for nærværende ansøgning. Endvidere giver jeg samtykke til, at Ikano Bank må behandle og opbevare regnskabsoplysningerne med det formål at foretage kreditbehandling og identificering af virksomhedens eventuelle finansielle behov. Jeg er bekendt med, at samtykket til enhver tid kan trækkes tilbage. <p><em>Alle personoplysninger videregivet til Ikano Bank behandles i henhold til Ikano Banks persondatapolitik, der er tilgængelig på Ikano Banks hjemmeside <a href='https://www.ikanobank.dk' target='_blank'>www.ikanobank.dk</a></em></p>",
                "de-DE": "Jeg giver hermed samtykke til at dele regnskabsoplysninger fra omhandlede virksomheds økonomisystem med Ikano Bank til brug for nærværende ansøgning. Endvidere giver jeg samtykke til, at Ikano Bank må behandle og opbevare regnskabsoplysningerne med det formål at foretage kreditbehandling og identificering af virksomhedens eventuelle finansielle behov. Jeg er bekendt med, at samtykket til enhver tid kan trækkes tilbage. <p><em>Alle personoplysninger videregivet til Ikano Bank behandles i henhold til Ikano Banks persondatapolitik, der er tilgængelig på Ikano Banks hjemmeside <a href='https://www.ikanobank.dk' target='_blank'>www.ikanobank.dk</a></em></p>"
            },
            "color": "#e10713"
        }

    },

    /**
     * Partner models used for production
     */
    production: {

        sparkron: {
            "id": "",
            "code": "sparkron",
            "name": "Sparekassen Kronjylland",
            "lang": "da-DK",
            "logo": "/assets/img/partners/sparkron.png",
            "logoWidth": "300",
            "support": true,
            "connectString": "Jeg accepterer at dele min data med Sparekassen Kronjylland",
            "connectRequired": true,
            "confirmation": {
                "en-US": "By connecting your company you accept sharing your company's data with :company. You consent to :company storing and processing your company's data for the purpose of supporting and improve customer dialog, identify possible financial needs and/or continuously provide credit scoring.",
                "da-DK": "Ved at forbinde din virksomhed accepterer du at dele virksomhedens data med :company. Du giver tilladelse til at :company opbevarer og behandler virksomhedens data med det formål at understøtte og forbedre kundedialogen, identificere eventuelle finansielle behov og/eller løbende at foretage kreditbehandling.",
                "de-DE": "Wenn Sie Ihr Unternehmen verbinden, akzeptieren Sie, dass Ihre Daten mit :company geteilt werden. Sie stimmen zu, dass :company die Daten Ihres Unternehmens speichert und verarbeitet, um den Kundendialog zu unterstützen und zu verbessern, mögliche finanzielle Bedürfnisse zu identifizieren und/oder dauerhaft Kreditbewertungen bereitzustellen."
            },
            "color": "#d21925"
        },

        sydbank: {
            "id": "",
            "code": "sydbank",
            "name": "Sydbank",
            "lang": "da-DK",
            "logo": "/assets/img/partners/sydbank.png",
            "logoWidth": "210",
            "support": true,
            "connectString": "Jeg accepterer at dele min data med Sydbank",
            "connectRequired": true,
            "confirmation": {
                "en-US": "By connecting your company you accept sharing your company's data with :company. You consent to :company storing and processing your company's data for the purpose of supporting and improve customer dialog, identify possible financial needs and/or continuously provide credit scoring.",
                "da-DK": "Ved at forbinde din virksomhed accepterer du at dele virksomhedens data med :company. Du giver tilladelse til at :company opbevarer og behandler virksomhedens data med det formål at understøtte og forbedre kundedialogen, identificere eventuelle finansielle behov og/eller løbende at foretage kreditbehandling.",
                "de-DE": "Wenn Sie Ihr Unternehmen verbinden, akzeptieren Sie, dass Ihre Daten mit :company geteilt werden. Sie stimmen zu, dass :company die Daten Ihres Unternehmens speichert und verarbeitet, um den Kundendialog zu unterstützen und zu verbessern, mögliche finanzielle Bedürfnisse zu identifizieren und/oder dauerhaft Kreditbewertungen bereitzustellen."
            },
            "color": "#017ac9"
        },

        jyske: {
            "id": "",
            "code": "jyske-bank",
            "name": "Jyske Bank",
            "lang": "da-DK",
            "logo": "/assets/img/partners/jyske.png",
            "logoWidth": "350",
            "support": true,
            "connectString": "Jeg accepterer at dele min data med Jyske Bank",
            "connectRequired": true,
            "confirmation": {
                "en-US": "By connecting your company you accept sharing your company's data with :company. You consent to :company storing and processing your company's data for the purpose of supporting and improve customer dialog, identify possible financial needs and/or continuously provide credit scoring.",
                "da-DK": "Ved at forbinde din virksomhed accepterer du at dele virksomhedens data med :company. Du giver tilladelse til at :company opbevarer og behandler virksomhedens data med det formål at understøtte og forbedre kundedialogen, identificere eventuelle finansielle behov og/eller løbende at foretage kreditbehandling.",
                "de-DE": "Wenn Sie Ihr Unternehmen verbinden, akzeptieren Sie, dass Ihre Daten mit :company geteilt werden. Sie stimmen zu, dass :company die Daten Ihres Unternehmens speichert und verarbeitet, um den Kundendialog zu unterstützen und zu verbessern, mögliche finanzielle Bedürfnisse zu identifizieren und/oder dauerhaft Kreditbewertungen bereitzustellen."
            },
            "color": "#005c3c"
        },

        nordea: {
            "id": "",
            "code": "nordea",
            "name": "Nordea",
            "lang": "da-DK",
            "logo": "/assets/img/partners/nordea.png",
            "support": true,
            "connectString": "Opret automatisk forbindelse til bank",
            "connectRequired": true,
            "confirmation": {
                "en-US": "By connecting your company you accept sharing your company's data with :company. You consent to :company storing and processing your company's data for the purpose of supporting and improve customer dialog, identify possible financial needs and/or continuously provide credit scoring.",
                "da-DK": "Ved at forbinde din virksomhed accepterer du at dele virksomhedens data med :company. Du giver tilladelse til at :company opbevarer og behandler virksomhedens data med det formål at understøtte og forbedre kundedialogen, identificere eventuelle finansielle behov og/eller løbende at foretage kreditbehandling.",
                "de-DE": "Wenn Sie Ihr Unternehmen verbinden, akzeptieren Sie, dass Ihre Daten mit :company geteilt werden. Sie stimmen zu, dass :company die Daten Ihres Unternehmens speichert und verarbeitet, um den Kundendialog zu unterstützen und zu verbessern, mögliche finanzielle Bedürfnisse zu identifizieren und/oder dauerhaft Kreditbewertungen bereitzustellen."
            },
            "color": "#0000A0"
        },

        augusta: {
            "id": "",
            "code": "augusta",
            "name": null,
            "lang": "da-DK",
            "logo": "/assets/img/partners/augusta.jpg",
            "support": false,
            "connectString": "Opret automatisk forbindelse",
            "connectRequired": true,
            "confirmation": {
                "en-US": null,
                "da-DK": null,
                "de-DE": null
            },
            "color": "#29ABC5"
        },

        hvb: {
            "id": "",
            "code": "hvb",
            "name": "HypoVereinsbank",
            "lang": "de-DE",
            "logo": "/assets/img/partners/hvb.svg",
            "support": true,
            "connectString": "Schließen Sie an Bank automatisch an",
            "connectRequired": true,
            "description": "CrediWire wurde entwickelt, um Ihnen dabei zu helfen, die Management-Buchhaltung zu vereinfachen. CrediWire zeigt Ihnen einfache Illustrationen und bietet Ihnen Werkzeuge, mit denen Sie schneller auf die finanzielle Entwicklung in Ihrem Unternehmen reagieren können. Lesen Sie mehr über CrediWire [link=https://crediwire.de]hier[/link].",
            "confirmation": {
                "en-US": "By connecting your company you accept sharing your company's data with :company. You consent to :company storing and processing your company's data for the purpose of supporting and improve customer dialog, identify possible financial needs and/or continuously provide credit scoring.",
                "da-DK": "Ved at forbinde din virksomhed accepterer du at dele virksomhedens data med :company. Du giver tilladelse til at :company opbevarer og behandler virksomhedens data med det formål at understøtte og forbedre kundedialogen, identificere eventuelle finansielle behov og/eller løbende at foretage kreditbehandling.",
                "de-DE": "Wenn Sie Ihr Unternehmen verbinden, akzeptieren Sie, dass Ihre Daten mit :company geteilt werden. Sie stimmen zu, dass :company die Daten Ihres Unternehmens speichert und verarbeitet, um den Kundendialog zu unterstützen und zu verbessern, mögliche finanzielle Bedürfnisse zu identifizieren und/oder dauerhaft Kreditbewertungen bereitzustellen."
            }
        },

        bank: {
            "id": "",
            "code": "bank",
            "name": "Bank",
            "lang": "da-DK",
            "logo": "/assets/img/partners/bank.png",
            "support": true,
            "connectString": "Opret automatisk forbindelse til bank",
            "connectRequired": true,
            "confirmation": {
                "en-US": "By connecting your company you accept sharing your company's data with :company. You consent to :company storing and processing your company's data for the purpose of supporting and improve customer dialog, identify possible financial needs and/or continuously provide credit scoring.",
                "da-DK": "Ved at forbinde din virksomhed accepterer du at dele virksomhedens data med :company. Du giver tilladelse til at :company opbevarer og behandler virksomhedens data med det formål at understøtte og forbedre kundedialogen, identificere eventuelle finansielle behov og/eller løbende at foretage kreditbehandling.",
                "de-DE": "Wenn Sie Ihr Unternehmen verbinden, akzeptieren Sie, dass Ihre Daten mit :company geteilt werden. Sie stimmen zu, dass :company die Daten Ihres Unternehmens speichert und verarbeitet, um den Kundendialog zu unterstützen und zu verbessern, mögliche finanzielle Bedürfnisse zu identifizieren und/oder dauerhaft Kreditbewertungen bereitzustellen."
            }
        },

        spks: {
            "id": "",
            "code": "spks",
            "name": "Sparekassen Sjælland-Fyn",
            "lang": "da-DK",
            "logo": "/assets/img/partners/spks.png",
            "support": true,
            "connectString": "Opret automatisk forbindelse til bank",
            "connectRequired": true,
            "confirmation": {
                "en-US": "By connecting your company you accept sharing your company's data with :company. You consent to :company storing and processing your company's data for the purpose of supporting and improve customer dialog, identify possible financial needs and/or continuously provide credit scoring.",
                "da-DK": "Ved at forbinde din virksomhed accepterer du at dele virksomhedens data med :company. Du giver tilladelse til at :company opbevarer og behandler virksomhedens data med det formål at understøtte og forbedre kundedialogen, identificere eventuelle finansielle behov og/eller løbende at foretage kreditbehandling.",
                "de-DE": "Wenn Sie Ihr Unternehmen verbinden, akzeptieren Sie, dass Ihre Daten mit :company geteilt werden. Sie stimmen zu, dass :company die Daten Ihres Unternehmens speichert und verarbeitet, um den Kundendialog zu unterstützen und zu verbessern, mögliche finanzielle Bedürfnisse zu identifizieren und/oder dauerhaft Kreditbewertungen bereitzustellen."
            },
            "color": "#3EA339"
        },

        vaekstfonden: {
            "id": "",
            "code": "vaekstfonden",
            "name": "Vækstfonden",
            "lang": "da-DK",
            "logo": "/assets/img/partners/vaekstfonden.gif",
            "support": true,
            "connectString": " Opret automatisk forbindelse",
            "connectRequired": true,
            "confirmation": {
                "en-US": "By connecting your company you accept sharing your company's data with :company. You consent to :company storing and processing your company's data for the purpose of supporting and improve customer dialog, identify possible financial needs and/or continuously provide credit scoring.",
                "da-DK": "Ved at forbinde din virksomhed accepterer du at dele virksomhedens data med :company. Du giver tilladelse til at :company opbevarer og behandler virksomhedens data med det formål at understøtte og forbedre kundedialogen, identificere eventuelle finansielle behov og/eller løbende at foretage kreditbehandling.",
                "de-DE": "Wenn Sie Ihr Unternehmen verbinden, akzeptieren Sie, dass Ihre Daten mit :company geteilt werden. Sie stimmen zu, dass :company die Daten Ihres Unternehmens speichert und verarbeitet, um den Kundendialog zu unterstützen und zu verbessern, mögliche finanzielle Bedürfnisse zu identifizieren und/oder dauerhaft Kreditbewertungen bereitzustellen."
            }
        },

        albank: {
            "id": "",
            "code": "al-bank",
            "name": "Arbejdernes Landsbank",
            "lang": "da-DK",
            "logo": "/assets/img/partners/arbland.jpg",
            "logoWidth": "385",
            "support": true,
            "connectString": " Opret automatisk forbindelse til Arbejdernes Landsbank",
            "connectRequired": true,
            "confirmation": {
                "en-US": "By connecting your company you accept sharing your company's data with :company. You consent to :company storing and processing your company's data for the purpose of supporting and improve customer dialog, identify possible financial needs and/or continuously provide credit scoring.",
                "da-DK": "Ved at forbinde din virksomhed accepterer du at dele virksomhedens data med :company. Du giver tilladelse til at :company opbevarer og behandler virksomhedens data med det formål at understøtte og forbedre kundedialogen, identificere eventuelle finansielle behov og/eller løbende at foretage kreditbehandling.",
                "de-DE": "Wenn Sie Ihr Unternehmen verbinden, akzeptieren Sie, dass Ihre Daten mit :company geteilt werden. Sie stimmen zu, dass :company die Daten Ihres Unternehmens speichert und verarbeitet, um den Kundendialog zu unterstützen und zu verbessern, mögliche finanzielle Bedürfnisse zu identifizieren und/oder dauerhaft Kreditbewertungen bereitzustellen."
            },
            "color": "#AF1E2D"
        },

        fsr: {
           "code": "fsr",
           "name": "FSR - danske revisorer",
           "lang": "da-DK",
           "logo": "/assets/img/partners/fsr.png",
           "color": "#14143C"
         },

        ikano: {
            "id": "",
            "code": "ikano",
            "name": "Ikano Bank",
            "lang": "da-DK",
            "logo": "/assets/img/partners/ikano.png",
            "support": true,
            "connectString": "Opret automatisk forbindelse til Ikano Bank",
            "connectRequired": true,
            "confirmation": {
                "en-US": "Jeg giver hermed samtykke til at dele regnskabsoplysninger fra omhandlede virksomheds økonomisystem med Ikano Bank til brug for nærværende ansøgning. Endvidere giver jeg samtykke til, at Ikano Bank må behandle og opbevare regnskabsoplysningerne med det formål at foretage kreditbehandling og identificering af virksomhedens eventuelle finansielle behov. Jeg er bekendt med, at samtykket til enhver tid kan trækkes tilbage. <p><em>Alle personoplysninger videregivet til Ikano Bank behandles i henhold til Ikano Banks persondatapolitik, der er tilgængelig på Ikano Banks hjemmeside <a href='https://www.ikanobank.dk' target='_blank'>www.ikanobank.dk</a></em></p>",
                "da-DK": "Jeg giver hermed samtykke til at dele regnskabsoplysninger fra omhandlede virksomheds økonomisystem med Ikano Bank til brug for nærværende ansøgning. Endvidere giver jeg samtykke til, at Ikano Bank må behandle og opbevare regnskabsoplysningerne med det formål at foretage kreditbehandling og identificering af virksomhedens eventuelle finansielle behov. Jeg er bekendt med, at samtykket til enhver tid kan trækkes tilbage. <p><em>Alle personoplysninger videregivet til Ikano Bank behandles i henhold til Ikano Banks persondatapolitik, der er tilgængelig på Ikano Banks hjemmeside <a href='https://www.ikanobank.dk' target='_blank'>www.ikanobank.dk</a></em></p>",
                "de-DE": "Jeg giver hermed samtykke til at dele regnskabsoplysninger fra omhandlede virksomheds økonomisystem med Ikano Bank til brug for nærværende ansøgning. Endvidere giver jeg samtykke til, at Ikano Bank må behandle og opbevare regnskabsoplysningerne med det formål at foretage kreditbehandling og identificering af virksomhedens eventuelle finansielle behov. Jeg er bekendt med, at samtykket til enhver tid kan trækkes tilbage. <p><em>Alle personoplysninger videregivet til Ikano Bank behandles i henhold til Ikano Banks persondatapolitik, der er tilgængelig på Ikano Banks hjemmeside <a href='https://www.ikanobank.dk' target='_blank'>www.ikanobank.dk</a></em></p>"
            },
            "color": "#e10713"
        }
    }

});
