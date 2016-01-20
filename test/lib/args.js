import {parseArgs} from '../../src/lib/args';

describe('args', function() {
  describe('parseArgs', function() {

    it('should use an input array as-is', function() {
      expect(parseArgs(['a', 'b', 'c'])).to.deep.equal({
        options: {},
        remain: ['a', 'b', 'c'],
        errors: [],
      });
    });

    it('should not mutate the input array', function() {
      const args = ['a', 'b', 'c'];
      parseArgs(args);
      expect(args).to.deep.equal(['a', 'b', 'c']);
    });

    it('should split an input string on space', function() {
      expect(parseArgs('a b c')).to.deep.equal({
        options: {},
        remain: ['a', 'b', 'c'],
        errors: [],
      });
    });

    it('should properly handle quoted args', function() {
      // single quotes
      expect(parseArgs(`'a b c'`).remain).to.deep.equal([`a b c`]);
      expect(parseArgs(`'a' b c`).remain).to.deep.equal([`a`, `b`, `c`]);
      expect(parseArgs(`a 'b' c`).remain).to.deep.equal([`a`, `b`, `c`]);
      expect(parseArgs(`a b 'c'`).remain).to.deep.equal([`a`, `b`, `c`]);
      expect(parseArgs(`'a b c'`).remain).to.deep.equal([`a b c`]);
      expect(parseArgs(`'a b' c`).remain).to.deep.equal([`a b`, `c`]);
      expect(parseArgs(`a 'b c'`).remain).to.deep.equal([`a`, `b c`]);
      // double quotes
      expect(parseArgs(`"a b c"`).remain).to.deep.equal([`a b c`]);
      expect(parseArgs(`"a" b c`).remain).to.deep.equal([`a`, `b`, `c`]);
      expect(parseArgs(`a "b" c`).remain).to.deep.equal([`a`, `b`, `c`]);
      expect(parseArgs(`a b "c"`).remain).to.deep.equal([`a`, `b`, `c`]);
      expect(parseArgs(`"a b c"`).remain).to.deep.equal([`a b c`]);
      expect(parseArgs(`"a b" c`).remain).to.deep.equal([`a b`, `c`]);
      expect(parseArgs(`a "b c"`).remain).to.deep.equal([`a`, `b c`]);
      // nested quotes
      expect(parseArgs(`"'a b c'"`).remain).to.deep.equal([`'a b c'`]);
      expect(parseArgs(`"a 'b' c"`).remain).to.deep.equal([`a 'b' c`]);
      expect(parseArgs(`"a 'b c"`).remain).to.deep.equal([`a 'b c`]);
      expect(parseArgs(`"'a b" "'c'"`).remain).to.deep.equal([`'a b`, `'c'`]);
      expect(parseArgs(`'"a b c"'`).remain).to.deep.equal([`"a b c"`]);
      expect(parseArgs(`'a "b" c'`).remain).to.deep.equal([`a "b" c`]);
      expect(parseArgs(`'a "b c'`).remain).to.deep.equal([`a "b c`]);
      expect(parseArgs(`'"a b' '"c"'`).remain).to.deep.equal([`"a b`, `"c"`]);
    });

    it('should properly parse options', function() {
      const validProps = {foo: String, bar: Boolean, baz: Number};
      let options, remain;
      ({options, remain} = parseArgs(`a b c d foo=1 bar=1 baz=1`, validProps));
      expect(options).to.deep.equal({foo: `1`, bar: true, baz: 1});
      expect(remain).to.deep.equal([`a`, `b`, `c`, `d`]);

      ({options, remain} = parseArgs(`a foo=1 b bar=1 c baz=1 d`, validProps));
      expect(options).to.deep.equal({foo: `1`, bar: true, baz: 1});
      expect(remain).to.deep.equal([`a`, `b`, `c`, `d`]);

      ({options, remain} = parseArgs(`bar=1 a baz=1 b c foo=1 d`, validProps));
      expect(options).to.deep.equal({foo: `1`, bar: true, baz: 1});
      expect(remain).to.deep.equal([`a`, `b`, `c`, `d`]);

      ({options, remain} = parseArgs(`a b c d Foo=1 bAr=1 baZ=1`, validProps));
      expect(options).to.deep.equal({foo: `1`, bar: true, baz: 1});
      expect(remain).to.deep.equal([`a`, `b`, `c`, `d`]);

      ({options, remain} = parseArgs(`a foo="1 'b'" bar='1 c' baz="1 d" e`, validProps));
      expect(options).to.deep.equal({foo: `1 'b'`, bar: true, baz: NaN});
      expect(remain).to.deep.equal([`a`, `e`]);
    });

    it('should complain about unknown options', function() {
      const validProps = {foo: String, bar: Boolean};
      let options, errors;
      ({options, errors} = parseArgs(`a b c foo=1 bar=1 baz=1`, validProps));
      expect(options).to.deep.equal({foo: '1', bar: true});
      expect(errors).to.have.length(1);
      expect(errors[0]).to.match(/unknown.+"baz"/i);
    });

    it('should allow option abbreviation where not ambiguous', function() {
      const validProps = {foo: String, barf: Boolean, bazz: Number};
      let options, errors;
      ({options} = parseArgs(`f=1`, validProps));
      expect(options).to.deep.equal({foo: '1'});

      ({options, errors} = parseArgs(`f=1 b=1`, validProps));
      expect(options).to.deep.equal({foo: '1'});
      expect(errors).to.have.length(1);
      expect(errors[0]).to.match(/ambiguous.+"b"/i);

      ({options, errors} = parseArgs(`f=1 ba=1`, validProps));
      expect(options).to.deep.equal({foo: '1'});
      expect(errors).to.have.length(1);
      expect(errors[0]).to.match(/ambiguous.+"ba"/i);

      ({options} = parseArgs(`f=1 bar=1`, validProps));
      expect(options).to.deep.equal({foo: '1', barf: true});

      ({options} = parseArgs(`F=1 bAR=1`, validProps));
      expect(options).to.deep.equal({foo: '1', barf: true});
    });

    it('should properly handle quoted options', function() {
      const validProps = {a: String, d: String};
      expect(parseArgs(`a="b" c d='f'`, validProps).options).to.deep.equal({a: `b`, d: `f`});
      expect(parseArgs(`a="b c" d=f`, validProps).options).to.deep.equal({a: `b c`, d: `f`});
      expect(parseArgs(`a="'b' c d=f"`, validProps).options).to.deep.equal({a: `'b' c d=f`});
      expect(parseArgs(`a="'b c d=f'"`, validProps).options).to.deep.equal({a: `'b c d=f'`});
      expect(parseArgs(`a=b=c d=f`, validProps).options).to.deep.equal({a: `b=c`, d: `f`});
    });

    it('should handle crazy examples', function() {
      expect(parseArgs(`foo 'bar baz' a=123 b="x y z = 456" "can't wait"`, {aaa: Number, bbb: String}))
        .to.deep.equal({
          options: {
            aaa: 123,
            bbb: `x y z = 456`,
          },
          remain: [`foo`, `bar baz`, `can't wait`],
          errors: [],
        });
    });
  });
});
