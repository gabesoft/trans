var faker        = require('faker')
  , data         = null
  , addrCount    = 12
  , contactCount = 12
  , phoneCount   = 12
  , emailCount   = 12;

function rand (min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function genlist (count, gen) {
    var list = []
      , i    = 0;

    for (i = 0; i < count; i++) {
        list.push(gen());
    }

    return list;
}

function genAddress () {
    var addr = faker.Address;
    return {
        zip    : addr.zipCode()
      , city   : addr.city()
      , street : addr.streetAddress()
      , suite  : addr.secondaryAddress()
      , state  : addr.usState()
      , geo    : { lat: addr.latitude(), lng: addr.longitude() }
    };
}

function genContact () {
    var name  = faker.Name
      , phone = faker.PhoneNumber;

    return {
        first     : name.firstName()
      , last      : name.lastName()
      , phones    : genlist(phoneCount, phone.phoneNumber)
      , addresses : genlist(addrCount, genAddress)
      , emails    : genlist(emailCount, function () { return faker.Internet.email(); })
    };
}

function genCompany () {
    var co = faker.Company;
    return {
        name      : co.companyName()
      , website   : faker.Internet.domainName()
      , phrase    : co.catchPhrase()
      , tagLine   : co.bs()
      , mission   : faker.Lorem.paragraph()
      , locations : genlist(addrCount, genAddress)
      , contacts  : genlist(contactCount, genContact)
    };
}

exports.createCompanies = function (count) {
    return genlist(count, genCompany);
};
