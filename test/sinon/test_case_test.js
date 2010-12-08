/*jslint indent: 2, onevar: false*/
/*globals testCase
          sinon
          assert
          assertFalse
          assertUndefined
          assertFunction
          assertSame
          assertNotSame
          assertEquals
          assertException*/
/**
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010 Christian Johansen
 */
(function () {
  testCase("SinonTestCaseTest", {
    "should be function": function () {
      assertFunction(sinon.testCase);
    },

    "should return object": function () {
      var tests = sinon.testCase({});

      assertEquals({}, tests);
    },

    "should throw without argument": function () {
      assertException(function () {
        sinon.testCase();
      }, "TypeError");
    },

    "should throw without object": function () {
      assertException(function () {
        sinon.testCase(function () {});
      }, "TypeError");
    },

    "should only wrap functions with test prefix": sinon.test(function () {
      this.spy(sinon, "test");

      var testc = {
        testA: function () {},
        doB: function () {}
      };

      sinon.testCase(testc);

      assertFunction(testc.doB);
      assert(sinon.test.calledWith(testc.testA));
      assertFalse(sinon.test.calledWith(testc.doB));
    }),

    "should remove setUp method": function () {
      var test = { setUp: function () {} };
      var result = sinon.testCase(test);

      assertUndefined(result.setUp);
      assertUndefined(result["test setUp"]);
    },

    "should remove tearDown method": function () {
      var test = { tearDown: function () {} };
      var result = sinon.testCase(test);

      assertUndefined(result.tearDown);
      assertUndefined(result["test tearDown"]);
    },

    "should call setUp before any test": function () {
      var test = { setUp: sinon.stub(), test: sinon.stub(), test2: sinon.stub() };
      var result = sinon.testCase(test);
      result.test();
      result.test2();

      assertEquals(2, test.setUp.callCount);
      sinon.assert.called(test.test);
      sinon.assert.called(test.test2);
    },

    "should call tearDown after any test": function () {
      var test = { tearDown: sinon.stub(), test: sinon.stub(), test2: sinon.stub() };
      var result = sinon.testCase(test);
      result.test();
      result.test2();

      sinon.assert.called(test.tearDown);
      sinon.assert.called(test.test);
      sinon.assert.called(test.test2);
    },

    "should call tearDown even if test throws": function () {
      var test = { tearDown: sinon.stub(), test: sinon.stub().throws() };
      var result = sinon.testCase(test);

      assertException(function () {
        result.test();
      }, "Error");

      sinon.assert.called(test.tearDown);
      sinon.assert.called(test.test);
    },

    "should call setUp test tearDown in order": function () {
      var testCase = {
        setUp: sinon.stub(),
        test: sinon.stub(),
        tearDown: sinon.stub()
      };

      var result = sinon.testCase(testCase);

      try {
        result.test();
      } catch (e) {}

      sinon.assert.callOrder(testCase.setUp, testCase.test, testCase.tearDown);
    },

    "should call in order when test throws": function () {
      var testCase = {
        setUp: sinon.stub(),
        tearDown: sinon.stub(),
        test: sinon.stub().throws()
      };

      var result = sinon.testCase(testCase);

      try {
        result.test();
      } catch (e) {}

      sinon.assert.callOrder(testCase.setUp, testCase.test, testCase.tearDown);
    },

    "should unstub objects after test is run": function () {
      var myMeth = function () {};
      var myObj = { meth: myMeth };

      var testCase = sinon.testCase({
        testA: function () {
          this.stub(myObj, "meth");

          assertFunction(this.stub);
          assertNotSame(myMeth, myObj.meth);
        }
      });

      testCase.testA();

      assertSame(myMeth, myObj.meth);
    },

    "should unstub objects stubbed in setUp": function () {
      var myMeth = function () {};
      var myObj = { meth: myMeth };

      var testCase = sinon.testCase({
        setUp: function () {
          this.stub(myObj, "meth");
        },

        testA: function () {
          assertFunction(this.stub);
          assertNotSame(myMeth, myObj.meth);
        }
      });

      testCase.testA();

      assertSame(myMeth, myObj.meth);
    }
  });
}());
