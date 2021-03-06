/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  Identifier = types.Identifier,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('Identifier', function () {
  it('returns an expression', function () {
    var expr = new Identifier('for');
    expect(expr).to.be.an(types._Expression);
    expect(expr.toAQL).to.be.a('function');
  });
  it('clones Identifier instances', function () {
    var src = new Identifier('for'),
      copy = new Identifier(src);
    expect(src.toAQL()).to.equal(copy.toAQL());
    expect(src).not.to.equal(copy);
  });
  it('accepts ArangoCollection instances', function () {
    function ArangoCollection(name) {
      this._name = 'lol';
    }
    ArangoCollection.prototype.name = function () {
      return this._name;
    };
    var collection = new ArangoCollection('some_collection'),
      id = new Identifier(collection);
    expect(id.toAQL()).to.equal(collection.name());
  });
  it('wraps well-formed strings', function () {
    var values = [
      '_',
      '_x',
      'all_lower_case',
      'snakeCaseAlso',
      'CamelCaseHere',
      'ALL_UPPER_CASE',
      '__cRaZy__'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(new Identifier(values[i]).toAQL()).to.equal(values[i]);
    }
  });
  it('wraps values in backticks if necessary', function () {
    var values = [
      'for',
      'RETURN',
      'totally-radical'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(new Identifier(values[i]).toAQL()).to.equal('`' + values[i] + '`');
    }
  });
  it('does not accept malformed strings', function () {
    var values = [
      '',
      '-x',
      'also bad',
      'überbad',
      'spaß'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {return new Identifier(values[i]);}).to.throwException(isAqlError);
    }
  });
  it('does not accept any other values', function () {
    var values = [
      new types.StringLiteral('for'),
      new types.RawExpression('for'),
      new types.SimpleReference('for'),
      new types.Keyword('for'),
      new types.NullLiteral(null),
      42,
      true,
      function () {},
      {},
      []
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {return new Identifier(values[i]);}).to.throwException(isAqlError);
    }
  });
});