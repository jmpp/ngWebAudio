jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

function ngWebAudioTest(fallback) {
  var wa;

  beforeAll(function() {
    if (fallback) {
      window.AudioContext = null;
      window.webkitAudioContext = null;
    }
  });

  beforeEach(module('ngWebAudio'));
  beforeEach(inject(function(WebAudio) {
    wa = WebAudio('base/tests/test.mp3');
  }));

  it('test mode', function() {
    if (fallback) expect(wa.audioSrc).toBeDefined();
    else if (window.AudioContext) expect(wa.audioSrc).toBeUndefined();
  });

  it('should play audio', function(done) {
    wa.play();

    wa.onPlay = function() {
      setTimeout(function() {
        expect(wa.offset()).toBeGreaterThan(0);
        expect(wa.stopped).toBe(false);
      }, 2000);
    };

    wa.onEnd = function() {
      expect(wa.offset()).toBe(0);
      expect(wa.stopped).toBe(true);

      setTimeout(function() {
        expect(wa.offset()).toBe(0);
        expect(wa.stopped).toBe(true);
        done();
      }, 500);
    };
  });


  it('should loop audio', function(done) {
    wa.options.loop = true;
    wa.play();

    wa.onPlay = function() {
      setTimeout(function() {
        expect(wa.onEnd).not.toHaveBeenCalled();
        wa.stop();
        expect(wa.onEnd).toHaveBeenCalled();
        done();
      }, 8000);
    };

    wa.onEnd = function() {};
    spyOn(wa, 'onEnd');
  });

  it('should stop audio', function(done) {
    wa.play();

    wa.onPlay = function() {
      setTimeout(function() {
        expect(wa.onEnd).not.toHaveBeenCalled();
        expect(wa.offset()).toBeGreaterThan(0);
        expect(wa.stopped).toBe(false);
        wa.stop();
        expect(wa.offset()).toBe(0);
        expect(wa.stopped).toBe(true);
      }, 1000);
    };

    wa.onEnd = function () {
      setTimeout(function() {
        done();
      }, 100);
    };

    spyOn(wa, 'onEnd').and.callThrough();
  });

  it('should pause audio', function(done) {
    wa.play();

    wa.onPlay = function() {
      var offset1, offset2;
      wa.onPlay = null;

      setTimeout(function () {
        wa.pause();
        offset1 = wa.offset();
      }, 1000);

      setTimeout(function () {
        expect(wa.offset()).toBeCloseTo(offset1, 10);
        wa.play();
      }, 2000);

      setTimeout(function () {
        wa.pause();
        offset2 = wa.offset();
      }, 3000);

      setTimeout(function () {
        expect(wa.offset()).toBeCloseTo(offset2, 10);
        expect(offset1).toBeLessThan(offset2);
        wa.play();
      }, 4000);
    };

    wa.onEnd = function() {
      setTimeout(function() {
        done();
      }, 100);
    };
  });

  it('offset should be increasing', function(done) {
    var lastOffset = 0;
    wa.play();
    expect(wa.offset()).toBe(0);

    wa.onPlay = function() {
      for (var i = 1; i < 10; i++) {
        setTimeout(function () {
          var offset;
          expect(offset = wa.offset()).toBeGreaterThan(lastOffset);
          lastOffset = offset;
        }, 100 * i);
      }
    };

    wa.onEnd = function() {
      setTimeout(function() {
        done();
      }, 100);
      done();
    };
  });
}

describe('ngWebAudio', ngWebAudioTest);
describe('ngWebAudioFallback', function() {
  ngWebAudioTest(true);
});
