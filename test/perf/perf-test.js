module.exports = function (util) {
    var trans  = util.trans
      , faker  = require('faker')
      , gen    = require('./gen')
      , assert = util.assert
      , square = util.square
      , mod    = util.mod
      , sum    = util.sum
      , add    = util.add
      , data   = null;

    function inspectGroup (group, full) {
        if (full) {
            trans(group)
               .map('.', function (g) { return { key: g.key, count: g.value.length }; })
               .inspect();
        }
        util.inspect(group.length);
    }

    beforeEach(function () {
        data = gen.createCompanies(500);
    });

    describe('group', function () {
        it('should group companies by contact state', function () {
            var t = trans(data)
                   .group('locations.state.')
                   .value();
            inspectGroup(t);
        });

        it('should group companies by contacts emails', function () {
            var t = trans(data)
                   .mapff('contacts.emails.', 'emails')
                   .flattenf('emails')
                   .group('emails.')
                   .value();
            inspectGroup(t);
        });

        it('should group companies by contacts phone numbers', function () {
            var t = trans(data)
                   .mapff('contacts.phones', 'phones')
                   .flattenf('phones')
                   .group('phones.')
                   .value();
            inspectGroup(t);
        });

        it('should group companies by contacts latitude', function () {
            var t = trans(data)
                   .mapff('contacts.addresses.geo.lat', 'lat')
                   .flattenf('lat', true)
                   .group('lat.')
                   .value();
            inspectGroup(t);
        });

        it('should group by the contacts geo locations', function () {
            var t = trans(data)
                   .mapff('contacts.addresses.geo', 'geo', '.', function (geo) {
                        return Math.floor(parseFloat(geo.lat) + parseFloat(geo.lng));
                    })
                   .flattenf('geo', true)
                   .group('geo.')
                   .value();
            inspectGroup(t);
        });
    });

    describe('map', function () {
        it('should extract contacts latitude', function () {
            var t = trans(data)
                   .map('.', 'contacts', '.', 'addresses', '.', 'geo', 'lat')
                   .flatten(true)
                   .value();
            util.inspect(t.length);
        });
    });

    describe('mapf', function () {
        it('should replace the geo field with a location field on each contact address', function () {
            var t = trans(data)
                   .mapf('contacts.addresses.geo', function (geo) { return geo.lat + ':' + geo.lng; })
                   .value();
            util.inspect(t.length);
        });
    });

    describe('mapff', function () {
        it('should create a location field on each contact', function () {
            var t = trans(data)
                   .mapff('contacts.addresses.geo', 'contacts.loc', '.', function (geo) { return geo.lat + ':' + geo.lng; })
                   .mapf('contacts.loc', ['join', ', '])
                   .pluck('contacts.loc')
                   .flatten()
                   .value();
            util.inspect(t.length);
        });

        it('should map the geo field to the sum of lat, long', function () {
            trans(data)
               .mapff('contacts.addresses.geo', 'contacts.addresses.sum', function (geo) {
                    return this.indexes + ':' + geo.lat + geo.lng;
                })
               .value();
        });

        it('should map the city field to a city slug field on every contact address', function () {
            var t = trans(data)
                   .mapff('contacts.addresses.city', 'contacts.addresses.citySlug', faker.Helpers.slugify)
                   .pluck('contacts.addresses.citySlug')
                   .flatten(true)
                   .value();
            util.inspect(t.length);
        });
    });

    describe('remove', function () {
        it('should remove items from the contacts addresses', function () {
            trans(data)
               .remove('contacts.addresses.geo.lat', 'contacts.addresses.suite')
               .value();
        });
    });

    describe('omit', function () {
        it('should remove items from the contacts addresses', function () {
            trans(data)
               .omit('contacts.addresses.geo.lat', 'contacts.addresses.suite')
               .value();
        });
    });

    describe('copy', function () {
        it('should deep copy the data object', function () {
            trans(data).copy();
        });
    });

    describe('sort', function () {
        it('should sort the companies by first location latitude', function () {
            trans(data)
               .sortf('locations', 'geo.lat')
               .firstf('locations')
               .sort('locations.geo.lat');
        });
    });

    describe('object', function () {
        it('should create an object indexed by the contact names', function () {
            var t = trans(data)
                   .pluck('contacts')
                   .flatten()
                   .object(null, null, function (c) {
                        return c.first + '-' + c.last + '-' + this.index;
                    })
                   .value();

            util.inspect(trans(t).array().value().length);
        });

        it('should create an object indexed by the contact latitude', function () {
            var t = trans(data)
                   .mapff('contacts.addresses.geo.lat', 'lat')
                   .flattenf('lat', true)
                   .object('lat.')
                   .value();
            util.inspect(trans(t).array().value().length);
        });
    });

    describe('filter', function () {
        it('should filter companies that have contacts in california', function () {
            var t = trans(data)
                   .filter('contacts.addresses.state', trans, ['flatten', true], 'value', 'join', ['match', /cali/i])
                   .value();
            util.inspect(t.length);
        });

        it('should filter companies that have websites ending in .com', function () {
            var t = trans(data)
                   .filter('website', ['match', /\.com$/i])
                   .value();
            util.inspect(t.length);
        });
    });

    describe('default', function () {
        it('should set the geo defaults', function () {
            trans(data)
               .default('contacts.addresses.geo.lat', 1, 'contacts.addresses.geo.lng', 2)
               .value();
        });
    });
};
